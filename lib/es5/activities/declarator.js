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
  this.reservedProperties = new Set();
  this.promotedProperties = new Set();
}
util.inherits(Declarator, Activity);
Declarator.prototype.reserved = function(name, value) {
  if (this.promotedProperties.has(name)) {
    throw new Error("Property '" + name + "' cannot be reserved because it's promoted.");
  }
  if (!_.isUndefined(value)) {
    this[name] = value;
  }
  this.reservedProperties.add(name);
};
Declarator.prototype.promoted = function(name, value) {
  if (this.reservedProperties.has(name)) {
    throw new Error("Property '" + name + "' cannot be promoted because it's reserved.");
  }
  if (!_.isUndefined(value)) {
    this[name] = value;
  }
  this.promotedProperties.add(name);
};
Declarator.prototype.run = function(callContext, args) {
  var activityVariables = [];
  var _activityVariableFieldNames = [];
  this._activityVariableFieldNames = _activityVariableFieldNames;
  var resProps = callContext.activity.reservedProperties;
  var $__3 = true;
  var $__4 = false;
  var $__5 = undefined;
  try {
    for (var $__1 = void 0,
        $__0 = (callContext.activity._getScopeKeys())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
      var fieldName = $__1.value;
      {
        if (!resProps.has(fieldName)) {
          var fieldValue = this[fieldName];
          if (fieldValue instanceof Activity) {
            activityVariables.push(fieldValue);
            _activityVariableFieldNames.push(fieldName);
          }
        }
      }
    }
  } catch ($__6) {
    $__4 = true;
    $__5 = $__6;
  } finally {
    try {
      if (!$__3 && $__0.return != null) {
        $__0.return();
      }
    } finally {
      if ($__4) {
        throw $__5;
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
Declarator.prototype._varsGot = function(callContext, reason, result) {
  if (reason === Activity.states.complete) {
    var idx = 0;
    var $__3 = true;
    var $__4 = false;
    var $__5 = undefined;
    try {
      for (var $__1 = void 0,
          $__0 = (this._activityVariableFieldNames)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
        var fieldName = $__1.value;
        {
          this[fieldName] = result[idx++];
        }
      }
    } catch ($__6) {
      $__4 = true;
      $__5 = $__6;
    } finally {
      try {
        if (!$__3 && $__0.return != null) {
          $__0.return();
        }
      } finally {
        if ($__4) {
          throw $__5;
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
