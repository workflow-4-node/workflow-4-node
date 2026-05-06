"use strict";

let Activity = require("./activity");
let util = require("util");
let WithBody = require("./withBody");

function While() {
    WithBody.call(this);

    this.condition = null;
}

util.inherits(While, WithBody);

While.prototype.run = function (callContext, args) {
    let condition = this.condition;
    if (condition) {
        callContext.schedule(condition, "_conditionGot");
    }
    else {
        callContext.complete();
    }
};

While.prototype._conditionGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (!result) {
            callContext.complete(this._lastBodyResult);
        }
        else {
            WithBody.prototype.run.call(this, callContext);
        }
    }
    else {
        callContext.end(reason, result);
    }
};

While.prototype.bodyCompleted = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        this._lastBodyResult = result;
        callContext.schedule(this.condition, "_conditionGot");
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = While;