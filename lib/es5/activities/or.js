"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
function Or() {
  Activity.call(this);
  this.isTrue = true;
  this.isFalse = false;
}
util.inherits(Or, Activity);
Or.prototype.run = function(callContext, args) {
  callContext.schedule(args, "_argsGot");
};
Or.prototype._argsGot = function(callContext, reason, result) {
  if (reason !== Activity.states.complete) {
    callContext.end(reason, result);
    return;
  }
  var isTrue = false;
  var $__3 = true;
  var $__4 = false;
  var $__5 = undefined;
  try {
    for (var $__1 = void 0,
        $__0 = (result)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
      var v = $__1.value;
      {
        isTrue = (v ? true : false) || isTrue;
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
  if (isTrue) {
    callContext.schedule(this.isTrue, "_done");
  } else {
    callContext.schedule(this.isFalse, "_done");
  }
};
Or.prototype._done = function(callContext, reason, result) {
  callContext.end(reason, result);
};
module.exports = Or;

//# sourceMappingURL=or.js.map
