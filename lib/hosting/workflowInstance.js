var Workflow = require("../activities/workflow");
var ActivityExecutionEngine = require("../activities/activityExecutionEngine");
var BeginMethod = require("../activities/beginMethod");
var EndMethod = require("../activities/endMethod");
var errors = require("../common/errors");
var enums = require("../common/enums");
var specStrings = require("../common/specStrings");
var _ = require("lodash");
var guids = require("../common/guids");

function WorkflowInstance(host)
{
    this._host = host;
    this.id = null;
    this.idleMethods = [];
    this._engine = null;
    this._myTrackers = [];
    this._copyParsFromHost();
}

Object.defineProperties(WorkflowInstance.prototype, {
    execState: {
        get: function()
        {
            return this._engine ? this._engine.execState : null;
        }
    },
    workflowName: {
        get: function()
        {
            return this._engine ? this._engine.rootActivity.name.trim() : null;
        }
    },
    timestamp: {
        get: function()
        {
            return this._engine ? this._engine.timestamp : null;
        }
    }
});

WorkflowInstance.prototype.create = function (workflow, methodName, args, lockInfo)
{
    var self = this;
    
    self.setWorkflow(workflow);

    var createMethodReached = false;
    var instanceIdPath = null;
    self._addBeginMethodWithCreateInstHelperTracker(function(mn, ip)
    {
        if (mn == methodName)
        {
            createMethodReached = true;
            instanceIdPath = ip;
        }
    });

    return self._engine.invoke().then(
        function ()
        {
            // Completed:
            throw errors.WorkflowError("Workflow has been completed without reaching an instance creator BeginMethod activity.");
        },
        function (e)
        {
            if (e.__typeTag == guids.types.idleException)
            {
                if (createMethodReached)
                {
                    self._removeMyTrackers();

                    var waitForEndMethod = function()
                    {
                        var createEndMethodReached = false;
                        var result;
                        var endInstanceIdPath = null;
                        self._addEndMethodHelperTracker(function(mn, ip, r)
                        {
                            if (mn == methodName)
                            {
                                createEndMethodReached = true;
                                endInstanceIdPath = ip;
                                result = r;
                            }
                        });

                        self.idleMethods.length = 0;
                        self._addIdleInstanceIdPathTracker(function(mn, ip)
                        {
                            self.idleMethods.push({
                                methodName: mn,
                                instanceIdPath: ip
                            });
                        });

                        return self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.ActivityStates.complete, args).then(
                            function()
                            {
                                if (createEndMethodReached)
                                {
                                    if (!self.id)
                                    {
                                        if (endInstanceIdPath)
                                        {
                                            self.id = self._host._instanceIdParser.parse(endInstanceIdPath, result);
                                        }
                                        else
                                        {
                                            throw new errors.WorkflowError("BeginMethod or EndMethod of method name '" + methodName + "' doesn't specify an instanceIdPath property value.");
                                        }
                                    }
                                }
                                else
                                {
                                    throw errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method name '" + methodName + "'.");
                                }

                                if (self.execState == enums.ActivityStates.idle)
                                {
                                    if (self.idleMethods.length == 0)
                                    {
                                        throw errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
                                    }
                                }
                                else
                                {
                                    if (self.idleMethods.length != 0)
                                    {
                                        throw errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
                                    }
                                }

                                return result;
                            });
                    }

                    if (instanceIdPath)
                    {
                        self.id = self._host._instanceIdParser.parse(instanceIdPath, args);
                        if (self._host.persistence)
                        {
                            // We have to change lock name ASAP to free create instance lock on current workflow
                            return self._host.persistence.renameLock(lockInfo.id, specStrings.hosting.doubleKeys(self.workflowName, self.id)).then(
                                function()
                                {
                                    return waitForEndMethod();
                                });
                        }
                        else
                        {
                            return waitForEndMethod();
                        }
                    }
                    else
                    {
                        return waitForEndMethod();
                    }
                }
                else
                {
                    throw errors.WorkflowError("Workflow has gone to idle without reaching an instance creator BeginMethod activity of method name '" + methodName + "'.");
                }
            }
            else
            {
                // Failed:
                throw e;
            }
        }).finally(function()
        {
            self._removeMyTrackers();
        });
}

WorkflowInstance.prototype.setWorkflow = function (workflow)
{
    if (!(workflow instanceof Workflow)) throw new TypeError("Workflow argument expected.");
    this._engine = new ActivityExecutionEngine(workflow);
}

