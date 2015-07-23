"use strict";

let Activity = require("./activity");
let util = require("util");
let errors = require("../common/errors");
let _ = require("lodash");

function EndMethod() {
    Activity.call(this);
    this.methodName = "";
    this.instanceIdPath = "";
    this.result = null;
}

util.inherits(EndMethod, Activity);

EndMethod.prototype.run = function (callContext, args) {
    let methodName = this.methodName;
    if (_(methodName).isString()) {
        let mn = methodName.trim();
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
