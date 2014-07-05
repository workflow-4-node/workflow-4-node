var Activity = require("./activity");
var util = require("util");

function While()
{
    Activity.call(this);

    this.condition = null;
    this.body = null;
}

util.inherits(While, Activity);

While.prototype.run = function (context, args)
{
    if (this.condition)
    {
        this.schedule(this.condition, "_conditionGot");
    }
    else
    {
        this.complete();
    }
}

While.prototype._conditionGot = function(context, reason, result)
{
    if (reason === Activity.states.complete)
    {
        if (!result)
        {
            this.complete(this._lastBodyResult);
        }
        else
        {
            this.schedule(this.body, "_bodyFinished");
        }
    }
    else
    {
        this.end(reason, result);
    }
}

While.prototype._bodyFinished = function(context, reason, result)
{
    if (reason === Activity.states.complete)
    {
        this._lastBodyResult = result;
        this.schedule(this.condition, "_conditionGot");
    }
    else
    {
        this.end(reason, result);
    }
}

module.exports = While;