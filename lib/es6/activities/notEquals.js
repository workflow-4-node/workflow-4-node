var Activity = require("./activity");
var util = require("util");

function NotEquals() {
    Activity.call(this);

    this.value = null;
    this.to = null;
    this.is = true;
    this.isNot = false;
    this.strict = false;
}

util.inherits(NotEquals, Activity);

NotEquals.prototype.run = function(callContext, args) {
    callContext.schedule([this.get('value'), this.get('to')], '_valueAndToGot');
}

NotEquals.prototype._valueAndToGot = function(callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    if (this.get("strict") ? result[0] === result[1] : result[0] == result[1]) {
        callContext.schedule(this.get('isNot'), '_done');
    }
    else {
        callContext.schedule(this.get('is'), '_done');
    }
}

NotEquals.prototype._done = function(callContext, reason, result) {
    callContext.end(reason, result);
}

module.exports = NotEquals;