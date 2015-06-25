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
    var condition = this.get("condition");
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
            var thenBody = this.get("thenBody");
            if (thenBody) {
                callContext.schedule(thenBody, "_bodyFinished");
                return;
            }
        }
        else {
            var elseBody = this.get("elseBody");
            if (elseBody) {
                callContext.schedule(elseBody, "_bodyFinished");
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
