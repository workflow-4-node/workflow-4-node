/*jshint -W054 */

"use strict";

var constants = require("../common/constants");
var errors = require("../common/errors");
var enums = require("../common/enums");
var _ = require("lodash");
var specStrings = require("../common/specStrings");
var util = require("util");
var is = require("../common/is");
var CallContext = require("./callContext");
var uuid = require('uuid');
var async = require("../common/asyncHelpers").async;
var assert = require("better-assert");
var debug = require("debug")("wf4node:Activity");
var common = require("../common");
var SimpleProxy = common.SimpleProxy;

function Activity() {
    this.args = null;
    this.displayName = null;
    this.id = uuid.v4();
    this._instanceId = null;
    this._structureInitialized = false;
    this._scopeKeys = null;
    this._createScopePartImpl = null;
    this["@require"] = null;

    // Properties not serialized:
    this.nonSerializedProperties = new Set();

    // Properties are not going to copied in the scope:
    this.nonScopedProperties = new Set();
    this.nonScopedProperties.add("nonScopedProperties");
    this.nonScopedProperties.add("nonSerializedProperties");
    this.nonScopedProperties.add("arrayProperties");
    this.nonScopedProperties.add("activity");
    this.nonScopedProperties.add("id");
    this.nonScopedProperties.add("_instanceId");
    this.nonScopedProperties.add("args");
    this.nonScopedProperties.add("displayName");
    this.nonScopedProperties.add("complete");
    this.nonScopedProperties.add("cancel");
    this.nonScopedProperties.add("idle");
    this.nonScopedProperties.add("fail");
    this.nonScopedProperties.add("end");
    this.nonScopedProperties.add("schedule");
    this.nonScopedProperties.add("createBookmark");
    this.nonScopedProperties.add("resumeBookmark");
    this.nonScopedProperties.add("resultCollected");
    this.nonScopedProperties.add("codeProperties");
    this.nonScopedProperties.add("initializeStructure");
    this.nonScopedProperties.add("_initializeStructure");
    this.nonScopedProperties.add("_structureInitialized");
    this.nonScopedProperties.add("clone");
    this.nonScopedProperties.add("_scopeKeys");
    this.nonScopedProperties.add("_createScopePartImpl");
    this.nonScopedProperties.add("@require");
    this.nonScopedProperties.add("initializeExec");
    this.nonScopedProperties.add("unInitializeExec");

    this.codeProperties = new Set();
    this.arrayProperties = new Set(["args"]);
}

Object.defineProperties(Activity.prototype, {
    collectAll: {
        value: true,
        writable: false,
        enumerable: false
    },
    instanceId: {
        enumerable: false,
        get: function get() {
            if (this._instanceId) {
                return this._instanceId;
            }
            throw new errors.ActivityRuntimeError("Activity is not initialized in a context.");
        },
        set: function set(value) {
            this._instanceId = value;
        }
    }
});

Activity.prototype.toString = function () {
    return (this.displayName ? this.displayName + " " : "") + "(" + this.constructor.name + ":" + this.id + ")";
};

/* forEach */
Activity.prototype.all = regeneratorRuntime.mark(function _callee(execContext) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    return _context.delegateYield(this._children(true, null, execContext, null), "t0", 1);

                case 1:
                case "end":
                    return _context.stop();
            }
        }
    }, _callee, this);
});

Activity.prototype.children = regeneratorRuntime.mark(function _callee2(execContext) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    return _context2.delegateYield(this._children(true, this, execContext, null), "t0", 1);

                case 1:
                case "end":
                    return _context2.stop();
            }
        }
    }, _callee2, this);
});

Activity.prototype.immediateChildren = regeneratorRuntime.mark(function _callee3(execContext) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    return _context3.delegateYield(this._children(false, this, execContext), "t0", 1);

                case 1:
                case "end":
                    return _context3.stop();
            }
        }
    }, _callee3, this);
});

