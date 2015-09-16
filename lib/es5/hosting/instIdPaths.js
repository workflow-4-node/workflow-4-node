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
          $__1 = void 0, $__0 = (inner.keys())[$traceurRuntime.toProperty(Symbol.iterator)]();
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
//# sourceMappingURL=data:application/json;base64,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RCxDQUFDO0FBRUQsS0FBSyxRQUFRLEVBQUksWUFBVSxDQUFDO0FBQzVCIiwiZmlsZSI6Imhvc3RpbmcvaW5zdElkUGF0aHMuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5sZXQgc3BlY1N0cmluZ3MgPSByZXF1aXJlKFwiLi4vY29tbW9uL3NwZWNTdHJpbmdzXCIpO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcblxuZnVuY3Rpb24gSW5zdElkUGF0aHMoKSB7XG4gICAgdGhpcy5fbWFwID0gbmV3IE1hcCgpO1xufVxuXG5JbnN0SWRQYXRocy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgaW5zdGFuY2VJZFBhdGgpIHtcbiAgICBsZXQga2V5ID0gc3BlY1N0cmluZ3MuaG9zdGluZy5kb3VibGVLZXlzKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSk7XG4gICAgbGV0IGlubmVyID0gdGhpcy5fbWFwLmdldChrZXkpO1xuICAgIGlmICghaW5uZXIpIHtcbiAgICAgICAgaW5uZXIgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuX21hcC5zZXQoa2V5LCBpbm5lcik7XG4gICAgfVxuICAgIGxldCBjb3VudCA9IGlubmVyLmdldChpbnN0YW5jZUlkUGF0aCkgfHwgMDtcbiAgICBpbm5lci5zZXQoaW5zdGFuY2VJZFBhdGgsIGNvdW50ICsgMSk7XG59O1xuXG5JbnN0SWRQYXRocy5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgaW5zdGFuY2VJZFBhdGgpIHtcbiAgICBsZXQga2V5ID0gc3BlY1N0cmluZ3MuaG9zdGluZy5kb3VibGVLZXlzKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSk7XG4gICAgbGV0IGlubmVyID0gdGhpcy5fbWFwLmdldChrZXkpO1xuICAgIGlmIChpbm5lcikge1xuICAgICAgICBsZXQgY291bnQgPSBpbm5lci5nZXQoaW5zdGFuY2VJZFBhdGgpO1xuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoY291bnQpKSB7XG4gICAgICAgICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXAuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbm5lci5zZXQoaW5zdGFuY2VJZFBhdGgsIGNvdW50IC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuSW5zdElkUGF0aHMucHJvdG90eXBlLml0ZW1zID0gZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUpIHtcbiAgICBsZXQga2V5ID0gc3BlY1N0cmluZ3MuaG9zdGluZy5kb3VibGVLZXlzKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSk7XG4gICAgbGV0IGlubmVyID0gdGhpcy5fbWFwLmdldChrZXkpO1xuICAgIGlmIChpbm5lcikge1xuICAgICAgICBmb3IgKGxldCBpayBvZiBpbm5lci5rZXlzKCkpIHtcbiAgICAgICAgICAgIHlpZWxkIGlrO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0SWRQYXRocztcbiJdfQ==
