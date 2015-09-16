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
  this._interval = null;
  this._batchSize = this.options.batchSize || 10;
}
util.inherits(WakeUp, EventEmitter);
WakeUp.prototype.start = function() {
  if (!this._interval) {
    debug("Start.");
    var self = this;
    this._interval = setInterval(function() {
      self._step();
    }, this.options.interval || 5000);
  }
};
WakeUp.prototype.stop = function() {
  if (this._interval) {
    debug("Stop.");
    clearInterval(this._interval);
    this._interval = null;
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
          $ctx.state = 65;
          break;
        case 65:
          $ctx.state = (this._working) ? 3 : 2;
          break;
        case 3:
          debug("Skipping current step because work in progress.");
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = -2;
          break;
        case 2:
          debug("Starting next step.");
          this._working = true;
          $ctx.state = 67;
          break;
        case 67:
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
        case 61:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        case 37:
          switch ($ctx.finallyFallThrough) {
            case 67:
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
//# sourceMappingURL=data:application/json;base64,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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQURULGlCQUFHLE1BQU0sRUFBSSxDQUFBLElBQUcsbUJBQW1CLENBQUM7QUFDcEMsaUJBQUcsbUJBQW1CLEtBQW9CLENBQUM7QUFDM0MsbUJBQUs7Ozs7Ozs7QUFIdkIsZUFBTyxDQUFBLElBQUcsSUFBSSxBQUFDLEVBQUMsQ0FBQTs7QUFDbUIsRUFDL0IsUUFBNkIsS0FBRyxDQUFDLENBQUM7QUEwRnRDLENBNUZ1RCxDQTRGdEQsQ0FBQztBQUVGLEtBQUssVUFBVSxvQkFBb0IsRUFBSSxDQUFBLEtBQUksQUFBQyxDQTlGNUMsZUFBYyxzQkFBc0IsQUFBQyxDQThGUSxlQUFXLEFBQUQ7Ozs7OztBQTlGdkQsT0FBTyxDQUFQLGVBQWMsd0JBQXdCLEFBQWQsQ0FBeEIsU0FBUyxJQUFHLENBQUc7QUFDVCxVQUFPLElBQUc7OztBQURoQixhQUFHLE1BQU0sRUFBSSxDQUFBLENBK0ZMLElBQUcsWUFBWSxDQS9GUSxRQUF3QyxDQUFDO0FBQ2hFLGVBQUk7O2dCQStGUyxDQUFBLElBQUcsWUFBWTtnQkFBZix5QkFBa0M7Z0JBQUUsQ0FBQSxJQUFHLFdBQVc7Z0JBQWxELFdBQW1DLE9BQUMsUUFBa0IsSUFBRSxDQUFDOzs7Ozs7O2dCQWhHOUUsQ0FBQSxJQUFHLEtBQUs7Ozs7QUFBUixhQUFHLFlBQVksUUFBb0IsQ0FBQTs7OztBQUFuQyxhQUFHLFlBQVksRUFtR0EsQ0FBQSxJQUFHLGdCQUFnQixtQkFBbUIsQUFBQyxDQUFDLElBQUcsV0FBVyxFQUFJLElBQUUsQ0FBQyxBQW5HekMsQ0FBQTs7OztBQUFuQyxlQUFPLENBQUEsSUFBRyxJQUFJLEFBQUMsRUFBQyxDQUFBOztBQUNtQixFQUMvQixRQUE2QixLQUFHLENBQUMsQ0FBQztBQW1HdEMsQ0FyR3VELENBcUd0RCxDQUFDO0FBRUYsS0FBSyxRQUFRLEVBQUksT0FBSyxDQUFDO0FBQUEiLCJmaWxlIjoiaG9zdGluZy93YWtlVXAuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5sZXQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5sZXQgQmx1ZWJpcmQgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XG5sZXQgYXN5bmMgPSByZXF1aXJlKFwiLi4vY29tbW9uXCIpLmFzeW5jSGVscGVycy5hc3luYztcbmxldCBkZWJ1ZyA9IHJlcXVpcmUoXCJkZWJ1Z1wiKShcIndmNG5vZGU6V2FrZVVwXCIpO1xubGV0IHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcblxuZnVuY3Rpb24gV2FrZVVwKGtub3duSW5zdGFTdG9yZSwgcGVyc2lzdGVuY2UsIG9wdGlvbnMpIHtcbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMua25vd25JbnN0YVN0b3JlID0ga25vd25JbnN0YVN0b3JlO1xuICAgIHRoaXMucGVyc2lzdGVuY2UgPSBwZXJzaXN0ZW5jZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuX3dvcmtpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9pbnRlcnZhbCA9IG51bGw7XG4gICAgdGhpcy5fYmF0Y2hTaXplID0gdGhpcy5vcHRpb25zLmJhdGNoU2l6ZSB8fCAxMDtcbn1cblxudXRpbC5pbmhlcml0cyhXYWtlVXAsIEV2ZW50RW1pdHRlcik7XG5cbldha2VVcC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9pbnRlcnZhbCkge1xuICAgICAgICBkZWJ1ZyhcIlN0YXJ0LlwiKTtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHsgc2VsZi5fc3RlcCgpOyB9LCB0aGlzLm9wdGlvbnMuaW50ZXJ2YWwgfHwgNTAwMCk7XG4gICAgfVxufTtcblxuV2FrZVVwLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9pbnRlcnZhbCkge1xuICAgICAgICBkZWJ1ZyhcIlN0b3AuXCIpO1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuX2ludGVydmFsKTtcbiAgICAgICAgdGhpcy5faW50ZXJ2YWwgPSBudWxsO1xuICAgIH1cbn07XG5cbldha2VVcC5wcm90b3R5cGUuX3N0ZXAgPSBhc3luYyhmdW5jdGlvbiooKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmICh0aGlzLl93b3JraW5nKSB7XG4gICAgICAgIGRlYnVnKFwiU2tpcHBpbmcgY3VycmVudCBzdGVwIGJlY2F1c2Ugd29yayBpbiBwcm9ncmVzcy5cIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGVidWcoXCJTdGFydGluZyBuZXh0IHN0ZXAuXCIpO1xuICAgIHRoaXMuX3dvcmtpbmcgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCB3YWtldXBhYmxlcyA9IHlpZWxkIHRoaXMuX2dldE5leHRXYWtldXBhYmxlcygpO1xuICAgICAgICBpZiAod2FrZXVwYWJsZXMgJiYgd2FrZXVwYWJsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVkIHNlbGVjdGVkIHRvIHdha2UgdXAuXCIsIHdha2V1cGFibGVzLmxlbmd0aCk7XG4gICAgICAgICAgICBsZXQgdGFza3MgPSBbXTtcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCB3YWtldXBhYmxlIG9mIHdha2V1cGFibGVzKSB7XG4gICAgICAgICAgICAgICAgdGFza3MucHVzaChhc3luYyhmdW5jdGlvbiooKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCA+PSBzZWxmLl9iYXRjaFNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIldha2luZyB1cCB3b3JrZmxvdyAlcywgaWQ6ICVzXCIsIHdha2V1cGFibGUud29ya2Zsb3dOYW1lLCB3YWtldXBhYmxlLmluc3RhbmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICB3YWtldXBhYmxlLnJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvbWlzZSA9IG5ldyBCbHVlYmlyZChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YWtldXBhYmxlLnJlc3VsdC5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdha2V1cGFibGUucmVzdWx0LnJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdChcImNvbnRpbnVlXCIsIHdha2V1cGFibGUpO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgcHJvbWlzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIlByb2Nlc3NpbmcgZGVsYXkgY29tcGxldGVkLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJQcm9jZXNzaW5nIGRlbGF5IGVycm9yOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgcmVzdWx0cyA9IHlpZWxkIEJsdWViaXJkLnNldHRsZSh0YXNrcyk7XG4gICAgICAgICAgICBmb3IgKGxldCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuaXNSZWplY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IHJlc3VsdC5yZWFzb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIlRoZXJlIGlzIG5vIGluc3RhbmNlIHRvIHdha2UgdXAuXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZW1pdChcImVycm9yXCIsIGUpO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgICAgZGVidWcoXCJOZXh0IHN0ZXAgY29tcGxldGVkLlwiKTtcbiAgICAgICAgdGhpcy5fd29ya2luZyA9IGZhbHNlO1xuICAgIH1cbn0pO1xuXG5XYWtlVXAucHJvdG90eXBlLl9nZXROZXh0V2FrZXVwYWJsZXMgPSBhc3luYyhmdW5jdGlvbiogKCkge1xuICAgIGlmICh0aGlzLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgIHJldHVybiB5aWVsZCB0aGlzLnBlcnNpc3RlbmNlLmdldE5leHRXYWtldXBhYmxlcyh0aGlzLl9iYXRjaFNpemUgKiAxLjUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMua25vd25JbnN0YVN0b3JlLmdldE5leHRXYWtldXBhYmxlcyh0aGlzLl9iYXRjaFNpemUgKiAxLjUpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdha2VVcDsiXX0=
