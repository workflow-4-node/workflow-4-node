"use strict";

let Activity = require("./activity");
let util = require("util");

function Truthy() {
    Activity.call(this);

    this.value = false;
    this.is = true;
    this.isNot = false;
}

util.inherits(Truthy, Activity);

Truthy.prototype.run = function(callContext, args) {
    callContext.schedule(this.value, "_valueGot");
};

Truthy.prototype._valueGot = function(callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    if (result) {
        callContext.schedule(this.is, "_done");
    }
    else {
        callContext.schedule(this.isNot, "_done");
    }
};

Truthy.prototype._done = function(callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = Truthy;