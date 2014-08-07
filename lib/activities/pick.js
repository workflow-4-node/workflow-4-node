var Activity = require("./activity");
var util = require("util");
var Declarator = require("./declarator");
var errors = require("../common/errors");

function Pick()
{
    Declarator.call(this);
}

util.inherits(Pick, Declarator);

Pick.prototype.varsDeclared = function (callContext, args)
{
    if (args && args.length)
    {
        this.__collectPick = true;
        this.schedule(callContext, args, "_argsGot");
    }
    else
    {
        this.complete(callContext, []);
    }
}

Pick.prototype._argsGot = function(callContext, reason, result)
{
    this.end(callContext, reason, result);
}

module.exports = Pick;
