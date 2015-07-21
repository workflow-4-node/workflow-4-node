"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");

function Or() {
    Activity.call(this);

    this.isTrue = true;
    this.isFalse = false;
}

util.inherits(Or, Activity);

Or.prototype.run = function (callContext, args) {
    callContext.schedule(args, "_argsGot");
};

Or.prototype._argsGot = function(callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    let isTrue = false;
    for (let v of result) {
        isTrue = (v ? true : false) || isTrue;
    }

    if (isTrue) {
        callContext.schedule(this.get("isTrue"), "_done");
    }
    else {
        callContext.schedule(this.get("isFalse"), "_done");
    }
};

Or.prototype._done = function(callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = Or;