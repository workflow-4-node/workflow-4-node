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
    if (this.hasOwnProperty(key)) {
      var value = this[key];
      if (newInst[key] !== value) {
        newInst[key] = makeClone(value, true);
      }
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
  args = args || self.args || [];
  if (!_.isArray(args)) {
    args = [args];
  }
  var myCallContext = callContext.next(self, variables);
  var state = myCallContext.executionState;
  if (state.isRunning) {
    throw new Error("Activity is already running.");
  }
  setImmediate(function() {
    state.reportState(Activity.states.run, null, myCallContext.scope);
    try {
      self.initializeExec.call(myCallContext.scope);
      self.run.call(myCallContext.scope, myCallContext, args);
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
Activity.states = enums.activityStates;
module.exports = Activity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjdGl2aXR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0FBRUEsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxrQkFBaUIsQ0FBQyxDQUFDO0FBQ3hDLEFBQUksRUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLGlCQUFnQixDQUFDLENBQUM7QUFDdEMsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsV0FBVSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsdUJBQXNCLENBQUMsQ0FBQztBQUNsRCxBQUFJLEVBQUEsQ0FBQSxJQUFHLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxNQUFLLENBQUMsQ0FBQztBQUMxQixBQUFJLEVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxjQUFhLENBQUMsQ0FBQztBQUNoQyxBQUFJLEVBQUEsQ0FBQSxXQUFVLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxlQUFjLENBQUMsQ0FBQztBQUMxQyxBQUFJLEVBQUEsQ0FBQSxJQUFHLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxXQUFVLENBQUMsQ0FBQztBQUMvQixBQUFJLEVBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyx3QkFBdUIsQ0FBQyxNQUFNLENBQUM7QUFDbkQsQUFBSSxFQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsZUFBYyxDQUFDLENBQUM7QUFDckMsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsT0FBTSxDQUFDLEFBQUMsQ0FBQyxrQkFBaUIsQ0FBQyxDQUFDO0FBQ2hELEFBQUksRUFBQSxDQUFBLE1BQUssRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLFdBQVUsQ0FBQyxDQUFDO0FBQ2pDLEFBQUksRUFBQSxDQUFBLFdBQVUsRUFBSSxDQUFBLE1BQUssWUFBWSxDQUFDO0FBRXBDLE9BQVMsU0FBTyxDQUFFLEFBQUQsQ0FBRztBQUNoQixLQUFHLEtBQUssRUFBSSxLQUFHLENBQUM7QUFDaEIsS0FBRyxZQUFZLEVBQUksS0FBRyxDQUFDO0FBQ3ZCLEtBQUcsR0FBRyxFQUFJLENBQUEsSUFBRyxHQUFHLEFBQUMsRUFBQyxDQUFDO0FBQ25CLEtBQUcsc0JBQXNCLEVBQUksTUFBSSxDQUFDO0FBQ2xDLEtBQUcsV0FBVyxFQUFJLEtBQUcsQ0FBQztBQUN0QixLQUFHLENBQUUsVUFBUyxDQUFDLEVBQUksS0FBRyxDQUFDO0FBR3ZCLEtBQUcsd0JBQXdCLEVBQUksSUFBSSxJQUFFLEFBQUMsRUFBQyxDQUFDO0FBR3hDLEtBQUcsb0JBQW9CLEVBQUksSUFBSSxJQUFFLEFBQUMsRUFBQyxDQUFDO0FBQ3BDLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLHFCQUFvQixDQUFDLENBQUM7QUFDbkQsS0FBRyxvQkFBb0IsSUFBSSxBQUFDLENBQUMseUJBQXdCLENBQUMsQ0FBQztBQUN2RCxLQUFHLG9CQUFvQixJQUFJLEFBQUMsQ0FBQyxpQkFBZ0IsQ0FBQyxDQUFDO0FBQy9DLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLFVBQVMsQ0FBQyxDQUFDO0FBQ3hDLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFDO0FBQ2xDLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO0FBQ3BDLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLGFBQVksQ0FBQyxDQUFDO0FBQzNDLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLFVBQVMsQ0FBQyxDQUFDO0FBQ3hDLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLFFBQU8sQ0FBQyxDQUFDO0FBQ3RDLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO0FBQ3BDLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO0FBQ3BDLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLEtBQUksQ0FBQyxDQUFDO0FBQ25DLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLFVBQVMsQ0FBQyxDQUFDO0FBQ3hDLEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLGdCQUFlLENBQUMsQ0FBQztBQUM5QyxLQUFHLG9CQUFvQixJQUFJLEFBQUMsQ0FBQyxnQkFBZSxDQUFDLENBQUM7QUFDOUMsS0FBRyxvQkFBb0IsSUFBSSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUMvQyxLQUFHLG9CQUFvQixJQUFJLEFBQUMsQ0FBQyxnQkFBZSxDQUFDLENBQUM7QUFDOUMsS0FBRyxvQkFBb0IsSUFBSSxBQUFDLENBQUMscUJBQW9CLENBQUMsQ0FBQztBQUNuRCxLQUFHLG9CQUFvQixJQUFJLEFBQUMsQ0FBQyxzQkFBcUIsQ0FBQyxDQUFDO0FBQ3BELEtBQUcsb0JBQW9CLElBQUksQUFBQyxDQUFDLHVCQUFzQixDQUFDLENBQUM7QUFDckQsS0FBRyxvQkFBb0IsSUFBSSxBQUFDLENBQUMsT0FBTSxDQUFDLENBQUM7QUFDckMsS0FBRyxvQkFBb0IsSUFBSSxBQUFDLENBQUMsWUFBVyxDQUFDLENBQUM7QUFDMUMsS0FBRyxvQkFBb0IsSUFBSSxBQUFDLENBQUMsc0JBQXFCLENBQUMsQ0FBQztBQUNwRCxLQUFHLG9CQUFvQixJQUFJLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQztBQUN4QyxLQUFHLG9CQUFvQixJQUFJLEFBQUMsQ0FBQyxnQkFBZSxDQUFDLENBQUM7QUFDOUMsS0FBRyxvQkFBb0IsSUFBSSxBQUFDLENBQUMsa0JBQWlCLENBQUMsQ0FBQztBQUVoRCxLQUFHLGVBQWUsRUFBSSxJQUFJLElBQUUsQUFBQyxFQUFDLENBQUM7QUFDL0IsS0FBRyxnQkFBZ0IsRUFBSSxJQUFJLElBQUUsQUFBQyxDQUFDLENBQUMsTUFBSyxDQUFDLENBQUMsQ0FBQztBQUM1QztBQUFBLEFBRUEsS0FBSyxpQkFBaUIsQUFBQyxDQUFDLFFBQU8sVUFBVSxDQUFHO0FBQ3hDLFdBQVMsQ0FBRztBQUNSLFFBQUksQ0FBRyxLQUFHO0FBQ1YsV0FBTyxDQUFHLEtBQUc7QUFDYixhQUFTLENBQUcsTUFBSTtBQUFBLEVBQ3BCO0FBQ0EscUJBQW1CLENBQUc7QUFDbEIsUUFBSSxDQUFHLEtBQUc7QUFDVixXQUFPLENBQUcsS0FBRztBQUNiLGFBQVMsQ0FBRyxNQUFJO0FBQUEsRUFDcEI7QUFDQSxXQUFTLENBQUc7QUFDUixRQUFJLENBQUcsS0FBRztBQUNWLFdBQU8sQ0FBRyxNQUFJO0FBQ2QsYUFBUyxDQUFHLE1BQUk7QUFBQSxFQUNwQjtBQUFBLEFBQ0osQ0FBQyxDQUFDO0FBRUYsT0FBTyxVQUFVLGNBQWMsRUFBSSxVQUFVLFdBQVUsQ0FBRztBQUN0RCxPQUFPLENBQUEsV0FBVSxjQUFjLEFBQUMsQ0FBQyxJQUFHLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBRUQsT0FBTyxVQUFVLFNBQVMsRUFBSSxVQUFVLEFBQUQsQ0FBRztBQUN0QyxPQUFPLENBQUEsQ0FBQyxJQUFHLFlBQVksRUFBSSxFQUFDLElBQUcsWUFBWSxFQUFJLElBQUUsQ0FBQyxFQUFJLEdBQUMsQ0FBQyxFQUFJLElBQUUsQ0FBQSxDQUFJLENBQUEsSUFBRyxZQUFZLEtBQUssQ0FBQSxDQUFJLElBQUUsQ0FBQSxDQUFJLENBQUEsSUFBRyxHQUFHLENBQUEsQ0FBSSxJQUFFLENBQUM7QUFDakgsQ0FBQztBQUdELE9BQU8sVUFBVSxJQUFJLEVBMUZyQixDQUFBLGVBQWMsc0JBQXNCLEFBQUMsQ0EwRlosZUFBVyxXQUFVOzs7QUExRjlDLE9BQU8sQ0FBUCxlQUFjLHdCQUF3QixBQUFkLENBQXhCLFNBQVMsSUFBRyxDQUFHO0FBQ1QsVUFBTyxJQUFHOzs7QUFBUixnQkFBb0IsQ0FBQSxJQUFHLGNBQWMsQUFBQyxDQUFDLEFBMEZuQyxJQUFHLFVBQVUsQUFBQyxDQUFDLElBQUcsQ0FBRyxLQUFHLENBQUcsWUFBVSxDQUFHLEtBQUcsQ0FBQyxDQTFGUyxNQUFLLFNBQVMsQ0FBQyxBQUFDLEVBQUMsQ0FBQyxDQUFDO0FBRTVFLGFBQUcsS0FBSyxFQUFJLEtBQUssRUFBQSxDQUFDO0FBRWxCLGFBQUcsT0FBTyxFQUFJLE9BQUssQ0FBQzs7OztBQUdsQixnQkFBb0IsQ0FBQSxNQUFrQixJQUFHLE9BQU8sQ0FBQyxBQUFDLENBQUMsSUFBRyxnQkFBZ0IsQ0FBQyxDQUFDOzs7O0FBUmxGLGFBQUcsTUFBTSxFQUFJLENBQUEsQ0FTQyxVQUFxQixDQVRKLFFBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUFTQSxhQUFHLEtBQUssRUFBSSxZQUFzQixDQUFDOzs7OztlQUcvQixZQUFzQjs7QUFidEMsZUFBTyxDQUFBLElBQUcsSUFBSSxBQUFDLEVBQUMsQ0FBQTs7QUFDbUIsRUFDL0IsUUFBNkIsS0FBRyxDQUFDLENBQUM7QUEwRnRDLENBNUZ1RCxBQTRGdkQsQ0FBQztBQUVELE9BQU8sVUFBVSxTQUFTLEVBOUYxQixDQUFBLGVBQWMsc0JBQXNCLEFBQUMsQ0E4RlAsZUFBVyxXQUFVOzs7QUE5Rm5ELE9BQU8sQ0FBUCxlQUFjLHdCQUF3QixBQUFkLENBQXhCLFNBQVMsSUFBRyxDQUFHO0FBQ1QsVUFBTyxJQUFHOzs7QUFBUixnQkFBb0IsQ0FBQSxJQUFHLGNBQWMsQUFBQyxDQUFDLEFBOEZuQyxJQUFHLFVBQVUsQUFBQyxDQUFDLElBQUcsQ0FBRyxLQUFHLENBQUcsWUFBVSxDQUFHLEtBQUcsQ0FBQyxDQTlGUyxNQUFLLFNBQVMsQ0FBQyxBQUFDLEVBQUMsQ0FBQyxDQUFDO0FBRTVFLGFBQUcsS0FBSyxFQUFJLEtBQUssRUFBQSxDQUFDO0FBRWxCLGFBQUcsT0FBTyxFQUFJLE9BQUssQ0FBQzs7OztBQUdsQixnQkFBb0IsQ0FBQSxNQUFrQixJQUFHLE9BQU8sQ0FBQyxBQUFDLENBQUMsSUFBRyxnQkFBZ0IsQ0FBQyxDQUFDOzs7O0FBUmxGLGFBQUcsTUFBTSxFQUFJLENBQUEsQ0FTQyxVQUFxQixDQVRKLFFBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUFTQSxhQUFHLEtBQUssRUFBSSxZQUFzQixDQUFDOzs7OztlQUcvQixZQUFzQjs7QUFidEMsZUFBTyxDQUFBLElBQUcsSUFBSSxBQUFDLEVBQUMsQ0FBQTs7QUFDbUIsRUFDL0IsUUFBNkIsS0FBRyxDQUFDLENBQUM7QUE4RnRDLENBaEd1RCxBQWdHdkQsQ0FBQztBQUVELE9BQU8sVUFBVSxrQkFBa0IsRUFsR25DLENBQUEsZUFBYyxzQkFBc0IsQUFBQyxDQWtHRSxlQUFXLFdBQVU7OztBQWxHNUQsT0FBTyxDQUFQLGVBQWMsd0JBQXdCLEFBQWQsQ0FBeEIsU0FBUyxJQUFHLENBQUc7QUFDVCxVQUFPLElBQUc7OztBQUFSLGdCQUFvQixDQUFBLElBQUcsY0FBYyxBQUFDLENBQUMsQUFrR25DLElBQUcsVUFBVSxBQUFDLENBQUMsS0FBSSxDQUFHLEtBQUcsQ0FBRyxZQUFVLENBQUMsQ0FsR2MsTUFBSyxTQUFTLENBQUMsQUFBQyxFQUFDLENBQUMsQ0FBQztBQUU1RSxhQUFHLEtBQUssRUFBSSxLQUFLLEVBQUEsQ0FBQztBQUVsQixhQUFHLE9BQU8sRUFBSSxPQUFLLENBQUM7Ozs7QUFHbEIsZ0JBQW9CLENBQUEsTUFBa0IsSUFBRyxPQUFPLENBQUMsQUFBQyxDQUFDLElBQUcsZ0JBQWdCLENBQUMsQ0FBQzs7OztBQVJsRixhQUFHLE1BQU0sRUFBSSxDQUFBLENBU0MsVUFBcUIsQ0FUSixRQUF3QyxDQUFDO0FBQ2hFLGVBQUk7O0FBU0EsYUFBRyxLQUFLLEVBQUksWUFBc0IsQ0FBQzs7Ozs7ZUFHL0IsWUFBc0I7O0FBYnRDLGVBQU8sQ0FBQSxJQUFHLElBQUksQUFBQyxFQUFDLENBQUE7O0FBQ21CLEVBQy9CLFFBQTZCLEtBQUcsQ0FBQyxDQUFDO0FBa0d0QyxDQXBHdUQsQUFvR3ZELENBQUM7QUFFRCxPQUFPLFVBQVUsVUFBVSxFQXRHM0IsQ0FBQSxlQUFjLHNCQUFzQixBQUFDLENBc0dOLGVBQVcsSUFBRyxDQUFHLENBQUEsTUFBSyxDQUFHLENBQUEsV0FBVSxDQUFHLENBQUEsT0FBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXRHM0UsT0FBTyxDQUFQLGVBQWMsd0JBQXdCLEFBQWQsQ0FBeEIsU0FBUyxJQUFHLENBQUc7QUFDVCxVQUFPLElBQUc7OztBQXNHWixlQUFLLEFBQUMsQ0FBQyxXQUFVLFdBQWEsQ0FBQSxPQUFNLEFBQUMsQ0FBQyw0QkFBMkIsQ0FBQyxDQUFHLDREQUEwRCxDQUFDLENBQUM7QUFDakksZ0JBQU0sRUFBSSxDQUFBLE9BQU0sR0FBSyxJQUFJLElBQUUsQUFBQyxFQUFDLENBQUM7ZUFDbkIsS0FBRzs7OztBQXpHbEIsYUFBRyxNQUFNLEVBQUksQ0FBQSxDQTBHTCxDQUFDLE9BQU0sSUFBSSxBQUFDLENBQUMsSUFBRyxDQUFDLENBMUdNLFVBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUEwR0osZ0JBQU0sSUFBSSxBQUFDLENBQUMsSUFBRyxDQUFDLENBQUM7QUFHakIsYUFBRyxxQkFBcUIsQUFBQyxDQUFDLFdBQVUsQ0FBQyxDQUFDOzs7O0FBOUc5QyxhQUFHLE1BQU0sRUFBSSxDQUFBLENBZ0hELElBQUcsSUFBTSxPQUFLLENBaEhLLFFBQXdDLENBQUM7QUFDaEUsZUFBSTs7O2VBZ0hNLEtBQUc7O0FBakhyQixhQUFHLFdBQVcsQUFBQyxFQUFDLENBQUE7Ozs7O2dCQW9IYyxLQUFHOzs7Ozs7Ozs7O0FBcEhqQyxhQUFHLE1BQU0sRUFBSSxDQUFBLHNCQUFrQixVQUF3QyxDQUFDO0FBQ2hFLGVBQUk7Ozs7Ozs7Ozs7QUFEWixhQUFHLE1BQU0sRUFBSSxDQUFBLHVCQUFrQixVQUF3QyxDQUFDO0FBQ2hFLGVBQUk7O3FCQW9IaUIsQ0FBQSxJQUFHLENBQUUsU0FBUSxDQUFDOzs7O0FBckgzQyxhQUFHLE1BQU0sRUFBSSxDQUFBLENBc0hHLFVBQVMsQ0F0SE0sVUFBd0MsQ0FBQztBQUNoRSxlQUFJOztBQURaLGFBQUcsTUFBTSxFQUFJLENBQUEsQ0F1SE8sQ0FBQSxRQUFRLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0F2SFQsVUFBd0MsQ0FBQztBQUNoRSxlQUFJOztlQUFvQixLQUFHO2VBQ0gsTUFBSTtlQUNKLFVBQVE7Ozs7QUFIeEMsYUFBRyxRQUFRLEFBQUMsUUFFaUIsQ0FBQzs7OztlQUY5QixLQUFLLEVBQUEsUUFFZ0MsQ0FBQSxDQXNIRCxVQUFTLENBdEhVLENBQ2xDLGVBQWMsV0FBVyxBQUFDLENBQUMsTUFBSyxTQUFTLENBQUMsQ0FBQyxBQUFDLEVBQUM7Ozs7QUFIbEUsYUFBRyxNQUFNLEVBQUksQ0FBQSxDQUlBLENBQUMsQ0FBQyxNQUFvQixDQUFBLENBQUMsTUFBb0IsQ0FBQSxTQUFxQixBQUFDLEVBQUMsQ0FBQyxLQUFLLENBQUMsQ0FKdkQsVUFBd0MsQ0FBQztBQUNoRSxlQUFJOztBQUlDLGVBQW9CLEtBQUc7Ozs7Ozs7O0FBTHBDLGFBQUcsTUFBTSxFQUFJLENBQUEsQ0F5SGUsR0FBRSxXQUFhLFNBQU8sQ0F6SG5CLFVBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUFEWixhQUFHLE1BQU0sRUFBSSxDQUFBLENBMEhtQixJQUFHLENBMUhKLFVBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUFBSixnQkFBb0IsQ0FBQSxJQUFHLGNBQWMsQUFBQyxDQUFDLEFBMEhQLEdBQUUsVUFBVSxBQUFDLENBQUMsSUFBRyxDQUFHLE9BQUssQ0FBRyxZQUFVLENBQUcsUUFBTSxDQUFDLENBMUh2QixNQUFLLFNBQVMsQ0FBQyxBQUFDLEVBQUMsQ0FBQyxDQUFDO0FBRTVFLGFBQUcsS0FBSyxFQUFJLEtBQUssRUFBQSxDQUFDO0FBRWxCLGFBQUcsT0FBTyxFQUFJLE9BQUssQ0FBQzs7OztBQUdsQixnQkFBb0IsQ0FBQSxNQUFrQixJQUFHLE9BQU8sQ0FBQyxBQUFDLENBQUMsSUFBRyxnQkFBZ0IsQ0FBQyxDQUFDOzs7O0FBUmxGLGFBQUcsTUFBTSxFQUFJLENBQUEsQ0FTQyxVQUFxQixDQVRKLFFBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUFTQSxhQUFHLEtBQUssRUFBSSxZQUFzQixDQUFDOzs7OztlQUcvQixZQUFzQjs7O2VBaUhBLElBQUU7O0FBOUh4QyxhQUFHLFdBQVcsQUFBQyxFQUFDLENBQUE7Ozs7QUFBaEIsYUFBRyxPQUFPLEFBQUMsRUFBQyxDQUFDOztBQUFiLGFBQUcsbUJBQW1CLEtBQW9CLENBQUE7OztBQUM1QixhQUFHLE9BQU8sQUFBQyxFQUFDLENBQUM7QUFDYixhQUFHLGlCQUFpQixBQUFDLEVBQUMsQ0FBQztBQUN2QixlQUFvQixDQUFBLElBQUcsZ0JBQWdCLENBQUM7Ozs7QUFJNUMsZUFBb0IsS0FBRyxDQUFDO0FBQ3hCLG9CQUFvQyxDQUFDOztBQVIvQyxhQUFHLG1CQUFtQixLQUFvQixDQUFBOzs7QUFBMUMsYUFBRyxPQUFPLEFBQUMsRUFBQyxDQUFDOzs7O0FBVUgsWUFBSTtBQUNGLGVBQUksS0FBaUIsR0FBSyxDQUFBLFdBQXVCLEdBQUssS0FBRyxDQUFHO0FBQzFELHdCQUF3QixBQUFDLEVBQUMsQ0FBQztZQUM3QjtBQUFBLFVBQ0YsQ0FBRSxPQUFRO0FBQ1Isb0JBQXdCO0FBQ3RCLHdCQUF3QjtZQUMxQjtBQUFBLFVBQ0Y7QUFBQTs7O0FBbEJWLGFBQUcsTUFBTSxFQUFJLENBQUEsQ0FtSVksVUFBUyxXQUFhLFNBQU8sQ0FuSXZCLFVBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUFEWixhQUFHLE1BQU0sRUFBSSxDQUFBLENBb0lXLElBQUcsQ0FwSUksVUFBd0MsQ0FBQztBQUNoRSxlQUFJOztBQUFKLGdCQUFvQixDQUFBLElBQUcsY0FBYyxBQUFDLENBQUMsQUFvSWYsVUFBUyxVQUFVLEFBQUMsQ0FBQyxJQUFHLENBQUcsT0FBSyxDQUFHLFlBQVUsQ0FBRyxRQUFNLENBQUMsQ0FwSXRCLE1BQUssU0FBUyxDQUFDLEFBQUMsRUFBQyxDQUFDLENBQUM7QUFFNUUsYUFBRyxLQUFLLEVBQUksS0FBSyxFQUFBLENBQUM7QUFFbEIsYUFBRyxPQUFPLEVBQUksT0FBSyxDQUFDOzs7O0FBR2xCLGdCQUFvQixDQUFBLE1BQWtCLElBQUcsT0FBTyxDQUFDLEFBQUMsQ0FBQyxJQUFHLGdCQUFnQixDQUFDLENBQUM7Ozs7QUFSbEYsYUFBRyxNQUFNLEVBQUksQ0FBQSxDQVNDLFVBQXFCLENBVEosVUFBd0MsQ0FBQztBQUNoRSxlQUFJOztBQVNBLGFBQUcsS0FBSyxFQUFJLFlBQXNCLENBQUM7Ozs7O2VBRy9CLFlBQXNCOzs7ZUEySFIsV0FBUzs7QUF4SXZDLGFBQUcsV0FBVyxBQUFDLEVBQUMsQ0FBQTs7OztBQUNNLGFBQUcsTUFBTSxFQUFJLENBQUEsSUFBRyxtQkFBbUIsQ0FBQztBQUNwQyxlQUFLOztBQUYzQixlQUFPLENBQUEsSUFBRyxJQUFJLEFBQUMsRUFBQyxDQUFBOztBQUNtQixFQUMvQixRQUE2QixLQUFHLENBQUMsQ0FBQztBQTRJdEMsQ0E5SXVELEFBOEl2RCxDQUFDO0FBSUQsT0FBTyxVQUFVLGdCQUFnQixFQUFJLFVBQVUsUUFBTyxDQUFHO0FBQ3JELE9BQU8sQ0FBQSxJQUFHLGdCQUFnQixJQUFJLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBRUQsT0FBTyxVQUFVLHFCQUFxQixFQUFJLFVBQVUsV0FBVSxDQUFHO0FBQzdELE9BQUssQUFBQyxDQUFDLENBQUMsQ0FBQyxXQUFVLENBQUMsQ0FBQztBQUNyQixLQUFJLENBQUMsSUFBRyxzQkFBc0IsQ0FBRztBQUM3QixPQUFHLG9CQUFvQixBQUFDLENBQUMsV0FBVSxDQUFDLENBQUM7QUFDckMsT0FBRyxzQkFBc0IsRUFBSSxLQUFHLENBQUM7RUFDckM7QUFBQSxBQUNKLENBQUM7QUFFRCxPQUFPLFVBQVUsb0JBQW9CLEVBQUksQ0FBQSxDQUFBLEtBQUssQ0FBQztBQUUvQyxPQUFPLFVBQVUsTUFBTSxFQUFJLFVBQVUsQUFBRDtBQUNoQyxTQUFTLFVBQVEsQ0FBRSxLQUFJLENBQUcsQ0FBQSxjQUFhO0FBQ25DLE9BQUksS0FBSSxXQUFhLFNBQU8sQ0FBRztBQUMzQixXQUFPLENBQUEsS0FBSSxNQUFNLEFBQUMsRUFBQyxDQUFDO0lBQ3hCLEtBQ0ssS0FBSSxLQUFJLFdBQWEsSUFBRSxDQUFHO0FBQzNCLEFBQUksUUFBQSxDQUFBLE1BQUssRUFBSSxJQUFJLElBQUUsQUFBQyxFQUFDLENBQUM7QUFySzFCLEFBQUksUUFBQSxPQUFvQixLQUFHLENBQUM7QUFDNUIsQUFBSSxRQUFBLE9BQW9CLE1BQUksQ0FBQztBQUM3QixBQUFJLFFBQUEsT0FBb0IsVUFBUSxDQUFDO0FBQ2pDLFFBQUk7QUFISixZQUFTLEdBQUEsT0FEakIsS0FBSyxFQUFBLEFBQzRCO0FBQ2hCLGlCQUFvQixDQUFBLENBcUtSLEtBQUksT0FBTyxBQUFDLEVBQUMsQ0FyS2EsQ0FDbEMsZUFBYyxXQUFXLEFBQUMsQ0FBQyxNQUFLLFNBQVMsQ0FBQyxDQUFDLEFBQUMsRUFBQyxDQUNyRCxFQUFDLENBQUMsTUFBb0IsQ0FBQSxDQUFDLE1BQW9CLENBQUEsU0FBcUIsQUFBQyxFQUFDLENBQUMsS0FBSyxDQUFDLENBQ3pFLE9BQW9CLEtBQUcsQ0FBRztZQWtLbEIsS0FBRztBQUFxQjtBQUM3QixpQkFBSyxJQUFJLEFBQUMsQ0FBQyxJQUFHLENBQUMsQ0FBQztVQUNwQjtRQWpLSjtBQUFBLE1BRkEsQ0FBRSxZQUEwQjtBQUMxQixhQUFvQixLQUFHLENBQUM7QUFDeEIsa0JBQW9DLENBQUM7TUFDdkMsQ0FBRSxPQUFRO0FBQ1IsVUFBSTtBQUNGLGFBQUksS0FBaUIsR0FBSyxDQUFBLFdBQXVCLEdBQUssS0FBRyxDQUFHO0FBQzFELHNCQUF3QixBQUFDLEVBQUMsQ0FBQztVQUM3QjtBQUFBLFFBQ0YsQ0FBRSxPQUFRO0FBQ1Isa0JBQXdCO0FBQ3RCLHNCQUF3QjtVQUMxQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsQUF1SkksV0FBTyxPQUFLLENBQUM7SUFDakIsS0FDSyxLQUFJLENBQUEsUUFBUSxBQUFDLENBQUMsS0FBSSxDQUFDLENBQUc7QUFDdkIsU0FBSSxjQUFhLENBQUc7QUFDaEIsQUFBSSxVQUFBLENBQUEsUUFBTyxFQUFJLEdBQUMsQ0FBQztBQTdLekIsQUFBSSxVQUFBLFFBQW9CLEtBQUcsQ0FBQztBQUM1QixBQUFJLFVBQUEsUUFBb0IsTUFBSSxDQUFDO0FBQzdCLEFBQUksVUFBQSxRQUFvQixVQUFRLENBQUM7QUFDakMsVUFBSTtBQUhKLGNBQVMsR0FBQSxRQURqQixLQUFLLEVBQUEsQUFDNEI7QUFDaEIsbUJBQW9CLENBQUEsQ0E2S0osS0FBSSxDQTdLa0IsQ0FDbEMsZUFBYyxXQUFXLEFBQUMsQ0FBQyxNQUFLLFNBQVMsQ0FBQyxDQUFDLEFBQUMsRUFBQyxDQUNyRCxFQUFDLENBQUMsT0FBb0IsQ0FBQSxDQUFDLE9BQW9CLENBQUEsU0FBcUIsQUFBQyxFQUFDLENBQUMsS0FBSyxDQUFDLENBQ3pFLFFBQW9CLEtBQUcsQ0FBRztjQTBLZCxVQUFHO0FBQVk7QUFDcEIscUJBQU8sS0FBSyxBQUFDLENBQUMsU0FBUSxBQUFDLFdBQU8sTUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6QztVQXpLUjtBQUFBLFFBRkEsQ0FBRSxhQUEwQjtBQUMxQixnQkFBb0IsS0FBRyxDQUFDO0FBQ3hCLHNCQUFvQyxDQUFDO1FBQ3ZDLENBQUUsT0FBUTtBQUNSLFlBQUk7QUFDRixlQUFJLE1BQWlCLEdBQUssQ0FBQSxXQUF1QixHQUFLLEtBQUcsQ0FBRztBQUMxRCx3QkFBd0IsQUFBQyxFQUFDLENBQUM7WUFDN0I7QUFBQSxVQUNGLENBQUUsT0FBUTtBQUNSLHFCQUF3QjtBQUN0Qix5QkFBd0I7WUFDMUI7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLEFBK0pRLGFBQU8sU0FBTyxDQUFDO01BQ25CLEtBQ0s7QUFDRCxZQUFNLElBQUksTUFBSSxBQUFDLENBQUMsd0NBQXVDLENBQUMsQ0FBQztNQUM3RDtBQUFBLElBQ0osS0FDSztBQUNELFdBQU8sTUFBSSxDQUFDO0lBQ2hCO0FBQUEsRUFDSjtBQUVBLEFBQUksSUFBQSxDQUFBLFdBQVUsRUFBSSxDQUFBLElBQUcsWUFBWSxDQUFDO0FBQ2xDLEFBQUksSUFBQSxDQUFBLE9BQU0sRUFBSSxJQUFJLFlBQVUsQUFBQyxFQUFDLENBQUM7QUFDL0IsZ0JBQWdCLEtBQUcsQ0FBRztBQUNsQixPQUFJLElBQUcsZUFBZSxBQUFDLENBQUMsR0FBRSxDQUFDLENBQUc7QUFDMUIsQUFBSSxRQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsSUFBRyxDQUFFLEdBQUUsQ0FBQyxDQUFDO0FBQ3JCLFNBQUksT0FBTSxDQUFFLEdBQUUsQ0FBQyxJQUFNLE1BQUksQ0FBRztBQUN4QixjQUFNLENBQUUsR0FBRSxDQUFDLEVBQUksQ0FBQSxTQUFRLEFBQUMsQ0FBQyxLQUFJLENBQUcsS0FBRyxDQUFDLENBQUM7TUFDekM7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEFBQ0EsT0FBTyxRQUFNLENBQUM7QUFDbEIsQ0FBQztBQUdELE9BQU8sVUFBVSxNQUFNLEVBQUksVUFBVSxXQUFVLENBQUc7QUFDOUMsQUFBSSxJQUFBLENBQUEsSUFBRyxFQUFJLEtBQUcsQ0FBQztBQUVmLEtBQUksQ0FBQyxDQUFDLFdBQVUsV0FBYSxZQUFVLENBQUMsQ0FBRztBQUN2QyxRQUFNLElBQUksTUFBSSxBQUFDLENBQUMsb0VBQW1FLENBQUMsQ0FBQztFQUN6RjtBQUFBLEFBRUksSUFBQSxDQUFBLElBQUcsRUFBSSxDQUFBLElBQUcsS0FBSyxDQUFDO0FBQ3BCLEtBQUksU0FBUSxPQUFPLEVBQUksRUFBQSxDQUFHO0FBQ3RCLE9BQUcsRUFBSSxHQUFDLENBQUM7QUFDVCxlQUFhLEVBQUEsQ0FBRyxDQUFBLENBQUEsRUFBSSxDQUFBLFNBQVEsT0FBTyxDQUFHLENBQUEsQ0FBQSxFQUFFLENBQUc7QUFDdkMsU0FBRyxLQUFLLEFBQUMsQ0FBQyxTQUFRLENBQUUsQ0FBQSxDQUFDLENBQUMsQ0FBQztJQUMzQjtBQUFBLEVBQ0o7QUFBQSxBQUVBLEtBQUcsT0FBTyxBQUFDLENBQUMsV0FBVSxDQUFHLEtBQUcsQ0FBRyxLQUFHLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBRUQsT0FBTyxVQUFVLE9BQU8sRUFBSSxVQUFVLFdBQVUsQ0FBRyxDQUFBLFNBQVEsQ0FBRyxDQUFBLElBQUcsQ0FBRztBQUNoRSxBQUFJLElBQUEsQ0FBQSxJQUFHLEVBQUksS0FBRyxDQUFDO0FBRWYsS0FBRyxFQUFJLENBQUEsSUFBRyxHQUFLLENBQUEsSUFBRyxLQUFLLENBQUEsRUFBSyxHQUFDLENBQUM7QUFFOUIsS0FBSSxDQUFDLENBQUEsUUFBUSxBQUFDLENBQUMsSUFBRyxDQUFDLENBQUc7QUFDbEIsT0FBRyxFQUFJLEVBQUMsSUFBRyxDQUFDLENBQUM7RUFDakI7QUFBQSxBQUVJLElBQUEsQ0FBQSxhQUFZLEVBQUksQ0FBQSxXQUFVLEtBQUssQUFBQyxDQUFDLElBQUcsQ0FBRyxVQUFRLENBQUMsQ0FBQztBQUNyRCxBQUFJLElBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxhQUFZLGVBQWUsQ0FBQztBQUN4QyxLQUFJLEtBQUksVUFBVSxDQUFHO0FBQ2pCLFFBQU0sSUFBSSxNQUFJLEFBQUMsQ0FBQyw4QkFBNkIsQ0FBQyxDQUFDO0VBQ25EO0FBQUEsQUFHQSxhQUFXLEFBQUMsQ0FDUixTQUFVLEFBQUQsQ0FBRztBQUNSLFFBQUksWUFBWSxBQUFDLENBQUMsUUFBTyxPQUFPLElBQUksQ0FBRyxLQUFHLENBQUcsQ0FBQSxhQUFZLE1BQU0sQ0FBQyxDQUFDO0FBQ2pFLE1BQUk7QUFDQSxTQUFHLGVBQWUsS0FBSyxBQUFDLENBQUMsYUFBWSxNQUFNLENBQUMsQ0FBQztBQUM3QyxTQUFHLElBQUksS0FBSyxBQUFDLENBQUMsYUFBWSxNQUFNLENBQUcsY0FBWSxDQUFHLEtBQUcsQ0FBQyxDQUFDO0lBQzNELENBQ0EsT0FBTyxDQUFBLENBQUc7QUFDTixTQUFHLEtBQUssQUFBQyxDQUFDLGFBQVksQ0FBRyxFQUFBLENBQUMsQ0FBQztJQUMvQjtBQUFBLEVBQ0osQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQUVELE9BQU8sVUFBVSxlQUFlLEVBQUksQ0FBQSxDQUFBLEtBQUssQ0FBQztBQUUxQyxPQUFPLFVBQVUsaUJBQWlCLEVBQUksQ0FBQSxDQUFBLEtBQUssQ0FBQztBQUU1QyxPQUFPLFVBQVUsSUFBSSxFQUFJLFVBQVUsV0FBVSxDQUFHLENBQUEsSUFBRyxDQUFHO0FBQ2xELFlBQVUsU0FBUyxTQUFTLEFBQUMsQ0FBQyxXQUFVLENBQUcsS0FBRyxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUVELE9BQU8sVUFBVSxTQUFTLEVBQUksVUFBVSxXQUFVLENBQUcsQ0FBQSxNQUFLLENBQUc7QUFDekQsS0FBRyxJQUFJLEFBQUMsQ0FBQyxXQUFVLENBQUcsQ0FBQSxRQUFPLE9BQU8sU0FBUyxDQUFHLE9BQUssQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRCxPQUFPLFVBQVUsT0FBTyxFQUFJLFVBQVUsV0FBVSxDQUFHO0FBQy9DLEtBQUcsSUFBSSxBQUFDLENBQUMsV0FBVSxDQUFHLENBQUEsUUFBTyxPQUFPLE9BQU8sQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFFRCxPQUFPLFVBQVUsS0FBSyxFQUFJLFVBQVUsV0FBVSxDQUFHO0FBQzdDLEtBQUcsSUFBSSxBQUFDLENBQUMsV0FBVSxDQUFHLENBQUEsUUFBTyxPQUFPLEtBQUssQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFRCxPQUFPLFVBQVUsS0FBSyxFQUFJLFVBQVUsV0FBVSxDQUFHLENBQUEsQ0FBQSxDQUFHO0FBQ2hELEtBQUcsSUFBSSxBQUFDLENBQUMsV0FBVSxDQUFHLENBQUEsUUFBTyxPQUFPLEtBQUssQ0FBRyxFQUFBLENBQUMsQ0FBQztBQUNsRCxDQUFDO0FBRUQsT0FBTyxVQUFVLElBQUksRUFBSSxVQUFVLFdBQVUsQ0FBRyxDQUFBLE1BQUssQ0FBRyxDQUFBLE1BQUssQ0FBRztBQUM1RCxJQUFJO0FBQ0EsT0FBRyxpQkFBaUIsS0FBSyxBQUFDLENBQUMsV0FBVSxNQUFNLENBQUcsT0FBSyxDQUFHLE9BQUssQ0FBQyxDQUFDO0VBQ2pFLENBQ0EsT0FBTyxDQUFBLENBQUc7QUFDTixBQUFJLE1BQUEsQ0FBQSxPQUFNLElBQUksaURBQWlELEVBQUMsT0FBSyxFQUFDLHdCQUF1QixFQUFDLE9BQUssRUFBQyxJQUFFLENBQUEsQ0FBQztBQUN2RyxTQUFLLEVBQUksQ0FBQSxRQUFPLE9BQU8sS0FBSyxDQUFDO0FBQzdCLFNBQUssRUFBSSxFQUFBLENBQUM7RUFDZDtBQUFBLEFBRUksSUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLFdBQVUsZUFBZSxDQUFDO0FBRXRDLEtBQUksS0FBSSxVQUFVLElBQU0sQ0FBQSxRQUFPLE9BQU8sT0FBTyxDQUFBLEVBQUssQ0FBQSxLQUFJLFVBQVUsSUFBTSxDQUFBLFFBQU8sT0FBTyxLQUFLLENBQUc7QUFFeEYsVUFBTTtFQUNWO0FBQUEsQUFFQSxNQUFJLFVBQVUsRUFBSSxPQUFLLENBQUM7QUFFeEIsQUFBSSxJQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsTUFBSyxJQUFNLENBQUEsUUFBTyxPQUFPLEtBQUssQ0FBQztBQUM1QyxBQUFJLElBQUEsQ0FBQSxXQUFVLEVBQUksQ0FBQSxXQUFVLGlCQUFpQixDQUFDO0FBQzlDLEFBQUksSUFBQSxDQUFBLFVBQVMsRUFBSSxDQUFBLFdBQVUsTUFBTSxDQUFDO0FBQ2xDLFdBQVMsT0FBTyxBQUFDLENBQUMsV0FBVSxXQUFXLE9BQU8sQ0FBQyxDQUFDO0FBQ2hELFlBQVUsRUFBSSxDQUFBLFdBQVUsS0FBSyxBQUFDLENBQUMsTUFBSyxDQUFDLENBQUM7QUFFdEMsS0FBSSxXQUFVLENBQUc7QUFDYixNQUFJO0FBQ0EsQUFBSSxRQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsV0FBVSxXQUFXLDJCQUEyQixBQUFDLENBQUMsSUFBRyxjQUFjLEFBQUMsQ0FBQyxXQUFVLENBQUMsQ0FBQyxDQUFDO0FBQy9GLFNBQUksV0FBVSxpQkFBaUIsQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFHO0FBQ3RDLGtCQUFVLHNCQUFzQixBQUFDLENBQUMsV0FBVSxDQUFHLE9BQUssQ0FBRyxPQUFLLENBQUcsT0FBSyxDQUFDLEtBQzdELEFBQUMsQ0FBQyxTQUFTLEFBQUQsQ0FBRztBQUNiLGNBQUksVUFBVSxBQUFDLENBQUMsTUFBSyxDQUFHLFdBQVMsQ0FBQyxDQUFDO1FBQ3ZDLENBQ0EsVUFBUyxDQUFBLENBQUc7QUFDUixjQUFJLFVBQVUsQUFBQyxDQUFDLE1BQUssQ0FBRyxXQUFTLENBQUMsQ0FBQztBQUNuQyxvQkFBVSxLQUFLLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUM7QUFDTixjQUFNO01BQ1Y7QUFBQSxJQUNKLENBQ0EsT0FBTyxDQUFBLENBQUc7QUFDTixnQkFBVSxLQUFLLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUN2QjtBQUFBLEVBQ0osS0FDSztBQUlELE9BQUksTUFBSyxHQUFLLENBQUEsV0FBVSwyQkFBMkIsQUFBQyxFQUFDLENBQUc7QUFFcEQsWUFBTTtJQUNWO0FBQUEsRUFDSjtBQUFBLEFBQ0EsTUFBSSxVQUFVLEFBQUMsQ0FBQyxNQUFLLENBQUcsV0FBUyxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUVELE9BQU8sVUFBVSxvQkFBb0IsRUFBSSxVQUFVLFdBQVUsQ0FBRyxDQUFBLE1BQUssQ0FBRyxDQUFBLE1BQUssQ0FBRztBQUM1RSxZQUFVLElBQUksQUFBQyxDQUFDLE1BQUssQ0FBRyxPQUFLLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRUQsT0FBTyxVQUFVLFNBQVMsRUFBSSxVQUFVLFdBQVUsQ0FBRyxDQUFBLEdBQUUsQ0FBRyxDQUFBLFdBQVU7QUFDaEUsQUFBSSxJQUFBLENBQUEsSUFBRyxFQUFJLEtBQUcsQ0FBQztBQUNmLEFBQUksSUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLFdBQVUsTUFBTSxDQUFDO0FBQzdCLEFBQUksSUFBQSxDQUFBLFdBQVUsRUFBSSxDQUFBLFdBQVUsaUJBQWlCLENBQUM7QUFDOUMsQUFBSSxJQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsV0FBVSxXQUFXLENBQUM7QUFFbkMsS0FBSSxDQUFDLFdBQVUsQ0FBRztBQUNkLGNBQVUsRUFBSSxzQkFBb0IsQ0FBQztFQUN2QztBQUFBLEFBRUksSUFBQSxDQUFBLGlCQUFnQixFQUFJLFVBQVUsT0FBTSxDQUFHLENBQUEsT0FBTSxDQUFHO0FBQ2hELGVBQVcsQUFBQyxDQUFDLFNBQVUsQUFBRCxDQUFHO0FBQ3JCLFVBQUksQ0FBRSxXQUFVLENBQUMsS0FBSyxBQUFDLENBQUMsS0FBSSxDQUFHLFlBQVUsQ0FBRyxRQUFNLENBQUcsUUFBTSxDQUFDLENBQUM7SUFDakUsQ0FBQyxDQUFDO0VBQ04sQ0FBQztBQUVELEtBQUksQ0FBQyxDQUFBLFNBQVMsQUFBQyxDQUFDLFdBQVUsQ0FBQyxDQUFHO0FBQzFCLGNBQVUsS0FBSyxBQUFDLENBQUMsR0FBSSxVQUFRLEFBQUMsQ0FBQyx3REFBdUQsQ0FBQyxDQUFDLENBQUM7QUFDekYsVUFBTTtFQUNWO0FBQUEsQUFDSSxJQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsS0FBSSxDQUFFLFdBQVUsQ0FBQyxDQUFDO0FBQzNCLEtBQUksQ0FBQyxDQUFBLFdBQVcsQUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFHO0FBQ25CLGNBQVUsS0FBSyxBQUFDLENBQUMsR0FBSSxVQUFRLEFBQUMsRUFBQyxHQUFHLEVBQUMsWUFBVSxFQUFDLHVCQUFxQixFQUFDLENBQUMsQ0FBQztBQUN0RSxVQUFNO0VBQ1Y7QUFBQSxBQUVBLEtBQUksS0FBSSxrQkFBa0IsQ0FBRztBQUN6QixRQUFJLEFBQUMsQ0FBQyx3Q0FBdUMsQ0FBRyxPQUFLLENBQUcsQ0FBQSxLQUFJLGtCQUFrQixDQUFDLENBQUM7QUFDaEYsY0FBVSxLQUFLLEFBQUMsQ0FBQyxHQUFJLENBQUEsTUFBSyw0QkFBNEIsQUFBQyxDQUFDLDJDQUEwQyxDQUFDLENBQUMsQ0FBQztBQUNyRyxVQUFNO0VBQ1Y7QUFBQSxBQUVBLE1BQUksQUFBQyxDQUFDLHlEQUF3RCxDQUFHLE9BQUssQ0FBRyxZQUFVLENBQUcsSUFBRSxDQUFDLENBQUM7QUFFMUYsQUFBSSxJQUFBLENBQUEsS0FBSSxFQUNSO0FBQ0ksT0FBRyxDQUFHLENBQUEsQ0FBQSxRQUFRLEFBQUMsQ0FBQyxHQUFFLENBQUM7QUFDbkIsVUFBTSxDQUFHLElBQUksSUFBRSxBQUFDLEVBQUM7QUFDakIsVUFBTSxDQUFHLEdBQUM7QUFDVixRQUFJLENBQUcsRUFBQTtBQUNQLFlBQVEsQ0FBRyxFQUFBO0FBQ1gsY0FBVSxDQUFHLEVBQUE7QUFDYixpQkFBYSxDQUFHLEVBQUE7QUFDaEIsa0JBQWMsQ0FBRyxLQUFHO0FBQ3BCLGtCQUFjLENBQUcsWUFBVTtBQUFBLEVBQy9CLENBQUM7QUFFRCxBQUFJLElBQUEsQ0FBQSxhQUFZLEVBQUksR0FBQyxDQUFDO0FBQ3RCLElBQUk7QUFDQSxBQUFJLE1BQUEsQ0FBQSxVQUFTLEVBQUksTUFBSSxDQUFDO0FBQ3RCLEFBQUksTUFBQSxDQUFBLEtBQUksRUFBSSxFQUFBLENBQUM7QUFDYixBQUFJLE1BQUEsQ0FBQSxZQUFXLEVBQUksVUFBVSxLQUFJLENBQUc7QUFDaEMsVUFBSSxBQUFDLENBQUMsd0JBQXVCLENBQUcsT0FBSyxDQUFHLE1BQUksQ0FBQyxDQUFDO0FBQzlDLEFBQUksUUFBQSxDQUFBLFFBQU87QUFBRyxrQkFBUSxFQUFJLEtBQUcsQ0FBQztBQUM5QixTQUFJLEtBQUksV0FBYSxTQUFPLENBQUc7QUFDM0IsZUFBTyxFQUFJLE1BQUksQ0FBQztNQUNwQixLQUNLLEtBQUksQ0FBQSxTQUFTLEFBQUMsQ0FBQyxLQUFJLENBQUMsQ0FBQSxFQUFLLENBQUEsS0FBSSxTQUFTLFdBQWEsU0FBTyxDQUFHO0FBQzlELGVBQU8sRUFBSSxDQUFBLEtBQUksU0FBUyxDQUFDO0FBQ3pCLGdCQUFRLEVBQUksQ0FBQSxDQUFBLFNBQVMsQUFBQyxDQUFDLEtBQUksVUFBVSxDQUFDLENBQUEsQ0FBSSxDQUFBLEtBQUksVUFBVSxFQUFJLEtBQUcsQ0FBQztNQUNwRTtBQUFBLEFBQ0EsU0FBSSxRQUFPLENBQUc7QUFDVixBQUFJLFVBQUEsQ0FBQSxVQUFTLEVBQUksQ0FBQSxRQUFPLGNBQWMsQUFBQyxDQUFDLFdBQVUsQ0FBQyxDQUFDO0FBQ3BELFlBQUksQUFBQyxDQUFDLCtDQUE4QyxDQUFHLE9BQUssQ0FBRyxXQUFTLENBQUMsQ0FBQztBQUMxRSxXQUFJLEtBQUksUUFBUSxJQUFJLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBRztBQUMvQixjQUFNLElBQUksQ0FBQSxNQUFLLDRCQUE0QixBQUFDLEVBQUMscUJBQXFCLEVBQUMsV0FBUyxFQUFDLCtCQUE2QixFQUFDLENBQUM7UUFDaEg7QUFBQSxBQUNBLFlBQUksQUFBQyxDQUFDLDZDQUE0QyxDQUFHLE9BQUssQ0FBQyxDQUFDO0FBQzVELG9CQUFZLEtBQUssQUFBQyxDQUFDLFdBQVUsZUFBZSxBQUFDLENBQUMsTUFBSyxDQUFHLENBQUEsV0FBVSxXQUFXLDJCQUEyQixBQUFDLENBQUMsVUFBUyxDQUFDLENBQUcsa0JBQWdCLENBQUMsQ0FBQyxDQUFDO0FBQ3hJLGVBQU8sT0FBTyxBQUFDLENBQUMsV0FBVSxDQUFHLFVBQVEsQ0FBQyxDQUFDO0FBQ3ZDLGlCQUFTLEVBQUksS0FBRyxDQUFDO0FBQ2pCLFlBQUksUUFBUSxJQUFJLEFBQUMsQ0FBQyxVQUFTLENBQUcsTUFBSSxDQUFDLENBQUM7QUFDcEMsWUFBSSxRQUFRLEtBQUssQUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFDO0FBQ3hCLFlBQUksTUFBTSxFQUFFLENBQUM7TUFDakIsS0FDSztBQUNELFlBQUksQUFBQyxDQUFDLCtCQUE4QixDQUFHLE9BQUssQ0FBQyxDQUFDO0FBQzlDLFlBQUksUUFBUSxLQUFLLEFBQUMsQ0FBQyxLQUFJLENBQUMsQ0FBQztNQUM3QjtBQUFBLElBQ0osQ0FBQztBQUNELE9BQUksS0FBSSxLQUFLLENBQUc7QUFDWixVQUFJLEFBQUMsQ0FBQyx1Q0FBc0MsQ0FBRyxPQUFLLENBQUMsQ0FBQztBQTlaMUQsQUFBSSxRQUFBLE9BQW9CLEtBQUcsQ0FBQztBQUM1QixBQUFJLFFBQUEsT0FBb0IsTUFBSSxDQUFDO0FBQzdCLEFBQUksUUFBQSxPQUFvQixVQUFRLENBQUM7QUFDakMsUUFBSTtBQUhKLFlBQVMsR0FBQSxPQURqQixLQUFLLEVBQUEsQUFDNEI7QUFDaEIsaUJBQW9CLENBQUEsQ0E4WlAsR0FBRSxDQTladUIsQ0FDbEMsZUFBYyxXQUFXLEFBQUMsQ0FBQyxNQUFLLFNBQVMsQ0FBQyxDQUFDLEFBQUMsRUFBQyxDQUNyRCxFQUFDLENBQUMsTUFBb0IsQ0FBQSxDQUFDLE1BQW9CLENBQUEsU0FBcUIsQUFBQyxFQUFDLENBQUMsS0FBSyxDQUFDLENBQ3pFLE9BQW9CLEtBQUcsQ0FBRztZQTJabEIsTUFBSTtBQUFVO0FBQ25CLHVCQUFXLEFBQUMsQ0FBQyxLQUFJLENBQUMsQ0FBQztBQUNuQixnQkFBSSxFQUFFLENBQUM7VUFDWDtRQTNaSjtBQUFBLE1BRkEsQ0FBRSxZQUEwQjtBQUMxQixhQUFvQixLQUFHLENBQUM7QUFDeEIsa0JBQW9DLENBQUM7TUFDdkMsQ0FBRSxPQUFRO0FBQ1IsVUFBSTtBQUNGLGFBQUksS0FBaUIsR0FBSyxDQUFBLFdBQXVCLEdBQUssS0FBRyxDQUFHO0FBQzFELHNCQUF3QixBQUFDLEVBQUMsQ0FBQztVQUM3QjtBQUFBLFFBQ0YsQ0FBRSxPQUFRO0FBQ1Isa0JBQXdCO0FBQ3RCLHNCQUF3QjtVQUMxQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFpWkEsS0FDSztBQUNELGlCQUFXLEFBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQztJQUNyQjtBQUFBLEFBQ0EsT0FBSSxDQUFDLFVBQVMsQ0FBRztBQUNiLFVBQUksQUFBQyxDQUFDLDhFQUE2RSxDQUFHLE9BQUssQ0FBQyxDQUFDO0FBQzdGLEFBQUksUUFBQSxDQUFBLE1BQUssRUFBSSxDQUFBLEtBQUksS0FBSyxFQUFJLENBQUEsS0FBSSxRQUFRLEVBQUksQ0FBQSxLQUFJLFFBQVEsQ0FBRSxDQUFBLENBQUMsQ0FBQztBQUMxRCxzQkFBZ0IsQUFBQyxDQUFDLFFBQU8sT0FBTyxTQUFTLENBQUcsT0FBSyxDQUFDLENBQUM7SUFDdkQsS0FDSztBQUNELFVBQUksQUFBQyxDQUFDLCtEQUE4RCxDQUFHLE9BQUssQ0FBRyxDQUFBLEtBQUksUUFBUSxLQUFLLENBQUMsQ0FBQztBQUNsRyxBQUFJLFFBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxXQUFVLFdBQVcsZ0NBQWdDLEFBQUMsQ0FBQyxNQUFLLENBQUMsQ0FBQztBQUMxRSxrQkFBWSxLQUFLLEFBQUMsQ0FBQyxXQUFVLGVBQWUsQUFBQyxDQUFDLE1BQUssQ0FBRyxNQUFJLENBQUcsWUFBVSxDQUFDLENBQUMsQ0FBQztBQUMxRSxVQUFJLGdCQUFnQixFQUFJLE1BQUksQ0FBQztBQUM3QixVQUFJLGtCQUFrQixFQUFJLE1BQUksQ0FBQztJQUNuQztBQUFBLEFBQ0EsUUFBSSxPQUFPLEFBQUMsQ0FBQyxXQUFVLFdBQVcsT0FBTyxDQUFDLENBQUM7RUFDL0MsQ0FDQSxPQUFPLENBQUEsQ0FBRztBQUNOLFFBQUksQUFBQyxDQUFDLGdDQUErQixDQUFHLE9BQUssQ0FBRyxDQUFBLENBQUEsTUFBTSxDQUFDLENBQUM7QUFDeEQsT0FBSSxhQUFZLE9BQU8sQ0FBRztBQUN0QixVQUFJLEFBQUMsQ0FBQywrQkFBOEIsQ0FBRyxPQUFLLENBQUcsY0FBWSxDQUFDLENBQUM7QUFDN0QsZ0JBQVUsY0FBYyxBQUFDLENBQUMsYUFBWSxDQUFDLENBQUM7SUFDNUM7QUFBQSxBQUNBLFFBQUksT0FBTyxBQUFDLENBQUMsbUJBQWtCLENBQUMsQ0FBQztBQUNqQyxRQUFJLEFBQUMsQ0FBQywyQ0FBMEMsQ0FBRyxPQUFLLENBQUMsQ0FBQztBQUMxRCxvQkFBZ0IsQUFBQyxDQUFDLFFBQU8sT0FBTyxLQUFLLENBQUcsRUFBQSxDQUFDLENBQUM7RUFDOUMsQ0FDQSxPQUFRO0FBQ0osUUFBSSxBQUFDLENBQUMsOENBQTZDLENBQUcsT0FBSyxDQUFHLENBQUEsS0FBSSxRQUFRLEtBQUssQ0FBRyxDQUFBLEtBQUksTUFBTSxDQUFDLENBQUM7RUFDbEc7QUFBQSxBQUNKLENBQUM7QUFFRCxPQUFPLFVBQVUsZ0JBQWdCLEVBQUksVUFBVSxXQUFVLENBQUcsQ0FBQSxNQUFLLENBQUcsQ0FBQSxNQUFLLENBQUcsQ0FBQSxRQUFPO0FBQy9FLEFBQUksSUFBQSxDQUFBLE1BQUssRUFBSSxDQUFBLFdBQVUsV0FBVyxDQUFDO0FBQ25DLEFBQUksSUFBQSxDQUFBLFdBQVUsRUFBSSxDQUFBLFdBQVUsaUJBQWlCLENBQUM7QUFDOUMsQUFBSSxJQUFBLENBQUEsT0FBTSxFQUFJLENBQUEsV0FBVSxVQUFVLEFBQUMsQ0FBQyxRQUFPLEtBQUssQ0FBQyxDQUFDO0FBQ2xELE1BQUksQUFBQyxDQUFDLHlGQUF3RixDQUFHLE9BQUssQ0FBRyxRQUFNLENBQUcsT0FBSyxDQUFHLE9BQUssQ0FBRyxTQUFPLENBQUMsQ0FBQztBQUUzSSxBQUFJLElBQUEsQ0FBQSxRQUFPLEVBQUksS0FBRyxDQUFDO0FBQ25CLEFBQUksSUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLElBQUcsa0JBQWtCLENBQUM7QUFDbEMsQUFBSSxJQUFBLENBQUEsSUFBRyxFQUFJLE1BQUksQ0FBQztBQUNoQixJQUFJO0FBQ0EsT0FBSSxDQUFDLENBQUEsU0FBUyxBQUFDLENBQUMsS0FBSSxDQUFDLENBQUc7QUFDcEIsVUFBTSxJQUFJLENBQUEsTUFBSyw0QkFBNEIsQUFBQyxDQUFDLGlDQUFnQyxFQUFJLE1BQUksQ0FBQSxDQUFJLEtBQUcsQ0FBQyxDQUFDO0lBQ2xHO0FBQUEsQUFDSSxNQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsS0FBSSxRQUFRLElBQUksQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQ3RDLE9BQUksQ0FBQSxZQUFZLEFBQUMsQ0FBQyxLQUFJLENBQUMsQ0FBRztBQUN0QixVQUFNLElBQUksQ0FBQSxNQUFLLDRCQUE0QixBQUFDLEVBQUMscUJBQXFCLEVBQUMsUUFBTSxFQUFDLHlDQUF1QyxFQUFDLENBQUM7SUFDdkg7QUFBQSxBQUVBLFFBQUksQUFBQyxDQUFDLHVDQUFzQyxDQUFHLE9BQUssQ0FBRyxRQUFNLENBQUMsQ0FBQztBQUUvRCxXQUFRLE1BQUs7QUFDVCxTQUFLLENBQUEsUUFBTyxPQUFPLFNBQVM7QUFDeEIsWUFBSSxBQUFDLENBQUMscUNBQW9DLENBQUcsT0FBSyxDQUFHLE1BQUksQ0FBRyxPQUFLLENBQUMsQ0FBQztBQUNuRSxZQUFJLFFBQVEsQ0FBRSxLQUFJLENBQUMsRUFBSSxPQUFLLENBQUM7QUFDN0IsWUFBSSxBQUFDLENBQUMsNkJBQTRCLENBQUcsT0FBSyxDQUFDLENBQUM7QUFDNUMsWUFBSSxRQUFRLE9BQU8sQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQzdCLFlBQUksZUFBZSxFQUFFLENBQUM7QUFDdEIsYUFBSztBQUFBLEFBQ1QsU0FBSyxDQUFBLFFBQU8sT0FBTyxLQUFLO0FBQ3BCLFlBQUksQUFBQyxDQUFDLHFCQUFvQixDQUFHLE9BQUssQ0FBRyxDQUFBLE1BQUssTUFBTSxDQUFDLENBQUM7QUFDbEQsV0FBRyxFQUFJLEtBQUcsQ0FBQztBQUNYLFlBQUksUUFBUSxPQUFPLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQztBQUM3QixhQUFLO0FBQUEsQUFDVCxTQUFLLENBQUEsUUFBTyxPQUFPLE9BQU87QUFDdEIsWUFBSSxBQUFDLENBQUMsa0NBQWlDLENBQUcsT0FBSyxDQUFDLENBQUM7QUFDakQsWUFBSSxZQUFZLEVBQUUsQ0FBQztBQUNuQixZQUFJLEFBQUMsQ0FBQyw2QkFBNEIsQ0FBRyxPQUFLLENBQUMsQ0FBQztBQUM1QyxZQUFJLFFBQVEsT0FBTyxBQUFDLENBQUMsT0FBTSxDQUFDLENBQUM7QUFDN0IsYUFBSztBQUFBLEFBQ1QsU0FBSyxDQUFBLFFBQU8sT0FBTyxLQUFLO0FBQ3BCLFlBQUksQUFBQyxDQUFDLGdDQUErQixDQUFHLE9BQUssQ0FBQyxDQUFDO0FBQy9DLFlBQUksVUFBVSxFQUFFLENBQUM7QUFDakIsYUFBSztBQUFBLEFBQ1Q7QUFDSSxZQUFNLElBQUksQ0FBQSxNQUFLLDRCQUE0QixBQUFDLEVBQUMsd0NBQXdDLEVBQUMsT0FBSyxFQUFDLEtBQUcsRUFBQyxDQUFDO0FBRDlGLElBRVg7QUFFQSxRQUFJLEFBQUMsQ0FBQyx5SEFBd0gsQ0FDMUgsT0FBSyxDQUNMLENBQUEsS0FBSSxNQUFNLENBQ1YsQ0FBQSxLQUFJLFFBQVEsS0FBSyxDQUNqQixDQUFBLEtBQUksZUFBZSxDQUNuQixDQUFBLEtBQUksWUFBWSxDQUNoQixDQUFBLEtBQUksVUFBVSxDQUFDLENBQUM7QUFFcEIsQUFBSSxNQUFBLENBQUEsbUJBQWtCLEVBQUksQ0FBQSxDQUFDLFdBQVUsU0FBUyxXQUFXLENBQUEsRUFBSyxDQUFBLE1BQUssSUFBTSxDQUFBLFFBQU8sT0FBTyxLQUFLLENBQUM7QUFDN0YsT0FBSSxtQkFBa0IsR0FBSyxLQUFHLENBQUc7QUFDN0IsU0FBSSxDQUFDLElBQUcsQ0FBRztBQUNQLFlBQUksQUFBQyxDQUFDLDJGQUEwRixDQUFHLE9BQUssQ0FBQyxDQUFDO01BQzlHLEtBQ0s7QUFDRCxZQUFJLEFBQUMsQ0FBQywyREFBMEQsQ0FBRyxPQUFLLENBQUMsQ0FBQztNQUM5RTtBQUFBLEFBQ0EsVUFBSSxBQUFDLENBQUMsaURBQWdELENBQUcsT0FBSyxDQUFHLENBQUEsS0FBSSxRQUFRLEtBQUssQ0FBQyxDQUFDO0FBQ3BGLEFBQUksUUFBQSxDQUFBLEdBQUUsRUFBSSxHQUFDLENBQUM7QUFwZ0JoQixBQUFJLFFBQUEsT0FBb0IsS0FBRyxDQUFDO0FBQzVCLEFBQUksUUFBQSxPQUFvQixNQUFJLENBQUM7QUFDN0IsQUFBSSxRQUFBLE9BQW9CLFVBQVEsQ0FBQztBQUNqQyxRQUFJO0FBSEosWUFBUyxHQUFBLE9BRGpCLEtBQUssRUFBQSxBQUM0QjtBQUNoQixpQkFBb0IsQ0FBQSxDQW9nQlYsS0FBSSxRQUFRLEtBQUssQUFBQyxFQUFDLENBcGdCUyxDQUNsQyxlQUFjLFdBQVcsQUFBQyxDQUFDLE1BQUssU0FBUyxDQUFDLENBQUMsQUFBQyxFQUFDLENBQ3JELEVBQUMsQ0FBQyxNQUFvQixDQUFBLENBQUMsTUFBb0IsQ0FBQSxTQUFxQixBQUFDLEVBQUMsQ0FBQyxLQUFLLENBQUMsQ0FDekUsT0FBb0IsS0FBRyxDQUFHO1lBaWdCbEIsR0FBQztBQUEyQjtBQUNqQyxjQUFFLEtBQUssQUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0FBQ1osZ0JBQUksQUFBQyxDQUFDLG9DQUFtQyxDQUFHLE9BQUssQ0FBRyxHQUFDLENBQUMsQ0FBQztBQUN2RCxzQkFBVSxzQkFBc0IsQUFBQyxDQUFDLFdBQVUsQ0FBRyxHQUFDLENBQUMsQ0FBQztBQUNsRCxBQUFJLGNBQUEsQ0FBQSxPQUFNLEVBQUksQ0FBQSxXQUFVLFdBQVcsMkJBQTJCLEFBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUNuRSxnQkFBSSxBQUFDLENBQUMsMkNBQTBDLENBQUcsT0FBSyxDQUFHLFFBQU0sQ0FBQyxDQUFDO0FBQ25FLHNCQUFVLGVBQWUsQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO1VBQ3ZDO1FBcmdCSjtBQUFBLE1BRkEsQ0FBRSxZQUEwQjtBQUMxQixhQUFvQixLQUFHLENBQUM7QUFDeEIsa0JBQW9DLENBQUM7TUFDdkMsQ0FBRSxPQUFRO0FBQ1IsVUFBSTtBQUNGLGFBQUksS0FBaUIsR0FBSyxDQUFBLFdBQXVCLEdBQUssS0FBRyxDQUFHO0FBQzFELHNCQUF3QixBQUFDLEVBQUMsQ0FBQztVQUM3QjtBQUFBLFFBQ0YsQ0FBRSxPQUFRO0FBQ1Isa0JBQXdCO0FBQ3RCLHNCQUF3QjtVQUMxQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsQUEyZkksZ0JBQVUsZ0JBQWdCLEFBQUMsQ0FBQyxJQUFHLENBQUcsSUFBRSxDQUFDLENBQUM7QUFDdEMsVUFBSSxBQUFDLENBQUMsOEJBQTZCLENBQUcsT0FBSyxDQUFHLElBQUUsQ0FBQyxDQUFDO0FBQ2xELFVBQUksQUFBQyxDQUFDLG9EQUFtRCxDQUFHLE9BQUssQ0FBRyxPQUFLLENBQUcsT0FBSyxDQUFDLENBQUM7QUFDbkYsYUFBTyxFQUFJLFVBQVUsQUFBRCxDQUFHO0FBQUUsa0JBQVUsc0JBQXNCLEFBQUMsQ0FBQyxXQUFVLENBQUcsQ0FBQSxLQUFJLGdCQUFnQixDQUFHLE9BQUssQ0FBRyxPQUFLLENBQUMsQ0FBQztNQUFFLENBQUM7SUFDckgsS0FDSztBQUNELFdBQUssQUFBQyxDQUFDLENBQUMsSUFBRyxDQUFDLENBQUM7QUFDYixBQUFJLFFBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxDQUFDLEtBQUksUUFBUSxLQUFLLEVBQUksQ0FBQSxLQUFJLFVBQVUsQ0FBQyxJQUFNLEVBQUEsQ0FBQztBQUN4RCxTQUFJLEtBQUksQ0FBRztBQUNQLFlBQUksQUFBQyxDQUFDLGdGQUErRSxDQUFHLE9BQUssQ0FBRyxvQkFBa0IsQ0FBQyxDQUFDO0FBQ3BILFdBQUksS0FBSSxZQUFZLENBQUc7QUFDbkIsY0FBSSxBQUFDLENBQUMsNERBQTJELENBQUcsT0FBSyxDQUFDLENBQUM7QUFDM0UsaUJBQU8sRUFBSSxVQUFVLEFBQUQsQ0FBRztBQUFFLHNCQUFVLHNCQUFzQixBQUFDLENBQUMsV0FBVSxDQUFHLENBQUEsS0FBSSxnQkFBZ0IsQ0FBRyxDQUFBLFFBQU8sT0FBTyxPQUFPLENBQUMsQ0FBQztVQUFFLENBQUM7UUFDN0gsS0FDSyxLQUFJLEtBQUksVUFBVSxDQUFHO0FBQ3RCLGNBQUksQUFBQyxDQUFDLDREQUEyRCxDQUFHLE9BQUssQ0FBQyxDQUFDO0FBQzNFLGNBQUksVUFBVSxFQUFFLENBQUM7QUFDakIsb0JBQVUsc0JBQXNCLEFBQUMsQ0FBQyxXQUFVLENBQUcsQ0FBQSxLQUFJLGdCQUFnQixDQUFHLENBQUEsUUFBTyxPQUFPLEtBQUssQ0FBQyxDQUFDO1FBQy9GLEtBQ0s7QUFDRCxlQUFLLEVBQUksQ0FBQSxLQUFJLEtBQUssRUFBSSxDQUFBLEtBQUksUUFBUSxFQUFJLENBQUEsS0FBSSxRQUFRLENBQUUsQ0FBQSxDQUFDLENBQUM7QUFDdEQsY0FBSSxBQUFDLENBQUMscUZBQW9GLENBQUcsT0FBSyxDQUFHLE9BQUssQ0FBQyxDQUFDO0FBQzVHLGlCQUFPLEVBQUksVUFBVSxBQUFELENBQUc7QUFBRSxzQkFBVSxzQkFBc0IsQUFBQyxDQUFDLFdBQVUsQ0FBRyxDQUFBLEtBQUksZ0JBQWdCLENBQUcsQ0FBQSxRQUFPLE9BQU8sU0FBUyxDQUFHLE9BQUssQ0FBQyxDQUFDO1VBQUUsQ0FBQztRQUN2STtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSixDQUNBLE9BQU8sQ0FBQSxDQUFHO0FBQ04sY0FBVSxLQUFLLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUNuQixPQUFHLE9BQU8sQUFBQyxDQUFDLG1CQUFrQixDQUFDLENBQUM7RUFDcEMsQ0FDQSxPQUFRO0FBQ0osT0FBSSxRQUFPLENBQUc7QUFDVixVQUFJLEFBQUMsQ0FBQyx5Q0FBd0MsQ0FBRyxPQUFLLENBQUMsQ0FBQztBQUN4RCxTQUFHLE9BQU8sQUFBQyxDQUFDLG1CQUFrQixDQUFDLENBQUM7QUFFaEMsYUFBTyxBQUFDLEVBQUMsQ0FBQztJQUNkO0FBQUEsRUFDSjtBQUFBLEFBQ0osQ0FBQztBQUlELE9BQU8sVUFBVSxjQUFjLEVBQUksVUFBVSxBQUFELENBQUc7QUFDM0MsQUFBSSxJQUFBLENBQUEsSUFBRyxFQUFJLEtBQUcsQ0FBQztBQUNmLEtBQUksQ0FBQyxJQUFHLFdBQVcsQ0FBQSxFQUFLLEVBQUMsSUFBRyxzQkFBc0IsQ0FBRztBQUNqRCxPQUFHLFdBQVcsRUFBSSxHQUFDLENBQUM7QUFDcEIsa0JBQWdCLEtBQUcsQ0FBRztBQUNsQixTQUFJLENBQUMsSUFBRyxvQkFBb0IsSUFBSSxBQUFDLENBQUMsR0FBRSxDQUFDLENBQUEsRUFBSyxFQUFDLENBQUEsWUFBWSxBQUFDLENBQUMsUUFBTyxVQUFVLENBQUUsR0FBRSxDQUFDLENBQUMsQ0FBQSxFQUFLLENBQUEsR0FBRSxJQUFNLHNCQUFvQixDQUFBLEVBQUssQ0FBQSxHQUFFLElBQU0sb0JBQWtCLENBQUMsQ0FBRztBQUNoSixXQUFHLFdBQVcsS0FBSyxBQUFDLENBQUMsR0FBRSxDQUFDLENBQUM7TUFDN0I7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEFBQ0EsT0FBTyxDQUFBLElBQUcsV0FBVyxDQUFDO0FBQzFCLENBQUM7QUFFRCxPQUFPLFVBQVUsZ0JBQWdCLEVBQUksVUFBVSxBQUFEO0FBQzFDLEtBQUksQ0FBQyxJQUFHLHNCQUFzQixDQUFHO0FBQzdCLFFBQU0sSUFBSSxDQUFBLE1BQUsscUJBQXFCLEFBQUMsQ0FBQyw0REFBMkQsQ0FBQyxDQUFDO0VBQ3ZHO0FBQUEsQUFFQSxLQUFJLElBQUcscUJBQXFCLElBQU0sS0FBRyxDQUFHO0FBQ3BDLEFBQUksTUFBQSxDQUFBLEtBQUksRUFBSSxLQUFHLENBQUM7QUFDaEIsQUFBSSxNQUFBLENBQUEsR0FBRSxFQUFJLFdBQVMsQ0FBQztBQTVrQnBCLEFBQUksTUFBQSxPQUFvQixLQUFHLENBQUM7QUFDNUIsQUFBSSxNQUFBLE9BQW9CLE1BQUksQ0FBQztBQUM3QixBQUFJLE1BQUEsT0FBb0IsVUFBUSxDQUFDO0FBQ2pDLE1BQUk7QUFISixVQUFTLEdBQUEsT0FEakIsS0FBSyxFQUFBLEFBQzRCO0FBQ2hCLGVBQW9CLENBQUEsQ0E0a0JQLElBQUcsY0FBYyxBQUFDLEVBQUMsQ0E1a0JNLENBQ2xDLGVBQWMsV0FBVyxBQUFDLENBQUMsTUFBSyxTQUFTLENBQUMsQ0FBQyxBQUFDLEVBQUMsQ0FDckQsRUFBQyxDQUFDLE1BQW9CLENBQUEsQ0FBQyxNQUFvQixDQUFBLFNBQXFCLEFBQUMsRUFBQyxDQUFDLEtBQUssQ0FBQyxDQUN6RSxPQUFvQixLQUFHLENBQUc7VUF5a0J0QixVQUFRO0FBQTJCO0FBQ3hDLGFBQUksS0FBSSxDQUFHO0FBQ1AsZ0JBQUksRUFBSSxNQUFJLENBQUM7VUFDakIsS0FDSztBQUNELGNBQUUsR0FBSyxNQUFJLENBQUM7VUFDaEI7QUFBQSxBQUNBLGFBQUksQ0FBQSxjQUFjLEFBQUMsQ0FBQyxJQUFHLENBQUUsU0FBUSxDQUFDLENBQUMsQ0FBRztBQUNsQyxjQUFFLEdBQUssQ0FBQSxTQUFRLEVBQUksY0FBWSxDQUFBLENBQUksVUFBUSxDQUFBLENBQUksVUFBUSxDQUFDO1VBQzVELEtBQ0ssS0FBSSxDQUFBLFFBQVEsQUFBQyxDQUFDLElBQUcsQ0FBRSxTQUFRLENBQUMsQ0FBQyxDQUFHO0FBQ2pDLGNBQUUsR0FBSyxDQUFBLFNBQVEsRUFBSSxNQUFJLENBQUEsQ0FBSSxVQUFRLENBQUEsQ0FBSSxZQUFVLENBQUM7VUFDdEQsS0FDSztBQUNELGNBQUUsR0FBSyxDQUFBLFNBQVEsRUFBSSxNQUFJLENBQUEsQ0FBSSxVQUFRLENBQUM7VUFDeEM7QUFBQSxRQUNKO01BdGxCQTtBQUFBLElBRkEsQ0FBRSxZQUEwQjtBQUMxQixXQUFvQixLQUFHLENBQUM7QUFDeEIsZ0JBQW9DLENBQUM7SUFDdkMsQ0FBRSxPQUFRO0FBQ1IsUUFBSTtBQUNGLFdBQUksS0FBaUIsR0FBSyxDQUFBLFdBQXVCLEdBQUssS0FBRyxDQUFHO0FBQzFELG9CQUF3QixBQUFDLEVBQUMsQ0FBQztRQUM3QjtBQUFBLE1BQ0YsQ0FBRSxPQUFRO0FBQ1IsZ0JBQXdCO0FBQ3RCLG9CQUF3QjtRQUMxQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsQUE0a0JBLE1BQUUsR0FBSyxJQUFFLENBQUM7QUFFVixNQUFJO0FBQ0EsU0FBRyxxQkFBcUIsRUFBSSxJQUFJLFNBQU8sQUFBQyxDQUFDLEtBQUksQ0FBRyxJQUFFLENBQUMsQ0FBQztJQUN4RCxDQUNBLE9BQU8sQ0FBQSxDQUFHO0FBQ04sVUFBSSxBQUFDLENBQUMsZ0NBQStCLENBQUcsSUFBRSxDQUFDLENBQUM7QUFDNUMsVUFBTSxFQUFBLENBQUM7SUFDWDtBQUFBLEVBQ0o7QUFBQSxBQUVBLE9BQU8sQ0FBQSxJQUFHLHFCQUFxQixBQUFDLENBQUMsSUFBRyxDQUFHLEVBQUEsQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFHRCxPQUFPLE9BQU8sRUFBSSxDQUFBLEtBQUksZUFBZSxDQUFDO0FBRXRDLEtBQUssUUFBUSxFQUFJLFNBQU8sQ0FBQztBQUN6QiIsImZpbGUiOiJhY3Rpdml0aWVzL2FjdGl2aXR5LmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyIvKmpzaGludCAtVzA1NCAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxubGV0IGd1aWRzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9ndWlkc1wiKTtcbmxldCBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcbmxldCBlbnVtcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZW51bXNcIik7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgc3BlY1N0cmluZ3MgPSByZXF1aXJlKFwiLi4vY29tbW9uL3NwZWNTdHJpbmdzXCIpO1xubGV0IHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcbmxldCBpcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vaXNcIik7XG5sZXQgQ2FsbENvbnRleHQgPSByZXF1aXJlKFwiLi9jYWxsQ29udGV4dFwiKTtcbmxldCB1dWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG5sZXQgYXN5bmMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2FzeW5jSGVscGVyc1wiKS5hc3luYztcbmxldCBhc3NlcnQgPSByZXF1aXJlKFwiYmV0dGVyLWFzc2VydFwiKTtcbmxldCBkZWJ1ZyA9IHJlcXVpcmUoXCJkZWJ1Z1wiKShcIndmNG5vZGU6QWN0aXZpdHlcIik7XG5sZXQgY29tbW9uID0gcmVxdWlyZShcIi4uL2NvbW1vblwiKTtcbmxldCBTaW1wbGVQcm94eSA9IGNvbW1vbi5TaW1wbGVQcm94eTtcblxuZnVuY3Rpb24gQWN0aXZpdHkoKSB7XG4gICAgdGhpcy5hcmdzID0gbnVsbDtcbiAgICB0aGlzLmRpc3BsYXlOYW1lID0gbnVsbDtcbiAgICB0aGlzLmlkID0gdXVpZC52NCgpO1xuICAgIHRoaXMuX3N0cnVjdHVyZUluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5fc2NvcGVLZXlzID0gbnVsbDtcbiAgICB0aGlzW1wiQHJlcXVpcmVcIl0gPSBudWxsO1xuXG4gICAgLy8gUHJvcGVydGllcyBub3Qgc2VyaWFsaXplZDpcbiAgICB0aGlzLm5vblNlcmlhbGl6ZWRQcm9wZXJ0aWVzID0gbmV3IFNldCgpO1xuXG4gICAgLy8gUHJvcGVydGllcyBhcmUgbm90IGdvaW5nIHRvIGNvcGllZCBpbiB0aGUgc2NvcGU6XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzID0gbmV3IFNldCgpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJub25TY29wZWRQcm9wZXJ0aWVzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJub25TZXJpYWxpemVkUHJvcGVydGllc1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiYXJyYXlQcm9wZXJ0aWVzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJhY3Rpdml0eVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiaWRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImFyZ3NcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImRpc3BsYXlOYW1lXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjb21wbGV0ZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY2FuY2VsXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJpZGxlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJmYWlsXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJlbmRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInNjaGVkdWxlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjcmVhdGVCb29rbWFya1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwicmVzdW1lQm9va21hcmtcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInJlc3VsdENvbGxlY3RlZFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY29kZVByb3BlcnRpZXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImluaXRpYWxpemVTdHJ1Y3R1cmVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl9pbml0aWFsaXplU3RydWN0dXJlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfc3RydWN0dXJlSW5pdGlhbGl6ZWRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImNsb25lXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfc2NvcGVLZXlzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfY3JlYXRlU2NvcGVQYXJ0SW1wbFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiQHJlcXVpcmVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImluaXRpYWxpemVFeGVjXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJ1bkluaXRpYWxpemVFeGVjXCIpO1xuXG4gICAgdGhpcy5jb2RlUHJvcGVydGllcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLmFycmF5UHJvcGVydGllcyA9IG5ldyBTZXQoW1wiYXJnc1wiXSk7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEFjdGl2aXR5LnByb3RvdHlwZSwge1xuICAgIF9zY29wZUtleXM6IHtcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgX2NyZWF0ZVNjb3BlUGFydEltcGw6IHtcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgY29sbGVjdEFsbDoge1xuICAgICAgICB2YWx1ZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH1cbn0pO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuZ2V0SW5zdGFuY2VJZCA9IGZ1bmN0aW9uIChleGVjQ29udGV4dCkge1xuICAgIHJldHVybiBleGVjQ29udGV4dC5nZXRJbnN0YW5jZUlkKHRoaXMpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy5kaXNwbGF5TmFtZSA/ICh0aGlzLmRpc3BsYXlOYW1lICsgXCIgXCIpIDogXCJcIikgKyBcIihcIiArIHRoaXMuY29uc3RydWN0b3IubmFtZSArIFwiOlwiICsgdGhpcy5pZCArIFwiKVwiO1xufTtcblxuLyogZm9yRWFjaCAqL1xuQWN0aXZpdHkucHJvdG90eXBlLmFsbCA9IGZ1bmN0aW9uKiAoZXhlY0NvbnRleHQpIHtcbiAgICB5aWVsZCAqIHRoaXMuX2NoaWxkcmVuKHRydWUsIG51bGwsIGV4ZWNDb250ZXh0LCBudWxsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5jaGlsZHJlbiA9IGZ1bmN0aW9uKiAoZXhlY0NvbnRleHQpIHtcbiAgICB5aWVsZCAqIHRoaXMuX2NoaWxkcmVuKHRydWUsIHRoaXMsIGV4ZWNDb250ZXh0LCBudWxsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pbW1lZGlhdGVDaGlsZHJlbiA9IGZ1bmN0aW9uKiAoZXhlY0NvbnRleHQpIHtcbiAgICB5aWVsZCAqIHRoaXMuX2NoaWxkcmVuKGZhbHNlLCB0aGlzLCBleGVjQ29udGV4dCk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX2NoaWxkcmVuID0gZnVuY3Rpb24qIChkZWVwLCBleGNlcHQsIGV4ZWNDb250ZXh0LCB2aXNpdGVkKSB7XG4gICAgYXNzZXJ0KGV4ZWNDb250ZXh0IGluc3RhbmNlb2YgcmVxdWlyZShcIi4vYWN0aXZpdHlFeGVjdXRpb25Db250ZXh0XCIpLCBcIkNhbm5vdCBlbnVtZXJhdGUgYWN0aXZpdGllcyB3aXRob3V0IGFuIGV4ZWN1dGlvbiBjb250ZXh0LlwiKTtcbiAgICB2aXNpdGVkID0gdmlzaXRlZCB8fCBuZXcgU2V0KCk7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmICghdmlzaXRlZC5oYXMoc2VsZikpIHtcbiAgICAgICAgdmlzaXRlZC5hZGQoc2VsZik7XG5cbiAgICAgICAgLy8gRW5zdXJlIGl0J3Mgc3RydWN0dXJlIGNyZWF0ZWQ6XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVTdHJ1Y3R1cmUoZXhlY0NvbnRleHQpO1xuXG4gICAgICAgIGlmIChzZWxmICE9PSBleGNlcHQpIHtcbiAgICAgICAgICAgIHlpZWxkIHNlbGY7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgaW4gc2VsZikge1xuICAgICAgICAgICAgbGV0IGZpZWxkVmFsdWUgPSBzZWxmW2ZpZWxkTmFtZV07XG4gICAgICAgICAgICBpZiAoZmllbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLmlzQXJyYXkoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkICogb2JqLl9jaGlsZHJlbihkZWVwLCBleGNlcHQsIGV4ZWNDb250ZXh0LCB2aXNpdGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIG9iajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmllbGRWYWx1ZSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCAqIGZpZWxkVmFsdWUuX2NoaWxkcmVuKGRlZXAsIGV4Y2VwdCwgZXhlY0NvbnRleHQsIHZpc2l0ZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG4vKiBmb3JFYWNoICovXG5cbi8qIFN0cnVjdHVyZSAqL1xuQWN0aXZpdHkucHJvdG90eXBlLmlzQXJyYXlQcm9wZXJ0eSA9IGZ1bmN0aW9uIChwcm9wTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmFycmF5UHJvcGVydGllcy5oYXMocHJvcE5hbWUpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLl9pbml0aWFsaXplU3RydWN0dXJlID0gZnVuY3Rpb24gKGV4ZWNDb250ZXh0KSB7XG4gICAgYXNzZXJ0KCEhZXhlY0NvbnRleHQpO1xuICAgIGlmICghdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplU3RydWN0dXJlKGV4ZWNDb250ZXh0KTtcbiAgICAgICAgdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pbml0aWFsaXplU3RydWN0dXJlID0gXy5ub29wO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gbWFrZUNsb25lKHZhbHVlLCBjYW5DbG9uZUFycmF5cykge1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIGxldCBuZXdTZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpdGVtIG9mIHZhbHVlLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgbmV3U2V0LmFkZChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXdTZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKGNhbkNsb25lQXJyYXlzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld0FycmF5ID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdBcnJheS5wdXNoKG1ha2VDbG9uZShpdGVtLCBmYWxzZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY2xvbmUgYWN0aXZpdHkncyBuZXN0ZWQgYXJyYXlzLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCBDb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG4gICAgbGV0IG5ld0luc3QgPSBuZXcgQ29uc3RydWN0b3IoKTtcbiAgICBmb3IgKGxldCBrZXkgaW4gdGhpcykge1xuICAgICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzW2tleV07XG4gICAgICAgICAgICBpZiAobmV3SW5zdFtrZXldICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIG5ld0luc3Rba2V5XSA9IG1ha2VDbG9uZSh2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0luc3Q7XG59O1xuXG4vKiBSVU4gKi9cbkFjdGl2aXR5LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgIGlmICghKGNhbGxDb250ZXh0IGluc3RhbmNlb2YgQ2FsbENvbnRleHQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50ICdjb250ZXh0JyBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LlwiKTtcbiAgICB9XG5cbiAgICBsZXQgYXJncyA9IHNlbGYuYXJncztcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgYXJncyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9zdGFydChjYWxsQ29udGV4dCwgbnVsbCwgYXJncyk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX3N0YXJ0ID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCB2YXJpYWJsZXMsIGFyZ3MpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBhcmdzID0gYXJncyB8fCBzZWxmLmFyZ3MgfHwgW107XG5cbiAgICBpZiAoIV8uaXNBcnJheShhcmdzKSkge1xuICAgICAgICBhcmdzID0gW2FyZ3NdO1xuICAgIH1cblxuICAgIGxldCBteUNhbGxDb250ZXh0ID0gY2FsbENvbnRleHQubmV4dChzZWxmLCB2YXJpYWJsZXMpO1xuICAgIGxldCBzdGF0ZSA9IG15Q2FsbENvbnRleHQuZXhlY3V0aW9uU3RhdGU7XG4gICAgaWYgKHN0YXRlLmlzUnVubmluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBY3Rpdml0eSBpcyBhbHJlYWR5IHJ1bm5pbmcuXCIpO1xuICAgIH1cblxuICAgIC8vIFdlIHNob3VsZCBhbGxvdyBJTyBvcGVyYXRpb25zIHRvIGV4ZWN1dGU6XG4gICAgc2V0SW1tZWRpYXRlKFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzdGF0ZS5yZXBvcnRTdGF0ZShBY3Rpdml0eS5zdGF0ZXMucnVuLCBudWxsLCBteUNhbGxDb250ZXh0LnNjb3BlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pbml0aWFsaXplRXhlYy5jYWxsKG15Q2FsbENvbnRleHQuc2NvcGUpO1xuICAgICAgICAgICAgICAgIHNlbGYucnVuLmNhbGwobXlDYWxsQ29udGV4dC5zY29wZSwgbXlDYWxsQ29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmFpbChteUNhbGxDb250ZXh0LCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuaW5pdGlhbGl6ZUV4ZWMgPSBfLm5vb3A7XG5cbkFjdGl2aXR5LnByb3RvdHlwZS51bkluaXRpYWxpemVFeGVjID0gXy5ub29wO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBhcmdzKSB7XG4gICAgY2FsbENvbnRleHQuYWN0aXZpdHkuY29tcGxldGUoY2FsbENvbnRleHQsIGFyZ3MpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZXN1bHQpIHtcbiAgICB0aGlzLmVuZChjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCByZXN1bHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCkge1xuICAgIHRoaXMuZW5kKGNhbGxDb250ZXh0LCBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pZGxlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0KSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5pZGxlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5mYWlsID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBlKSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5mYWlsLCBlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgdGhpcy51bkluaXRpYWxpemVFeGVjLmNhbGwoY2FsbENvbnRleHQuc2NvcGUsIHJlYXNvbiwgcmVzdWx0KTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBgdW5Jbml0aWFsaXplRXhlYyBmYWlsZWQuIFJlYXNvbiBvZiBlbmRpbmcgd2FzICcke3JlYXNvbn0nIGFuZCB0aGUgcmVzdWx0IGlzICcke3Jlc3VsdH0uYDtcbiAgICAgICAgcmVhc29uID0gQWN0aXZpdHkuc3RhdGVzLmZhaWw7XG4gICAgICAgIHJlc3VsdCA9IGU7XG4gICAgfVxuXG4gICAgbGV0IHN0YXRlID0gY2FsbENvbnRleHQuZXhlY3V0aW9uU3RhdGU7XG5cbiAgICBpZiAoc3RhdGUuZXhlY1N0YXRlID09PSBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsIHx8IHN0YXRlLmV4ZWNTdGF0ZSA9PT0gQWN0aXZpdHkuc3RhdGVzLmZhaWwpIHtcbiAgICAgICAgLy8gSXQgd2FzIGNhbmNlbGxlZCBvciBmYWlsZWQ6XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZS5leGVjU3RhdGUgPSByZWFzb247XG5cbiAgICBsZXQgaW5JZGxlID0gcmVhc29uID09PSBBY3Rpdml0eS5zdGF0ZXMuaWRsZTtcbiAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgIGxldCBzYXZlZFNjb3BlID0gY2FsbENvbnRleHQuc2NvcGU7XG4gICAgc2F2ZWRTY29wZS51cGRhdGUoU2ltcGxlUHJveHkudXBkYXRlTW9kZS5vbmVXYXkpO1xuICAgIGNhbGxDb250ZXh0ID0gY2FsbENvbnRleHQuYmFjayhpbklkbGUpO1xuXG4gICAgaWYgKGNhbGxDb250ZXh0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgYm1OYW1lID0gc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVWYWx1ZUNvbGxlY3RlZEJNTmFtZSh0aGlzLmdldEluc3RhbmNlSWQoZXhlY0NvbnRleHQpKTtcbiAgICAgICAgICAgIGlmIChleGVjQ29udGV4dC5pc0Jvb2ttYXJrRXhpc3RzKGJtTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIGJtTmFtZSwgcmVhc29uLCByZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZW1pdFN0YXRlKHJlc3VsdCwgc2F2ZWRTY29wZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVtaXRTdGF0ZShyZXN1bHQsIHNhdmVkU2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbENvbnRleHQuZmFpbChlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjYWxsQ29udGV4dC5mYWlsKGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBXZSdyZSBvbiByb290LCBkb25lLlxuICAgICAgICAvLyBJZiB3ZiBpbiBpZGxlLCBidXQgdGhlcmUgYXJlIGludGVybmFsIGJvb2ttYXJrIHJlc3VtZSByZXF1ZXN0LFxuICAgICAgICAvLyB0aGVuIGluc3RlYWQgb2YgZW1pdHRpbmcgZG9uZSwgd2UgaGF2ZSB0byBjb250aW51ZSB0aGVtLlxuICAgICAgICBpZiAoaW5JZGxlICYmIGV4ZWNDb250ZXh0LnByb2Nlc3NSZXN1bWVCb29rbWFya1F1ZXVlKCkpIHtcbiAgICAgICAgICAgIC8vIFdlIHNob3VsZCBub3QgZW1taXQgaWRsZSBldmVudCwgYmVjYXVzZSB0aGVyZSB3YXMgaW50ZXJuYWwgYm9va21hcmsgY29udGludXRhdGlvbnMsIHNvIHdlJ3JlIGRvbmUuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGUuZW1pdFN0YXRlKHJlc3VsdCwgc2F2ZWRTY29wZSk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX2RlZmF1bHRFbmRDYWxsYmFjayA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQpIHtcbiAgICBjYWxsQ29udGV4dC5lbmQocmVhc29uLCByZXN1bHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnNjaGVkdWxlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBvYmosIGVuZENhbGxiYWNrKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBzY29wZSA9IGNhbGxDb250ZXh0LnNjb3BlO1xuICAgIGxldCBleGVjQ29udGV4dCA9IGNhbGxDb250ZXh0LmV4ZWN1dGlvbkNvbnRleHQ7XG4gICAgbGV0IHNlbGZJZCA9IGNhbGxDb250ZXh0Lmluc3RhbmNlSWQ7XG5cbiAgICBpZiAoIWVuZENhbGxiYWNrKSB7XG4gICAgICAgIGVuZENhbGxiYWNrID0gXCJfZGVmYXVsdEVuZENhbGxiYWNrXCI7XG4gICAgfVxuXG4gICAgbGV0IGludm9rZUVuZENhbGxiYWNrID0gZnVuY3Rpb24gKF9yZWFzb24sIF9yZXN1bHQpIHtcbiAgICAgICAgc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlW2VuZENhbGxiYWNrXS5jYWxsKHNjb3BlLCBjYWxsQ29udGV4dCwgX3JlYXNvbiwgX3Jlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAoIV8uaXNTdHJpbmcoZW5kQ2FsbGJhY2spKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwobmV3IFR5cGVFcnJvcihcIlByb3ZpZGVkIGFyZ3VtZW50ICdlbmRDYWxsYmFjaycgdmFsdWUgaXMgbm90IGEgc3RyaW5nLlwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGNiID0gc2NvcGVbZW5kQ2FsbGJhY2tdO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGNiKSkge1xuICAgICAgICBjYWxsQ29udGV4dC5mYWlsKG5ldyBUeXBlRXJyb3IoYCcke2VuZENhbGxiYWNrfScgaXMgbm90IGEgZnVuY3Rpb24uYCkpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLl9fc2NoZWR1bGluZ1N0YXRlKSB7XG4gICAgICAgIGRlYnVnKFwiJXM6IEVycm9yLCBhbHJlYWR5IGV4aXN0c2luZyBzdGF0ZTogJWpcIiwgc2VsZklkLCBzY29wZS5fX3NjaGVkdWxpbmdTdGF0ZSk7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwobmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoXCJUaGVyZSBhcmUgYWxyZWFkeSBzY2hlZHVsZWQgaXRlbXMgZXhpc3RzLlwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkZWJ1ZyhcIiVzOiBTY2hlZHVsaW5nIG9iamVjdChzKSBieSB1c2luZyBlbmQgY2FsbGJhY2sgJyVzJzogJWpcIiwgc2VsZklkLCBlbmRDYWxsYmFjaywgb2JqKTtcblxuICAgIGxldCBzdGF0ZSA9XG4gICAge1xuICAgICAgICBtYW55OiBfLmlzQXJyYXkob2JqKSxcbiAgICAgICAgaW5kaWNlczogbmV3IE1hcCgpLFxuICAgICAgICByZXN1bHRzOiBbXSxcbiAgICAgICAgdG90YWw6IDAsXG4gICAgICAgIGlkbGVDb3VudDogMCxcbiAgICAgICAgY2FuY2VsQ291bnQ6IDAsXG4gICAgICAgIGNvbXBsZXRlZENvdW50OiAwLFxuICAgICAgICBlbmRCb29rbWFya05hbWU6IG51bGwsXG4gICAgICAgIGVuZENhbGxiYWNrTmFtZTogZW5kQ2FsbGJhY2tcbiAgICB9O1xuXG4gICAgbGV0IGJvb2ttYXJrTmFtZXMgPSBbXTtcbiAgICB0cnkge1xuICAgICAgICBsZXQgc3RhcnRlZEFueSA9IGZhbHNlO1xuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBsZXQgcHJvY2Vzc1ZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBDaGVja2luZyB2YWx1ZTogJWpcIiwgc2VsZklkLCB2YWx1ZSk7XG4gICAgICAgICAgICBsZXQgYWN0aXZpdHksIHZhcmlhYmxlcyA9IG51bGw7XG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgIGFjdGl2aXR5ID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChfLmlzT2JqZWN0KHZhbHVlKSAmJiB2YWx1ZS5hY3Rpdml0eSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgYWN0aXZpdHkgPSB2YWx1ZS5hY3Rpdml0eTtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXMgPSBfLmlzT2JqZWN0KHZhbHVlLnZhcmlhYmxlcykgPyB2YWx1ZS52YXJpYWJsZXMgOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgbGV0IGluc3RhbmNlSWQgPSBhY3Rpdml0eS5nZXRJbnN0YW5jZUlkKGV4ZWNDb250ZXh0KTtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBWYWx1ZSBpcyBhbiBhY3Rpdml0eSB3aXRoIGluc3RhbmNlIGlkOiAlc1wiLCBzZWxmSWQsIGluc3RhbmNlSWQpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5pbmRpY2VzLmhhcyhpbnN0YW5jZUlkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihgQWN0aXZpdHkgaW5zdGFuY2UgJyR7aW5zdGFuY2VJZH0gaGFzIGJlZW4gc2NoZWR1bGVkIGFscmVhZHkuYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IENyZWF0aW5nIGVuZCBib29rbWFyaywgYW5kIHN0YXJ0aW5nIGl0LlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIGJvb2ttYXJrTmFtZXMucHVzaChleGVjQ29udGV4dC5jcmVhdGVCb29rbWFyayhzZWxmSWQsIHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlVmFsdWVDb2xsZWN0ZWRCTU5hbWUoaW5zdGFuY2VJZCksIFwicmVzdWx0Q29sbGVjdGVkXCIpKTtcbiAgICAgICAgICAgICAgICBhY3Rpdml0eS5fc3RhcnQoY2FsbENvbnRleHQsIHZhcmlhYmxlcyk7XG4gICAgICAgICAgICAgICAgc3RhcnRlZEFueSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGUuaW5kaWNlcy5zZXQoaW5zdGFuY2VJZCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnJlc3VsdHMucHVzaChudWxsKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS50b3RhbCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogVmFsdWUgaXMgbm90IGFuIGFjdGl2aXR5LlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChzdGF0ZS5tYW55KSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBUaGVyZSBhcmUgbWFueSB2YWx1ZXMsIGl0ZXJhdGluZy5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgIGZvciAobGV0IHZhbHVlIG9mIG9iaikge1xuICAgICAgICAgICAgICAgIHByb2Nlc3NWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHByb2Nlc3NWYWx1ZShvYmopO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc3RhcnRlZEFueSkge1xuICAgICAgICAgICAgZGVidWcoXCIlczogTm8gYWN0aXZpdHkgaGFzIGJlZW4gc3RhcnRlZCwgY2FsbGluZyBlbmQgY2FsbGJhY2sgd2l0aCBvcmlnaW5hbCBvYmplY3QuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gc3RhdGUubWFueSA/IHN0YXRlLnJlc3VsdHMgOiBzdGF0ZS5yZXN1bHRzWzBdO1xuICAgICAgICAgICAgaW52b2tlRW5kQ2FsbGJhY2soQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVidWcoXCIlczogJWQgYWN0aXZpdGllcyBoYXMgYmVlbiBzdGFydGVkLiBSZWdpc3RlcmluZyBlbmQgYm9va21hcmsuXCIsIHNlbGZJZCwgc3RhdGUuaW5kaWNlcy5zaXplKTtcbiAgICAgICAgICAgIGxldCBlbmRCTSA9IHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlQ29sbGVjdGluZ0NvbXBsZXRlZEJNTmFtZShzZWxmSWQpO1xuICAgICAgICAgICAgYm9va21hcmtOYW1lcy5wdXNoKGV4ZWNDb250ZXh0LmNyZWF0ZUJvb2ttYXJrKHNlbGZJZCwgZW5kQk0sIGVuZENhbGxiYWNrKSk7XG4gICAgICAgICAgICBzdGF0ZS5lbmRCb29rbWFya05hbWUgPSBlbmRCTTtcbiAgICAgICAgICAgIHNjb3BlLl9fc2NoZWR1bGluZ1N0YXRlID0gc3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUudXBkYXRlKFNpbXBsZVByb3h5LnVwZGF0ZU1vZGUub25lV2F5KTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVidWcoXCIlczogUnVudGltZSBlcnJvciBoYXBwZW5lZDogJXNcIiwgc2VsZklkLCBlLnN0YWNrKTtcbiAgICAgICAgaWYgKGJvb2ttYXJrTmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBTZXQgYm9va21hcmtzIHRvIG5vb3A6ICRqXCIsIHNlbGZJZCwgYm9va21hcmtOYW1lcyk7XG4gICAgICAgICAgICBleGVjQ29udGV4dC5ub29wQ2FsbGJhY2tzKGJvb2ttYXJrTmFtZXMpO1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLmRlbGV0ZShcIl9fc2NoZWR1bGluZ1N0YXRlXCIpO1xuICAgICAgICBkZWJ1ZyhcIiVzOiBJbnZva2luZyBlbmQgY2FsbGJhY2sgd2l0aCB0aGUgZXJyb3IuXCIsIHNlbGZJZCk7XG4gICAgICAgIGludm9rZUVuZENhbGxiYWNrKEFjdGl2aXR5LnN0YXRlcy5mYWlsLCBlKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIGRlYnVnKFwiJXM6IEZpbmFsIHN0YXRlIGluZGljZXMgY291bnQ6ICVkLCB0b3RhbDogJWRcIiwgc2VsZklkLCBzdGF0ZS5pbmRpY2VzLnNpemUsIHN0YXRlLnRvdGFsKTtcbiAgICB9XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUucmVzdWx0Q29sbGVjdGVkID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCwgYm9va21hcmspIHtcbiAgICBsZXQgc2VsZklkID0gY2FsbENvbnRleHQuaW5zdGFuY2VJZDtcbiAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgIGxldCBjaGlsZElkID0gc3BlY1N0cmluZ3MuZ2V0U3RyaW5nKGJvb2ttYXJrLm5hbWUpO1xuICAgIGRlYnVnKFwiJXM6IFNjaGVkdWxpbmcgcmVzdWx0IGl0ZW0gY29sbGVjdGVkLCBjaGlsZElkOiAlcywgcmVhc29uOiAlcywgcmVzdWx0OiAlaiwgYm9va21hcms6ICVqXCIsIHNlbGZJZCwgY2hpbGRJZCwgcmVhc29uLCByZXN1bHQsIGJvb2ttYXJrKTtcblxuICAgIGxldCBmaW5pc2hlZCA9IG51bGw7XG4gICAgbGV0IHN0YXRlID0gdGhpcy5fX3NjaGVkdWxpbmdTdGF0ZTtcbiAgICBsZXQgZmFpbCA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGlmICghXy5pc09iamVjdChzdGF0ZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKFwiVmFsdWUgb2YgX19zY2hlZHVsaW5nU3RhdGUgaXMgJ1wiICsgc3RhdGUgKyBcIicuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBpbmRleCA9IHN0YXRlLmluZGljZXMuZ2V0KGNoaWxkSWQpO1xuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChpbmRleCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKGBDaGlsZCBhY3Rpdml0eSBvZiAnJHtjaGlsZElkfScgc2NoZWR1bGluZyBzdGF0ZSBpbmRleCBvdXQgb2YgcmVuZ2UuYCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWJ1ZyhcIiVzOiBGaW5pc2hlZCBjaGlsZCBhY3Rpdml0eSBpZCBpczogJXNcIiwgc2VsZklkLCBjaGlsZElkKTtcblxuICAgICAgICBzd2l0Y2ggKHJlYXNvbikge1xuICAgICAgICAgICAgY2FzZSBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGU6XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogU2V0dGluZyAlZC4gdmFsdWUgdG8gcmVzdWx0OiAlalwiLCBzZWxmSWQsIGluZGV4LCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnJlc3VsdHNbaW5kZXhdID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFJlbW92aW5nIGlkIGZyb20gc3RhdGUuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuaW5kaWNlcy5kZWxldGUoY2hpbGRJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuY29tcGxldGVkQ291bnQrKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aXZpdHkuc3RhdGVzLmZhaWw6XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogRmFpbGVkIHdpdGg6ICVzXCIsIHNlbGZJZCwgcmVzdWx0LnN0YWNrKTtcbiAgICAgICAgICAgICAgICBmYWlsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pbmRpY2VzLmRlbGV0ZShjaGlsZElkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aXZpdHkuc3RhdGVzLmNhbmNlbDpcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBJbmNyZW1lbnRpbmcgY2FuY2VsIGNvdW50ZXIuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuY2FuY2VsQ291bnQrKztcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBSZW1vdmluZyBpZCBmcm9tIHN0YXRlLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmluZGljZXMuZGVsZXRlKGNoaWxkSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpdml0eS5zdGF0ZXMuaWRsZTpcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBJbmNyZW1lbnRpbmcgaWRsZSBjb3VudGVyLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmlkbGVDb3VudCsrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihgUmVzdWx0IGNvbGxlY3RlZCB3aXRoIHVua25vd24gcmVhc29uICcke3JlYXNvbn0nLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVidWcoXCIlczogU3RhdGUgc28gZmFyID0gdG90YWw6ICVzLCBpbmRpY2VzIGNvdW50OiAlZCwgY29tcGxldGVkIGNvdW50OiAlZCwgY2FuY2VsIGNvdW50OiAlZCwgZXJyb3IgY291bnQ6ICVkLCBpZGxlIGNvdW50OiAlZFwiLFxuICAgICAgICAgICAgc2VsZklkLFxuICAgICAgICAgICAgc3RhdGUudG90YWwsXG4gICAgICAgICAgICBzdGF0ZS5pbmRpY2VzLnNpemUsXG4gICAgICAgICAgICBzdGF0ZS5jb21wbGV0ZWRDb3VudCxcbiAgICAgICAgICAgIHN0YXRlLmNhbmNlbENvdW50LFxuICAgICAgICAgICAgc3RhdGUuaWRsZUNvdW50KTtcblxuICAgICAgICBsZXQgZW5kV2l0aE5vQ29sbGVjdEFsbCA9ICFjYWxsQ29udGV4dC5hY3Rpdml0eS5jb2xsZWN0QWxsICYmIHJlYXNvbiAhPT0gQWN0aXZpdHkuc3RhdGVzLmlkbGU7XG4gICAgICAgIGlmIChlbmRXaXRoTm9Db2xsZWN0QWxsIHx8IGZhaWwpIHtcbiAgICAgICAgICAgIGlmICghZmFpbCkge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IC0tLS0gQ29sbGVjdGluZyBvZiB2YWx1ZXMgZW5kZWQsIGJlY2F1c2Ugd2UncmUgbm90IGNvbGxlY3RpbmcgYWxsIHZhbHVlcyAoZWcuOiBQaWNrKS5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IC0tLS0gQ29sbGVjdGluZyBvZiB2YWx1ZXMgZW5kZWQsIGJlY2F1c2Ugb2YgYW4gZXJyb3IuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBTaHV0dGluZyBkb3duICVkIG90aGVyLCBydW5uaW5nIGFjaXR2aXRpZXMuXCIsIHNlbGZJZCwgc3RhdGUuaW5kaWNlcy5zaXplKTtcbiAgICAgICAgICAgIGxldCBpZHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGlkIG9mIHN0YXRlLmluZGljZXMua2V5cygpKSB7XG4gICAgICAgICAgICAgICAgaWRzLnB1c2goaWQpO1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IERlbGV0aW5nIHNjb3BlIG9mIGFjdGl2aXR5OiAlc1wiLCBzZWxmSWQsIGlkKTtcbiAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5kZWxldGVTY29wZU9mQWN0aXZpdHkoY2FsbENvbnRleHQsIGlkKTtcbiAgICAgICAgICAgICAgICBsZXQgaWJtTmFtZSA9IHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlVmFsdWVDb2xsZWN0ZWRCTU5hbWUoaWQpO1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IERlbGV0aW5nIHZhbHVlIGNvbGxlY3RlZCBib29rbWFyazogJXNcIiwgc2VsZklkLCBpYm1OYW1lKTtcbiAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5kZWxldGVCb29rbWFyayhpYm1OYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4ZWNDb250ZXh0LmNhbmNlbEV4ZWN1dGlvbih0aGlzLCBpZHMpO1xuICAgICAgICAgICAgZGVidWcoXCIlczogQWN0aXZpdGllcyBjYW5jZWxsZWQ6ICVqXCIsIHNlbGZJZCwgaWRzKTtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IFJlcG9ydGluZyB0aGUgYWN0dWFsIHJlYXNvbjogJXMgYW5kIHJlc3VsdDogJWpcIiwgc2VsZklkLCByZWFzb24sIHJlc3VsdCk7XG4gICAgICAgICAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHsgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBzdGF0ZS5lbmRCb29rbWFya05hbWUsIHJlYXNvbiwgcmVzdWx0KTsgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFzc2VydCghZmFpbCk7XG4gICAgICAgICAgICBsZXQgb25FbmQgPSAoc3RhdGUuaW5kaWNlcy5zaXplIC0gc3RhdGUuaWRsZUNvdW50KSA9PT0gMDtcbiAgICAgICAgICAgIGlmIChvbkVuZCkge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IC0tLS0gQ29sbGVjdGluZyBvZiB2YWx1ZXMgZW5kZWQgKGVuZGVkIGJlY2F1c2Ugb2YgY29sbGVjdCBhbGwgaXMgb2ZmOiAlcykuXCIsIHNlbGZJZCwgZW5kV2l0aE5vQ29sbGVjdEFsbCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmNhbmNlbENvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IENvbGxlY3RpbmcgaGFzIGJlZW4gY2FuY2VsbGVkLCByZXN1bWluZyBlbmQgYm9va21hcmtzLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHsgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBzdGF0ZS5lbmRCb29rbWFya05hbWUsIEFjdGl2aXR5LnN0YXRlcy5jYW5jZWwpOyB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0ZS5pZGxlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWcoXCIlczogVGhpcyBlbnRyeSBoYXMgYmVlbiBnb25lIHRvIGlkbGUsIHByb3BhZ2F0aW5nIGNvdW50ZXIuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmlkbGVDb3VudC0tOyAvLyBCZWNhdXNlIHRoZSBuZXh0IGNhbGwgd2lsbCB3YWtlIHVwIGEgdGhyZWFkLlxuICAgICAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIHN0YXRlLmVuZEJvb2ttYXJrTmFtZSwgQWN0aXZpdHkuc3RhdGVzLmlkbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gc3RhdGUubWFueSA/IHN0YXRlLnJlc3VsdHMgOiBzdGF0ZS5yZXN1bHRzWzBdO1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBUaGlzIGVudHJ5IGhhcyBiZWVuIGNvbXBsZXRlZCwgcmVzdW1pbmcgY29sbGVjdCBib29rbWFyayB3aXRoIHRoZSByZXN1bHQocyk6ICVqXCIsIHNlbGZJZCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7IGV4ZWNDb250ZXh0LnJlc3VtZUJvb2ttYXJrSW5TY29wZShjYWxsQ29udGV4dCwgc3RhdGUuZW5kQm9va21hcmtOYW1lLCBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGUsIHJlc3VsdCk7IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwoZSk7XG4gICAgICAgIHRoaXMuZGVsZXRlKFwiX19zY2hlZHVsaW5nU3RhdGVcIik7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBpZiAoZmluaXNoZWQpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IFNjaGR1bGluZyBmaW5pc2hlZCwgcmVtb3Zpbmcgc3RhdGUuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZShcIl9fc2NoZWR1bGluZ1N0YXRlXCIpO1xuXG4gICAgICAgICAgICBmaW5pc2hlZCgpO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8qIFJVTiAqL1xuXG4vKiBTQ09QRSAqL1xuQWN0aXZpdHkucHJvdG90eXBlLl9nZXRTY29wZUtleXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmICghc2VsZi5fc2NvcGVLZXlzIHx8ICFzZWxmLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCkge1xuICAgICAgICBzZWxmLl9zY29wZUtleXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHNlbGYpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi5ub25TY29wZWRQcm9wZXJ0aWVzLmhhcyhrZXkpICYmIChfLmlzVW5kZWZpbmVkKEFjdGl2aXR5LnByb3RvdHlwZVtrZXldKSB8fCBrZXkgPT09IFwiX2RlZmF1bHRFbmRDYWxsYmFja1wiIHx8IGtleSA9PT0gXCJfc3ViQWN0aXZpdGllc0dvdFwiKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3Njb3BlS2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNlbGYuX3Njb3BlS2V5cztcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5jcmVhdGVTY29wZVBhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCkge1xuICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5UnVudGltZUVycm9yKFwiQ2Fubm90IGNyZWF0ZSBhY3Rpdml0eSBzY29wZSBmb3IgdW5pbml0aWFsaXplZCBhY3Rpdml0aWVzLlwiKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCA9PT0gbnVsbCkge1xuICAgICAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgICAgICBsZXQgc3JjID0gXCJyZXR1cm4ge1wiO1xuICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgb2YgdGhpcy5fZ2V0U2NvcGVLZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gXCIsXFxuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KHRoaXNbZmllbGROYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gZmllbGROYW1lICsgXCI6Xy5jbG9uZShhLlwiICsgZmllbGROYW1lICsgXCIsIHRydWUpXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChfLmlzQXJyYXkodGhpc1tmaWVsZE5hbWVdKSkge1xuICAgICAgICAgICAgICAgIHNyYyArPSBmaWVsZE5hbWUgKyBcIjphLlwiICsgZmllbGROYW1lICsgXCIuc2xpY2UoMClcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNyYyArPSBmaWVsZE5hbWUgKyBcIjphLlwiICsgZmllbGROYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNyYyArPSBcIn1cIjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCA9IG5ldyBGdW5jdGlvbihcImEsX1wiLCBzcmMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkludmFsaWQgc2NvcGUgcGFydCBmdW5jdGlvbjolc1wiLCBzcmMpO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVTY29wZVBhcnRJbXBsKHRoaXMsIF8pO1xufTtcbi8qIFNDT1BFICovXG5cbkFjdGl2aXR5LnN0YXRlcyA9IGVudW1zLmFjdGl2aXR5U3RhdGVzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2aXR5O1xuIl19
