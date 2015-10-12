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

//# sourceMappingURL=wakeUp.js.map
