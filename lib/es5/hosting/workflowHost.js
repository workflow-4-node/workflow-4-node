"use strict";

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var WorkflowRegistry = require("./workflowRegistry");
var _ = require("lodash");
var Activity = require("../activities/activity");
var Workflow = require("../activities/workflow");
var WorkflowPersistence = require("./workflowPersistence");
var WorkflowInstance = require("./workflowInstance");
var InstanceIdParser = require("./instanceIdParser");
var enums = require("../common/enums");
var Bluebird = require("bluebird");
var KnownInstaStore = require("./knownInstaStore");
var specStrings = require("../common/specStrings");
var errors = require("../common/errors");
var Serializer = require("backpack-node").system.Serializer;
var is = require("../common/is");
var KeepLockAlive = require("./keepLockAlive");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;
var WakeUp = require("./wakeUp");
var assert = require("assert");
var debug = require("debug")("wf4node:WorkflowHost");
var EventEmitter = require("events").EventEmitter;
var util = require("util");

function WorkflowHost(options) {
    EventEmitter.call(this);

    this._options = _.extend({
        enterLockTimeout: 10000,
        lockRenewalTimeout: 5000,
        alwaysLoadState: false,
        lazyPersistence: true,
        persistence: null,
        serializer: null,
        enablePromotions: false,
        wakeUpOptions: {
            interval: 5000,
            batchSize: 10
        }
    }, options);

    this._registry = new WorkflowRegistry(this._options.serializer);
    this._trackers = [];
    this._isInitialized = false;
    this._instanceIdParser = new InstanceIdParser();
    this._persistence = null;

    if (this._options.persistence !== null) {
        this._persistence = new WorkflowPersistence(this._options.persistence);
    }
    this._knownRunningInstances = new KnownInstaStore();
    this._wakeUp = null;
    this._shutdown = false;
}

util.inherits(WorkflowHost, EventEmitter);

WorkflowHost.events = enums.workflowEvents;

WorkflowHost.prototype.onWorkflowEvent = function (args) {
    this.emit(WorkflowHost.events.workflowEvent, args);
};

WorkflowHost.prototype.onWarn = function (error) {
    this.emit(WorkflowHost.events.warn, error);
};

WorkflowHost.prototype.onStart = function (instance, methodName, args) {
    this.emit(WorkflowHost.events.start, {
        instance: instance,
        methodName: methodName,
        args: args
    });
};

WorkflowHost.prototype.onInvoke = function (instance, methodName, args, result, idle, error) {
    this.emit(WorkflowHost.events.invoke, {
        instance: instance,
        methodName: methodName,
        args: args,
        idle: idle,
        error: error
    });
};

WorkflowHost.prototype.onEnd = function (instance, result, cancelled, error) {
    this.emit(WorkflowHost.events.end, {
        instance: instance,
        result: result,
        cancelled: cancelled,
        error: error
    });
};

Object.defineProperties(WorkflowHost.prototype, {
    options: {
        get: function get() {
            return this._options;
        }
    },
    isInitialized: {
        get: function get() {
            return this._isInitialized;
        }
    },
    instanceIdParser: {
        get: function get() {
            return this._instanceIdParser;
        }
    },
    persistence: {
        get: function get() {
            return this._persistence;
        }
    },
    _inLockTimeout: {
        get: function get() {
            return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
        }
    }
});

WorkflowHost.prototype.registerDeprecatedWorkflow = function (workflow) {
    return this.registerWorkflow(workflow, true);
};

WorkflowHost.prototype.registerWorkflow = function (workflow, deprecated) {
    this._verify();
    var desc = this._registry.register(workflow, deprecated);
    debug("Workflow registered. name: %s, version: %s", desc.name, desc.version);
    return desc.version;
};

WorkflowHost.prototype._initialize = function () {
    var self = this;
    if (!this._isInitialized) {
        if (this._options.wakeUpOptions && this._options.wakeUpOptions.interval > 0) {
            this._wakeUp = new WakeUp(this._knownRunningInstances, this._persistence, this._options.wakeUpOptions);
            this._wakeUp.on("continue", function (i) {
                self._continueWokeUpInstance(i);
            });
            this._wakeUp.on("error", function (e) {
                self.onWarn(e);
            });
            this._wakeUp.start();
        }

        this._isInitialized = true;
    }
};

