var Q = require("q");
var guids = require("./guids");
var ex = require("./ActivityExceptions");
var enums = require("./enums");
var ActivityExecutionContext = require("./activityExecutionContext");

function Activity()
{
    this.__typeTag = guids.types.activity;
    this.id = null;
    this.args = null;
    this.displayName = "";
    this._nonScoped = [
        "activity",
        "_nonScoped",
        "id",
        "args",
        "__typeTag",
        "displayName",
        "complete",
        "cancel",
        "idle",
        "fail",
        "end",
        "schedule",
        "unschedule",
        "createBookmark",
        "resumeBookmark",
        "argCollected"
    ];
}

Activity.prototype.asNonScoped = function (fieldName)
{
    this._nonScoped.push(fieldName);
}

Activity.prototype.start = function (context)
{
    if (!(context instanceof ActivityExecutionContext))
    {
        throw new Error("Argument 'context' is not an instance of ActivityExecutionContext.");
    }

    var state = context.getState(this.id);

    if (state.isRunning()) throw new Error("Activity is already running.");

    var args = this.args;
    if (arguments.length > 1)
    {
        args = [];
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
    }

    context.beginScope(this.id, this.createScopePart());
    this.emit(context, Activity.states.run);
    this.run.call(context.scope(), context, args);

    return state;
}

Activity.prototype.run = function (context, args)
{
    this.complete(context);
}

Activity.prototype.complete = function (context, result)
{
    this.end(context, Activity.states.complete, result);
}

Activity.prototype.cancel = function (context)
{
    this.end(context, Activity.states.cancel);
}

Activity.prototype.idle = function (context)
{
    this.end(context, Activity.states.idle);
}

Activity.prototype.fail = function (context, e)
{
    this.end(context, Activity.states.fail, e);
}

Activity.prototype.end = function (context, reason, result)
{
    var state = context.getState(this.id);
    state.execState = reason;

    var inIdle = reason == Activity.states.idle;

    context.endScope(inIdle);

    var emit = function()
    {
        state.emit(reason, result);
        state.emit(Activity.states.end, reason, result);
    }

    var bmName = this._getSpecialBookmarkName(guids.markers.argGotBookmark);
    if (context.isBookmarkExists(bmName))
    {
        emit();
        context.resumeBookmarkInScope(bmName, reason, result);
        return;
    }
    else if (inIdle && !context.hasScope())
    {
        if (context.processResumeBookmarkQueue()) return;
        emit();
    }
    else
    {
        emit();
    }
}

Activity.prototype.schedule = function (context, obj, endCallback)
{
    // TODO: Validate callback in scope

    var self = this;
    var scope = context.scope();

    if (Array.isArray(obj) && obj.length)
    {
        scope.__argValues = [];
        var activities = [];
        obj.forEach(function (v)
        {
            if (v instanceof Activity)
            {
                scope.__argValues.push(guids.markers.arg + ":" + v.id);
                activities.push(v);
            }
            else
            {
                scope.__argValues.push(v);
            }
        });
        if (activities.length)
        {
            scope.__argErrors = [];
            scope.__argCancelCounts = 0;
            scope.__argIdleCounts = 0;
            scope.__argRemaining = activities.length;
            scope.__argEndBookmarkName = self._getSpecialBookmarkName(guids.markers.argsGotBookmark);
            context.createBookmark(self.id, scope.__argEndBookmarkName, endCallback);
            activities.forEach(
                function (a)
                {
                    context.createBookmark(self.id, a._getSpecialBookmarkName(guids.markers.argGotBookmark), "argCollected");
                    a.start(context);
                });
        }
        else
        {
            var result = scope.__argValues;
            delete scope.__argValues;
            scope[endCallback].call(scope, context, Activity.states.complete, result);
        }
    }
    else if (obj instanceof Activity)
    {
        context.createBookmark(self.id, obj._getSpecialBookmarkName(guids.markers.argGotBookmark), endCallback);
        obj.start(context);
    }
    else
    {
        scope[endCallback].call(scope, context, Activity.states.complete, obj);
    }
}

