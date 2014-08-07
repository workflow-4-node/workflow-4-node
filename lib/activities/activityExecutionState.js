var EventEmitter = require('events').EventEmitter;
var util = require("util");
var enums = require("../common/enums");
var is = require("../common/is");
var StrSet = require("backpack-node").collections.StrSet;
var _ = require("lodash");

function ActivityExecutionState(activityId)
{
    this.activityId = activityId;
    this.execState = null;
    this.parentActivityId = null;
    this.childActivityIds = new StrSet();
}

util.inherits(ActivityExecutionState, EventEmitter);

Object.defineProperties(ActivityExecutionState.prototype, {
    isRunning: {
        get: function()
        {
            return this.execState === enums.ActivityStates.run;
        }
    }
});

/* SERIALIZATION */
ActivityExecutionState.prototype.asJSON = function()
{
    return {
        execState: this.execState
    };
}

ActivityExecutionState.prototype.fromJSON = function(json)
{
    if (!_.isObject(json)) throw new TypeError("Object argument expected.");
    if (json.execState !==null)
    {
        if (!_.isString(json.execState)) throw new TypeError("Argument object's execState property value is not a string.");
        if (is.undefined(enums.ActivityStates[json.execState])) throw new TypeError("Argument object's execState property value is not a valid Activity state value.");
    }

    this.execState = json.execState;
}
/* SERIALIZATION */

module.exports = ActivityExecutionState;
