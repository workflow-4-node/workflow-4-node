var guids = require("../common/guids");
var errors = require("../common/errors");
var enums = require("../common/enums");
var ActivityExecutionContext = require("./activityExecutionContext");
var _ = require("lodash");
var specStrings = require("../common/specStrings");
var WFObject = require("../common/wfObject");
var util = require("util");
var StrSet = require("backpack-node").collections.StrSet;
var is = require("../common/is");

function Activity()
{
    WFObject.call(this);

    this[guids.types.activity] = true;
    this.id = null;
    this.args = null;
    this.displayName = "";

    // Properties not serialized:
    this.nonSerializedProperties = new StrSet();

    // Properties are not going to copied in the scope:
    this.nonScopedProperties = new StrSet();
    this.nonScopedProperties.add("nonScopedProperties");
    this.nonScopedProperties.add("nonSerializedProperties");
    this.nonScopedProperties.add("_instanceId");
    this.nonScopedProperties.add("activity");
    this.nonScopedProperties.add("id");
    this.nonScopedProperties.add("args");
    this.nonScopedProperties.add("__typeTag");
    this.nonScopedProperties.add("displayName");
    this.nonScopedProperties.add("complete");
    this.nonScopedProperties.add("cancel");
    this.nonScopedProperties.add("idle");
    this.nonScopedProperties.add("fail");
    this.nonScopedProperties.add("end");
    this.nonScopedProperties.add("schedule");
    this.nonScopedProperties.add("createBookmark");
    this.nonScopedProperties.add("resumeBookmark");
    this.nonScopedProperties.add("resultCollected");
}

util.inherits(Activity, WFObject);

Activity.prototype.toString = function ()
{
    return (this.displayName ? (this.displayName + " ") : "") + "(" + this.constructor.name + ":" + this.id + ")";
}

Activity.prototype.forEach = function (f)
{
    var visited = {};
    return this._forEach(f, visited, null);
}

Activity.prototype.forEachChild = function (f)
{
    var visited = {};
    return this._forEach(f, visited, this);
}

Activity.prototype.forEachImmediateChild = function (f)
{
    var self = this;
    for (var fieldName in self)
    {
        var fieldValue = self[fieldName];
        if (fieldValue)
        {
            if (_.isArray(fieldValue))
            {
                fieldValue.forEach(
                    function (obj)
                    {
                        if (obj instanceof Activity)
                        {
                            f(obj);
                        }
                    });
            }
            else if (fieldValue instanceof Activity)
            {
                f(fieldValue);
            }
        }
    }
}

Activity.prototype._forEach = function (f, visited, except)
{
    var self = this;
    if (is.undefined(visited[self._instanceId]))
    {
        visited[self._instanceId] = true;

        if (self !== except) f(self);

        for (var fieldName in self)
        {
            var fieldValue = self[fieldName];
            if (fieldValue)
            {
                if (_.isArray(fieldValue))
                {
                    fieldValue.forEach(
                        function (obj)
                        {
                            if (obj instanceof Activity)
                            {
                                obj._forEach(f, visited, except);
                            }
                        });
                }
                else if (fieldValue instanceof Activity)
                {
                    fieldValue._forEach(f, visited, except);
                }
            }
        }
    }
}

Activity.prototype.start = function (context)
{
    var scopeHasBegun = false;
    var eventEmited = false;
    try
    {
        if (!(context instanceof ActivityExecutionContext))
        {
            throw new Error("Argument 'context' is not an instance of ActivityExecutionContext.");
        }

        var state = context.getState(this.id);

        if (state.isRunning) throw new Error("Activity is already running.");

        var args = this.args;
        if (arguments.length > 1)
        {
            args = [];
            for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        }

        context.beginScope(this.id, this.createScopePart());
        scopeHasBegun = true;

        this.emit(context, Activity.states.run);
        eventEmited = true;
        this.run.call(context.scope, context, args);

        return state;
    }
    catch (e)
    {
        // TODO: We need a reliable fail mechanism for activity methods,
        // maybe state errors should be propagated to root activity
        console.log(e.stack);
        throw e;
    }
}

Activity.prototype.run = function (context, args)
{
    this.complete(context, args);
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

    var inIdle = reason === Activity.states.idle;

    context.endScope(inIdle);

    var emit = function ()
    {
        state.emit(reason, result);
        state.emit(Activity.states.end, reason, result);
    }

    var bmName = specStrings.activities.createValueCollectedBMName(this);
    if (context.isBookmarkExists(bmName))
    {
        emit();
        context.resumeBookmarkInScope(bmName, reason, result);
        return;
    }
    else if (inIdle && !context.hasScope && context.processResumeBookmarkQueue())
    {
        return;
    }

    emit();
}

