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
    this.fail(new errors.ValidationError("BeginMethod activity methodName property's value must be a valid identifier."));
}

BeginMethod.prototype._methodInvoked = function(context, reason, result)
{
    this.end(reason, result);
}

module.exports = BeginMethod;