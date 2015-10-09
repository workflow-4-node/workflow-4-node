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
//# sourceMappingURL=data:application/json;base64,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V0FBVztnQkFBbEQsV0FBbUMsT0FBQyxRQUFrQixJQUFFLENBQUM7Ozs7Ozs7Z0JBdkc5RSxDQUFBLElBQUcsS0FBSzs7OztBQUFSLGFBQUcsWUFBWSxRQUFvQixDQUFBOzs7O0FBQW5DLGFBQUcsWUFBWSxFQTBHQSxDQUFBLElBQUcsZ0JBQWdCLG1CQUFtQixBQUFDLENBQUMsSUFBRyxXQUFXLEVBQUksSUFBRSxDQUFDLEFBMUd6QyxDQUFBOzs7O0FBQW5DLGVBQU8sQ0FBQSxJQUFHLElBQUksQUFBQyxFQUFDLENBQUE7O0FBQ21CLEVBQy9CLFFBQTZCLEtBQUcsQ0FBQyxDQUFDO0FBMEd0QyxDQTVHdUQsQ0E0R3RELENBQUM7QUFFRixLQUFLLFFBQVEsRUFBSSxPQUFLLENBQUM7QUFBQSIsImZpbGUiOiJob3N0aW5nL3dha2VVcC5qcyIsInNvdXJjZVJvb3QiOiJsaWIvZXM2Iiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlcjtcbmxldCBCbHVlYmlyZCA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcbmxldCBhc3luYyA9IHJlcXVpcmUoXCIuLi9jb21tb25cIikuYXN5bmNIZWxwZXJzLmFzeW5jO1xubGV0IGRlYnVnID0gcmVxdWlyZShcImRlYnVnXCIpKFwid2Y0bm9kZTpXYWtlVXBcIik7XG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xuXG5mdW5jdGlvbiBXYWtlVXAoa25vd25JbnN0YVN0b3JlLCBwZXJzaXN0ZW5jZSwgb3B0aW9ucykge1xuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5rbm93bkluc3RhU3RvcmUgPSBrbm93bkluc3RhU3RvcmU7XG4gICAgdGhpcy5wZXJzaXN0ZW5jZSA9IHBlcnNpc3RlbmNlO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5fd29ya2luZyA9IGZhbHNlO1xuICAgIHRoaXMuX3RpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMuX2JhdGNoU2l6ZSA9IHRoaXMub3B0aW9ucy5iYXRjaFNpemUgfHwgMTA7XG59XG5cbnV0aWwuaW5oZXJpdHMoV2FrZVVwLCBFdmVudEVtaXR0ZXIpO1xuXG5XYWtlVXAucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fdGltZW91dCkge1xuICAgICAgICBkZWJ1ZyhcIlN0YXJ0LlwiKTtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNlbGYuX3N0ZXAoKTsgfSwgdGhpcy5vcHRpb25zLmludGVydmFsIHx8IDUwMDApO1xuICAgIH1cbn07XG5cbldha2VVcC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fdGltZW91dCkge1xuICAgICAgICBkZWJ1ZyhcIlN0b3AuXCIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dCk7XG4gICAgICAgIHRoaXMuX3RpbWVvdXQgPSBudWxsO1xuICAgIH1cbn07XG5cbldha2VVcC5wcm90b3R5cGUuX3N0ZXAgPSBhc3luYyhmdW5jdGlvbiooKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0aGlzLl93b3JraW5nKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIlNraXBwaW5nIGN1cnJlbnQgc3RlcCBiZWNhdXNlIHdvcmsgaW4gcHJvZ3Jlc3MuXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRlYnVnKFwiU3RhcnRpbmcgbmV4dCBzdGVwLlwiKTtcbiAgICAgICAgdGhpcy5fd29ya2luZyA9IHRydWU7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgd2FrZXVwYWJsZXMgPSB5aWVsZCB0aGlzLl9nZXROZXh0V2FrZXVwYWJsZXMoKTtcbiAgICAgICAgICAgIGlmICh3YWtldXBhYmxlcyAmJiB3YWtldXBhYmxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVkIHNlbGVjdGVkIHRvIHdha2UgdXAuXCIsIHdha2V1cGFibGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHRhc2tzID0gW107XG4gICAgICAgICAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB3YWtldXBhYmxlIG9mIHdha2V1cGFibGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tzLnB1c2goYXN5bmMoZnVuY3Rpb24qKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID49IHNlbGYuX2JhdGNoU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiV2FraW5nIHVwIHdvcmtmbG93ICVzLCBpZDogJXNcIiwgd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsIHdha2V1cGFibGUuaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3YWtldXBhYmxlLnJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHByb21pc2UgPSBuZXcgQmx1ZWJpcmQoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdha2V1cGFibGUucmVzdWx0LnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdha2V1cGFibGUucmVzdWx0LnJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiY29udGludWVcIiwgd2FrZXVwYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHByb21pc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIlByb2Nlc3NpbmcgZGVsYXkgY29tcGxldGVkLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJQcm9jZXNzaW5nIGRlbGF5IGVycm9yOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkoKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdHMgPSB5aWVsZCBCbHVlYmlyZC5zZXR0bGUodGFza3MpO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHJlc3VsdCBvZiByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuaXNSZWplY3RlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyByZXN1bHQucmVhc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIlRoZXJlIGlzIG5vIGluc3RhbmNlIHRvIHdha2UgdXAuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCBlKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGRlYnVnKFwiTmV4dCBzdGVwIGNvbXBsZXRlZC5cIik7XG4gICAgICAgICAgICB0aGlzLl93b3JraW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIGlmICh0aGlzLl90aW1lb3V0KSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHNlbGYuX3N0ZXAoKTsgfSwgdGhpcy5vcHRpb25zLmludGVydmFsIHx8IDUwMDApO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbldha2VVcC5wcm90b3R5cGUuX2dldE5leHRXYWtldXBhYmxlcyA9IGFzeW5jKGZ1bmN0aW9uKiAoKSB7XG4gICAgaWYgKHRoaXMucGVyc2lzdGVuY2UpIHtcbiAgICAgICAgcmV0dXJuIHlpZWxkIHRoaXMucGVyc2lzdGVuY2UuZ2V0TmV4dFdha2V1cGFibGVzKHRoaXMuX2JhdGNoU2l6ZSAqIDEuNSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5rbm93bkluc3RhU3RvcmUuZ2V0TmV4dFdha2V1cGFibGVzKHRoaXMuX2JhdGNoU2l6ZSAqIDEuNSk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2FrZVVwOyJdfQ==
