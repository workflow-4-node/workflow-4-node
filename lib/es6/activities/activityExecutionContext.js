"use strict";

let ActivityExecutionState = require("./activityExecutionState");
let ResumeBookmarkQueue = require("./resumeBookmarkQueue");
let enums = require("../common/enums");
let errors = require("../common/errors");
let util = require("util");
let EventEmitter = require('events').EventEmitter;
let _ = require("lodash");
let guids = require("../common/guids");
let ScopeTree = require("./scopeTree");
let is = require("../common/is");
let CallContext = require("./callContext");

function ActivityExecutionContext() {
    this._activityStates = new Map();
    this._bookmarks = new Map();
    this._resumeBMQueue = new ResumeBookmarkQueue();
    this._rootActivity = null;
    this._knownActivities = new Map();
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
        },
        rootActivity: {
            get: function() {
                return this._rootActivity;
            }
        }
    }
);

ActivityExecutionContext.prototype._createScopeTree = function () {
    let self = this;
    return new ScopeTree(
        {
            resultCollected: function (context, reason, result, bookmarkName) {
                context.activity.resultCollected.call(context.scope, context, reason, result, bookmarkName);
            }
        },
        function (id) {
            return self._getKnownActivity(id);
        });
};

ActivityExecutionContext.prototype._registerKnownActivity = function (activity) {
    this._knownActivities.set(activity.instanceId, activity);
    activity._initializeStructure();
};

ActivityExecutionContext.prototype.initialize = function (rootActivity) {
    if (this._rootActivity) {
        throw new Error("Context is already initialized.");
    }
    if (!is.activity(rootActivity)) {
        throw new TypeError("Argument 'rootActivity' value is not an activity.");
    }

    this._rootActivity = rootActivity;
    this._initialize(null, rootActivity, { instanceId: 0 });
};

