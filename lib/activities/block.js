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
        callContext.schedule(args[0], "_argGot");
    }
    else
    {
        callContext.end(Activity.states.complete, null);
    }
}

Block.prototype._argGot = function (callContext, reason, result)
{
    if (reason === Activity.states.complete)
    {
        if (this._todo.length === 0)
        {
            callContext.complete(result);
        }
        else
        {
            callContext.schedule(this._todo.pop(), "_argGot");
        }
    }
    else
    {
        callContext.end(reason, result);
    }
}

module.exports = Block;