WorkflowHost.prototype.stop = async(regeneratorRuntime.mark(function _callee(workflowName, instanceId) {
    var self, remove, lockName, lockInfo, keepLockAlive;
    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    self = this;

                    remove = function remove(instanceId) {
                        var knownInsta = self._knownRunningInstances.get(workflowName, instanceId);
                        if (knownInsta) {
                            debug("Removing instance: %s", instanceId);
                            self._deleteWFInstance(knownInsta);
                            self.onEnd(knownInsta, undefined, true);
                        }
                    };

                    debug("Stopping workflow '%s' with id: '%s'.", workflowName, instanceId);

                    _context.prev = 3;

                    if (!this._persistence) {
                        _context.next = 33;
                        break;
                    }

                    lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
                    lockInfo = undefined;

                    debug("Locking instance: %s", instanceId);
                    _context.next = 10;
                    return this._persistence.enterLock(lockName, this.options.enterLockTimeout, this._inLockTimeout);

                case 10:
                    lockInfo = _context.sent;
                    keepLockAlive = null;
                    _context.prev = 12;

                    debug("Locked: %j", lockInfo);
                    keepLockAlive = new KeepLockAlive(this._persistence, lockInfo, this._inLockTimeout, this.options.lockRenewalTimeout);

                    // Do stuff:
                    _context.next = 17;
                    return this._persistence.removeState(workflowName, instanceId, false, "STOPPED.");

                case 17:
                    remove(instanceId);

                    debug("Removed: %s", instanceId);
                    _context.next = 25;
                    break;

                case 21:
                    _context.prev = 21;
                    _context.t0 = _context["catch"](12);

                    debug("Error: %s", _context.t0.stack);
                    throw _context.t0;

                case 25:
                    _context.prev = 25;

                    // Unlock:
                    debug("Unlocking.");
                    if (keepLockAlive) {
                        keepLockAlive.end();
                    }
                    _context.next = 30;
                    return this._persistence.exitLock(lockInfo.id);

                case 30:
                    return _context.finish(25);

                case 31:
                    _context.next = 34;
                    break;

                case 33:
                    remove(instanceId);

                case 34:
                    _context.next = 40;
                    break;

                case 36:
                    _context.prev = 36;
                    _context.t1 = _context["catch"](3);

                    debug("Error: %s", _context.t1.stack);
                    throw new errors.WorkflowError("Cannot stop instance of workflow '" + workflowName + "' with id: '" + instanceId + "' because of an internal error:\n" + _context.t1.stack);

                case 40:
                case "end":
                    return _context.stop();
            }
        }
    }, _callee, this, [[3, 36], [12, 21, 25, 31]]);
}));

WorkflowHost.prototype.stopDeprecatedVersions = async(regeneratorRuntime.mark(function _callee2(workflowName) {
    var count, currentVersion, oldVersionHeaders, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, header;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    this._verify();
                    debug("Stopping outdated versions of workflow '%s'.", workflowName);

                    count = 0;
                    currentVersion = this._registry.getCurrentVersion(workflowName);

                    if (!currentVersion) {
                        _context2.next = 39;
                        break;
                    }

                    _context2.next = 7;
                    return this._getRunningInstanceHeadersForOtherVersion(workflowName, currentVersion);

                case 7:
                    oldVersionHeaders = _context2.sent;

                    if (!oldVersionHeaders.length) {
                        _context2.next = 37;
                        break;
                    }

                    debug("There is %d old version running. Stopping them.", oldVersionHeaders.length);
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context2.prev = 13;
                    _iterator = oldVersionHeaders[Symbol.iterator]();

                case 15:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context2.next = 23;
                        break;
                    }

                    header = _step.value;

                    debug("Stopping workflow '%s' of version '%s' with id: '%s'.", header.workflowName, header.workflowVersion, header.instanceId);
                    _context2.next = 20;
                    return this.stop(workflowName, header.instanceId);

                case 20:
                    _iteratorNormalCompletion = true;
                    _context2.next = 15;
                    break;

                case 23:
                    _context2.next = 29;
                    break;

                case 25:
                    _context2.prev = 25;
                    _context2.t0 = _context2["catch"](13);
                    _didIteratorError = true;
                    _iteratorError = _context2.t0;

                case 29:
                    _context2.prev = 29;
                    _context2.prev = 30;

                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }

                case 32:
                    _context2.prev = 32;

                    if (!_didIteratorError) {
                        _context2.next = 35;
                        break;
                    }

                    throw _iteratorError;

                case 35:
                    return _context2.finish(32);

                case 36:
                    return _context2.finish(29);

                case 37:
                    _context2.next = 40;
                    break;

                case 39:
                    debug("There is no workflow registered by name '%s'.", workflowName);

                case 40:
                    return _context2.abrupt("return", count);

                case 41:
                case "end":
                    return _context2.stop();
            }
        }
    }, _callee2, this, [[13, 25, 29, 37], [30,, 32, 36]]);
}));

