var Activity = require("./activity");
var util = require("util");
var Declarator = require("./declarator");

function Block()
{
    Declarator.call(this);
    this.bubu = "kaka";
}

util.inherits(Block, Declarator);

Block.prototype.varsDeclared = function (context, args)
{
    if (args.length)
    {
        this._todo = [];
        for (var i = args.length - 1; i >= 1; i--)
        {
            this._todo.push(args[i]);
        }
        this.schedule(args[0], "_argGot");
    }
    else
    {
        this.end(Activity.states.complete, null);
    }
}

Block.prototype._argGot = function (context, reason, result)
{
    if (reason == Activity.states.complete)
    {
        if (this._todo.length == 0)
        {
            this.complete(result);
        }
        else
        {
            this.schedule(this._todo.pop(), "_argGot");
        }
    }
    else
    {
        this.end(reason, result);
    }
}

module.exports = Block;