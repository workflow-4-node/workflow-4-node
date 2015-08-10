"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let specStrings = require("../common/specStrings");
let errors = require("../common/errors");

function DelayTo() {
    Activity.call(this);

    this.to = null;
}

util.inherits(DelayTo, Activity);

DelayTo.prototype.run = function (callContext, args) {
    let to = this.to;
    if (_.isDate(to)) {
        callContext.createBookmark(specStrings.hosting.createDelayToBMName(to), "_timeElapsed");
        callContext.idle();
        return;
    }
    this.fail(new errors.ValidationError("DelayTo activity to property's value must be a valid Date object."));
};

DelayTo.prototype._timeElapsed = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = DelayTo;