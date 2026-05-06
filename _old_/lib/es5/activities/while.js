"use strict";

var Activity = require("./activity");
var util = require("util");
var WithBody = require("./withBody");

function While() {
    WithBody.call(this);

    this.condition = null;
}

util.inherits(While, WithBody);

While.prototype.run = function (callContext, args) {
    var condition = this.condition;
    if (condition) {
        callContext.schedule(condition, "_conditionGot");
    } else {
        callContext.complete();
    }
};

While.prototype._conditionGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (!result) {
            callContext.complete(this._lastBodyResult);
        } else {
            WithBody.prototype.run.call(this, callContext);
        }
    } else {
        callContext.end(reason, result);
    }
};

While.prototype.bodyCompleted = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        this._lastBodyResult = result;
        callContext.schedule(this.condition, "_conditionGot");
    } else {
        callContext.end(reason, result);
    }
};

module.exports = While;
//# sourceMappingURL=while.js.map