WorkflowHost.prototype.invokeMethod = async(regeneratorRuntime.mark(function _callee3(workflowName, methodName, args) {
    var self, instanceId, creatable, results, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, info, tryId, i, result, ir, cr;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    this._verify();
                    debug("Invoking method: '%s' of workflow: '%s' by arguments '%j'", workflowName, methodName, args);

                    if (_(workflowName).isString()) {
                        _context3.next = 4;
                        break;
                    }

                    throw new TypeError("Argument 'workflowName' is not a string.");

                case 4:
                    workflowName = workflowName.trim();

                    if (_(methodName).isString()) {
                        _context3.next = 7;
                        break;
                    }

                    throw new TypeError("Argument 'methodName' is not a string.");

                case 7:
                    methodName = methodName.trim();

                    if (!_.isUndefined(args) && !_.isArray(args)) {
                        args = [args];
                    }

                    self = this;

                    self._initialize();

                    instanceId = null;
                    creatable = null;
                    results = [];
                    _iteratorNormalCompletion2 = true;
                    _didIteratorError2 = false;
                    _iteratorError2 = undefined;
                    _context3.prev = 17;

                    for (_iterator2 = self._registry.methodInfos(workflowName, methodName)[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        info = _step2.value;
                        tryId = self._instanceIdParser.parse(info.instanceIdPath, args);

                        if (!_.isUndefined(tryId)) {
                            results.push({
                                info: info,
                                id: tryId
                            });
                        }
                    }
                    _context3.next = 25;
                    break;

                case 21:
                    _context3.prev = 21;
                    _context3.t0 = _context3["catch"](17);
                    _didIteratorError2 = true;
                    _iteratorError2 = _context3.t0;

                case 25:
                    _context3.prev = 25;
                    _context3.prev = 26;

                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }

                case 28:
                    _context3.prev = 28;

                    if (!_didIteratorError2) {
                        _context3.next = 31;
                        break;
                    }

                    throw _iteratorError2;

                case 31:
                    return _context3.finish(28);

                case 32:
                    return _context3.finish(25);

                case 33:
                    if (process.env.NODE_ENV !== "production") {
                        debug("Possible methods: %j", _(results).map(function (r) {
                            return {
                                workflow: {
                                    name: r.info.execContext.rootActivity.name,
                                    version: r.info.version
                                },
                                id: r.id
                            };
                        }).toArray());
                    }

                    i = 0;

                case 35:
                    if (!(i < results.length)) {
                        _context3.next = 49;
                        break;
                    }

                    result = results[i];
                    // That finds the latest version:
                    if (result.info.canCreateInstance && !result.info.deprecated) {
                        creatable = result.info;
                    }
                    // That finds a running instance with the id:
                    _context3.t1 = _.isNull(instanceId);

                    if (!_context3.t1) {
                        _context3.next = 43;
                        break;
                    }

                    _context3.next = 42;
                    return self._checkIfInstanceRunning(workflowName, result.id);

                case 42:
                    _context3.t1 = _context3.sent;

                case 43:
                    if (!_context3.t1) {
                        _context3.next = 46;
                        break;
                    }

                    instanceId = result.id;
                    return _context3.abrupt("break", 49);

                case 46:
                    i++;
                    _context3.next = 35;
                    break;

                case 49:
                    if (!instanceId) {
                        _context3.next = 65;
                        break;
                    }

                    debug("Found a continuable instance id: %s. Invoking method on that.", instanceId);
                    _context3.prev = 51;
                    _context3.next = 54;
                    return self._invokeMethodOnRunningInstance(instanceId, workflowName, methodName, args);

                case 54:
                    ir = _context3.sent;

                    debug("Invoke completed, result: %j", ir);
                    return _context3.abrupt("return", ir);

                case 59:
                    _context3.prev = 59;
                    _context3.t2 = _context3["catch"](51);

                    debug("Invoke failed: %s", _context3.t2.stack);
                    throw _context3.t2;

                case 63:
                    _context3.next = 83;
                    break;

                case 65:
                    if (!creatable) {
                        _context3.next = 81;
                        break;
                    }

                    debug("Found a creatable workflow (name: '%s', version: '%s'), invoking a create method on that.", creatable.execContext.rootActivity.name, creatable.version);
                    _context3.prev = 67;
                    _context3.next = 70;
                    return self._createInstanceAndInvokeMethod(creatable.execContext, creatable.version, methodName, args);

                case 70:
                    cr = _context3.sent;

                    debug("Create completed, result: %j", cr);
                    return _context3.abrupt("return", cr);

                case 75:
                    _context3.prev = 75;
                    _context3.t3 = _context3["catch"](67);

                    debug("Create failed: %s", _context3.t3.stack);
                    throw _context3.t3;

                case 79:
                    _context3.next = 83;
                    break;

                case 81:
                    debug("No continuable workflows have been found.");
                    throw new errors.MethodNotFoundError("Cannot create or continue workflow '" + workflowName + "' by calling method '" + methodName + "'.");

                case 83:
                case "end":
                    return _context3.stop();
            }
        }
    }, _callee3, this, [[17, 21, 25, 33], [26,, 28, 32], [51, 59], [67, 75]]);
}));

