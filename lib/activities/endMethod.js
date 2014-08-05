var Activity = require("./activity");
var util = require("util");
var errors = require("../common/errors");
var _ = require("lodash");

function EndMethod()
{
    Activity.call(this);
    this.methodName = "";
    this.instanceIdPath = "";
    this.result = null;
}

util.inherits(EndMethod, Activity);

EndMethod.prototype.run = function (callContext, args)
{
    if (_(this.methodName).isString())
    {
        var mn = this.methodName.trim();
        if (mn)
        {
            this.schedule(callContext, this.result, "_resultGot");
            return;
        }
    }
    this.fail(callContext, new errors.ValidationError("EndMethod activity methodName property's value must be a valid identifier."));
}

EndMethod.prototype._resultGot = function(callContext, reason, result)
{
    this.end(callContext, reason, result);
}

module.exports = EndMethod;
