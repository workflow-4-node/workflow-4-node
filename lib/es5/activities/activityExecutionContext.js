"use strict";

var ActivityExecutionState = require("./activityExecutionState");
var ResumeBookmarkQueue = require("./resumeBookmarkQueue");
var enums = require("../common/enums");
var errors = require("../common/errors");
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");
var constants = require("../common/constants");
var ScopeTree = require("./scopeTree");
var is = require("../common/is");
var CallContext = require("./callContext");
var assert = require("better-assert");
var Bluebird = require("bluebird");
var converters = require("../common/converters");

function ActivityExecutionContext(engine) {
    EventEmitter.call(this);

    this._activityStates = new Map();
    this._bookmarks = new Map();
    this._resumeBMQueue = new ResumeBookmarkQueue();
    this.rootActivity = null;
    this._knownActivities = new Map();
    this._scopeTree = this._createScopeTree();
    this.engine = engine; // Could be null in special cases, see workflowRegistry.js
}

util.inherits(ActivityExecutionContext, EventEmitter);

Object.defineProperties(ActivityExecutionContext.prototype, {
    scope: {
        get: function get() {
            return this._scopeTree.currentScope;
        }
    },
    hasScope: {
        get: function get() {
            return !this._scopeTree.isOnInitial;
        }
    }
});

ActivityExecutionContext.prototype._createScopeTree = function () {
    var self = this;
    return new ScopeTree({
        resultCollected: function resultCollected(context, reason, result, bookmarkName) {
            context.activity.resultCollected.call(context.scope, context, reason, result, bookmarkName);
        }
    }, function (id) {
        return self._getKnownActivity(id);
    });
};

ActivityExecutionContext.prototype.initialize = function (rootActivity) {
    if (this.rootActivity) {
        throw new Error("Context is already initialized.");
    }
    if (!is.activity(rootActivity)) {
        throw new TypeError("Argument 'rootActivity' value is not an activity.");
    }

    this.rootActivity = rootActivity;
    this._initialize(null, rootActivity, { instanceId: 0 });
};

ActivityExecutionContext.prototype._checkInit = function () {
    if (!this.rootActivity) {
        throw new Error("Context is not initialized.");
    }
};

