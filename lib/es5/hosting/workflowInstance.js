"use strict";

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var Workflow = require("../activities/workflow");
var ActivityExecutionContext = require("../activities/activityExecutionContext");
var ActivityExecutionEngine = require("../activities/activityExecutionEngine");
var BeginMethod = require("../activities/beginMethod");
var EndMethod = require("../activities/endMethod");
var errors = require("../common/errors");
var enums = require("../common/enums");
var specStrings = require("../common/specStrings");
var _ = require("lodash");
var constants = require("../common/constants");
var Bluebird = require("bluebird");
var is = require("../common/is");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var debug = require("debug")("wf4node:WorkflowInstance");

function WorkflowInstance(host) {
    EventEmitter.call(this);

    this._host = host;
    this.id = null;
    this._engine = null;
    this.createdOn = null;
    this._beginMethodWithCreateInstCallback = null;
    this._endMethodCallback = null;
    this._idleInstanceIdPathCallback = null;
    this.activeDelays = [];
    this.workflowVersion = null;
}

util.inherits(WorkflowInstance, EventEmitter);

Object.defineProperties(WorkflowInstance.prototype, {
    execState: {
        get: function get() {
            return this._engine ? this._engine.execState : null;
        }
    },
    workflowName: {
        get: function get() {
            return this._engine ? this._engine.rootActivity.name.trim() : null;
        }
    },
    updatedOn: {
        get: function get() {
            return this._engine ? this._engine.updatedOn : null;
        }
    },
    persistence: {
        get: function get() {
            return this._host._persistence;
        }
    }
});

