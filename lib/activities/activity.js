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
var fast = require("fast.js");
var CallContext = require("./callContext");
var Promise = require("bluebird");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;

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
    this.nonScopedProperties.add(guids.types.activity);
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

Object.defineProperties(Activity.prototype, {
    _scopeKeys: {
        value: null,
        writable: true,
        enumerable: false
    },
    _createScopePartImpl: {
        value: null,
        writable: true,
        enumerable: false
    }
});

Activity.prototype.toString = function ()
{
    return (this.displayName ? (this.displayName + " ") : "") + "(" + this.constructor.name + ":" + this.id + ")";
}

/* forEach */
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

    fast.forEach(self.getKeys(), function(fieldName)
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
    });
}

Activity.prototype._forEach = function (f, visited, except)
{
    var self = this;
    if (is.undefined(visited[self._instanceId]))
    {
        visited[self._instanceId] = true;

        if (self !== except) f(self);

        fast.forEach(self.getKeys(), function(fieldName)
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
        });
    }
}
/* forEach */

/* RUN */
Activity.prototype.start = function (callContext)
{
    var self = this;

    if (!(callContext instanceof CallContext))
    {
        throw new Error("Argument 'context' is not an instance of ActivityExecutionContext.");
    }

    var args = self.args;
    if (arguments.length > 1)
    {
        args = [];
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
    }

    var myCallContext = callContext.next(self);
    var state = myCallContext.executionState;
    if (state.isRunning) throw new Error("Activity is already running.");

    return new Promise(function(resolve, reject)
    {
        setImmediate(function()
        {
            var e = fast.try(function ()
            {
                state.reportState(Activity.states.run);
                self.run.call(myCallContext.scope, myCallContext, args);
            });
            if (e) reject(e);
            else resolve(state);
        });
    });
}

Activity.prototype.run = function (callContext, args)
{
    this.complete(callContext, args);
}

Activity.prototype.complete = function (callContext, result)
{
    this.end(callContext, Activity.states.complete, result);
}

Activity.prototype.cancel = function (callContext)
{
    this.end(callContext, Activity.states.cancel);
}

Activity.prototype.idle = function (callContext)
{
    this.end(callContext, Activity.states.idle);
}

Activity.prototype.fail = function (callContext, e)
{
    this.end(callContext, Activity.states.fail, e);
}

Activity.prototype.end = function (callContext, reason, result)
{
    var state = callContext.executionState;

    if (state.execState === Activity.states.cancel || state.execState === Activity.states.fail)
    {
        // It was cancelled or failed:
        return;
    }

    state.execState = reason;

    var inIdle = reason === Activity.states.idle;
    var execContext = callContext.executionContext;
    callContext = callContext.back(inIdle);

    if (callContext)
    {
        var bmName = specStrings.activities.createValueCollectedBMName(this);
        if (execContext.isBookmarkExists(bmName))
        {
            state.emitState(result);
            execContext.resumeBookmarkInScope(callContext, bmName, reason, result);
            return;
        }
    }
    else
    {
        // We're on root, done.
        // If wf in idle, but there are internal bookmark reume request,
        // then instead of emitting done, we have to continue them.
        if (inIdle && execContext.processResumeBookmarkQueue())
        {
            // We should not emmit idle event, because there was internal bookmark continutations, so we're done.
            return;
        }
    }

    state.emitState(result);
}

Activity.prototype.schedule = async(function* (callContext, obj, endCallback)
{
    // TODO: Validate callback in scope

    var self = this;
    var scope = callContext.scope;
    var execContext = callContext.executionContext;

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
            var endBM = scope.__collectEndBookmarkName = specStrings.activities.createCollectingCompletedBMName(self);
            execContext.createBookmark(self.id, scope.__collectEndBookmarkName, endCallback);
            var len = activities.length;
            for (var i = 0; i < len; i++)
            {
                var childActivity = activities[i];
                execContext.createBookmark(self.id, specStrings.activities.createValueCollectedBMName(childActivity), "resultCollected");
                yield childActivity.start(callContext);
                if (!execContext.isBookmarkExists(endBM))
                {
                    // If current activity has been ended (by Pick for ex)
                    break;
                }
            }
        }
        else
        {
            var result = scope.__collectValues;
            delete scope.__collectValues;
            scope[endCallback].call(scope, callContext, Activity.states.complete, result);
        }
    }
    else if (obj instanceof Activity)
    {
        execContext.createBookmark(self.id, specStrings.activities.createValueCollectedBMName(obj), endCallback);
        yield obj.start(callContext);
    }
    else
    {
        scope[endCallback].call(scope, callContext, Activity.states.complete, obj);
    }
});

Activity.prototype.resultCollected = function (callContext, reason, result, bookmark)
{
    var self = this;

    var execContext = callContext.executionContext;
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
            fast.forEach(self.__collectValues,
                function (cv)
                {
                    var id = specStrings.getString(cv);
                    if (id && id != childId)
                    {
                        ids.push(id);
                        execContext.deleteScopeOfActivity(callContext, id);
                        var ibmName = specStrings.activities.createValueCollectedBMName(id);
                        execContext.deleteBookmark(ibmName);
                    }
                });
            execContext.cancelExecution(ids);
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

        execContext.resumeBookmarkInScope(callContext, endBookmarkName, reason, result);
    }
}
/* RUN */

/* SCOPE */
Activity.prototype._getScopeKeys = function ()
{
    var self = this;
    if (!self._scopeKeys)
    {
        self._scopeKeys = [];
        fast.forEach(self.getKeys(), function (key)
        {
            if (self.nonScopedProperties.exists(key)) return;
            if (Activity.prototype[key]) return;
            self._scopeKeys.push(key);
        });
    }
    return self._scopeKeys;
}

Activity.prototype.createScopePart = function ()
{
    var self = this;

    if (this._createScopePartImpl === null)
    {
        var first = true;
        var src = "return {";
        fast.forEach(self._getScopeKeys(), function(fieldName)
        {
            if (first)
            {
                first = false;
            }
            else
            {
                src+=",\n";
            }
            if (_.isPlainObject(self[fieldName]))
            {
                src += fieldName + ":_.clone(a." + fieldName + ", true)";
                lodash = true;
            }
            else
            {
                src += fieldName + ":a." + fieldName;
            }
        });
        src += "}";

        this._createScopePartImpl = new Function("a,_", src);
    }
    
    return this._createScopePartImpl(this, _);
}
/* SCOPE */

Activity.states = enums.ActivityStates;

module.exports = Activity;