WorkflowHost.prototype._createInstanceAndInvokeMethod = async(regeneratorRuntime.mark(function _callee4(execContext, workflowVersion, methodName, args) {
    var workflowName, lockInfo, insta, _result, _keepLockAlive, _result2, err;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    workflowName = execContext.rootActivity.name;
                    lockInfo = null;

                    if (this._persistence) {
                        _context4.next = 12;
                        break;
                    }

                    insta = this._createWFInstance();
                    _context4.next = 6;
                    return insta.create(execContext, workflowVersion, methodName, args, lockInfo);

                case 6:
                    _result = _context4.sent;

                    this._knownRunningInstances.add(workflowName, insta);
                    this.onStart(insta, methodName, args);
                    return _context4.abrupt("return", _result);

                case 12:
                    lockInfo = {
                        id: null,
                        name: null,
                        heldTo: null
                    };
                    // When lock will held, then we should keep it alive:
                    _keepLockAlive = new KeepLockAlive(this._persistence, lockInfo, this._inLockTimeout, this.options.lockRenewalTimeout);
                    _context4.prev = 14;
                    insta = this._createWFInstance();
                    _context4.next = 18;
                    return insta.create(execContext, workflowVersion, methodName, args, lockInfo);

                case 18:
                    _result2 = _context4.sent;

                    if (!(insta.execState === enums.activityStates.idle)) {
                        _context4.next = 47;
                        break;
                    }

                    this._knownRunningInstances.add(workflowName, insta);

                    // Persist and unlock:
                    err = null;
                    _context4.prev = 22;
                    _context4.next = 25;
                    return this._persistence.persistState(insta);

                case 25:
                    this.onStart(insta, methodName, args);
                    _context4.next = 33;
                    break;

                case 28:
                    _context4.prev = 28;
                    _context4.t0 = _context4["catch"](22);

                    debug("Cannot persist instance of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + _context4.t0.stack);
                    this._knownRunningInstances.remove(workflowName, insta.id);
                    err = _context4.t0;

                case 33:
                    _context4.prev = 33;
                    _context4.next = 36;
                    return this._persistence.exitLock(lockInfo.id);

                case 36:
                    _context4.next = 42;
                    break;

                case 38:
                    _context4.prev = 38;
                    _context4.t1 = _context4["catch"](33);

                    debug("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + _context4.t1.stack);
                    this.onWarn(_context4.t1);

                case 42:
                    if (!err) {
                        _context4.next = 44;
                        break;
                    }

                    throw err;

                case 44:
                    return _context4.abrupt("return", _result2);

                case 47:
                    return _context4.abrupt("return", _result2);

                case 48:
                    _context4.prev = 48;

                    _keepLockAlive.end();
                    return _context4.finish(48);

                case 51:
                case "end":
                    return _context4.stop();
            }
        }
    }, _callee4, this, [[14,, 48, 51], [22, 28], [33, 38]]);
}));

WorkflowHost.prototype._throwIfRecoverable = function (error, workflowName, methodName) {
    if (error instanceof errors.MethodIsNotAccessibleError) {
        debug("Method '%s' of workflow '%s' is not accessible at the current state, bacause it might be stepped on another instance to another state tha is exists at current in this host. Client should retry.", methodName, workflowName);
        throw error;
    }
};