ActivityExecutionContext.prototype.appendToContext = function (args) {
    this._checkInit();

    let self = this;

    let currMax = self._nextActivityId;
    let c = { instanceId: currMax };

    if (_.isArray(args)) {
        let state = self.getState(self._rootActivity.instanceId);
        args.forEach(
            function (arg) {
                if (is.activity(arg)) {
                    self._initialize(self._rootActivity, arg, c);
                    state.childActivityIds.add(arg.instanceId);
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
};

ActivityExecutionContext.prototype.removeFromContext = function (removeToken) {
    this._checkInit();

    if (removeToken && is.defined(removeToken.fromId) && is.defined(removeToken.toId)) {
        let state = this.getState(this._rootActivity.instanceId);

        for (let id = removeToken.fromId; id <= removeToken.toId; id++) {
            let sid = id.toString();
            this._knownActivities.delete(sid);
            state.childActivityIds.delete(sid);
        }
    }
    else {
        throw new TypeError("Argument 'removeToken' value is not a valid remove token object.");
    }

    this._nextActivityId = removeToken.fromId;
};

ActivityExecutionContext.prototype._checkInit = function () {
    if (!this._rootActivity) {
        throw new Error("Context is not initialized.");
    }
};

ActivityExecutionContext.prototype._initialize = function (parent, activity, idCounter) {
    let self = this;

    if (activity.instanceId === null) {
        activity.instanceId = (idCounter.instanceId++).toString();
    }
    else if (activity.instanceId !== (idCounter.instanceId++).toString()) {
        throw new Error("Activity " + activity.instanceId + " has been assigned to an other context in a different tree which is not allowed.");
    }

    self._nextActivityId = idCounter.instanceId;
    let state = self.getState(activity.instanceId);
    state.parentActivityId = parent ? parent.instanceId : null;
    self._registerKnownActivity(activity);

    activity.forEachImmediateChild(
        function (child) {
            self._initialize(activity, child, idCounter);
            state.childActivityIds.add(child.instanceId);
        },
        this);
};

ActivityExecutionContext.prototype.getState = function (id) {
    let self = this;

    let state = self._activityStates.get(id);
    if (is.undefined(state)) {
        state = new ActivityExecutionState(id);
        state.on(
            enums.ActivityStates.run,
            function () {
                let activity = self._knownActivities.get(id);
                if (!activity) {
                    activity = { instanceId: id };
                }
                self.emit(enums.ActivityStates.run, activity);
            });
        state.on(
            enums.ActivityStates.end,
            function (reason, result) {
                let activity = self._knownActivities.get(id);
                if (!activity) {
                    activity = { instanceId: id };
                }
                self.emit(enums.ActivityStates.end, activity, reason, result);
            });
        self._activityStates.set(id, state);
    }
    return state;
};

ActivityExecutionContext.prototype._getKnownActivity = function (activityId) {
    let activity = this._knownActivities.get(activityId);
    if (!activity) {
        throw new errors.ActivityRuntimeError("Activity by id '" + activityId + "' not found.");
    }
    return activity;
};

ActivityExecutionContext.prototype.createBookmark = function (activityId, name, endCallback) {
    this.registerBookmark(
        {
            name: name,
            activityInstanceId: activityId,
            timestamp: new Date().getTime(),
            endCallback: endCallback
        });
    return name;
};

ActivityExecutionContext.prototype.registerBookmark = function (bookmark) {
    let bm = this._bookmarks.get(bookmark.name);
    if (bm) {
        throw new errors.ActivityRuntimeError("Bookmark '" + bookmark.name + "' already exists.");
    }
    this._bookmarks.set(bookmark.name, bookmark);
};

ActivityExecutionContext.prototype.isBookmarkExists = function (name) {
    return this._bookmarks.has(name);
};

ActivityExecutionContext.prototype.getBookmarkTimestamp = function (name, throwIfNotFound) {
    let bm = this._bookmarks.get(name);
    if (is.undefined(bm) && throwIfNotFound) {
        throw new Error("Bookmark '" + name + "' not found.");
    }
    return bm ? bm.timestamp : null;
};

ActivityExecutionContext.prototype.deleteBookmark = function (name) {
    this._bookmarks.delete(name);
};

ActivityExecutionContext.prototype.noopCallbacks = function (bookmarkNames) {
    for (let name of bookmarkNames) {
        let bm = this._bookmarks.get(name);
        if (bm) {
            bm.endCallback = _.noop;
        }
    }
};

ActivityExecutionContext.prototype.resumeBookmarkInScope = function (callContext, name, reason, result) {
    let bm = this._bookmarks.get(name);
    if (is.undefined(bm)) {
        throw new Error("Bookmark '" + name + "' doesn't exists. Cannot continue with reason: " + reason + ".");
    }
    let self = this;
    setImmediate(function() {
        try {
            self._doResumeBookmark(callContext, bm, reason, result, reason === enums.ActivityStates.idle);
        }
        catch(e) {
            callContext.fail(e);
        }
    });
};

ActivityExecutionContext.prototype.resumeBookmarkInternal = function (callContext, name, reason, result) {
    let bm = this._bookmarks.get(name);
    this._resumeBMQueue.enqueue(name, reason, result);
};

ActivityExecutionContext.prototype.resumeBookmarkExternal = function (name, reason, result) {
    let self = this;
    let bm = self._bookmarks.get(name);
    if (is.undefined(bm)) {
        throw new errors.ActivityRuntimeError("Internal resume bookmark request cannot be processed because bookmark '" + name + "' doesn't exists.");
    }
    self._doResumeBookmark(new CallContext(this, bm.activityInstanceId), bm, reason, result);
};

ActivityExecutionContext.prototype.processResumeBookmarkQueue = function () {
    let self = this;
    let command = self._resumeBMQueue.dequeue();
    if (command) {
        let bm = self._bookmarks.get(command.name);
        if (is.undefined(bm)) {
            throw new errors.ActivityRuntimeError("Internal resume bookmark request cannot be processed because bookmark '" + command.name + "' doesn't exists.");
        }
        self._doResumeBookmark(new CallContext(this, bm.activityInstanceId), bm, command.reason, command.result);
        return true;
    }
    return false;
};

ActivityExecutionContext.prototype._doResumeBookmark = function (callContext, bookmark, reason, result, noRemove) {
    let scope = callContext.scope;
    if (!noRemove) {
        this._bookmarks.delete(bookmark.name);
    }
    let cb = bookmark.endCallback;
    if (_.isString(cb)) {
        cb = scope.get(bookmark.endCallback);
        if (!_.isFunction(cb)) {
            cb = null;
        }
    }

    if (!cb) {
        throw new errors.ActivityRuntimeError("Bookmark's '" + bookmark.name + "' callback '" + bookmark.endCallback + "' is not defined on the current scope.");
    }

    cb.call(scope, callContext, reason, result, bookmark);
};

ActivityExecutionContext.prototype.cancelExecution = function (activityIds) {
    let self = this;
    let allIds = new Set();
    for (let id of activityIds) {
        self._cancelSubtree(allIds, id);
    }
    self._bookmarks.forEach(function (bm) {
        if (allIds.has(bm.activityInstanceId)) {
            self._bookmarks.delete(bm.name);
        }
    });
};

ActivityExecutionContext.prototype._cancelSubtree = function (allIds, activityId) {
    let self = this;
    allIds.add(activityId);
    let state = self.getState(activityId);
    state.childActivityIds.forEach(
        function (id) {
            self._cancelSubtree(allIds, id);
        });
    state.reportState(enums.ActivityStates.cancel);
};

ActivityExecutionContext.prototype.deleteScopeOfActivity = function (callContext, activityId) {
    this._scopeTree.deleteScopePart(callContext.activityInstanceId, activityId);
};

/* SERIALIZATION */

function mapToJSON(map) {
    if (!map) {
        return null;
    }
    let json = [];
    for (let kvp of map.entries()) {
        json.push(kvp);
    }
    return json;
}

function jsonToMap(json) {
    if (!json) {
        return null;
    }
    let map = new Map();
    for (let kvp of json) {
        map.set(kvp[0], kvp[1]);
    }
    return map;
}

ActivityExecutionContext.prototype.getStateAndPromotions = function (serializer, getPromotions) {
    if (serializer && !_.isFunction(serializer.toJSON)) {
        throw new Error("Argument 'serializer' is not a serializer.");
    }

    let activityStates = new Map();
    this._activityStates.forEach(function (s) {
        activityStates.set(s.activityInstanceId, s.asJSON());
    });

    let scopeStateAndPromotions = this._scopeTree.getState(getPromotions);

    let serialized;
    if (serializer) {
        serialized = serializer.toJSON({
            activityStates: activityStates,
            bookmarks: this._bookmarks,
            scope: scopeStateAndPromotions.state
        });
    }
    else {
        serialized = {
            activityStates: mapToJSON(activityStates),
            bookmarks: mapToJSON(this._bookmarks),
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
        throw new Error("Argument 'serializer' is not a serializer.");
    }
    if (!_.isObject(json)) {
        throw new TypeError("Argument 'json' is not an object.");
    }

    if (serializer) {
        json = serializer.fromJSON(json);
        if (!(json.activityStates instanceof Map)) {
            throw new TypeError("ActivityStates property value of argument 'json' is not an Map instance.");
        }
        if (!(json.bookmarks instanceof Map)) {
            throw new TypeError("Bookmarks property value of argument 'json' is not an Map instance.");
        }
    }
    else {
        if (!json.activityStates) {
            throw new TypeError("ActivityStates property value of argument 'json' is not an object.");
        }
        if (!json.bookmarks) {
            throw new TypeError("Bookmarks property value of argument 'json' is not an object.");
        }

        json = {
            activityStates: jsonToMap(json.activityStates),
            bookmarks: jsonToMap(json.bookmarks),
            scope: json.scope
        };
    }

    this._activityStates.forEach(function (s) {
        let stored = json.activityStates.get(s.activityInstanceId);
        if (_.isUndefined(stored)) {
            throw new Error("Activity's of '" + s.activityInstanceId + "' state not found.");
        }
        s.fromJSON(stored);
    });

    this._bookmarks = json.bookmarks;
    this._scopeTree.setState(json.scope);
};
/* SERIALIZATION */

module.exports = ActivityExecutionContext;