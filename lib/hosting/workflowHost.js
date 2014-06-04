var WorkflowRegistry = require("./workflowRegistry");
var _ = require("underscore-node");
var Activity = require("../activities/activity");
var Workflow = require("../activities/workflow");
var WorkflowPersistence = require("./workflowPersistence");
var WorkflowInstance = require("./workflowInstance");
var InstanceIdParser = require("./instanceIdParser");
var enums = require("../common/enums");
var specStrings = require("../common/specStrings");
var Q = require("q");
var asyncHelpers = require("./asyncHelpers");
var Map = require("backpack-node").collections.Map;

function WorkflowHost(options)
{
    this._registry = new WorkflowRegistry();
    this._trackers = [];
    this._isInitialized = false;
    this._instanceIdParser = new InstanceIdParser();
    this._knownRunningInstances = new Map();
    this._persistence = null;
    this._options = _.extend(
        {
            enterLockTimeout: 10000,
            lockRenewalTimeout: 5000
        },
        options);
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

        persistence: {
            get: function ()
            {
                return this._persistence;
            },
            set: function (value)
            {
                if (this.isInitialized) throw new Error("Cannot set persistence after the host is initialized.");
                this._persistence = new WorkflowPersistence(value);
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

WorkflowHost.prototype._initialize = function()
{
    if (!this._isInitialized)
    {
        // Do init here ...
        this._isInitialized = true;
    }
}

WorkflowHost.prototype.invokeMethod = function (workflowName, methodName, args)
{
    if (!_(workflowName).isString()) throw new TypeError("Argument 'workflowName' is not a string.");
    workflowName = workflowName.trim();
    if (!_(methodName).isString()) throw new TypeError("Argument 'methodName' is not a string.");
    methodName = methodName.trim();

    var self = this;

    self._initialize();

    return self._getRunningInstanceIdPaths(workflowName, methodName).then(
        function(paths)
        {
            var runningInstanceIdPath = null;
            if (paths)
            {
                paths.forEach(function(path)
                {
                    if (self._instanceIdParser.parse(path.value, args) === path.instanceId)
                    {
                        runningInstanceIdPath = path;
                        return false;
                    }
                });
            }
            if (runningInstanceIdPath)
            {
                return self._invokeMethodOnRunningInstance(runningInstanceIdPath, workflowName, methodName, args);
            }
            else
            {
                return self._createInstanceAndInvokeMethod(workflowName, methodName, args);
            }
        });
}

WorkflowHost.prototype._createInstanceAndInvokeMethod = function(workflowName, methodName, args)
{
    var self = this;
    
    var wfDesc = self._registry.getDesc(workflowName);
    if (!wfDesc.createInstanceMethods[methodName]) throw Error("Workflow '" + workflowName + "' cannot be created by invoking method '" + methodName + "'.");

    var createInsta = function(lockInfo)
    {
        var insta = new WorkflowInstance(self);
        return insta.create(wfDesc.workflow, methodName, args, lockInfo).then(
            function(result)
            {
                if (insta.execState === enums.ActivityStates.idle)
                {
                    if (self._persistence)
                    {
                        return self.persistence.persistState(insta).then(
                            function ()
                            {
                                self._knownRunningInstances.add(insta.id, insta);
                                return result;
                            });
                    }
                    else
                    {
                        self._knownRunningInstances.add(insta.id, insta);
                        return result;
                    }
                }
                else
                {
                    return result;
                }
            });
    }

    if (!self._persistence) return createInsta(null);

    var lockName = specStrings.hosting.createCWFLockName(workflowName);
    return self._locked(lockName, createInsta);
}

WorkflowHost.prototype._invokeMethodOnRunningInstance = function(runningInstanceIdPath, workflowName, methodName, args)
{
    var self = this;

    var doInvoke = function(lockInfo)
    {
        return self._verifyAndRestoreInstanceState(runningInstanceIdPath.instanceId, workflowName, methodName, args).then(
            function(insta)
            {
                throw new Error("TODO");
            });
    };

    if (!self._persistence) return doInvoke(null);

    return self._locked(runningInstanceIdPath.instanceId.toString(), doInvoke);
}

WorkflowHost.prototype._locked = function (lockName, promiseFunc)
{
    var self = this;
    var inLockTimeout = self.options.lockRenewalTimeout + Math.max(self.options.lockRenewalTimeout * 0.4, 3000);
    var lockId;
    return self._persistence.enterLock(lockName, self.options.enterLockTimeout, inLockTimeout).then(
        function(lockInfo)
        {
            lockId = lockInfo.id;
            return asyncHelpers.doInLocked(
                promiseFunc(lockInfo),
                function()
                {
                    return self._persistence.renewLock(lockId, inLockTimeout);
                },
                self.options.lockRenewalTimeout);
        }).finally(
        function()
        {
            if (lockId) return self._persistence.exitLock(lockId);
        });
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
        var defer = Q.defer();
        try
        {
            var result = [];
            self._knownRunningInstances.forEachValue(function(insta)
            {
                if (insta.workflowName === workflowName)
                {
                    insta.idleMethods.forEach(function(mi)
                    {
                        if (mi.methodName == methodName)
                            result.push(
                                {
                                    instanceId: insta.id,
                                    value: mi.instanceIdPath
                                });
                    });
                }
            });
            defer.resolve(result);
        }
        catch (e)
        {
            defer.reject(e);
        }
        return defer.promise;
    }
}

WorkflowHost.prototype._verifyAndRestoreInstanceState = function (instanceId, workflowName, methodName, args)
{
    var self = this;
    var errorText = function()
    {
        return "Instance '" + instanceId + "' has been invoked elsewhere since the lock took in the current host.";
    };
    if (self._persistence)
    {
        return self._persistence.getRunningInstanceIdHeader(instanceId, methodName).then(
            function(header)
            {
                if (self._instanceIdParser.parse(header.instanceIdPath, args) !== instanceId)
                {
                    throw new error.WorkflowError(errorText());
                }
                else
                {
                    return self._restoreInstanceState(instanceId, workflowName, header.workflowVersion, header.timestamp);
                }
            },
            function(e)
            {
                throw new error.WorkflowError(errorText() + " Inner error: " + e.message);
            });
    }
    else
    {
        var defer = Q.defer();
        try
        {
            var insta = self._knownRunningInstances.get(instanceId);
            if (!insta)
            {
                defer.reject(new errors.WorkflowError(errorText() + " Inner error: instance " + instanceId + " is unknown."));
            }
            else
            {
                var path = null;
                insta.idleMethods.forEach(function(m)
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
                        defer.resolve(insta);
                    }
                    else
                    {
                        defer.reject(new error.WorkflowError(errorText()));
                    }
                }
                else
                {
                    defer.reject(new errors.WorkflowError(errorText() + " Inner error: method '" + methodName + "' is not idle."));
                }
            }
        }
        catch (e)
        {
            defer.reject(e);
        }
        return defer.promise;
    }
}

WorkflowHost.prototype._restoreInstanceState = function(instanceId, workflowName, workflowVersion, actualTimestamp)
{
    var self = this;

    if (!self._persistence) throw new Error("Cannot restore instance from persistence, because host has no persistence registered.");

    var insta = self._knownRunningInstances.get(instanceId);
    if (insta === undefined)
    {
        var wfDesc = self._workflows.getDesc(workflowName, workflowVersion);
        insta = new WorkflowInstance(this);
        insta.setWorkflow(wfDesc.workflow);
    }

    if (insta.timestamp !== actualTimestamp || true)
    {
        return self._persistence.loadState(instanceId).then(
            function (state)
            {
                insta.restoreState(state);
                return insta;
            });
    }
    else
    {
        return Q(insta);
    }
}

WorkflowHost.prototype.addTracker = function (tracker)
{
    if (!_(tracker).isObject()) throw new TypeError("Argument is not an object.");
    this._trackers.push(tracker);
    // TODO: add tracker to all instances
}

module.exports = WorkflowHost;
