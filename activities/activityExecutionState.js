var EventEmitter = require('events').EventEmitter;
var util = require("util");
var enums = require("./../common/enums");

function ActivityExecutionState(activityId)
{
    this.activityId = activityId;
    this.execState = null;
    this.parentActivityId = null;
    this.childActivityIds = [];
}

util.inherits(ActivityExecutionState, EventEmitter);

Object.defineProperties(ActivityExecutionState.prototype, {
    isRunning: {
        get: function()
        {
            return this.execState == enums.ActivityStates.run;
        }
    }
});

module.exports = ActivityExecutionState;
