var Activity = require("./activity");
var util = require("util");

function Assign()
{
    Activity.call(this);
    this.value = null;
    this.to = "";
}

util.inherits(Assign, Activity);

Assign.prototype.run = function (callContext, args)
{
    if (this.to)
    {
        callContext.schedule(this.value, "_valueGot");
    }
    else
    {
        callContext.complete();
    }
}

Assign.prototype._valueGot = function(callContext, reason, result)
{
    if (reason === Activity.states.complete)
    {
        this[this.to] = result;
    }
    callContext.end(reason, result);
}

module.exports = Assign;