WorkflowHost.prototype._invokeMethodOnRunningInstance = async(regeneratorRuntime.mark(function _callee9(instanceId, workflowName, methodName, args) {
    var _this = this;

    var self, _insta, _result3, _ret;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
            switch (_context9.prev = _context9.next) {
                case 0:
                    self = this;

                    if (self._persistence) {
                        _context9.next = 33;
                        break;
                    }

                    _context9.next = 4;
                    return self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args);

                case 4:
                    _insta = _context9.sent;
                    _context9.prev = 5;
                    _context9.next = 8;
                    return _insta.callMethod(methodName, args);

                case 8:
                    _result3 = _context9.sent;

                    if (!(_insta.execState === enums.activityStates.idle)) {
                        _context9.next = 14;
                        break;
                    }

                    this.onInvoke(_insta, methodName, args, _result3, true, null);
                    return _context9.abrupt("return", _result3);

                case 14:
                    if (!(_insta.execState === enums.activityStates.complete)) {
                        _context9.next = 21;
                        break;
                    }

                    self._deleteWFInstance(_insta);
                    this.onInvoke(_insta, methodName, args, _result3, false, null);
                    this.onEnd(_insta, _result3, false, null);
                    return _context9.abrupt("return", _result3);

                case 21:
                    throw new errors.WorkflowError("Instance '" + _insta.id + "' is in an invalid state '" + _insta.execState + "' after invocation of the method '" + methodName + "'.");

                case 22:
                    _context9.next = 31;
                    break;

                case 24:
                    _context9.prev = 24;
                    _context9.t0 = _context9["catch"](5);

                    this._throwIfRecoverable(_context9.t0, workflowName, methodName);
                    self._deleteWFInstance(_insta);
                    this.onInvoke(_insta, methodName, args, undefined, false, _context9.t0);
                    this.onEnd(_insta, undefined, false, _context9.t0);
                    throw _context9.t0;

                case 31:
                    _context9.next = 37;
                    break;

                case 33:
                    return _context9.delegateYield(regeneratorRuntime.mark(function _callee8() {
                        var lockName, lockInfo, keepLockAlive, _ret2, msg;

                        return regeneratorRuntime.wrap(function _callee8$(_context8) {
                            while (1) {
                                switch (_context8.prev = _context8.next) {
                                    case 0:
                                        // Lock it:
                                        lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
                                        lockInfo = undefined;
                                        keepLockAlive = null;
                                        _context8.prev = 3;
                                        return _context8.delegateYield(regeneratorRuntime.mark(function _callee7() {
                                            var insta, endWithError, _ret3;

                                            return regeneratorRuntime.wrap(function _callee7$(_context7) {
                                                while (1) {
                                                    switch (_context7.prev = _context7.next) {
                                                        case 0:
                                                            debug("Locking instance.");
                                                            _context7.next = 3;
                                                            return self._persistence.enterLock(lockName, self.options.enterLockTimeout, self._inLockTimeout);

                                                        case 3:
                                                            lockInfo = _context7.sent;

                                                            debug("Locked: %j", lockInfo);

                                                            // When lock will held, then we should keep it alive:
                                                            keepLockAlive = new KeepLockAlive(self._persistence, lockInfo, self._inLockTimeout, self.options.lockRenewalTimeout);

                                                            // LOCKED
                                                            _context7.next = 8;
                                                            return self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args);

                                                        case 8:
                                                            insta = _context7.sent;
                                                            endWithError = async(regeneratorRuntime.mark(function _callee5(e) {
                                                                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                                                                    while (1) {
                                                                        switch (_context5.prev = _context5.next) {
                                                                            case 0:
                                                                                self._deleteWFInstance(insta);
                                                                                _context5.prev = 1;
                                                                                _context5.next = 4;
                                                                                return self._persistence.removeState(workflowName, insta.id, false, e);

                                                                            case 4:
                                                                                _context5.next = 10;
                                                                                break;

                                                                            case 6:
                                                                                _context5.prev = 6;
                                                                                _context5.t0 = _context5["catch"](1);

                                                                                debug("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + _context5.t0.stack);
                                                                                self.onWarn(_context5.t0);

                                                                            case 10:
                                                                                self.onInvoke(insta, methodName, args, undefined, false, e);
                                                                                self.onEnd(insta, undefined, false, e);

                                                                            case 12:
                                                                            case "end":
                                                                                return _context5.stop();
                                                                        }
                                                                    }
                                                                }, _callee5, this, [[1, 6]]);
                                                            }));
                                                            _context7.prev = 10;
                                                            return _context7.delegateYield(regeneratorRuntime.mark(function _callee6() {
                                                                var persistAndUnlock, result;
                                                                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                                                                    while (1) {
                                                                        switch (_context6.prev = _context6.next) {
                                                                            case 0:
                                                                                persistAndUnlock = function persistAndUnlock() {
                                                                                    return self._persistence.persistState(insta).finally(function () {
                                                                                        debug("Unlocking: %j", lockInfo);
                                                                                        return self._persistence.exitLock(lockInfo.id).then(function () {
                                                                                            debug("Unlocked.");
                                                                                        }, function (e) {
                                                                                            debug("Cannot exit lock for workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
                                                                                            self.onWarn(e);
                                                                                        }).finally(function () {
                                                                                            keepLockAlive.end();
                                                                                        });
                                                                                    });
                                                                                };

                                                                                _context6.next = 3;
                                                                                return insta.callMethod(methodName, args);

                                                                            case 3:
                                                                                result = _context6.sent;

                                                                                if (!(insta.execState === enums.activityStates.idle)) {
                                                                                    _context6.next = 15;
                                                                                    break;
                                                                                }

                                                                                if (!self.options.lazyPersistence) {
                                                                                    _context6.next = 9;
                                                                                    break;
                                                                                }

                                                                                setImmediate(function () {
                                                                                    persistAndUnlock().then(function () {
                                                                                        self.onInvoke(insta, methodName, args, result, true, null);
                                                                                    }, function (e) {
                                                                                        endWithError(e);
                                                                                    });
                                                                                });
                                                                                _context6.next = 12;
                                                                                break;

                                                                            case 9:
                                                                                _context6.next = 11;
                                                                                return persistAndUnlock();

                                                                            case 11:
                                                                                _this.onInvoke(insta, methodName, args, result, true, null);

                                                                            case 12:
                                                                                return _context6.abrupt("return", {
                                                                                    v: {
                                                                                        v: {
                                                                                            v: result
                                                                                        }
                                                                                    }
                                                                                });

                                                                            case 15:
                                                                                if (!(insta.execState === enums.activityStates.complete)) {
                                                                                    _context6.next = 44;
                                                                                    break;
                                                                                }

                                                                                self._deleteWFInstance(insta);
                                                                                _this.onInvoke(insta, methodName, args, result, false, null);
                                                                                _this.onEnd(insta, result, false, null);
                                                                                _context6.prev = 19;
                                                                                _context6.prev = 20;
                                                                                _context6.next = 23;
                                                                                return self._persistence.removeState(workflowName, insta.id, true);

                                                                            case 23:
                                                                                _context6.next = 29;
                                                                                break;

                                                                            case 25:
                                                                                _context6.prev = 25;
                                                                                _context6.t0 = _context6["catch"](20);

                                                                                debug("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + _context6.t0.stack);
                                                                                _this.onWarn(_context6.t0);

                                                                            case 29:
                                                                                _context6.prev = 29;
                                                                                _context6.next = 32;
                                                                                return self._persistence.exitLock(lockInfo.id);

                                                                            case 32:
                                                                                _context6.next = 38;
                                                                                break;

                                                                            case 34:
                                                                                _context6.prev = 34;
                                                                                _context6.t1 = _context6["catch"](29);

                                                                                debug("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + _context6.t1.stack);
                                                                                _this.onWarn(_context6.t1);

                                                                            case 38:
                                                                                _context6.prev = 38;

                                                                                keepLockAlive.end();
                                                                                return _context6.finish(38);

                                                                            case 41:
                                                                                return _context6.abrupt("return", {
                                                                                    v: {
                                                                                        v: {
                                                                                            v: result
                                                                                        }
                                                                                    }
                                                                                });

                                                                            case 44:
                                                                                throw new errors.WorkflowError("Instance '" + insta.id + "' is in an invalid state '" + insta.execState + "' after invocation of the method '" + methodName + "'.");

                                                                            case 45:
                                                                            case "end":
                                                                                return _context6.stop();
                                                                        }
                                                                    }
                                                                }, _callee6, _this, [[19,, 38, 41], [20, 25], [29, 34]]);
                                                            })(), "t0", 12);

                                                        case 12:
                                                            _ret3 = _context7.t0;

                                                            if (!((typeof _ret3 === "undefined" ? "undefined" : _typeof(_ret3)) === "object")) {
                                                                _context7.next = 15;
                                                                break;
                                                            }

                                                            return _context7.abrupt("return", _ret3.v);

                                                        case 15:
                                                            _context7.next = 23;
                                                            break;

                                                        case 17:
                                                            _context7.prev = 17;
                                                            _context7.t1 = _context7["catch"](10);

                                                            _this._throwIfRecoverable(_context7.t1, workflowName, methodName);
                                                            _context7.next = 22;
                                                            return endWithError(_context7.t1);

                                                        case 22:
                                                            throw _context7.t1;

                                                        case 23:
                                                        case "end":
                                                            return _context7.stop();
                                                    }
                                                }
                                            }, _callee7, _this, [[10, 17]]);
                                        })(), "t0", 5);

                                    case 5:
                                        _ret2 = _context8.t0;

                                        if (!((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object")) {
                                            _context8.next = 8;
                                            break;
                                        }

                                        return _context8.abrupt("return", _ret2.v);

                                    case 8:
                                        _context8.next = 28;
                                        break;

                                    case 10:
                                        _context8.prev = 10;
                                        _context8.t1 = _context8["catch"](3);

                                        if (keepLockAlive) {
                                            keepLockAlive.end();
                                        }

                                        if (!lockInfo) {
                                            _context8.next = 23;
                                            break;
                                        }

                                        _context8.prev = 14;
                                        _context8.next = 17;
                                        return self._persistence.exitLock(lockInfo.id);

                                    case 17:
                                        _context8.next = 23;
                                        break;

                                    case 19:
                                        _context8.prev = 19;
                                        _context8.t2 = _context8["catch"](14);

                                        debug("Cannot exit lock '" + lockInfo.id + "':\n" + _context8.t2.stack);
                                        _this.onWarn(_context8.t2);

                                    case 23:
                                        if (!(_context8.t1 instanceof errors.TimeoutError)) {
                                            _context8.next = 27;
                                            break;
                                        }

                                        msg = "Cannot call method of workflow '" + workflowName + "', because '" + methodName + "' is locked.";

                                        debug(msg);
                                        throw new errors.MethodIsNotAccessibleError(msg);

                                    case 27:
                                        throw _context8.t1;

                                    case 28:
                                    case "end":
                                        return _context8.stop();
                                }
                            }
                        }, _callee8, _this, [[3, 10], [14, 19]]);
                    })(), "t1", 34);

                case 34:
                    _ret = _context9.t1;

                    if (!((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object")) {
                        _context9.next = 37;
                        break;
                    }

                    return _context9.abrupt("return", _ret.v);

                case 37:
                case "end":
                    return _context9.stop();
            }
        }
    }, _callee9, this, [[5, 24]]);
}));

