var ScopeExtender = require("./scopeExtender");
var ActivityExecutionState = require("./activityExecutionState");
var ResumeBookmarkQueue = require("./resumeBookmarkQueue");
var enums = require("./enums");
var ex = require("./activityExceptions");
var util = require("util");
var EventEmitter = require('events').EventEmitter;
var _ = require("underscore-node");
var guids = require("./guids");

function ActivityExecutionContext()
{
    var self = this;
    this._activityStates = {};
    this.scope = {
        activity: null,
        // TODO: Validate arguments of the following methods, because they are protected.
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
        schedule: function(obj, endcallback)
        {
            if (this.activity) this.activity.schedule.call(this.activity, self, obj, endcallback);
        },
        unschedule: function()
        {
            if (this.activity) this.activity.unschedule.call(this.activity, self);
        },
        createBookmark: function(name, callback)
        {
            if (this.activity) self.createBookmark(this.activity.id, name, callback);
        },
        resumeBookmark: function(name, reason, result)
        {
            self.resumeBookmarkInternal(name, reason, result);
        },
        argCollected: function(context, reason, result, bookmarkName)
        {
            if (this.activity) this.activity.argCollected.call(this, context, reason, result, bookmarkName);
        }
    };
    this._scopeExtenders = [];
    this._bookmarks = {};
    this._nonPersistZoneCounter = 0;
    this._scopeParts = {};
    this._resumeBMQueue = new ResumeBookmarkQueue();
    this._rootActivity = null;
    this._knownActivities = {};
    this._nextActivityId = 0;
}

