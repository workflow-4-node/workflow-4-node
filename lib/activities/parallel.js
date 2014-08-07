var Activity = require("./activity");
var util = require("util");
var Declarator = require("./declarator");
var errors = require("../common/errors");

function Parallel()
{
    Declarator.call(this);
}

util.inherits(Parallel, Declarator);

Parallel.prototype.varsDeclared = function (callContext, args)
{
    if (args && args.length)
    {
        this.schedule(callContext, args, "_argsGot");
    }
    else
    {
        this.complete(callContext, []);
    }
}

Parallel.prototype._argsGot = function(callContext, reason, result)
{
    this.end(callContext, reason, result);
}

module.exports = Parallel;