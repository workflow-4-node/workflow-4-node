var ActivityExecutionState = require("./activityExecutionState");
var ResumeBookmarkQueue = require("./resumeBookmarkQueue");
var enums = require("../common/enums");
var errors = require("../common/errors");
var util = require("util");
var EventEmitter = require('events').EventEmitter;
var _ = require("lodash");
var guids = require("../common/guids");
var ScopeTree = require("./scopeTree");
var StrMap = require("backpack-node").collections.StrMap;
var StrSet = require("backpack-node").collections.StrSet;
var is = require("../common/is");
var fast = require("fast.js");
var CallContext = require("./callContext");

function ActivityExecutionContext() {
    this._activityStates = new StrMap();
    this._bookmarks = new StrMap();
    this._resumeBMQueue = new ResumeBookmarkQueue();
    this._rootActivity = null;
    this._knownActivities = new StrMap();
    this._nextActivityId = 0;
    this._scopeTree = this._createScopeTree();
}

util.inherits(ActivityExecutionContext, EventEmitter);

Object.defineProperties(
    ActivityExecutionContext.prototype,
    {
        scope: {
            get: function () {
                return this._scopeTree.currentScope;
            }
        },
        hasScope: {
            get: function () {
                return !this._scopeTree.isOnInitial;
            }
        }
    }
)

ActivityExecutionContext.prototype._createScopeTree = function () {
    var self = this;
    return new ScopeTree(
        {
            resultCollected: function (context, reason, result, bookmarkName) {
                context.activity.resultCollected.call(context.scope, context, reason, result, bookmarkName);
            }
        },
        function (id) {
            return self._getKnownActivity(id)
        });
}

ActivityExecutionContext.prototype._registerKnownActivity = function (activity) {
    this._knownActivities.add(activity.id, activity);
    if (is.composite(activity)) activity.ensureImplementationCreated();
};

ActivityExecutionContext.prototype.initialize = function (rootActivity) {
    if (this._rootActivity) throw new Error("Context is already initialized.");
    if (!is.activity(rootActivity)) throw new TypeError("Argument 'rootActivity' value is not an activity.");

    this._rootActivity = rootActivity;
    this._initialize(null, rootActivity, {id: 0});
}

ActivityExecutionContext.prototype.appendToContext = function (args) {
    this._checkInit();

    var self = this;

    var currMax = self._nextActivityId;
    var c = {id: currMax};

    if (_.isArray(args)) {
        var state = self.getState(self._rootActivity.id);
        args.forEach(
            function (arg) {
                if (is.activity(arg)) {
                    self._initialize(self._rootActivity, arg, c);
                    state.childActivityIds.add(arg.id);
                }
            });
    }
    else {
        throw new TypeError("Argument 'args' value is not an array.");
    }

    return {
        fromId: currMax,
        toId: this._nextActivityId
    };
}

ActivityExecutionContext.prototype.removeFromContext = function (removeToken) {
    this._checkInit();

    if (removeToken && is.defined(removeToken.fromId) && is.defined(removeToken.toId)) {
        var state = this.getState(this._rootActivity.id);

        for (var id = removeToken.fromId; id <= removeToken.toId; id++) {
            var sid = id.toString();
            this._knownActivities.remove(sid);
            state.childActivityIds.remove(sid);
        }
    }
    else {
        throw new TypeError("Argument 'removeToken' value is not a valid remove token object.");
    }

    this._nextActivityId = removeToken.fromId;
}

ActivityExecutionContext.prototype._checkInit = function () {
    if (!this._rootActivity) throw new Error("Context is not initialized.");
}

ActivityExecutionContext.prototype._initialize = function (parent, activity, idCounter) {
    var self = this;

    if (activity.id === null) {
        activity.id = (idCounter.id++).toString();
    }
    else if (activity.id != (idCounter.id++).toString()) {
        throw new Error("Activity " + activity.id + " has been assigned to an other context in a different tree which is not allowed.");
    }
    self._nextActivityId = idCounter.id;
    var state = self.getState(activity.id);
    state.parentActivityId = parent ? parent.id : null;
    self._registerKnownActivity(activity);

    activity.forEachImmediateChild(
        function (child) {
            self._initialize(activity, child, idCounter);
            state.childActivityIds.add(child.id);
        });
}

