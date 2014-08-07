var Activity = require("./activity");
var util = require("util");
var Declarator = require("./declarator");

function Block()
{
    Declarator.call(this);
}

util.inherits(Block, Declarator);

Block.prototype.varsDeclared = function (callContext, args)
{
    if (args.length)
    {
        this._todo = [];
        for (var i = args.length - 1; i >= 1; i--)
        {
            this._todo.push(args[i]);
        }
        this.schedule(callContext, args[0], "_argGot");
    }
    else
    {
        this.end(callContext, Activity.states.complete, null);
    }
}

Block.prototype._argGot = function (callContext, reason, result)
{
    if (reason === Activity.states.complete)
    {
        if (this._todo.length === 0)
        {
            this.complete(callContext, result);
        }
        else
        {
            this.schedule(callContext, this._todo.pop(), "_argGot");
        }
    }
    else
    {
        this.end(callContext, reason, result);
    }
}

module.exports = Block;