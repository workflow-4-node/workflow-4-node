var Activity = require("./activity");
var util = require("util");
var Declarator = require("./declarator");
var ex = require("./ActivityExceptions");

function Pick()
{
    Declarator.call(this);
}

util.inherits(Pick, Declarator);

Pick.prototype.varsDeclared = function (context, args)
{
    if (args && args.length)
    {
        // Monkeypatching FTW!
        this._prevArgCollected = this._argCollected;
        this._argCollected = function(context, reason, result, bookmarkName)
        {
            if (!this._picked && reason == Activity.states.complete) this._picked = result;
            this.unschedule();
            this._prevArgCollected.call(this, context, reason, result, bookmarkName);
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
    if (reason == Activity.states.complete)
    {
        if (this._picked == undefined) throw new ex.ActivityRuntimeError("There should be a picked value so far!");
        this.complete(this._picked);
    }
    else
    {
        this.end(reason, result);
    }
}

module.exports = Pick;
