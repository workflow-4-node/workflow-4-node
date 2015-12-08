"use strict";

var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var constants = require("../common/constants");
var WithBody = require("./withBody");

function When() {
    WithBody.call(this);

    this.condition = null;
}

util.inherits(When, WithBody);

When.prototype.run = function (callContext, args) {
    callContext.schedule(this.condition, "_conditionGot");
};

When.prototype._conditionGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (result) {
            WithBody.prototype.run.call(this, callContext);
        } else {
            callContext.complete(constants.markers.nope);
        }
    } else {
        callContext.end(reason, result);
    }
};

module.exports = When;
//# sourceMappingURL=when.js.map