Activity.prototype.unschedule = function (context)
{
    var self = this;
    var state = context.getState(self.id);
    state.childActivityIds.forEach(function (childId)
    {
        var ibmName = self._getSpecialBookmarkName(guids.markers.argGotBookmark, childId);
        if (context.isBookmarkExists(ibmName))
        {
            context.resumeBookmarkInScope(ibmName, Activity.states.cancel);
        }
    });
}

Activity.prototype.argCollected = function (context, reason, result, bookmark)
{
    var self = this;

    var childId = self.activity._getActivityIdFromSpecialBookmarkName(bookmark.name);
    var argMarker = guids.markers.arg + ":" + childId;
    var resultIndex = self.__argValues.indexOf(argMarker);
    if (resultIndex == -1)
    {
        self.__argErrors.push(new ex.ActivityStateExceptionError("Activity '" + childId + "' is not found in __argValues."));
    }
    else
    {
        switch (reason)
        {
            case Activity.states.complete:
                self.__argValues[resultIndex] = result;
                break;
            case Activity.states.cancel:
                self.__argCancelCounts++;
                self.__argValues[resultIndex] = null;
                break;
            case Activity.states.idle:
                self.__argIdleCounts++;
                break;
            case Activity.states.fail:
                result = result || new ex.ActivityStateExceptionError("Unknown error.");
                self.__argErrors.push(result);
                self.__argValues[resultIndex] = null;
                break;
            default:
                self.__argErrors.push(new ex.ActivityStateExceptionError("Bookmark should not be continued with reason '" + reason + "'."));
                self.__argValues[resultIndex] = null;
                break;
        }
    }
    if (--self.__argRemaining == 0)
    {
        var endBookmarkName = self.__argEndBookmarkName;
        var reason;
        var result = null;
        if (self.__argErrors.length)
        {
            reason = Activity.states.fail;
            if (self.__argErrors.length == 1)
            {
                result = self.__argErrors[0];
            }
            else
            {
                result = new ex.AggregateError(self.__argErrors);
            }
        }
        else if (self.__argCancelCounts)
        {
            reason = Activity.states.cancel;
        }
        else if (self.__argIdleCounts)
        {
            reason = Activity.states.idle;
            self.__argRemaining = 1;
            self.__argIdleCounts--;
        }
        else
        {
            reason = Activity.states.complete;
            result = self.__argValues;
        }

        if (!self.__argRemaining)
        {
            delete self.__argValues;
            delete self.__argRemaining;
            delete self.__argIdleCounts;
            delete self.__argEndBookmarkName;
            delete self.__argCancelCounts;
            delete self.__argErrors;
        }

        context.resumeBookmarkInScope(endBookmarkName, reason, result);
    }
}

Activity.prototype._getSpecialBookmarkName = function (prefix, activityId)
{
    activityId = activityId || this.id;
    return prefix + ":" + activityId;
}

Activity.prototype._getActivityIdFromSpecialBookmarkName = function (bookmarkName)
{
    return bookmarkName.substr(guids.markers.argGotBookmark.length + 1);
}

Activity.prototype.emit = function (context)
{
    var state = context.getState(this.id);
    state.execState = arguments[1];
    state.emit.apply(Array.prototype.splice.call(arguments, 0, 1));
}

Activity.prototype.createScopePart = function ()
{
    var scopePart = {};
    for (var fieldName in this)
    {
        var fieldValue = this[fieldName];
        if (this._nonScoped.indexOf(fieldName) != -1) continue;
        if (Activity.prototype[fieldName]) continue;
        scopePart[fieldName] = fieldValue;
    }
    return scopePart;
}

Activity.states = enums.ActivityStates;

module.exports = Activity;