Activity.prototype._children = regeneratorRuntime.mark(function _callee4(deep, except, execContext, visited) {
    var self, fieldName, fieldValue, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, obj;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    assert(execContext instanceof require("./activityExecutionContext"), "Cannot enumerate activities without an execution context.");
                    visited = visited || new Set();
                    self = this;

                    if (visited.has(self)) {
                        _context4.next = 58;
                        break;
                    }

                    visited.add(self);

                    // Ensure it's structure created:
                    this._initializeStructure(execContext);

                    if (!(self !== except)) {
                        _context4.next = 9;
                        break;
                    }

                    _context4.next = 9;
                    return self;

                case 9:
                    _context4.t0 = regeneratorRuntime.keys(self);

                case 10:
                    if ((_context4.t1 = _context4.t0()).done) {
                        _context4.next = 58;
                        break;
                    }

                    fieldName = _context4.t1.value;

                    if (!self.hasOwnProperty(fieldName)) {
                        _context4.next = 56;
                        break;
                    }

                    fieldValue = self[fieldName];

                    if (!fieldValue) {
                        _context4.next = 56;
                        break;
                    }

                    if (!_.isArray(fieldValue)) {
                        _context4.next = 49;
                        break;
                    }

                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context4.prev = 19;
                    _iterator = fieldValue[Symbol.iterator]();

                case 21:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context4.next = 33;
                        break;
                    }

                    obj = _step.value;

                    if (!(obj instanceof Activity)) {
                        _context4.next = 30;
                        break;
                    }

                    if (!deep) {
                        _context4.next = 28;
                        break;
                    }

                    return _context4.delegateYield(obj._children(deep, except, execContext, visited), "t2", 26);

                case 26:
                    _context4.next = 30;
                    break;

                case 28:
                    _context4.next = 30;
                    return obj;

                case 30:
                    _iteratorNormalCompletion = true;
                    _context4.next = 21;
                    break;

                case 33:
                    _context4.next = 39;
                    break;

                case 35:
                    _context4.prev = 35;
                    _context4.t3 = _context4["catch"](19);
                    _didIteratorError = true;
                    _iteratorError = _context4.t3;

                case 39:
                    _context4.prev = 39;
                    _context4.prev = 40;

                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }

                case 42:
                    _context4.prev = 42;

                    if (!_didIteratorError) {
                        _context4.next = 45;
                        break;
                    }

                    throw _iteratorError;

                case 45:
                    return _context4.finish(42);

                case 46:
                    return _context4.finish(39);

                case 47:
                    _context4.next = 56;
                    break;

                case 49:
                    if (!(fieldValue instanceof Activity)) {
                        _context4.next = 56;
                        break;
                    }

                    if (!deep) {
                        _context4.next = 54;
                        break;
                    }

                    return _context4.delegateYield(fieldValue._children(deep, except, execContext, visited), "t4", 52);

                case 52:
                    _context4.next = 56;
                    break;

                case 54:
                    _context4.next = 56;
                    return fieldValue;

                case 56:
                    _context4.next = 10;
                    break;

                case 58:
                case "end":
                    return _context4.stop();
            }
        }
    }, _callee4, this, [[19, 35, 39, 47], [40,, 42, 46]]);
});
/* forEach */

/* Structure */
Activity.prototype.isArrayProperty = function (propName) {
    return this.arrayProperties.has(propName);
};

Activity.prototype._initializeStructure = function (execContext) {
    if (!this._structureInitialized) {
        this.initializeStructure(execContext);
        this._structureInitialized = true;
    }
};

Activity.prototype.initializeStructure = _.noop;

Activity.prototype.clone = function () {
    function makeClone(value, canCloneArrays) {
        if (value instanceof Activity) {
            return value.clone();
        } else if (value instanceof Set) {
            var newSet = new Set();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = value.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var item = _step2.value;

                    newSet.add(item);
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

            return newSet;
        } else if (_.isArray(value)) {
            if (canCloneArrays) {
                var newArray = [];
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = value[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var item = _step3.value;

                        newArray.push(makeClone(item, false));
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                return newArray;
            } else {
                return value;
            }
        } else {
            return value;
        }
    }

    var Constructor = this.constructor;
    var newInst = new Constructor();
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            var value = this[key];
            if (newInst[key] !== value) {
                newInst[key] = makeClone(value, true);
            }
        }
    }
    return newInst;
};

/* RUN */
Activity.prototype.start = function (callContext) {
    if (!(callContext instanceof CallContext)) {
        throw new Error("Argument 'context' is not an instance of ActivityExecutionContext.");
    }

    var args = undefined;
    if (arguments.length > 1) {
        args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
    }

    this._start(callContext, null, args);
};

