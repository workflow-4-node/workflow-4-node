var Activity = require('./activity');
var util = require('util');

function If() {
    Activity.call(this);

    this.condition = null;
    this.thenBody = null;
    this.elseBody = null;
}

util.inherits(If, Activity);

If.prototype.run = function (callContext, args) {
    if (this.condition) {
        callContext.schedule(this.condition, "_conditionGot");
    }
    else {
        callContext.complete();
    }
}

If.prototype._conditionGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (result) {
            if (this.thenBody) {
                callContext.schedule(this.thenBody, "_bodyFinished");
                return;
            }
        }
        else {
            if (this.elseBody) {
                callContext.schedule(this.elseBody, "_bodyFinished");
                return;
            }
        }
        callContext.complete();
    }
    else {
        callContext.end(reason, result);
    }
}

If.prototype._bodyFinished = function (callContext, reason, result) {
    callContext.end(reason, result);
}

module.exports = If;
