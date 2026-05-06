"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let constants = require("../common/constants");
let WithBody = require("./withBody");

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
        }
        else {
            callContext.complete(constants.markers.nope);
        }
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = When;