Activity.prototype._start = function (callContext, variables, args) {
    var self = this;

    if (_.isUndefined(args)) {
        args = this.args || [];
    }

    if (!_.isArray(args)) {
        args = [args];
    }

    var myCallContext = callContext.next(self, variables);
    var state = myCallContext.executionState;
    if (state.isRunning) {
        throw new Error("Activity is already running.");
    }

    // We should allow IO operations to execute:
    setImmediate(function () {
        state.reportState(Activity.states.run, null, myCallContext.scope);
        try {
            self.initializeExec.call(myCallContext.scope);
            self.run.call(myCallContext.scope, myCallContext, args);
        } catch (e) {
            self.fail(myCallContext, e);
        }
    });
};

Activity.prototype.initializeExec = _.noop;

Activity.prototype.unInitializeExec = _.noop;

Activity.prototype.run = function (callContext, args) {
    callContext.activity.complete(callContext, args);
};

Activity.prototype.complete = function (callContext, result) {
    this.end(callContext, Activity.states.complete, result);
};

Activity.prototype.cancel = function (callContext) {
    this.end(callContext, Activity.states.cancel);
};

Activity.prototype.idle = function (callContext) {
    this.end(callContext, Activity.states.idle);
};

Activity.prototype.fail = function (callContext, e) {
    this.end(callContext, Activity.states.fail, e);
};

Activity.prototype.end = function (callContext, reason, result) {
    try {
        this.unInitializeExec.call(callContext.scope, reason, result);
    } catch (e) {
        var message = "unInitializeExec failed. Reason of ending was '" + reason + "' and the result is '" + result + ".";
        reason = Activity.states.fail;
        result = e;
    }

    var state = callContext.executionState;

    if (state.execState === Activity.states.cancel || state.execState === Activity.states.fail) {
        // It was cancelled or failed:
        return;
    }

    state.execState = reason;

    var inIdle = reason === Activity.states.idle;
    var execContext = callContext.executionContext;
    var savedScope = callContext.scope;
    savedScope.update(SimpleProxy.updateMode.oneWay);
    callContext = callContext.back(inIdle);

    if (callContext) {
        try {
            var bmName = specStrings.activities.createValueCollectedBMName(this.instanceId);
            if (execContext.isBookmarkExists(bmName)) {
                execContext.resumeBookmarkInScope(callContext, bmName, reason, result).then(function () {
                    state.emitState(result, savedScope);
                }, function (e) {
                    state.emitState(result, savedScope);
                    callContext.fail(e);
                });
                return;
            }
        } catch (e) {
            callContext.fail(e);
        }
    } else {
        // We're on root, done.
        // If wf in idle, but there are internal bookmark resume request,
        // then instead of emitting done, we have to continue them.
        if (inIdle && execContext.processResumeBookmarkQueue()) {
            // We should not emmit idle event, because there was internal bookmark continutations, so we're done.
            return;
        }
    }
    state.emitState(result, savedScope);
};

Activity.prototype._defaultEndCallback = function (callContext, reason, result) {
    callContext.end(reason, result);
};

