"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let guids = require("../common/guids");
let WithBody = require("./withBody");

function When() {
    WithBody.call(this);

    this.condition = null;
}

util.inherits(When, WithBody);

When.prototype.run = function (callContext, args) {
    callContext.schedule(this.get("condition"), "_conditionGot");
};

When.prototype._conditionGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (result) {
            WithBody.prototype.run.call(this, callContext);
        }
        else {
            callContext.complete(guids.markers.nope);
        }
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = When;