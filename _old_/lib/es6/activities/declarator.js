"use strict";

let Activity = require("./activity");
let util = require("util");
let is = require("../common/is");
let _ = require("lodash");

function Declarator() {
    Activity.call(this);
    this.nonScopedProperties.add("reservedProperties");
    this.nonScopedProperties.add("reserved");
    this.nonScopedProperties.add("promotedProperties");
    this.nonScopedProperties.add("promoted");
    this.nonScopedProperties.add("varsDeclared");

    // Properties those cannot be declared freely
    this.reservedProperties = new Set();

    // Properties those will be promoted during serialization
    this.promotedProperties = new Set();
}

util.inherits(Declarator, Activity);

Declarator.prototype.reserved = function (name, value) {
    if (this.promotedProperties.has(name)) {
        throw new Error("Property '" + name + "' cannot be reserved because it's promoted.");
    }
    if (!_.isUndefined(value)) {
        this[name] = value;
    }
    this.reservedProperties.add(name);
};

Declarator.prototype.promoted = function (name, value) {
    if (this.reservedProperties.has(name)) {
        throw new Error("Property '" + name + "' cannot be promoted because it's reserved.");
    }
    if (!_.isUndefined(value)) {
        this[name] = value;
    }
    this.promotedProperties.add(name);
};

Declarator.prototype.run = function (callContext, args) {
    let activityVariables = [];
    let _activityVariableFieldNames = [];
    this._activityVariableFieldNames = _activityVariableFieldNames;
    let resProps = callContext.activity.reservedProperties;
    for (let fieldName of callContext.activity._getScopeKeys()) {
        if (!resProps.has(fieldName)) {
            let fieldValue = this[fieldName];
            if (fieldValue instanceof Activity) {
                activityVariables.push(fieldValue);
                _activityVariableFieldNames.push(fieldName);
            }
        }
    }

    if (activityVariables.length) {
        this._savedArgs = args;
        callContext.schedule(activityVariables, "_varsGot");
    }
    else {
        this.delete("_activityVariableFieldNames");
        callContext.activity.varsDeclared.call(this, callContext, args);
    }
};

Declarator.prototype._varsGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        let idx = 0;
        for (let fieldName of this._activityVariableFieldNames) {
            this[fieldName] = result[idx++];
        }
        let args = this._savedArgs;
        this.delete("_savedArgs");
        this.delete("_activityVariableFieldNames");
        callContext.activity.varsDeclared.call(this, callContext, args);
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = Declarator;