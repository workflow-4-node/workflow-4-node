"use strict";
var guids = require("../common/guids");
var errors = require("../common/errors");
var enums = require("../common/enums");
var _ = require("lodash");
var specStrings = require("../common/specStrings");
var util = require("util");
var is = require("../common/is");
var CallContext = require("./callContext");
var uuid = require('node-uuid');
var async = require("../common/asyncHelpers").async;
var assert = require("better-assert");
var debug = require("debug")("wf4node:Activity");
var common = require("../common");
var SimpleProxy = common.SimpleProxy;
function Activity() {
  this.args = null;
  this.displayName = null;
  this.id = uuid.v4();
  this._structureInitialized = false;
  this._scopeKeys = null;
  this["@require"] = null;
  this.nonSerializedProperties = new Set();
  this.nonScopedProperties = new Set();
  this.nonScopedProperties.add("nonScopedProperties");
  this.nonScopedProperties.add("nonSerializedProperties");
  this.nonScopedProperties.add("activity");
  this.nonScopedProperties.add("id");
  this.nonScopedProperties.add("args");
  this.nonScopedProperties.add("displayName");
  this.nonScopedProperties.add("complete");
  this.nonScopedProperties.add("cancel");
  this.nonScopedProperties.add("idle");
  this.nonScopedProperties.add("fail");
  this.nonScopedProperties.add("end");
  this.nonScopedProperties.add("schedule");
  this.nonScopedProperties.add("createBookmark");
  this.nonScopedProperties.add("resumeBookmark");
  this.nonScopedProperties.add("resultCollected");
  this.nonScopedProperties.add("codeProperties");
  this.nonScopedProperties.add("initializeStructure");
  this.nonScopedProperties.add("_initializeStructure");
  this.nonScopedProperties.add("_structureInitialized");
  this.nonScopedProperties.add("clone");
  this.nonScopedProperties.add("_scopeKeys");
  this.nonScopedProperties.add("_createScopePartImpl");
  this.nonScopedProperties.add("@require");
  this.nonScopedProperties.add("initializeExec");
  this.nonScopedProperties.add("unInitializeExec");
  this.nonScopedProperties.add("_scheduleSubActivities");
  this.codeProperties = new Set();
  this.arrayProperties = new Set(["args"]);
}
Object.defineProperties(Activity.prototype, {
  _scopeKeys: {
    value: null,
    writable: true,
    enumerable: false
  },
  _createScopePartImpl: {
    value: null,
    writable: true,
    enumerable: false
  },
  collectAll: {
    value: true,
    writable: false,
    enumerable: false
  }
});
Activity.prototype.getInstanceId = function(execContext) {
  return execContext.getInstanceId(this);
};
Activity.prototype.toString = function() {
  return (this.displayName ? (this.displayName + " ") : "") + "(" + this.constructor.name + ":" + this.id + ")";
};
Activity.prototype.all = $traceurRuntime.initGeneratorFunction(function $__17(execContext) {
  var $__18,
      $__19;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__18 = $ctx.wrapYieldStar(this._children(true, null, execContext, null)[Symbol.iterator]());
          $ctx.sent = void 0;
          $ctx.action = 'next';
          $ctx.state = 12;
          break;
        case 12:
          $__19 = $__18[$ctx.action]($ctx.sentIgnoreThrow);
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = ($__19.done) ? 3 : 2;
          break;
        case 3:
          $ctx.sent = $__19.value;
          $ctx.state = -2;
          break;
        case 2:
          $ctx.state = 12;
          return $__19.value;
        default:
          return $ctx.end();
      }
  }, $__17, this);
});
Activity.prototype.children = $traceurRuntime.initGeneratorFunction(function $__20(execContext) {
  var $__21,
      $__22;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__21 = $ctx.wrapYieldStar(this._children(true, this, execContext, null)[Symbol.iterator]());
          $ctx.sent = void 0;
          $ctx.action = 'next';
          $ctx.state = 12;
          break;
        case 12:
          $__22 = $__21[$ctx.action]($ctx.sentIgnoreThrow);
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = ($__22.done) ? 3 : 2;
          break;
        case 3:
          $ctx.sent = $__22.value;
          $ctx.state = -2;
          break;
        case 2:
          $ctx.state = 12;
          return $__22.value;
        default:
          return $ctx.end();
      }
  }, $__20, this);
});
Activity.prototype.immediateChildren = $traceurRuntime.initGeneratorFunction(function $__23(execContext) {
  var $__24,
      $__25;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__24 = $ctx.wrapYieldStar(this._children(false, this, execContext)[Symbol.iterator]());
          $ctx.sent = void 0;
          $ctx.action = 'next';
          $ctx.state = 12;
          break;
        case 12:
          $__25 = $__24[$ctx.action]($ctx.sentIgnoreThrow);
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = ($__25.done) ? 3 : 2;
          break;
        case 3:
          $ctx.sent = $__25.value;
          $ctx.state = -2;
          break;
        case 2:
          $ctx.state = 12;
          return $__25.value;
        default:
          return $ctx.end();
      }
  }, $__23, this);
});
Activity.prototype._children = $traceurRuntime.initGeneratorFunction(function $__26(deep, except, execContext, visited) {
  var self,
      $__27,
      $__28,
      $__29,
      $__30,
      fieldName,
      fieldValue,
      $__5,
      $__6,
      $__7,
      $__3,
      $__2,
      obj,
      $__31,
      $__32,
      $__8,
      $__33,
      $__34;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          assert(execContext instanceof require("./activityExecutionContext"), "Cannot enumerate activities without an execution context.");
          visited = visited || new Set();
          self = this;
          $ctx.state = 80;
          break;
        case 80:
          $ctx.state = (!visited.has(self)) ? 76 : -2;
          break;
        case 76:
          visited.add(self);
          this._initializeStructure(execContext);
          $ctx.state = 77;
          break;
        case 77:
          $ctx.state = (self !== except) ? 1 : 4;
          break;
        case 1:
          $ctx.state = 2;
          return self;
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          $__27 = [];
          $__28 = self;
          for ($__29 in $__28)
            $__27.push($__29);
          $ctx.state = 75;
          break;
        case 75:
          $__30 = 0;
          $ctx.state = 73;
          break;
        case 73:
          $ctx.state = ($__30 < $__27.length) ? 67 : -2;
          break;
        case 34:
          $__30++;
          $ctx.state = 73;
          break;
        case 67:
          fieldName = $__27[$__30];
          $ctx.state = 68;
          break;
        case 68:
          $ctx.state = (!(fieldName in $__28)) ? 34 : 65;
          break;
        case 65:
          fieldValue = self[fieldName];
          $ctx.state = 70;
          break;
        case 70:
          $ctx.state = (fieldValue) ? 62 : 34;
          break;
        case 62:
          $ctx.state = (_.isArray(fieldValue)) ? 42 : 61;
          break;
        case 42:
          $__5 = true;
          $__6 = false;
          $__7 = undefined;
          $ctx.state = 43;
          break;
        case 43:
          $ctx.pushTry(29, 30);
          $ctx.state = 32;
          break;
        case 32:
          $__3 = void 0, $__2 = (fieldValue)[$traceurRuntime.toProperty(Symbol.iterator)]();
          $ctx.state = 28;
          break;
        case 28:
          $ctx.state = (!($__5 = ($__3 = $__2.next()).done)) ? 24 : 26;
          break;
        case 15:
          $__5 = true;
          $ctx.state = 28;
          break;
        case 24:
          obj = $__3.value;
          $ctx.state = 25;
          break;
        case 25:
          $ctx.state = (obj instanceof Activity) ? 22 : 15;
          break;
        case 22:
          $ctx.state = (deep) ? 16 : 18;
          break;
        case 16:
          $__31 = $ctx.wrapYieldStar(obj._children(deep, except, execContext, visited)[Symbol.iterator]());
          $ctx.sent = void 0;
          $ctx.action = 'next';
          $ctx.state = 17;
          break;
        case 17:
          $__32 = $__31[$ctx.action]($ctx.sentIgnoreThrow);
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = ($__32.done) ? 8 : 7;
          break;
        case 8:
          $ctx.sent = $__32.value;
          $ctx.state = 15;
          break;
        case 7:
          $ctx.state = 17;
          return $__32.value;
        case 18:
          $ctx.state = 19;
          return obj;
        case 19:
          $ctx.maybeThrow();
          $ctx.state = 15;
          break;
        case 26:
          $ctx.popTry();
          $ctx.state = 30;
          $ctx.finallyFallThrough = 34;
          break;
        case 29:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          $__8 = $ctx.storedException;
          $ctx.state = 35;
          break;
        case 35:
          $__6 = true;
          $__7 = $__8;
          $ctx.state = 30;
          $ctx.finallyFallThrough = 34;
          break;
        case 30:
          $ctx.popTry();
          $ctx.state = 41;
          break;
        case 41:
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
          $ctx.state = 39;
          break;
        case 61:
          $ctx.state = (fieldValue instanceof Activity) ? 60 : 34;
          break;
        case 60:
          $ctx.state = (deep) ? 54 : 56;
          break;
        case 54:
          $__33 = $ctx.wrapYieldStar(fieldValue._children(deep, except, execContext, visited)[Symbol.iterator]());
          $ctx.sent = void 0;
          $ctx.action = 'next';
          $ctx.state = 55;
          break;
        case 55:
          $__34 = $__33[$ctx.action]($ctx.sentIgnoreThrow);
          $ctx.state = 52;
          break;
        case 52:
          $ctx.state = ($__34.done) ? 46 : 45;
          break;
        case 46:
          $ctx.sent = $__34.value;
          $ctx.state = 34;
          break;
        case 45:
          $ctx.state = 55;
          return $__34.value;
        case 56:
          $ctx.state = 57;
          return fieldValue;
        case 57:
          $ctx.maybeThrow();
          $ctx.state = 34;
          break;
        case 39:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__26, this);
});
Activity.prototype.isArrayProperty = function(propName) {
  return this.arrayProperties.has(propName);
};
Activity.prototype._initializeStructure = function(execContext) {
  assert(!!execContext);
  if (!this._structureInitialized) {
    this.initializeStructure(execContext);
    this._structureInitialized = true;
  }
};
Activity.prototype.initializeStructure = _.noop;
Activity.prototype.clone = function() {
  function makeClone(value, canCloneArrays) {
    if (value instanceof Activity) {
      return value.clone();
    } else if (value instanceof Set) {
      var newSet = new Set();
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (value.values())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var item = $__3.value;
          {
            newSet.add(item);
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
      return newSet;
    } else if (_.isArray(value)) {
      if (canCloneArrays) {
        var newArray = [];
        var $__12 = true;
        var $__13 = false;
        var $__14 = undefined;
        try {
          for (var $__10 = void 0,
              $__9 = (value)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__12 = ($__10 = $__9.next()).done); $__12 = true) {
            var item$__16 = $__10.value;
            {
              newArray.push(makeClone(item$__16, false));
            }
          }
        } catch ($__15) {
          $__13 = true;
          $__14 = $__15;
        } finally {
          try {
            if (!$__12 && $__9.return != null) {
              $__9.return();
            }
          } finally {
            if ($__13) {
              throw $__14;
            }
          }
        }
        return newArray;
      } else {
        throw new Error("Cannot clone activity's nested arrays.");
      }
    } else {
      return value;
    }
  }
  var Constructor = this.constructor;
  var newInst = new Constructor();
  for (var key in this) {
    var value = this[key];
    if (newInst[key] !== value) {
      newInst[key] = makeClone(value, true);
    }
  }
  return newInst;
};
Activity.prototype.start = function(callContext) {
  var self = this;
  if (!(callContext instanceof CallContext)) {
    throw new Error("Argument 'context' is not an instance of ActivityExecutionContext.");
  }
  var args = self.args;
  if (arguments.length > 1) {
    args = [];
    for (var i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
  }
  this._start(callContext, null, args);
};
Activity.prototype._start = function(callContext, variables, args) {
  var self = this;
  var myCallContext = callContext.next(self, variables);
  var state = myCallContext.executionState;
  if (state.isRunning) {
    throw new Error("Activity is already running.");
  }
  setImmediate(function() {
    state.reportState(Activity.states.run, null, myCallContext.scope);
    try {
      self.initializeExec.call(myCallContext.scope);
      self.run.call(myCallContext.scope, myCallContext, args || self.args || []);
    } catch (e) {
      self.fail(myCallContext, e);
    }
  });
};
Activity.prototype.initializeExec = _.noop;
Activity.prototype.unInitializeExec = _.noop;
Activity.prototype.run = function(callContext, args) {
  callContext.activity.complete(callContext, args);
};
Activity.prototype.complete = function(callContext, result) {
  this.end(callContext, Activity.states.complete, result);
};
Activity.prototype.cancel = function(callContext) {
  this.end(callContext, Activity.states.cancel);
};
Activity.prototype.idle = function(callContext) {
  this.end(callContext, Activity.states.idle);
};
Activity.prototype.fail = function(callContext, e) {
  this.end(callContext, Activity.states.fail, e);
};
Activity.prototype.end = function(callContext, reason, result) {
  try {
    this.unInitializeExec.call(callContext.scope, reason, result);
  } catch (e) {
    var message = ("unInitializeExec failed. Reason of ending was '" + reason + "' and the result is '" + result + ".");
    reason = Activity.states.fail;
    result = e;
  }
  var state = callContext.executionState;
  if (state.execState === Activity.states.cancel || state.execState === Activity.states.fail) {
    return;
  }
  state.execState = reason;
  var inIdle = reason === Activity.states.idle;
  var execContext = callContext.executionContext;
  var savedScope = callContext.scope;
  savedScope.update(SimpleProxy.updateMode.oneWay);
  callContext = callContext.back(inIdle);
  if (callContext) {
    try {
      var bmName = specStrings.activities.createValueCollectedBMName(this.getInstanceId(execContext));
      if (execContext.isBookmarkExists(bmName)) {
        execContext.resumeBookmarkInScope(callContext, bmName, reason, result).then(function() {
          state.emitState(result, savedScope);
        }, function(e) {
          callContext.fail(e);
          state.emitState(result, savedScope);
        });
        return;
      }
    } catch (e) {
      callContext.fail(e);
    }
  } else {
    if (inIdle && execContext.processResumeBookmarkQueue()) {
      return;
    }
  }
  state.emitState(result, savedScope);
};
Activity.prototype._defaultEndCallback = function(callContext, reason, result) {
  callContext.end(reason, result);
};
Activity.prototype.schedule = function(callContext, obj, endCallback) {
  var self = this;
  var scope = callContext.scope;
  var execContext = callContext.executionContext;
  var selfId = callContext.instanceId;
  if (!endCallback) {
    endCallback = "_defaultEndCallback";
  }
  var invokeEndCallback = function(_reason, _result) {
    setImmediate(function() {
      scope[endCallback].call(scope, callContext, _reason, _result);
    });
  };
  if (!_.isString(endCallback)) {
    callContext.fail(new TypeError("Provided argument 'endCallback' value is not a string."));
    return;
  }
  var cb = scope[endCallback];
  if (!_.isFunction(cb)) {
    callContext.fail(new TypeError(("'" + endCallback + "' is not a function.")));
    return;
  }
  if (scope.__schedulingState) {
    debug("%s: Error, already existsing state: %j", selfId, scope.__schedulingState);
    callContext.fail(new errors.ActivityStateExceptionError("There are already scheduled items exists."));
    return;
  }
  debug("%s: Scheduling object(s) by using end callback '%s': %j", selfId, endCallback, obj);
  var state = {
    many: _.isArray(obj),
    indices: new Map(),
    results: [],
    total: 0,
    idleCount: 0,
    cancelCount: 0,
    completedCount: 0,
    endBookmarkName: null,
    endCallbackName: endCallback
  };
  var bookmarkNames = [];
  try {
    var startedAny = false;
    var index = 0;
    var processValue = function(value) {
      debug("%s: Checking value: %j", selfId, value);
      var activity,
          variables = null;
      if (value instanceof Activity) {
        activity = value;
      } else if (_.isObject(value) && value.activity instanceof Activity) {
        activity = value.activity;
        variables = _.isObject(value.variables) ? value.variables : null;
      }
      if (activity) {
        var instanceId = activity.getInstanceId(execContext);
        debug("%s: Value is an activity with instance id: %s", selfId, instanceId);
        if (state.indices.has(instanceId)) {
          throw new errors.ActivityStateExceptionError(("Activity instance '" + instanceId + " has been scheduled already."));
        }
        debug("%s: Creating end bookmark, and starting it.", selfId);
        bookmarkNames.push(execContext.createBookmark(selfId, specStrings.activities.createValueCollectedBMName(instanceId), "resultCollected"));
        activity._start(callContext, variables);
        startedAny = true;
        state.indices.set(instanceId, index);
        state.results.push(null);
        state.total++;
      } else {
        debug("%s: Value is not an activity.", selfId);
        state.results.push(value);
      }
    };
    if (state.many) {
      debug("%s: There are many values, iterating.", selfId);
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (obj)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var value = $__3.value;
          {
            processValue(value);
            index++;
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
    } else {
      processValue(obj);
    }
    if (!startedAny) {
      debug("%s: No activity has been started, calling end callback with original object.", selfId);
      var result = state.many ? state.results : state.results[0];
      invokeEndCallback(Activity.states.complete, result);
    } else {
      debug("%s: %d activities has been started. Registering end bookmark.", selfId, state.indices.size);
      var endBM = specStrings.activities.createCollectingCompletedBMName(selfId);
      bookmarkNames.push(execContext.createBookmark(selfId, endBM, endCallback));
      state.endBookmarkName = endBM;
      scope.__schedulingState = state;
    }
    scope.update(SimpleProxy.updateMode.oneWay);
  } catch (e) {
    debug("%s: Runtime error happened: %s", selfId, e.stack);
    if (bookmarkNames.length) {
      debug("%s: Set bookmarks to noop: $j", selfId, bookmarkNames);
      execContext.noopCallbacks(bookmarkNames);
    }
    scope.delete("__schedulingState");
    debug("%s: Invoking end callback with the error.", selfId);
    invokeEndCallback(Activity.states.fail, e);
  } finally {
    debug("%s: Final state indices count: %d, total: %d", selfId, state.indices.size, state.total);
  }
};
Activity.prototype.resultCollected = function(callContext, reason, result, bookmark) {
  var selfId = callContext.instanceId;
  var execContext = callContext.executionContext;
  var childId = specStrings.getString(bookmark.name);
  debug("%s: Scheduling result item collected, childId: %s, reason: %s, result: %j, bookmark: %j", selfId, childId, reason, result, bookmark);
  var finished = null;
  var state = this.__schedulingState;
  var fail = false;
  try {
    if (!_.isObject(state)) {
      throw new errors.ActivityStateExceptionError("Value of __schedulingState is '" + state + "'.");
    }
    var index = state.indices.get(childId);
    if (_.isUndefined(index)) {
      throw new errors.ActivityStateExceptionError(("Child activity of '" + childId + "' scheduling state index out of renge."));
    }
    debug("%s: Finished child activity id is: %s", selfId, childId);
    switch (reason) {
      case Activity.states.complete:
        debug("%s: Setting %d. value to result: %j", selfId, index, result);
        state.results[index] = result;
        debug("%s: Removing id from state.", selfId);
        state.indices.delete(childId);
        state.completedCount++;
        break;
      case Activity.states.fail:
        debug("%s: Failed with: %s", selfId, result.stack);
        fail = true;
        state.indices.delete(childId);
        break;
      case Activity.states.cancel:
        debug("%s: Incrementing cancel counter.", selfId);
        state.cancelCount++;
        debug("%s: Removing id from state.", selfId);
        state.indices.delete(childId);
        break;
      case Activity.states.idle:
        debug("%s: Incrementing idle counter.", selfId);
        state.idleCount++;
        break;
      default:
        throw new errors.ActivityStateExceptionError(("Result collected with unknown reason '" + reason + "'."));
    }
    debug("%s: State so far = total: %s, indices count: %d, completed count: %d, cancel count: %d, error count: %d, idle count: %d", selfId, state.total, state.indices.size, state.completedCount, state.cancelCount, state.idleCount);
    var endWithNoCollectAll = !callContext.activity.collectAll && reason !== Activity.states.idle;
    if (endWithNoCollectAll || fail) {
      if (!fail) {
        debug("%s: ---- Collecting of values ended, because we're not collecting all values (eg.: Pick).", selfId);
      } else {
        debug("%s: ---- Collecting of values ended, because of an error.", selfId);
      }
      debug("%s: Shutting down %d other, running acitvities.", selfId, state.indices.size);
      var ids = [];
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (state.indices.keys())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var id = $__3.value;
          {
            ids.push(id);
            debug("%s: Deleting scope of activity: %s", selfId, id);
            execContext.deleteScopeOfActivity(callContext, id);
            var ibmName = specStrings.activities.createValueCollectedBMName(id);
            debug("%s: Deleting value collected bookmark: %s", selfId, ibmName);
            execContext.deleteBookmark(ibmName);
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
      execContext.cancelExecution(this, ids);
      debug("%s: Activities cancelled: %j", selfId, ids);
      debug("%s: Reporting the actual reason: %s and result: %j", selfId, reason, result);
      finished = function() {
        execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, reason, result);
      };
    } else {
      assert(!fail);
      var onEnd = (state.indices.size - state.idleCount) === 0;
      if (onEnd) {
        debug("%s: ---- Collecting of values ended (ended because of collect all is off: %s).", selfId, endWithNoCollectAll);
        if (state.cancelCount) {
          debug("%s: Collecting has been cancelled, resuming end bookmarks.", selfId);
          finished = function() {
            execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, Activity.states.cancel);
          };
        } else if (state.idleCount) {
          debug("%s: This entry has been gone to idle, propagating counter.", selfId);
          state.idleCount--;
          execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, Activity.states.idle);
        } else {
          result = state.many ? state.results : state.results[0];
          debug("%s: This entry has been completed, resuming collect bookmark with the result(s): %j", selfId, result);
          finished = function() {
            execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, Activity.states.complete, result);
          };
        }
      }
    }
  } catch (e) {
    callContext.fail(e);
    this.delete("__schedulingState");
  } finally {
    if (finished) {
      debug("%s: Schduling finished, removing state.", selfId);
      this.delete("__schedulingState");
      if (!callContext.activity._scheduleSubActivities.call(this, callContext, reason, result, state.endBookmarkName, state.endCallbackName)) {
        finished();
      }
    }
  }
};
Activity.prototype._scheduleSubActivities = function(callContext, reason, result, endBookmarkName, endCallbackName) {
  if (reason !== Activity.states.complete) {
    return false;
  }
  var selfId = callContext.instanceId;
  var execContext = callContext.executionContext;
  var activitiesMap = new Map();
  var activities = [];
  function reg(activity, index, subIndex) {
    index = _.isNumber(index) ? index : null;
    subIndex = _.isNumber(subIndex) ? subIndex : null;
    var arrIndex = activities.length;
    activities.push(activity);
    activitiesMap.set(arrIndex, {
      index: index,
      subIndex: subIndex
    });
  }
  function regArr(obj, index) {
    if (_.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        var item = obj[i];
        if (item instanceof Activity) {
          reg(item, index, i);
          obj[i] = null;
        }
      }
    } else if (obj instanceof Activity) {
      reg(obj, index);
      return true;
    }
    return false;
  }
  if (_.isArray(result)) {
    for (var i = 0; i < result.length; i++) {
      if (regArr(result[i], i)) {
        result[i] = null;
      }
    }
  } else if (result instanceof Activity) {
    regArr(result);
    result = null;
  }
  if (!activities.length) {
    return false;
  }
  this.__subActivitySchedulingState = {
    endBookmarkName: endBookmarkName,
    endCallbackName: endCallbackName,
    activitiesMap: activitiesMap,
    originalResult: result
  };
  try {
    var endBM = specStrings.activities.createCollectingCompletedBMName(selfId);
    execContext.deleteBookmark(endBM);
    callContext.schedule(activities, "_subActivitiesGot");
    return true;
  } catch (e) {
    this.delete("__subActivitySchedulingState");
    callContext.fail(e);
  }
};
Activity.prototype._subActivitiesGot = function(callContext, reason, result) {
  try {
    if (reason !== Activity.states.complete) {
      callContext.end(reason, result);
      return;
    }
    var execContext = callContext.executionContext;
    var selfId = callContext.instanceId;
    var state = this.__subActivitySchedulingState;
    if (!_.isPlainObject(state) || !_.isString(state.endBookmarkName) || !_.isString(state.endCallbackName) || !(state.activitiesMap instanceof Map) || !state.originalResult) {
      callContext.fail(new errors.ActivityRuntimeError("Callback '_subActivitiesGot' has been invoked, but there is no valid '__subAactivitySchedulingState' value in the scope."));
      return;
    }
    if (!_.isArray(result) || result.length !== state.activitiesMap.size) {
      callContext.fail(new errors.ActivityRuntimeError("Callback '_subActivitiesGot' has been invoked, but the result is invalid."));
      return;
    }
    var finalResult = state.originalResult;
    var $__5 = true;
    var $__6 = false;
    var $__7 = undefined;
    try {
      for (var $__3 = void 0,
          $__2 = (state.activitiesMap.entries())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
        var kvp = $__3.value;
        {
          var arrIdx = kvp[0];
          var pos = kvp[1];
          if (_.isNumber(arrIdx) && arrIdx >= 0 && arrIdx < result.length) {
            var value = result[arrIdx];
            if (pos.index === null) {
              if (finalResult === null) {
                finalResult = value;
                continue;
              }
            } else {
              var index = pos.index;
              if (_.isArray(finalResult) && index >= 0 && index < finalResult.length) {
                if (pos.subIndex === null) {
                  if (finalResult[index] === null) {
                    finalResult[index] = value;
                    continue;
                  }
                } else {
                  var subArray = finalResult[index];
                  var subIndex = pos.subIndex;
                  if (_.isArray(subArray) && subIndex >= 0 && subIndex < subArray.length && subArray[subIndex] === null) {
                    subArray[subIndex] = value;
                    continue;
                  }
                }
              }
            }
          }
          callContext.fail(new errors.ActivityRuntimeError("Callback '_subActivitiesGot' has been invoked, but the state has invalid values."));
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
    execContext.createBookmark(selfId, state.endBookmarkName, state.endCallbackName);
    execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, Activity.states.complete, finalResult);
  } finally {
    this.delete("__subActivitySchedulingState");
  }
};
Activity.prototype._getScopeKeys = function() {
  var self = this;
  if (!self._scopeKeys || !self._structureInitialized) {
    self._scopeKeys = [];
    for (var key in self) {
      if (!self.nonScopedProperties.has(key) && (_.isUndefined(Activity.prototype[key]) || key === "_defaultEndCallback" || key === "_subActivitiesGot")) {
        self._scopeKeys.push(key);
      }
    }
  }
  return self._scopeKeys;
};
Activity.prototype.createScopePart = function() {
  if (!this._structureInitialized) {
    throw new errors.ActivityRuntimeError("Cannot create activity scope for uninitialized activities.");
  }
  if (this._createScopePartImpl === null) {
    var first = true;
    var src = "return {";
    var $__5 = true;
    var $__6 = false;
    var $__7 = undefined;
    try {
      for (var $__3 = void 0,
          $__2 = (this._getScopeKeys())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
        var fieldName = $__3.value;
        {
          if (first) {
            first = false;
          } else {
            src += ",\n";
          }
          if (_.isPlainObject(this[fieldName])) {
            src += fieldName + ":_.clone(a." + fieldName + ", true)";
          } else if (_.isArray(this[fieldName])) {
            src += fieldName + ":a." + fieldName + ".slice(0)";
          } else {
            src += fieldName + ":a." + fieldName;
          }
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
    src += "}";
    try {
      this._createScopePartImpl = new Function("a,_", src);
    } catch (e) {
      debug("Invalid scope part function:%s", src);
      throw e;
    }
  }
  return this._createScopePartImpl(this, _);
};
Activity.states = enums.ActivityStates;
module.exports = Activity;
//# sourceMappingURL=data:application/json;base64,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SUFBSSxTQUFPLEFBQUMsQ0FBQyxLQUFJLENBQUcsSUFBRSxDQUFDLENBQUM7SUFDeEQsQ0FDQSxPQUFPLENBQUEsQ0FBRztBQUNOLFVBQUksQUFBQyxDQUFDLGdDQUErQixDQUFHLElBQUUsQ0FBQyxDQUFDO0FBQzVDLFVBQU0sRUFBQSxDQUFDO0lBQ1g7QUFBQSxFQUNKO0FBQUEsQUFFQSxPQUFPLENBQUEsSUFBRyxxQkFBcUIsQUFBQyxDQUFDLElBQUcsQ0FBRyxFQUFBLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBR0QsT0FBTyxPQUFPLEVBQUksQ0FBQSxLQUFJLGVBQWUsQ0FBQztBQUV0QyxLQUFLLFFBQVEsRUFBSSxTQUFPLENBQUM7QUFDekIiLCJmaWxlIjoiYWN0aXZpdGllcy9hY3Rpdml0eS5qcyIsInNvdXJjZVJvb3QiOiJsaWIvZXM2Iiwic291cmNlc0NvbnRlbnQiOlsiLypqc2hpbnQgLVcwNTQgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBndWlkcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZ3VpZHNcIik7XG5sZXQgZXJyb3JzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lcnJvcnNcIik7XG5sZXQgZW51bXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2VudW1zXCIpO1xubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xubGV0IHNwZWNTdHJpbmdzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9zcGVjU3RyaW5nc1wiKTtcbmxldCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5sZXQgaXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2lzXCIpO1xubGV0IENhbGxDb250ZXh0ID0gcmVxdWlyZShcIi4vY2FsbENvbnRleHRcIik7XG5sZXQgdXVpZCA9IHJlcXVpcmUoJ25vZGUtdXVpZCcpO1xubGV0IGFzeW5jID0gcmVxdWlyZShcIi4uL2NvbW1vbi9hc3luY0hlbHBlcnNcIikuYXN5bmM7XG5sZXQgYXNzZXJ0ID0gcmVxdWlyZShcImJldHRlci1hc3NlcnRcIik7XG5sZXQgZGVidWcgPSByZXF1aXJlKFwiZGVidWdcIikoXCJ3ZjRub2RlOkFjdGl2aXR5XCIpO1xubGV0IGNvbW1vbiA9IHJlcXVpcmUoXCIuLi9jb21tb25cIik7XG5sZXQgU2ltcGxlUHJveHkgPSBjb21tb24uU2ltcGxlUHJveHk7XG5cbmZ1bmN0aW9uIEFjdGl2aXR5KCkge1xuICAgIHRoaXMuYXJncyA9IG51bGw7XG4gICAgdGhpcy5kaXNwbGF5TmFtZSA9IG51bGw7XG4gICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcbiAgICB0aGlzLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuX3Njb3BlS2V5cyA9IG51bGw7XG4gICAgdGhpc1tcIkByZXF1aXJlXCJdID0gbnVsbDtcblxuICAgIC8vIFByb3BlcnRpZXMgbm90IHNlcmlhbGl6ZWQ6XG4gICAgdGhpcy5ub25TZXJpYWxpemVkUHJvcGVydGllcyA9IG5ldyBTZXQoKTtcblxuICAgIC8vIFByb3BlcnRpZXMgYXJlIG5vdCBnb2luZyB0byBjb3BpZWQgaW4gdGhlIHNjb3BlOlxuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwibm9uU2NvcGVkUHJvcGVydGllc1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwibm9uU2VyaWFsaXplZFByb3BlcnRpZXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImFjdGl2aXR5XCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJpZFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiYXJnc1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiZGlzcGxheU5hbWVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImNvbXBsZXRlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjYW5jZWxcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImlkbGVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImZhaWxcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImVuZFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwic2NoZWR1bGVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImNyZWF0ZUJvb2ttYXJrXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJyZXN1bWVCb29rbWFya1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwicmVzdWx0Q29sbGVjdGVkXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjb2RlUHJvcGVydGllc1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiaW5pdGlhbGl6ZVN0cnVjdHVyZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiX2luaXRpYWxpemVTdHJ1Y3R1cmVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl9zdHJ1Y3R1cmVJbml0aWFsaXplZFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY2xvbmVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl9zY29wZUtleXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl9jcmVhdGVTY29wZVBhcnRJbXBsXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJAcmVxdWlyZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiaW5pdGlhbGl6ZUV4ZWNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInVuSW5pdGlhbGl6ZUV4ZWNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl9zY2hlZHVsZVN1YkFjdGl2aXRpZXNcIik7XG5cbiAgICB0aGlzLmNvZGVQcm9wZXJ0aWVzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuYXJyYXlQcm9wZXJ0aWVzID0gbmV3IFNldChbXCJhcmdzXCJdKTtcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQWN0aXZpdHkucHJvdG90eXBlLCB7XG4gICAgX3Njb3BlS2V5czoge1xuICAgICAgICB2YWx1ZTogbnVsbCxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSxcbiAgICBfY3JlYXRlU2NvcGVQYXJ0SW1wbDoge1xuICAgICAgICB2YWx1ZTogbnVsbCxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSxcbiAgICBjb2xsZWN0QWxsOiB7XG4gICAgICAgIHZhbHVlOiB0cnVlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfVxufSk7XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5nZXRJbnN0YW5jZUlkID0gZnVuY3Rpb24gKGV4ZWNDb250ZXh0KSB7XG4gICAgcmV0dXJuIGV4ZWNDb250ZXh0LmdldEluc3RhbmNlSWQodGhpcyk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLmRpc3BsYXlOYW1lID8gKHRoaXMuZGlzcGxheU5hbWUgKyBcIiBcIikgOiBcIlwiKSArIFwiKFwiICsgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgXCI6XCIgKyB0aGlzLmlkICsgXCIpXCI7XG59O1xuXG4vKiBmb3JFYWNoICovXG5BY3Rpdml0eS5wcm90b3R5cGUuYWxsID0gZnVuY3Rpb24qIChleGVjQ29udGV4dCkge1xuICAgIHlpZWxkICogdGhpcy5fY2hpbGRyZW4odHJ1ZSwgbnVsbCwgZXhlY0NvbnRleHQsIG51bGwpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNoaWxkcmVuID0gZnVuY3Rpb24qIChleGVjQ29udGV4dCkge1xuICAgIHlpZWxkICogdGhpcy5fY2hpbGRyZW4odHJ1ZSwgdGhpcywgZXhlY0NvbnRleHQsIG51bGwpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmltbWVkaWF0ZUNoaWxkcmVuID0gZnVuY3Rpb24qIChleGVjQ29udGV4dCkge1xuICAgIHlpZWxkICogdGhpcy5fY2hpbGRyZW4oZmFsc2UsIHRoaXMsIGV4ZWNDb250ZXh0KTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5fY2hpbGRyZW4gPSBmdW5jdGlvbiogKGRlZXAsIGV4Y2VwdCwgZXhlY0NvbnRleHQsIHZpc2l0ZWQpIHtcbiAgICBhc3NlcnQoZXhlY0NvbnRleHQgaW5zdGFuY2VvZiByZXF1aXJlKFwiLi9hY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHRcIiksIFwiQ2Fubm90IGVudW1lcmF0ZSBhY3Rpdml0aWVzIHdpdGhvdXQgYW4gZXhlY3V0aW9uIGNvbnRleHQuXCIpO1xuICAgIHZpc2l0ZWQgPSB2aXNpdGVkIHx8IG5ldyBTZXQoKTtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCF2aXNpdGVkLmhhcyhzZWxmKSkge1xuICAgICAgICB2aXNpdGVkLmFkZChzZWxmKTtcblxuICAgICAgICAvLyBFbnN1cmUgaXQncyBzdHJ1Y3R1cmUgY3JlYXRlZDpcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZVN0cnVjdHVyZShleGVjQ29udGV4dCk7XG5cbiAgICAgICAgaWYgKHNlbGYgIT09IGV4Y2VwdCkge1xuICAgICAgICAgICAgeWllbGQgc2VsZjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGZpZWxkTmFtZSBpbiBzZWxmKSB7XG4gICAgICAgICAgICBsZXQgZmllbGRWYWx1ZSA9IHNlbGZbZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmIChmaWVsZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uaXNBcnJheShmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBvYmogb2YgZmllbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgKiBvYmouX2NoaWxkcmVuKGRlZXAsIGV4Y2VwdCwgZXhlY0NvbnRleHQsIHZpc2l0ZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgb2JqO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmaWVsZFZhbHVlIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkICogZmllbGRWYWx1ZS5fY2hpbGRyZW4oZGVlcCwgZXhjZXB0LCBleGVjQ29udGV4dCwgdmlzaXRlZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcbi8qIGZvckVhY2ggKi9cblxuLyogU3RydWN0dXJlICovXG5BY3Rpdml0eS5wcm90b3R5cGUuaXNBcnJheVByb3BlcnR5ID0gZnVuY3Rpb24gKHByb3BOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuYXJyYXlQcm9wZXJ0aWVzLmhhcyhwcm9wTmFtZSk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX2luaXRpYWxpemVTdHJ1Y3R1cmUgPSBmdW5jdGlvbiAoZXhlY0NvbnRleHQpIHtcbiAgICBhc3NlcnQoISFleGVjQ29udGV4dCk7XG4gICAgaWYgKCF0aGlzLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemVTdHJ1Y3R1cmUoZXhlY0NvbnRleHQpO1xuICAgICAgICB0aGlzLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmluaXRpYWxpemVTdHJ1Y3R1cmUgPSBfLm5vb3A7XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBtYWtlQ2xvbmUodmFsdWUsIGNhbkNsb25lQXJyYXlzKSB7XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuY2xvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgbGV0IG5ld1NldCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGl0ZW0gb2YgdmFsdWUudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICBuZXdTZXQuYWRkKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ld1NldDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAoY2FuQ2xvbmVBcnJheXMpIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3QXJyYXkgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpdGVtIG9mIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0FycmF5LnB1c2gobWFrZUNsb25lKGl0ZW0sIGZhbHNlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXdBcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjbG9uZSBhY3Rpdml0eSdzIG5lc3RlZCBhcnJheXMuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IENvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICBsZXQgbmV3SW5zdCA9IG5ldyBDb25zdHJ1Y3RvcigpO1xuICAgIGZvciAobGV0IGtleSBpbiB0aGlzKSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXNba2V5XTtcbiAgICAgICAgaWYgKG5ld0luc3Rba2V5XSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIG5ld0luc3Rba2V5XSA9IG1ha2VDbG9uZSh2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0luc3Q7XG59O1xuXG4vKiBSVU4gKi9cbkFjdGl2aXR5LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgIGlmICghKGNhbGxDb250ZXh0IGluc3RhbmNlb2YgQ2FsbENvbnRleHQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50ICdjb250ZXh0JyBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LlwiKTtcbiAgICB9XG5cbiAgICBsZXQgYXJncyA9IHNlbGYuYXJncztcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgYXJncyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9zdGFydChjYWxsQ29udGV4dCwgbnVsbCwgYXJncyk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX3N0YXJ0ID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCB2YXJpYWJsZXMsIGFyZ3MpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgbXlDYWxsQ29udGV4dCA9IGNhbGxDb250ZXh0Lm5leHQoc2VsZiwgdmFyaWFibGVzKTtcbiAgICBsZXQgc3RhdGUgPSBteUNhbGxDb250ZXh0LmV4ZWN1dGlvblN0YXRlO1xuICAgIGlmIChzdGF0ZS5pc1J1bm5pbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWN0aXZpdHkgaXMgYWxyZWFkeSBydW5uaW5nLlwiKTtcbiAgICB9XG5cbiAgICAvLyBXZSBzaG91bGQgYWxsb3cgSU8gb3BlcmF0aW9ucyB0byBleGVjdXRlOlxuICAgIHNldEltbWVkaWF0ZShcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc3RhdGUucmVwb3J0U3RhdGUoQWN0aXZpdHkuc3RhdGVzLnJ1biwgbnVsbCwgbXlDYWxsQ29udGV4dC5zY29wZSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHNlbGYuaW5pdGlhbGl6ZUV4ZWMuY2FsbChteUNhbGxDb250ZXh0LnNjb3BlKTtcbiAgICAgICAgICAgICAgICBzZWxmLnJ1bi5jYWxsKG15Q2FsbENvbnRleHQuc2NvcGUsIG15Q2FsbENvbnRleHQsIGFyZ3MgfHwgc2VsZi5hcmdzIHx8IFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mYWlsKG15Q2FsbENvbnRleHQsIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pbml0aWFsaXplRXhlYyA9IF8ubm9vcDtcblxuQWN0aXZpdHkucHJvdG90eXBlLnVuSW5pdGlhbGl6ZUV4ZWMgPSBfLm5vb3A7XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIGFyZ3MpIHtcbiAgICBjYWxsQ29udGV4dC5hY3Rpdml0eS5jb21wbGV0ZShjYWxsQ29udGV4dCwgYXJncyk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlc3VsdCkge1xuICAgIHRoaXMuZW5kKGNhbGxDb250ZXh0LCBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGUsIHJlc3VsdCk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuY2FuY2VsID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0KSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5jYW5jZWwpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmlkbGUgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQpIHtcbiAgICB0aGlzLmVuZChjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmlkbGUpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmZhaWwgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIGUpIHtcbiAgICB0aGlzLmVuZChjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmZhaWwsIGUpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQpIHtcbiAgICB0cnkge1xuICAgICAgICB0aGlzLnVuSW5pdGlhbGl6ZUV4ZWMuY2FsbChjYWxsQ29udGV4dC5zY29wZSwgcmVhc29uLCByZXN1bHQpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBsZXQgbWVzc2FnZSA9IGB1bkluaXRpYWxpemVFeGVjIGZhaWxlZC4gUmVhc29uIG9mIGVuZGluZyB3YXMgJyR7cmVhc29ufScgYW5kIHRoZSByZXN1bHQgaXMgJyR7cmVzdWx0fS5gO1xuICAgICAgICByZWFzb24gPSBBY3Rpdml0eS5zdGF0ZXMuZmFpbDtcbiAgICAgICAgcmVzdWx0ID0gZTtcbiAgICB9XG5cbiAgICBsZXQgc3RhdGUgPSBjYWxsQ29udGV4dC5leGVjdXRpb25TdGF0ZTtcblxuICAgIGlmIChzdGF0ZS5leGVjU3RhdGUgPT09IEFjdGl2aXR5LnN0YXRlcy5jYW5jZWwgfHwgc3RhdGUuZXhlY1N0YXRlID09PSBBY3Rpdml0eS5zdGF0ZXMuZmFpbCkge1xuICAgICAgICAvLyBJdCB3YXMgY2FuY2VsbGVkIG9yIGZhaWxlZDpcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN0YXRlLmV4ZWNTdGF0ZSA9IHJlYXNvbjtcblxuICAgIGxldCBpbklkbGUgPSByZWFzb24gPT09IEFjdGl2aXR5LnN0YXRlcy5pZGxlO1xuICAgIGxldCBleGVjQ29udGV4dCA9IGNhbGxDb250ZXh0LmV4ZWN1dGlvbkNvbnRleHQ7XG4gICAgbGV0IHNhdmVkU2NvcGUgPSBjYWxsQ29udGV4dC5zY29wZTtcbiAgICBzYXZlZFNjb3BlLnVwZGF0ZShTaW1wbGVQcm94eS51cGRhdGVNb2RlLm9uZVdheSk7XG4gICAgY2FsbENvbnRleHQgPSBjYWxsQ29udGV4dC5iYWNrKGluSWRsZSk7XG5cbiAgICBpZiAoY2FsbENvbnRleHQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBibU5hbWUgPSBzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmNyZWF0ZVZhbHVlQ29sbGVjdGVkQk1OYW1lKHRoaXMuZ2V0SW5zdGFuY2VJZChleGVjQ29udGV4dCkpO1xuICAgICAgICAgICAgaWYgKGV4ZWNDb250ZXh0LmlzQm9va21hcmtFeGlzdHMoYm1OYW1lKSkge1xuICAgICAgICAgICAgICAgIGV4ZWNDb250ZXh0LnJlc3VtZUJvb2ttYXJrSW5TY29wZShjYWxsQ29udGV4dCwgYm1OYW1lLCByZWFzb24sIHJlc3VsdClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lbWl0U3RhdGUocmVzdWx0LCBzYXZlZFNjb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbENvbnRleHQuZmFpbChlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVtaXRTdGF0ZShyZXN1bHQsIHNhdmVkU2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNhbGxDb250ZXh0LmZhaWwoZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFdlJ3JlIG9uIHJvb3QsIGRvbmUuXG4gICAgICAgIC8vIElmIHdmIGluIGlkbGUsIGJ1dCB0aGVyZSBhcmUgaW50ZXJuYWwgYm9va21hcmsgcmVzdW1lIHJlcXVlc3QsXG4gICAgICAgIC8vIHRoZW4gaW5zdGVhZCBvZiBlbWl0dGluZyBkb25lLCB3ZSBoYXZlIHRvIGNvbnRpbnVlIHRoZW0uXG4gICAgICAgIGlmIChpbklkbGUgJiYgZXhlY0NvbnRleHQucHJvY2Vzc1Jlc3VtZUJvb2ttYXJrUXVldWUoKSkge1xuICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIG5vdCBlbW1pdCBpZGxlIGV2ZW50LCBiZWNhdXNlIHRoZXJlIHdhcyBpbnRlcm5hbCBib29rbWFyayBjb250aW51dGF0aW9ucywgc28gd2UncmUgZG9uZS5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0ZS5lbWl0U3RhdGUocmVzdWx0LCBzYXZlZFNjb3BlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5fZGVmYXVsdEVuZENhbGxiYWNrID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCkge1xuICAgIGNhbGxDb250ZXh0LmVuZChyZWFzb24sIHJlc3VsdCk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuc2NoZWR1bGUgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIG9iaiwgZW5kQ2FsbGJhY2spIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IHNjb3BlID0gY2FsbENvbnRleHQuc2NvcGU7XG4gICAgbGV0IGV4ZWNDb250ZXh0ID0gY2FsbENvbnRleHQuZXhlY3V0aW9uQ29udGV4dDtcbiAgICBsZXQgc2VsZklkID0gY2FsbENvbnRleHQuaW5zdGFuY2VJZDtcblxuICAgIGlmICghZW5kQ2FsbGJhY2spIHtcbiAgICAgICAgZW5kQ2FsbGJhY2sgPSBcIl9kZWZhdWx0RW5kQ2FsbGJhY2tcIjtcbiAgICB9XG5cbiAgICBsZXQgaW52b2tlRW5kQ2FsbGJhY2sgPSBmdW5jdGlvbiAoX3JlYXNvbiwgX3Jlc3VsdCkge1xuICAgICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGVbZW5kQ2FsbGJhY2tdLmNhbGwoc2NvcGUsIGNhbGxDb250ZXh0LCBfcmVhc29uLCBfcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGlmICghXy5pc1N0cmluZyhlbmRDYWxsYmFjaykpIHtcbiAgICAgICAgY2FsbENvbnRleHQuZmFpbChuZXcgVHlwZUVycm9yKFwiUHJvdmlkZWQgYXJndW1lbnQgJ2VuZENhbGxiYWNrJyB2YWx1ZSBpcyBub3QgYSBzdHJpbmcuXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgY2IgPSBzY29wZVtlbmRDYWxsYmFja107XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oY2IpKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwobmV3IFR5cGVFcnJvcihgJyR7ZW5kQ2FsbGJhY2t9JyBpcyBub3QgYSBmdW5jdGlvbi5gKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGUuX19zY2hlZHVsaW5nU3RhdGUpIHtcbiAgICAgICAgZGVidWcoXCIlczogRXJyb3IsIGFscmVhZHkgZXhpc3RzaW5nIHN0YXRlOiAlalwiLCBzZWxmSWQsIHNjb3BlLl9fc2NoZWR1bGluZ1N0YXRlKTtcbiAgICAgICAgY2FsbENvbnRleHQuZmFpbChuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihcIlRoZXJlIGFyZSBhbHJlYWR5IHNjaGVkdWxlZCBpdGVtcyBleGlzdHMuXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRlYnVnKFwiJXM6IFNjaGVkdWxpbmcgb2JqZWN0KHMpIGJ5IHVzaW5nIGVuZCBjYWxsYmFjayAnJXMnOiAlalwiLCBzZWxmSWQsIGVuZENhbGxiYWNrLCBvYmopO1xuXG4gICAgbGV0IHN0YXRlID1cbiAgICB7XG4gICAgICAgIG1hbnk6IF8uaXNBcnJheShvYmopLFxuICAgICAgICBpbmRpY2VzOiBuZXcgTWFwKCksXG4gICAgICAgIHJlc3VsdHM6IFtdLFxuICAgICAgICB0b3RhbDogMCxcbiAgICAgICAgaWRsZUNvdW50OiAwLFxuICAgICAgICBjYW5jZWxDb3VudDogMCxcbiAgICAgICAgY29tcGxldGVkQ291bnQ6IDAsXG4gICAgICAgIGVuZEJvb2ttYXJrTmFtZTogbnVsbCxcbiAgICAgICAgZW5kQ2FsbGJhY2tOYW1lOiBlbmRDYWxsYmFja1xuICAgIH07XG5cbiAgICBsZXQgYm9va21hcmtOYW1lcyA9IFtdO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBzdGFydGVkQW55ID0gZmFsc2U7XG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIGxldCBwcm9jZXNzVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IENoZWNraW5nIHZhbHVlOiAlalwiLCBzZWxmSWQsIHZhbHVlKTtcbiAgICAgICAgICAgIGxldCBhY3Rpdml0eSwgdmFyaWFibGVzID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgYWN0aXZpdHkgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKF8uaXNPYmplY3QodmFsdWUpICYmIHZhbHVlLmFjdGl2aXR5IGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICBhY3Rpdml0eSA9IHZhbHVlLmFjdGl2aXR5O1xuICAgICAgICAgICAgICAgIHZhcmlhYmxlcyA9IF8uaXNPYmplY3QodmFsdWUudmFyaWFibGVzKSA/IHZhbHVlLnZhcmlhYmxlcyA6IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5zdGFuY2VJZCA9IGFjdGl2aXR5LmdldEluc3RhbmNlSWQoZXhlY0NvbnRleHQpO1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFZhbHVlIGlzIGFuIGFjdGl2aXR5IHdpdGggaW5zdGFuY2UgaWQ6ICVzXCIsIHNlbGZJZCwgaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmluZGljZXMuaGFzKGluc3RhbmNlSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKGBBY3Rpdml0eSBpbnN0YW5jZSAnJHtpbnN0YW5jZUlkfSBoYXMgYmVlbiBzY2hlZHVsZWQgYWxyZWFkeS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogQ3JlYXRpbmcgZW5kIGJvb2ttYXJrLCBhbmQgc3RhcnRpbmcgaXQuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgYm9va21hcmtOYW1lcy5wdXNoKGV4ZWNDb250ZXh0LmNyZWF0ZUJvb2ttYXJrKHNlbGZJZCwgc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVWYWx1ZUNvbGxlY3RlZEJNTmFtZShpbnN0YW5jZUlkKSwgXCJyZXN1bHRDb2xsZWN0ZWRcIikpO1xuICAgICAgICAgICAgICAgIGFjdGl2aXR5Ll9zdGFydChjYWxsQ29udGV4dCwgdmFyaWFibGVzKTtcbiAgICAgICAgICAgICAgICBzdGFydGVkQW55ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pbmRpY2VzLnNldChpbnN0YW5jZUlkLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgc3RhdGUucmVzdWx0cy5wdXNoKG51bGwpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnRvdGFsKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBWYWx1ZSBpcyBub3QgYW4gYWN0aXZpdHkuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUucmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHN0YXRlLm1hbnkpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IFRoZXJlIGFyZSBtYW55IHZhbHVlcywgaXRlcmF0aW5nLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgZm9yIChsZXQgdmFsdWUgb2Ygb2JqKSB7XG4gICAgICAgICAgICAgICAgcHJvY2Vzc1ZhbHVlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcHJvY2Vzc1ZhbHVlKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzdGFydGVkQW55KSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBObyBhY3Rpdml0eSBoYXMgYmVlbiBzdGFydGVkLCBjYWxsaW5nIGVuZCBjYWxsYmFjayB3aXRoIG9yaWdpbmFsIG9iamVjdC5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBzdGF0ZS5tYW55ID8gc3RhdGUucmVzdWx0cyA6IHN0YXRlLnJlc3VsdHNbMF07XG4gICAgICAgICAgICBpbnZva2VFbmRDYWxsYmFjayhBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGUsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiAlZCBhY3Rpdml0aWVzIGhhcyBiZWVuIHN0YXJ0ZWQuIFJlZ2lzdGVyaW5nIGVuZCBib29rbWFyay5cIiwgc2VsZklkLCBzdGF0ZS5pbmRpY2VzLnNpemUpO1xuICAgICAgICAgICAgbGV0IGVuZEJNID0gc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVDb2xsZWN0aW5nQ29tcGxldGVkQk1OYW1lKHNlbGZJZCk7XG4gICAgICAgICAgICBib29rbWFya05hbWVzLnB1c2goZXhlY0NvbnRleHQuY3JlYXRlQm9va21hcmsoc2VsZklkLCBlbmRCTSwgZW5kQ2FsbGJhY2spKTtcbiAgICAgICAgICAgIHN0YXRlLmVuZEJvb2ttYXJrTmFtZSA9IGVuZEJNO1xuICAgICAgICAgICAgc2NvcGUuX19zY2hlZHVsaW5nU3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICBzY29wZS51cGRhdGUoU2ltcGxlUHJveHkudXBkYXRlTW9kZS5vbmVXYXkpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBkZWJ1ZyhcIiVzOiBSdW50aW1lIGVycm9yIGhhcHBlbmVkOiAlc1wiLCBzZWxmSWQsIGUuc3RhY2spO1xuICAgICAgICBpZiAoYm9va21hcmtOYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IFNldCBib29rbWFya3MgdG8gbm9vcDogJGpcIiwgc2VsZklkLCBib29rbWFya05hbWVzKTtcbiAgICAgICAgICAgIGV4ZWNDb250ZXh0Lm5vb3BDYWxsYmFja3MoYm9va21hcmtOYW1lcyk7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUuZGVsZXRlKFwiX19zY2hlZHVsaW5nU3RhdGVcIik7XG4gICAgICAgIGRlYnVnKFwiJXM6IEludm9raW5nIGVuZCBjYWxsYmFjayB3aXRoIHRoZSBlcnJvci5cIiwgc2VsZklkKTtcbiAgICAgICAgaW52b2tlRW5kQ2FsbGJhY2soQWN0aXZpdHkuc3RhdGVzLmZhaWwsIGUpO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgICAgZGVidWcoXCIlczogRmluYWwgc3RhdGUgaW5kaWNlcyBjb3VudDogJWQsIHRvdGFsOiAlZFwiLCBzZWxmSWQsIHN0YXRlLmluZGljZXMuc2l6ZSwgc3RhdGUudG90YWwpO1xuICAgIH1cbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5yZXN1bHRDb2xsZWN0ZWQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0LCBib29rbWFyaykge1xuICAgIGxldCBzZWxmSWQgPSBjYWxsQ29udGV4dC5pbnN0YW5jZUlkO1xuICAgIGxldCBleGVjQ29udGV4dCA9IGNhbGxDb250ZXh0LmV4ZWN1dGlvbkNvbnRleHQ7XG4gICAgbGV0IGNoaWxkSWQgPSBzcGVjU3RyaW5ncy5nZXRTdHJpbmcoYm9va21hcmsubmFtZSk7XG4gICAgZGVidWcoXCIlczogU2NoZWR1bGluZyByZXN1bHQgaXRlbSBjb2xsZWN0ZWQsIGNoaWxkSWQ6ICVzLCByZWFzb246ICVzLCByZXN1bHQ6ICVqLCBib29rbWFyazogJWpcIiwgc2VsZklkLCBjaGlsZElkLCByZWFzb24sIHJlc3VsdCwgYm9va21hcmspO1xuXG4gICAgbGV0IGZpbmlzaGVkID0gbnVsbDtcbiAgICBsZXQgc3RhdGUgPSB0aGlzLl9fc2NoZWR1bGluZ1N0YXRlO1xuICAgIGxldCBmYWlsID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfLmlzT2JqZWN0KHN0YXRlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoXCJWYWx1ZSBvZiBfX3NjaGVkdWxpbmdTdGF0ZSBpcyAnXCIgKyBzdGF0ZSArIFwiJy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGluZGV4ID0gc3RhdGUuaW5kaWNlcy5nZXQoY2hpbGRJZCk7XG4gICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGluZGV4KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoYENoaWxkIGFjdGl2aXR5IG9mICcke2NoaWxkSWR9JyBzY2hlZHVsaW5nIHN0YXRlIGluZGV4IG91dCBvZiByZW5nZS5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlYnVnKFwiJXM6IEZpbmlzaGVkIGNoaWxkIGFjdGl2aXR5IGlkIGlzOiAlc1wiLCBzZWxmSWQsIGNoaWxkSWQpO1xuXG4gICAgICAgIHN3aXRjaCAocmVhc29uKSB7XG4gICAgICAgICAgICBjYXNlIEFjdGl2aXR5LnN0YXRlcy5jb21wbGV0ZTpcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBTZXR0aW5nICVkLiB2YWx1ZSB0byByZXN1bHQ6ICVqXCIsIHNlbGZJZCwgaW5kZXgsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgc3RhdGUucmVzdWx0c1tpbmRleF0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogUmVtb3ZpbmcgaWQgZnJvbSBzdGF0ZS5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pbmRpY2VzLmRlbGV0ZShjaGlsZElkKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5jb21wbGV0ZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpdml0eS5zdGF0ZXMuZmFpbDpcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBGYWlsZWQgd2l0aDogJXNcIiwgc2VsZklkLCByZXN1bHQuc3RhY2spO1xuICAgICAgICAgICAgICAgIGZhaWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlLmluZGljZXMuZGVsZXRlKGNoaWxkSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsOlxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IEluY3JlbWVudGluZyBjYW5jZWwgY291bnRlci5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5jYW5jZWxDb3VudCsrO1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFJlbW92aW5nIGlkIGZyb20gc3RhdGUuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuaW5kaWNlcy5kZWxldGUoY2hpbGRJZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGl2aXR5LnN0YXRlcy5pZGxlOlxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IEluY3JlbWVudGluZyBpZGxlIGNvdW50ZXIuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuaWRsZUNvdW50Kys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKGBSZXN1bHQgY29sbGVjdGVkIHdpdGggdW5rbm93biByZWFzb24gJyR7cmVhc29ufScuYCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWJ1ZyhcIiVzOiBTdGF0ZSBzbyBmYXIgPSB0b3RhbDogJXMsIGluZGljZXMgY291bnQ6ICVkLCBjb21wbGV0ZWQgY291bnQ6ICVkLCBjYW5jZWwgY291bnQ6ICVkLCBlcnJvciBjb3VudDogJWQsIGlkbGUgY291bnQ6ICVkXCIsXG4gICAgICAgICAgICBzZWxmSWQsXG4gICAgICAgICAgICBzdGF0ZS50b3RhbCxcbiAgICAgICAgICAgIHN0YXRlLmluZGljZXMuc2l6ZSxcbiAgICAgICAgICAgIHN0YXRlLmNvbXBsZXRlZENvdW50LFxuICAgICAgICAgICAgc3RhdGUuY2FuY2VsQ291bnQsXG4gICAgICAgICAgICBzdGF0ZS5pZGxlQ291bnQpO1xuXG4gICAgICAgIGxldCBlbmRXaXRoTm9Db2xsZWN0QWxsID0gIWNhbGxDb250ZXh0LmFjdGl2aXR5LmNvbGxlY3RBbGwgJiYgcmVhc29uICE9PSBBY3Rpdml0eS5zdGF0ZXMuaWRsZTtcbiAgICAgICAgaWYgKGVuZFdpdGhOb0NvbGxlY3RBbGwgfHwgZmFpbCkge1xuICAgICAgICAgICAgaWYgKCFmYWlsKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogLS0tLSBDb2xsZWN0aW5nIG9mIHZhbHVlcyBlbmRlZCwgYmVjYXVzZSB3ZSdyZSBub3QgY29sbGVjdGluZyBhbGwgdmFsdWVzIChlZy46IFBpY2spLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogLS0tLSBDb2xsZWN0aW5nIG9mIHZhbHVlcyBlbmRlZCwgYmVjYXVzZSBvZiBhbiBlcnJvci5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IFNodXR0aW5nIGRvd24gJWQgb3RoZXIsIHJ1bm5pbmcgYWNpdHZpdGllcy5cIiwgc2VsZklkLCBzdGF0ZS5pbmRpY2VzLnNpemUpO1xuICAgICAgICAgICAgbGV0IGlkcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaWQgb2Ygc3RhdGUuaW5kaWNlcy5rZXlzKCkpIHtcbiAgICAgICAgICAgICAgICBpZHMucHVzaChpZCk7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogRGVsZXRpbmcgc2NvcGUgb2YgYWN0aXZpdHk6ICVzXCIsIHNlbGZJZCwgaWQpO1xuICAgICAgICAgICAgICAgIGV4ZWNDb250ZXh0LmRlbGV0ZVNjb3BlT2ZBY3Rpdml0eShjYWxsQ29udGV4dCwgaWQpO1xuICAgICAgICAgICAgICAgIGxldCBpYm1OYW1lID0gc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVWYWx1ZUNvbGxlY3RlZEJNTmFtZShpZCk7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogRGVsZXRpbmcgdmFsdWUgY29sbGVjdGVkIGJvb2ttYXJrOiAlc1wiLCBzZWxmSWQsIGlibU5hbWUpO1xuICAgICAgICAgICAgICAgIGV4ZWNDb250ZXh0LmRlbGV0ZUJvb2ttYXJrKGlibU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhlY0NvbnRleHQuY2FuY2VsRXhlY3V0aW9uKHRoaXMsIGlkcyk7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBBY3Rpdml0aWVzIGNhbmNlbGxlZDogJWpcIiwgc2VsZklkLCBpZHMpO1xuICAgICAgICAgICAgZGVidWcoXCIlczogUmVwb3J0aW5nIHRoZSBhY3R1YWwgcmVhc29uOiAlcyBhbmQgcmVzdWx0OiAlalwiLCBzZWxmSWQsIHJlYXNvbiwgcmVzdWx0KTtcbiAgICAgICAgICAgIGZpbmlzaGVkID0gZnVuY3Rpb24gKCkgeyBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIHN0YXRlLmVuZEJvb2ttYXJrTmFtZSwgcmVhc29uLCByZXN1bHQpOyB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXNzZXJ0KCFmYWlsKTtcbiAgICAgICAgICAgIGxldCBvbkVuZCA9IChzdGF0ZS5pbmRpY2VzLnNpemUgLSBzdGF0ZS5pZGxlQ291bnQpID09PSAwO1xuICAgICAgICAgICAgaWYgKG9uRW5kKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogLS0tLSBDb2xsZWN0aW5nIG9mIHZhbHVlcyBlbmRlZCAoZW5kZWQgYmVjYXVzZSBvZiBjb2xsZWN0IGFsbCBpcyBvZmY6ICVzKS5cIiwgc2VsZklkLCBlbmRXaXRoTm9Db2xsZWN0QWxsKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuY2FuY2VsQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWcoXCIlczogQ29sbGVjdGluZyBoYXMgYmVlbiBjYW5jZWxsZWQsIHJlc3VtaW5nIGVuZCBib29rbWFya3MuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gZnVuY3Rpb24gKCkgeyBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIHN0YXRlLmVuZEJvb2ttYXJrTmFtZSwgQWN0aXZpdHkuc3RhdGVzLmNhbmNlbCk7IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXRlLmlkbGVDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBUaGlzIGVudHJ5IGhhcyBiZWVuIGdvbmUgdG8gaWRsZSwgcHJvcGFnYXRpbmcgY291bnRlci5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuaWRsZUNvdW50LS07IC8vIEJlY2F1c2UgdGhlIG5leHQgY2FsbCB3aWxsIHdha2UgdXAgYSB0aHJlYWQuXG4gICAgICAgICAgICAgICAgICAgIGV4ZWNDb250ZXh0LnJlc3VtZUJvb2ttYXJrSW5TY29wZShjYWxsQ29udGV4dCwgc3RhdGUuZW5kQm9va21hcmtOYW1lLCBBY3Rpdml0eS5zdGF0ZXMuaWRsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBzdGF0ZS5tYW55ID8gc3RhdGUucmVzdWx0cyA6IHN0YXRlLnJlc3VsdHNbMF07XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFRoaXMgZW50cnkgaGFzIGJlZW4gY29tcGxldGVkLCByZXN1bWluZyBjb2xsZWN0IGJvb2ttYXJrIHdpdGggdGhlIHJlc3VsdChzKTogJWpcIiwgc2VsZklkLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHsgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBzdGF0ZS5lbmRCb29rbWFya05hbWUsIEFjdGl2aXR5LnN0YXRlcy5jb21wbGV0ZSwgcmVzdWx0KTsgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FsbENvbnRleHQuZmFpbChlKTtcbiAgICAgICAgdGhpcy5kZWxldGUoXCJfX3NjaGVkdWxpbmdTdGF0ZVwiKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIGlmIChmaW5pc2hlZCkge1xuICAgICAgICAgICAgZGVidWcoXCIlczogU2NoZHVsaW5nIGZpbmlzaGVkLCByZW1vdmluZyBzdGF0ZS5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlKFwiX19zY2hlZHVsaW5nU3RhdGVcIik7XG5cbiAgICAgICAgICAgIGlmICghY2FsbENvbnRleHQuYWN0aXZpdHkuX3NjaGVkdWxlU3ViQWN0aXZpdGllcy5jYWxsKHRoaXMsIGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCwgc3RhdGUuZW5kQm9va21hcmtOYW1lLCBzdGF0ZS5lbmRDYWxsYmFja05hbWUpKSB7XG4gICAgICAgICAgICAgICAgZmluaXNoZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5fc2NoZWR1bGVTdWJBY3Rpdml0aWVzID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCwgZW5kQm9va21hcmtOYW1lLCBlbmRDYWxsYmFja05hbWUpIHtcbiAgICBpZiAocmVhc29uICE9PSBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBzZWxmSWQgPSBjYWxsQ29udGV4dC5pbnN0YW5jZUlkO1xuICAgIGxldCBleGVjQ29udGV4dCA9IGNhbGxDb250ZXh0LmV4ZWN1dGlvbkNvbnRleHQ7XG4gICAgbGV0IGFjdGl2aXRpZXNNYXAgPSBuZXcgTWFwKCk7XG4gICAgbGV0IGFjdGl2aXRpZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIHJlZyhhY3Rpdml0eSwgaW5kZXgsIHN1YkluZGV4KSB7XG4gICAgICAgIGluZGV4ID0gXy5pc051bWJlcihpbmRleCkgPyBpbmRleCA6IG51bGw7XG4gICAgICAgIHN1YkluZGV4ID0gXy5pc051bWJlcihzdWJJbmRleCkgPyBzdWJJbmRleCA6IG51bGw7XG4gICAgICAgIGxldCBhcnJJbmRleCA9IGFjdGl2aXRpZXMubGVuZ3RoO1xuICAgICAgICBhY3Rpdml0aWVzLnB1c2goYWN0aXZpdHkpO1xuICAgICAgICBhY3Rpdml0aWVzTWFwLnNldChhcnJJbmRleCwgeyBpbmRleDogaW5kZXgsIHN1YkluZGV4OiBzdWJJbmRleCB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWdBcnIob2JqLCBpbmRleCkge1xuICAgICAgICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBvYmpbaV07XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgICAgICByZWcoaXRlbSwgaW5kZXgsIGkpO1xuICAgICAgICAgICAgICAgICAgICBvYmpbaV0gPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgcmVnKG9iaiwgaW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChfLmlzQXJyYXkocmVzdWx0KSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHJlZ0FycihyZXN1bHRbaV0sIGkpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2ldID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICByZWdBcnIocmVzdWx0KTtcbiAgICAgICAgcmVzdWx0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIWFjdGl2aXRpZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc3ViQWN0aXZpdHlTY2hlZHVsaW5nU3RhdGUgPSB7XG4gICAgICAgIGVuZEJvb2ttYXJrTmFtZTogZW5kQm9va21hcmtOYW1lLFxuICAgICAgICBlbmRDYWxsYmFja05hbWU6IGVuZENhbGxiYWNrTmFtZSxcbiAgICAgICAgYWN0aXZpdGllc01hcDogYWN0aXZpdGllc01hcCxcbiAgICAgICAgb3JpZ2luYWxSZXN1bHQ6IHJlc3VsdFxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgICBsZXQgZW5kQk0gPSBzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmNyZWF0ZUNvbGxlY3RpbmdDb21wbGV0ZWRCTU5hbWUoc2VsZklkKTtcbiAgICAgICAgZXhlY0NvbnRleHQuZGVsZXRlQm9va21hcmsoZW5kQk0pO1xuICAgICAgICBjYWxsQ29udGV4dC5zY2hlZHVsZShhY3Rpdml0aWVzLCBcIl9zdWJBY3Rpdml0aWVzR290XCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5kZWxldGUoXCJfX3N1YkFjdGl2aXR5U2NoZWR1bGluZ1N0YXRlXCIpO1xuICAgICAgICBjYWxsQ29udGV4dC5mYWlsKGUpO1xuICAgIH1cbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5fc3ViQWN0aXZpdGllc0dvdCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAocmVhc29uICE9PSBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGUpIHtcbiAgICAgICAgICAgIGNhbGxDb250ZXh0LmVuZChyZWFzb24sIHJlc3VsdCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgICAgICBsZXQgc2VsZklkID0gY2FsbENvbnRleHQuaW5zdGFuY2VJZDtcbiAgICAgICAgbGV0IHN0YXRlID0gdGhpcy5fX3N1YkFjdGl2aXR5U2NoZWR1bGluZ1N0YXRlO1xuICAgICAgICBpZiAoIV8uaXNQbGFpbk9iamVjdChzdGF0ZSkgfHwgIV8uaXNTdHJpbmcoc3RhdGUuZW5kQm9va21hcmtOYW1lKSB8fCAhXy5pc1N0cmluZyhzdGF0ZS5lbmRDYWxsYmFja05hbWUpIHx8ICEoc3RhdGUuYWN0aXZpdGllc01hcCBpbnN0YW5jZW9mIE1hcCkgfHwgIXN0YXRlLm9yaWdpbmFsUmVzdWx0KSB7XG4gICAgICAgICAgICBjYWxsQ29udGV4dC5mYWlsKG5ldyBlcnJvcnMuQWN0aXZpdHlSdW50aW1lRXJyb3IoXCJDYWxsYmFjayAnX3N1YkFjdGl2aXRpZXNHb3QnIGhhcyBiZWVuIGludm9rZWQsIGJ1dCB0aGVyZSBpcyBubyB2YWxpZCAnX19zdWJBYWN0aXZpdHlTY2hlZHVsaW5nU3RhdGUnIHZhbHVlIGluIHRoZSBzY29wZS5cIikpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc0FycmF5KHJlc3VsdCkgfHwgcmVzdWx0Lmxlbmd0aCAhPT0gc3RhdGUuYWN0aXZpdGllc01hcC5zaXplKSB7XG4gICAgICAgICAgICBjYWxsQ29udGV4dC5mYWlsKG5ldyBlcnJvcnMuQWN0aXZpdHlSdW50aW1lRXJyb3IoXCJDYWxsYmFjayAnX3N1YkFjdGl2aXRpZXNHb3QnIGhhcyBiZWVuIGludm9rZWQsIGJ1dCB0aGUgcmVzdWx0IGlzIGludmFsaWQuXCIpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmaW5hbFJlc3VsdCA9IHN0YXRlLm9yaWdpbmFsUmVzdWx0O1xuXG4gICAgICAgIGZvciAobGV0IGt2cCBvZiBzdGF0ZS5hY3Rpdml0aWVzTWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgbGV0IGFycklkeCA9IGt2cFswXTtcbiAgICAgICAgICAgIGxldCBwb3MgPSBrdnBbMV07XG5cbiAgICAgICAgICAgIGlmIChfLmlzTnVtYmVyKGFycklkeCkgJiYgYXJySWR4ID49IDAgJiYgYXJySWR4IDwgcmVzdWx0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IHJlc3VsdFthcnJJZHhdO1xuICAgICAgICAgICAgICAgIGlmIChwb3MuaW5kZXggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsUmVzdWx0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbFJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHBvcy5pbmRleDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNBcnJheShmaW5hbFJlc3VsdCkgJiYgaW5kZXggPj0gMCAmJiBpbmRleCA8IGZpbmFsUmVzdWx0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvcy5zdWJJbmRleCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbFJlc3VsdFtpbmRleF0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxSZXN1bHRbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdWJBcnJheSA9IGZpbmFsUmVzdWx0W2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3ViSW5kZXggPSBwb3Muc3ViSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNBcnJheShzdWJBcnJheSkgJiYgc3ViSW5kZXggPj0gMCAmJiBzdWJJbmRleCA8IHN1YkFycmF5Lmxlbmd0aCAmJiBzdWJBcnJheVtzdWJJbmRleF0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViQXJyYXlbc3ViSW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxDb250ZXh0LmZhaWwobmV3IGVycm9ycy5BY3Rpdml0eVJ1bnRpbWVFcnJvcihcIkNhbGxiYWNrICdfc3ViQWN0aXZpdGllc0dvdCcgaGFzIGJlZW4gaW52b2tlZCwgYnV0IHRoZSBzdGF0ZSBoYXMgaW52YWxpZCB2YWx1ZXMuXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV4ZWNDb250ZXh0LmNyZWF0ZUJvb2ttYXJrKHNlbGZJZCwgc3RhdGUuZW5kQm9va21hcmtOYW1lLCBzdGF0ZS5lbmRDYWxsYmFja05hbWUpO1xuICAgICAgICBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIHN0YXRlLmVuZEJvb2ttYXJrTmFtZSwgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCBmaW5hbFJlc3VsdCk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICB0aGlzLmRlbGV0ZShcIl9fc3ViQWN0aXZpdHlTY2hlZHVsaW5nU3RhdGVcIik7XG4gICAgfVxufTtcbi8qIFJVTiAqL1xuXG4vKiBTQ09QRSAqL1xuQWN0aXZpdHkucHJvdG90eXBlLl9nZXRTY29wZUtleXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmICghc2VsZi5fc2NvcGVLZXlzIHx8ICFzZWxmLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCkge1xuICAgICAgICBzZWxmLl9zY29wZUtleXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHNlbGYpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi5ub25TY29wZWRQcm9wZXJ0aWVzLmhhcyhrZXkpICYmIChfLmlzVW5kZWZpbmVkKEFjdGl2aXR5LnByb3RvdHlwZVtrZXldKSB8fCBrZXkgPT09IFwiX2RlZmF1bHRFbmRDYWxsYmFja1wiIHx8IGtleSA9PT0gXCJfc3ViQWN0aXZpdGllc0dvdFwiKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3Njb3BlS2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNlbGYuX3Njb3BlS2V5cztcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5jcmVhdGVTY29wZVBhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCkge1xuICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5UnVudGltZUVycm9yKFwiQ2Fubm90IGNyZWF0ZSBhY3Rpdml0eSBzY29wZSBmb3IgdW5pbml0aWFsaXplZCBhY3Rpdml0aWVzLlwiKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCA9PT0gbnVsbCkge1xuICAgICAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgICAgICBsZXQgc3JjID0gXCJyZXR1cm4ge1wiO1xuICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgb2YgdGhpcy5fZ2V0U2NvcGVLZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gXCIsXFxuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KHRoaXNbZmllbGROYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gZmllbGROYW1lICsgXCI6Xy5jbG9uZShhLlwiICsgZmllbGROYW1lICsgXCIsIHRydWUpXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChfLmlzQXJyYXkodGhpc1tmaWVsZE5hbWVdKSkge1xuICAgICAgICAgICAgICAgIHNyYyArPSBmaWVsZE5hbWUgKyBcIjphLlwiICsgZmllbGROYW1lICsgXCIuc2xpY2UoMClcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNyYyArPSBmaWVsZE5hbWUgKyBcIjphLlwiICsgZmllbGROYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNyYyArPSBcIn1cIjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCA9IG5ldyBGdW5jdGlvbihcImEsX1wiLCBzcmMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkludmFsaWQgc2NvcGUgcGFydCBmdW5jdGlvbjolc1wiLCBzcmMpO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVTY29wZVBhcnRJbXBsKHRoaXMsIF8pO1xufTtcbi8qIFNDT1BFICovXG5cbkFjdGl2aXR5LnN0YXRlcyA9IGVudW1zLkFjdGl2aXR5U3RhdGVzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2aXR5O1xuIl19
