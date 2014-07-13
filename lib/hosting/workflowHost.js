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
var await = asyncHelpers.await;
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

WorkflowHost.prototype.invokeMethod = async(
    function (workflowName, methodName, args)
    {
        if (!_(workflowName).isString()) throw new TypeError("Argument 'workflowName' is not a string.");
        workflowName = workflowName.trim();
        if (!_(methodName).isString()) throw new TypeError("Argument 'methodName' is not a string.");
        methodName = methodName.trim();

        if (args !== undefined && !_.isArray(args)) args = [ args ];

        var self = this;

        self._initialize();

        var paths = await(self._getRunningInstanceIdPaths(workflowName, methodName));

        var instanceId;
        if (paths)
        {
            paths.forEach(
                function (path)
                {
                    var tryId = self._instanceIdParser.parse(path, args);
                    if (tryId !== undefined && await(self._checkIfInstanceRunning(workflowName, tryId)))
                    {
                        instanceId = tryId;
                        return false;
                    }
                });
        }
        if (instanceId !== undefined)
        {
            return await(self._invokeMethodOnRunningInstance(instanceId, workflowName, methodName, args));
        }
        else
        {
            return await(self._createInstanceAndInvokeMethod(workflowName, methodName, args));
        }
    });

WorkflowHost.prototype._createInstanceAndInvokeMethod = async(
    function (workflowName, methodName, args)
    {
        var self = this;

        var wfDesc = self._registry.getDesc(workflowName);
        if (!wfDesc.createInstanceMethods[methodName]) throw Error("Workflow '" + workflowName + "' cannot be created by invoking method '" + methodName + "'.");

        var createInsta = async(
            function (lockInfo)
            {
                var insta = new WorkflowInstance(self);
                var result = await(insta.create(wfDesc.workflow, methodName, args, lockInfo));
                if (insta.execState === enums.ActivityStates.idle)
                {
                    if (self._persistence) await(self._persistence.persistState(insta));
                    self._knownRunningInstances.add(workflowName, insta);
                    return result;
                }
                else
                {
                    return result;
                }
            });

        if (!self._persistence) return await(createInsta(null));

        var lockName = specStrings.hosting.createCWFLockName(workflowName);
        return await(self._locked(lockName, createInsta));
    });

WorkflowHost.prototype._invokeMethodOnRunningInstance = async(
    function (instanceId, workflowName, methodName, args)
    {
        var self = this;

        var doInvoke = async(
            function (lockInfo)
            {
                var insta = await(self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
                try
                {
                    var result = await(insta.callMethod(methodName, args));
                    if (insta.execState === enums.ActivityStates.idle)
                    {
                        if (self._persistence) await(self._persistence.persistState(insta));
                        return result;
                    }
                    else if (insta.execState === enums.ActivityStates.complete)
                    {
                        self._knownRunningInstances.remove(workflowName, insta.id);
                        if (self._persistence) await(self._persistence.removeState(workflowName, insta.id, true));
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
                            await(self._persistence.removeState(workflowName, insta.id, false, e));
                        }
                        catch (e2)
                        {
                            throw new errors.AggregateError([e, e2]);
                        }
                    }
                    throw e;
                }
            });

        if (!self._persistence) return await(doInvoke(null));

        return await(self._locked(specStrings.hosting.doubleKeys(workflowName, instanceId), doInvoke));
    });

WorkflowHost.prototype._locked = async(
    function (lockName, promiseFunc)
    {
        var self = this;
        var inLockTimeout = self.options.lockRenewalTimeout + Math.max(self.options.lockRenewalTimeout * 0.4, 3000);
        var lockId;
        var lockInfo = await(self._persistence.enterLock(lockName, self.options.enterLockTimeout, inLockTimeout));
        lockId = lockInfo.id;
        try
        {
            return await(
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

WorkflowHost.prototype._verifyAndRestoreInstanceState = async(
    function (instanceId, workflowName, methodName, args)
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
                var header = await(self._persistence.getRunningInstanceIdHeader(workflowName, instanceId, methodName));
                if (self._instanceIdParser.parse(header.instanceIdPath, args) !== instanceId)
                {
                    throw new errors.WorkflowError(errorText());
                }
                else
                {
                    return await(self._restoreInstanceState(instanceId, workflowName, header.workflowVersion, header.updatedOn));
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

WorkflowHost.prototype._restoreInstanceState = async(
    function (instanceId, workflowName, workflowVersion, actualTimestamp)
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

        if (insta.updatedOn !== actualTimestamp || self.options.alwaysLoadState)
        {
            var state = await(self._persistence.loadState(workflowName, instanceId));
            insta.restoreState(state);
            return insta;
        }
        else
        {
            return insta;
        }
    });

WorkflowHost.prototype._checkIfInstanceRunning = async(
    function (workflowName, instanceId)
    {
        if (this._persistence)
        {
            return await(this._persistence.isRunning(workflowName, instanceId));
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
