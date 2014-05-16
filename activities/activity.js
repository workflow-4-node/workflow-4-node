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

    context.beginScope(this.id, this.createScope());
    this.emit(context, Activity.states.run);
    this.run.call(context.scope, context, args);

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

    var inIdle = false;
    if (reason == Activity.states.idle)
    {
        // If the activity goes idle we should store his part of the scope:
        context.saveScopePart(this.id);
        inIdle = true;
    }
    else
    {
        // If the activity is not idle we have to erase previously stored state parst:
        context.deleteScopePart(this.id);
    }

    context.endScope();

    var emit = function()
    {
        state.emit(reason, result);
        state.emit(Activity.states.end, reason, result);
    }

    if (context.hasScope())
    {
        var bmName = this._internalBookmarkName();
        if (context.isBookmarkExists(bmName))
        {
            emit();
            context.resumeBookmarkInScope(bmName, reason, result);
            return;
        }
    }
    else if (inIdle)
    {
        if (context.processResumeBookmarkQueue(this.id)) return;
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

    if (Array.isArray(obj) && obj.length)
    {
        context.scope.__argValues = [];
        var activities = [];
        obj.forEach(function (v)
        {
            if (v instanceof Activity)
            {
                context.scope.__argValues.push(guids.markers.arg + ":" + v.id);
                activities.push(v);
            }
            else
            {
                context.scope.__argValues.push(v);
            }
        });
        if (activities.length)
        {
            context.scope.__argErrors = [];
            context.scope.__argCancelCounts = 0;
            context.scope.__argIdleCounts = 0;
            context.scope.__argRemaining = activities.length;
            context.scope.__argEndBookmarkName = self._internalBookmarkName();
            context.createBookmark(self.id, context.scope.__argEndBookmarkName, endCallback);
            activities.forEach(
                function (a)
                {
                    context.createBookmark(self.id, a._internalBookmarkName(), "argCollected");
                    a.start(context);
                });
        }
        else
        {
            var result = context.scope.__argValues;
            delete context.scope.__argValues;
            context.scope[endCallback].call(context.scope, context, Activity.states.complete, result);
        }
    }
    else if (obj instanceof Activity)
    {
        context.createBookmark(self.id, obj._internalBookmarkName(), endCallback);
        obj.start(context);
    }
    else
    {
        context.scope[endCallback].call(context.scope, context, Activity.states.complete, obj);
    }
}

Activity.prototype.unschedule = function (context)
{
    var self = this;
    var state = context.getState(self.id);
    state.childActivityIds.forEach(function (childId)
    {
        var ibmName = self._internalBookmarkName(childId);
        if (context.isBookmarkExists(ibmName))
        {
            context.resumeBookmarkInScope(ibmName, Activity.states.cancel);
        }
    });
}

Activity.prototype.argCollected = function (context, reason, result, bookmark)
{
    var self = this;

    var childId = self.activity._internalBookmarkNameToActivityId(bookmark.name);
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

//        if (!self.__argRemaining)
//        {
//            delete self.__argValues;
//            delete self.__argRemaining;
//            delete self.__argIdleCounts;
//            delete self.__argEndBookmarkName;
//            delete self.__argCancelCounts;
//            delete self.__argErrors;
//        }

        context.resumeBookmarkInScope(endBookmarkName, reason, result);
    }
}

Activity.prototype._internalBookmarkName = function (id)
{
    id = id || this.id;
    return "_IBM_" + this.id;
}

Activity.prototype._internalBookmarkNameToActivityId = function (bookmarkName)
{
    return bookmarkName.substr(5);
}

Activity.prototype.emit = function (context)
{
    var state = context.getState(this.id);
    state.execState = arguments[1];
    state.emit.apply(Array.prototype.splice.call(arguments, 0, 1));
}

Activity.prototype.createScope = function ()
{
    var scope = { activity: this };
    for (var fieldName in this)
    {
        var fieldValue = this[fieldName];
        if (this._nonScoped.indexOf(fieldName) != -1) continue;
        if (Activity.prototype[fieldName]) continue;
        scope[fieldName] = fieldValue;
    }
    return scope;
}

Activity.states = enums.ActivityStates;

module.exports = Activity;
