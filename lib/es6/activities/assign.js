var Activity = require("./activity");
var util = require("util");

function Assign() {
    Activity.call(this);
    this.value = null;
    this.to = "";
}

util.inherits(Assign, Activity);

Assign.prototype.run = function (callContext, args) {
    if (this.get("to")) {
        callContext.schedule(this.get("value"), "_valueGot");
    }
    else {
        callContext.complete();
    }
}

Assign.prototype._valueGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        this.set(this.get("to"), result);
    }
    callContext.end(reason, result);
}

module.exports = Assign;