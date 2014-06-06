var ActivityExecutionState = require("./activityExecutionState");
var ResumeBookmarkQueue = require("./resumeBookmarkQueue");
var enums = require("../common/enums");
var errors = require("../common/errors");
var util = require("util");
var EventEmitter = require('events').EventEmitter;
var _ = require("underscore-node");
var guids = require("../common/guids");
var ScopeTree = require("./scopeTree");
var StrMap = require("backpack-node").collections.StrMap;
var StrSet = require("backpack-node").collections.StrSet;

function ActivityExecutionContext()
{
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
            get: function ()
            {
                return this._scopeTree.currentScope;
            }
        },
        hasScope: {
            get: function ()
            {
                return !this._scopeTree.isOnInitial;
            }
        }
    }
)

ActivityExecutionContext.prototype._createScopeTree = function()
{
    var self = this;
    return new ScopeTree(
        {
            complete: function (result)
            {
                if (this.activity) this.activity.complete.call(this.activity, self, result);
            },
            cancel: function ()
            {
                if (this.activity) this.activity.cancel.call(this.activity, self);
            },
            idle: function ()
            {
                if (this.activity) this.activity.idle.call(this.activity, self);
            },
            fail: function (e)
            {
                if (this.activity) this.activity.fail.call(this.activity, self, e);
            },
            end: function (reason, result)
            {
                if (this.activity) this.activity.end.call(this.activity, self, reason, result);
            },
            schedule: function (obj, endcallback)
            {
                if (this.activity) this.activity.schedule.call(this.activity, self, obj, endcallback);
            },
            createBookmark: function (name, callback)
            {
                if (this.activity) self.createBookmark.call(self, this.activity.id, name, callback);
            },
            resumeBookmark: function (name, reason, result)
            {
                self.resumeBookmarkInternal.call(self, name, reason, result);
            },
            resultCollected: function (context, reason, result, bookmarkName)
            {
                if (this.activity) this.activity.resultCollected.call(this, context, reason, result, bookmarkName);
            }
        },
        function (id)
        {
            return self._getKnownActivity(id);
        });
}

ActivityExecutionContext.prototype.initialize = function (rootActivity)
{
    if (this._rootActivity) throw new Error("Context is already initialized.");
    if (!this._isActivity(rootActivity)) throw new TypeError("Argument 'rootActivity' value is not an activity.");

    this._rootActivity = rootActivity;
    this._initialize(null, rootActivity, { id: 0 });
}

ActivityExecutionContext.prototype.appendToContext = function (args)
{
    this._checkInit();

    var self = this;

    var currMax = self._nextActivityId;
    var c = { id: currMax };

    if (_.isArray(args))
    {
        var state = self.getState(self._rootActivity.id);
        args.forEach(
            function (arg)
            {
                if (self._isActivity(arg))
                {
                    self._initialize(self._rootActivity, arg, c);
                    state.childActivityIds.add(arg.id);
                }
            });
    }
    else
    {
        throw new TypeError("Argument 'args' value is not an array.");
    }

    return {
        fromId: currMax,
        toId: this._nextActivityId
    };
}

ActivityExecutionContext.prototype.removeFromContext = function (removeToken)
{
    this._checkInit();

    if (removeToken && removeToken.fromId !== undefined && removeToken.toId !== undefined)
    {
        var state = this.getState(this._rootActivity.id);

        for (var id = removeToken.fromId; id <= removeToken.toId; id++)
        {
            var sid = id.toString();
            this._knownActivities.remove(sid);
            state.childActivityIds.remove(sid);
        }
    }
    else
    {
        throw new TypeError("Argument 'removeToken' value is not a valid remove token object.");
    }

    this._nextActivityId = removeToken.fromId;
}

ActivityExecutionContext.prototype._checkInit = function ()
{
    if (!this._rootActivity) throw new Error("Context is not initialized.");
}

