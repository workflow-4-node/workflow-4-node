"use strict";

let Workflow = require("../activities/workflow");
let ActivityExecutionEngine = require("../activities/activityExecutionEngine");
let BeginMethod = require("../activities/beginMethod");
let EndMethod = require("../activities/endMethod");
let errors = require("../common/errors");
let enums = require("../common/enums");
let specStrings = require("../common/specStrings");
let _ = require("lodash");
let guids = require("../common/guids");
let Promise = require("bluebird");
let is = require("../common/is");
let asyncHelpers = require("../common/asyncHelpers");
let async = asyncHelpers.async;
let util = require("util");

function WorkflowInstance(host) {
    this._host = host;
    this.id = null;
    this._engine = null;
    this._createdOn = null;
    this._beginMethodWithCreateInstCallback = null;
    this._endMethodCallback = null;
    this._idleInstanceIdPathCallback = null;
}

Object.defineProperties(
    WorkflowInstance.prototype, {
        execState: {
            get: function () {
                return this._engine ? this._engine.execState : null;
            }
        },
        workflowName: {
            get: function () {
                return this._engine ? this._engine.rootActivity.name.trim() : null;
            }
        },
        workflowVersion: {
            get: function () {
                return this._engine ? this._engine.rootActivity.version : null;
            }
        },
        createdOn: {
            get: function () {
                return this._createdOn;
            }
        },
        updatedOn: {
            get: function () {
                return this._engine ? this._engine.updatedOn : null;
            }
        }
    });

WorkflowInstance.prototype.create = async(
    function* (workflow, methodName, args, lockInfo) {
        let self = this;

        self.setWorkflow(workflow);

        let createMethodReached = false;
        let instanceIdPath = null;
        self._beginMethodWithCreateInstCallback = function (mn, ip) {
            if (mn === methodName) {
                createMethodReached = true;
                instanceIdPath = ip;
            }
        };

        self._createdOn = new Date();

        try {
            if (self._engine.isIdle(yield self._engine.invoke())) {
                if (createMethodReached) {
                    self._clearCallbacks();

                    if (instanceIdPath) {
                        if (is.undefined(self.id = self._host._instanceIdParser.parse(instanceIdPath, args))) {
                            throw new errors.WorkflowError("Cannot parse BeginMethod's instanceIdPath '" + instanceIdPath + "' on arguments of method '" + methodName + "'.");
                        }
                        yield (self._enterLockForCreatedInstance(lockInfo));
                    }

                    let createEndMethodReached = false;
                    let result;
                    let endInstanceIdPath = null;
                    self._endMethodCallback =
                        function (mn, ip, r) {
                            if (mn === methodName) {
                                createEndMethodReached = true;
                                endInstanceIdPath = ip;
                                result = r;
                            }
                        };

                    let idleMethods = [];
                    self._idleInstanceIdPathCallback =
                        function (mn, ip) {
                            idleMethods.push(
                                {
                                    methodName: mn,
                                    instanceIdPath: ip
                                });
                        };

                    yield (self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.ActivityStates.complete, args));

                    if (createEndMethodReached) {
                        if (is.undefined(self.id)) {
                            if (endInstanceIdPath) {
                                if (is.undefined(self.id = self._host._instanceIdParser.parse(endInstanceIdPath, result))) {
                                    throw new errors.WorkflowError("Cannot parse EndMethods's instanceIdPath '" + instanceIdPath + "' on arguments of method '" + methodName + "'.");
                                }
                                yield self._enterLockForCreatedInstance(lockInfo);
                            }
                            else {
                                throw new errors.WorkflowError("BeginMethod or EndMethod of method '" + methodName + "' doesn't specify an instanceIdPath property value.");
                            }
                        }
                    }
                    else {
                        throw new errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method '" + methodName + "'.");
                    }

                    if (self.execState === enums.ActivityStates.idle) {
                        if (idleMethods.length === 0) {
                            throw new errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
                        }
                    }
                    else {
                        if (idleMethods.length !== 0) {
                            throw new errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
                        }
                    }

                    return result;
                }
                else {
                    throw new errors.WorkflowError("Workflow has gone to idle without reaching an instance creator BeginMethod activity of method '" + methodName + "'.");
                }
            }
            else {
                throw new errors.WorkflowError("Workflow has been completed without reaching an instance creator BeginMethod activity.");
            }
        }
        finally {
            self._clearCallbacks();
        }
    });

WorkflowInstance.prototype._enterLockForCreatedInstance = async(
    function* (lockInfo) {
        if (lockInfo) {
            yield this._host._enterLockForCreatedInstance(this, lockInfo);
        }
    });

WorkflowInstance.prototype.setWorkflow = function (workflow, instanceId) {
    if (!(workflow instanceof Workflow)) {
        throw new TypeError("Workflow argument expected.");
    }
    this._engine = new ActivityExecutionEngine(workflow);
    this._addMyTrackers();
    if (is.defined(instanceId)) {
        this.id = instanceId;
    }
    this._copyParsFromHost();
};

