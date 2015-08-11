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
    this._activityIds = new Map();
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
            get: function () {
                return this._rootActivity;
            }
        }
    }
);

ActivityExecutionContext.prototype.getInstanceId = function(activity, tryIt) {
    let id = this._activityIds.get(activity);
    if (_.isUndefined(id) && !tryIt) {
        throw new errors.ActivityStateExceptionError(`Activity ${activity} is not part of the context.`);
    }
    return id;
};

ActivityExecutionContext.prototype.setInstanceId = function(activity, id) {
    return this._activityIds.set(activity, id);
};

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

    let currMax = this._nextActivityId;
    let c = { instanceId: currMax };

    if (_.isArray(args)) {
        let state = this.getExecutionState(this._rootActivity);
        for (let arg of args) {
            if (is.activity(arg)) {
                this._initialize(this._rootActivity, arg, c);
                state.childInstanceIds.add(this.getInstanceId(arg));
            }
        }
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

    if (removeToken && !_.isUndefined(removeToken.fromId) && !_.isUndefined(removeToken.toId)) {
        let state = this.getExecutionState(this._rootActivity);

        for (let id = removeToken.fromId; id <= removeToken.toId; id++) {
            let sid = id.toString();
            this._knownActivities.delete(sid);
            this._activityStates.delete(sid);
            state.childInstanceIds.delete(sid);
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
    let activityId = this.getInstanceId(activity, true);
    let nextId = (idCounter.instanceId++).toString();
    if (!activityId) {
        activityId = nextId;
        this.setInstanceId(activity, activityId);
    }
    else if (activityId !== nextId) {
        throw new Error("Activity " + activity + " has been assigned to an other context in a different tree which is not allowed.");
    }

    this._nextActivityId = idCounter.instanceId;
    let state = this.getExecutionState(activityId);
    state.parentInstanceId = parent ? this.getInstanceId(parent) : null;
    this._knownActivities.set(activityId, activity);

    for (let child of activity.immediateChildren(this)) {
        this._initialize(activity, child, idCounter);
        state.childInstanceIds.add(this.getInstanceId(child));
    }
};

ActivityExecutionContext.prototype.getExecutionState = function (idOrActivity) {
    let self = this;

    let id;
    if (_.isString(idOrActivity)) {
        id = idOrActivity;
    }
    else if (is.activity(idOrActivity)) {
        id = self.getInstanceId(idOrActivity);
    }
    else {
        throw new TypeError("Cannot get state of " + idOrActivity);
    }
    let state = self._activityStates.get(id);
    if (_.isUndefined(state)) {
        state = new ActivityExecutionState(id);
        state.on(
            enums.ActivityStates.run,
            function (args) {
                self.emit(enums.ActivityStates.run, args);
            });
        state.on(
            enums.ActivityStates.end,
            function (args) {
                self.emit(enums.ActivityStates.end, args);
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
            instanceId: activityId,
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
    if (_.isUndefined(bm) && throwIfNotFound) {
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
    if (_.isUndefined(bm)) {
        throw new Error("Bookmark '" + name + "' doesn't exists. Cannot continue with reason: " + reason + ".");
    }
    let self = this;
    setImmediate(function () {
        try {
            self._doResumeBookmark(callContext, bm, reason, result, reason === enums.ActivityStates.idle);
        }
        catch (e) {
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
    if (_.isUndefined(bm)) {
        throw new errors.ActivityRuntimeError("Internal resume bookmark request cannot be processed because bookmark '" + name + "' doesn't exists.");
    }
    self._doResumeBookmark(new CallContext(this, bm.instanceId), bm, reason, result);
};

ActivityExecutionContext.prototype.processResumeBookmarkQueue = function () {
    let self = this;
    let command = self._resumeBMQueue.dequeue();
    if (command) {
        let bm = self._bookmarks.get(command.name);
        if (_.isUndefined(bm)) {
            throw new errors.ActivityRuntimeError("Internal resume bookmark request cannot be processed because bookmark '" + command.name + "' doesn't exists.");
        }
        self._doResumeBookmark(new CallContext(this, bm.instanceId), bm, command.reason, command.result);
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
        cb = scope[bookmark.endCallback];
        if (!_.isFunction(cb)) {
            cb = null;
        }
    }

    if (!cb) {
        throw new errors.ActivityRuntimeError("Bookmark's '" + bookmark.name + "' callback '" + bookmark.endCallback + "' is not defined on the current scope.");
    }

    cb.call(scope, callContext, reason, result, bookmark);
};

ActivityExecutionContext.prototype.cancelExecution = function (scope, activityIds) {
    let self = this;
    let allIds = new Set();
    for (let id of activityIds) {
        self._cancelSubtree(scope, allIds, id);
    }
    for (let bm of self._bookmarks.values()) {
        if (allIds.has(bm.instanceId)) {
            self._bookmarks.delete(bm.name);
        }
    }
};

ActivityExecutionContext.prototype._cancelSubtree = function (scope, allIds, activityId) {
    let self = this;
    allIds.add(activityId);
    let state = self.getExecutionState(activityId);
    for (let id of state.childInstanceIds.values()) {
        self._cancelSubtree(scope, allIds, id);
    }
    state.reportState(enums.ActivityStates.cancel, null, scope);
};

ActivityExecutionContext.prototype.deleteScopeOfActivity = function (callContext, activityId) {
    this._scopeTree.deleteScopePart(callContext.instanceId, activityId);
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

ActivityExecutionContext.prototype.getStateAndPromotions = function (serializer, enablePromotions) {
    if (serializer && !_.isFunction(serializer.toJSON)) {
        throw new Error("Argument 'serializer' is not a serializer.");
    }

    let activityStates = new Map();
    for (let s of this._activityStates.values()) {
        activityStates.set(s.instanceId, s.asJSON());
    }

    let scopeStateAndPromotions = this._scopeTree.getExecutionState(this, enablePromotions);

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

    for (let s of this._activityStates.values()) {
        let stored = json.activityStates.get(s.instanceId);
        if (_.isUndefined(stored)) {
            throw new Error("Activity's of '" + s.instanceId + "' state not found.");
        }
        s.fromJSON(stored);
    }

    this._bookmarks = json.bookmarks;
    this._scopeTree.setState(json.scope);
};
/* SERIALIZATION */

module.exports = ActivityExecutionContext;