var Activity = require("./activity");
var ActivityExecutionContext = require("./activityExecutionContext");
var ActivityExecutionState = require("./activityExecutionState");
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var ex = require("./ActivityExceptions");
var Q = require("q");
var _ = require("underscore-node");
var TrackingParticipant = require("./TrackingParticipant");
var enums = require("./../common/enums");

function ActivityExecutionEngine(rootActivity)
{
    if (!(rootActivity instanceof Activity)) throw new TypeError("Argument 'rootActivity' is not an activity.");
    this._rootActivity = rootActivity;
    this._context = new ActivityExecutionContext();
    this._rootState = null;
    this._trackers = [];
    this._hookContext();
    this.commandTimeout = 3000;
}

ActivityExecutionEngine.prototype = {
    get execState()
    {
        if (this._rootState)
        {
            return this._rootState.execState;
        }
        else
        {
            return null;
        }
    },
    get version()
    {
        return this._rootActivity.version;
    }
};

util.inherits(ActivityExecutionEngine, EventEmitter);

ActivityExecutionEngine.prototype._setRootState = function (state)
{
    var self = this;
    if (!self._rootState)
    {
        self._rootState = state;
        self._rootState.on(
            Activity.states.cancel, function ()
            {
                self.emit(Activity.states.cancel);
            });
        self._rootState.on(
            Activity.states.complete, function (result)
            {
                self.emit(Activity.states.complete, result);
            });
        self._rootState.on(
            Activity.states.end, function (reason, result)
            {
                self.emit(Activity.states.end, reason, result);
            });
        self._rootState.on(
            Activity.states.fail, function (e)
            {
                self.emit(Activity.states.fail, e);
            });
        self._rootState.on(
            Activity.states.run, function ()
            {
                self.emit(Activity.states.run);
            });
        self._rootState.on(
            Activity.states.idle, function ()
            {
                self.emit(Activity.states.idle);
            });
    }
}

ActivityExecutionEngine.prototype._hookContext = function ()
{
    var self = this;
    self._context.on(
        Activity.states.run, function (activity)
        {
            self._trackers.forEach(
                function (t)
                {
                    t.activityStateChanged(activity, Activity.states.run);
                });
        });
    self._context.on(
        Activity.states.end, function (activity, reason, result)
        {
            self._trackers.forEach(
                function (t)
                {
                    t.activityStateChanged(activity, reason, result);
                });
        });
}

ActivityExecutionEngine.prototype.addTracker = function (tracker)
{
    if (!_.isObject(tracker)) throw new TypeError("Parameter is not an object.");
    this._trackers.push(new TrackingParticipant(tracker));
}

ActivityExecutionEngine.prototype.start = function ()
{
    this._verifyNotStarted();

    this._context.initialize(this._rootActivity);

    var args = [ this._context ];
    Array.prototype.forEach.call(
        arguments, function (a)
        {
            args.push(a);
        });

    this._setRootState(this._rootActivity.start.apply(this._rootActivity, args));
}

ActivityExecutionEngine.prototype.invoke = function ()
{
    this._verifyNotStarted();

    var self = this;
    var defer = Q.defer();
    try
    {
        this._context.initialize(this._rootActivity);

        var startTime = new Date().getTime();
        var argRemoveToken = null;
        var args = [];
        Array.prototype.forEach.call(
            arguments, function (a)
            {
                args.push(a);
            });
        if (args.length) argRemoveToken = self._context.appendToContext(args);
        args.unshift(self._context);

        self._setRootState(self._context.getState(self._rootActivity.id));
        var wait = function ()
        {
            self.once(
                Activity.states.end, function (reason, result)
                {
                    try
                    {
                        switch (reason)
                        {
                            case Activity.states.complete:
                                defer.resolve(result);
                                break;
                            case Activity.states.cancel:
                                defer.reject(new ex.Cancelled());
                                break;
                            case Activity.states.idle:
                                if (new Date().getTime() - startTime > self.commandTimeout)
                                {
                                    defer.reject(new ex.Idle());
                                }
                                else
                                {
                                    process.nextTick(wait);
                                }
                                break;
                            default :
                                result = result || new ex.ActivityRuntimeError("Unknown error.");
                                defer.reject(result);
                                break;
                        }
                    }
                    finally
                    {
                        if (argRemoveToken) self._context.removeFromContext(argRemoveToken);
                    }
                });
        }
        wait();
        self._rootActivity.start.apply(self._rootActivity, args);
    }
    catch (e)
    {
        defer.reject(e);
    }
    return defer.promise;
}

ActivityExecutionEngine.prototype._verifyNotStarted = function ()
{
    if (this.execState != null) throw new ex.ActivityStateExceptionError("Workflow has been started already.");
}

ActivityExecutionEngine.prototype.resumeBookmark = function (name, reason, result)
{
    var self = this;
    var defer = Q.defer();

    try
    {
        if (self.execState() == enums.ActivityStates.idle)
        {
            var timedOut = false;
            var resolved = false;
            var startTime = new Date().getTime();

            var rejectWithTimeout = function ()
            {
                try
                {
                    self._context.cancelResumingExternalBookmark(name);
                    defer.reject(new ex.TimeoutError("Bookmark '" + name + "' cannot be resumed in time."));
                }
                catch (e)
                {
                    defer.reject(e);
                }
            }

            var toId = setTimeout(
                function ()
                {
                    timedOut = true;
                    if (!resolved) rejectWithTimeout();
                },
                self.commandTimeout);
            var wait = function ()
            {
                self.once(
                    Activity.states.end, function (reason, result)
                    {
                        if (!timedOut)
                        {
                            try
                            {
                                if (reason === enums.ActivityStates.complete || reason === enums.ActivityStates.idle)
                                {
                                    if (self._context.isBookmarkExists(name))
                                    {
                                        if (reason === enums.ActivityStates.complete)
                                        {
                                            resolved = true;
                                            clearTimeout(toId);
                                            defer.reject(new ex.ActivityRuntimeError("Workflow has been completed before bookmark '" + name + "' reached."));
                                        }
                                        else
                                        {
                                            // Idle
                                            if (new Date().getTime() - startTime > self.commandTimeout)
                                            {
                                                resolved = true;
                                                clearTimeout(toId);
                                                rejectWithTimeout();
                                            }
                                            else
                                            {
                                                process.nextTick(wait);
                                            }
                                        }
                                    }
                                    else
                                    {
                                        resolved = true;
                                        clearTimeout(toId);
                                        defer.resolve();
                                    }
                                }
                                else if (reason === enums.ActivityStates.cancel)
                                {
                                    resolved = true;
                                    clearTimeout(toId);
                                    defer.reject(new ex.ActivityRuntimeError("Workflow has been cancelled before bookmark '" + name + "' reached."));
                                }
                                else if (reason === enums.ActivityStates.fail)
                                {
                                    resolved = true;
                                    clearTimeout(toId);
                                    defer.reject(new ex.ActivityRuntimeError("Workflow execution has been failed before bookmark '" + name + "' reached."));
                                }
                            }
                            catch (e)
                            {
                                defer.reject(e);
                            }
                        }
                    });
            };
            wait();
            self._context.resumeBookmarkExternal(name, reason, result);
        }
        else
        {
            throw new ex.ActivityRuntimeError("Cannot resume bookmark, while the workflow is not in the idle state.");
        }
    }
    catch (e)
    {
        defer.reject(e);
    }

    return defer.promise;
}

module.exports = ActivityExecutionEngine;