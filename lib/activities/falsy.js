var Activity = require("./activity");
var util = require("util");

function Falsy() {
    Activity.call(this);

    this.value = false;
    this.is = true;
    this.isNot = false;
}

util.inherits(Falsy, Activity);

Falsy.prototype.run = function(callContext, args) {
    callContext.schedule(this.get('value'), '_valueGot');
}

Falsy.prototype._valueGot = function(callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    if (result) {
        callContext.schedule(this.get('isNot'), '_done');
    }
    else {
        callContext.schedule(this.get('is'), '_done');
    }
}

Falsy.prototype._done = function(callContext, reason, result) {
    callContext.end(reason, result);
}

module.exports = Falsy;