Activity.prototype.schedule = function (context, obj, endCallback)
{
    // TODO: Validate callback in scope

    var self = this;
    var scope = context.scope;
    var bookmarksCreated = [];

    if (Array.isArray(obj) && obj.length)
    {
        scope.__collectValues = [];
        var activities = [];
        obj.forEach(
            function (v)
            {
                if (v instanceof Activity)
                {
                    scope.__collectValues.push(specStrings.activities.asValueToCollect(v));
                    activities.push(v);
                }
                else
                {
                    scope.__collectValues.push(v);
                }
            });
        if (activities.length)
        {
            scope.__collectPickRound2 = false;
            scope.__collectErrors = [];
            scope.__collectCancelCounts = 0;
            scope.__collectIdleCounts = 0;
            scope.__collectRemaining = activities.length;
            scope.__collectEndBookmarkName = specStrings.activities.createCollectingCompletedBMName(self);
            bookmarksCreated.push(context.createBookmark(self.id, scope.__collectEndBookmarkName, endCallback));
            activities.forEach(
                function (a)
                {
                    bookmarksCreated.push(context.createBookmark(self.id, specStrings.activities.createValueCollectedBMName(a), "resultCollected"));
                    a.start(context);
                });
        }
        else
        {
            var result = scope.__collectValues;
            delete scope.__collectValues;
            scope[endCallback].call(scope, context, Activity.states.complete, result);
        }
    }
    else if (obj instanceof Activity)
    {
        bookmarksCreated.push(context.createBookmark(self.id, specStrings.activities.createValueCollectedBMName(obj), endCallback));
        obj.start(context);
    }
    else
    {
        scope[endCallback].call(scope, context, Activity.states.complete, obj);
    }
}

Activity.prototype.resultCollected = function (context, reason, result, bookmark)
{
    var self = this;

    var childId = specStrings.getString(bookmark.name);
    var argMarker = specStrings.activities.asValueToCollect(childId);
    var resultIndex = self.__collectValues.indexOf(argMarker);
    var pickCurrent = false;
    if (resultIndex === -1)
    {
        self.__collectErrors.push(new errors.ActivityStateExceptionError("Activity '" + childId + "' is not found in __collectValues."));
    }
    else
    {
        if (self.__collectPick && (reason !== Activity.states.idle || self.__collectPickRound2))
        {
            // We should pick current result, and shut down others:
            var ids = [];
            self.__collectValues.forEach(
                function (cv)
                {
                    var id = specStrings.getString(cv);
                    if (id && id != childId)
                    {
                        ids.push(id);
                        context.deleteScopeOfActivity(id);
                        var ibmName = specStrings.activities.createValueCollectedBMName(id);
                        context.deleteBookmark(ibmName);
                    }
                });
            context.deleteBookmarksOfActivities(ids);
            pickCurrent = true;
        }
        else
        {
            switch (reason)
            {
                case Activity.states.complete:
                    self.__collectValues[resultIndex] = result;
                    break;
                case Activity.states.cancel:
                    self.__collectCancelCounts++;
                    self.__collectValues[resultIndex] = null;
                    break;
                case Activity.states.idle:
                    self.__collectIdleCounts++;
                    break;
                case Activity.states.fail:
                    result = result || new errors.ActivityStateExceptionError("Unknown error.");
                    self.__collectErrors.push(result);
                    self.__collectValues[resultIndex] = null;
                    break;
                default:
                    self.__collectErrors.push(new errors.ActivityStateExceptionError("Bookmark should not be continued with reason '" + reason + "'."));
                    self.__collectValues[resultIndex] = null;
                    break;
            }
        }
    }
    if (--self.__collectRemaining === 0 || pickCurrent)
    {
        var endBookmarkName = self.__collectEndBookmarkName;

        if (!pickCurrent)
        {
            var reason;
            var result = null;
            if (self.__collectErrors.length)
            {
                reason = Activity.states.fail;
                if (self.__collectErrors.length === 1)
                {
                    result = self.__collectErrors[0];
                }
                else
                {
                    result = new errors.AggregateError(self.__collectErrors);
                }
            }
            else if (self.__collectCancelCounts)
            {
                reason = Activity.states.cancel;
            }
            else if (self.__collectIdleCounts)
            {
                reason = Activity.states.idle;
                self.__collectRemaining = 1;
                self.__collectIdleCounts--;
                if (self.__collectPick)
                {
                    // We're in pick mode, and all result was idle
                    self.__collectPickRound2 = true;
                }
            }
            else
            {
                reason = Activity.states.complete;
                result = self.__collectValues;
            }
        }

        if (!self.__collectRemaining)
        {
            delete self.__collectValues;
            delete self.__collectRemaining;
            delete self.__collectIdleCounts;
            delete self.__collectEndBookmarkName;
            delete self.__collectCancelCounts;
            delete self.__collectErrors;
            delete self.__collectPick;
            delete self.__collectPickRound2;
        }

        context.resumeBookmarkInScope(endBookmarkName, reason, result);
    }
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
        if (this.nonScopedProperties.exists(fieldName)) continue;
        if (Activity.prototype[fieldName]) continue;
        scopePart[fieldName] = fieldValue;
    }
    return scopePart;
}

Activity.states = enums.ActivityStates;

module.exports = Activity;
