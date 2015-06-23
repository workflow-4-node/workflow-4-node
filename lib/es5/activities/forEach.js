"use strict";
"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var Guid = require("guid");
function ForEach() {
  Activity.call(this);
  this.from = null;
  this.varName = "item";
  this.parallel = false;
  this.nonScopedProperties.add("_doStep");
}
util.inherits(ForEach, Activity);
ForEach.prototype.run = function(callContext, args) {
  var varName = this.get("varName");
  var from = this.get("from");
  if (!_.isNull(from)) {
    this.set(varName, null);
    callContext.schedule(from, "_fromGot");
  } else {
    callContext.complete();
  }
};
ForEach.prototype._fromGot = function(callContext, reason, result) {
  if (reason === Activity.states.complete && !_.isUndefined(result)) {
    var todo = _.isArray(result) ? result : [result];
    this.set("_todo", result);
    callContext.activity._doStep.call(this, callContext);
  } else {
    callContext.to(reason, result);
  }
};
ForEach.prototype._doStep = function(callContext, lastResult) {
  var varName = this.get("varName");
  var todo = this.get("_todo");
  var body = this.get("body");
  if (todo && todo.length && body instanceof Activity) {
    if (this.get("parallel")) {
      var f = $traceurRuntime.initGeneratorFunction(function $__7() {
        var $__3,
            $__4,
            $__5,
            $__1,
            $__0,
            item,
            variables,
            $__6;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $__3 = true;
                $__4 = false;
                $__5 = undefined;
                $ctx.state = 26;
                break;
              case 26:
                $ctx.pushTry(12, 13);
                $ctx.state = 15;
                break;
              case 15:
                $__1 = void 0, $__0 = (todo)[$traceurRuntime.toProperty(Symbol.iterator)]();
                $ctx.state = 11;
                break;
              case 11:
                $ctx.state = (!($__3 = ($__1 = $__0.next()).done)) ? 7 : 9;
                break;
              case 4:
                $__3 = true;
                $ctx.state = 11;
                break;
              case 7:
                item = $__1.value;
                $ctx.state = 8;
                break;
              case 8:
                variables = {};
                variables[varName] = item;
                $ctx.state = 6;
                break;
              case 6:
                $ctx.state = 2;
                return {
                  activity: body,
                  variables: variables
                };
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              case 9:
                $ctx.popTry();
                $ctx.state = 13;
                $ctx.finallyFallThrough = -2;
                break;
              case 12:
                $ctx.popTry();
                $ctx.maybeUncatchable();
                $__6 = $ctx.storedException;
                $ctx.state = 18;
                break;
              case 18:
                $__4 = true;
                $__5 = $__6;
                $ctx.state = 13;
                $ctx.finallyFallThrough = -2;
                break;
              case 13:
                $ctx.popTry();
                $ctx.state = 24;
                break;
              case 24:
                try {
                  if (!$__3 && $__0.return != null) {
                    $__0.return();
                  }
                } finally {
                  if ($__4) {
                    throw $__5;
                  }
                }
                $ctx.state = 22;
                break;
              case 22:
                $ctx.state = $ctx.finallyFallThrough;
                break;
              default:
                return $ctx.end();
            }
        }, $__7, this);
      });
      callContext.schedule(f, "_bodyFinished");
    } else {
      var item = todo[0];
      todo.splice(0, 1);
      this.set(varName, item);
      callContext.schedule(body, "_bodyFinished");
    }
  } else {
    callContext.complete(lastResult || body);
  }
};
ForEach.prototype._bodyFinished = function(callContext, reason, result) {
  if (reason === Activity.states.complete && !this.get("parallel")) {
    callContext.activity._doStep.call(this, callContext, result);
  } else {
    callContext.end(reason, result);
  }
};
module.exports = ForEach;
//# sourceMappingURL=data:application/json;base64,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LFNBQVMsQ0FBQSxFQUFLLEVBQUMsSUFBRyxJQUFJLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBRztBQUM5RCxjQUFVLFNBQVMsUUFBUSxLQUFLLEFBQUMsQ0FBQyxJQUFHLENBQUcsWUFBVSxDQUFHLE9BQUssQ0FBQyxDQUFDO0VBQ2hFLEtBQ0s7QUFDRCxjQUFVLElBQUksQUFBQyxDQUFDLE1BQUssQ0FBRyxPQUFLLENBQUMsQ0FBQztFQUNuQztBQUFBLEFBQ0osQ0FBQztBQUVELEtBQUssUUFBUSxFQUFJLFFBQU0sQ0FBQztBQUFBIiwiZmlsZSI6ImFjdGl2aXRpZXMvZm9yRWFjaC5qcyIsInNvdXJjZVJvb3QiOiJsaWIvZXM2Iiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBBY3Rpdml0eSA9IHJlcXVpcmUoXCIuL2FjdGl2aXR5XCIpO1xubGV0IHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcbmxldCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbmxldCBHdWlkID0gcmVxdWlyZShcImd1aWRcIik7XG5cbmZ1bmN0aW9uIEZvckVhY2goKSB7XG4gICAgQWN0aXZpdHkuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuZnJvbSA9IG51bGw7XG4gICAgdGhpcy52YXJOYW1lID0gXCJpdGVtXCI7XG4gICAgdGhpcy5wYXJhbGxlbCA9IGZhbHNlO1xuXG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl9kb1N0ZXBcIik7XG59XG5cbnV0aWwuaW5oZXJpdHMoRm9yRWFjaCwgQWN0aXZpdHkpO1xuXG5Gb3JFYWNoLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIGFyZ3MpIHtcbiAgICBjb25zdCB2YXJOYW1lID0gdGhpcy5nZXQoXCJ2YXJOYW1lXCIpO1xuICAgIGxldCBmcm9tID0gdGhpcy5nZXQoXCJmcm9tXCIpO1xuICAgIGlmICghXy5pc051bGwoZnJvbSkpIHtcbiAgICAgICAgdGhpcy5zZXQodmFyTmFtZSwgbnVsbCk7XG4gICAgICAgIGNhbGxDb250ZXh0LnNjaGVkdWxlKGZyb20sIFwiX2Zyb21Hb3RcIik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjYWxsQ29udGV4dC5jb21wbGV0ZSgpO1xuICAgIH1cbn07XG5cbkZvckVhY2gucHJvdG90eXBlLl9mcm9tR290ID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCkge1xuICAgIGlmIChyZWFzb24gPT09IEFjdGl2aXR5LnN0YXRlcy5jb21wbGV0ZSAmJiAhXy5pc1VuZGVmaW5lZChyZXN1bHQpKSB7XG4gICAgICAgIGxldCB0b2RvID0gXy5pc0FycmF5KHJlc3VsdCkgPyByZXN1bHQgOiBbIHJlc3VsdCBdO1xuICAgICAgICB0aGlzLnNldChcIl90b2RvXCIsIHJlc3VsdCk7XG4gICAgICAgIGNhbGxDb250ZXh0LmFjdGl2aXR5Ll9kb1N0ZXAuY2FsbCh0aGlzLCBjYWxsQ29udGV4dCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjYWxsQ29udGV4dC50byhyZWFzb24sIHJlc3VsdCk7XG4gICAgfVxufTtcblxuRm9yRWFjaC5wcm90b3R5cGUuX2RvU3RlcCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgbGFzdFJlc3VsdCkge1xuICAgIGNvbnN0IHZhck5hbWUgPSB0aGlzLmdldChcInZhck5hbWVcIik7XG4gICAgbGV0IHRvZG8gPSB0aGlzLmdldChcIl90b2RvXCIpO1xuICAgIGxldCBib2R5ID0gdGhpcy5nZXQoXCJib2R5XCIpO1xuICAgIGlmICh0b2RvICYmIHRvZG8ubGVuZ3RoICYmIGJvZHkgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICBpZiAodGhpcy5nZXQoXCJwYXJhbGxlbFwiKSkge1xuICAgICAgICAgICAgbGV0IGYgPSBmdW5jdGlvbiooKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiB0b2RvKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2YXJpYWJsZXMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzW3Zhck5hbWVdID0gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHk6IGJvZHksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHZhcmlhYmxlc1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYWxsQ29udGV4dC5zY2hlZHVsZShmLCBcIl9ib2R5RmluaXNoZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHRvZG9bMF07XG4gICAgICAgICAgICB0b2RvLnNwbGljZSgwLCAxKTtcbiAgICAgICAgICAgIHRoaXMuc2V0KHZhck5hbWUsIGl0ZW0pO1xuICAgICAgICAgICAgY2FsbENvbnRleHQuc2NoZWR1bGUoYm9keSwgXCJfYm9keUZpbmlzaGVkXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjYWxsQ29udGV4dC5jb21wbGV0ZShsYXN0UmVzdWx0IHx8IGJvZHkpO1xuICAgIH1cbn07XG5cbkZvckVhY2gucHJvdG90eXBlLl9ib2R5RmluaXNoZWQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0KSB7XG4gICAgaWYgKHJlYXNvbiA9PT0gQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlICYmICF0aGlzLmdldChcInBhcmFsbGVsXCIpKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmFjdGl2aXR5Ll9kb1N0ZXAuY2FsbCh0aGlzLCBjYWxsQ29udGV4dCwgcmVzdWx0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmVuZChyZWFzb24sIHJlc3VsdCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb3JFYWNoOyJdfQ==