ActivityExecutionContext.prototype._initialize = function (parent, activity, idCounter) {
    var activityId = activity._instanceId;
    var nextId = (idCounter.instanceId++).toString();
    if (!activityId) {
        activityId = nextId;
        activity.instanceId = activityId;
    } else if (activityId !== nextId) {
        throw new errors.ActivityRuntimeError("Activity " + activity + " has been assigned to an other position.");
    }

    var state = this.getExecutionState(activityId);
    state.parentInstanceId = parent ? parent.instanceId : null;
    this._knownActivities.set(activityId, activity);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = activity.immediateChildren(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var child = _step.value;

            this._initialize(activity, child, idCounter);
            state.childInstanceIds.add(child.instanceId);
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

ActivityExecutionContext.prototype.getExecutionState = function (idOrActivity) {
    var self = this;

    var id = undefined;
    if (_.isString(idOrActivity)) {
        id = idOrActivity;
    } else if (is.activity(idOrActivity)) {
        id = idOrActivity.instanceId;
    } else {
        throw new TypeError("Cannot get state of " + idOrActivity);
    }
    var state = self._activityStates.get(id);
    if (_.isUndefined(state)) {
        state = new ActivityExecutionState(id);
        state.on(enums.activityStates.run, function (args) {
            self.emit(enums.activityStates.run, args);
        });
        state.on(enums.activityStates.end, function (args) {
            self.emit(enums.activityStates.end, args);
        });
        self._activityStates.set(id, state);
    }
    return state;
};

ActivityExecutionContext.prototype._getKnownActivity = function (activityId) {
    var activity = this._knownActivities.get(activityId);
    if (!activity) {
        throw new errors.ActivityRuntimeError("Activity by id '" + activityId + "' not found.");
    }
    return activity;
};

ActivityExecutionContext.prototype.createBookmark = function (activityId, name, endCallback) {
    this.registerBookmark({
        name: name,
        instanceId: activityId,
        timestamp: new Date().getTime(),
        endCallback: endCallback
    });
    return name;
};

ActivityExecutionContext.prototype.registerBookmark = function (bookmark) {
    var bm = this._bookmarks.get(bookmark.name);
    if (bm) {
        throw new errors.ActivityRuntimeError("Bookmark '" + bookmark.name + "' already exists.");
    }
    this._bookmarks.set(bookmark.name, bookmark);
};

ActivityExecutionContext.prototype.isBookmarkExists = function (name) {
    return this._bookmarks.has(name);
};

ActivityExecutionContext.prototype.getBookmarkTimestamp = function (name, throwIfNotFound) {
    var bm = this._bookmarks.get(name);
    if (_.isUndefined(bm) && throwIfNotFound) {
        throw new Error("Bookmark '" + name + "' not found.");
    }
    return bm ? bm.timestamp : null;
};

ActivityExecutionContext.prototype.deleteBookmark = function (name) {
    this._bookmarks.delete(name);
};

ActivityExecutionContext.prototype.noopCallbacks = function (bookmarkNames) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = bookmarkNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var name = _step2.value;

            var bm = this._bookmarks.get(name);
            if (bm) {
                bm.endCallback = _.noop;
            }
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
};

ActivityExecutionContext.prototype.resumeBookmarkInScope = function (callContext, name, reason, result) {
    var bm = this._bookmarks.get(name);
    if (_.isUndefined(bm)) {
        throw new Error("Bookmark '" + name + "' doesn't exists. Cannot continue with reason: " + reason + ".");
    }
    var self = this;
    return new Bluebird(function (resolve, reject) {
        setImmediate(function () {
            try {
                bm = self._bookmarks.get(name);
                if (bm) {
                    // If bm is still exists.
                    self._doResumeBookmark(callContext, bm, reason, result, reason === enums.activityStates.idle);
                    resolve(true);
                }
                resolve(false);
            } catch (e) {
                reject(e);
            }
        });
    });
};

ActivityExecutionContext.prototype.resumeBookmarkInternal = function (callContext, name, reason, result) {
    var bm = this._bookmarks.get(name);
    this._resumeBMQueue.enqueue(name, reason, result);
};

ActivityExecutionContext.prototype.resumeBookmarkExternal = function (name, reason, result) {
    var self = this;
    var bm = self._bookmarks.get(name);
    if (!bm) {
        throw new errors.BookmarkNotFoundError("Internal resume bookmark request cannot be processed because bookmark '" + name + "' doesn't exists.");
    }
    self._doResumeBookmark(new CallContext(this, bm.instanceId), bm, reason, result);
};

ActivityExecutionContext.prototype.processResumeBookmarkQueue = function () {
    var self = this;
    var command = self._resumeBMQueue.dequeue();
    if (command) {
        var bm = self._bookmarks.get(command.name);
        if (!bm) {
            throw new errors.BookmarkNotFoundError("Internal resume bookmark request cannot be processed because bookmark '" + command.name + "' doesn't exists.");
        }
        self._doResumeBookmark(new CallContext(this, bm.instanceId), bm, command.reason, command.result);
        return true;
    }
    return false;
};

ActivityExecutionContext.prototype._doResumeBookmark = function (callContext, bookmark, reason, result, noRemove) {
    var scope = callContext.scope;
    if (!noRemove) {
        this._bookmarks.delete(bookmark.name);
    }
    var cb = bookmark.endCallback;
    if (_.isString(cb)) {
        cb = scope[bookmark.endCallback];
        if (!_.isFunction(cb)) {
            cb = null;
        }
    }

    if (!cb) {
        throw new errors.ActivityRuntimeError("Bookmark's '" + bookmark.name + "' callback '" + bookmark.endCallback + "' is not defined on the current scope.");
    }

    // TODO: if it fails, resume on default callback with the error!
    cb.call(scope, callContext, reason, result, bookmark);
};

ActivityExecutionContext.prototype.cancelExecution = function (scope, activityIds) {
    var self = this;
    var allIds = new Set();
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = activityIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var id = _step3.value;

            self._cancelSubtree(scope, allIds, id);
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

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = self._bookmarks.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var bm = _step4.value;

            if (allIds.has(bm.instanceId)) {
                self._bookmarks.delete(bm.name);
            }
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
};

ActivityExecutionContext.prototype._cancelSubtree = function (scope, allIds, activityId) {
    var self = this;
    allIds.add(activityId);
    var state = self.getExecutionState(activityId);
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = state.childInstanceIds.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var id = _step5.value;

            self._cancelSubtree(scope, allIds, id);
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

    state.reportState(enums.activityStates.cancel, null, scope);
};

ActivityExecutionContext.prototype.deleteScopeOfActivity = function (callContext, activityId) {
    this._scopeTree.deleteScopePart(callContext.instanceId, activityId);
};

ActivityExecutionContext.prototype.emitWorkflowEvent = function (args) {
    this.emit(enums.events.workflowEvent, args);
};

/* SERIALIZATION */

ActivityExecutionContext.prototype.getStateAndPromotions = function (serializer, enablePromotions) {
    if (serializer && !_.isFunction(serializer.toJSON)) {
        throw new TypeError("Argument 'serializer' is not a serializer.");
    }

    var activityStates = new Map();
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = this._activityStates.values()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var s = _step6.value;

            activityStates.set(s.instanceId, s.asJSON());
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

    var scopeStateAndPromotions = this._scopeTree.getExecutionState(this, enablePromotions, serializer);

    var serialized = undefined;
    if (serializer) {
        serialized = serializer.toJSON({
            activityStates: activityStates,
            bookmarks: this._bookmarks,
            scope: scopeStateAndPromotions.state
        });
    } else {
        serialized = {
            activityStates: converters.mapToArray(activityStates),
            bookmarks: converters.mapToArray(this._bookmarks),
            scope: scopeStateAndPromotions.state
        };
    }

    return {
        state: serialized,
        promotedProperties: scopeStateAndPromotions.promotedProperties
    };
};

ActivityExecutionContext.prototype.setState = function (serializer, json) {
    if (serializer && !_.isFunction(serializer.fromJSON)) {
        throw new TypeError("Argument 'serializer' is not a serializer.");
    }
    if (!_.isObject(json)) {
        throw new TypeError("Argument 'json' is not an object.");
    }

    if (serializer) {
        json = serializer.fromJSON(json);
        if (!(json.activityStates instanceof Map)) {
            throw new TypeError("activityStates property value of argument 'json' is not an Map instance.");
        }
        if (!(json.bookmarks instanceof Map)) {
            throw new TypeError("Bookmarks property value of argument 'json' is not an Map instance.");
        }
    } else {
        if (!json.activityStates) {
            throw new TypeError("activityStates property value of argument 'json' is not an object.");
        }
        if (!json.bookmarks) {
            throw new TypeError("Bookmarks property value of argument 'json' is not an object.");
        }

        json = {
            activityStates: converters.arrayToMap(json.activityStates),
            bookmarks: converters.arrayToMap(json.bookmarks),
            scope: json.scope
        };
    }

    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
        for (var _iterator7 = this._activityStates.values()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var s = _step7.value;

            var stored = json.activityStates.get(s.instanceId);
            if (_.isUndefined(stored)) {
                throw new Error("Activity's of '" + s.instanceId + "' state not found.");
            }
            s.fromJSON(stored);
        }
    } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
            }
        } finally {
            if (_didIteratorError7) {
                throw _iteratorError7;
            }
        }
    }

    this._bookmarks = json.bookmarks;
    this._scopeTree.setState(json.scope, serializer);
};
/* SERIALIZATION */

module.exports = ActivityExecutionContext;
//# sourceMappingURL=activityExecutionContext.js.map
