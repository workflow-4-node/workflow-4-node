"use strict";

let Activity = require("./activity");
let util = require("util");

function If() {
    Activity.call(this);

    this.condition = null;
    this.then = null;
    this.else = null;
}

util.inherits(If, Activity);

If.prototype.run = function (callContext, args) {
    let condition = this.condition;
    if (condition) {
        callContext.schedule(condition, "_conditionGot");
    }
    else {
        callContext.complete();
    }
};

If.prototype._conditionGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (result) {
            let then = this.then;
            if (then) {
                callContext.schedule(then, "_bodyFinished");
                return;
            }
        }
        else {
            let _else = this.else;
            if (_else) {
                callContext.schedule(_else, "_bodyFinished");
                return;
            }
        }
        callContext.complete();
    }
    else {
        callContext.end(reason, result);
    }
};

If.prototype._bodyFinished = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = If;
