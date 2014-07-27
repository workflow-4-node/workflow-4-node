var Activity = require("./activity");
var util = require("util");

function Assign()
{
    Activity.call(this);
    this.value = null;
    this.to = "";
}

util.inherits(Assign, Activity);

Assign.prototype.run = function (context, args)
{
    if (this.to)
    {
        this.schedule(this.value, "_valueGot");
    }
    else
    {
        this.complete();
    }
}

Assign.prototype._valueGot = function(context, reason, result)
{
    if (reason === Activity.states.complete)
    {
        this[this.to] = result;
    }
    this.end(reason, result);
}

module.exports = Assign;