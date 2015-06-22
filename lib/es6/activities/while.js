var Activity = require("./activity");
var util = require("util");

function While() {
    Activity.call(this);

    this.condition = null;
    this.body = null;
}

util.inherits(While, Activity);

While.prototype.run = function (callContext, args) {
    var condition = this.get("condition");
    if (condition) {
        callContext.schedule(condition, "_conditionGot");
    }
    else {
        callContext.complete();
    }
}

While.prototype._conditionGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (!result) {
            callContext.complete(this.get("_lastBodyResult"));
        }
        else {
            callContext.schedule(this.get("body"), "_bodyFinished");
        }
    }
    else {
        callContext.end(reason, result);
    }
}

While.prototype._bodyFinished = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        this.set("_lastBodyResult", result);
        callContext.schedule(this.get("condition"), "_conditionGot");
    }
    else {
        callContext.end(reason, result);
    }
}

module.exports = While;