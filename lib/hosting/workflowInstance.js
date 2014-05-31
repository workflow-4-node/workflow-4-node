var Workflow = require("../activities/workflow");
var ActivityExecutionEngine = require("../activities/activityExecutionEngine");
var BeginMethod = require("../activities/beginMethod");
var EndMethod = require("../activities/endMethod");
var ex = require("../activities/activityExceptions");
var hex = require("./hostingExceptions");
var enums = require("../common/enums");
var specStrings = require("../common/specStrings");
var _ = require("underscore-node");
var guids = require("../common/guids");

function WorkflowInstance(host)
{
    this._host = host;
    this.id = null;
    this.idleMethods = [];
    this._engine = null;
    this._myTrackers = [];
}

Object.defineProperties(WorkflowInstance.prototype, {
    execState: {
        get: function()
        {
            return this._engine.execState;
        }
    },
    workflowName: {
        get: function()
        {
            return this._engine.rootActivity.name.trim();
        }
    }
});

WorkflowInstance.prototype.create = function (workflow, methodName, args)
{
    var self = this;
    
    if (!(workflow instanceof Workflow)) throw new TypeError("Workflow argument expected.");
    self._engine = new ActivityExecutionEngine(workflow);
    self._copyParsFromHost();

    var createMethodReached = false;
    var instanceIdPath = null;
    self._addCreateHelperTracker(function(mn, ip)
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
            throw hex.WorkflowException("Workflow has been completed without reaching an instance creator BeginMethod activity.");
        },
        function (e)
        {
            if (e.__typeTag == guids.types.idleException)
            {
                if (createMethodReached)
                {
                    self._removeMyTrackers();

                    var createEndMethodReached = false;
                    var result = null;
                    var endInstanceIdPath = null;
                    self._addCreateEndHelperTracker(function(mn, ip, r)
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
                                if (instanceIdPath)
                                {
                                    self.id = self._host.instanceIdParser.parse(instanceIdPath, args);
                                }
                                else if (endInstanceIdPath)
                                {
                                    self.id = self._host.instanceIdParser.parse(endInstanceIdPath, result);
                                }
                                else
                                {
                                    throw new hex.WorkflowException("BeginMethod or EndMethod of method name '" + methodName + "' doesn't specify an instanceIdPath property value.");
                                }
                            }
                            else
                            {
                                throw hex.WorkflowException("Workflow has been completed or gone to idle without reaching an EndMethod activity of method name '" + methodName + "'.");
                            }

                            if (self._engine.execState == enums.ActivityStates.idle)
                            {
                                if (self.idleMethods.length == 0)
                                {
                                    throw hex.WorkflowException("Workflow has gone to idle, but there is no active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
                                }
                            }
                            else
                            {
                                if (self.idleMethods.length != 0)
                                {
                                    throw hex.WorkflowException("Workflow has completed, but there is active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
                                }
                            }

                            return result;
                        });
                }
                else
                {
                    throw hex.WorkflowException("Workflow has gone to idle without reaching an instance creator BeginMethod activity of method name '" + methodName + "'.");
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

WorkflowInstance.prototype._copyParsFromHost = function()
{
    var self = this;
    self._host._trackers.forEach(function(t)
    {
        self._engine.addTracker(t);
    });
}

WorkflowInstance.prototype._addCreateHelperTracker = function(callback)
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

WorkflowInstance.prototype._addCreateEndHelperTracker = function(callback)
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

WorkflowInstance.prototype.getPersistData = function()
{
    var sp = this._engine.getStateAndPromotionsToPersist();
    return {
        instanceId: this.id,
        workflow: this._engine.rootActivity,
        idleMethods: this.idleMethods,
        timestamp: this._engine.timestamp,
        state: sp.state,
        promotions: sp.promotions
    };
}

module.exports = WorkflowInstance;
