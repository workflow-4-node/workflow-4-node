var Activity = require("./activity");
var ActivityExecutionContext = require("./activityExecutionContext");
var ActivityExecutionState = require("./activityExecutionState");
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var errors = require("../common/errors");
var _ = require("lodash");
var TrackingParticipant = require("./trackingParticipant");
var enums = require("../common/enums");
var Promise = require("bluebird");

function ActivityExecutionEngine(rootActivity)
{
    if (!(rootActivity instanceof Activity)) throw new TypeError("Argument 'rootActivity' is not an activity.");
    this._rootActivity = rootActivity;
    this._context = new ActivityExecutionContext();
    this._isInitialized = false;
    this._rootState = null;
    this._trackers = [];
    this._hookContext();
    this._timestamp = null;
}

util.inherits(ActivityExecutionEngine, EventEmitter);

Object.defineProperties(ActivityExecutionEngine.prototype, {
    rootActivity: {
        get: function()
        {
            return this._rootActivity;
        }
    },
    execState: {
        get: function()
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
    },
    version: {
        get: function()
        {
            return this._rootActivity.version;
        }
    },
    timestamp: {
        get: function ()
        {
            return this._timestamp;
        }
    }
})

ActivityExecutionEngine.prototype._initialize = function()
{
    if (!this._isInitialized)
    {
        this._context.initialize(this._rootActivity);
        this._isInitialized = true;
    }
}

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
                self._timestamp = new Date();
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

ActivityExecutionEngine.prototype.removeTracker = function (tracker)
{
    var idx = this._trackers.indexOf(tracker);
    if (idx != -1) this._trackers.splice(idx, 1);
}

ActivityExecutionEngine.prototype.start = function ()
{
    this._verifyNotStarted();

    this._initialize();

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
    var self = this;

    self._verifyNotStarted();

    self._initialize();

    var argRemoveToken = null;
    var args = [];
    Array.prototype.forEach.call(
        arguments, function (a)
        {
            args.push(a);
        });
    if (args.length) argRemoveToken = self._context.appendToContext(args);
    args.unshift(self._context);

    return new Promise(function(resolve, reject)
    {
        try
        {
            self._setRootState(self._context.getState(self._rootActivity.id));
            self.once(
                Activity.states.end, function (reason, result)
                {
                    try
                    {
                        switch (reason)
                        {
                            case Activity.states.complete:
                                resolve(result);
                                break;
                            case Activity.states.cancel:
                                reject(new errors.Cancelled());
                                break;
                            case Activity.states.idle:
                                reject(new errors.Idle());
                                break;
                            default :
                                result = result || new errors.ActivityRuntimeError("Unknown error.");
                                reject(result);
                                break;
                        }
                    }
                    finally
                    {
                        if (argRemoveToken)
                        {
                            self._context.removeFromContext(argRemoveToken);
                            argRemoveToken = null;
                        }
                    }
                });

            self._rootActivity.start.apply(self._rootActivity, args);
        }
        catch (e)
        {
            reject(e);

            if (argRemoveToken)
            {
                self._context.removeFromContext(argRemoveToken);
                argRemoveToken = null;
            }
        }
    });
}

ActivityExecutionEngine.prototype._verifyNotStarted = function ()
{
    if (this.execState != null) throw new errors.ActivityStateExceptionError("Workflow has been started already.");
}

ActivityExecutionEngine.prototype.resumeBookmark = function (name, reason, result)
{
    var self = this;
    self._initialize();
    return new Promise(function(resolve, reject)
    {
        try
        {
            if (self.execState == enums.ActivityStates.idle)
            {
                self.once(
                    Activity.states.end, function (reason, result)
                    {
                        try
                        {
                            if (reason === enums.ActivityStates.complete || reason === enums.ActivityStates.idle)
                            {
                                if (self._context.isBookmarkExists(name))
                                {
                                    if (reason === enums.ActivityStates.complete)
                                    {
                                        reject(new errors.ActivityRuntimeError("Workflow has been completed before bookmark '" + name + "' reached."));
                                    }
                                    else
                                    {
                                        reject(new errors.Idle("Workflow has been completed before bookmark '" + name + "' reached."));
                                    }
                                }
                                else
                                {
                                    resolve();
                                }
                            }
                            else if (reason === enums.ActivityStates.cancel)
                            {
                                reject(new errors.ActivityRuntimeError("Workflow has been cancelled before bookmark '" + name + "' reached."));
                            }
                            else if (reason === enums.ActivityStates.fail)
                            {
                                reject(result);
                            }
                        }
                        catch (e)
                        {
                            reject(e);
                        }
                    });
                self._context.resumeBookmarkExternal(name, reason, result);
            }
            else
            {
                reject(new errors.ActivityRuntimeError("Cannot resume bookmark, while the workflow is not in the idle state."));
            }
        }
        catch (e)
        {
            reject(e);
        }
    });
}

/* SERIALIZATION */
ActivityExecutionEngine.prototype.getStateAndPromotions = function()
{
    this._initialize();
    return this._context.getStateAndPromotions();
}

ActivityExecutionEngine.prototype.setState = function(json)
{
    if (!_.isObject(json)) throw new TypeError("Object argument expected.");

    this._initialize();
    this._timestamp = new Date();
    this._context.setState(json);
}
/* SERIALIZATION */

module.exports = ActivityExecutionEngine;