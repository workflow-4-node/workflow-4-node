var EventEmitter = require('events').EventEmitter;
var util = require("util");
var enums = require("./enums");

function ActivityExecutionState(activityId)
{
    this.activityId = activityId;
    this.execState = enums.ActivityStates.idle;
    this.parentActivityId = null;
    this.childActivityIds = [];
}

util.inherits(ActivityExecutionState, EventEmitter);

ActivityExecutionState.prototype.isRunning = function()
{
    return this.execState == enums.ActivityStates.run;
}

module.exports = ActivityExecutionState;
