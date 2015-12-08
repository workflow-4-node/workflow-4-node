"use strict";

var Activity = require("./activity");
var ActivityExecutionContext = require("./activityExecutionContext");
var ActivityExecutionState = require("./activityExecutionState");
var CallContext = require("./callContext");
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var errors = require("../common/errors");
var _ = require("lodash");
var ActivityStateTracker = require("./activityStateTracker");
var enums = require("../common/enums");
var Bluebird = require("bluebird");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;
var activityMarkup = require("./activityMarkup");

function ActivityExecutionEngine(contextOrActivity, instance) {
    EventEmitter.call(this);

    if (contextOrActivity instanceof Activity) {
        this.rootActivity = contextOrActivity;
        this.context = new ActivityExecutionContext(this);
        this._isInitialized = false;
    } else if (contextOrActivity instanceof ActivityExecutionContext) {
        this.rootActivity = contextOrActivity.rootActivity;
        this.context = contextOrActivity;
        this.context.engine = this;
        this._isInitialized = true;
    } else if (_.isPlainObject(contextOrActivity)) {
        this.rootActivity = activityMarkup.parse(contextOrActivity);
        this.context = new ActivityExecutionContext(this);
        this._isInitialized = false;
    } else {
        throw new TypeError("Argument 'contextOrActivity' is not an activity, context or a markup.");
    }

    this._rootState = null;
    this._trackers = [];
    this._hookContext();
    this.updatedOn = null;
    this.instance = instance || null;
}

util.inherits(ActivityExecutionEngine, EventEmitter);

Object.defineProperties(ActivityExecutionEngine.prototype, {
    execState: {
        get: function get() {
            if (this._rootState) {
                return this._rootState.execState;
            } else {
                return null;
            }
        }
    },
    version: {
        get: function get() {
            return this.rootActivity.version;
        }
    }
});

ActivityExecutionEngine.prototype._idle = {
    toString: function toString() {
        return enums.activityStates.idle;
    }
};

ActivityExecutionEngine.prototype.isIdle = function (result) {
    return result === this._idle;
};

ActivityExecutionEngine.prototype._initialize = function () {
    if (!this._isInitialized) {
        this.context.initialize(this.rootActivity);
        this._isInitialized = true;
    }
};

ActivityExecutionEngine.prototype._setRootState = function (state) {
    var self = this;
    if (!self._rootState) {
        self._rootState = state;
        self._rootState.on(Activity.states.cancel, function (args) {
            self.emit(Activity.states.cancel, args);
        });
        self._rootState.on(Activity.states.complete, function (args) {
            self.emit(Activity.states.complete, args);
        });
        self._rootState.on(Activity.states.end, function (args) {
            self.updatedOn = new Date();
            self.emit(Activity.states.end, args);
        });
        self._rootState.on(Activity.states.fail, function (args) {
            self.emit(Activity.states.fail, args);
        });
        self._rootState.on(Activity.states.run, function (args) {
            self.emit(Activity.states.run, args);
        });
        self._rootState.on(Activity.states.idle, function (args) {
            self.emit(Activity.states.idle, args);
        });
    }
};

ActivityExecutionEngine.prototype._hookContext = function () {
    var self = this;
    self.context.on(Activity.states.run, function (args) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = self._trackers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var t = _step.value;

                t.activityStateChanged(args);
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
    });
    self.context.on(Activity.states.end, function (args) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = self._trackers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var t = _step2.value;

                t.activityStateChanged(args);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    });
    self.context.on(enums.events.workflowEvent, function (args) {
        self.emit(enums.events.workflowEvent, args);
    });
};

ActivityExecutionEngine.prototype.addTracker = function (tracker) {
    if (!_.isObject(tracker)) {
        throw new TypeError("Parameter is not an object.");
    }
    this._trackers.push(new ActivityStateTracker(tracker));
};

ActivityExecutionEngine.prototype.removeTracker = function (tracker) {
    var idx = -1;
    for (var i = 0; i < this._trackers.length; i++) {
        var t = this._trackers[i];
        if (t._impl === tracker) {
            idx = i;
            break;
        }
    }
    if (idx !== -1) {
        this._trackers.splice(idx, 1);
    }
};

