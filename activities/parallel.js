var Activity = require("./activity");
var util = require("util");
var Declarator = require("./declarator");
var ex = require("./ActivityExceptions");

function Parallel()
{
    Declarator.call(this);
}

util.inherits(Parallel, Declarator);

Parallel.prototype.varsDeclared = function (context, args)
{
    if (args && args.length)
    {
        this.schedule(args, "_argsGot");
    }
    else
    {
        this.complete([]);
    }
}

Parallel.prototype._argsGot = function(context, reason, result)
{
    this.end(reason, result);
}

module.exports = Parallel;