WorkflowInstance.prototype.callMethod = function (methodName, args)
{
    var self = this;

    var endMethodReached = false;
    var result = null;
    self._addEndMethodHelperTracker(function(mn, ip, r)
    {
        if (mn == methodName)
        {
            endMethodReached = true;
            result = r;
        }
    });

    self.idleMethods.length = 0;
    self._addIdleInstanceIdPathTracker(function(mn, ip)
    {
        self.idleMethods.push({
            methodName: mn,
            instanceIdPath: ip
        });
    });

    return self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.ActivityStates.complete, args).then(
        function()
        {
            if (!endMethodReached)
            {
                throw errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method name '" + methodName + "'.");
            }

            if (self.execState == enums.ActivityStates.idle)
            {
                if (self.idleMethods.length == 0)
                {
                    throw errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
                }
            }
            else
            {
                if (self.idleMethods.length != 0)
                {
                    throw errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
                }
            }

            return result;
        }).finally(function()
        {
            self._removeMyTrackers();
        });
}

WorkflowInstance.prototype._copyParsFromHost = function()
{
    var self = this;
    self._host._trackers.forEach(function(t)
    {
        self._engine.addTracker(t);
    });
}

WorkflowInstance.prototype._addBeginMethodWithCreateInstHelperTracker = function(callback)
{
    var self = this;
    var tracker = {
        activityStateFilter: function(activity, reason, result)
        {
            return activity instanceof BeginMethod &&
                activity.canCreateInstance &&
                _(activity.methodName).isString() &&
                (!activity.instanceIdPath || _(activity.instanceIdPath).isString()) &&
                reason == enums.ActivityStates.idle;
        },
        activityStateChanged: function(activity, reason, result)
        {
            var methodName = activity.methodName.trim();
            var instanceIdPath = activity.instanceIdPath ? activity.instanceIdPath.trim() : null;
            callback(methodName, instanceIdPath);
        }
    };
    self._engine.addTracker(tracker);
    self._myTrackers.push(tracker);
}

WorkflowInstance.prototype._addEndMethodHelperTracker = function(callback)
{
    var self = this;
    var tracker = {
        activityStateFilter: function(activity, reason, result)
        {
            return activity instanceof EndMethod &&
                _(activity.methodName).isString() &&
                (!activity.instanceIdPath || _(activity.instanceIdPath).isString()) &&
                reason == enums.ActivityStates.complete;
        },
        activityStateChanged: function(activity, reason, result)
        {
            var methodName = activity.methodName.trim();
            var instanceIdPath = activity.instanceIdPath ? activity.instanceIdPath.trim() : null;
            callback(methodName, instanceIdPath, result);
        }
    };
    self._engine.addTracker(tracker);
    self._myTrackers.push(tracker);
}

WorkflowInstance.prototype._addIdleInstanceIdPathTracker = function(callback)
{
    var self = this;
    var tracker = {
        activityStateFilter: function(activity, reason, result)
        {
            return activity instanceof BeginMethod &&
                _(activity.methodName).isString() &&
                _(activity.instanceIdPath).isString() &&
                reason == enums.ActivityStates.idle;
        },
        activityStateChanged: function(activity, reason, result)
        {
            var methodName = activity.methodName.trim();
            var instanceIdPath = activity.instanceIdPath.trim();
            callback(methodName, instanceIdPath);
        }
    };
    self._engine.addTracker(tracker);
    self._myTrackers.push(tracker);
}

WorkflowInstance.prototype._removeMyTrackers = function()
{
    var self = this;
    self._myTrackers.forEach(function(t)
    {
        self._engine.removeTracker(t);
    });
    self._myTrackers.length = 0;
}

WorkflowInstance.prototype.getStateToPersist = function()
{
    var sp = this._engine.getStateAndPromotions();
    return {
        instanceId: this.id,
        workflowName: this.workflowName,
        workflowVersion: this.workflowVersion,
        idleMethods: this.idleMethods,
        timestamp: this._engine._timestamp,
        state: sp.state,
        promotions: sp.promotions
    };
}

WorkflowInstance.prototype.restoreState = function(json)
{
    if (!_.isObject(json)) throw new TypeError("Argument 'json' is not an object.");
    if (json.instanceId !== this.id) throw new Error("State instanceId property value of '" + json.instanceId + "' is different than the current instance id '" + this.id + "'.");
    if (json.workflowName !== this.workflowName) throw new Error("State workflowName property value of '" + json.workflowName + "' is different than the current Workflow name '" + this.workflowName + "'.");
    if (json.workflowVersion !== this.workflowVersion) throw new Error("State workflowName property value of '" + json.workflowVersion + "' is different than the current Workflow version '" + this.workflowVersion + "'.");

    this._engine.setState(json.state);
}

module.exports = WorkflowInstance;