ActivityExecutionEngine.prototype.start = async(regeneratorRuntime.mark(function _callee() {
    var args,
        _iteratorNormalCompletion3,
        _didIteratorError3,
        _iteratorError3,
        _iterator3,
        _step3,
        a,
        _args = arguments;

    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    this._verifyNotStarted();

                    this._initialize();

                    args = [new CallContext(this.context)];
                    _iteratorNormalCompletion3 = true;
                    _didIteratorError3 = false;
                    _iteratorError3 = undefined;
                    _context.prev = 6;

                    for (_iterator3 = _args[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        a = _step3.value;

                        args.push(a);
                    }

                    _context.next = 14;
                    break;

                case 10:
                    _context.prev = 10;
                    _context.t0 = _context["catch"](6);
                    _didIteratorError3 = true;
                    _iteratorError3 = _context.t0;

                case 14:
                    _context.prev = 14;
                    _context.prev = 15;

                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }

                case 17:
                    _context.prev = 17;

                    if (!_didIteratorError3) {
                        _context.next = 20;
                        break;
                    }

                    throw _iteratorError3;

                case 20:
                    return _context.finish(17);

                case 21:
                    return _context.finish(14);

                case 22:
                    _context.t1 = this;
                    _context.next = 25;
                    return this.rootActivity.start.apply(this.rootActivity, args);

                case 25:
                    _context.t2 = _context.sent;

                    _context.t1._setRootState.call(_context.t1, _context.t2);

                case 27:
                case "end":
                    return _context.stop();
            }
        }
    }, _callee, this, [[6, 10, 14, 22], [15,, 17, 21]]);
}));

ActivityExecutionEngine.prototype.invoke = function () {
    var self = this;

    self._verifyNotStarted();

    self._initialize();

    var args = [];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = arguments[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _a = _step4.value;

            args.push(_a);
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    args.unshift(new CallContext(self.context));

    return new Bluebird(function (resolve, reject) {
        try {
            self._setRootState(self.context.getExecutionState(self.rootActivity));
            self.once(Activity.states.end, function (eArgs) {
                var reason = eArgs.reason;
                var result = eArgs.result;
                switch (reason) {
                    case Activity.states.complete:
                        resolve(result);
                        break;
                    case Activity.states.cancel:
                        reject(new errors.Cancelled());
                        break;
                    case Activity.states.idle:
                        resolve(self._idle);
                        break;
                    default:
                        result = result || new errors.ActivityRuntimeError("Unknown error.");
                        reject(result);
                        break;
                }
            });

            self.rootActivity.start.apply(self.rootActivity, args);
        } catch (e) {
            reject(e);
        }
    });
};

ActivityExecutionEngine.prototype._verifyNotStarted = function () {
    if (!(!this.execState || this.execState === enums.activityStates.complete)) {
        throw new errors.ActivityStateExceptionError("Workflow has been already started.");
    }
};

ActivityExecutionEngine.prototype.resumeBookmark = function (name, reason, result) {
    var self = this;
    self._initialize();
    return new Bluebird(function (resolve, reject) {
        try {
            self._setRootState(self.context.getExecutionState(self.rootActivity));

            if (self.execState === enums.activityStates.idle) {
                (function () {
                    var bmTimestamp = self.context.getBookmarkTimestamp(name);
                    self.once(Activity.states.end, function (args) {
                        var _reason = args.reason;
                        var _result = args.result;
                        try {
                            if (_reason === enums.activityStates.complete || _reason === enums.activityStates.idle) {
                                var endBmTimestamp = self.context.getBookmarkTimestamp(name);
                                if (endBmTimestamp && endBmTimestamp === bmTimestamp) {
                                    if (_reason === enums.activityStates.complete) {
                                        reject(new errors.ActivityRuntimeError("Workflow has been completed before bookmark '" + name + "' reached."));
                                    } else {
                                        reject(new errors.Idle("Workflow has been gone to idle before bookmark '" + name + "' reached."));
                                    }
                                } else {
                                    resolve();
                                }
                            } else if (_reason === enums.activityStates.cancel) {
                                reject(new errors.ActivityRuntimeError("Workflow has been cancelled before bookmark '" + name + "' reached."));
                            } else if (_reason === enums.activityStates.fail) {
                                reject(_result);
                            }
                        } catch (e) {
                            reject(e);
                        }
                    });
                    self.context.resumeBookmarkExternal(name, reason, result);
                })();
            } else {
                reject(new errors.ActivityRuntimeError("Cannot resume bookmark, while the workflow is not in the idle state."));
            }
        } catch (e) {
            reject(e);
        }
    });
};

/* SERIALIZATION */
ActivityExecutionEngine.prototype.getStateAndPromotions = function (serializer, enablePromotions) {
    if (serializer && !_.isObject(serializer)) {
        throw new Error("Argument 'serializer' is not an object.");
    }

    this._initialize();
    return this.context.getStateAndPromotions(serializer, enablePromotions);
};

ActivityExecutionEngine.prototype.setState = function (serializer, json) {
    if (serializer && !_.isObject(serializer)) {
        throw new Error("Argument 'serializer' is not an object.");
    }
    if (!_.isObject(json)) {
        throw new TypeError("Argument 'json' is not an object.");
    }

    this._initialize();
    this.updatedOn = new Date();
    this.context.setState(serializer, json);
};
/* SERIALIZATION */

module.exports = ActivityExecutionEngine;
//# sourceMappingURL=activityExecutionEngine.js.map