Activity.prototype.schedule = function (callContext, obj, endCallback) {
    var self = this;
    var scope = callContext.scope;
    var execContext = callContext.executionContext;
    var selfId = callContext.instanceId;

    if (!endCallback) {
        endCallback = "_defaultEndCallback";
    }

    var invokeEndCallback = function invokeEndCallback(_reason, _result) {
        setImmediate(function () {
            scope[endCallback].call(scope, callContext, _reason, _result);
        });
    };

    if (!_.isString(endCallback)) {
        callContext.fail(new TypeError("Provided argument 'endCallback' value is not a string."));
        return;
    }
    var cb = scope[endCallback];
    if (!_.isFunction(cb)) {
        callContext.fail(new TypeError("'" + endCallback + "' is not a function."));
        return;
    }

    if (scope.__schedulingState) {
        debug("%s: Error, already existsing state: %j", selfId, scope.__schedulingState);
        callContext.fail(new errors.ActivityStateExceptionError("There are already scheduled items exists."));
        return;
    }

    debug("%s: Scheduling object(s) by using end callback '%s': %j", selfId, endCallback, obj);

    var state = {
        many: _.isArray(obj),
        indices: new Map(),
        results: [],
        total: 0,
        idleCount: 0,
        cancelCount: 0,
        completedCount: 0,
        endBookmarkName: null,
        endCallbackName: endCallback
    };

    var bookmarkNames = [];
    try {
        (function () {
            var startedAny = false;
            var index = 0;
            var processValue = function processValue(value) {
                debug("%s: Checking value: %j", selfId, value);
                var activity = undefined,
                    variables = null;
                if (value instanceof Activity) {
                    activity = value;
                } else if (_.isObject(value) && value.activity instanceof Activity) {
                    activity = value.activity;
                    variables = _.isObject(value.variables) ? value.variables : null;
                }
                if (activity) {
                    var instanceId = activity.instanceId;
                    debug("%s: Value is an activity with instance id: %s", selfId, instanceId);
                    if (state.indices.has(instanceId)) {
                        throw new errors.ActivityStateExceptionError("Activity instance '" + instanceId + " has been scheduled already.");
                    }
                    debug("%s: Creating end bookmark, and starting it.", selfId);
                    bookmarkNames.push(execContext.createBookmark(selfId, specStrings.activities.createValueCollectedBMName(instanceId), "resultCollected"));
                    activity._start(callContext, variables);
                    startedAny = true;
                    state.indices.set(instanceId, index);
                    state.results.push(null);
                    state.total++;
                } else {
                    debug("%s: Value is not an activity.", selfId);
                    state.results.push(value);
                }
            };
            if (state.many) {
                debug("%s: There are many values, iterating.", selfId);
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = obj[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var value = _step4.value;

                        processValue(value);
                        index++;
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
            } else {
                processValue(obj);
            }
            if (!startedAny) {
                debug("%s: No activity has been started, calling end callback with original object.", selfId);
                var result = state.many ? state.results : state.results[0];
                invokeEndCallback(Activity.states.complete, result);
            } else {
                debug("%s: %d activities has been started. Registering end bookmark.", selfId, state.indices.size);
                var endBM = specStrings.activities.createCollectingCompletedBMName(selfId);
                bookmarkNames.push(execContext.createBookmark(selfId, endBM, endCallback));
                state.endBookmarkName = endBM;
                scope.__schedulingState = state;
            }
            scope.update(SimpleProxy.updateMode.oneWay);
        })();
    } catch (e) {
        debug("%s: Runtime error happened: %s", selfId, e.stack);
        if (bookmarkNames.length) {
            debug("%s: Set bookmarks to noop: $j", selfId, bookmarkNames);
            execContext.noopCallbacks(bookmarkNames);
        }
        scope.delete("__schedulingState");
        debug("%s: Invoking end callback with the error.", selfId);
        invokeEndCallback(Activity.states.fail, e);
    } finally {
        debug("%s: Final state indices count: %d, total: %d", selfId, state.indices.size, state.total);
    }
};

Activity.prototype.resultCollected = function (callContext, reason, result, bookmark) {
    var selfId = callContext.instanceId;
    var execContext = callContext.executionContext;
    var childId = specStrings.getString(bookmark.name);
    debug("%s: Scheduling result item collected, childId: %s, reason: %s, result: %j, bookmark: %j", selfId, childId, reason, result, bookmark);

    var finished = null;
    var state = this.__schedulingState;
    var fail = false;
    try {
        if (!_.isObject(state)) {
            throw new errors.ActivityStateExceptionError("Value of __schedulingState is '" + state + "'.");
        }
        var index = state.indices.get(childId);
        if (_.isUndefined(index)) {
            throw new errors.ActivityStateExceptionError("Child activity of '" + childId + "' scheduling state index out of range.");
        }

        debug("%s: Finished child activity id is: %s", selfId, childId);

        switch (reason) {
            case Activity.states.complete:
                debug("%s: Setting %d. value to result: %j", selfId, index, result);
                state.results[index] = result;
                debug("%s: Removing id from state.", selfId);
                state.indices.delete(childId);
                state.completedCount++;
                break;
            case Activity.states.fail:
                debug("%s: Failed with: %s", selfId, result.stack);
                fail = true;
                state.indices.delete(childId);
                break;
            case Activity.states.cancel:
                debug("%s: Incrementing cancel counter.", selfId);
                state.cancelCount++;
                debug("%s: Removing id from state.", selfId);
                state.indices.delete(childId);
                break;
            case Activity.states.idle:
                debug("%s: Incrementing idle counter.", selfId);
                state.idleCount++;
                break;
            default:
                throw new errors.ActivityStateExceptionError("Result collected with unknown reason '" + reason + "'.");
        }

        debug("%s: State so far = total: %s, indices count: %d, completed count: %d, cancel count: %d, error count: %d, idle count: %d", selfId, state.total, state.indices.size, state.completedCount, state.cancelCount, state.idleCount);

        var endWithNoCollectAll = !callContext.activity.collectAll && reason !== Activity.states.idle;
        if (endWithNoCollectAll || fail) {
            if (!fail) {
                debug("%s: ---- Collecting of values ended, because we're not collecting all values (eg.: Pick).", selfId);
            } else {
                debug("%s: ---- Collecting of values ended, because of an error.", selfId);
            }
            debug("%s: Shutting down %d other, running acitvities.", selfId, state.indices.size);
            var ids = [];
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = state.indices.keys()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var id = _step5.value;

                    ids.push(id);
                    debug("%s: Deleting scope of activity: %s", selfId, id);
                    execContext.deleteScopeOfActivity(callContext, id);
                    var ibmName = specStrings.activities.createValueCollectedBMName(id);
                    debug("%s: Deleting value collected bookmark: %s", selfId, ibmName);
                    execContext.deleteBookmark(ibmName);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            execContext.cancelExecution(this, ids);
            debug("%s: Activities cancelled: %j", selfId, ids);
            debug("%s: Reporting the actual reason: %s and result: %j", selfId, reason, result);
            finished = function () {
                execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, reason, result);
            };
        } else {
            assert(!fail);
            var onEnd = state.indices.size - state.idleCount === 0;
            if (onEnd) {
                debug("%s: ---- Collecting of values ended (ended because of collect all is off: %s).", selfId, endWithNoCollectAll);
                if (state.cancelCount) {
                    debug("%s: Collecting has been cancelled, resuming end bookmarks.", selfId);
                    finished = function () {
                        execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, Activity.states.cancel);
                    };
                } else if (state.idleCount) {
                    debug("%s: This entry has been gone to idle, propagating counter.", selfId);
                    state.idleCount--; // Because the next call will wake up a thread.
                    execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, Activity.states.idle);
                } else {
                    result = state.many ? state.results : state.results[0];
                    debug("%s: This entry has been completed, resuming collect bookmark with the result(s): %j", selfId, result);
                    finished = function () {
                        execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, Activity.states.complete, result);
                    };
                }
            }
        }
    } catch (e) {
        callContext.fail(e);
        this.delete("__schedulingState");
    } finally {
        if (finished) {
            debug("%s: Schduling finished, removing state.", selfId);
            this.delete("__schedulingState");

            finished();
        }
    }
};
/* RUN */