WorkflowHost.prototype._enterLockForCreatedInstance = async(regeneratorRuntime.mark(function _callee10(insta, lockInfo) {
    var li;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
            switch (_context10.prev = _context10.next) {
                case 0:
                    _context10.next = 2;
                    return this._persistence.enterLock(specStrings.hosting.doubleKeys(insta.workflowName, insta.id), this.options.enterLockTimeout, this._getInLockTimeout());

                case 2:
                    li = _context10.sent;
                    _context10.next = 5;
                    return this._persistence.isRunning(insta.workflowName, insta.id);

                case 5:
                    if (!_context10.sent) {
                        _context10.next = 7;
                        break;
                    }

                    throw new errors.WorkflowError("Cannot create instance of workflow '" + insta.workflowName + "' by id '" + insta.id + "' because it's already exists.");

                case 7:
                    lockInfo.id = li.id;
                    lockInfo.name = li.name;
                    lockInfo.heldTo = li.heldTo;

                case 10:
                case "end":
                    return _context10.stop();
            }
        }
    }, _callee10, this);
}));

WorkflowHost.prototype._getInLockTimeout = function () {
    return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
};

WorkflowHost.prototype._verifyAndRestoreInstanceState = async(regeneratorRuntime.mark(function _callee11(instanceId, workflowName, methodName, args) {
    var self, insta, _header;

    return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
            switch (_context11.prev = _context11.next) {
                case 0:
                    self = this;
                    insta = null;

                    if (!self._persistence) {
                        _context11.next = 12;
                        break;
                    }

                    _context11.next = 5;
                    return self._persistence.getRunningInstanceIdHeader(workflowName, instanceId);

                case 5:
                    _header = _context11.sent;

                    if (!_header) {
                        _context11.next = 10;
                        break;
                    }

                    _context11.next = 9;
                    return self._restoreInstanceState(instanceId, workflowName, _header.workflowVersion, _header.updatedOn);

                case 9:
                    insta = _context11.sent;

                case 10:
                    _context11.next = 13;
                    break;

                case 12:
                    insta = self._knownRunningInstances.get(workflowName, instanceId);

                case 13:
                    if (insta) {
                        _context11.next = 15;
                        break;
                    }

                    throw new errors.WorkflowNotFoundError("Worflow (name: '" + workflowName + "', id: '" + instanceId + "') has been deleted since the lock has been taken.");

                case 15:
                    return _context11.abrupt("return", insta);

                case 16:
                case "end":
                    return _context11.stop();
            }
        }
    }, _callee11, this);
}));

