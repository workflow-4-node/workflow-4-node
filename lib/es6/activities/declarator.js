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
    let self = this;
    let activityVariables = [];
    let _activityVariableFieldNames = [];
    self._activityVariableFieldNames = _activityVariableFieldNames;
    let resProps = callContext.activity.reservedProperties;
    for (let fieldName of callContext.activity._getScopeKeys()) {
        if (!resProps.has(fieldName)) {
            let fieldValue = self[fieldName];
            if (fieldValue instanceof Activity) {
                activityVariables.push(fieldValue);
                _activityVariableFieldNames.push(fieldName);
            }
        }
    }

    if (activityVariables.length) {
        self._savedArgs = args;
        callContext.schedule(activityVariables, "_varsGot");
    }
    else {
        delete self._activityVariableFieldNames;
        callContext.activity.varsDeclared.call(self, callContext, args);
    }
};

Declarator.prototype._varsGot = function (callContext, reason, result) {
    let self = this;
    if (reason === Activity.states.complete) {
        let idx = 0;
        for (let fieldName of self._activityVariableFieldNames) {
            self[fieldName] = result[idx++];
        }
        let args = self._savedArgs;
        delete self._savedArgs;
        delete self._activityVariableFieldNames;
        callContext.activity.varsDeclared.call(self, callContext, args);
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = Declarator;