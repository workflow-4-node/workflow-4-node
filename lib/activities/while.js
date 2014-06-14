var Activity = require("./activity");
var util = require("util");

function While()
{
    Activity.call(this);

    this.predicate = null;
    this.body = null;
}

util.inherits(While, Activity);

While.prototype.run = function (context, args)
{
    if (this.predicate)
    {
        this.schedule(this.predicate, "_predicateGot");
    }
    else
    {
        this.complete();
    }
}

While.prototype._predicateGot = function(context, reason, result)
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
        this.schedule(this.predicate, "_predicateGot");
    }
    else
    {
        this.end(reason, result);
    }
}

module.exports = While;