WorkflowHost.prototype._restoreInstanceState = async(regeneratorRuntime.mark(function _callee12(instanceId, workflowName, workflowVersion, actualTimestamp) {
    var self, insta, wfDesc, state;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
            switch (_context12.prev = _context12.next) {
                case 0:
                    self = this;

                    if (self._persistence) {
                        _context12.next = 3;
                        break;
                    }

                    throw new Error("Cannot restore instance from persistence, because host has no persistence registered.");

                case 3:
                    insta = self._knownRunningInstances.get(workflowName, instanceId);

                    if (_.isUndefined(insta)) {
                        wfDesc = self._registry.getDesc(workflowName, workflowVersion);

                        insta = self._createWFInstance();
                        insta.setWorkflow(wfDesc.execContext, workflowVersion, instanceId);
                    }

                    if (!(insta.updatedOn === null || insta.updatedOn.getTime() !== actualTimestamp.getTime() || self.options.alwaysLoadState)) {
                        _context12.next = 13;
                        break;
                    }

                    _context12.next = 8;
                    return self._persistence.loadState(workflowName, instanceId);

                case 8:
                    state = _context12.sent;

                    insta.restoreState(state);
                    return _context12.abrupt("return", insta);

                case 13:
                    return _context12.abrupt("return", insta);

                case 14:
                case "end":
                    return _context12.stop();
            }
        }
    }, _callee12, this);
}));