/* SCOPE */
Activity.prototype._getScopeKeys = function () {
    var self = this;
    if (!self._scopeKeys || !self._structureInitialized) {
        self._scopeKeys = [];
        for (var key in self) {
            if (!self.nonScopedProperties.has(key) && (_.isUndefined(Activity.prototype[key]) || key === "_defaultEndCallback" || key === "_subActivitiesGot")) {
                self._scopeKeys.push(key);
            }
        }
    }
    return self._scopeKeys;
};

Activity.prototype.createScopePart = function () {
    if (!this._structureInitialized) {
        throw new errors.ActivityRuntimeError("Cannot create activity scope for uninitialized activities.");
    }

    if (this._createScopePartImpl === null) {
        var first = true;
        var src = "return {";
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = this._getScopeKeys()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var _fieldName = _step6.value;

                if (first) {
                    first = false;
                } else {
                    src += ",\n";
                }
                src += _fieldName + ":a." + _fieldName;
            }
        } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                    _iterator6.return();
                }
            } finally {
                if (_didIteratorError6) {
                    throw _iteratorError6;
                }
            }
        }

        src += "}";

        try {
            this._createScopePartImpl = new Function("a,_", src);
        } catch (e) {
            debug("Invalid scope part function:%s", src);
            throw e;
        }
    }

    return this._createScopePartImpl(this, _);
};
/* SCOPE */

Activity.states = enums.activityStates;

module.exports = Activity;
//# sourceMappingURL=activity.js.map
