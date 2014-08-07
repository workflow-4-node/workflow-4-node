var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var specStrings = require("../common/specStrings");
var errors = require("../common/errors");

function BeginMethod()
{
    Activity.call(this);
    this.canCreateInstance = false;
    this.methodName = "";
    this.instanceIdPath = "";
}

util.inherits(BeginMethod, Activity);

BeginMethod.prototype.run = function (callContext, args)
{
    if (_(this.methodName).isString())
    {
        var mn = this.methodName.trim();
        if (mn)
        {
            callContext.createBookmark(specStrings.hosting.createBeginMethodBMName(mn), "_methodInvoked");
            callContext.idle();
            return;
        }
    }
    this.fail(new errors.ValidationError("BeginMethod activity methodName property's value must be a valid identifier."));
}

BeginMethod.prototype._methodInvoked = function(callContext, reason, result)
{
    callContext.end(reason, result);
}

module.exports = BeginMethod;