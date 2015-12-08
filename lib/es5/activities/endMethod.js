"use strict";

var Activity = require("./activity");
var util = require("util");
var errors = require("../common/errors");
var _ = require("lodash");

function EndMethod() {
    Activity.call(this);
    this.methodName = null;
    this.instanceIdPath = null;
    this.result = null;
}

util.inherits(EndMethod, Activity);

EndMethod.prototype.run = function (callContext, args) {
    var methodName = this.methodName;
    if (_.isString(methodName)) {
        var mn = methodName.trim();
        if (mn) {
            callContext.schedule(this.result, "_resultGot");
            return;
        }
    }
    callContext.fail(new errors.ValidationError("EndMethod activity methodName property's value must be a valid identifier."));
};

EndMethod.prototype._resultGot = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = EndMethod;
//# sourceMappingURL=endMethod.js.map