WorkflowHost.prototype._checkIfInstanceRunning = async(regeneratorRuntime.mark(function _callee13(workflowName, instanceId) {
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
            switch (_context13.prev = _context13.next) {
                case 0:
                    if (!this._persistence) {
                        _context13.next = 4;
                        break;
                    }

                    _context13.next = 3;
                    return this._persistence.isRunning(workflowName, instanceId);

                case 3:
                    return _context13.abrupt("return", _context13.sent);

                case 4:
                    return _context13.abrupt("return", this._knownRunningInstances.exists(workflowName, instanceId));

                case 5:
                case "end":
                    return _context13.stop();
            }
        }
    }, _callee13, this);
}));

WorkflowHost.prototype._getRunningInstanceHeadersForOtherVersion = async(regeneratorRuntime.mark(function _callee14(workflowName, version) {
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
            switch (_context14.prev = _context14.next) {
                case 0:
                    if (!this._persistence) {
                        _context14.next = 4;
                        break;
                    }

                    _context14.next = 3;
                    return this._persistence.getRunningInstanceHeadersForOtherVersion(workflowName, version);

                case 3:
                    return _context14.abrupt("return", _context14.sent);

                case 4:
                    return _context14.abrupt("return", this._knownRunningInstances.getRunningInstanceHeadersForOtherVersion(workflowName, version));

                case 5:
                case "end":
                    return _context14.stop();
            }
        }
    }, _callee14, this);
}));

WorkflowHost.prototype.addTracker = function (tracker) {
    this._verify();

    if (!_.isObject(tracker)) {
        throw new TypeError("Argument is not an object.");
    }
    this._trackers.push(tracker);
    this._knownRunningInstances.addTracker(tracker);
};

/* Wake Up*/

WorkflowHost.prototype._continueWokeUpInstance = async(regeneratorRuntime.mark(function _callee15(wakeupable) {
    var _result4;

    return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
            switch (_context15.prev = _context15.next) {
                case 0:
                    if (!this._shutdown) {
                        _context15.next = 3;
                        break;
                    }

                    wakeupable.result.resolve();
                    return _context15.abrupt("return");

                case 3:
                    if (this._persistence) {
                        _context15.next = 6;
                        break;
                    }

                    wakeupable.result.reject(new errors.WorkflowError("Handling Delays in host is not supported without persistence."));
                    return _context15.abrupt("return");

                case 6:

                    assert(_.isPlainObject(wakeupable));
                    assert(_.isString(wakeupable.instanceId));
                    assert(_.isString(wakeupable.workflowName));
                    assert(_.isPlainObject(wakeupable.activeDelay));
                    assert(_.isString(wakeupable.activeDelay.methodName));
                    assert(_.isDate(wakeupable.activeDelay.delayTo));
                    assert(_.isFunction(wakeupable.result.resolve));
                    assert(_.isFunction(wakeupable.result.reject));

                    _context15.prev = 14;

                    //instanceId, workflowName, methodName, args
                    debug("Invoking DelayTo instanceId: %s, workflowName:%s, methodName: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
                    _context15.next = 18;
                    return this._invokeMethodOnRunningInstance(wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, [wakeupable.instanceId, wakeupable.activeDelay.delayTo]);

                case 18:
                    _result4 = _context15.sent;

                    debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s invoked.", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
                    wakeupable.result.resolve();
                    _context15.next = 31;
                    break;

                case 23:
                    _context15.prev = 23;
                    _context15.t0 = _context15["catch"](14);

                    if (!(_context15.t0 instanceof errors.MethodIsNotAccessibleError || _context15.t0 instanceof errors.WorkflowNotFoundError)) {
                        _context15.next = 29;
                        break;
                    }

                    debug("DelayTo's method is not accessible since it got selected for continuation.");
                    wakeupable.result.resolve();
                    return _context15.abrupt("return");

                case 29:
                    debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s error: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, _context15.t0.stack);
                    wakeupable.result.reject(_context15.t0);

                case 31:
                case "end":
                    return _context15.stop();
            }
        }
    }, _callee15, this, [[14, 23]]);
}));

WorkflowHost.prototype._createWFInstance = function () {
    var self = this;
    var insta = new WorkflowInstance(this);
    insta.on(enums.events.workflowEvent, function (args) {
        self.onWorkflowEvent(args);
    });
    return insta;
};

WorkflowHost.prototype._deleteWFInstance = function (insta) {
    insta.removeAllListeners();
    this._knownRunningInstances.remove(insta.workflowName, insta.id);
};

/* Shutdown */

WorkflowHost.prototype._verify = function () {
    if (this._shutdown) {
        throw new errors.WorkflowError("Workflow host has been shut down.");
    }
};

WorkflowHost.prototype.shutdown = function () {
    if (this._shutdown) {
        return;
    }
    if (this._wakeUp) {
        this._wakeUp.stop();
    }
    this._shutdown = true;
    this.removeAllListeners();
};

module.exports = WorkflowHost;
//# sourceMappingURL=workflowHost.js.map
