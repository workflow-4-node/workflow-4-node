var WorkflowRegistry = require("./workflowRegistry");
var _ = require("lodash");
var Activity = require("../activities/activity");
var Workflow = require("../activities/workflow");
var WorkflowPersistence = require("./workflowPersistence");
var WorkflowInstance = require("./workflowInstance");
var InstanceIdParser = require("./instanceIdParser");
var enums = require("../common/enums");
var Promise = require("bluebird");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;
var yield  = asyncHelpers.yield ;
var KnownInstaStore = require("./knownInstaStore");
var specStrings = require("../common/specStrings");
var errors = require("../common/errors");
var Serializer = require("backpack-node").system.Serializer;

function WorkflowHost(options)
{
    this._registry = new WorkflowRegistry();
    this._trackers = [];
    this._isInitialized = false;
    this._instanceIdParser = new InstanceIdParser();
    this._persistence = null;
    this._options = _.extend(
        {
            enterLockTimeout: 10000,
            lockRenewalTimeout: 5000,
            alwaysLoadState: false,
            persistence: null,
            serializer: null
        },
        options);

    if (this._options.persistence !== null) this._persistence = new WorkflowPersistence(this._options.persistence);
    this._knownRunningInstances = new KnownInstaStore(this._persistence === null);
    if (!this._options.serializer) this._options.serializer = new Serializer();
}

Object.defineProperties(
    WorkflowHost.prototype, {
        options: {
            get: function ()
            {
                return this._options;
            }
        },

        isInitialized: {
            get: function ()
            {
                return this._isInitialized;
            }
        },

        instanceIdParser: {
            get: function ()
            {
                return this._instanceIdParser;
            }
        }
    });

WorkflowHost.prototype.registerWorkflow = function (workflow)
{
    this._registry.register(workflow);
}

WorkflowHost.prototype.registerActivity = function (activity, name, version)
{
    if (!(activity instanceof Activity)) throw new TypeError("Activity argument expected.");
    var wf = new Workflow();
    wf.name = name;
    wf.version = version;
    wf.args = [ activity ];
    this._registry.register(wf);
}

WorkflowHost.prototype._initialize = function ()
{
    if (!this._isInitialized)
    {
        // Do init here ...
        this._isInitialized = true;
    }
}

WorkflowHost.prototype.invokeMethod = Promise.coroutine(
    function* (workflowName, methodName, args)
    {
        if (!_(workflowName).isString()) throw new TypeError("Argument 'workflowName' is not a string.");
        workflowName = workflowName.trim();
        if (!_(methodName).isString()) throw new TypeError("Argument 'methodName' is not a string.");
        methodName = methodName.trim();

        if (args !== undefined && !_.isArray(args)) args = [ args ];

        var self = this;

        self._initialize();

        var paths = yield (self._getRunningInstanceIdPaths(workflowName, methodName));

        var instanceId;
        if (paths)
        {
            for (var i = 0; i < paths.length; i++)
            {
                var path = paths[i];
                var tryId = self._instanceIdParser.parse(path, args);
                if (tryId !== undefined && (yield (self._checkIfInstanceRunning(workflowName, tryId))))
                {
                    instanceId = tryId;
                    break;
                }
            }
        }
        if (instanceId !== undefined)
        {
            return yield (self._invokeMethodOnRunningInstance(instanceId, workflowName, methodName, args));
        }
        else
        {
            return yield (self._createInstanceAndInvokeMethod(workflowName, methodName, args));
        }
    });

