"use strict";

var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");

function Emit() {
    Activity.call(this);
}

util.inherits(Emit, Activity);

Emit.prototype.run = function (callContext, args) {
    callContext.schedule(args, "_argsGot");
};

Emit.prototype._argsGot = function (callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    if (result && result.length) {
        callContext.emitWorkflowEvent(result);
    }

    callContext.complete();
};

module.exports = Emit;
//# sourceMappingURL=emit.js.map
