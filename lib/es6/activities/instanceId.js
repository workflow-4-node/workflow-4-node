"use strict";

let Activity = require("./activity");
let util = require("util");

function InstanceId() {
    Activity.call(this);
}

util.inherits(InstanceId, Activity);

InstanceId.prototype.run = function(callContext, args) {
    if (callContext.executionContext.engine && callContext.executionContext.engine.instance) {
        callContext.complete(callContext.executionContext.engine.instance.id);
    }
    else {
        callContext.complete(null);
    }
};

module.exports = InstanceId;