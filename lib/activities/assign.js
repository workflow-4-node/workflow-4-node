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
        this.schedule(callContext, this.value, "_valueGot");
    }
    else
    {
        this.complete(callContext);
    }
}

Assign.prototype._valueGot = function(callContext, reason, result)
{
    if (reason === Activity.states.complete)
    {
        this[this.to] = result;
    }
    this.end(callContext, reason, result);
}

module.exports = Assign;