WorkflowInstance.prototype.callMethod = async(
    function* (methodName, args) {
        let self = this;

        let endMethodReached = false;
        let result = null;
        self._endMethodCallback =
            function (mn, ip, r) {
                if (mn === methodName) {
                    endMethodReached = true;
                    result = r;
                }
            };

        let idleMethods = [];
        self._idleInstanceIdPathCallback =
            function (mn, ip) {
                idleMethods.push(
                    {
                        methodName: mn,
                        instanceIdPath: ip
                    });
            };

        try {
            yield self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.ActivityStates.complete, args);

            if (!endMethodReached) {
                throw new errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method name '" + methodName + "'.");
            }

            if (self.execState === enums.ActivityStates.idle) {
                if (idleMethods.length === 0) {
                    throw new errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
                }
            }
            else {
                if (idleMethods.length !== 0) {
                    throw new errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
                }
            }

            return result;
        }
        finally {
            self._clearCallbacks();
        }
    });

WorkflowInstance.prototype._copyParsFromHost = function () {
    for (let t of this._host._trackers) {
        this._engine.addTracker(t);
    }
};

WorkflowInstance.prototype._addMyTrackers = function () {
    this._addBeginMethodWithCreateInstHelperTracker();
    this._addEndMethodHelperTracker();
    this._addIdleInstanceIdPathTracker();
};

WorkflowInstance.prototype._clearCallbacks = function () {
    this._beginMethodWithCreateInstCallback = null;
    this._endMethodCallback = null;
    this._idleInstanceIdPathCallback = null;
};

WorkflowInstance.prototype._addBeginMethodWithCreateInstHelperTracker = function () {
    let self = this;
    let tracker = {
        activityStateFilter: function (activity, reason, result) {
            return self._beginMethodWithCreateInstCallback &&
                activity instanceof BeginMethod &&
                activity.canCreateInstance &&
                _(activity.methodName).isString() &&
                (!activity.instanceIdPath || _(activity.instanceIdPath).isString()) &&
                reason === enums.ActivityStates.idle;
        },
        activityStateChanged: function (activity, reason, result) {
            let methodName = activity.methodName.trim();
            let instanceIdPath = activity.instanceIdPath ? activity.instanceIdPath.trim() : null;
            self._beginMethodWithCreateInstCallback(methodName, instanceIdPath);
        }
    };
    self._engine.addTracker(tracker);
};

WorkflowInstance.prototype._addEndMethodHelperTracker = function () {
    let self = this;
    let tracker = {
        activityStateFilter: function (activity, reason, result) {
            return self._endMethodCallback &&
                activity instanceof EndMethod &&
                _(activity.methodName).isString() &&
                (!activity.instanceIdPath || _(activity.instanceIdPath).isString()) &&
                reason === enums.ActivityStates.complete;
        },
        activityStateChanged: function (activity, reason, result) {
            let methodName = activity.methodName.trim();
            let instanceIdPath = activity.instanceIdPath ? activity.instanceIdPath.trim() : null;
            self._endMethodCallback(methodName, instanceIdPath, result);
        }
    };
    self._engine.addTracker(tracker);
};

WorkflowInstance.prototype._addIdleInstanceIdPathTracker = function () {
    let self = this;
    let tracker = {
        activityStateFilter: function (activity, reason, result) {
            return self._idleInstanceIdPathCallback &&
                activity instanceof BeginMethod &&
                _(activity.methodName).isString() &&
                _(activity.instanceIdPath).isString() &&
                reason === enums.ActivityStates.idle;
        },
        activityStateChanged: function (activity, reason, result) {
            let methodName = activity.methodName.trim();
            let instanceIdPath = activity.instanceIdPath.trim();
            self._idleInstanceIdPathCallback(methodName, instanceIdPath);
        }
    };
    self._engine.addTracker(tracker);
};

WorkflowInstance.prototype.getStateToPersist = function () {
    let sp = this._engine.getStateAndPromotions(this._host.options.serializer, this._host.options.enablePromotions);
    return {
        instanceId: this.id,
        createdOn: this.createdOn,
        workflowName: this.workflowName,
        workflowVersion: this.workflowVersion,
        updatedOn: this._engine.updatedOn,
        state: sp.state,
        promotedProperties: sp.promotedProperties
    };
};

WorkflowInstance.prototype.restoreState = function (json) {
    if (!_.isObject(json)) {
        throw new TypeError("Argument 'json' is not an object.");
    }
    if (json.instanceId !== this.id) {
        throw new Error("State instanceId property value of '" + json.instanceId + "' is different than the current instance id '" + this.id + "'.");
    }
    if (json.workflowName !== this.workflowName) {
        throw new Error("State workflowName property value of '" + json.workflowName + "' is different than the current Workflow name '" + this.workflowName + "'.");
    }
    if (json.workflowVersion !== this.workflowVersion) {
        throw new Error("State workflowName property value of '" + json.workflowVersion + "' is different than the current Workflow version '" + this.workflowVersion + "'.");
    }
    if (!_.isDate(json.createdOn)) {
        throw new Error("State createdOn property value of '" + json.createdOn + "' is not a Date.");
    }

    this._createdOn = json.createdOn;
    this._engine.setState(this._host.options.serializer, json.state);
};

module.exports = WorkflowInstance;
