"use strict";
var EventEmitter = require("events").EventEmitter;
var Bluebird = require("bluebird");
var async = require("../common").asyncHelpers.async;
var debug = require("debug")("wf4node:WakeUp");
var util = require("util");
function WakeUp(knownInstaStore, persistence, options) {
  EventEmitter.call(this);
  this.knownInstaStore = knownInstaStore;
  this.persistence = persistence;
  this.options = options || {};
  this._working = false;
  this._timeout = null;
  this._batchSize = this.options.batchSize || 10;
}
util.inherits(WakeUp, EventEmitter);
WakeUp.prototype.start = function() {
  if (!this._timeout) {
    debug("Start.");
    var self = this;
    this._timeout = setTimeout(function() {
      self._step();
    }, this.options.interval || 5000);
  }
};
WakeUp.prototype.stop = function() {
  if (this._timeout) {
    debug("Stop.");
    clearTimeout(this._timeout);
    this._timeout = null;
  }
};
WakeUp.prototype._step = async($traceurRuntime.initGeneratorFunction(function $__16() {
  var self,
      wakeupables,
      tasks,
      count,
      $__4,
      $__5,
      $__6,
      $__15,
      $__2,
      $__1,
      results,
      $__11,
      $__12,
      $__13,
      $__9,
      $__8,
      result,
      $__19,
      $__20,
      $__7,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          $ctx.state = 75;
          break;
        case 75:
          $ctx.pushTry(null, 67);
          $ctx.state = 69;
          break;
        case 69:
          $ctx.state = (this._working) ? 3 : 2;
          break;
        case 3:
          debug("Skipping current step because work in progress.");
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = 67;
          $ctx.finallyFallThrough = -2;
          break;
        case 2:
          debug("Starting next step.");
          this._working = true;
          $ctx.state = 65;
          break;
        case 65:
          $ctx.pushTry(51, 52);
          $ctx.state = 54;
          break;
        case 54:
          $ctx.state = 7;
          return this._getNextWakeupables();
        case 7:
          wakeupables = $ctx.sent;
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = (wakeupables && wakeupables.length) ? 44 : 48;
          break;
        case 44:
          debug("%d selected to wake up.", wakeupables.length);
          tasks = [];
          count = 0;
          $__4 = true;
          $__5 = false;
          $__6 = undefined;
          $ctx.state = 45;
          break;
        case 45:
          $ctx.pushTry(27, 28);
          $ctx.state = 30;
          break;
        case 30:
          $__15 = $traceurRuntime.initGeneratorFunction(function $__17() {
            var wakeupable;
            return $traceurRuntime.createGeneratorInstance(function($ctx) {
              while (true)
                switch ($ctx.state) {
                  case 0:
                    wakeupable = $__2.value;
                    {
                      tasks.push(async($traceurRuntime.initGeneratorFunction(function $__18() {
                        var promise,
                            e;
                        return $traceurRuntime.createGeneratorInstance(function($ctx) {
                          while (true)
                            switch ($ctx.state) {
                              case 0:
                                $ctx.state = (count >= self._batchSize) ? 1 : 2;
                                break;
                              case 1:
                                $ctx.state = -2;
                                break;
                              case 2:
                                debug("Waking up workflow %s, id: %s", wakeupable.workflowName, wakeupable.instanceId);
                                wakeupable.result = {};
                                promise = new Bluebird(function(resolve, reject) {
                                  wakeupable.result.resolve = resolve;
                                  wakeupable.result.reject = reject;
                                });
                                self.emit("continue", wakeupable);
                                $ctx.state = 20;
                                break;
                              case 20:
                                $ctx.pushTry(10, null);
                                $ctx.state = 13;
                                break;
                              case 13:
                                $ctx.state = 5;
                                return promise;
                              case 5:
                                $ctx.maybeThrow();
                                $ctx.state = 7;
                                break;
                              case 7:
                                count++;
                                debug("Processing delay completed.");
                                $ctx.state = 9;
                                break;
                              case 9:
                                $ctx.popTry();
                                $ctx.state = -2;
                                break;
                              case 10:
                                $ctx.popTry();
                                $ctx.maybeUncatchable();
                                e = $ctx.storedException;
                                $ctx.state = 16;
                                break;
                              case 16:
                                debug("Processing delay error: %s", e.stack);
                                self.emit("error", e);
                                $ctx.state = -2;
                                break;
                              default:
                                return $ctx.end();
                            }
                        }, $__18, this);
                      }))());
                    }
                    $ctx.state = -2;
                    break;
                  default:
                    return $ctx.end();
                }
            }, $__17, this);
          });
          $ctx.state = 26;
          break;
        case 26:
          $__2 = void 0, $__1 = (wakeupables)[$traceurRuntime.toProperty(Symbol.iterator)]();
          $ctx.state = 24;
          break;
        case 24:
          $ctx.state = (!($__4 = ($__2 = $__1.next()).done)) ? 20 : 22;
          break;
        case 19:
          $__4 = true;
          $ctx.state = 24;
          break;
        case 20:
          $__19 = $ctx.wrapYieldStar($__15()[Symbol.iterator]());
          $ctx.sent = void 0;
          $ctx.action = 'next';
          $ctx.state = 21;
          break;
        case 21:
          $__20 = $__19[$ctx.action]($ctx.sentIgnoreThrow);
          $ctx.state = 18;
          break;
        case 18:
          $ctx.state = ($__20.done) ? 12 : 11;
          break;
        case 12:
          $ctx.sent = $__20.value;
          $ctx.state = 19;
          break;
        case 11:
          $ctx.state = 21;
          return $__20.value;
        case 22:
          $ctx.popTry();
          $ctx.state = 28;
          $ctx.finallyFallThrough = 32;
          break;
        case 27:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          $__7 = $ctx.storedException;
          $ctx.state = 33;
          break;
        case 33:
          $__5 = true;
          $__6 = $__7;
          $ctx.state = 28;
          $ctx.finallyFallThrough = 32;
          break;
        case 28:
          $ctx.popTry();
          $ctx.state = 39;
          break;
        case 39:
          try {
            if (!$__4 && $__1.return != null) {
              $__1.return();
            }
          } finally {
            if ($__5) {
              throw $__6;
            }
          }
          $ctx.state = 37;
          break;
        case 32:
          $ctx.state = 41;
          return Bluebird.settle(tasks);
        case 41:
          results = $ctx.sent;
          $ctx.state = 43;
          break;
        case 43:
          $__11 = true;
          $__12 = false;
          $__13 = undefined;
          try {
            for ($__9 = void 0, $__8 = (results)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__11 = ($__9 = $__8.next()).done); $__11 = true) {
              result = $__9.value;
              {
                if (result.isRejected()) {
                  throw result.reason();
                }
              }
            }
          } catch ($__14) {
            $__12 = true;
            $__13 = $__14;
          } finally {
            try {
              if (!$__11 && $__8.return != null) {
                $__8.return();
              }
            } finally {
              if ($__12) {
                throw $__13;
              }
            }
          }
          $ctx.state = 47;
          break;
        case 48:
          debug("There is no instance to wake up.");
          $ctx.state = 47;
          break;
        case 47:
          $ctx.popTry();
          $ctx.state = 52;
          $ctx.finallyFallThrough = -2;
          break;
        case 51:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 57;
          break;
        case 57:
          this.emit("error", e);
          $ctx.state = 52;
          $ctx.finallyFallThrough = -2;
          break;
        case 52:
          $ctx.popTry();
          $ctx.state = 63;
          break;
        case 63:
          debug("Next step completed.");
          this._working = false;
          $ctx.state = 61;
          break;
        case 67:
          $ctx.popTry();
          $ctx.state = 73;
          break;
        case 73:
          if (this._timeout) {
            this._timeout = setTimeout(function() {
              self._step();
            }, this.options.interval || 5000);
          }
          $ctx.state = 71;
          break;
        case 71:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        case 61:
          switch ($ctx.finallyFallThrough) {
            case 75:
            case 69:
            case 3:
            case 4:
            case 2:
            case 65:
            case 54:
            case 7:
            case 9:
            case 44:
            case 45:
            case 30:
            case 26:
            case 24:
            case 19:
            case 20:
            case 21:
            case 18:
            case 12:
            case 13:
            case 11:
            case 22:
            case 27:
            case 33:
            case 28:
            case 39:
            case 37:
            case 32:
            case 41:
            case 43:
            case 48:
            case 47:
            case 51:
            case 57:
            case 52:
            case 63:
            case 61:
              $ctx.state = $ctx.finallyFallThrough;
              $ctx.finallyFallThrough = -1;
              break;
            default:
              $ctx.state = 67;
              break;
          }
          break;
        case 37:
          switch ($ctx.finallyFallThrough) {
            case 65:
            case 54:
            case 7:
            case 9:
            case 44:
            case 45:
            case 30:
            case 26:
            case 24:
            case 19:
            case 20:
            case 21:
            case 18:
            case 12:
            case 13:
            case 11:
            case 22:
            case 27:
            case 33:
            case 28:
            case 39:
            case 37:
            case 32:
            case 41:
            case 43:
            case 48:
            case 47:
            case 51:
            case 57:
              $ctx.state = $ctx.finallyFallThrough;
              $ctx.finallyFallThrough = -1;
              break;
            default:
              $ctx.state = 52;
              break;
          }
          break;
        default:
          return $ctx.end();
      }
  }, $__16, this);
}));
WakeUp.prototype._getNextWakeupables = async($traceurRuntime.initGeneratorFunction(function $__17() {
  var $__21,
      $__22,
      $__23,
      $__24,
      $__25;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (this.persistence) ? 5 : 9;
          break;
        case 5:
          $__21 = this.persistence;
          $__22 = $__21.getNextWakeupables;
          $__23 = this._batchSize;
          $__24 = $__22.call($__21, $__23 * 1.5);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__24;
        case 2:
          $__25 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.returnValue = $__25;
          $ctx.state = -2;
          break;
        case 9:
          $ctx.returnValue = this.knownInstaStore.getNextWakeupables(this._batchSize * 1.5);
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__17, this);
}));
module.exports = WakeUp;
//# sourceMappingURL=data:application/json;base64,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O2dCQXVHUyxDQUFBLElBQUcsWUFBWTtnQkFBZix5QkFBa0M7Z0JBQUUsQ0FBQSxJQUFHLFdBQVc7Z0JBQWxELFdBQW1DLE9BQUMsUUFBa0IsSUFBRSxDQUFDOzs7Ozs7O2dCQXhHOUUsQ0FBQSxJQUFHLEtBQUs7Ozs7QUFBUixhQUFHLFlBQVksUUFBb0IsQ0FBQTs7OztBQUFuQyxhQUFHLFlBQVksRUEyR0EsQ0FBQSxJQUFHLGdCQUFnQixtQkFBbUIsQUFBQyxDQUFDLElBQUcsV0FBVyxFQUFJLElBQUUsQ0FBQyxBQTNHekMsQ0FBQTs7OztBQUFuQyxlQUFPLENBQUEsSUFBRyxJQUFJLEFBQUMsRUFBQyxDQUFBOztBQUNtQixFQUMvQixRQUE2QixLQUFHLENBQUMsQ0FBQztBQTJHdEMsQ0E3R3VELENBNkd0RCxDQUFDO0FBRUYsS0FBSyxRQUFRLEVBQUksT0FBSyxDQUFDO0FBQUEiLCJmaWxlIjoiaG9zdGluZy93YWtlVXAuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5sZXQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5sZXQgQmx1ZWJpcmQgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XG5sZXQgYXN5bmMgPSByZXF1aXJlKFwiLi4vY29tbW9uXCIpLmFzeW5jSGVscGVycy5hc3luYztcbmxldCBkZWJ1ZyA9IHJlcXVpcmUoXCJkZWJ1Z1wiKShcIndmNG5vZGU6V2FrZVVwXCIpO1xubGV0IHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcblxuZnVuY3Rpb24gV2FrZVVwKGtub3duSW5zdGFTdG9yZSwgcGVyc2lzdGVuY2UsIG9wdGlvbnMpIHtcbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMua25vd25JbnN0YVN0b3JlID0ga25vd25JbnN0YVN0b3JlO1xuICAgIHRoaXMucGVyc2lzdGVuY2UgPSBwZXJzaXN0ZW5jZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuX3dvcmtpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl90aW1lb3V0ID0gbnVsbDtcbiAgICB0aGlzLl9iYXRjaFNpemUgPSB0aGlzLm9wdGlvbnMuYmF0Y2hTaXplIHx8IDEwO1xufVxuXG51dGlsLmluaGVyaXRzKFdha2VVcCwgRXZlbnRFbWl0dGVyKTtcblxuV2FrZVVwLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX3RpbWVvdXQpIHtcbiAgICAgICAgZGVidWcoXCJTdGFydC5cIik7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzZWxmLl9zdGVwKCk7IH0sIHRoaXMub3B0aW9ucy5pbnRlcnZhbCB8fCA1MDAwKTtcbiAgICB9XG59O1xuXG5XYWtlVXAucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX3RpbWVvdXQpIHtcbiAgICAgICAgZGVidWcoXCJTdG9wLlwiKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpO1xuICAgICAgICB0aGlzLl90aW1lb3V0ID0gbnVsbDtcbiAgICB9XG59O1xuXG5XYWtlVXAucHJvdG90eXBlLl9zdGVwID0gYXN5bmMoZnVuY3Rpb24qKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICB0cnkge1xuICAgICAgICBpZiAodGhpcy5fd29ya2luZykge1xuICAgICAgICAgICAgZGVidWcoXCJTa2lwcGluZyBjdXJyZW50IHN0ZXAgYmVjYXVzZSB3b3JrIGluIHByb2dyZXNzLlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkZWJ1ZyhcIlN0YXJ0aW5nIG5leHQgc3RlcC5cIik7XG4gICAgICAgIHRoaXMuX3dvcmtpbmcgPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHdha2V1cGFibGVzID0geWllbGQgdGhpcy5fZ2V0TmV4dFdha2V1cGFibGVzKCk7XG4gICAgICAgICAgICBpZiAod2FrZXVwYWJsZXMgJiYgd2FrZXVwYWJsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlZCBzZWxlY3RlZCB0byB3YWtlIHVwLlwiLCB3YWtldXBhYmxlcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxldCB0YXNrcyA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgd2FrZXVwYWJsZSBvZiB3YWtldXBhYmxlcykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrcy5wdXNoKGFzeW5jKGZ1bmN0aW9uKigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCA+PSBzZWxmLl9iYXRjaFNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIldha2luZyB1cCB3b3JrZmxvdyAlcywgaWQ6ICVzXCIsIHdha2V1cGFibGUud29ya2Zsb3dOYW1lLCB3YWtldXBhYmxlLmluc3RhbmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2FrZXVwYWJsZS5yZXN1bHQgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcm9taXNlID0gbmV3IEJsdWViaXJkKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWtldXBhYmxlLnJlc3VsdC5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWtldXBhYmxlLnJlc3VsdC5yZWplY3QgPSByZWplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdChcImNvbnRpbnVlXCIsIHdha2V1cGFibGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBwcm9taXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJQcm9jZXNzaW5nIGRlbGF5IGNvbXBsZXRlZC5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiUHJvY2Vzc2luZyBkZWxheSBlcnJvcjogJXNcIiwgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCByZXN1bHRzID0geWllbGQgQmx1ZWJpcmQuc2V0dGxlKHRhc2tzKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmlzUmVqZWN0ZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgcmVzdWx0LnJlYXNvbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCJUaGVyZSBpcyBubyBpbnN0YW5jZSB0byB3YWtlIHVwLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIk5leHQgc3RlcCBjb21wbGV0ZWQuXCIpO1xuICAgICAgICAgICAgdGhpcy5fd29ya2luZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBpZiAodGhpcy5fdGltZW91dCkge1xuICAgICAgICAgICAgdGhpcy5fdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBzZWxmLl9zdGVwKCk7IH0sIHRoaXMub3B0aW9ucy5pbnRlcnZhbCB8fCA1MDAwKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5XYWtlVXAucHJvdG90eXBlLl9nZXROZXh0V2FrZXVwYWJsZXMgPSBhc3luYyhmdW5jdGlvbiogKCkge1xuICAgIGlmICh0aGlzLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgIHJldHVybiB5aWVsZCB0aGlzLnBlcnNpc3RlbmNlLmdldE5leHRXYWtldXBhYmxlcyh0aGlzLl9iYXRjaFNpemUgKiAxLjUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMua25vd25JbnN0YVN0b3JlLmdldE5leHRXYWtldXBhYmxlcyh0aGlzLl9iYXRjaFNpemUgKiAxLjUpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdha2VVcDsiXX0=
