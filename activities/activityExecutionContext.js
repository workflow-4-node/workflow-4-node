var ScopeExtender = require("./scopeExtender");
var ActivityExecutionState = require("./activityExecutionState");
var ResumeBookmarkQueue = require("./resumeBookmarkQueue");
var enums = require("./../common/enums");
var ex = require("./activityExceptions");
var util = require("util");
var EventEmitter = require('events').EventEmitter;
var _ = require("underscore-node");
var guids = require("./../common/guids");
var ScopeTree = require("./scopeTree");

function ActivityExecutionContext()
{
    this._activityStates = {};
    this._bookmarks = {};
    this._nonPersistZoneCounter = 0;
    this._resumeBMQueue = new ResumeBookmarkQueue();
    this._rootActivity = null;
    this._knownActivities = {};
    this._nextActivityId = 0;

    var self = this;
    this._scopeTree = new ScopeTree(
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
            unschedule: function (keepBookmark)
            {
                if (this.activity) this.activity.unschedule.call(this.activity, self, keepBookmark);
            },
            createBookmark: function (name, callback)
            {
                if (this.activity) self.createBookmark(this.activity.id, name, callback);
            },
            resumeBookmark: function (name, reason, result)
            {
                self.resumeBookmarkInternal(name, reason, result);
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
                return !this._scopeTree.isOnInitial();
            }
        }
    }
)

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
                    state.childActivityIds.push(arg.id);
                    self._initialize(self._rootActivity, arg, c);
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

    if (removeToken && removeToken.fromId != undefined && removeToken.toId != undefined)
    {
        var state = this.getState(this._rootActivity.id);

        for (var id = removeToken.fromId; id <= removeToken.toId; id++)
        {
            delete this._knownActivities[id];
            var cidx = state.childActivityIds.indexOf(id);
            if (cidx != -1) state.childActivityIds.splice(cidx, 1);
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
    self._knownActivities[activity.id] = activity;

    activity.forEachImmediateChild(
        function (child)
        {
            self._initialize(activity, child, idCounter);
            state.childActivityIds.push(child.id);
        });
}

ActivityExecutionContext.prototype._isActivity = function (obj)
{
    return obj["__typeTag"] == guids.types.activity;
}

ActivityExecutionContext.prototype.getState = function (id)
{
    var self = this;

    var state = self._activityStates[id];
    if (state == undefined)
    {
        state = new ActivityExecutionState(id);
        state.on(
            enums.ActivityStates.run, function ()
            {
                var activity = self._knownActivities[id];
                if (!activity) activity = { id: id };
                self.emit(enums.ActivityStates.run, activity);
            });
        state.on(
            enums.ActivityStates.end, function (reason, result)
            {
                var activity = self._knownActivities[id];
                if (!activity) activity = { id: id };
                self.emit(enums.ActivityStates.end, activity, reason, result);
            });
        self._activityStates[id] = state;
    }
    return state;
}

ActivityExecutionContext.prototype._getKnownActivity = function (activityId)
{
    var activity = this._knownActivities[activityId];
    if (!activity) throw new ex.ActivityRuntimeError("Activity by id '" + activityId + "' not found.");
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

ActivityExecutionContext.prototype.inNonPersistZone = function ()
{
    return this._nonPersistZoneCounter > 0;
}

ActivityExecutionContext.prototype.enterNonPersistZone = function ()
{
    this._nonPersistZoneCounter++;
}

ActivityExecutionContext.prototype.exitNonPersistZone = function ()
{
    if (this._nonPersistZoneCounter == 0) throw new ex.ActivityRuntimeError("Non-persist zone is not reached.");
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
    if (this._bookmarks[bookmark.name]) throw new ex.ActivityRuntimeError("Bookmark '" + bookmark.name + "' already exists.");
    this._bookmarks[bookmark.name] = bookmark;
}

ActivityExecutionContext.prototype.isBookmarkExists = function (name)
{
    return this._bookmarks[name] != undefined;
}

ActivityExecutionContext.prototype.deleteBookmark = function (name)
{
    delete this._bookmarks[name];
}

ActivityExecutionContext.prototype.resumeBookmarkInScope = function (name, reason, result)
{
    var bm = this._bookmarks[name];
    if (bm == undefined)
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
    var bm = this._bookmarks[name];
    if (bm == undefined)
    {
        throw new Error("Bookmark '" + name + "' doesn't exists.");
    }
    this._resumeBMQueue.enqueue(name, true, reason, result);
}

ActivityExecutionContext.prototype.resumeBookmarkExternal = function (name, reason, result)
{
    this._resumeBMQueue.enqueue(name, false, reason, result);
}

ActivityExecutionContext.prototype._doResumeBookmark = function (bookmark, reason, result, noRemove)
{
    var scope = this.scope;
    if (!noRemove) delete this._bookmarks[bookmark.name];
    if (scope[bookmark.endCallback] == undefined)
    {
        throw new ex.ActivityRuntimeError("Bookmark's '" + bookmark.name + "' callback '" + bookmark.endCallback + "' is not defined on the current scope.");
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

    if (!self._scopeTree.isOnInitial())
    {
        throw new ex.ActivityRuntimeError("Resume bookmark queue cannot be processed when there is an active scope.");
    }

    var command = self._resumeBMQueue.dequeueInternal();
    if (command)
    {
        var bm = self._bookmarks[command.name];
        if (bm == undefined) throw new ex.ActivityRuntimeError("Internal resume bookmark request cannot be processed because bookmark '" + command.name + "' doesn't exists.");
        self._restoreScope(bm.activityId);
        self._doResumeBookmark(bm, command.reason, command.result);
        return true;
    }

    command = self._resumeBMQueue.dequeueExternal(self._bookmarks);
    if (command)
    {
        var bm = self._bookmarks[command.name];
        if (bm == undefined)
            throw new ex.ActivityRuntimeError(
                    "External resume bookmark request cannot be processed because bookmark '" + name + "' doesn't exists." +
                    " (This ain't possible, dequeueExternals method should return only existing ones.)");
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
    var allIds = {};
    activityIds.forEach(
        function (id)
        {
            self._getActivityIdsOfSubtree(allIds, id);
        });
    for (var bmName in self._bookmarks)
    {
        var bm = self._bookmarks[bmName];
        if (allIds[bm.activityId] !== undefined) delete self._bookmarks[bmName];
    }
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

module.exports = ActivityExecutionContext;