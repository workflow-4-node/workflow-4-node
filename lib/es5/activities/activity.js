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
  this.nonScopedProperties.add("arrayProperties");
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
//# sourceMappingURL=data:application/json;base64,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TUFBSTtBQUNBLFNBQUcscUJBQXFCLEVBQUksSUFBSSxTQUFPLEFBQUMsQ0FBQyxLQUFJLENBQUcsSUFBRSxDQUFDLENBQUM7SUFDeEQsQ0FDQSxPQUFPLENBQUEsQ0FBRztBQUNOLFVBQUksQUFBQyxDQUFDLGdDQUErQixDQUFHLElBQUUsQ0FBQyxDQUFDO0FBQzVDLFVBQU0sRUFBQSxDQUFDO0lBQ1g7QUFBQSxFQUNKO0FBQUEsQUFFQSxPQUFPLENBQUEsSUFBRyxxQkFBcUIsQUFBQyxDQUFDLElBQUcsQ0FBRyxFQUFBLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBR0QsT0FBTyxPQUFPLEVBQUksQ0FBQSxLQUFJLGVBQWUsQ0FBQztBQUV0QyxLQUFLLFFBQVEsRUFBSSxTQUFPLENBQUM7QUFDekIiLCJmaWxlIjoiYWN0aXZpdGllcy9hY3Rpdml0eS5qcyIsInNvdXJjZVJvb3QiOiJsaWIvZXM2Iiwic291cmNlc0NvbnRlbnQiOlsiLypqc2hpbnQgLVcwNTQgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBndWlkcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZ3VpZHNcIik7XG5sZXQgZXJyb3JzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lcnJvcnNcIik7XG5sZXQgZW51bXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2VudW1zXCIpO1xubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xubGV0IHNwZWNTdHJpbmdzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9zcGVjU3RyaW5nc1wiKTtcbmxldCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5sZXQgaXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2lzXCIpO1xubGV0IENhbGxDb250ZXh0ID0gcmVxdWlyZShcIi4vY2FsbENvbnRleHRcIik7XG5sZXQgdXVpZCA9IHJlcXVpcmUoJ25vZGUtdXVpZCcpO1xubGV0IGFzeW5jID0gcmVxdWlyZShcIi4uL2NvbW1vbi9hc3luY0hlbHBlcnNcIikuYXN5bmM7XG5sZXQgYXNzZXJ0ID0gcmVxdWlyZShcImJldHRlci1hc3NlcnRcIik7XG5sZXQgZGVidWcgPSByZXF1aXJlKFwiZGVidWdcIikoXCJ3ZjRub2RlOkFjdGl2aXR5XCIpO1xubGV0IGNvbW1vbiA9IHJlcXVpcmUoXCIuLi9jb21tb25cIik7XG5sZXQgU2ltcGxlUHJveHkgPSBjb21tb24uU2ltcGxlUHJveHk7XG5cbmZ1bmN0aW9uIEFjdGl2aXR5KCkge1xuICAgIHRoaXMuYXJncyA9IG51bGw7XG4gICAgdGhpcy5kaXNwbGF5TmFtZSA9IG51bGw7XG4gICAgdGhpcy5pZCA9IHV1aWQudjQoKTtcbiAgICB0aGlzLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuX3Njb3BlS2V5cyA9IG51bGw7XG4gICAgdGhpc1tcIkByZXF1aXJlXCJdID0gbnVsbDtcblxuICAgIC8vIFByb3BlcnRpZXMgbm90IHNlcmlhbGl6ZWQ6XG4gICAgdGhpcy5ub25TZXJpYWxpemVkUHJvcGVydGllcyA9IG5ldyBTZXQoKTtcblxuICAgIC8vIFByb3BlcnRpZXMgYXJlIG5vdCBnb2luZyB0byBjb3BpZWQgaW4gdGhlIHNjb3BlOlxuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwibm9uU2NvcGVkUHJvcGVydGllc1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwibm9uU2VyaWFsaXplZFByb3BlcnRpZXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImFycmF5UHJvcGVydGllc1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiYWN0aXZpdHlcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImlkXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJhcmdzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJkaXNwbGF5TmFtZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY29tcGxldGVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImNhbmNlbFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiaWRsZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiZmFpbFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiZW5kXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJzY2hlZHVsZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY3JlYXRlQm9va21hcmtcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInJlc3VtZUJvb2ttYXJrXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJyZXN1bHRDb2xsZWN0ZWRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImNvZGVQcm9wZXJ0aWVzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJpbml0aWFsaXplU3RydWN0dXJlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfaW5pdGlhbGl6ZVN0cnVjdHVyZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiX3N0cnVjdHVyZUluaXRpYWxpemVkXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjbG9uZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiX3Njb3BlS2V5c1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiX2NyZWF0ZVNjb3BlUGFydEltcGxcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIkByZXF1aXJlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJpbml0aWFsaXplRXhlY1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwidW5Jbml0aWFsaXplRXhlY1wiKTtcblxuICAgIHRoaXMuY29kZVByb3BlcnRpZXMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5hcnJheVByb3BlcnRpZXMgPSBuZXcgU2V0KFtcImFyZ3NcIl0pO1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhBY3Rpdml0eS5wcm90b3R5cGUsIHtcbiAgICBfc2NvcGVLZXlzOiB7XG4gICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9LFxuICAgIF9jcmVhdGVTY29wZVBhcnRJbXBsOiB7XG4gICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9LFxuICAgIGNvbGxlY3RBbGw6IHtcbiAgICAgICAgdmFsdWU6IHRydWUsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9XG59KTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmdldEluc3RhbmNlSWQgPSBmdW5jdGlvbiAoZXhlY0NvbnRleHQpIHtcbiAgICByZXR1cm4gZXhlY0NvbnRleHQuZ2V0SW5zdGFuY2VJZCh0aGlzKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMuZGlzcGxheU5hbWUgPyAodGhpcy5kaXNwbGF5TmFtZSArIFwiIFwiKSA6IFwiXCIpICsgXCIoXCIgKyB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyBcIjpcIiArIHRoaXMuaWQgKyBcIilcIjtcbn07XG5cbi8qIGZvckVhY2ggKi9cbkFjdGl2aXR5LnByb3RvdHlwZS5hbGwgPSBmdW5jdGlvbiogKGV4ZWNDb250ZXh0KSB7XG4gICAgeWllbGQgKiB0aGlzLl9jaGlsZHJlbih0cnVlLCBudWxsLCBleGVjQ29udGV4dCwgbnVsbCk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuY2hpbGRyZW4gPSBmdW5jdGlvbiogKGV4ZWNDb250ZXh0KSB7XG4gICAgeWllbGQgKiB0aGlzLl9jaGlsZHJlbih0cnVlLCB0aGlzLCBleGVjQ29udGV4dCwgbnVsbCk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuaW1tZWRpYXRlQ2hpbGRyZW4gPSBmdW5jdGlvbiogKGV4ZWNDb250ZXh0KSB7XG4gICAgeWllbGQgKiB0aGlzLl9jaGlsZHJlbihmYWxzZSwgdGhpcywgZXhlY0NvbnRleHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLl9jaGlsZHJlbiA9IGZ1bmN0aW9uKiAoZGVlcCwgZXhjZXB0LCBleGVjQ29udGV4dCwgdmlzaXRlZCkge1xuICAgIGFzc2VydChleGVjQ29udGV4dCBpbnN0YW5jZW9mIHJlcXVpcmUoXCIuL2FjdGl2aXR5RXhlY3V0aW9uQ29udGV4dFwiKSwgXCJDYW5ub3QgZW51bWVyYXRlIGFjdGl2aXRpZXMgd2l0aG91dCBhbiBleGVjdXRpb24gY29udGV4dC5cIik7XG4gICAgdmlzaXRlZCA9IHZpc2l0ZWQgfHwgbmV3IFNldCgpO1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBpZiAoIXZpc2l0ZWQuaGFzKHNlbGYpKSB7XG4gICAgICAgIHZpc2l0ZWQuYWRkKHNlbGYpO1xuXG4gICAgICAgIC8vIEVuc3VyZSBpdCdzIHN0cnVjdHVyZSBjcmVhdGVkOlxuICAgICAgICB0aGlzLl9pbml0aWFsaXplU3RydWN0dXJlKGV4ZWNDb250ZXh0KTtcblxuICAgICAgICBpZiAoc2VsZiAhPT0gZXhjZXB0KSB7XG4gICAgICAgICAgICB5aWVsZCBzZWxmO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgZmllbGROYW1lIGluIHNlbGYpIHtcbiAgICAgICAgICAgIGxldCBmaWVsZFZhbHVlID0gc2VsZltmaWVsZE5hbWVdO1xuICAgICAgICAgICAgaWYgKGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5pc0FycmF5KGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG9iaiBvZiBmaWVsZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCAqIG9iai5fY2hpbGRyZW4oZGVlcCwgZXhjZXB0LCBleGVjQ29udGV4dCwgdmlzaXRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBvYmo7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZpZWxkVmFsdWUgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgKiBmaWVsZFZhbHVlLl9jaGlsZHJlbihkZWVwLCBleGNlcHQsIGV4ZWNDb250ZXh0LCB2aXNpdGVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuLyogZm9yRWFjaCAqL1xuXG4vKiBTdHJ1Y3R1cmUgKi9cbkFjdGl2aXR5LnByb3RvdHlwZS5pc0FycmF5UHJvcGVydHkgPSBmdW5jdGlvbiAocHJvcE5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5hcnJheVByb3BlcnRpZXMuaGFzKHByb3BOYW1lKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5faW5pdGlhbGl6ZVN0cnVjdHVyZSA9IGZ1bmN0aW9uIChleGVjQ29udGV4dCkge1xuICAgIGFzc2VydCghIWV4ZWNDb250ZXh0KTtcbiAgICBpZiAoIXRoaXMuX3N0cnVjdHVyZUluaXRpYWxpemVkKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZVN0cnVjdHVyZShleGVjQ29udGV4dCk7XG4gICAgICAgIHRoaXMuX3N0cnVjdHVyZUluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuaW5pdGlhbGl6ZVN0cnVjdHVyZSA9IF8ubm9vcDtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIG1ha2VDbG9uZSh2YWx1ZSwgY2FuQ2xvbmVBcnJheXMpIHtcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5jbG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBsZXQgbmV3U2V0ID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiB2YWx1ZS52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIG5ld1NldC5hZGQoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3U2V0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmIChjYW5DbG9uZUFycmF5cykge1xuICAgICAgICAgICAgICAgIGxldCBuZXdBcnJheSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGl0ZW0gb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3QXJyYXkucHVzaChtYWtlQ2xvbmUoaXRlbSwgZmFsc2UpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld0FycmF5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNsb25lIGFjdGl2aXR5J3MgbmVzdGVkIGFycmF5cy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgQ29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yO1xuICAgIGxldCBuZXdJbnN0ID0gbmV3IENvbnN0cnVjdG9yKCk7XG4gICAgZm9yIChsZXQga2V5IGluIHRoaXMpIHtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpc1trZXldO1xuICAgICAgICBpZiAobmV3SW5zdFtrZXldICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgbmV3SW5zdFtrZXldID0gbWFrZUNsb25lKHZhbHVlLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3SW5zdDtcbn07XG5cbi8qIFJVTiAqL1xuQWN0aXZpdHkucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0KSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCEoY2FsbENvbnRleHQgaW5zdGFuY2VvZiBDYWxsQ29udGV4dCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgJ2NvbnRleHQnIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBBY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQuXCIpO1xuICAgIH1cblxuICAgIGxldCBhcmdzID0gc2VsZi5hcmdzO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBhcmdzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3N0YXJ0KGNhbGxDb250ZXh0LCBudWxsLCBhcmdzKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5fc3RhcnQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHZhcmlhYmxlcywgYXJncykge1xuICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgIGxldCBteUNhbGxDb250ZXh0ID0gY2FsbENvbnRleHQubmV4dChzZWxmLCB2YXJpYWJsZXMpO1xuICAgIGxldCBzdGF0ZSA9IG15Q2FsbENvbnRleHQuZXhlY3V0aW9uU3RhdGU7XG4gICAgaWYgKHN0YXRlLmlzUnVubmluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBY3Rpdml0eSBpcyBhbHJlYWR5IHJ1bm5pbmcuXCIpO1xuICAgIH1cblxuICAgIC8vIFdlIHNob3VsZCBhbGxvdyBJTyBvcGVyYXRpb25zIHRvIGV4ZWN1dGU6XG4gICAgc2V0SW1tZWRpYXRlKFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzdGF0ZS5yZXBvcnRTdGF0ZShBY3Rpdml0eS5zdGF0ZXMucnVuLCBudWxsLCBteUNhbGxDb250ZXh0LnNjb3BlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pbml0aWFsaXplRXhlYy5jYWxsKG15Q2FsbENvbnRleHQuc2NvcGUpO1xuICAgICAgICAgICAgICAgIHNlbGYucnVuLmNhbGwobXlDYWxsQ29udGV4dC5zY29wZSwgbXlDYWxsQ29udGV4dCwgYXJncyB8fCBzZWxmLmFyZ3MgfHwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZhaWwobXlDYWxsQ29udGV4dCwgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmluaXRpYWxpemVFeGVjID0gXy5ub29wO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUudW5Jbml0aWFsaXplRXhlYyA9IF8ubm9vcDtcblxuQWN0aXZpdHkucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgYXJncykge1xuICAgIGNhbGxDb250ZXh0LmFjdGl2aXR5LmNvbXBsZXRlKGNhbGxDb250ZXh0LCBhcmdzKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVzdWx0KSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5jb21wbGV0ZSwgcmVzdWx0KTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5jYW5jZWwgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQpIHtcbiAgICB0aGlzLmVuZChjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmNhbmNlbCk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuaWRsZSA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCkge1xuICAgIHRoaXMuZW5kKGNhbGxDb250ZXh0LCBBY3Rpdml0eS5zdGF0ZXMuaWRsZSk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuZmFpbCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgZSkge1xuICAgIHRoaXMuZW5kKGNhbGxDb250ZXh0LCBBY3Rpdml0eS5zdGF0ZXMuZmFpbCwgZSk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCkge1xuICAgIHRyeSB7XG4gICAgICAgIHRoaXMudW5Jbml0aWFsaXplRXhlYy5jYWxsKGNhbGxDb250ZXh0LnNjb3BlLCByZWFzb24sIHJlc3VsdCk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGxldCBtZXNzYWdlID0gYHVuSW5pdGlhbGl6ZUV4ZWMgZmFpbGVkLiBSZWFzb24gb2YgZW5kaW5nIHdhcyAnJHtyZWFzb259JyBhbmQgdGhlIHJlc3VsdCBpcyAnJHtyZXN1bHR9LmA7XG4gICAgICAgIHJlYXNvbiA9IEFjdGl2aXR5LnN0YXRlcy5mYWlsO1xuICAgICAgICByZXN1bHQgPSBlO1xuICAgIH1cblxuICAgIGxldCBzdGF0ZSA9IGNhbGxDb250ZXh0LmV4ZWN1dGlvblN0YXRlO1xuXG4gICAgaWYgKHN0YXRlLmV4ZWNTdGF0ZSA9PT0gQWN0aXZpdHkuc3RhdGVzLmNhbmNlbCB8fCBzdGF0ZS5leGVjU3RhdGUgPT09IEFjdGl2aXR5LnN0YXRlcy5mYWlsKSB7XG4gICAgICAgIC8vIEl0IHdhcyBjYW5jZWxsZWQgb3IgZmFpbGVkOlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3RhdGUuZXhlY1N0YXRlID0gcmVhc29uO1xuXG4gICAgbGV0IGluSWRsZSA9IHJlYXNvbiA9PT0gQWN0aXZpdHkuc3RhdGVzLmlkbGU7XG4gICAgbGV0IGV4ZWNDb250ZXh0ID0gY2FsbENvbnRleHQuZXhlY3V0aW9uQ29udGV4dDtcbiAgICBsZXQgc2F2ZWRTY29wZSA9IGNhbGxDb250ZXh0LnNjb3BlO1xuICAgIHNhdmVkU2NvcGUudXBkYXRlKFNpbXBsZVByb3h5LnVwZGF0ZU1vZGUub25lV2F5KTtcbiAgICBjYWxsQ29udGV4dCA9IGNhbGxDb250ZXh0LmJhY2soaW5JZGxlKTtcblxuICAgIGlmIChjYWxsQ29udGV4dCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGJtTmFtZSA9IHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlVmFsdWVDb2xsZWN0ZWRCTU5hbWUodGhpcy5nZXRJbnN0YW5jZUlkKGV4ZWNDb250ZXh0KSk7XG4gICAgICAgICAgICBpZiAoZXhlY0NvbnRleHQuaXNCb29rbWFya0V4aXN0cyhibU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBibU5hbWUsIHJlYXNvbiwgcmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVtaXRTdGF0ZShyZXN1bHQsIHNhdmVkU2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lbWl0U3RhdGUocmVzdWx0LCBzYXZlZFNjb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxDb250ZXh0LmZhaWwoZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY2FsbENvbnRleHQuZmFpbChlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gV2UncmUgb24gcm9vdCwgZG9uZS5cbiAgICAgICAgLy8gSWYgd2YgaW4gaWRsZSwgYnV0IHRoZXJlIGFyZSBpbnRlcm5hbCBib29rbWFyayByZXN1bWUgcmVxdWVzdCxcbiAgICAgICAgLy8gdGhlbiBpbnN0ZWFkIG9mIGVtaXR0aW5nIGRvbmUsIHdlIGhhdmUgdG8gY29udGludWUgdGhlbS5cbiAgICAgICAgaWYgKGluSWRsZSAmJiBleGVjQ29udGV4dC5wcm9jZXNzUmVzdW1lQm9va21hcmtRdWV1ZSgpKSB7XG4gICAgICAgICAgICAvLyBXZSBzaG91bGQgbm90IGVtbWl0IGlkbGUgZXZlbnQsIGJlY2F1c2UgdGhlcmUgd2FzIGludGVybmFsIGJvb2ttYXJrIGNvbnRpbnV0YXRpb25zLCBzbyB3ZSdyZSBkb25lLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRlLmVtaXRTdGF0ZShyZXN1bHQsIHNhdmVkU2NvcGUpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLl9kZWZhdWx0RW5kQ2FsbGJhY2sgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0KSB7XG4gICAgY2FsbENvbnRleHQuZW5kKHJlYXNvbiwgcmVzdWx0KTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5zY2hlZHVsZSA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgb2JqLCBlbmRDYWxsYmFjaykge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBsZXQgc2NvcGUgPSBjYWxsQ29udGV4dC5zY29wZTtcbiAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgIGxldCBzZWxmSWQgPSBjYWxsQ29udGV4dC5pbnN0YW5jZUlkO1xuXG4gICAgaWYgKCFlbmRDYWxsYmFjaykge1xuICAgICAgICBlbmRDYWxsYmFjayA9IFwiX2RlZmF1bHRFbmRDYWxsYmFja1wiO1xuICAgIH1cblxuICAgIGxldCBpbnZva2VFbmRDYWxsYmFjayA9IGZ1bmN0aW9uIChfcmVhc29uLCBfcmVzdWx0KSB7XG4gICAgICAgIHNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZVtlbmRDYWxsYmFja10uY2FsbChzY29wZSwgY2FsbENvbnRleHQsIF9yZWFzb24sIF9yZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgaWYgKCFfLmlzU3RyaW5nKGVuZENhbGxiYWNrKSkge1xuICAgICAgICBjYWxsQ29udGV4dC5mYWlsKG5ldyBUeXBlRXJyb3IoXCJQcm92aWRlZCBhcmd1bWVudCAnZW5kQ2FsbGJhY2snIHZhbHVlIGlzIG5vdCBhIHN0cmluZy5cIikpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBjYiA9IHNjb3BlW2VuZENhbGxiYWNrXTtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihjYikpIHtcbiAgICAgICAgY2FsbENvbnRleHQuZmFpbChuZXcgVHlwZUVycm9yKGAnJHtlbmRDYWxsYmFja30nIGlzIG5vdCBhIGZ1bmN0aW9uLmApKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzY29wZS5fX3NjaGVkdWxpbmdTdGF0ZSkge1xuICAgICAgICBkZWJ1ZyhcIiVzOiBFcnJvciwgYWxyZWFkeSBleGlzdHNpbmcgc3RhdGU6ICVqXCIsIHNlbGZJZCwgc2NvcGUuX19zY2hlZHVsaW5nU3RhdGUpO1xuICAgICAgICBjYWxsQ29udGV4dC5mYWlsKG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKFwiVGhlcmUgYXJlIGFscmVhZHkgc2NoZWR1bGVkIGl0ZW1zIGV4aXN0cy5cIikpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZGVidWcoXCIlczogU2NoZWR1bGluZyBvYmplY3QocykgYnkgdXNpbmcgZW5kIGNhbGxiYWNrICclcyc6ICVqXCIsIHNlbGZJZCwgZW5kQ2FsbGJhY2ssIG9iaik7XG5cbiAgICBsZXQgc3RhdGUgPVxuICAgIHtcbiAgICAgICAgbWFueTogXy5pc0FycmF5KG9iaiksXG4gICAgICAgIGluZGljZXM6IG5ldyBNYXAoKSxcbiAgICAgICAgcmVzdWx0czogW10sXG4gICAgICAgIHRvdGFsOiAwLFxuICAgICAgICBpZGxlQ291bnQ6IDAsXG4gICAgICAgIGNhbmNlbENvdW50OiAwLFxuICAgICAgICBjb21wbGV0ZWRDb3VudDogMCxcbiAgICAgICAgZW5kQm9va21hcmtOYW1lOiBudWxsLFxuICAgICAgICBlbmRDYWxsYmFja05hbWU6IGVuZENhbGxiYWNrXG4gICAgfTtcblxuICAgIGxldCBib29rbWFya05hbWVzID0gW107XG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IHN0YXJ0ZWRBbnkgPSBmYWxzZTtcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgbGV0IHByb2Nlc3NWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgZGVidWcoXCIlczogQ2hlY2tpbmcgdmFsdWU6ICVqXCIsIHNlbGZJZCwgdmFsdWUpO1xuICAgICAgICAgICAgbGV0IGFjdGl2aXR5LCB2YXJpYWJsZXMgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICBhY3Rpdml0eSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoXy5pc09iamVjdCh2YWx1ZSkgJiYgdmFsdWUuYWN0aXZpdHkgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgIGFjdGl2aXR5ID0gdmFsdWUuYWN0aXZpdHk7XG4gICAgICAgICAgICAgICAgdmFyaWFibGVzID0gXy5pc09iamVjdCh2YWx1ZS52YXJpYWJsZXMpID8gdmFsdWUudmFyaWFibGVzIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgIGxldCBpbnN0YW5jZUlkID0gYWN0aXZpdHkuZ2V0SW5zdGFuY2VJZChleGVjQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogVmFsdWUgaXMgYW4gYWN0aXZpdHkgd2l0aCBpbnN0YW5jZSBpZDogJXNcIiwgc2VsZklkLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuaW5kaWNlcy5oYXMoaW5zdGFuY2VJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoYEFjdGl2aXR5IGluc3RhbmNlICcke2luc3RhbmNlSWR9IGhhcyBiZWVuIHNjaGVkdWxlZCBhbHJlYWR5LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBDcmVhdGluZyBlbmQgYm9va21hcmssIGFuZCBzdGFydGluZyBpdC5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgICAgICBib29rbWFya05hbWVzLnB1c2goZXhlY0NvbnRleHQuY3JlYXRlQm9va21hcmsoc2VsZklkLCBzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmNyZWF0ZVZhbHVlQ29sbGVjdGVkQk1OYW1lKGluc3RhbmNlSWQpLCBcInJlc3VsdENvbGxlY3RlZFwiKSk7XG4gICAgICAgICAgICAgICAgYWN0aXZpdHkuX3N0YXJ0KGNhbGxDb250ZXh0LCB2YXJpYWJsZXMpO1xuICAgICAgICAgICAgICAgIHN0YXJ0ZWRBbnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlLmluZGljZXMuc2V0KGluc3RhbmNlSWQsIGluZGV4KTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5yZXN1bHRzLnB1c2gobnVsbCk7XG4gICAgICAgICAgICAgICAgc3RhdGUudG90YWwrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFZhbHVlIGlzIG5vdCBhbiBhY3Rpdml0eS5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5yZXN1bHRzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoc3RhdGUubWFueSkge1xuICAgICAgICAgICAgZGVidWcoXCIlczogVGhlcmUgYXJlIG1hbnkgdmFsdWVzLCBpdGVyYXRpbmcuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICBmb3IgKGxldCB2YWx1ZSBvZiBvYmopIHtcbiAgICAgICAgICAgICAgICBwcm9jZXNzVmFsdWUodmFsdWUpO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwcm9jZXNzVmFsdWUob2JqKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXN0YXJ0ZWRBbnkpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IE5vIGFjdGl2aXR5IGhhcyBiZWVuIHN0YXJ0ZWQsIGNhbGxpbmcgZW5kIGNhbGxiYWNrIHdpdGggb3JpZ2luYWwgb2JqZWN0LlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHN0YXRlLm1hbnkgPyBzdGF0ZS5yZXN1bHRzIDogc3RhdGUucmVzdWx0c1swXTtcbiAgICAgICAgICAgIGludm9rZUVuZENhbGxiYWNrKEFjdGl2aXR5LnN0YXRlcy5jb21wbGV0ZSwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6ICVkIGFjdGl2aXRpZXMgaGFzIGJlZW4gc3RhcnRlZC4gUmVnaXN0ZXJpbmcgZW5kIGJvb2ttYXJrLlwiLCBzZWxmSWQsIHN0YXRlLmluZGljZXMuc2l6ZSk7XG4gICAgICAgICAgICBsZXQgZW5kQk0gPSBzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmNyZWF0ZUNvbGxlY3RpbmdDb21wbGV0ZWRCTU5hbWUoc2VsZklkKTtcbiAgICAgICAgICAgIGJvb2ttYXJrTmFtZXMucHVzaChleGVjQ29udGV4dC5jcmVhdGVCb29rbWFyayhzZWxmSWQsIGVuZEJNLCBlbmRDYWxsYmFjaykpO1xuICAgICAgICAgICAgc3RhdGUuZW5kQm9va21hcmtOYW1lID0gZW5kQk07XG4gICAgICAgICAgICBzY29wZS5fX3NjaGVkdWxpbmdTdGF0ZSA9IHN0YXRlO1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLnVwZGF0ZShTaW1wbGVQcm94eS51cGRhdGVNb2RlLm9uZVdheSk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGRlYnVnKFwiJXM6IFJ1bnRpbWUgZXJyb3IgaGFwcGVuZWQ6ICVzXCIsIHNlbGZJZCwgZS5zdGFjayk7XG4gICAgICAgIGlmIChib29rbWFya05hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgZGVidWcoXCIlczogU2V0IGJvb2ttYXJrcyB0byBub29wOiAkalwiLCBzZWxmSWQsIGJvb2ttYXJrTmFtZXMpO1xuICAgICAgICAgICAgZXhlY0NvbnRleHQubm9vcENhbGxiYWNrcyhib29rbWFya05hbWVzKTtcbiAgICAgICAgfVxuICAgICAgICBzY29wZS5kZWxldGUoXCJfX3NjaGVkdWxpbmdTdGF0ZVwiKTtcbiAgICAgICAgZGVidWcoXCIlczogSW52b2tpbmcgZW5kIGNhbGxiYWNrIHdpdGggdGhlIGVycm9yLlwiLCBzZWxmSWQpO1xuICAgICAgICBpbnZva2VFbmRDYWxsYmFjayhBY3Rpdml0eS5zdGF0ZXMuZmFpbCwgZSk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBkZWJ1ZyhcIiVzOiBGaW5hbCBzdGF0ZSBpbmRpY2VzIGNvdW50OiAlZCwgdG90YWw6ICVkXCIsIHNlbGZJZCwgc3RhdGUuaW5kaWNlcy5zaXplLCBzdGF0ZS50b3RhbCk7XG4gICAgfVxufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnJlc3VsdENvbGxlY3RlZCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQsIGJvb2ttYXJrKSB7XG4gICAgbGV0IHNlbGZJZCA9IGNhbGxDb250ZXh0Lmluc3RhbmNlSWQ7XG4gICAgbGV0IGV4ZWNDb250ZXh0ID0gY2FsbENvbnRleHQuZXhlY3V0aW9uQ29udGV4dDtcbiAgICBsZXQgY2hpbGRJZCA9IHNwZWNTdHJpbmdzLmdldFN0cmluZyhib29rbWFyay5uYW1lKTtcbiAgICBkZWJ1ZyhcIiVzOiBTY2hlZHVsaW5nIHJlc3VsdCBpdGVtIGNvbGxlY3RlZCwgY2hpbGRJZDogJXMsIHJlYXNvbjogJXMsIHJlc3VsdDogJWosIGJvb2ttYXJrOiAlalwiLCBzZWxmSWQsIGNoaWxkSWQsIHJlYXNvbiwgcmVzdWx0LCBib29rbWFyayk7XG5cbiAgICBsZXQgZmluaXNoZWQgPSBudWxsO1xuICAgIGxldCBzdGF0ZSA9IHRoaXMuX19zY2hlZHVsaW5nU3RhdGU7XG4gICAgbGV0IGZhaWwgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBpZiAoIV8uaXNPYmplY3Qoc3RhdGUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihcIlZhbHVlIG9mIF9fc2NoZWR1bGluZ1N0YXRlIGlzICdcIiArIHN0YXRlICsgXCInLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaW5kZXggPSBzdGF0ZS5pbmRpY2VzLmdldChjaGlsZElkKTtcbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoaW5kZXgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihgQ2hpbGQgYWN0aXZpdHkgb2YgJyR7Y2hpbGRJZH0nIHNjaGVkdWxpbmcgc3RhdGUgaW5kZXggb3V0IG9mIHJlbmdlLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVidWcoXCIlczogRmluaXNoZWQgY2hpbGQgYWN0aXZpdHkgaWQgaXM6ICVzXCIsIHNlbGZJZCwgY2hpbGRJZCk7XG5cbiAgICAgICAgc3dpdGNoIChyZWFzb24pIHtcbiAgICAgICAgICAgIGNhc2UgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlOlxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFNldHRpbmcgJWQuIHZhbHVlIHRvIHJlc3VsdDogJWpcIiwgc2VsZklkLCBpbmRleCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5yZXN1bHRzW2luZGV4XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBSZW1vdmluZyBpZCBmcm9tIHN0YXRlLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmluZGljZXMuZGVsZXRlKGNoaWxkSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmNvbXBsZXRlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGl2aXR5LnN0YXRlcy5mYWlsOlxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IEZhaWxlZCB3aXRoOiAlc1wiLCBzZWxmSWQsIHJlc3VsdC5zdGFjayk7XG4gICAgICAgICAgICAgICAgZmFpbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGUuaW5kaWNlcy5kZWxldGUoY2hpbGRJZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGl2aXR5LnN0YXRlcy5jYW5jZWw6XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogSW5jcmVtZW50aW5nIGNhbmNlbCBjb3VudGVyLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmNhbmNlbENvdW50Kys7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogUmVtb3ZpbmcgaWQgZnJvbSBzdGF0ZS5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pbmRpY2VzLmRlbGV0ZShjaGlsZElkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aXZpdHkuc3RhdGVzLmlkbGU6XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogSW5jcmVtZW50aW5nIGlkbGUgY291bnRlci5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pZGxlQ291bnQrKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoYFJlc3VsdCBjb2xsZWN0ZWQgd2l0aCB1bmtub3duIHJlYXNvbiAnJHtyZWFzb259Jy5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlYnVnKFwiJXM6IFN0YXRlIHNvIGZhciA9IHRvdGFsOiAlcywgaW5kaWNlcyBjb3VudDogJWQsIGNvbXBsZXRlZCBjb3VudDogJWQsIGNhbmNlbCBjb3VudDogJWQsIGVycm9yIGNvdW50OiAlZCwgaWRsZSBjb3VudDogJWRcIixcbiAgICAgICAgICAgIHNlbGZJZCxcbiAgICAgICAgICAgIHN0YXRlLnRvdGFsLFxuICAgICAgICAgICAgc3RhdGUuaW5kaWNlcy5zaXplLFxuICAgICAgICAgICAgc3RhdGUuY29tcGxldGVkQ291bnQsXG4gICAgICAgICAgICBzdGF0ZS5jYW5jZWxDb3VudCxcbiAgICAgICAgICAgIHN0YXRlLmlkbGVDb3VudCk7XG5cbiAgICAgICAgbGV0IGVuZFdpdGhOb0NvbGxlY3RBbGwgPSAhY2FsbENvbnRleHQuYWN0aXZpdHkuY29sbGVjdEFsbCAmJiByZWFzb24gIT09IEFjdGl2aXR5LnN0YXRlcy5pZGxlO1xuICAgICAgICBpZiAoZW5kV2l0aE5vQ29sbGVjdEFsbCB8fCBmYWlsKSB7XG4gICAgICAgICAgICBpZiAoIWZhaWwpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiAtLS0tIENvbGxlY3Rpbmcgb2YgdmFsdWVzIGVuZGVkLCBiZWNhdXNlIHdlJ3JlIG5vdCBjb2xsZWN0aW5nIGFsbCB2YWx1ZXMgKGVnLjogUGljaykuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiAtLS0tIENvbGxlY3Rpbmcgb2YgdmFsdWVzIGVuZGVkLCBiZWNhdXNlIG9mIGFuIGVycm9yLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVidWcoXCIlczogU2h1dHRpbmcgZG93biAlZCBvdGhlciwgcnVubmluZyBhY2l0dml0aWVzLlwiLCBzZWxmSWQsIHN0YXRlLmluZGljZXMuc2l6ZSk7XG4gICAgICAgICAgICBsZXQgaWRzID0gW107XG4gICAgICAgICAgICBmb3IgKGxldCBpZCBvZiBzdGF0ZS5pbmRpY2VzLmtleXMoKSkge1xuICAgICAgICAgICAgICAgIGlkcy5wdXNoKGlkKTtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBEZWxldGluZyBzY29wZSBvZiBhY3Rpdml0eTogJXNcIiwgc2VsZklkLCBpZCk7XG4gICAgICAgICAgICAgICAgZXhlY0NvbnRleHQuZGVsZXRlU2NvcGVPZkFjdGl2aXR5KGNhbGxDb250ZXh0LCBpZCk7XG4gICAgICAgICAgICAgICAgbGV0IGlibU5hbWUgPSBzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmNyZWF0ZVZhbHVlQ29sbGVjdGVkQk1OYW1lKGlkKTtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBEZWxldGluZyB2YWx1ZSBjb2xsZWN0ZWQgYm9va21hcms6ICVzXCIsIHNlbGZJZCwgaWJtTmFtZSk7XG4gICAgICAgICAgICAgICAgZXhlY0NvbnRleHQuZGVsZXRlQm9va21hcmsoaWJtTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleGVjQ29udGV4dC5jYW5jZWxFeGVjdXRpb24odGhpcywgaWRzKTtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IEFjdGl2aXRpZXMgY2FuY2VsbGVkOiAlalwiLCBzZWxmSWQsIGlkcyk7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBSZXBvcnRpbmcgdGhlIGFjdHVhbCByZWFzb246ICVzIGFuZCByZXN1bHQ6ICVqXCIsIHNlbGZJZCwgcmVhc29uLCByZXN1bHQpO1xuICAgICAgICAgICAgZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7IGV4ZWNDb250ZXh0LnJlc3VtZUJvb2ttYXJrSW5TY29wZShjYWxsQ29udGV4dCwgc3RhdGUuZW5kQm9va21hcmtOYW1lLCByZWFzb24sIHJlc3VsdCk7IH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhc3NlcnQoIWZhaWwpO1xuICAgICAgICAgICAgbGV0IG9uRW5kID0gKHN0YXRlLmluZGljZXMuc2l6ZSAtIHN0YXRlLmlkbGVDb3VudCkgPT09IDA7XG4gICAgICAgICAgICBpZiAob25FbmQpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiAtLS0tIENvbGxlY3Rpbmcgb2YgdmFsdWVzIGVuZGVkIChlbmRlZCBiZWNhdXNlIG9mIGNvbGxlY3QgYWxsIGlzIG9mZjogJXMpLlwiLCBzZWxmSWQsIGVuZFdpdGhOb0NvbGxlY3RBbGwpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5jYW5jZWxDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBDb2xsZWN0aW5nIGhhcyBiZWVuIGNhbmNlbGxlZCwgcmVzdW1pbmcgZW5kIGJvb2ttYXJrcy5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7IGV4ZWNDb250ZXh0LnJlc3VtZUJvb2ttYXJrSW5TY29wZShjYWxsQ29udGV4dCwgc3RhdGUuZW5kQm9va21hcmtOYW1lLCBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsKTsgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdGUuaWRsZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFRoaXMgZW50cnkgaGFzIGJlZW4gZ29uZSB0byBpZGxlLCBwcm9wYWdhdGluZyBjb3VudGVyLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5pZGxlQ291bnQtLTsgLy8gQmVjYXVzZSB0aGUgbmV4dCBjYWxsIHdpbGwgd2FrZSB1cCBhIHRocmVhZC5cbiAgICAgICAgICAgICAgICAgICAgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBzdGF0ZS5lbmRCb29rbWFya05hbWUsIEFjdGl2aXR5LnN0YXRlcy5pZGxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHN0YXRlLm1hbnkgPyBzdGF0ZS5yZXN1bHRzIDogc3RhdGUucmVzdWx0c1swXTtcbiAgICAgICAgICAgICAgICAgICAgZGVidWcoXCIlczogVGhpcyBlbnRyeSBoYXMgYmVlbiBjb21wbGV0ZWQsIHJlc3VtaW5nIGNvbGxlY3QgYm9va21hcmsgd2l0aCB0aGUgcmVzdWx0KHMpOiAlalwiLCBzZWxmSWQsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gZnVuY3Rpb24gKCkgeyBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIHN0YXRlLmVuZEJvb2ttYXJrTmFtZSwgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCByZXN1bHQpOyB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBjYWxsQ29udGV4dC5mYWlsKGUpO1xuICAgICAgICB0aGlzLmRlbGV0ZShcIl9fc2NoZWR1bGluZ1N0YXRlXCIpO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgICAgaWYgKGZpbmlzaGVkKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBTY2hkdWxpbmcgZmluaXNoZWQsIHJlbW92aW5nIHN0YXRlLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgdGhpcy5kZWxldGUoXCJfX3NjaGVkdWxpbmdTdGF0ZVwiKTtcblxuICAgICAgICAgICAgZmluaXNoZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG4vKiBSVU4gKi9cblxuLyogU0NPUEUgKi9cbkFjdGl2aXR5LnByb3RvdHlwZS5fZ2V0U2NvcGVLZXlzID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBpZiAoIXNlbGYuX3Njb3BlS2V5cyB8fCAhc2VsZi5fc3RydWN0dXJlSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgc2VsZi5fc2NvcGVLZXlzID0gW107XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBzZWxmKSB7XG4gICAgICAgICAgICBpZiAoIXNlbGYubm9uU2NvcGVkUHJvcGVydGllcy5oYXMoa2V5KSAmJiAoXy5pc1VuZGVmaW5lZChBY3Rpdml0eS5wcm90b3R5cGVba2V5XSkgfHwga2V5ID09PSBcIl9kZWZhdWx0RW5kQ2FsbGJhY2tcIiB8fCBrZXkgPT09IFwiX3N1YkFjdGl2aXRpZXNHb3RcIikpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zY29wZUtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzZWxmLl9zY29wZUtleXM7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuY3JlYXRlU2NvcGVQYXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVJ1bnRpbWVFcnJvcihcIkNhbm5vdCBjcmVhdGUgYWN0aXZpdHkgc2NvcGUgZm9yIHVuaW5pdGlhbGl6ZWQgYWN0aXZpdGllcy5cIik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NyZWF0ZVNjb3BlUGFydEltcGwgPT09IG51bGwpIHtcbiAgICAgICAgbGV0IGZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgbGV0IHNyYyA9IFwicmV0dXJuIHtcIjtcbiAgICAgICAgZm9yIChsZXQgZmllbGROYW1lIG9mIHRoaXMuX2dldFNjb3BlS2V5cygpKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3JjICs9IFwiLFxcblwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKF8uaXNQbGFpbk9iamVjdCh0aGlzW2ZpZWxkTmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgc3JjICs9IGZpZWxkTmFtZSArIFwiOl8uY2xvbmUoYS5cIiArIGZpZWxkTmFtZSArIFwiLCB0cnVlKVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoXy5pc0FycmF5KHRoaXNbZmllbGROYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gZmllbGROYW1lICsgXCI6YS5cIiArIGZpZWxkTmFtZSArIFwiLnNsaWNlKDApXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gZmllbGROYW1lICsgXCI6YS5cIiArIGZpZWxkTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzcmMgKz0gXCJ9XCI7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVNjb3BlUGFydEltcGwgPSBuZXcgRnVuY3Rpb24oXCJhLF9cIiwgc3JjKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZGVidWcoXCJJbnZhbGlkIHNjb3BlIHBhcnQgZnVuY3Rpb246JXNcIiwgc3JjKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCh0aGlzLCBfKTtcbn07XG4vKiBTQ09QRSAqL1xuXG5BY3Rpdml0eS5zdGF0ZXMgPSBlbnVtcy5BY3Rpdml0eVN0YXRlcztcblxubW9kdWxlLmV4cG9ydHMgPSBBY3Rpdml0eTtcbiJdfQ==