ActivityExecutionContext.prototype.getState = function (id) {
    var self = this;

    var state = self._activityStates.get(id);
    if (is.undefined(state)) {
        state = new ActivityExecutionState(id);
        state.on(
            enums.ActivityStates.run, function () {
                var activity = self._knownActivities.get(id);
                if (!activity) activity = {id: id};
                self.emit(enums.ActivityStates.run, activity);
            });
        state.on(
            enums.ActivityStates.end, function (reason, result) {
                var activity = self._knownActivities.get(id);
                if (!activity) activity = {id: id};
                self.emit(enums.ActivityStates.end, activity, reason, result);
            });
        self._activityStates.add(id, state);
    }
    return state;
}

ActivityExecutionContext.prototype._getKnownActivity = function (activityId) {
    var activity = this._knownActivities.get(activityId);
    if (!activity) {
        throw new errors.ActivityRuntimeError("Activity by id '" + activityId + "' not found.");
    }
    return activity;
}

ActivityExecutionContext.prototype.createBookmark = function (activityId, name, endCallback) {
    this.registerBookmark(
        {
            name: name,
            activityId: activityId,
            timestamp: new Date().getTime(),
            endCallback: endCallback
        });
    return name;
}

ActivityExecutionContext.prototype.registerBookmark = function (bookmark) {
    if (this._bookmarks.get(bookmark.name)) {
        throw new errors.ActivityRuntimeError("Bookmark '" + bookmark.name + "' already exists.");
    }
    this._bookmarks.set(bookmark.name, bookmark);
}

ActivityExecutionContext.prototype.isBookmarkExists = function (name) {
    return this._bookmarks.containsKey(name);
}

ActivityExecutionContext.prototype.getBookmarkTimestamp = function (name, throwIfNotFound) {
    var bm = this._bookmarks.get(name);
    if (is.undefined(bm) && throwIfNotFound) throw new Error("Bookmark '" + name + "' not found.");
    return bm ? bm.timestamp : null;
}

ActivityExecutionContext.prototype.deleteBookmark = function (name) {
    this._bookmarks.remove(name);
}

ActivityExecutionContext.prototype.resumeBookmarkInScope = function (callContext, name, reason, result) {
    var bm = this._bookmarks.get(name);
    if (is.undefined(bm)) {
        throw new Error("Bookmark '" + name + "' doesn't exists. Cannot continue with reason: " + reason + ".");
    }
    this._doResumeBookmark(callContext, bm, reason, result, reason == enums.ActivityStates.idle);
}

ActivityExecutionContext.prototype.resumeBookmarkInternal = function (callContext, name, reason, result) {
    var bm = this._bookmarks.get(name);
    this._resumeBMQueue.enqueue(name, reason, result);
}

ActivityExecutionContext.prototype.resumeBookmarkExternal = function (name, reason, result) {
    var self = this;
    var bm = self._bookmarks.get(name);
    if (is.undefined(bm)) throw new errors.ActivityRuntimeError("Internal resume bookmark request cannot be processed because bookmark '" + command.name + "' doesn't exists.");
    self._doResumeBookmark(new CallContext(this, bm.activityId), bm, reason, result);
}

ActivityExecutionContext.prototype.processResumeBookmarkQueue = function () {
    var self = this;
    var command = self._resumeBMQueue.dequeue();
    if (command) {
        var bm = self._bookmarks.get(command.name);
        if (is.undefined(bm)) throw new errors.ActivityRuntimeError("Internal resume bookmark request cannot be processed because bookmark '" + command.name + "' doesn't exists.");
        self._doResumeBookmark(new CallContext(this, bm.activityId), bm, command.reason, command.result);
        return true;
    }
    return false;
}

