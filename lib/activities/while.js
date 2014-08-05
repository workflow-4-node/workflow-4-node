var Activity = require("./activity");
var util = require("util");

function While()
{
    Activity.call(this);

    this.condition = null;
    this.body = null;
}

util.inherits(While, Activity);

While.prototype.run = function (callContext, args)
{
    if (this.condition)
    {
        this.schedule(callContext, this.condition, "_conditionGot");
    }
    else
    {
        this.complete(callContext);
    }
}

While.prototype._conditionGot = function(callContext, reason, result)
{
    if (reason === Activity.states.complete)
    {
        if (!result)
        {
            this.complete(callContext, this._lastBodyResult);
        }
        else
        {
            this.schedule(callContext, this.body, "_bodyFinished");
        }
    }
    else
    {
        this.end(callContext, reason, result);
    }
}

While.prototype._bodyFinished = function(callContext, reason, result)
{
    if (reason === Activity.states.complete)
    {
        this._lastBodyResult = result;
        this.schedule(callContext, this.condition, "_conditionGot");
    }
    else
    {
        this.end(callContext, reason, result);
    }
}

module.exports = While;