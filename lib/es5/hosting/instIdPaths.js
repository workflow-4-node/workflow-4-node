"use strict";
var specStrings = require("../common/specStrings");
var is = require("../common/is");
function InstIdPaths() {
  this._map = new Map();
}
InstIdPaths.prototype.add = function(workflowName, methodName, instanceIdPath) {
  var key = specStrings.hosting.doubleKeys(workflowName, methodName);
  var inner = this._map.get(key);
  if (!inner) {
    inner = new Map();
    this._map.set(key, inner);
  }
  var count = inner.get(instanceIdPath) || 0;
  inner.set(instanceIdPath, count + 1);
};
InstIdPaths.prototype.remove = function(workflowName, methodName, instanceIdPath) {
  var key = specStrings.hosting.doubleKeys(workflowName, methodName);
  var inner = this._map.get(key);
  if (inner) {
    var count = inner.get(instanceIdPath);
    if (!_.isUndefined(count)) {
      if (count === 1) {
        this._map.delete(key);
      } else {
        inner.set(instanceIdPath, count - 1);
      }
    }
  }
  return false;
};
InstIdPaths.prototype.items = $traceurRuntime.initGeneratorFunction(function $__7(workflowName, methodName) {
  var key,
      inner,
      $__3,
      $__4,
      $__5,
      $__1,
      $__0,
      ik,
      $__6;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          key = specStrings.hosting.doubleKeys(workflowName, methodName);
          inner = this._map.get(key);
          $ctx.state = 27;
          break;
        case 27:
          $ctx.state = (inner) ? 23 : -2;
          break;
        case 23:
          $__3 = true;
          $__4 = false;
          $__5 = undefined;
          $ctx.state = 24;
          break;
        case 24:
          $ctx.pushTry(10, 11);
          $ctx.state = 13;
          break;
        case 13:
          $__1 = void 0, $__0 = (inner.keys())[Symbol.iterator]();
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = (!($__3 = ($__1 = $__0.next()).done)) ? 5 : 7;
          break;
        case 4:
          $__3 = true;
          $ctx.state = 9;
          break;
        case 5:
          ik = $__1.value;
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return ik;
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 7:
          $ctx.popTry();
          $ctx.state = 11;
          $ctx.finallyFallThrough = -2;
          break;
        case 10:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          $__6 = $ctx.storedException;
          $ctx.state = 16;
          break;
        case 16:
          $__4 = true;
          $__5 = $__6;
          $ctx.state = 11;
          $ctx.finallyFallThrough = -2;
          break;
        case 11:
          $ctx.popTry();
          $ctx.state = 22;
          break;
        case 22:
          try {
            if (!$__3 && $__0.return != null) {
              $__0.return();
            }
          } finally {
            if ($__4) {
              throw $__5;
            }
          }
          $ctx.state = 20;
          break;
        case 20:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__7, this);
});
module.exports = InstIdPaths;

//# sourceMappingURL=instIdPaths.js.map
