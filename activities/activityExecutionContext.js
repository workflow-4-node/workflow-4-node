var ScopeExtender = require("./scopeExtender");
var ActivityExecutionState = require("./activityExecutionState");
var ResumeBookmarkQueue = require("./resumeBookmarkQueue");

function ActivityExecutionContext()
{
    var self = this;
    this._activityStates = {};
    this.scope = {
        _activity: null,
        // TODO: Validate arguments of the following methods, because they are protected.
        complete: function (result)
        {
            if (this._activity) this._activity.complete.call(this._activity, self, result);
        },
        cancel: function ()
        {
            if (this._activity) this._activity.cancel.call(this._activity, self);
        },
        idle: function ()
        {
            if (this._activity) this._activity.idle.call(this._activity, self);
        },
        fail: function (e)
        {
            if (this._activity) this._activity.fail.call(this._activity, self, e);
        },
        end: function (reason, result)
        {
            if (this._activity) this._activity.end.call(this._activity, self, reason, result);
        },
        schedule: function(obj, endcallback)
        {
            if (this._activity) this._activity.schedule.call(this._activity, self, obj, endcallback);
        },
        unschedule: function()
        {
            if (this._activity) this._activity.unschedule.call(this._activity, self);
        },
        createBookmark: function(name, callback)
        {
            if (this._activity) self.createBookmark(this._activity.id, name, callback);
        },
        resumeBookmark: function(name, reason, result)
        {
            self.resumeBookmarkInternal(name, reason, result);
        },
        _argCollected: function(context, reason, result, bookmarkName)
        {
            if (this._activity) this._activity._argCollected.call(this, context, reason, result, bookmarkName);
        }
    };
    this._scopeExtenders = [];
    this._commands = {};
    this._nonPersistZoneCounter = 0;
    this._scopeParts = {};
    this._resumeBMQueue = new ResumeBookmarkQueue();
}

ActivityExecutionContext.prototype.getState = function(id)
{
    var state = this._activityStates[id];
    if (state == undefined)
    {
        state = new ActivityExecutionState(id);
        this._activityStates[id] = state;
    }
    return state;
}

ActivityExecutionContext.prototype.beginScope = function(activityId, newScope)
{
    var scopeExtender = new ScopeExtender(this.scope);
    scopeExtender.extend(newScope);
    this._scopeExtenders.push({ activityId: activityId, scopeExtender: scopeExtender });
    return scopeExtender.currentScope;
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
    this._registerBookmark(
        {
            name: name,
            activityId: activityId,
            endCallback: endCallback
        });
}

ActivityExecutionContext.prototype._registerBookmark = function(bookmark)
{
    if (this._commands[bookmark.name]) throw new Error("Bookmark '" + bookmark.name + "' already exists.");
    this._commands[bookmark.name] = bookmark;
}

ActivityExecutionContext.prototype.isBookmarkExists = function(name)
{
    return this._commands[name] != undefined;
}

ActivityExecutionContext.prototype.resumeBookmarkInScope = function(name, reason, result)
{
    var bm = this._commands[name];
    if (bm == undefined) throw new Error("Bookmark '" + bm.name + "' doesn't exists.");
    var scopesAId = this._getActivityIdOfCurrentScope();
    if (scopesAId != bm.activityId) throw new Error("Bookmark '" + bm.name + "' doesn't exists at current scope.");
    this._doResumeBookmark(bm, reason, result);
}

ActivityExecutionContext.prototype.resumeBookmarkInternal = function(name, reason, result)
{
    this._resumeBMQueue.enqueue(name, true, reason, result);
}

ActivityExecutionContext.prototype.resumeBookmarkExternal = function(name, reason, result)
{
    tthis._resumeBMQueue.enqueue(name, false, reason, result);
}

ActivityExecutionContext.prototype._doResumeBookmark = function (bookmark, reason, result)
{
    delete this._commands[bookmark.name];
    this.scope[bookmark.endCallback].call(this.scope, this, reason, result, bookmark);
}

ActivityExecutionContext.prototype._getActivityIdOfCurrentScope = function()
{
    if (this._scopeExtenders.length) return this._scopeExtenders[this._scopeExtenders.length - 1].activityId;
    return null;
}

ActivityExecutionContext.prototype.processResumeBookmarkQueue = function(rootActivityId)
{
    if (this._scopeExtenders.length) throw new Error("Resume bookmark queue cannot be processed when there is an active scope.");

    var command = this._resumeBMQueue.dequeueInternal();
    if (command)
    {
        var bm = this._commands[command.name];
        if (bm == undefined) throw new Error("Internal resume bookmark request cannot be processed because bookmark '" + name + "' doesn't exists.");
        this._restoreScope(command.activityId);
        this._doResumeBookmark(bm, command.reason, command.result);
        return true;
    }

    var externalCommands = this._resumeBMQueue.dequeueExternals(this._commands);
    externalCommands.forEach(function (command)
    {
        var bm = this._commands[command.name];
        if (bm == undefined)
            throw new Error("External resume bookmark request cannot be processed because bookmark '" + name + "' doesn't exists." +
                " (This ain't possible, dequeueExternals method should return only existing ones.)");
        this._restoreScope(command.activityId);
        this._doResumeBookmark(bm, command.reason, command.result);
        any = true;
    });

    return any;
}

ActivityExecutionContext.prototype._restoreScope = function(rootActivityId, activityId)
{
    var rootState = this._activityStates(rootActivityId);
    if (!rootState) throw this._activityDoesntExistsError(rootActivityId);
    var childState = this._findChildState(rootState, activityId);
    if (!childState) throw this._activityDoesntExistsError(activityId);

    var path = [];
    var currentState = childState;
    var currentId = currentState.activityId;
    do
    {
        path.push(currentId);

        currentId = currentState.parentActivityId;
        if (currentId)
        {
            currentState = this._activityStates(currentId);
            if (!currentState) throw this._activityDoesntExistsError(currentId);
        }
    }
    while (currentId);

    path.forEach(function(id)
    {
        var scopePart = this._scopeParts[activityId];
        if (!scopePart) throw new Error("Scope part not found for Activity '" + id + "'.");
        this.beginScope(id, scopePart);
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
        var scopeExtender = this._scopeExtenders[this._scopeExtenders.length - 1];
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