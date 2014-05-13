var Activity = require("./activity");
var ActivityExecutionContext = require("./activityExecutionContext");
var ActivityExecutionState = require("./activityExecutionState");
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var ex = require("./ActivityExceptions");
var Q = require("q");

function WorkflowEngine(rootActivity)
{
    if (!(rootActivity instanceof Activity)) throw new TypeError("Argument 'rootActivity' is not an activity.");
    this._rootActivity = rootActivity;
    this._context = new ActivityExecutionContext();
    this._rootState = null;
}

util.inherits(WorkflowEngine, EventEmitter);

WorkflowEngine.prototype._setRootState = function(state)
{
    var self = this;
    if (!self._rootState)
    {
        self._rootState = state;
        self._rootState.on(Activity.states.cancel, function()
        {
            self.emit(Activity.states.cancel);
        });
        self._rootState.on(Activity.states.complete, function(result)
        {
            self.emit(Activity.states.complete, result);
        });
        self._rootState.on(Activity.states.end, function(reason, result)
        {
            self.emit(Activity.states.end, reason, result);
        });
        self._rootState.on(Activity.states.fail, function(e)
        {
            self.emit(Activity.states.fail, e);
        });
        self._rootState.on(Activity.states.run, function()
        {
            self.emit(Activity.states.run);
        });
        self._rootState.on(Activity.states.idle, function()
        {
            try
            {
                if (self._context.processResumeBookmarkQueue(self._rootActivity.id))
                {
                    // There was idle continutations, so we should not emit anything there.
                    return;
                }
                else
                {
                    self.emit(Activity.states.idle);
                }
            }
            catch (e)
            {
                self.emit(Activity.states.fail, e);
            }
        });
    }
}

WorkflowEngine.prototype.start = function ()
{
    var args = [ this._context ];
    Array.prototype.forEach.call(arguments, function (a) { args.push(a); });
    this._setRootState(this._rootActivity.start.apply(this._rootActivity, args));
}

WorkflowEngine.prototype.invoke = function ()
{
    var defer = Q.defer();
    try
    {
        this._setRootState(this._context.getState(this._rootActivity.id));
        this._rootState.once(Activity.states.end, function (reason, result)
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
        });
        var args = [ this._context ];
        Array.prototype.forEach.call(arguments, function (a) { args.push(a); });
        this._rootActivity.start.apply(this._rootActivity, args);
    }
    catch (e)
    {
        defer.reject(e);
    }
    return defer.promise;
}

WorkflowEngine.prototype.resumeBookmark = function(name, reason, result)
{
    // TODO: Try to resume, and handle timeout. Result is Q -> bookmark resumed if complete or idle, and it doesn't exist.
}

module.exports = WorkflowEngine;