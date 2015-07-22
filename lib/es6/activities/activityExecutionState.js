"use strict";

let EventEmitter = require('events').EventEmitter;
let util = require("util");
let enums = require("../common/enums");
let is = require("../common/is");
let _ = require("lodash");

function ActivityExecutionState(activityInstanceId) {
    this.activityInstanceId = activityInstanceId;
    this.execState = null;
    this.parentActivityId = null;
    this.childActivityIds = new Set();
}

util.inherits(ActivityExecutionState, EventEmitter);

Object.defineProperties(ActivityExecutionState.prototype, {
    isRunning: {
        get: function () {
            return this.execState === enums.ActivityStates.run;
        }
    }
});

ActivityExecutionState.prototype.reportState = function (reason, result) {
    if (this.execState !== reason) {
        this.execState = reason;
        this.emitState(reason, result);
    }
};

ActivityExecutionState.prototype.emitState = function (result) {
    this.emit(this.execState, result);
    if (this.execState !== enums.ActivityStates.run) {
        this.emit(enums.ActivityStates.end, this.execState, result);
    }
};

/* SERIALIZATION */
ActivityExecutionState.prototype.asJSON = function () {
    return {
        execState: this.execState
    };
};

ActivityExecutionState.prototype.fromJSON = function (json) {
    if (!_.isObject(json)) {
        throw new TypeError("Object argument expected.");
    }
    if (json.execState !== null) {
        if (!_.isString(json.execState)) {
            throw new TypeError("Argument object's execState property value is not a string.");
        }
        if (is.undefined(enums.ActivityStates[json.execState])) {
            throw new TypeError("Argument object's execState property value is not a valid Activity state value.");
        }
    }

    this.execState = json.execState;
};
/* SERIALIZATION */

module.exports = ActivityExecutionState;
