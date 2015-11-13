"use strict";
var Activity = require("./activity");
var ActivityExecutionContext = require("./activityExecutionContext");
var ActivityExecutionState = require("./activityExecutionState");
var CallContext = require("./callContext");
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var errors = require("../common/errors");
var _ = require("lodash");
var ActivityStateTracker = require("./activityStateTracker");
var enums = require("../common/enums");
var Bluebird = require("bluebird");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;
var activityMarkup = require("./activityMarkup");
function ActivityExecutionEngine(contextOrActivity, instance) {
  EventEmitter.call(this);
  if (contextOrActivity instanceof Activity) {
    this.rootActivity = contextOrActivity;
    this.context = new ActivityExecutionContext(this);
    this._isInitialized = false;
  } else if (contextOrActivity instanceof ActivityExecutionContext) {
    this.rootActivity = contextOrActivity.rootActivity;
    this.context = contextOrActivity;
    this.context.engine = this;
    this._isInitialized = true;
  } else if (_.isPlainObject(contextOrActivity)) {
    this.rootActivity = activityMarkup.parse(contextOrActivity);
    this.context = new ActivityExecutionContext(this);
    this._isInitialized = false;
  } else {
    throw new TypeError("Argument 'contextOrActivity' is not an activity, context or a markup.");
  }
  this._rootState = null;
  this._trackers = [];
  this._hookContext();
  this.updatedOn = null;
  this.instance = instance || null;
}
util.inherits(ActivityExecutionEngine, EventEmitter);
Object.defineProperties(ActivityExecutionEngine.prototype, {
  execState: {get: function() {
      if (this._rootState) {
        return this._rootState.execState;
      } else {
        return null;
      }
    }},
  version: {get: function() {
      return this.rootActivity.version;
    }}
});
ActivityExecutionEngine.prototype._idle = {toString: function() {
    return enums.activityStates.idle;
  }};