WorkflowHost.prototype._createInstanceAndInvokeMethod = Promise.coroutine(
    function* (workflowName, methodName, args)
    {
        var self = this;

        var wfDesc = self._registry.getDesc(workflowName);
        if (!wfDesc.createInstanceMethods[methodName]) throw Error("Workflow '" + workflowName + "' cannot be created by invoking method '" + methodName + "'.");

        var createInsta = Promise.coroutine(
            function* (lockInfo)
            {
                var insta = new WorkflowInstance(self);
                var result = yield (insta.create(wfDesc.workflow, methodName, args, lockInfo));
                if (insta.execState === enums.ActivityStates.idle)
                {
                    if (self._persistence) yield (self._persistence.persistState(insta));
                    self._knownRunningInstances.add(workflowName, insta);
                    return result;
                }
                else
                {
                    return result;
                }
            });

        if (!self._persistence) return yield (createInsta(null));

        var lockInfo = {};
        return yield (self._toBeLocked(createInsta, lockInfo));
    });

WorkflowHost.prototype._invokeMethodOnRunningInstance = Promise.coroutine(
    function* (instanceId, workflowName, methodName, args)
    {
        var self = this;

        var doInvoke = Promise.coroutine(
            function* (lockInfo)
            {
                var insta = yield (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
                try
                {
                    var result = yield (insta.callMethod(methodName, args));
                    if (insta.execState === enums.ActivityStates.idle)
                    {
                        if (self._persistence) yield (self._persistence.persistState(insta));
                        return result;
                    }
                    else if (insta.execState === enums.ActivityStates.complete)
                    {
                        self._knownRunningInstances.remove(workflowName, insta.id);
                        if (self._persistence) yield (self._persistence.removeState(workflowName, insta.id, true));
                        return result;
                    }
                    else
                    {
                        throw new errors.WorkflowError("Instance '" + insta.id + "' is in an invalid state '" + insta.execState + "' after invocation of the method '" + methodName + "'.");
                    }
                }
                catch (e)
                {
                    self._knownRunningInstances.remove(workflowName, insta.id);
                    if (self._persistence)
                    {
                        try
                        {
                            yield (self._persistence.removeState(workflowName, insta.id, false, e));
                        }
                        catch (e2)
                        {
                            throw new errors.AggregateError([e, e2]);
                        }
                    }
                    throw e;
                }
            });

        if (!self._persistence) return yield (doInvoke(null));

        return yield (self._locked(specStrings.hosting.doubleKeys(workflowName, instanceId), doInvoke));
    });

WorkflowHost.prototype._locked = Promise.coroutine(
    function* (lockName, promiseFunc)
    {
        var self = this;
        var inLockTimeout = self.options.lockRenewalTimeout + Math.max(self.options.lockRenewalTimeout * 0.4, 3000);
        var lockId;
        var lockInfo = yield (self._persistence.enterLock(lockName, self.options.enterLockTimeout, inLockTimeout));
        lockId = lockInfo.id;
        try
        {
            return yield (
                asyncHelpers.doInLocked(
                    promiseFunc(lockInfo),
                    function ()
                    {
                        return self._persistence.renewLock(lockId, inLockTimeout);
                    },
                    self.options.lockRenewalTimeout));
        }
        finally
        {
            self._persistence.exitLock(lockId);
        }
    });

WorkflowHost.prototype._toBeLocked = Promise.coroutine(
    function* (promiseFunc, lockInfo)
    {
        var self = this;
        try
        {
            return yield (
                asyncHelpers.doInLocked(
                    promiseFunc(lockInfo),
                    Promise.coroutine(
                        function* ()
                        {
                            if (lockInfo.id) yield (self._persistence.renewLock(lockInfo.id, self._getInLockTimeout()));
                        }),
                    self.options.lockRenewalTimeout));
        }
        finally
        {
            if (lockInfo.id) self._persistence.exitLock(lockInfo.id);
        }
    });

WorkflowHost.prototype._enterLockForCreatedInstance = Promise.coroutine(
    function* (insta, lockInfo)
    {
        var li = yield (this._persistence.enterLock(specStrings.hosting.doubleKeys(insta.workflowName, insta.id), this.options.enterLockTimeout, this._getInLockTimeout()));
        if (yield (this._persistence.isRunning(insta.workflowName, insta.id)))
            throw new errors.WorkflowError("Cannot create instance of workflow '" + insta.workflowName + "' by id '" + insta.id + "' because it's already exists.");
        lockInfo.id = li.id;
        lockInfo.name = li.name;
        lockInfo.heldTo = li.heldTo;
    });

WorkflowHost.prototype._getInLockTimeout = function()
{
    return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
}

WorkflowHost.prototype._getRunningInstanceIdPaths = function (workflowName, methodName)
{
    var self = this;
    if (self._persistence)
    {
        return self._persistence.getRunningInstanceIdPaths(workflowName, methodName);
    }
    else
    {
        return Promise.resolve(self._knownRunningInstances.getInstanceIdPaths(workflowName, methodName));
    }
}

WorkflowHost.prototype._verifyAndRestoreInstanceState = Promise.coroutine(
    function* (instanceId, workflowName, methodName, args)
    {
        var self = this;
        var errorText = function ()
        {
            return "Instance '" + instanceId + "' has been invoked elsewhere since the lock took in the current host.";
        };
        if (self._persistence)
        {
            try
            {
                var header = yield (self._persistence.getRunningInstanceIdHeader(workflowName, instanceId, methodName));
                if (self._instanceIdParser.parse(header.instanceIdPath, args) !== instanceId)
                {
                    throw new errors.WorkflowError(errorText());
                }
                else
                {
                    return yield (self._restoreInstanceState(instanceId, workflowName, header.workflowVersion, header.updatedOn));
                }
            }
            catch (e)
            {
                if (e instanceof errors.WorkflowError) throw e;
                throw new errors.WorkflowError(errorText() + " Inner error: " + e.message);
            }
        }
        else
        {
            var insta = self._knownRunningInstances.get(workflowName, instanceId);
            if (!insta)
            {
                throw new errors.WorkflowError(errorText() + " Inner error: instance " + instanceId + " is unknown.");
            }
            else
            {
                var path = null;
                insta.idleMethods.forEach(
                    function (m)
                    {
                        if (m.methodName === methodName)
                        {
                            path = m.instanceIdPath;
                            return false;
                        }
                    });
                if (path)
                {
                    if (self._instanceIdParser.parse(path, args) === instanceId)
                    {
                        return insta;
                    }
                    else
                    {
                        throw new error.WorkflowError(errorText());
                    }
                }
                else
                {
                    throw new errors.WorkflowError(errorText() + " Inner error: method '" + methodName + "' is not idle.");
                }
            }
        }
    });

WorkflowHost.prototype._restoreInstanceState = Promise.coroutine(
    function* (instanceId, workflowName, workflowVersion, actualTimestamp)
    {
        var self = this;

        if (!self._persistence) throw new Error("Cannot restore instance from persistence, because host has no persistence registered.");

        var insta = self._knownRunningInstances.get(workflowName, instanceId);
        if (insta === undefined)
        {
            var wfDesc = self._registry.getDesc(workflowName, workflowVersion);
            insta = new WorkflowInstance(this);
            insta.setWorkflow(wfDesc.workflow, instanceId);
        }

        if (insta.updatedOn === null || insta.updatedOn.getTime() !== actualTimestamp.getTime() || self.options.alwaysLoadState)
        {
            var state = yield (self._persistence.loadState(workflowName, instanceId));
            insta.restoreState(state);
            return insta;
        }
        else
        {
            return insta;
        }
    });

WorkflowHost.prototype._checkIfInstanceRunning = Promise.coroutine(
    function* (workflowName, instanceId)
    {
        if (this._persistence)
        {
            return yield (this._persistence.isRunning(workflowName, instanceId));
        }
        else
        {
            return this._knownRunningInstances.exists(workflowName, instanceId);
        }
    });

WorkflowHost.prototype.addTracker = function (tracker)
{
    if (!_(tracker).isObject()) throw new TypeError("Argument is not an object.");
    this._trackers.push(tracker);
    // TODO: add tracker to all instances
}

module.exports = WorkflowHost;