WorkflowInstance.prototype.create = async(regeneratorRuntime.mark(function _callee2(execContext, workflowVersion, methodName, args, lockInfo) {
    var _this = this;

    var self, createMethodReached, instanceIdPath, _ret;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    self = this;

                    self.setWorkflow(execContext, workflowVersion);
                    self._resetCallbacksAndState();

                    createMethodReached = false;
                    instanceIdPath = null;

                    self._beginMethodWithCreateInstCallback = function (mn, ip) {
                        if (mn === methodName) {
                            createMethodReached = true;
                            instanceIdPath = ip;
                        }
                    };

                    self.createdOn = new Date();

                    _context2.prev = 7;
                    _context2.t0 = self._engine;
                    _context2.next = 11;
                    return self._engine.invoke();

                case 11:
                    _context2.t1 = _context2.sent;

                    if (!_context2.t0.isIdle.call(_context2.t0, _context2.t1)) {
                        _context2.next = 23;
                        break;
                    }

                    if (!createMethodReached) {
                        _context2.next = 20;
                        break;
                    }

                    return _context2.delegateYield(regeneratorRuntime.mark(function _callee() {
                        var createEndMethodReached, result, endInstanceIdPath, idleMethods;
                        return regeneratorRuntime.wrap(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        self._resetCallbacksAndState();

                                        if (!instanceIdPath) {
                                            _context.next = 6;
                                            break;
                                        }

                                        if (!_.isUndefined(self.id = self._host._instanceIdParser.parse(instanceIdPath, args))) {
                                            _context.next = 4;
                                            break;
                                        }

                                        throw new errors.WorkflowError("Cannot parse BeginMethod's instanceIdPath '" + instanceIdPath + "' on arguments of method '" + methodName + "'.");

                                    case 4:
                                        _context.next = 6;
                                        return self._enterLockForCreatedInstance(lockInfo);

                                    case 6:
                                        createEndMethodReached = false;
                                        result = undefined;
                                        endInstanceIdPath = null;

                                        self._endMethodCallback = function (mn, ip, r) {
                                            if (mn === methodName) {
                                                createEndMethodReached = true;
                                                endInstanceIdPath = ip;
                                                result = r;
                                            }
                                        };

                                        idleMethods = [];

                                        self._idleInstanceIdPathCallback = function (mn, ip) {
                                            idleMethods.push({
                                                methodName: mn,
                                                instanceIdPath: ip
                                            });
                                        };

                                        _context.next = 14;
                                        return self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.activityStates.complete, args);

                                    case 14:
                                        if (!createEndMethodReached) {
                                            _context.next = 26;
                                            break;
                                        }

                                        if (!_.isUndefined(self.id)) {
                                            _context.next = 24;
                                            break;
                                        }

                                        if (!endInstanceIdPath) {
                                            _context.next = 23;
                                            break;
                                        }

                                        if (!_.isUndefined(self.id = self._host._instanceIdParser.parse(endInstanceIdPath, result))) {
                                            _context.next = 19;
                                            break;
                                        }

                                        throw new errors.WorkflowError("Cannot parse EndMethods's instanceIdPath '" + instanceIdPath + "' on arguments of method '" + methodName + "'.");

                                    case 19:
                                        _context.next = 21;
                                        return self._enterLockForCreatedInstance(lockInfo);

                                    case 21:
                                        _context.next = 24;
                                        break;

                                    case 23:
                                        throw new errors.WorkflowError("BeginMethod or EndMethod of method '" + methodName + "' doesn't specify an instanceIdPath property value.");

                                    case 24:
                                        _context.next = 27;
                                        break;

                                    case 26:
                                        throw new errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method '" + methodName + "'.");

                                    case 27:
                                        if (!(self.execState === enums.activityStates.idle)) {
                                            _context.next = 32;
                                            break;
                                        }

                                        if (!(idleMethods.length === 0)) {
                                            _context.next = 30;
                                            break;
                                        }

                                        throw new errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for.");

                                    case 30:
                                        _context.next = 34;
                                        break;

                                    case 32:
                                        if (!(idleMethods.length !== 0)) {
                                            _context.next = 34;
                                            break;
                                        }

                                        throw new errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for.");

                                    case 34:
                                        return _context.abrupt("return", {
                                            v: result
                                        });

                                    case 35:
                                    case "end":
                                        return _context.stop();
                                }
                            }
                        }, _callee, _this);
                    })(), "t2", 15);

                case 15:
                    _ret = _context2.t2;

                    if (!((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object")) {
                        _context2.next = 18;
                        break;
                    }

                    return _context2.abrupt("return", _ret.v);

                case 18:
                    _context2.next = 21;
                    break;

                case 20:
                    throw new errors.WorkflowError("Workflow has gone to idle without reaching an instance creator BeginMethod activity of method '" + methodName + "'.");

                case 21:
                    _context2.next = 24;
                    break;

                case 23:
                    throw new errors.WorkflowError("Workflow has been completed without reaching an instance creator BeginMethod activity.");

                case 24:
                    _context2.next = 34;
                    break;

                case 26:
                    _context2.prev = 26;
                    _context2.t3 = _context2["catch"](7);

                    debug("Create error: %s", _context2.t3.stack);

                    if (!(_context2.t3 instanceof errors.TimeoutError)) {
                        _context2.next = 31;
                        break;
                    }

                    throw new errors.MethodIsNotAccessibleError("Cannot create instanceof workflow '" + self.workflowName + "', because '" + methodName + "' is locked.");

                case 31:
                    if (!(_context2.t3 instanceof errors.BookmarkNotFoundError)) {
                        _context2.next = 33;
                        break;
                    }

                    throw new errors.MethodIsNotAccessibleError("Cannot create instanceof workflow '" + self.workflowName + "', because bookmark of '" + methodName + "' doesn't exist.");

                case 33:
                    throw _context2.t3;

                case 34:
                    _context2.prev = 34;

                    self._resetCallbacks();
                    return _context2.finish(34);

                case 37:
                case "end":
                    return _context2.stop();
            }
        }
    }, _callee2, this, [[7, 26, 34, 37]]);
}));