ActivityExecutionContext.prototype._doResumeBookmark = function (callContext, bookmark, reason, result, noRemove) {
    var scope = callContext.scope;
    if (!noRemove) this._bookmarks.remove(bookmark.name);
    var cb = null;
    if (bookmark.endCallback) {
        cb = scope.get(bookmark.endCallback);
        if (!_.isFunction(cb)) {
            cb = null;
        }
    }
    if (!cb) {
        throw new errors.ActivityRuntimeError("Bookmark's '" + bookmark.name + "' callback '" + bookmark.endCallback + "' is not defined on the current scope.");
    }
    cb.call(scope, callContext, reason, result, bookmark);
}

ActivityExecutionContext.prototype.cancelExecution = function (activityIds) {
    var self = this;
    var allIds = new StrSet();
    fast.forEach(activityIds,
        function (id) {
            self._cancelSubtree(allIds, id);
        });
    self._bookmarks.forEachValue(function (bm) {
        if (allIds.exists(bm.activityId)) {
            self._bookmarks.remove(bm.name);
        }
    });
}

ActivityExecutionContext.prototype._cancelSubtree = function (allIds, activityId) {
    var self = this;
    allIds.add(activityId);
    var state = self.getState(activityId);
    state.childActivityIds.forEach(
        function (id) {
            self._cancelSubtree(allIds, id);
        });
    state.reportState(enums.ActivityStates.cancel);
}

ActivityExecutionContext.prototype.deleteScopeOfActivity = function (callContext, activityId) {
    this._scopeTree.deleteScopePart(callContext.activityId, activityId);
}

/* SERIALIZATION */
ActivityExecutionContext.prototype.getStateAndPromotions = function (serializer, getPromotions) {
    if (serializer && !_.isFunction(serializer.toJSON)) throw new Error("Argument 'serializer' is not a serializer.");

    var activityStates = new StrMap();
    this._activityStates.forEachValue(function (s) {
        activityStates.add(s.activityId, s.asJSON());
    });

    var scopeStateAndPromotions = this._scopeTree.getState(getPromotions);

    var serialized;
    if (serializer) {
        serialized = serializer.toJSON({
            activityStates: activityStates,
            bookmarks: this._bookmarks,
            scope: scopeStateAndPromotions.state
        });
    }
    else {
        serialized = {
            activityStates: activityStates._serializeToJSON(),
            bookmarks: this._bookmarks._serializeToJSON(),
            scope: scopeStateAndPromotions.state
        }
    }

    return {
        state: serialized,
        promotedProperties: scopeStateAndPromotions.promotedProperties
    };
}

ActivityExecutionContext.prototype.setState = function (serializer, json) {
    if (serializer && !_.isFunction(serializer.fromJSON)) throw new Error("Argument 'serializer' is not a serializer.");
    if (!_.isObject(json)) throw new TypeError("Argument 'json' is not an object.");

    if (serializer) {
        json = serializer.fromJSON(json);
        if (!(json.activityStates instanceof StrMap)) throw new TypeError("ActivityStates property value of argument 'json' is not an StrMap instance.");
        if (!(json.bookmarks instanceof StrMap)) throw new TypeError("Bookmarks property value of argument 'json' is not an StrMap instance.");
    }
    else {
        if (!json.activityStates) throw new TypeError("ActivityStates property value of argument 'json' is not an object.");
        if (!json.bookmarks) throw new TypeError("Bookmarks property value of argument 'json' is not an object.");

        var activityStates = new StrMap();
        activityStates._deserializeFromJSON(json.activityStates);
        var bookmarks = new StrMap();
        bookmarks._deserializeFromJSON(json.bookmarks);
        json = {
            activityStates: activityStates,
            bookmarks: bookmarks,
            scope: json.scope
        };
    }

    this._activityStates.forEachValue(function (s) {
        var stored = json.activityStates.get(s.activityId);
        if (_.isUndefined(stored)) throw new Error("Activity " + a.activityId + " state not found.");
        s.fromJSON(stored);
    });

    this._bookmarks = json.bookmarks;
    this._scopeTree.setState(json.scope);
}
/* SERIALIZATION */

module.exports = ActivityExecutionContext;