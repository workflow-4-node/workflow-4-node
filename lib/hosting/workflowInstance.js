var Workflow = require("../activities/workflow");
var ActivityExecutionEngine = require("../activities/activityExecutionEngine");
var BeginMethod = require("../activities/beginMethod");
var EndMethod = require("../activities/endMethod");
var errors = require("../common/errors");
var enums = require("../common/enums");
var specStrings = require("../common/specStrings");
var _ = require("lodash");
var guids = require("../common/guids");
var async = require("../common/asyncHelpers").async;
var await = require("../common/asyncHelpers").await;

function WorkflowInstance(host)
{
    this._host = host;
    this.id = null;
    this.idleMethods = [];
    this._engine = null;
    this._myTrackers = [];
    this._createdOn = null;
}

Object.defineProperties(
    WorkflowInstance.prototype, {
        execState: {
            get: function ()
            {
                return this._engine ? this._engine.execState : null;
            }
        },
        workflowName: {
            get: function ()
            {
                return this._engine ? this._engine.rootActivity.name.trim() : null;
            }
        },
        workflowVersion: {
            get: function ()
            {
                return this._engine ? this._engine.rootActivity.version : null;
            }
        },
        createdOn: {
            get: function ()
            {
                return this._createdOn;
            }
        },
        updatedOn: {
            get: function ()
            {
                return this._engine ? this._engine.updatedOn : null;
            }
        }
    });

WorkflowInstance.prototype.create = async(
    function (workflow, methodName, args, lockInfo)
    {
        var self = this;

        self.setWorkflow(workflow);

        var createMethodReached = false;
        var instanceIdPath = null;
        self._addBeginMethodWithCreateInstHelperTracker(
            function (mn, ip)
            {
                if (mn == methodName)
                {
                    createMethodReached = true;
                    instanceIdPath = ip;
                }
            });

        self._createdOn = new Date();

        try
        {
            await(self._engine.invoke());

            throw errors.WorkflowError("Workflow has been completed without reaching an instance creator BeginMethod activity.");
        }
        catch (e)
        {
            if (e.__typeTag == guids.types.idleException)
            {
                if (createMethodReached)
                {
                    self._removeMyTrackers();

                    if (instanceIdPath)
                    {
                        if ((self.id = self._host._instanceIdParser.parse(instanceIdPath, args)) === undefined)
                        {
                            throw new errors.WorkflowError("Cannot parse BeginMethod's instanceIdPath '" + instanceIdPath + "' on arguments of method '" + methodName + "'.");
                        }
                        await(self._enterLockForCreatedInstance(lockInfo));
                    }

                    var createEndMethodReached = false;
                    var result;
                    var endInstanceIdPath = null;
                    self._addEndMethodHelperTracker(
                        function (mn, ip, r)
                        {
                            if (mn == methodName)
                            {
                                createEndMethodReached = true;
                                endInstanceIdPath = ip;
                                result = r;
                            }
                        });

                    self.idleMethods.length = 0;
                    self._addIdleInstanceIdPathTracker(
                        function (mn, ip)
                        {
                            self.idleMethods.push(
                                {
                                    methodName: mn,
                                    instanceIdPath: ip
                                });
                        });

                    await(self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.ActivityStates.complete, args));

                    if (createEndMethodReached)
                    {
                        if (self.id === undefined)
                        {
                            if (endInstanceIdPath)
                            {
                                if ((self.id = self._host._instanceIdParser.parse(endInstanceIdPath, result)) === undefined)
                                {
                                    throw new errors.WorkflowError("Cannot parse EndMethods's instanceIdPath '" + instanceIdPath + "' on arguments of method '" + methodName + "'.");
                                }
                                await(self._enterLockForCreatedInstance(lockInfo))
                            }
                            else
                            {
                                throw new errors.WorkflowError("BeginMethod or EndMethod of method '" + methodName + "' doesn't specify an instanceIdPath property value.");
                            }
                        }
                    }
                    else
                    {
                        throw errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method '" + methodName + "'.");
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
                }
                else
                {
                    throw errors.WorkflowError("Workflow has gone to idle without reaching an instance creator BeginMethod activity of method '" + methodName + "'.");
                }
            }
            else
            {
                // Failed:
                throw e;
            }
        }
        finally
        {
            self._removeMyTrackers();
        }
    });

WorkflowInstance.prototype._enterLockForCreatedInstance = async(
    function (lockInfo)
    {
        if (lockInfo) await(this._host._enterLockForCreatedInstance(this, lockInfo));
    });

WorkflowInstance.prototype.setWorkflow = function (workflow, instanceId)
{
    if (!(workflow instanceof Workflow)) throw new TypeError("Workflow argument expected.");
    this._engine = new ActivityExecutionEngine(workflow);
    if (instanceId !== undefined) this.id = instanceId;
    this._copyParsFromHost();
}