ActivityExecutionEngine.prototype.isIdle = function(result) {
  return result === this._idle;
};
ActivityExecutionEngine.prototype._initialize = function() {
  if (!this._isInitialized) {
    this.context.initialize(this.rootActivity);
    this._isInitialized = true;
  }
};
ActivityExecutionEngine.prototype._setRootState = function(state) {
  var self = this;
  if (!self._rootState) {
    self._rootState = state;
    self._rootState.on(Activity.states.cancel, function(args) {
      self.emit(Activity.states.cancel, args);
    });
    self._rootState.on(Activity.states.complete, function(args) {
      self.emit(Activity.states.complete, args);
    });
    self._rootState.on(Activity.states.end, function(args) {
      self.updatedOn = new Date();
      self.emit(Activity.states.end, args);
    });
    self._rootState.on(Activity.states.fail, function(args) {
      self.emit(Activity.states.fail, args);
    });
    self._rootState.on(Activity.states.run, function(args) {
      self.emit(Activity.states.run, args);
    });
    self._rootState.on(Activity.states.idle, function(args) {
      self.emit(Activity.states.idle, args);
    });
  }
};
ActivityExecutionEngine.prototype._hookContext = function() {
  var self = this;
  self.context.on(Activity.states.run, function(args) {
    var $__5 = true;
    var $__6 = false;
    var $__7 = undefined;
    try {
      for (var $__3 = void 0,
          $__2 = (self._trackers)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
        var t = $__3.value;
        {
          t.activityStateChanged(args);
        }
      }
    } catch ($__8) {
      $__6 = true;
      $__7 = $__8;
    } finally {
      try {
        if (!$__5 && $__2.return != null) {
          $__2.return();
        }
      } finally {
        if ($__6) {
          throw $__7;
        }
      }
    }
  });
  self.context.on(Activity.states.end, function(args) {
    var $__5 = true;
    var $__6 = false;
    var $__7 = undefined;
    try {
      for (var $__3 = void 0,
          $__2 = (self._trackers)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
        var t = $__3.value;
        {
          t.activityStateChanged(args);
        }
      }
    } catch ($__8) {
      $__6 = true;
      $__7 = $__8;
    } finally {
      try {
        if (!$__5 && $__2.return != null) {
          $__2.return();
        }
      } finally {
        if ($__6) {
          throw $__7;
        }
      }
    }
  });
  self.context.on(enums.events.workflowEvent, function(args) {
    self.emit(enums.events.workflowEvent, args);
  });
};
ActivityExecutionEngine.prototype.addTracker = function(tracker) {
  if (!_.isObject(tracker)) {
    throw new TypeError("Parameter is not an object.");
  }
  this._trackers.push(new ActivityStateTracker(tracker));
};
ActivityExecutionEngine.prototype.removeTracker = function(tracker) {
  var idx = -1;
  for (var i = 0; i < this._trackers.length; i++) {
    var t = this._trackers[i];
    if (t._impl === tracker) {
      idx = i;
      break;
    }
  }
  if (idx !== -1) {
    this._trackers.splice(idx, 1);
  }
};
ActivityExecutionEngine.prototype.start = async($traceurRuntime.initGeneratorFunction(function $__9() {
  var args,
      $__5,
      $__6,
      $__7,
      $__3,
      $__2,
      a,
      $__10,
      $__11,
      $__12,
      $__13,
      $__14,
      $__15,
      $__16,
      $__17;
  var $arguments = arguments;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          this._verifyNotStarted();
          this._initialize();
          args = [new CallContext(this.context)];
          $__5 = true;
          $__6 = false;
          $__7 = undefined;
          try {
            for ($__3 = void 0, $__2 = ($arguments)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
              a = $__3.value;
              {
                args.push(a);
              }
            }
          } catch ($__8) {
            $__6 = true;
            $__7 = $__8;
          } finally {
            try {
              if (!$__5 && $__2.return != null) {
                $__2.return();
              }
            } finally {
              if ($__6) {
                throw $__7;
              }
            }
          }
          $ctx.state = 10;
          break;
        case 10:
          $__10 = this._setRootState;
          $__11 = this.rootActivity;
          $__12 = $__11.start;
          $__13 = $__12.apply;
          $__14 = this.rootActivity;
          $__15 = $__13.call($__12, $__14, args);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__15;
        case 2:
          $__16 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__17 = $__10.call(this, $__16);
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__9, this);
}));
ActivityExecutionEngine.prototype.invoke = function() {
  var self = this;
  self._verifyNotStarted();
  self._initialize();
  var args = [];
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (arguments)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var a = $__3.value;
      {
        args.push(a);
      }
    }
  } catch ($__8) {
    $__6 = true;
    $__7 = $__8;
  } finally {
    try {
      if (!$__5 && $__2.return != null) {
        $__2.return();
      }
    } finally {
      if ($__6) {
        throw $__7;
      }
    }
  }
  args.unshift(new CallContext(self.context));
  return new Bluebird(function(resolve, reject) {
    try {
      self._setRootState(self.context.getExecutionState(self.rootActivity));
      self.once(Activity.states.end, function(eArgs) {
        var reason = eArgs.reason;
        var result = eArgs.result;
        switch (reason) {
          case Activity.states.complete:
            resolve(result);
            break;
          case Activity.states.cancel:
            reject(new errors.Cancelled());
            break;
          case Activity.states.idle:
            resolve(self._idle);
            break;
          default:
            result = result || new errors.ActivityRuntimeError("Unknown error.");
            reject(result);
            break;
        }
      });
      self.rootActivity.start.apply(self.rootActivity, args);
    } catch (e) {
      reject(e);
    }
  });
};
ActivityExecutionEngine.prototype._verifyNotStarted = function() {
  if (!(!this.execState || this.execState === enums.activityStates.complete)) {
    throw new errors.ActivityStateExceptionError("Workflow has been already started.");
  }
};
ActivityExecutionEngine.prototype.resumeBookmark = function(name, reason, result) {
  var self = this;
  self._initialize();
  return new Bluebird(function(resolve, reject) {
    try {
      self._setRootState(self.context.getExecutionState(self.rootActivity));
      if (self.execState === enums.activityStates.idle) {
        var bmTimestamp = self.context.getBookmarkTimestamp(name);
        self.once(Activity.states.end, function(args) {
          var _reason = args.reason;
          var _result = args.result;
          try {
            if (_reason === enums.activityStates.complete || _reason === enums.activityStates.idle) {
              var endBmTimestamp = self.context.getBookmarkTimestamp(name);
              if (endBmTimestamp && endBmTimestamp === bmTimestamp) {
                if (_reason === enums.activityStates.complete) {
                  reject(new errors.ActivityRuntimeError("Workflow has been completed before bookmark '" + name + "' reached."));
                } else {
                  reject(new errors.Idle("Workflow has been gone to idle before bookmark '" + name + "' reached."));
                }
              } else {
                resolve();
              }
            } else if (_reason === enums.activityStates.cancel) {
              reject(new errors.ActivityRuntimeError("Workflow has been cancelled before bookmark '" + name + "' reached."));
            } else if (_reason === enums.activityStates.fail) {
              reject(_result);
            }
          } catch (e) {
            reject(e);
          }
        });
        self.context.resumeBookmarkExternal(name, reason, result);
      } else {
        reject(new errors.ActivityRuntimeError("Cannot resume bookmark, while the workflow is not in the idle state."));
      }
    } catch (e) {
      reject(e);
    }
  });
};
ActivityExecutionEngine.prototype.getStateAndPromotions = function(serializer, enablePromotions) {
  if (serializer && !_.isObject(serializer)) {
    throw new Error("Argument 'serializer' is not an object.");
  }
  this._initialize();
  return this.context.getStateAndPromotions(serializer, enablePromotions);
};
ActivityExecutionEngine.prototype.setState = function(serializer, json) {
  if (serializer && !_.isObject(serializer)) {
    throw new Error("Argument 'serializer' is not an object.");
  }
  if (!_.isObject(json)) {
    throw new TypeError("Argument 'json' is not an object.");
  }
  this._initialize();
  this.updatedOn = new Date();
  this.context.setState(serializer, json);
};
module.exports = ActivityExecutionEngine;

//# sourceMappingURL=activityExecutionEngine.js.map
