"use strict";

var EventEmitter = require('events').EventEmitter;
var util = require("util");
var enums = require("../common/enums");
var is = require("../common/is");
var _ = require("lodash");

function ActivityExecutionState(activityInstanceId) {
    this.instanceId = activityInstanceId;
    this.execState = null;
    this.parentInstanceId = null;
    this.childInstanceIds = new Set();
}

util.inherits(ActivityExecutionState, EventEmitter);

Object.defineProperties(ActivityExecutionState.prototype, {
    isRunning: {
        get: function get() {
            return this.execState === enums.activityStates.run;
        }
    }
});

ActivityExecutionState.prototype.reportState = function (reason, result, scope) {
    if (this.execState !== reason) {
        this.execState = reason;
        this._emitState({
            reason: reason,
            result: result,
            scope: scope
        });
    }
};

ActivityExecutionState.prototype.emitState = function (result, scope) {
    this._emitState({
        reason: this.execState,
        result: result,
        scope: scope
    });
};

ActivityExecutionState.prototype._emitState = function (args) {
    this.emit(args.reason, args);
    if (args.reason !== enums.activityStates.run) {
        this.emit(enums.activityStates.end, args);
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
        if (_.isUndefined(enums.activityStates[json.execState])) {
            throw new TypeError("Argument object's execState property value is not a valid Activity state value.");
        }
    }

    this.execState = json.execState;
};
/* SERIALIZATION */

module.exports = ActivityExecutionState;
//# sourceMappingURL=activityExecutionState.js.map