WorkflowInstance.prototype.callMethod = async(
    function (methodName, args)
    {
        var self = this;

        var endMethodReached = false;
        var result = null;
        self._addEndMethodHelperTracker(
            function (mn, ip, r)
            {
                if (mn == methodName)
                {
                    endMethodReached = true;
                    result = r;
                }
            });

        self.idleMethods.length = 0;
        self._addIdleInstanceIdPathTracker(
            function (mn, ip)
            {
                self.idleMethods.push(
                    {
                        methodName: mn,
                        instanceIdPath: ip
                    });
            });

        try
        {
            await(self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.ActivityStates.complete, args));

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
        }
        finally
        {
            self._removeMyTrackers();
        }
    });

WorkflowInstance.prototype._copyParsFromHost = function ()
{
    var self = this;
    self._host._trackers.forEach(
        function (t)
        {
            self._engine.addTracker(t);
        });
}

WorkflowInstance.prototype._addBeginMethodWithCreateInstHelperTracker = function (callback)
{
    var self = this;
    var tracker = {
        activityStateFilter: function (activity, reason, result)
        {
            return activity instanceof BeginMethod &&
                activity.canCreateInstance &&
                _(activity.methodName).isString() &&
                (!activity.instanceIdPath || _(activity.instanceIdPath).isString()) &&
                reason == enums.ActivityStates.idle;
        },
        activityStateChanged: function (activity, reason, result)
        {
            var methodName = activity.methodName.trim();
            var instanceIdPath = activity.instanceIdPath ? activity.instanceIdPath.trim() : null;
            callback(methodName, instanceIdPath);
        }
    };
    self._engine.addTracker(tracker);
    self._myTrackers.push(tracker);
}

WorkflowInstance.prototype._addEndMethodHelperTracker = function (callback)
{
    var self = this;
    var tracker = {
        activityStateFilter: function (activity, reason, result)
        {
            return activity instanceof EndMethod &&
                _(activity.methodName).isString() &&
                (!activity.instanceIdPath || _(activity.instanceIdPath).isString()) &&
                reason == enums.ActivityStates.complete;
        },
        activityStateChanged: function (activity, reason, result)
        {
            var methodName = activity.methodName.trim();
            var instanceIdPath = activity.instanceIdPath ? activity.instanceIdPath.trim() : null;
            callback(methodName, instanceIdPath, result);
        }
    };
    self._engine.addTracker(tracker);
    self._myTrackers.push(tracker);
}

WorkflowInstance.prototype._addIdleInstanceIdPathTracker = function (callback)
{
    var self = this;
    var tracker = {
        activityStateFilter: function (activity, reason, result)
        {
            return activity instanceof BeginMethod &&
                _(activity.methodName).isString() &&
                _(activity.instanceIdPath).isString() &&
                reason == enums.ActivityStates.idle;
        },
        activityStateChanged: function (activity, reason, result)
        {
            var methodName = activity.methodName.trim();
            var instanceIdPath = activity.instanceIdPath.trim();
            callback(methodName, instanceIdPath);
        }
    };
    self._engine.addTracker(tracker);
    self._myTrackers.push(tracker);
}

WorkflowInstance.prototype._removeMyTrackers = function ()
{
    var self = this;
    self._myTrackers.forEach(
        function (t)
        {
            self._engine.removeTracker(t);
        });
    self._myTrackers.length = 0;
}

WorkflowInstance.prototype.getStateToPersist = function ()
{
    var sp = this._engine.getStateAndPromotions(this._host.options.serializer);
    return {
        instanceId: this.id,
        createdOn: this.createdOn,
        workflowName: this.workflowName,
        workflowVersion: this.workflowVersion,
        idleMethods: this.idleMethods,
        updatedOn: this._engine.updatedOn,
        state: sp.state,
        promotedProperties: sp.promotedProperties
    };
}

WorkflowInstance.prototype.restoreState = function (json)
{
    if (!_.isObject(json)) throw new TypeError("Argument 'json' is not an object.");
    if (json.instanceId !== this.id) throw new Error("State instanceId property value of '" + json.instanceId + "' is different than the current instance id '" + this.id + "'.");
    if (json.workflowName !== this.workflowName) throw new Error("State workflowName property value of '" + json.workflowName + "' is different than the current Workflow name '" + this.workflowName + "'.");
    if (json.workflowVersion !== this.workflowVersion) throw new Error("State workflowName property value of '" + json.workflowVersion + "' is different than the current Workflow version '" + this.workflowVersion + "'.");
    if (!_.isDate(json.createdOn)) throw new Error("State createdOn property value of '" + json.createdOn + "' is not a Date.");

    this._createdOn = json.createdOn;
    this._engine.setState(this._host.options.serializer, json.state);
}

module.exports = WorkflowInstance;