WorkflowInstance.prototype._enterLockForCreatedInstance = async(regeneratorRuntime.mark(function _callee3(lockInfo) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    if (!lockInfo) {
                        _context3.next = 3;
                        break;
                    }

                    _context3.next = 3;
                    return this._host._enterLockForCreatedInstance(this, lockInfo);

                case 3:
                case "end":
                    return _context3.stop();
            }
        }
    }, _callee3, this);
}));

WorkflowInstance.prototype.setWorkflow = function (execContext, workflowVersion, instanceId) {
    var self = this;
    if (!(execContext instanceof ActivityExecutionContext)) {
        throw new TypeError("Workflow argument expected.");
    }
    if (!_.isString(workflowVersion) || !workflowVersion) {
        throw new TypeError("Workflow version expected.");
    }
    this.workflowVersion = workflowVersion;
    this._engine = new ActivityExecutionEngine(execContext, this);
    this._engine.on(enums.events.workflowEvent, function (args) {
        var arr = _.toArray(args);
        arr.splice(0, 0, self.instanceId);
        self.emit(enums.events.workflowEvent, args);
    });
    this._addMyTrackers();
    if (!_.isUndefined(instanceId)) {
        this.id = instanceId;
    }
    this._copyParsFromHost();
};

WorkflowInstance.prototype.callMethod = async(regeneratorRuntime.mark(function _callee4(methodName, args) {
    var self, endMethodReached, result, idleMethods;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    self = this;

                    self._resetCallbacksAndState();

                    endMethodReached = false;
                    result = null;

                    self._endMethodCallback = function (mn, ip, r) {
                        if (mn === methodName) {
                            endMethodReached = true;
                            result = r;
                        }
                    };

                    idleMethods = [];

                    self._idleInstanceIdPathCallback = function (mn, ip) {
                        idleMethods.push({
                            methodName: mn,
                            instanceIdPath: ip
                        });
                    };

                    _context4.prev = 7;
                    _context4.next = 10;
                    return self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.activityStates.complete, args);

                case 10:
                    if (endMethodReached) {
                        _context4.next = 12;
                        break;
                    }

                    throw new errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method name '" + methodName + "'.");

                case 12:
                    if (!(self.execState === enums.activityStates.idle)) {
                        _context4.next = 17;
                        break;
                    }

                    if (!(idleMethods.length === 0)) {
                        _context4.next = 15;
                        break;
                    }

                    throw new errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for.");

                case 15:
                    _context4.next = 19;
                    break;

                case 17:
                    if (!(idleMethods.length !== 0)) {
                        _context4.next = 19;
                        break;
                    }

                    throw new errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for.");

                case 19:
                    return _context4.abrupt("return", result);

                case 22:
                    _context4.prev = 22;
                    _context4.t0 = _context4["catch"](7);

                    debug("Call method error: %s", _context4.t0.stack);

                    if (!(_context4.t0 instanceof errors.BookmarkNotFoundError)) {
                        _context4.next = 27;
                        break;
                    }

                    throw new errors.MethodIsNotAccessibleError("Cannot call method '" + methodName + "' of workflow '" + self.workflowName + "', because its bookmark doesn't exist.");

                case 27:
                    throw _context4.t0;

                case 28:
                    _context4.prev = 28;

                    self._resetCallbacks();
                    return _context4.finish(28);

                case 31:
                case "end":
                    return _context4.stop();
            }
        }
    }, _callee4, this, [[7, 22, 28, 31]]);
}));

WorkflowInstance.prototype._copyParsFromHost = function () {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = this._host._trackers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var t = _step.value;

            this._engine.addTracker(t);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
};

WorkflowInstance.prototype._addMyTrackers = function () {
    this._addBeginMethodWithCreateInstHelperTracker();
    this._addEndMethodHelperTracker();
    this._addIdleInstanceIdPathTracker();
};

WorkflowInstance.prototype._resetCallbacks = function () {
    this._beginMethodWithCreateInstCallback = null;
    this._endMethodCallback = null;
    this._idleInstanceIdPathCallback = null;
};

