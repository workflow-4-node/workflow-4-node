var Activity = require("./activity");
var util = require("util");
var ex = require("./activityExceptions");

function EndMethod()
{
    this.methodName = "";
    this.instanceIdPath = "";
    this.result = null;
}

util.inherits(EndMethod, Activity);

EndMethod.prototype.run = function (context, args)
{
    if (_(this.methodName).isString())
    {
        var mn = this.methodName.trim();
        if (mn)
        {
            this.schedule(this.result, "_resultGot");
            return;
        }
    }
    this.fail(ex.ValidationError("EndMethod activity methodName property's value must be a valid identifier."));
}

EndMethod.prototype._resultGot = function(context, reason, result)
{
    this.end(reason, result);
}

module.exports = EndMethod;
