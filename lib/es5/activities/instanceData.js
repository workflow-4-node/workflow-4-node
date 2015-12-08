"use strict";

var Activity = require("./activity");
var util = require("util");

function InstanceData() {
    Activity.call(this);
}

util.inherits(InstanceData, Activity);

InstanceData.prototype.run = function (callContext, args) {
    if (callContext.executionContext.engine && callContext.executionContext.engine.instance) {
        var insta = callContext.executionContext.engine.instance;
        callContext.complete({
            workflowName: insta.workflowName,
            workflowVersion: insta.workflowVersion,
            instanceId: insta.id
        });
    } else {
        callContext.complete(null);
    }
};

module.exports = InstanceData;
//# sourceMappingURL=instanceData.js.map