WorkflowInstance.prototype._resetCallbacksAndState = function () {
    this._resetCallbacks();
    this.activeDelays = [];
};

WorkflowInstance.prototype._addBeginMethodWithCreateInstHelperTracker = function () {
    var self = this;
    var tracker = {
        activityStateFilter: function activityStateFilter(args) {
            return self._beginMethodWithCreateInstCallback && args.scope.$activity instanceof BeginMethod && args.scope.canCreateInstance && _.isString(args.scope.methodName) && (!args.scope.instanceIdPath || _.isString(args.scope.instanceIdPath)) && args.reason === enums.activityStates.idle;
        },
        activityStateChanged: function activityStateChanged(args) {
            var methodName = args.scope.methodName.trim();
            var instanceIdPath = args.scope.instanceIdPath ? args.scope.instanceIdPath.trim() : null;
            self._beginMethodWithCreateInstCallback(methodName, instanceIdPath);
        }
    };
    self._engine.addTracker(tracker);
};

WorkflowInstance.prototype._addEndMethodHelperTracker = function () {
    var self = this;
    var tracker = {
        activityStateFilter: function activityStateFilter(args) {
            return self._endMethodCallback && args.scope.$activity instanceof EndMethod && _.isString(args.scope.methodName) && (!args.scope.instanceIdPath || _.isString(args.scope.instanceIdPath)) && args.reason === enums.activityStates.complete;
        },
        activityStateChanged: function activityStateChanged(args) {
            var methodName = args.scope.methodName.trim();
            var instanceIdPath = args.scope.instanceIdPath ? args.scope.instanceIdPath.trim() : null;
            self._endMethodCallback(methodName, instanceIdPath, args.result);
        }
    };
    self._engine.addTracker(tracker);
};

WorkflowInstance.prototype._addIdleInstanceIdPathTracker = function () {
    var self = this;
    var tracker = {
        activityStateFilter: function activityStateFilter(args) {
            return self._idleInstanceIdPathCallback && args.scope.$activity instanceof BeginMethod && _.isString(args.scope.methodName) && _.isString(args.scope.instanceIdPath) && args.reason === enums.activityStates.idle;
        },
        activityStateChanged: function activityStateChanged(args) {
            var methodName = args.scope.methodName.trim();
            var instanceIdPath = args.scope.instanceIdPath.trim();
            self._idleInstanceIdPathCallback(methodName, instanceIdPath);

            // This is where a method goes idle.
            // So if it a DelayTo method, we should remember that.
            if (specStrings.hosting.isDelayToMethodName(methodName)) {
                self.activeDelays.push({
                    methodName: methodName,
                    delayTo: args.scope.delayTo
                });
            }
        }
    };
    self._engine.addTracker(tracker);
};

WorkflowInstance.prototype.getStateToPersist = function () {
    var sp = this._engine.getStateAndPromotions(this._host.options.serializer, this._host.options.enablePromotions);
    return {
        instanceId: this.id,
        createdOn: this.createdOn,
        workflowName: this.workflowName,
        workflowVersion: this.workflowVersion,
        updatedOn: this._engine.updatedOn,
        state: sp.state,
        promotedProperties: sp.promotedProperties,
        activeDelays: this.activeDelays
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
        throw new Error("State workflowVersion property value of '" + json.workflowVersion + "' is different than the current Workflow version '" + this.workflowVersion + "'.");
    }
    if (!_.isDate(json.createdOn)) {
        throw new Error("State createdOn property value of '" + json.createdOn + "' is not a Date.");
    }

    this.createdOn = json.createdOn;
    this._engine.setState(this._host.options.serializer, json.state);
};

WorkflowInstance.prototype.addTracker = function (tracker) {
    this._engine.addTracker(tracker);
};

module.exports = WorkflowInstance;
//# sourceMappingURL=workflowInstance.js.map