util.inherits(ActivityExecutionContext, EventEmitter);

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
        args.forEach(function (arg)
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

ActivityExecutionContext.prototype._checkInit = function()
{
    if (!this._rootActivity) throw new Error("Context is not initialized.");
}

ActivityExecutionContext.prototype._initialize = function (parent, activity, idCounter)
{
    var self = this;

    activity.id = (idCounter.id++).toString();
    self._nextActivityId = idCounter.id;
    var state = self.getState(activity.id);
    state.parentActivityId = parent ? parent.id : null;
    self._knownActivities[activity.id] = activity;

    for (var fieldName in activity)
    {
        var fieldValue = activity[fieldName];
        if (fieldValue)
        {
            if (_.isArray(fieldValue))
            {
                fieldValue.forEach(function(obj)
                {
                    if (self._isActivity(obj))
                    {
                        self._initialize(activity, obj, idCounter);
                        state.childActivityIds.push(obj.id);
                    }
                });
            }
            else if (self._isActivity(fieldValue))
            {
                self._initialize(activity, fieldValue, idCounter);
                state.childActivityIds.push(fieldValue.id);
            }
        }
    }
}

ActivityExecutionContext.prototype._isActivity = function(obj)
{
    return obj["__typeTag"] == guids.types.activity;
}

ActivityExecutionContext.prototype.getState = function(id)
{
    var self = this;

    var state = self._activityStates[id];
    if (state == undefined)
    {
        state = new ActivityExecutionState(id);
        state.on(enums.ActivityStates.run, function ()
        {
            var activity = self._knownActivities[id];
            if (!activity) activity = { id: id };
            self.emit(enums.ActivityStates.run, activity);
        });
        state.on(enums.ActivityStates.end, function (reason, result)
        {
            var activity = self._knownActivities[id];
            if (!activity) activity = { id: id };
            self.emit(enums.ActivityStates.end, activity, reason, result);
        });
        self._activityStates[id] = state;
    }
    return state;
}

ActivityExecutionContext.prototype.beginScope = function(activityId, newScope)
{
    var scopeExtender = new ScopeExtender(this.scope);
    scopeExtender.extend(newScope);
    this._scopeExtenders.push({ activityId: activityId, scopeExtender: scopeExtender });
}

ActivityExecutionContext.prototype.endScope = function()
{
    if (this._scopeExtenders.length)
    {
        var ext = this._scopeExtenders[this._scopeExtenders.length - 1];
        ext.scopeExtender.undo();
        this._scopeExtenders.length--;
    }
    else
    {
        throw new Error("There is no active scope.");
    }
}

ActivityExecutionContext.prototype.hasScope = function()
{
    return this._scopeExtenders.length != 0;
}

ActivityExecutionContext.prototype.inNonPersistZone = function()
{
    return this._nonPersistZoneCounter > 0;
}

ActivityExecutionContext.prototype.enterNonPersistZone = function()
{
    this._nonPersistZoneCounter++;
}

ActivityExecutionContext.prototype.exitNonPersistZone = function()
{
    if (this._nonPersistZoneCounter == 0) throw new Error("Non-persist zone is not reached.");
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

ActivityExecutionContext.prototype.getBookmarksByActivityId = function (id)
{
    var self = this;

    var result = [];
    for (var name in self._bookmarks)
    {
        var bm = self._bookmarks[name];
        if (bm.activityId == id) result.push(bm);
    }
    return result;
}

ActivityExecutionContext.prototype.registerBookmark = function(bookmark)
{
    if (this._bookmarks[bookmark.name]) throw new Error("Bookmark '" + bookmark.name + "' already exists.");
    this._bookmarks[bookmark.name] = bookmark;
}

ActivityExecutionContext.prototype.isBookmarkExists = function(name)
{
    return this._bookmarks[name] != undefined;
}

ActivityExecutionContext.prototype.resumeBookmarkInScope = function(name, reason, result)
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

ActivityExecutionContext.prototype.resumeBookmarkInternal = function(name, reason, result)
{
    var bm = this._bookmarks[name];
    if (bm == undefined) throw new Error("Bookmark '" + name + "' doesn't exists.");
    this._resumeBMQueue.enqueue(name, true, reason, result);
}

ActivityExecutionContext.prototype.resumeBookmarkExternal = function(name, reason, result)
{
    this._resumeBMQueue.enqueue(name, false, reason, result);
}

ActivityExecutionContext.prototype._doResumeBookmark = function (bookmark, reason, result, noRemove)
{
    if (!noRemove) delete this._bookmarks[bookmark.name];
    if (this.scope[bookmark.endCallback] == undefined)
    {
        throw new ex.ActivityRuntimeError("Bookmark's '" + bookmark.name + "' callback '" + bookmark.endCallback + "' is not defined on the current scope.");
    }
    this.scope[bookmark.endCallback].call(this.scope, this, reason, result, bookmark);
}

ActivityExecutionContext.prototype._getActivityIdOfCurrentScope = function()
{
    return this.scope && this.scope.activity ? this.scope.activity.id : null;
}

ActivityExecutionContext.prototype.processResumeBookmarkQueue = function(rootActivityId)
{
    var self = this;
    
    if (self._scopeExtenders.length)
    {
        throw new Error("Resume bookmark queue cannot be processed when there is an active scope.");
    }

    var command = self._resumeBMQueue.dequeueInternal();
    if (command)
    {
        var bm = self._bookmarks[command.name];
        if (bm == undefined) throw new Error("Internal resume bookmark request cannot be processed because bookmark '" + name + "' doesn't exists.");
        self._restoreScope(rootActivityId, bm.activityId);
        self._doResumeBookmark(bm, command.reason, command.result);
        return true;
    }

    command = self._resumeBMQueue.dequeueExternal(self._bookmarks);
    if (command)
    {
        var bm = self._bookmarks[command.name];
        if (bm == undefined)
            throw new Error("External resume bookmark request cannot be processed because bookmark '" + name + "' doesn't exists." +
                " (This ain't possible, dequeueExternals method should return only existing ones.)");
        self._restoreScope(rootActivityId, bm.activityId);
        self._doResumeBookmark(bm, command.reason, command.result);
        return true;
    }

    return false;
}

ActivityExecutionContext.prototype._restoreScope = function(rootActivityId, activityId)
{
    var self = this;
    
    var rootState = self._activityStates[rootActivityId];
    if (!rootState) throw self._activityDoesntExistsError(rootActivityId);
    var childState = self._findChildState(rootState, activityId);
    if (!childState) throw self._activityDoesntExistsError(activityId);

    var path = [];
    var currentState = childState;
    var currentId = currentState.activityId;
    do
    {
        path.unshift(currentId);

        currentId = currentState.parentActivityId;
        if (currentId)
        {
            currentState = self._activityStates[currentId];
            if (!currentState) throw self._activityDoesntExistsError(currentId);
        }
    }
    while (currentId);

    path.forEach(function(id)
    {
        var scopePart = self._scopeParts[id];
        if (!scopePart) throw new Error("Scope part not found for Activity '" + id + "'.");
        self.beginScope(id, scopePart);
    });
}

ActivityExecutionContext.prototype._activityDoesntExistsError = function (id)
{
    return new Error("Activity '" + id + "' doesn't exists.");
}

ActivityExecutionContext.prototype._findChildState = function(currentState, activityId)
{
    if (currentState.activityId == activityId) return currentState;
    for (var i = 0; i < currentState.childActivityIds.length; i++)
    {
        var childState = this.getState(currentState.childActivityIds[i]);
        var foundInChild = this._findChildState(childState, activityId);
        if (foundInChild) return foundInChild;
    }
    return null;
}

ActivityExecutionContext.prototype.saveScopePart = function (activityId)
{
    if (this._scopeExtenders.length)
    {
        var ext = this._scopeExtenders[this._scopeExtenders.length - 1];
        this._scopeParts[activityId] = ext.scopeExtender.getExtension();
    }
    else
    {
        throw new Error("There is no active scope.");
    }
}

ActivityExecutionContext.prototype.deleteScopePart = function (activityId)
{
    if (this._scopeParts[activityId] != undefined) delete this._scopeParts[activityId];
}

module.exports = ActivityExecutionContext;