ActivityExecutionContext.prototype._initialize = function (parent, activity, idCounter)
{
    var self = this;

    if (activity.id === null)
    {
        activity.id = (idCounter.id++).toString();
    }
    else if (activity.id != (idCounter.id++).toString())
    {
        throw new Error("Activity " + activity.id + " has been assigned to an other context in a different tree which is not allowed.");
    }
    self._nextActivityId = idCounter.id;
    var state = self.getState(activity.id);
    state.parentActivityId = parent ? parent.id : null;
    self._knownActivities.add(activity.id, activity);

    activity.forEachImmediateChild(
        function (child)
        {
            self._initialize(activity, child, idCounter);
            state.childActivityIds.add(child.id);
        });
}

ActivityExecutionContext.prototype._isActivity = function (obj)
{
    return obj["__typeTag"] == guids.types.activity;
}

ActivityExecutionContext.prototype.getState = function (id)
{
    var self = this;

    var state = self._activityStates.get(id);
    if (state === undefined)
    {
        state = new ActivityExecutionState(id);
        state.on(
            enums.ActivityStates.run, function ()
            {
                var activity = self._knownActivities.get(id);
                if (!activity) activity = { id: id };
                self.emit(enums.ActivityStates.run, activity);
            });
        state.on(
            enums.ActivityStates.end, function (reason, result)
            {
                var activity = self._knownActivities.get(id);
                if (!activity) activity = { id: id };
                self.emit(enums.ActivityStates.end, activity, reason, result);
            });
        self._activityStates.add(id, state);
    }
    return state;
}

ActivityExecutionContext.prototype._getKnownActivity = function (activityId)
{
    var activity = this._knownActivities.get(activityId);
    if (!activity) throw new errors.ActivityRuntimeError("Activity by id '" + activityId + "' not found.");
    return activity;
}

ActivityExecutionContext.prototype.beginScope = function (activityId, scopePart)
{
    this._scopeTree.next(activityId, scopePart);
}

ActivityExecutionContext.prototype.endScope = function (inIdle)
{
    this._scopeTree.back(inIdle);
}

ActivityExecutionContext.prototype.createBookmark = function (activityId, name, endCallback)
{
    this.registerBookmark(
        {
            name: name,
            activityId: activityId,
            endCallback: endCallback
        });
}

ActivityExecutionContext.prototype.registerBookmark = function (bookmark)
{
    if (this._bookmarks.get(bookmark.name)) throw new errors.ActivityRuntimeError("Bookmark '" + bookmark.name + "' already exists.");
    this._bookmarks.set(bookmark.name, bookmark);
}

ActivityExecutionContext.prototype.isBookmarkExists = function (name)
{
    return this._bookmarks.containsKey(name);
}

ActivityExecutionContext.prototype.deleteBookmark = function (name)
{
    this._bookmarks.remove(name);
}

ActivityExecutionContext.prototype.resumeBookmarkInScope = function (name, reason, result)
{
    var bm = this._bookmarks.get(name);
    if (bm === undefined)
    {
        throw new Error("Bookmark '" + name + "' doesn't exists. Cannot continue with reason: " + reason + ".");
    }
    var scopesAId = this._getActivityIdOfCurrentScope();
    if (scopesAId != bm.activityId)
    {
        throw new Error("Bookmark's '" + bm.name + "' scope is not the current scope.");
    }
    this._doResumeBookmark(bm, reason, result, reason == enums.ActivityStates.idle);
}

ActivityExecutionContext.prototype.resumeBookmarkInternal = function (name, reason, result)
{
    var bm = this._bookmarks.get(name);
    if (bm === undefined)
    {
        throw new Error("Bookmark '" + name + "' doesn't exists.");
    }
    this._resumeBMQueue.enqueue(name, reason, result);
}

ActivityExecutionContext.prototype.resumeBookmarkExternal = function (name, reason, result)
{
    var self = this;

    if (!self._scopeTree.isOnInitial)
    {
        throw new errors.ActivityRuntimeError("Resume bookmark queue cannot be processed when there is an active scope.");
    }

    var bm = self._bookmarks.get(name);
    if (bm === undefined) throw new errors.ActivityRuntimeError("Internal resume bookmark request cannot be processed because bookmark '" + command.name + "' doesn't exists.");
    self._restoreScope(bm.activityId);
    self._doResumeBookmark(bm, reason, result);
}

