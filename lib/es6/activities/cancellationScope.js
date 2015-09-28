"use strict";

let Activity = require("./activity");
let util = require("util");
let errors = require("../common/errors");
let Block = require("./block");

function CancellationScope() {
    Activity.call(this);

    this.cancelled = null;
    this.arrayProperties.add("cancelled");
}

util.inherits(CancellationScope, Activity);

CancellationScope.prototype.initializeStructure = function () {
    this._body = new Block();
    this._body.args = this.args;
    this.args = null;
    if (this.cancelled) {
        let prev = this.cancelled;
        this.cancelled = new Block();
        this.cancelled.args = prev;
    }
};

CancellationScope.prototype.run = function (callContext, args) {
    callContext.schedule(this._body, "_bodyFinished");
};

CancellationScope.prototype._bodyFinished = function (callContext, reason, result) {
    if (this.cancelled &&
        (reason === Activity.states.cancel ||
         (reason === Activity.states.fail && result instanceof errors.Cancelled))) {
        callContext.schedule(this.cancelled);
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = CancellationScope;