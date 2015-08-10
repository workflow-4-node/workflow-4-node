"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let specStrings = require("../common/specStrings");
let errors = require("../common/errors");

function BeginMethod() {
    Activity.call(this);
    this.canCreateInstance = false;
    this.methodName = "";
    this.instanceIdPath = "";
}

util.inherits(BeginMethod, Activity);

BeginMethod.prototype.run = function (callContext, args) {
    let methodName = this.methodName;
    if (_.isString(methodName)) {
        let mn = methodName.trim();
        if (mn) {
            callContext.createBookmark(specStrings.hosting.createBeginMethodBMName(mn), "_methodInvoked");
            callContext.idle();
            return;
        }
    }
    this.fail(new errors.ValidationError("BeginMethod activity methodName property's value must be a valid identifier."));
};

BeginMethod.prototype._methodInvoked = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = BeginMethod;