"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");

function Not() {
    Activity.call(this);

    this.isTrue = true;
    this.isFalse = false;
}

util.inherits(Not, Activity);

Not.prototype.run = function (callContext, args) {
    callContext.schedule(args, "_argsGot");
};

Not.prototype._argsGot = function (callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    let isTrue = false;
    if (_.isArray(result) && result.length > 0) {
        isTrue = result[0] ? true : false;
    }

    if (isTrue) {
        callContext.schedule(this.isFalse, "_done");
    }
    else {
        callContext.schedule(this.isTrue, "_done");
    }
};

Not.prototype._done = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = Not;