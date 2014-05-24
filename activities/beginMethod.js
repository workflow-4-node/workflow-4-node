var Activity = require("./activity");
var util = require("util");
var _ = require("underscore-node");
var specStrings = require("../common/specStrings");
var ex = require("./activityExceptions");

function BeginMethod()
{
    this.canCreateInstance = false;
    this.methodName = "";
    this.instanceIdPath = "";
}

util.inherits(BeginMethod, Activity);

BeginMethod.prototype.run = function (context, args)
{
    if (_(this.methodName).isString())
    {
        var mn = this.methodName.trim();
        if (mn)
        {
            this.createBookmark(specStrings.hosting.createBeginMethodBMName(mn), "_methodInvoked");
            this.idle();
            return;
        }
    }
    this.fail(new ex.ValidationError("BeginMethod activity methodName property's value must be a valid identifier."));
}

BeginMethod.prototype._methodInvoked = function(context, reason, result)
{
    this.end(reason, result);
}

module.exports = BeginMethod;