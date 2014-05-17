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
    this._pickedReason = null;
    this._pickedResult = null;
    if (args && args.length)
    {
        // Monkeypatching FTW!
        var prevArgCollected = this.argCollected;
        this.argCollected = function(context, reason, result, bookmarkName)
        {
            prevArgCollected.call(this, context, reason, result, bookmarkName);
            if (!this._pickedReason)
            {
                this._pickedReason = reason;
                this._pickedResult = result;
                this.unschedule();
            }
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
