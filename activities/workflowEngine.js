var Activity = require("./activity");
var ActivityExecutionContext = require("./activityExecutionContext");
var ActivityExecutionState = require("./activityExecutionState");
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var ex = require("./ActivityExceptions");
var Q = require("q");
var _ = require("underscore-node");
var TrackingParticipant = require("./TrackingParticipant");
var enums = require("./enums");

function WorkflowEngine(rootActivity)
{
    if (!(rootActivity instanceof Activity)) throw new TypeError("Argument 'rootActivity' is not an activity.");
    this._rootActivity = rootActivity;
    this._context = new ActivityExecutionContext();
    this._context.initialize(this._rootActivity);
    this._rootState = null;
    this._trackers = [];
    this._hookContext();
    this.resumeTimeout = 3000;
}

util.inherits(WorkflowEngine, EventEmitter);

WorkflowEngine.prototype._setRootState = function (state)
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

WorkflowEngine.prototype._hookContext = function ()
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

WorkflowEngine.prototype.addTracker = function (tracker)
{
    if (!_.isObject(tracker)) throw new TypeError("Parameter is not an object.");
    this._trackers.push(new TrackingParticipant(tracker));
}

WorkflowEngine.prototype.start = function ()
{
    var args = [ this._context ];
    Array.prototype.forEach.call(
        arguments, function (a)
        {
            args.push(a);
        });
    this._setRootState(this._rootActivity.start.apply(this._rootActivity, args));
}

WorkflowEngine.prototype.invoke = function ()
{
    var defer = Q.defer();
    try
    {
        var argRemoveToken = null;
        var args = [];
        Array.prototype.forEach.call(
            arguments, function (a)
            {
                args.push(a);
            });
        if (args.length) argRemoveToken = this._context.appendToContext(args);
        args.unshift(this._context);

        this._setRootState(this._context.getState(this._rootActivity.id));
        this.once(
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
                            defer.reject(new ex.Idle());
                            break;
                        default :
                            result = result || new ex.ActivityStateExceptionError("Unknonw error.");
                            defer.reject(result);
                            break;
                    }
                }
                finally
                {
                    if (argRemoveToken) this._context.removeFromContext(argRemoveToken);
                }
            });

        this._rootActivity.start.apply(this._rootActivity, args);
    }
    catch (e)
    {
        defer.reject(e);
    }
    return defer.promise;
}

WorkflowEngine.prototype.execState = function ()
{
    if (this._rootState)
    {
        return this._rootState.execState;
    }
    else
    {
        return null;
    }
}

WorkflowEngine.prototype.resumeBookmark = function (name, reason, result)
{
    var self = this;
    var defer = Q.defer();

    try
    {
        if (self.execState() == enums.ActivityStates.idle)
        {
            var timedOut = false;
            self._context.resumeBookmarkExternal(name, reason, result);
            var toId = setTimeout(
                function ()
                {
                    timedOut = true;
                },
                self.resumeTimeout);
            var wait = function()
            {
                self.once(
                    Activity.states.end, function (reason, result)
                    {
                        try
                        {
                            switch (reason)
                            {
                                // complete, idle: meg kell nezni, hogy a bookmark el-e meg, ha nem, akkor ok,
                                // ha igen, es complete, akkor fail,
                                // ha meg idle, akkor meg kell nezni, hogy lejart-e az ido, ha nem, akkor wait,
                                // egyebken fail, torolni kell a bookmark folytatast a kjkubol

                                // Cancel, Fail: elszall hibaval

                                // Ha nem waitot hivaunk, akkor torolni kell a timeoutot, ha nem timeout a hiba

//                                case Activity.states.complete:
//                                    defer.resolve(result);
//                                    break;
//                                case Activity.states.cancel:
//                                    defer.reject(new ex.Cancelled());
//                                    break;
//                                case Activity.states.idle:
//                                    defer.reject(new ex.Idle());
//                                    break;
//                                default :
//                                    result = result || new ex.ActivityStateExceptionError("Unknonw error.");
//                                    defer.reject(result);
//                                    break;
                            }
                        }
                        finally
                        {
                            if (argRemoveToken) self._context.removeFromContext(argRemoveToken);
                        }
                    });
            };
            wait();
        }
        else
        {
            throw new Error("Cannot resume bookmark, while the workflow is not in the idle state.");
        }
    }
    catch (e)
    {
        defer.reject(e);
    }

    return defer.promise;
}

module.exports = WorkflowEngine;