ActivityExecutionContext.prototype._doResumeBookmark = function (bookmark, reason, result, noRemove)
{
    var scope = this.scope;
    if (!noRemove) this._bookmarks.remove(bookmark.name);
    if (scope[bookmark.endCallback] == undefined)
    {
        throw new errors.ActivityRuntimeError("Bookmark's '" + bookmark.name + "' callback '" + bookmark.endCallback + "' is not defined on the current scope.");
    }
    scope[bookmark.endCallback].call(scope, this, reason, result, bookmark);
}

ActivityExecutionContext.prototype._getActivityIdOfCurrentScope = function ()
{
    var scope = this.scope;
    return scope && scope.activity ? scope.activity.id : null;
}

ActivityExecutionContext.prototype.processResumeBookmarkQueue = function ()
{
    var self = this;

    if (!self._scopeTree.isOnInitial)
    {
        throw new errors.ActivityRuntimeError("Resume bookmark queue cannot be processed when there is an active scope.");
    }

    var command = self._resumeBMQueue.dequeue();
    if (command)
    {
        var bm = self._bookmarks.get(command.name);
        if (bm === undefined) throw new errors.ActivityRuntimeError("Internal resume bookmark request cannot be processed because bookmark '" + command.name + "' doesn't exists.");
        self._restoreScope(bm.activityId);
        self._doResumeBookmark(bm, command.reason, command.result);
        return true;
    }

    return false;
}

ActivityExecutionContext.prototype._restoreScope = function (activityId)
{
    this._scopeTree.goTo(activityId);
}

ActivityExecutionContext.prototype.deleteBookmarksOfActivities = function (activityIds)
{
    var self = this;
    var allIds = new StrSet();
    activityIds.forEach(
        function (id)
        {
            self._getActivityIdsOfSubtree(allIds, id);
        });
    self._bookmarks.forEachValue(function(bm)
    {
        if (allIds.exists(bm.activityId)) self._bookmarks.remove(bmName);
    });
}

ActivityExecutionContext.prototype._getActivityIdsOfSubtree = function (to, activityId)
{
    var self = this;
    to[activityId] = true;
    self.getState(activityId).childActivityIds.forEach(
        function (id)
        {
            self._getActivityIdsOfSubtree(to, id);
        });
}

ActivityExecutionContext.prototype.deleteScopeOfActivity = function (activityId)
{
    this._scopeTree.deleteScopePart(activityId);
}

/* SERIALIZATION */
ActivityExecutionContext.prototype.getStateAndPromotions = function()
{
    var activityStates = new StrMap();
    this._activityStates.forEachValue(function(s)
    {
        activityStates.add(s.activityId, s.asJSON());
    })

    var scopeStateAndPromotions = this._scopeTree.getStateAndPromotions();

    return {
        state: {
            activityStates: activityStates,
            bookmarks: this._bookmarks,
            resumeBMQueue: this._resumeBMQueue,
            scope: scopeStateAndPromotions.state
        },
        promotions: scopeStateAndPromotions.promotions
    };
}

ActivityExecutionContext.prototype.setState = function(json)
{
    if (!_.isObject(json)) throw new TypeError("Object argument expected.");
    if (!(json.activityStates instanceof StrMap)) throw new TypeError("Argument object's activityStates property value is not an StrMap instance.");
    if (!(json.bookmarks instanceof StrMap)) throw new TypeError("Argument object's bookmarks property value is not an StrMap instance.");
    if (!(json.resumeBMQueue instanceof ResumeBookmarkQueue)) throw new TypeError("Argument object's resumeBMQueue property value is not an ResumeBookmarkQueue instance.");

    this._activityStates.forEachValue(function(s)
    {
        var stored = json.activityStates.get(s.activityId);
        if (_.isUndefined(stored)) throw new Error("Activity " + a.activityId + " state not found.");
        s.fromJSON(stored);
    });

    this._bookmarks = json.bookmarks;
    this._resumeBMQueue = json.resumeBMQueue;
    this._scopeTree.setState(json.scope);
}
/* SERIALIZATION */

module.exports = ActivityExecutionContext;