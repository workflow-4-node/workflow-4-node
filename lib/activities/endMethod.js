var Activity = require("./activity");
var util = require("util");
var errors = require("../common/errors");
var _ = require("lodash");

function EndMethod() {
    Activity.call(this);
    this.methodName = "";
    this.instanceIdPath = "";
    this.result = null;
}

util.inherits(EndMethod, Activity);

EndMethod.prototype.run = function (callContext, args) {
    var methodName = this.get("methodName");
    if (_(methodName).isString()) {
        var mn = methodName.trim();
        if (mn) {
            callContext.schedule(this.get("result"), "_resultGot");
            return;
        }
    }
    callContext.fail(new errors.ValidationError("EndMethod activity methodName property's value must be a valid identifier."));
}

EndMethod.prototype._resultGot = function (callContext, reason, result) {
    callContext.end(reason, result);
}

module.exports = EndMethod;
