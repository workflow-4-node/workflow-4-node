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
          state.emitState(result, savedScope);
          callContext.fail(e);
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
      finished();
    }
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
//# sourceMappingURL=data:application/json;base64,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SSxDQUFHLElBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQ0EsT0FBTyxDQUFBLENBQUc7QUFDTixVQUFJLEFBQUMsQ0FBQyxnQ0FBK0IsQ0FBRyxJQUFFLENBQUMsQ0FBQztBQUM1QyxVQUFNLEVBQUEsQ0FBQztJQUNYO0FBQUEsRUFDSjtBQUFBLEFBRUEsT0FBTyxDQUFBLElBQUcscUJBQXFCLEFBQUMsQ0FBQyxJQUFHLENBQUcsRUFBQSxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUdELE9BQU8sT0FBTyxFQUFJLENBQUEsS0FBSSxlQUFlLENBQUM7QUFFdEMsS0FBSyxRQUFRLEVBQUksU0FBTyxDQUFDO0FBQ3pCIiwiZmlsZSI6ImFjdGl2aXRpZXMvYWN0aXZpdHkuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIi8qanNoaW50IC1XMDU0ICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5sZXQgZ3VpZHMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2d1aWRzXCIpO1xubGV0IGVycm9ycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZXJyb3JzXCIpO1xubGV0IGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcbmxldCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbmxldCBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBDYWxsQ29udGV4dCA9IHJlcXVpcmUoXCIuL2NhbGxDb250ZXh0XCIpO1xubGV0IHV1aWQgPSByZXF1aXJlKCdub2RlLXV1aWQnKTtcbmxldCBhc3luYyA9IHJlcXVpcmUoXCIuLi9jb21tb24vYXN5bmNIZWxwZXJzXCIpLmFzeW5jO1xubGV0IGFzc2VydCA9IHJlcXVpcmUoXCJiZXR0ZXItYXNzZXJ0XCIpO1xubGV0IGRlYnVnID0gcmVxdWlyZShcImRlYnVnXCIpKFwid2Y0bm9kZTpBY3Rpdml0eVwiKTtcbmxldCBjb21tb24gPSByZXF1aXJlKFwiLi4vY29tbW9uXCIpO1xubGV0IFNpbXBsZVByb3h5ID0gY29tbW9uLlNpbXBsZVByb3h5O1xuXG5mdW5jdGlvbiBBY3Rpdml0eSgpIHtcbiAgICB0aGlzLmFyZ3MgPSBudWxsO1xuICAgIHRoaXMuZGlzcGxheU5hbWUgPSBudWxsO1xuICAgIHRoaXMuaWQgPSB1dWlkLnY0KCk7XG4gICAgdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zY29wZUtleXMgPSBudWxsO1xuICAgIHRoaXNbXCJAcmVxdWlyZVwiXSA9IG51bGw7XG5cbiAgICAvLyBQcm9wZXJ0aWVzIG5vdCBzZXJpYWxpemVkOlxuICAgIHRoaXMubm9uU2VyaWFsaXplZFByb3BlcnRpZXMgPSBuZXcgU2V0KCk7XG5cbiAgICAvLyBQcm9wZXJ0aWVzIGFyZSBub3QgZ29pbmcgdG8gY29waWVkIGluIHRoZSBzY29wZTpcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIm5vblNjb3BlZFByb3BlcnRpZXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIm5vblNlcmlhbGl6ZWRQcm9wZXJ0aWVzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJhY3Rpdml0eVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiaWRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImFyZ3NcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImRpc3BsYXlOYW1lXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjb21wbGV0ZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY2FuY2VsXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJpZGxlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJmYWlsXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJlbmRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInNjaGVkdWxlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjcmVhdGVCb29rbWFya1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwicmVzdW1lQm9va21hcmtcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInJlc3VsdENvbGxlY3RlZFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY29kZVByb3BlcnRpZXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImluaXRpYWxpemVTdHJ1Y3R1cmVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl9pbml0aWFsaXplU3RydWN0dXJlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfc3RydWN0dXJlSW5pdGlhbGl6ZWRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImNsb25lXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfc2NvcGVLZXlzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfY3JlYXRlU2NvcGVQYXJ0SW1wbFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiQHJlcXVpcmVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImluaXRpYWxpemVFeGVjXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJ1bkluaXRpYWxpemVFeGVjXCIpO1xuXG4gICAgdGhpcy5jb2RlUHJvcGVydGllcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLmFycmF5UHJvcGVydGllcyA9IG5ldyBTZXQoW1wiYXJnc1wiXSk7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEFjdGl2aXR5LnByb3RvdHlwZSwge1xuICAgIF9zY29wZUtleXM6IHtcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgX2NyZWF0ZVNjb3BlUGFydEltcGw6IHtcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgY29sbGVjdEFsbDoge1xuICAgICAgICB2YWx1ZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH1cbn0pO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuZ2V0SW5zdGFuY2VJZCA9IGZ1bmN0aW9uIChleGVjQ29udGV4dCkge1xuICAgIHJldHVybiBleGVjQ29udGV4dC5nZXRJbnN0YW5jZUlkKHRoaXMpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy5kaXNwbGF5TmFtZSA/ICh0aGlzLmRpc3BsYXlOYW1lICsgXCIgXCIpIDogXCJcIikgKyBcIihcIiArIHRoaXMuY29uc3RydWN0b3IubmFtZSArIFwiOlwiICsgdGhpcy5pZCArIFwiKVwiO1xufTtcblxuLyogZm9yRWFjaCAqL1xuQWN0aXZpdHkucHJvdG90eXBlLmFsbCA9IGZ1bmN0aW9uKiAoZXhlY0NvbnRleHQpIHtcbiAgICB5aWVsZCAqIHRoaXMuX2NoaWxkcmVuKHRydWUsIG51bGwsIGV4ZWNDb250ZXh0LCBudWxsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5jaGlsZHJlbiA9IGZ1bmN0aW9uKiAoZXhlY0NvbnRleHQpIHtcbiAgICB5aWVsZCAqIHRoaXMuX2NoaWxkcmVuKHRydWUsIHRoaXMsIGV4ZWNDb250ZXh0LCBudWxsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pbW1lZGlhdGVDaGlsZHJlbiA9IGZ1bmN0aW9uKiAoZXhlY0NvbnRleHQpIHtcbiAgICB5aWVsZCAqIHRoaXMuX2NoaWxkcmVuKGZhbHNlLCB0aGlzLCBleGVjQ29udGV4dCk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX2NoaWxkcmVuID0gZnVuY3Rpb24qIChkZWVwLCBleGNlcHQsIGV4ZWNDb250ZXh0LCB2aXNpdGVkKSB7XG4gICAgYXNzZXJ0KGV4ZWNDb250ZXh0IGluc3RhbmNlb2YgcmVxdWlyZShcIi4vYWN0aXZpdHlFeGVjdXRpb25Db250ZXh0XCIpLCBcIkNhbm5vdCBlbnVtZXJhdGUgYWN0aXZpdGllcyB3aXRob3V0IGFuIGV4ZWN1dGlvbiBjb250ZXh0LlwiKTtcbiAgICB2aXNpdGVkID0gdmlzaXRlZCB8fCBuZXcgU2V0KCk7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmICghdmlzaXRlZC5oYXMoc2VsZikpIHtcbiAgICAgICAgdmlzaXRlZC5hZGQoc2VsZik7XG5cbiAgICAgICAgLy8gRW5zdXJlIGl0J3Mgc3RydWN0dXJlIGNyZWF0ZWQ6XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVTdHJ1Y3R1cmUoZXhlY0NvbnRleHQpO1xuXG4gICAgICAgIGlmIChzZWxmICE9PSBleGNlcHQpIHtcbiAgICAgICAgICAgIHlpZWxkIHNlbGY7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgaW4gc2VsZikge1xuICAgICAgICAgICAgbGV0IGZpZWxkVmFsdWUgPSBzZWxmW2ZpZWxkTmFtZV07XG4gICAgICAgICAgICBpZiAoZmllbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLmlzQXJyYXkoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkICogb2JqLl9jaGlsZHJlbihkZWVwLCBleGNlcHQsIGV4ZWNDb250ZXh0LCB2aXNpdGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIG9iajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmllbGRWYWx1ZSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCAqIGZpZWxkVmFsdWUuX2NoaWxkcmVuKGRlZXAsIGV4Y2VwdCwgZXhlY0NvbnRleHQsIHZpc2l0ZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG4vKiBmb3JFYWNoICovXG5cbi8qIFN0cnVjdHVyZSAqL1xuQWN0aXZpdHkucHJvdG90eXBlLmlzQXJyYXlQcm9wZXJ0eSA9IGZ1bmN0aW9uIChwcm9wTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmFycmF5UHJvcGVydGllcy5oYXMocHJvcE5hbWUpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLl9pbml0aWFsaXplU3RydWN0dXJlID0gZnVuY3Rpb24gKGV4ZWNDb250ZXh0KSB7XG4gICAgYXNzZXJ0KCEhZXhlY0NvbnRleHQpO1xuICAgIGlmICghdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplU3RydWN0dXJlKGV4ZWNDb250ZXh0KTtcbiAgICAgICAgdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pbml0aWFsaXplU3RydWN0dXJlID0gXy5ub29wO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gbWFrZUNsb25lKHZhbHVlLCBjYW5DbG9uZUFycmF5cykge1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIGxldCBuZXdTZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpdGVtIG9mIHZhbHVlLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgbmV3U2V0LmFkZChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXdTZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKGNhbkNsb25lQXJyYXlzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld0FycmF5ID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdBcnJheS5wdXNoKG1ha2VDbG9uZShpdGVtLCBmYWxzZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY2xvbmUgYWN0aXZpdHkncyBuZXN0ZWQgYXJyYXlzLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCBDb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG4gICAgbGV0IG5ld0luc3QgPSBuZXcgQ29uc3RydWN0b3IoKTtcbiAgICBmb3IgKGxldCBrZXkgaW4gdGhpcykge1xuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzW2tleV07XG4gICAgICAgIGlmIChuZXdJbnN0W2tleV0gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBuZXdJbnN0W2tleV0gPSBtYWtlQ2xvbmUodmFsdWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdJbnN0O1xufTtcblxuLyogUlVOICovXG5BY3Rpdml0eS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIShjYWxsQ29udGV4dCBpbnN0YW5jZW9mIENhbGxDb250ZXh0KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCAnY29udGV4dCcgaXMgbm90IGFuIGluc3RhbmNlIG9mIEFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5cIik7XG4gICAgfVxuXG4gICAgbGV0IGFyZ3MgPSBzZWxmLmFyZ3M7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGFyZ3MgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fc3RhcnQoY2FsbENvbnRleHQsIG51bGwsIGFyZ3MpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLl9zdGFydCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgdmFyaWFibGVzLCBhcmdzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IG15Q2FsbENvbnRleHQgPSBjYWxsQ29udGV4dC5uZXh0KHNlbGYsIHZhcmlhYmxlcyk7XG4gICAgbGV0IHN0YXRlID0gbXlDYWxsQ29udGV4dC5leGVjdXRpb25TdGF0ZTtcbiAgICBpZiAoc3RhdGUuaXNSdW5uaW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFjdGl2aXR5IGlzIGFscmVhZHkgcnVubmluZy5cIik7XG4gICAgfVxuXG4gICAgLy8gV2Ugc2hvdWxkIGFsbG93IElPIG9wZXJhdGlvbnMgdG8gZXhlY3V0ZTpcbiAgICBzZXRJbW1lZGlhdGUoXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHN0YXRlLnJlcG9ydFN0YXRlKEFjdGl2aXR5LnN0YXRlcy5ydW4sIG51bGwsIG15Q2FsbENvbnRleHQuc2NvcGUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzZWxmLmluaXRpYWxpemVFeGVjLmNhbGwobXlDYWxsQ29udGV4dC5zY29wZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5ydW4uY2FsbChteUNhbGxDb250ZXh0LnNjb3BlLCBteUNhbGxDb250ZXh0LCBhcmdzIHx8IHNlbGYuYXJncyB8fCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmFpbChteUNhbGxDb250ZXh0LCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuaW5pdGlhbGl6ZUV4ZWMgPSBfLm5vb3A7XG5cbkFjdGl2aXR5LnByb3RvdHlwZS51bkluaXRpYWxpemVFeGVjID0gXy5ub29wO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBhcmdzKSB7XG4gICAgY2FsbENvbnRleHQuYWN0aXZpdHkuY29tcGxldGUoY2FsbENvbnRleHQsIGFyZ3MpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZXN1bHQpIHtcbiAgICB0aGlzLmVuZChjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCByZXN1bHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCkge1xuICAgIHRoaXMuZW5kKGNhbGxDb250ZXh0LCBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pZGxlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0KSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5pZGxlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5mYWlsID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBlKSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5mYWlsLCBlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgdGhpcy51bkluaXRpYWxpemVFeGVjLmNhbGwoY2FsbENvbnRleHQuc2NvcGUsIHJlYXNvbiwgcmVzdWx0KTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBgdW5Jbml0aWFsaXplRXhlYyBmYWlsZWQuIFJlYXNvbiBvZiBlbmRpbmcgd2FzICcke3JlYXNvbn0nIGFuZCB0aGUgcmVzdWx0IGlzICcke3Jlc3VsdH0uYDtcbiAgICAgICAgcmVhc29uID0gQWN0aXZpdHkuc3RhdGVzLmZhaWw7XG4gICAgICAgIHJlc3VsdCA9IGU7XG4gICAgfVxuXG4gICAgbGV0IHN0YXRlID0gY2FsbENvbnRleHQuZXhlY3V0aW9uU3RhdGU7XG5cbiAgICBpZiAoc3RhdGUuZXhlY1N0YXRlID09PSBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsIHx8IHN0YXRlLmV4ZWNTdGF0ZSA9PT0gQWN0aXZpdHkuc3RhdGVzLmZhaWwpIHtcbiAgICAgICAgLy8gSXQgd2FzIGNhbmNlbGxlZCBvciBmYWlsZWQ6XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZS5leGVjU3RhdGUgPSByZWFzb247XG5cbiAgICBsZXQgaW5JZGxlID0gcmVhc29uID09PSBBY3Rpdml0eS5zdGF0ZXMuaWRsZTtcbiAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgIGxldCBzYXZlZFNjb3BlID0gY2FsbENvbnRleHQuc2NvcGU7XG4gICAgc2F2ZWRTY29wZS51cGRhdGUoU2ltcGxlUHJveHkudXBkYXRlTW9kZS5vbmVXYXkpO1xuICAgIGNhbGxDb250ZXh0ID0gY2FsbENvbnRleHQuYmFjayhpbklkbGUpO1xuXG4gICAgaWYgKGNhbGxDb250ZXh0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgYm1OYW1lID0gc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVWYWx1ZUNvbGxlY3RlZEJNTmFtZSh0aGlzLmdldEluc3RhbmNlSWQoZXhlY0NvbnRleHQpKTtcbiAgICAgICAgICAgIGlmIChleGVjQ29udGV4dC5pc0Jvb2ttYXJrRXhpc3RzKGJtTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIGJtTmFtZSwgcmVhc29uLCByZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZW1pdFN0YXRlKHJlc3VsdCwgc2F2ZWRTY29wZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVtaXRTdGF0ZShyZXN1bHQsIHNhdmVkU2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbENvbnRleHQuZmFpbChlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjYWxsQ29udGV4dC5mYWlsKGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBXZSdyZSBvbiByb290LCBkb25lLlxuICAgICAgICAvLyBJZiB3ZiBpbiBpZGxlLCBidXQgdGhlcmUgYXJlIGludGVybmFsIGJvb2ttYXJrIHJlc3VtZSByZXF1ZXN0LFxuICAgICAgICAvLyB0aGVuIGluc3RlYWQgb2YgZW1pdHRpbmcgZG9uZSwgd2UgaGF2ZSB0byBjb250aW51ZSB0aGVtLlxuICAgICAgICBpZiAoaW5JZGxlICYmIGV4ZWNDb250ZXh0LnByb2Nlc3NSZXN1bWVCb29rbWFya1F1ZXVlKCkpIHtcbiAgICAgICAgICAgIC8vIFdlIHNob3VsZCBub3QgZW1taXQgaWRsZSBldmVudCwgYmVjYXVzZSB0aGVyZSB3YXMgaW50ZXJuYWwgYm9va21hcmsgY29udGludXRhdGlvbnMsIHNvIHdlJ3JlIGRvbmUuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGUuZW1pdFN0YXRlKHJlc3VsdCwgc2F2ZWRTY29wZSk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX2RlZmF1bHRFbmRDYWxsYmFjayA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQpIHtcbiAgICBjYWxsQ29udGV4dC5lbmQocmVhc29uLCByZXN1bHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnNjaGVkdWxlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBvYmosIGVuZENhbGxiYWNrKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBzY29wZSA9IGNhbGxDb250ZXh0LnNjb3BlO1xuICAgIGxldCBleGVjQ29udGV4dCA9IGNhbGxDb250ZXh0LmV4ZWN1dGlvbkNvbnRleHQ7XG4gICAgbGV0IHNlbGZJZCA9IGNhbGxDb250ZXh0Lmluc3RhbmNlSWQ7XG5cbiAgICBpZiAoIWVuZENhbGxiYWNrKSB7XG4gICAgICAgIGVuZENhbGxiYWNrID0gXCJfZGVmYXVsdEVuZENhbGxiYWNrXCI7XG4gICAgfVxuXG4gICAgbGV0IGludm9rZUVuZENhbGxiYWNrID0gZnVuY3Rpb24gKF9yZWFzb24sIF9yZXN1bHQpIHtcbiAgICAgICAgc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlW2VuZENhbGxiYWNrXS5jYWxsKHNjb3BlLCBjYWxsQ29udGV4dCwgX3JlYXNvbiwgX3Jlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAoIV8uaXNTdHJpbmcoZW5kQ2FsbGJhY2spKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwobmV3IFR5cGVFcnJvcihcIlByb3ZpZGVkIGFyZ3VtZW50ICdlbmRDYWxsYmFjaycgdmFsdWUgaXMgbm90IGEgc3RyaW5nLlwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGNiID0gc2NvcGVbZW5kQ2FsbGJhY2tdO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGNiKSkge1xuICAgICAgICBjYWxsQ29udGV4dC5mYWlsKG5ldyBUeXBlRXJyb3IoYCcke2VuZENhbGxiYWNrfScgaXMgbm90IGEgZnVuY3Rpb24uYCkpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLl9fc2NoZWR1bGluZ1N0YXRlKSB7XG4gICAgICAgIGRlYnVnKFwiJXM6IEVycm9yLCBhbHJlYWR5IGV4aXN0c2luZyBzdGF0ZTogJWpcIiwgc2VsZklkLCBzY29wZS5fX3NjaGVkdWxpbmdTdGF0ZSk7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwobmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoXCJUaGVyZSBhcmUgYWxyZWFkeSBzY2hlZHVsZWQgaXRlbXMgZXhpc3RzLlwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkZWJ1ZyhcIiVzOiBTY2hlZHVsaW5nIG9iamVjdChzKSBieSB1c2luZyBlbmQgY2FsbGJhY2sgJyVzJzogJWpcIiwgc2VsZklkLCBlbmRDYWxsYmFjaywgb2JqKTtcblxuICAgIGxldCBzdGF0ZSA9XG4gICAge1xuICAgICAgICBtYW55OiBfLmlzQXJyYXkob2JqKSxcbiAgICAgICAgaW5kaWNlczogbmV3IE1hcCgpLFxuICAgICAgICByZXN1bHRzOiBbXSxcbiAgICAgICAgdG90YWw6IDAsXG4gICAgICAgIGlkbGVDb3VudDogMCxcbiAgICAgICAgY2FuY2VsQ291bnQ6IDAsXG4gICAgICAgIGNvbXBsZXRlZENvdW50OiAwLFxuICAgICAgICBlbmRCb29rbWFya05hbWU6IG51bGwsXG4gICAgICAgIGVuZENhbGxiYWNrTmFtZTogZW5kQ2FsbGJhY2tcbiAgICB9O1xuXG4gICAgbGV0IGJvb2ttYXJrTmFtZXMgPSBbXTtcbiAgICB0cnkge1xuICAgICAgICBsZXQgc3RhcnRlZEFueSA9IGZhbHNlO1xuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBsZXQgcHJvY2Vzc1ZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBDaGVja2luZyB2YWx1ZTogJWpcIiwgc2VsZklkLCB2YWx1ZSk7XG4gICAgICAgICAgICBsZXQgYWN0aXZpdHksIHZhcmlhYmxlcyA9IG51bGw7XG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgIGFjdGl2aXR5ID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChfLmlzT2JqZWN0KHZhbHVlKSAmJiB2YWx1ZS5hY3Rpdml0eSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgYWN0aXZpdHkgPSB2YWx1ZS5hY3Rpdml0eTtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXMgPSBfLmlzT2JqZWN0KHZhbHVlLnZhcmlhYmxlcykgPyB2YWx1ZS52YXJpYWJsZXMgOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgbGV0IGluc3RhbmNlSWQgPSBhY3Rpdml0eS5nZXRJbnN0YW5jZUlkKGV4ZWNDb250ZXh0KTtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBWYWx1ZSBpcyBhbiBhY3Rpdml0eSB3aXRoIGluc3RhbmNlIGlkOiAlc1wiLCBzZWxmSWQsIGluc3RhbmNlSWQpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5pbmRpY2VzLmhhcyhpbnN0YW5jZUlkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihgQWN0aXZpdHkgaW5zdGFuY2UgJyR7aW5zdGFuY2VJZH0gaGFzIGJlZW4gc2NoZWR1bGVkIGFscmVhZHkuYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IENyZWF0aW5nIGVuZCBib29rbWFyaywgYW5kIHN0YXJ0aW5nIGl0LlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIGJvb2ttYXJrTmFtZXMucHVzaChleGVjQ29udGV4dC5jcmVhdGVCb29rbWFyayhzZWxmSWQsIHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlVmFsdWVDb2xsZWN0ZWRCTU5hbWUoaW5zdGFuY2VJZCksIFwicmVzdWx0Q29sbGVjdGVkXCIpKTtcbiAgICAgICAgICAgICAgICBhY3Rpdml0eS5fc3RhcnQoY2FsbENvbnRleHQsIHZhcmlhYmxlcyk7XG4gICAgICAgICAgICAgICAgc3RhcnRlZEFueSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGUuaW5kaWNlcy5zZXQoaW5zdGFuY2VJZCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnJlc3VsdHMucHVzaChudWxsKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS50b3RhbCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogVmFsdWUgaXMgbm90IGFuIGFjdGl2aXR5LlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChzdGF0ZS5tYW55KSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBUaGVyZSBhcmUgbWFueSB2YWx1ZXMsIGl0ZXJhdGluZy5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgIGZvciAobGV0IHZhbHVlIG9mIG9iaikge1xuICAgICAgICAgICAgICAgIHByb2Nlc3NWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHByb2Nlc3NWYWx1ZShvYmopO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc3RhcnRlZEFueSkge1xuICAgICAgICAgICAgZGVidWcoXCIlczogTm8gYWN0aXZpdHkgaGFzIGJlZW4gc3RhcnRlZCwgY2FsbGluZyBlbmQgY2FsbGJhY2sgd2l0aCBvcmlnaW5hbCBvYmplY3QuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gc3RhdGUubWFueSA/IHN0YXRlLnJlc3VsdHMgOiBzdGF0ZS5yZXN1bHRzWzBdO1xuICAgICAgICAgICAgaW52b2tlRW5kQ2FsbGJhY2soQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVidWcoXCIlczogJWQgYWN0aXZpdGllcyBoYXMgYmVlbiBzdGFydGVkLiBSZWdpc3RlcmluZyBlbmQgYm9va21hcmsuXCIsIHNlbGZJZCwgc3RhdGUuaW5kaWNlcy5zaXplKTtcbiAgICAgICAgICAgIGxldCBlbmRCTSA9IHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlQ29sbGVjdGluZ0NvbXBsZXRlZEJNTmFtZShzZWxmSWQpO1xuICAgICAgICAgICAgYm9va21hcmtOYW1lcy5wdXNoKGV4ZWNDb250ZXh0LmNyZWF0ZUJvb2ttYXJrKHNlbGZJZCwgZW5kQk0sIGVuZENhbGxiYWNrKSk7XG4gICAgICAgICAgICBzdGF0ZS5lbmRCb29rbWFya05hbWUgPSBlbmRCTTtcbiAgICAgICAgICAgIHNjb3BlLl9fc2NoZWR1bGluZ1N0YXRlID0gc3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUudXBkYXRlKFNpbXBsZVByb3h5LnVwZGF0ZU1vZGUub25lV2F5KTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVidWcoXCIlczogUnVudGltZSBlcnJvciBoYXBwZW5lZDogJXNcIiwgc2VsZklkLCBlLnN0YWNrKTtcbiAgICAgICAgaWYgKGJvb2ttYXJrTmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBTZXQgYm9va21hcmtzIHRvIG5vb3A6ICRqXCIsIHNlbGZJZCwgYm9va21hcmtOYW1lcyk7XG4gICAgICAgICAgICBleGVjQ29udGV4dC5ub29wQ2FsbGJhY2tzKGJvb2ttYXJrTmFtZXMpO1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLmRlbGV0ZShcIl9fc2NoZWR1bGluZ1N0YXRlXCIpO1xuICAgICAgICBkZWJ1ZyhcIiVzOiBJbnZva2luZyBlbmQgY2FsbGJhY2sgd2l0aCB0aGUgZXJyb3IuXCIsIHNlbGZJZCk7XG4gICAgICAgIGludm9rZUVuZENhbGxiYWNrKEFjdGl2aXR5LnN0YXRlcy5mYWlsLCBlKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIGRlYnVnKFwiJXM6IEZpbmFsIHN0YXRlIGluZGljZXMgY291bnQ6ICVkLCB0b3RhbDogJWRcIiwgc2VsZklkLCBzdGF0ZS5pbmRpY2VzLnNpemUsIHN0YXRlLnRvdGFsKTtcbiAgICB9XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUucmVzdWx0Q29sbGVjdGVkID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCwgYm9va21hcmspIHtcbiAgICBsZXQgc2VsZklkID0gY2FsbENvbnRleHQuaW5zdGFuY2VJZDtcbiAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgIGxldCBjaGlsZElkID0gc3BlY1N0cmluZ3MuZ2V0U3RyaW5nKGJvb2ttYXJrLm5hbWUpO1xuICAgIGRlYnVnKFwiJXM6IFNjaGVkdWxpbmcgcmVzdWx0IGl0ZW0gY29sbGVjdGVkLCBjaGlsZElkOiAlcywgcmVhc29uOiAlcywgcmVzdWx0OiAlaiwgYm9va21hcms6ICVqXCIsIHNlbGZJZCwgY2hpbGRJZCwgcmVhc29uLCByZXN1bHQsIGJvb2ttYXJrKTtcblxuICAgIGxldCBmaW5pc2hlZCA9IG51bGw7XG4gICAgbGV0IHN0YXRlID0gdGhpcy5fX3NjaGVkdWxpbmdTdGF0ZTtcbiAgICBsZXQgZmFpbCA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGlmICghXy5pc09iamVjdChzdGF0ZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKFwiVmFsdWUgb2YgX19zY2hlZHVsaW5nU3RhdGUgaXMgJ1wiICsgc3RhdGUgKyBcIicuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBpbmRleCA9IHN0YXRlLmluZGljZXMuZ2V0KGNoaWxkSWQpO1xuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChpbmRleCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKGBDaGlsZCBhY3Rpdml0eSBvZiAnJHtjaGlsZElkfScgc2NoZWR1bGluZyBzdGF0ZSBpbmRleCBvdXQgb2YgcmVuZ2UuYCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWJ1ZyhcIiVzOiBGaW5pc2hlZCBjaGlsZCBhY3Rpdml0eSBpZCBpczogJXNcIiwgc2VsZklkLCBjaGlsZElkKTtcblxuICAgICAgICBzd2l0Y2ggKHJlYXNvbikge1xuICAgICAgICAgICAgY2FzZSBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGU6XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogU2V0dGluZyAlZC4gdmFsdWUgdG8gcmVzdWx0OiAlalwiLCBzZWxmSWQsIGluZGV4LCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnJlc3VsdHNbaW5kZXhdID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFJlbW92aW5nIGlkIGZyb20gc3RhdGUuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuaW5kaWNlcy5kZWxldGUoY2hpbGRJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuY29tcGxldGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aXZpdHkuc3RhdGVzLmZhaWw6XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogRmFpbGVkIHdpdGg6ICVzXCIsIHNlbGZJZCwgcmVzdWx0LnN0YWNrKTtcbiAgICAgICAgICAgICAgICBmYWlsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pbmRpY2VzLmRlbGV0ZShjaGlsZElkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aXZpdHkuc3RhdGVzLmNhbmNlbDpcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBJbmNyZW1lbnRpbmcgY2FuY2VsIGNvdW50ZXIuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuY2FuY2VsQ291bnQrKztcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBSZW1vdmluZyBpZCBmcm9tIHN0YXRlLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmluZGljZXMuZGVsZXRlKGNoaWxkSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpdml0eS5zdGF0ZXMuaWRsZTpcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBJbmNyZW1lbnRpbmcgaWRsZSBjb3VudGVyLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmlkbGVDb3VudCsrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihgUmVzdWx0IGNvbGxlY3RlZCB3aXRoIHVua25vd24gcmVhc29uICcke3JlYXNvbn0nLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVidWcoXCIlczogU3RhdGUgc28gZmFyID0gdG90YWw6ICVzLCBpbmRpY2VzIGNvdW50OiAlZCwgY29tcGxldGVkIGNvdW50OiAlZCwgY2FuY2VsIGNvdW50OiAlZCwgZXJyb3IgY291bnQ6ICVkLCBpZGxlIGNvdW50OiAlZFwiLFxuICAgICAgICAgICAgc2VsZklkLFxuICAgICAgICAgICAgc3RhdGUudG90YWwsXG4gICAgICAgICAgICBzdGF0ZS5pbmRpY2VzLnNpemUsXG4gICAgICAgICAgICBzdGF0ZS5jb21wbGV0ZWRDb3VudCxcbiAgICAgICAgICAgIHN0YXRlLmNhbmNlbENvdW50LFxuICAgICAgICAgICAgc3RhdGUuaWRsZUNvdW50KTtcblxuICAgICAgICBsZXQgZW5kV2l0aE5vQ29sbGVjdEFsbCA9ICFjYWxsQ29udGV4dC5hY3Rpdml0eS5jb2xsZWN0QWxsICYmIHJlYXNvbiAhPT0gQWN0aXZpdHkuc3RhdGVzLmlkbGU7XG4gICAgICAgIGlmIChlbmRXaXRoTm9Db2xsZWN0QWxsIHx8IGZhaWwpIHtcbiAgICAgICAgICAgIGlmICghZmFpbCkge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IC0tLS0gQ29sbGVjdGluZyBvZiB2YWx1ZXMgZW5kZWQsIGJlY2F1c2Ugd2UncmUgbm90IGNvbGxlY3RpbmcgYWxsIHZhbHVlcyAoZWcuOiBQaWNrKS5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IC0tLS0gQ29sbGVjdGluZyBvZiB2YWx1ZXMgZW5kZWQsIGJlY2F1c2Ugb2YgYW4gZXJyb3IuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBTaHV0dGluZyBkb3duICVkIG90aGVyLCBydW5uaW5nIGFjaXR2aXRpZXMuXCIsIHNlbGZJZCwgc3RhdGUuaW5kaWNlcy5zaXplKTtcbiAgICAgICAgICAgIGxldCBpZHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGlkIG9mIHN0YXRlLmluZGljZXMua2V5cygpKSB7XG4gICAgICAgICAgICAgICAgaWRzLnB1c2goaWQpO1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IERlbGV0aW5nIHNjb3BlIG9mIGFjdGl2aXR5OiAlc1wiLCBzZWxmSWQsIGlkKTtcbiAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5kZWxldGVTY29wZU9mQWN0aXZpdHkoY2FsbENvbnRleHQsIGlkKTtcbiAgICAgICAgICAgICAgICBsZXQgaWJtTmFtZSA9IHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlVmFsdWVDb2xsZWN0ZWRCTU5hbWUoaWQpO1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IERlbGV0aW5nIHZhbHVlIGNvbGxlY3RlZCBib29rbWFyazogJXNcIiwgc2VsZklkLCBpYm1OYW1lKTtcbiAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5kZWxldGVCb29rbWFyayhpYm1OYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4ZWNDb250ZXh0LmNhbmNlbEV4ZWN1dGlvbih0aGlzLCBpZHMpO1xuICAgICAgICAgICAgZGVidWcoXCIlczogQWN0aXZpdGllcyBjYW5jZWxsZWQ6ICVqXCIsIHNlbGZJZCwgaWRzKTtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IFJlcG9ydGluZyB0aGUgYWN0dWFsIHJlYXNvbjogJXMgYW5kIHJlc3VsdDogJWpcIiwgc2VsZklkLCByZWFzb24sIHJlc3VsdCk7XG4gICAgICAgICAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHsgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBzdGF0ZS5lbmRCb29rbWFya05hbWUsIHJlYXNvbiwgcmVzdWx0KTsgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFzc2VydCghZmFpbCk7XG4gICAgICAgICAgICBsZXQgb25FbmQgPSAoc3RhdGUuaW5kaWNlcy5zaXplIC0gc3RhdGUuaWRsZUNvdW50KSA9PT0gMDtcbiAgICAgICAgICAgIGlmIChvbkVuZCkge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IC0tLS0gQ29sbGVjdGluZyBvZiB2YWx1ZXMgZW5kZWQgKGVuZGVkIGJlY2F1c2Ugb2YgY29sbGVjdCBhbGwgaXMgb2ZmOiAlcykuXCIsIHNlbGZJZCwgZW5kV2l0aE5vQ29sbGVjdEFsbCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmNhbmNlbENvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IENvbGxlY3RpbmcgaGFzIGJlZW4gY2FuY2VsbGVkLCByZXN1bWluZyBlbmQgYm9va21hcmtzLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHsgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBzdGF0ZS5lbmRCb29rbWFya05hbWUsIEFjdGl2aXR5LnN0YXRlcy5jYW5jZWwpOyB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0ZS5pZGxlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWcoXCIlczogVGhpcyBlbnRyeSBoYXMgYmVlbiBnb25lIHRvIGlkbGUsIHByb3BhZ2F0aW5nIGNvdW50ZXIuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmlkbGVDb3VudC0tOyAvLyBCZWNhdXNlIHRoZSBuZXh0IGNhbGwgd2lsbCB3YWtlIHVwIGEgdGhyZWFkLlxuICAgICAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIHN0YXRlLmVuZEJvb2ttYXJrTmFtZSwgQWN0aXZpdHkuc3RhdGVzLmlkbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gc3RhdGUubWFueSA/IHN0YXRlLnJlc3VsdHMgOiBzdGF0ZS5yZXN1bHRzWzBdO1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBUaGlzIGVudHJ5IGhhcyBiZWVuIGNvbXBsZXRlZCwgcmVzdW1pbmcgY29sbGVjdCBib29rbWFyayB3aXRoIHRoZSByZXN1bHQocyk6ICVqXCIsIHNlbGZJZCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7IGV4ZWNDb250ZXh0LnJlc3VtZUJvb2ttYXJrSW5TY29wZShjYWxsQ29udGV4dCwgc3RhdGUuZW5kQm9va21hcmtOYW1lLCBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGUsIHJlc3VsdCk7IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwoZSk7XG4gICAgICAgIHRoaXMuZGVsZXRlKFwiX19zY2hlZHVsaW5nU3RhdGVcIik7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBpZiAoZmluaXNoZWQpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IFNjaGR1bGluZyBmaW5pc2hlZCwgcmVtb3Zpbmcgc3RhdGUuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZShcIl9fc2NoZWR1bGluZ1N0YXRlXCIpO1xuXG4gICAgICAgICAgICBmaW5pc2hlZCgpO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8qIFJVTiAqL1xuXG4vKiBTQ09QRSAqL1xuQWN0aXZpdHkucHJvdG90eXBlLl9nZXRTY29wZUtleXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmICghc2VsZi5fc2NvcGVLZXlzIHx8ICFzZWxmLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCkge1xuICAgICAgICBzZWxmLl9zY29wZUtleXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHNlbGYpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi5ub25TY29wZWRQcm9wZXJ0aWVzLmhhcyhrZXkpICYmIChfLmlzVW5kZWZpbmVkKEFjdGl2aXR5LnByb3RvdHlwZVtrZXldKSB8fCBrZXkgPT09IFwiX2RlZmF1bHRFbmRDYWxsYmFja1wiIHx8IGtleSA9PT0gXCJfc3ViQWN0aXZpdGllc0dvdFwiKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3Njb3BlS2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNlbGYuX3Njb3BlS2V5cztcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5jcmVhdGVTY29wZVBhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCkge1xuICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5UnVudGltZUVycm9yKFwiQ2Fubm90IGNyZWF0ZSBhY3Rpdml0eSBzY29wZSBmb3IgdW5pbml0aWFsaXplZCBhY3Rpdml0aWVzLlwiKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCA9PT0gbnVsbCkge1xuICAgICAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgICAgICBsZXQgc3JjID0gXCJyZXR1cm4ge1wiO1xuICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgb2YgdGhpcy5fZ2V0U2NvcGVLZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gXCIsXFxuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KHRoaXNbZmllbGROYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gZmllbGROYW1lICsgXCI6Xy5jbG9uZShhLlwiICsgZmllbGROYW1lICsgXCIsIHRydWUpXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChfLmlzQXJyYXkodGhpc1tmaWVsZE5hbWVdKSkge1xuICAgICAgICAgICAgICAgIHNyYyArPSBmaWVsZE5hbWUgKyBcIjphLlwiICsgZmllbGROYW1lICsgXCIuc2xpY2UoMClcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNyYyArPSBmaWVsZE5hbWUgKyBcIjphLlwiICsgZmllbGROYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNyYyArPSBcIn1cIjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCA9IG5ldyBGdW5jdGlvbihcImEsX1wiLCBzcmMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkludmFsaWQgc2NvcGUgcGFydCBmdW5jdGlvbjolc1wiLCBzcmMpO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVTY29wZVBhcnRJbXBsKHRoaXMsIF8pO1xufTtcbi8qIFNDT1BFICovXG5cbkFjdGl2aXR5LnN0YXRlcyA9IGVudW1zLkFjdGl2aXR5U3RhdGVzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2aXR5O1xuIl19
