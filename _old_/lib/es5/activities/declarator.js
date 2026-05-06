"use strict";

var Activity = require("./activity");
var util = require("util");
var is = require("../common/is");
var _ = require("lodash");

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
    var activityVariables = [];
    var _activityVariableFieldNames = [];
    this._activityVariableFieldNames = _activityVariableFieldNames;
    var resProps = callContext.activity.reservedProperties;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = callContext.activity._getScopeKeys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var fieldName = _step.value;

            if (!resProps.has(fieldName)) {
                var fieldValue = this[fieldName];
                if (fieldValue instanceof Activity) {
                    activityVariables.push(fieldValue);
                    _activityVariableFieldNames.push(fieldName);
                }
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    if (activityVariables.length) {
        this._savedArgs = args;
        callContext.schedule(activityVariables, "_varsGot");
    } else {
        this.delete("_activityVariableFieldNames");
        callContext.activity.varsDeclared.call(this, callContext, args);
    }
};

Declarator.prototype._varsGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        var idx = 0;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = this._activityVariableFieldNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var fieldName = _step2.value;

                this[fieldName] = result[idx++];
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        var args = this._savedArgs;
        this.delete("_savedArgs");
        this.delete("_activityVariableFieldNames");
        callContext.activity.varsDeclared.call(this, callContext, args);
    } else {
        callContext.end(reason, result);
    }
};

module.exports = Declarator;
//# sourceMappingURL=declarator.js.map
