var Activity = require("./activity");
var util = require("util");
var Declarator = require("./declarator");
var ex = require("./ActivityExceptions");

function Pick()
{
    Declarator.call(this);
    this.asReserved("_argsGot");
}

util.inherits(Pick, Declarator);

Pick.prototype.varsDeclared = function (context, args)
{
    if (args && args.length)
    {
        this._idleCounts = {};
        // Monkeypatching FTW!
        var prev = this.resultCollected;
        this.resultCollected = function(context, reason, result, bookmark)
        {
            if (reason === Activity.states.idle)
            {
                if (!this._idleCounts[bookmark]) this._idleCounts[bookmark] = 0;
                this._idleCounts[bookmark]++;
            }
            if (reason !== Activity.states.idle || this._idleCounts[bookmark] > 1)
            {
                this.unschedule(bookmark);
                this._pickedReason = reason;
                this._pickedResult = result;
            }
            prev.call(this, context, reason, result, bookmark);
        }
        this.schedule(args, "_argsGot");
    }
    else
    {
        this.complete([]);
    }
}

Pick.prototype._argsGot = function(context, reason, result)
{
    if (this._pickedReason)
    {
        this.end(this._pickedReason, this._pickedResult);
    }
    else
    {
        this.end(reason, result);
    }
}

module.exports = Pick;
