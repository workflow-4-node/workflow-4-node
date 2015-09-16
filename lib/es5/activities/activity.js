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
    errors: [],
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
        debug("%s: Storing error.", selfId);
        state.errors.push(result);
        debug("%s: Removing id from state.", selfId);
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
    debug("%s: State so far = total: %s, indices count: %d, completed count: %d, cancel count: %d, error count: %d, idle count: %d", selfId, state.total, state.indices.size, state.completedCount, state.cancelCount, state.errors.length, state.idleCount);
    var endWithNoCollectAll = !callContext.activity.collectAll && reason !== Activity.states.idle;
    if (endWithNoCollectAll) {
      debug("%s: ---- Collecting of values ended, because we're not collecting all values (eg.: Pick).", selfId);
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
      var onEnd = (state.indices.size - state.idleCount) === 0;
      if (onEnd) {
        debug("%s: ---- Collecting of values ended (ended because of collect all is off: %s).", selfId, endWithNoCollectAll);
        if (state.errors.length) {
          debug("%s: Collecting has been failed, resuming end bookmarks with errors: %j", selfId, state.errors);
          var error = state.errors.length === 1 ? state.errors[0] : new errors.AggregateError(state.errors);
          finished = function() {
            execContext.resumeBookmarkInScope(callContext, state.endBookmarkName, Activity.states.fail, error);
          };
        } else if (state.cancelCount) {
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
//# sourceMappingURL=data:application/json;base64,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Q0o7TUF2dEJBO0FBQUEsSUFGQSxDQUFFLFlBQTBCO0FBQzFCLFdBQW9CLEtBQUcsQ0FBQztBQUN4QixnQkFBb0MsQ0FBQztJQUN2QyxDQUFFLE9BQVE7QUFDUixRQUFJO0FBQ0YsV0FBSSxLQUFpQixHQUFLLENBQUEsV0FBdUIsR0FBSyxLQUFHLENBQUc7QUFDMUQsb0JBQXdCLEFBQUMsRUFBQyxDQUFDO1FBQzdCO0FBQUEsTUFDRixDQUFFLE9BQVE7QUFDUixnQkFBd0I7QUFDdEIsb0JBQXdCO1FBQzFCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxBQTZzQkEsTUFBRSxHQUFLLElBQUUsQ0FBQztBQUVWLE1BQUk7QUFDQSxTQUFHLHFCQUFxQixFQUFJLElBQUksU0FBTyxBQUFDLENBQUMsS0FBSSxDQUFHLElBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQ0EsT0FBTyxDQUFBLENBQUc7QUFDTixVQUFJLEFBQUMsQ0FBQyxnQ0FBK0IsQ0FBRyxJQUFFLENBQUMsQ0FBQztBQUM1QyxVQUFNLEVBQUEsQ0FBQztJQUNYO0FBQUEsRUFDSjtBQUFBLEFBRUEsT0FBTyxDQUFBLElBQUcscUJBQXFCLEFBQUMsQ0FBQyxJQUFHLENBQUcsRUFBQSxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUdELE9BQU8sT0FBTyxFQUFJLENBQUEsS0FBSSxlQUFlLENBQUM7QUFFdEMsS0FBSyxRQUFRLEVBQUksU0FBTyxDQUFDO0FBQ3pCIiwiZmlsZSI6ImFjdGl2aXRpZXMvYWN0aXZpdHkuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIi8qanNoaW50IC1XMDU0ICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5sZXQgZ3VpZHMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2d1aWRzXCIpO1xubGV0IGVycm9ycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZXJyb3JzXCIpO1xubGV0IGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcbmxldCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbmxldCBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBDYWxsQ29udGV4dCA9IHJlcXVpcmUoXCIuL2NhbGxDb250ZXh0XCIpO1xubGV0IHV1aWQgPSByZXF1aXJlKCdub2RlLXV1aWQnKTtcbmxldCBhc3luYyA9IHJlcXVpcmUoXCIuLi9jb21tb24vYXN5bmNIZWxwZXJzXCIpLmFzeW5jO1xubGV0IGFzc2VydCA9IHJlcXVpcmUoXCJiZXR0ZXItYXNzZXJ0XCIpO1xubGV0IGRlYnVnID0gcmVxdWlyZShcImRlYnVnXCIpKFwid2Y0bm9kZTpBY3Rpdml0eVwiKTtcbmxldCBjb21tb24gPSByZXF1aXJlKFwiLi4vY29tbW9uXCIpO1xubGV0IFNpbXBsZVByb3h5ID0gY29tbW9uLlNpbXBsZVByb3h5O1xuXG5mdW5jdGlvbiBBY3Rpdml0eSgpIHtcbiAgICB0aGlzLmFyZ3MgPSBudWxsO1xuICAgIHRoaXMuZGlzcGxheU5hbWUgPSBudWxsO1xuICAgIHRoaXMuaWQgPSB1dWlkLnY0KCk7XG4gICAgdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zY29wZUtleXMgPSBudWxsO1xuICAgIHRoaXNbXCJAcmVxdWlyZVwiXSA9IG51bGw7XG5cbiAgICAvLyBQcm9wZXJ0aWVzIG5vdCBzZXJpYWxpemVkOlxuICAgIHRoaXMubm9uU2VyaWFsaXplZFByb3BlcnRpZXMgPSBuZXcgU2V0KCk7XG5cbiAgICAvLyBQcm9wZXJ0aWVzIGFyZSBub3QgZ29pbmcgdG8gY29waWVkIGluIHRoZSBzY29wZTpcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIm5vblNjb3BlZFByb3BlcnRpZXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIm5vblNlcmlhbGl6ZWRQcm9wZXJ0aWVzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJhY3Rpdml0eVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiaWRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImFyZ3NcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImRpc3BsYXlOYW1lXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjb21wbGV0ZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY2FuY2VsXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJpZGxlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJmYWlsXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJlbmRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInNjaGVkdWxlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjcmVhdGVCb29rbWFya1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwicmVzdW1lQm9va21hcmtcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInJlc3VsdENvbGxlY3RlZFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY29kZVByb3BlcnRpZXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImluaXRpYWxpemVTdHJ1Y3R1cmVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl9pbml0aWFsaXplU3RydWN0dXJlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfc3RydWN0dXJlSW5pdGlhbGl6ZWRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImNsb25lXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfc2NvcGVLZXlzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfY3JlYXRlU2NvcGVQYXJ0SW1wbFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiQHJlcXVpcmVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImluaXRpYWxpemVFeGVjXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJ1bkluaXRpYWxpemVFeGVjXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfc2NoZWR1bGVTdWJBY3Rpdml0aWVzXCIpO1xuXG4gICAgdGhpcy5jb2RlUHJvcGVydGllcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLmFycmF5UHJvcGVydGllcyA9IG5ldyBTZXQoW1wiYXJnc1wiXSk7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEFjdGl2aXR5LnByb3RvdHlwZSwge1xuICAgIF9zY29wZUtleXM6IHtcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgX2NyZWF0ZVNjb3BlUGFydEltcGw6IHtcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgY29sbGVjdEFsbDoge1xuICAgICAgICB2YWx1ZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH1cbn0pO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuZ2V0SW5zdGFuY2VJZCA9IGZ1bmN0aW9uIChleGVjQ29udGV4dCkge1xuICAgIHJldHVybiBleGVjQ29udGV4dC5nZXRJbnN0YW5jZUlkKHRoaXMpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy5kaXNwbGF5TmFtZSA/ICh0aGlzLmRpc3BsYXlOYW1lICsgXCIgXCIpIDogXCJcIikgKyBcIihcIiArIHRoaXMuY29uc3RydWN0b3IubmFtZSArIFwiOlwiICsgdGhpcy5pZCArIFwiKVwiO1xufTtcblxuLyogZm9yRWFjaCAqL1xuQWN0aXZpdHkucHJvdG90eXBlLmFsbCA9IGZ1bmN0aW9uKiAoZXhlY0NvbnRleHQpIHtcbiAgICB5aWVsZCAqIHRoaXMuX2NoaWxkcmVuKHRydWUsIG51bGwsIGV4ZWNDb250ZXh0LCBudWxsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5jaGlsZHJlbiA9IGZ1bmN0aW9uKiAoZXhlY0NvbnRleHQpIHtcbiAgICB5aWVsZCAqIHRoaXMuX2NoaWxkcmVuKHRydWUsIHRoaXMsIGV4ZWNDb250ZXh0LCBudWxsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pbW1lZGlhdGVDaGlsZHJlbiA9IGZ1bmN0aW9uKiAoZXhlY0NvbnRleHQpIHtcbiAgICB5aWVsZCAqIHRoaXMuX2NoaWxkcmVuKGZhbHNlLCB0aGlzLCBleGVjQ29udGV4dCk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX2NoaWxkcmVuID0gZnVuY3Rpb24qIChkZWVwLCBleGNlcHQsIGV4ZWNDb250ZXh0LCB2aXNpdGVkKSB7XG4gICAgYXNzZXJ0KGV4ZWNDb250ZXh0IGluc3RhbmNlb2YgcmVxdWlyZShcIi4vYWN0aXZpdHlFeGVjdXRpb25Db250ZXh0XCIpLCBcIkNhbm5vdCBlbnVtZXJhdGUgYWN0aXZpdGllcyB3aXRob3V0IGFuIGV4ZWN1dGlvbiBjb250ZXh0LlwiKTtcbiAgICB2aXNpdGVkID0gdmlzaXRlZCB8fCBuZXcgU2V0KCk7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmICghdmlzaXRlZC5oYXMoc2VsZikpIHtcbiAgICAgICAgdmlzaXRlZC5hZGQoc2VsZik7XG5cbiAgICAgICAgLy8gRW5zdXJlIGl0J3Mgc3RydWN0dXJlIGNyZWF0ZWQ6XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVTdHJ1Y3R1cmUoZXhlY0NvbnRleHQpO1xuXG4gICAgICAgIGlmIChzZWxmICE9PSBleGNlcHQpIHtcbiAgICAgICAgICAgIHlpZWxkIHNlbGY7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgaW4gc2VsZikge1xuICAgICAgICAgICAgbGV0IGZpZWxkVmFsdWUgPSBzZWxmW2ZpZWxkTmFtZV07XG4gICAgICAgICAgICBpZiAoZmllbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLmlzQXJyYXkoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkICogb2JqLl9jaGlsZHJlbihkZWVwLCBleGNlcHQsIGV4ZWNDb250ZXh0LCB2aXNpdGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIG9iajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmllbGRWYWx1ZSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCAqIGZpZWxkVmFsdWUuX2NoaWxkcmVuKGRlZXAsIGV4Y2VwdCwgZXhlY0NvbnRleHQsIHZpc2l0ZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG4vKiBmb3JFYWNoICovXG5cbi8qIFN0cnVjdHVyZSAqL1xuQWN0aXZpdHkucHJvdG90eXBlLmlzQXJyYXlQcm9wZXJ0eSA9IGZ1bmN0aW9uIChwcm9wTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmFycmF5UHJvcGVydGllcy5oYXMocHJvcE5hbWUpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLl9pbml0aWFsaXplU3RydWN0dXJlID0gZnVuY3Rpb24gKGV4ZWNDb250ZXh0KSB7XG4gICAgYXNzZXJ0KCEhZXhlY0NvbnRleHQpO1xuICAgIGlmICghdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplU3RydWN0dXJlKGV4ZWNDb250ZXh0KTtcbiAgICAgICAgdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pbml0aWFsaXplU3RydWN0dXJlID0gXy5ub29wO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gbWFrZUNsb25lKHZhbHVlLCBjYW5DbG9uZUFycmF5cykge1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIGxldCBuZXdTZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpdGVtIG9mIHZhbHVlLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgbmV3U2V0LmFkZChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXdTZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKGNhbkNsb25lQXJyYXlzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld0FycmF5ID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdBcnJheS5wdXNoKG1ha2VDbG9uZShpdGVtLCBmYWxzZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY2xvbmUgYWN0aXZpdHkncyBuZXN0ZWQgYXJyYXlzLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCBDb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG4gICAgbGV0IG5ld0luc3QgPSBuZXcgQ29uc3RydWN0b3IoKTtcbiAgICBmb3IgKGxldCBrZXkgaW4gdGhpcykge1xuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzW2tleV07XG4gICAgICAgIGlmIChuZXdJbnN0W2tleV0gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBuZXdJbnN0W2tleV0gPSBtYWtlQ2xvbmUodmFsdWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdJbnN0O1xufTtcblxuLyogUlVOICovXG5BY3Rpdml0eS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIShjYWxsQ29udGV4dCBpbnN0YW5jZW9mIENhbGxDb250ZXh0KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCAnY29udGV4dCcgaXMgbm90IGFuIGluc3RhbmNlIG9mIEFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5cIik7XG4gICAgfVxuXG4gICAgbGV0IGFyZ3MgPSBzZWxmLmFyZ3M7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGFyZ3MgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fc3RhcnQoY2FsbENvbnRleHQsIG51bGwsIGFyZ3MpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLl9zdGFydCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgdmFyaWFibGVzLCBhcmdzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IG15Q2FsbENvbnRleHQgPSBjYWxsQ29udGV4dC5uZXh0KHNlbGYsIHZhcmlhYmxlcyk7XG4gICAgbGV0IHN0YXRlID0gbXlDYWxsQ29udGV4dC5leGVjdXRpb25TdGF0ZTtcbiAgICBpZiAoc3RhdGUuaXNSdW5uaW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFjdGl2aXR5IGlzIGFscmVhZHkgcnVubmluZy5cIik7XG4gICAgfVxuXG4gICAgLy8gV2Ugc2hvdWxkIGFsbG93IElPIG9wZXJhdGlvbnMgdG8gZXhlY3V0ZTpcbiAgICBzZXRJbW1lZGlhdGUoXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHN0YXRlLnJlcG9ydFN0YXRlKEFjdGl2aXR5LnN0YXRlcy5ydW4sIG51bGwsIG15Q2FsbENvbnRleHQuc2NvcGUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzZWxmLmluaXRpYWxpemVFeGVjLmNhbGwobXlDYWxsQ29udGV4dC5zY29wZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5ydW4uY2FsbChteUNhbGxDb250ZXh0LnNjb3BlLCBteUNhbGxDb250ZXh0LCBhcmdzIHx8IHNlbGYuYXJncyB8fCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmFpbChteUNhbGxDb250ZXh0LCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuaW5pdGlhbGl6ZUV4ZWMgPSBfLm5vb3A7XG5cbkFjdGl2aXR5LnByb3RvdHlwZS51bkluaXRpYWxpemVFeGVjID0gXy5ub29wO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBhcmdzKSB7XG4gICAgY2FsbENvbnRleHQuYWN0aXZpdHkuY29tcGxldGUoY2FsbENvbnRleHQsIGFyZ3MpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZXN1bHQpIHtcbiAgICB0aGlzLmVuZChjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCByZXN1bHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCkge1xuICAgIHRoaXMuZW5kKGNhbGxDb250ZXh0LCBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pZGxlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0KSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5pZGxlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5mYWlsID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBlKSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5mYWlsLCBlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgdGhpcy51bkluaXRpYWxpemVFeGVjLmNhbGwoY2FsbENvbnRleHQuc2NvcGUsIHJlYXNvbiwgcmVzdWx0KTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBgdW5Jbml0aWFsaXplRXhlYyBmYWlsZWQuIFJlYXNvbiBvZiBlbmRpbmcgd2FzICcke3JlYXNvbn0nIGFuZCB0aGUgcmVzdWx0IGlzICcke3Jlc3VsdH0uYDtcbiAgICAgICAgcmVhc29uID0gQWN0aXZpdHkuc3RhdGVzLmZhaWw7XG4gICAgICAgIHJlc3VsdCA9IGU7XG4gICAgfVxuXG4gICAgbGV0IHN0YXRlID0gY2FsbENvbnRleHQuZXhlY3V0aW9uU3RhdGU7XG5cbiAgICBpZiAoc3RhdGUuZXhlY1N0YXRlID09PSBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsIHx8IHN0YXRlLmV4ZWNTdGF0ZSA9PT0gQWN0aXZpdHkuc3RhdGVzLmZhaWwpIHtcbiAgICAgICAgLy8gSXQgd2FzIGNhbmNlbGxlZCBvciBmYWlsZWQ6XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZS5leGVjU3RhdGUgPSByZWFzb247XG5cbiAgICBsZXQgaW5JZGxlID0gcmVhc29uID09PSBBY3Rpdml0eS5zdGF0ZXMuaWRsZTtcbiAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgIGxldCBzYXZlZFNjb3BlID0gY2FsbENvbnRleHQuc2NvcGU7XG4gICAgc2F2ZWRTY29wZS51cGRhdGUoU2ltcGxlUHJveHkudXBkYXRlTW9kZS5vbmVXYXkpO1xuICAgIGNhbGxDb250ZXh0ID0gY2FsbENvbnRleHQuYmFjayhpbklkbGUpO1xuXG4gICAgaWYgKGNhbGxDb250ZXh0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgYm1OYW1lID0gc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVWYWx1ZUNvbGxlY3RlZEJNTmFtZSh0aGlzLmdldEluc3RhbmNlSWQoZXhlY0NvbnRleHQpKTtcbiAgICAgICAgICAgIGlmIChleGVjQ29udGV4dC5pc0Jvb2ttYXJrRXhpc3RzKGJtTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIGJtTmFtZSwgcmVhc29uLCByZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZW1pdFN0YXRlKHJlc3VsdCwgc2F2ZWRTY29wZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxDb250ZXh0LmZhaWwoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lbWl0U3RhdGUocmVzdWx0LCBzYXZlZFNjb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjYWxsQ29udGV4dC5mYWlsKGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBXZSdyZSBvbiByb290LCBkb25lLlxuICAgICAgICAvLyBJZiB3ZiBpbiBpZGxlLCBidXQgdGhlcmUgYXJlIGludGVybmFsIGJvb2ttYXJrIHJlc3VtZSByZXF1ZXN0LFxuICAgICAgICAvLyB0aGVuIGluc3RlYWQgb2YgZW1pdHRpbmcgZG9uZSwgd2UgaGF2ZSB0byBjb250aW51ZSB0aGVtLlxuICAgICAgICBpZiAoaW5JZGxlICYmIGV4ZWNDb250ZXh0LnByb2Nlc3NSZXN1bWVCb29rbWFya1F1ZXVlKCkpIHtcbiAgICAgICAgICAgIC8vIFdlIHNob3VsZCBub3QgZW1taXQgaWRsZSBldmVudCwgYmVjYXVzZSB0aGVyZSB3YXMgaW50ZXJuYWwgYm9va21hcmsgY29udGludXRhdGlvbnMsIHNvIHdlJ3JlIGRvbmUuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGUuZW1pdFN0YXRlKHJlc3VsdCwgc2F2ZWRTY29wZSk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX2RlZmF1bHRFbmRDYWxsYmFjayA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQpIHtcbiAgICBjYWxsQ29udGV4dC5lbmQocmVhc29uLCByZXN1bHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnNjaGVkdWxlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBvYmosIGVuZENhbGxiYWNrKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBzY29wZSA9IGNhbGxDb250ZXh0LnNjb3BlO1xuICAgIGxldCBleGVjQ29udGV4dCA9IGNhbGxDb250ZXh0LmV4ZWN1dGlvbkNvbnRleHQ7XG4gICAgbGV0IHNlbGZJZCA9IGNhbGxDb250ZXh0Lmluc3RhbmNlSWQ7XG5cbiAgICBpZiAoIWVuZENhbGxiYWNrKSB7XG4gICAgICAgIGVuZENhbGxiYWNrID0gXCJfZGVmYXVsdEVuZENhbGxiYWNrXCI7XG4gICAgfVxuXG4gICAgbGV0IGludm9rZUVuZENhbGxiYWNrID0gZnVuY3Rpb24gKF9yZWFzb24sIF9yZXN1bHQpIHtcbiAgICAgICAgc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlW2VuZENhbGxiYWNrXS5jYWxsKHNjb3BlLCBjYWxsQ29udGV4dCwgX3JlYXNvbiwgX3Jlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAoIV8uaXNTdHJpbmcoZW5kQ2FsbGJhY2spKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwobmV3IFR5cGVFcnJvcihcIlByb3ZpZGVkIGFyZ3VtZW50ICdlbmRDYWxsYmFjaycgdmFsdWUgaXMgbm90IGEgc3RyaW5nLlwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGNiID0gc2NvcGVbZW5kQ2FsbGJhY2tdO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGNiKSkge1xuICAgICAgICBjYWxsQ29udGV4dC5mYWlsKG5ldyBUeXBlRXJyb3IoYCcke2VuZENhbGxiYWNrfScgaXMgbm90IGEgZnVuY3Rpb24uYCkpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLl9fc2NoZWR1bGluZ1N0YXRlKSB7XG4gICAgICAgIGRlYnVnKFwiJXM6IEVycm9yLCBhbHJlYWR5IGV4aXN0c2luZyBzdGF0ZTogJWpcIiwgc2VsZklkLCBzY29wZS5fX3NjaGVkdWxpbmdTdGF0ZSk7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwobmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoXCJUaGVyZSBhcmUgYWxyZWFkeSBzY2hlZHVsZWQgaXRlbXMgZXhpc3RzLlwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkZWJ1ZyhcIiVzOiBTY2hlZHVsaW5nIG9iamVjdChzKSBieSB1c2luZyBlbmQgY2FsbGJhY2sgJyVzJzogJWpcIiwgc2VsZklkLCBlbmRDYWxsYmFjaywgb2JqKTtcblxuICAgIGxldCBzdGF0ZSA9XG4gICAge1xuICAgICAgICBtYW55OiBfLmlzQXJyYXkob2JqKSxcbiAgICAgICAgaW5kaWNlczogbmV3IE1hcCgpLFxuICAgICAgICByZXN1bHRzOiBbXSxcbiAgICAgICAgdG90YWw6IDAsXG4gICAgICAgIGVycm9yczogW10sXG4gICAgICAgIGlkbGVDb3VudDogMCxcbiAgICAgICAgY2FuY2VsQ291bnQ6IDAsXG4gICAgICAgIGNvbXBsZXRlZENvdW50OiAwLFxuICAgICAgICBlbmRCb29rbWFya05hbWU6IG51bGwsXG4gICAgICAgIGVuZENhbGxiYWNrTmFtZTogZW5kQ2FsbGJhY2tcbiAgICB9O1xuXG4gICAgbGV0IGJvb2ttYXJrTmFtZXMgPSBbXTtcbiAgICB0cnkge1xuICAgICAgICBsZXQgc3RhcnRlZEFueSA9IGZhbHNlO1xuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBsZXQgcHJvY2Vzc1ZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBDaGVja2luZyB2YWx1ZTogJWpcIiwgc2VsZklkLCB2YWx1ZSk7XG4gICAgICAgICAgICBsZXQgYWN0aXZpdHksIHZhcmlhYmxlcyA9IG51bGw7XG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgIGFjdGl2aXR5ID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChfLmlzT2JqZWN0KHZhbHVlKSAmJiB2YWx1ZS5hY3Rpdml0eSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgYWN0aXZpdHkgPSB2YWx1ZS5hY3Rpdml0eTtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZXMgPSBfLmlzT2JqZWN0KHZhbHVlLnZhcmlhYmxlcykgPyB2YWx1ZS52YXJpYWJsZXMgOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgbGV0IGluc3RhbmNlSWQgPSBhY3Rpdml0eS5nZXRJbnN0YW5jZUlkKGV4ZWNDb250ZXh0KTtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBWYWx1ZSBpcyBhbiBhY3Rpdml0eSB3aXRoIGluc3RhbmNlIGlkOiAlc1wiLCBzZWxmSWQsIGluc3RhbmNlSWQpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5pbmRpY2VzLmhhcyhpbnN0YW5jZUlkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihgQWN0aXZpdHkgaW5zdGFuY2UgJyR7aW5zdGFuY2VJZH0gaGFzIGJlZW4gc2NoZWR1bGVkIGFscmVhZHkuYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IENyZWF0aW5nIGVuZCBib29rbWFyaywgYW5kIHN0YXJ0aW5nIGl0LlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIGJvb2ttYXJrTmFtZXMucHVzaChleGVjQ29udGV4dC5jcmVhdGVCb29rbWFyayhzZWxmSWQsIHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlVmFsdWVDb2xsZWN0ZWRCTU5hbWUoaW5zdGFuY2VJZCksIFwicmVzdWx0Q29sbGVjdGVkXCIpKTtcbiAgICAgICAgICAgICAgICBhY3Rpdml0eS5fc3RhcnQoY2FsbENvbnRleHQsIHZhcmlhYmxlcyk7XG4gICAgICAgICAgICAgICAgc3RhcnRlZEFueSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGUuaW5kaWNlcy5zZXQoaW5zdGFuY2VJZCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnJlc3VsdHMucHVzaChudWxsKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS50b3RhbCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogVmFsdWUgaXMgbm90IGFuIGFjdGl2aXR5LlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChzdGF0ZS5tYW55KSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBUaGVyZSBhcmUgbWFueSB2YWx1ZXMsIGl0ZXJhdGluZy5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgIGZvciAobGV0IHZhbHVlIG9mIG9iaikge1xuICAgICAgICAgICAgICAgIHByb2Nlc3NWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHByb2Nlc3NWYWx1ZShvYmopO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc3RhcnRlZEFueSkge1xuICAgICAgICAgICAgZGVidWcoXCIlczogTm8gYWN0aXZpdHkgaGFzIGJlZW4gc3RhcnRlZCwgY2FsbGluZyBlbmQgY2FsbGJhY2sgd2l0aCBvcmlnaW5hbCBvYmplY3QuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gc3RhdGUubWFueSA/IHN0YXRlLnJlc3VsdHMgOiBzdGF0ZS5yZXN1bHRzWzBdO1xuICAgICAgICAgICAgaW52b2tlRW5kQ2FsbGJhY2soQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVidWcoXCIlczogJWQgYWN0aXZpdGllcyBoYXMgYmVlbiBzdGFydGVkLiBSZWdpc3RlcmluZyBlbmQgYm9va21hcmsuXCIsIHNlbGZJZCwgc3RhdGUuaW5kaWNlcy5zaXplKTtcbiAgICAgICAgICAgIGxldCBlbmRCTSA9IHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlQ29sbGVjdGluZ0NvbXBsZXRlZEJNTmFtZShzZWxmSWQpO1xuICAgICAgICAgICAgYm9va21hcmtOYW1lcy5wdXNoKGV4ZWNDb250ZXh0LmNyZWF0ZUJvb2ttYXJrKHNlbGZJZCwgZW5kQk0sIGVuZENhbGxiYWNrKSk7XG4gICAgICAgICAgICBzdGF0ZS5lbmRCb29rbWFya05hbWUgPSBlbmRCTTtcbiAgICAgICAgICAgIHNjb3BlLl9fc2NoZWR1bGluZ1N0YXRlID0gc3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUudXBkYXRlKFNpbXBsZVByb3h5LnVwZGF0ZU1vZGUub25lV2F5KTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVidWcoXCIlczogUnVudGltZSBlcnJvciBoYXBwZW5lZDogJXNcIiwgc2VsZklkLCBlLnN0YWNrKTtcbiAgICAgICAgaWYgKGJvb2ttYXJrTmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBTZXQgYm9va21hcmtzIHRvIG5vb3A6ICRqXCIsIHNlbGZJZCwgYm9va21hcmtOYW1lcyk7XG4gICAgICAgICAgICBleGVjQ29udGV4dC5ub29wQ2FsbGJhY2tzKGJvb2ttYXJrTmFtZXMpO1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLmRlbGV0ZShcIl9fc2NoZWR1bGluZ1N0YXRlXCIpO1xuICAgICAgICBkZWJ1ZyhcIiVzOiBJbnZva2luZyBlbmQgY2FsbGJhY2sgd2l0aCB0aGUgZXJyb3IuXCIsIHNlbGZJZCk7XG4gICAgICAgIGludm9rZUVuZENhbGxiYWNrKEFjdGl2aXR5LnN0YXRlcy5mYWlsLCBlKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIGRlYnVnKFwiJXM6IEZpbmFsIHN0YXRlIGluZGljZXMgY291bnQ6ICVkLCB0b3RhbDogJWRcIiwgc2VsZklkLCBzdGF0ZS5pbmRpY2VzLnNpemUsIHN0YXRlLnRvdGFsKTtcbiAgICB9XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUucmVzdWx0Q29sbGVjdGVkID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCwgYm9va21hcmspIHtcbiAgICBsZXQgc2VsZklkID0gY2FsbENvbnRleHQuaW5zdGFuY2VJZDtcbiAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgIGxldCBjaGlsZElkID0gc3BlY1N0cmluZ3MuZ2V0U3RyaW5nKGJvb2ttYXJrLm5hbWUpO1xuICAgIGRlYnVnKFwiJXM6IFNjaGVkdWxpbmcgcmVzdWx0IGl0ZW0gY29sbGVjdGVkLCBjaGlsZElkOiAlcywgcmVhc29uOiAlcywgcmVzdWx0OiAlaiwgYm9va21hcms6ICVqXCIsIHNlbGZJZCwgY2hpbGRJZCwgcmVhc29uLCByZXN1bHQsIGJvb2ttYXJrKTtcblxuICAgIGxldCBmaW5pc2hlZCA9IG51bGw7XG4gICAgbGV0IHN0YXRlID0gdGhpcy5fX3NjaGVkdWxpbmdTdGF0ZTtcbiAgICB0cnkge1xuICAgICAgICBpZiAoIV8uaXNPYmplY3Qoc3RhdGUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihcIlZhbHVlIG9mIF9fc2NoZWR1bGluZ1N0YXRlIGlzICdcIiArIHN0YXRlICsgXCInLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaW5kZXggPSBzdGF0ZS5pbmRpY2VzLmdldChjaGlsZElkKTtcbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoaW5kZXgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihgQ2hpbGQgYWN0aXZpdHkgb2YgJyR7Y2hpbGRJZH0nIHNjaGVkdWxpbmcgc3RhdGUgaW5kZXggb3V0IG9mIHJlbmdlLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVidWcoXCIlczogRmluaXNoZWQgY2hpbGQgYWN0aXZpdHkgaWQgaXM6ICVzXCIsIHNlbGZJZCwgY2hpbGRJZCk7XG5cbiAgICAgICAgc3dpdGNoIChyZWFzb24pIHtcbiAgICAgICAgICAgIGNhc2UgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlOlxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFNldHRpbmcgJWQuIHZhbHVlIHRvIHJlc3VsdDogJWpcIiwgc2VsZklkLCBpbmRleCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5yZXN1bHRzW2luZGV4XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBSZW1vdmluZyBpZCBmcm9tIHN0YXRlLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmluZGljZXMuZGVsZXRlKGNoaWxkSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmNvbXBsZXRlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGl2aXR5LnN0YXRlcy5mYWlsOlxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFN0b3JpbmcgZXJyb3IuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuZXJyb3JzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBSZW1vdmluZyBpZCBmcm9tIHN0YXRlLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmluZGljZXMuZGVsZXRlKGNoaWxkSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsOlxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IEluY3JlbWVudGluZyBjYW5jZWwgY291bnRlci5cIiwgc2VsZklkKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5jYW5jZWxDb3VudCsrO1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IFJlbW92aW5nIGlkIGZyb20gc3RhdGUuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuaW5kaWNlcy5kZWxldGUoY2hpbGRJZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGl2aXR5LnN0YXRlcy5pZGxlOlxuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IEluY3JlbWVudGluZyBpZGxlIGNvdW50ZXIuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuaWRsZUNvdW50Kys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKGBSZXN1bHQgY29sbGVjdGVkIHdpdGggdW5rbm93biByZWFzb24gJyR7cmVhc29ufScuYCk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWJ1ZyhcIiVzOiBTdGF0ZSBzbyBmYXIgPSB0b3RhbDogJXMsIGluZGljZXMgY291bnQ6ICVkLCBjb21wbGV0ZWQgY291bnQ6ICVkLCBjYW5jZWwgY291bnQ6ICVkLCBlcnJvciBjb3VudDogJWQsIGlkbGUgY291bnQ6ICVkXCIsXG4gICAgICAgICAgICBzZWxmSWQsXG4gICAgICAgICAgICBzdGF0ZS50b3RhbCxcbiAgICAgICAgICAgIHN0YXRlLmluZGljZXMuc2l6ZSxcbiAgICAgICAgICAgIHN0YXRlLmNvbXBsZXRlZENvdW50LFxuICAgICAgICAgICAgc3RhdGUuY2FuY2VsQ291bnQsXG4gICAgICAgICAgICBzdGF0ZS5lcnJvcnMubGVuZ3RoLFxuICAgICAgICAgICAgc3RhdGUuaWRsZUNvdW50KTtcblxuICAgICAgICBsZXQgZW5kV2l0aE5vQ29sbGVjdEFsbCA9ICFjYWxsQ29udGV4dC5hY3Rpdml0eS5jb2xsZWN0QWxsICYmIHJlYXNvbiAhPT0gQWN0aXZpdHkuc3RhdGVzLmlkbGU7XG4gICAgICAgIGlmIChlbmRXaXRoTm9Db2xsZWN0QWxsKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiAtLS0tIENvbGxlY3Rpbmcgb2YgdmFsdWVzIGVuZGVkLCBiZWNhdXNlIHdlJ3JlIG5vdCBjb2xsZWN0aW5nIGFsbCB2YWx1ZXMgKGVnLjogUGljaykuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICBkZWJ1ZyhcIiVzOiBTaHV0dGluZyBkb3duICVkIG90aGVyLCBydW5uaW5nIGFjaXR2aXRpZXMuXCIsIHNlbGZJZCwgc3RhdGUuaW5kaWNlcy5zaXplKTtcbiAgICAgICAgICAgIGxldCBpZHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGlkIG9mIHN0YXRlLmluZGljZXMua2V5cygpKSB7XG4gICAgICAgICAgICAgICAgaWRzLnB1c2goaWQpO1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IERlbGV0aW5nIHNjb3BlIG9mIGFjdGl2aXR5OiAlc1wiLCBzZWxmSWQsIGlkKTtcbiAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5kZWxldGVTY29wZU9mQWN0aXZpdHkoY2FsbENvbnRleHQsIGlkKTtcbiAgICAgICAgICAgICAgICBsZXQgaWJtTmFtZSA9IHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlVmFsdWVDb2xsZWN0ZWRCTU5hbWUoaWQpO1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IERlbGV0aW5nIHZhbHVlIGNvbGxlY3RlZCBib29rbWFyazogJXNcIiwgc2VsZklkLCBpYm1OYW1lKTtcbiAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5kZWxldGVCb29rbWFyayhpYm1OYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4ZWNDb250ZXh0LmNhbmNlbEV4ZWN1dGlvbih0aGlzLCBpZHMpO1xuICAgICAgICAgICAgZGVidWcoXCIlczogQWN0aXZpdGllcyBjYW5jZWxsZWQ6ICVqXCIsIHNlbGZJZCwgaWRzKTtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IFJlcG9ydGluZyB0aGUgYWN0dWFsIHJlYXNvbjogJXMgYW5kIHJlc3VsdDogJWpcIiwgc2VsZklkLCByZWFzb24sIHJlc3VsdCk7XG4gICAgICAgICAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHsgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBzdGF0ZS5lbmRCb29rbWFya05hbWUsIHJlYXNvbiwgcmVzdWx0KTsgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBvbkVuZCA9IChzdGF0ZS5pbmRpY2VzLnNpemUgLSBzdGF0ZS5pZGxlQ291bnQpID09PSAwO1xuICAgICAgICAgICAgaWYgKG9uRW5kKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCIlczogLS0tLSBDb2xsZWN0aW5nIG9mIHZhbHVlcyBlbmRlZCAoZW5kZWQgYmVjYXVzZSBvZiBjb2xsZWN0IGFsbCBpcyBvZmY6ICVzKS5cIiwgc2VsZklkLCBlbmRXaXRoTm9Db2xsZWN0QWxsKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBDb2xsZWN0aW5nIGhhcyBiZWVuIGZhaWxlZCwgcmVzdW1pbmcgZW5kIGJvb2ttYXJrcyB3aXRoIGVycm9yczogJWpcIiwgc2VsZklkLCBzdGF0ZS5lcnJvcnMpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZXJyb3IgPSBzdGF0ZS5lcnJvcnMubGVuZ3RoID09PSAxID8gc3RhdGUuZXJyb3JzWzBdIDogbmV3IGVycm9ycy5BZ2dyZWdhdGVFcnJvcihzdGF0ZS5lcnJvcnMpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHsgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBzdGF0ZS5lbmRCb29rbWFya05hbWUsIEFjdGl2aXR5LnN0YXRlcy5mYWlsLCBlcnJvcik7IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXRlLmNhbmNlbENvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiJXM6IENvbGxlY3RpbmcgaGFzIGJlZW4gY2FuY2VsbGVkLCByZXN1bWluZyBlbmQgYm9va21hcmtzLlwiLCBzZWxmSWQpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHsgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBzdGF0ZS5lbmRCb29rbWFya05hbWUsIEFjdGl2aXR5LnN0YXRlcy5jYW5jZWwpOyB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0ZS5pZGxlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWcoXCIlczogVGhpcyBlbnRyeSBoYXMgYmVlbiBnb25lIHRvIGlkbGUsIHByb3BhZ2F0aW5nIGNvdW50ZXIuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmlkbGVDb3VudC0tOyAvLyBCZWNhdXNlIHRoZSBuZXh0IGNhbGwgd2lsbCB3YWtlIHVwIGEgdGhyZWFkLlxuICAgICAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIHN0YXRlLmVuZEJvb2ttYXJrTmFtZSwgQWN0aXZpdHkuc3RhdGVzLmlkbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gc3RhdGUubWFueSA/IHN0YXRlLnJlc3VsdHMgOiBzdGF0ZS5yZXN1bHRzWzBdO1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIiVzOiBUaGlzIGVudHJ5IGhhcyBiZWVuIGNvbXBsZXRlZCwgcmVzdW1pbmcgY29sbGVjdCBib29rbWFyayB3aXRoIHRoZSByZXN1bHQocyk6ICVqXCIsIHNlbGZJZCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7IGV4ZWNDb250ZXh0LnJlc3VtZUJvb2ttYXJrSW5TY29wZShjYWxsQ29udGV4dCwgc3RhdGUuZW5kQm9va21hcmtOYW1lLCBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGUsIHJlc3VsdCk7IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwoZSk7XG4gICAgICAgIHRoaXMuZGVsZXRlKFwiX19zY2hlZHVsaW5nU3RhdGVcIik7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBpZiAoZmluaXNoZWQpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiJXM6IFNjaGR1bGluZyBmaW5pc2hlZCwgcmVtb3Zpbmcgc3RhdGUuXCIsIHNlbGZJZCk7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZShcIl9fc2NoZWR1bGluZ1N0YXRlXCIpO1xuXG4gICAgICAgICAgICBpZiAoIWNhbGxDb250ZXh0LmFjdGl2aXR5Ll9zY2hlZHVsZVN1YkFjdGl2aXRpZXMuY2FsbCh0aGlzLCBjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQsIHN0YXRlLmVuZEJvb2ttYXJrTmFtZSwgc3RhdGUuZW5kQ2FsbGJhY2tOYW1lKSkge1xuICAgICAgICAgICAgICAgIGZpbmlzaGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX3NjaGVkdWxlU3ViQWN0aXZpdGllcyA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQsIGVuZEJvb2ttYXJrTmFtZSwgZW5kQ2FsbGJhY2tOYW1lKSB7XG4gICAgaWYgKHJlYXNvbiAhPT0gQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgc2VsZklkID0gY2FsbENvbnRleHQuaW5zdGFuY2VJZDtcbiAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgIGxldCBhY3Rpdml0aWVzTWFwID0gbmV3IE1hcCgpO1xuICAgIGxldCBhY3Rpdml0aWVzID0gW107XG5cbiAgICBmdW5jdGlvbiByZWcoYWN0aXZpdHksIGluZGV4LCBzdWJJbmRleCkge1xuICAgICAgICBpbmRleCA9IF8uaXNOdW1iZXIoaW5kZXgpID8gaW5kZXggOiBudWxsO1xuICAgICAgICBzdWJJbmRleCA9IF8uaXNOdW1iZXIoc3ViSW5kZXgpID8gc3ViSW5kZXggOiBudWxsO1xuICAgICAgICBsZXQgYXJySW5kZXggPSBhY3Rpdml0aWVzLmxlbmd0aDtcbiAgICAgICAgYWN0aXZpdGllcy5wdXNoKGFjdGl2aXR5KTtcbiAgICAgICAgYWN0aXZpdGllc01hcC5zZXQoYXJySW5kZXgsIHsgaW5kZXg6IGluZGV4LCBzdWJJbmRleDogc3ViSW5kZXggfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVnQXJyKG9iaiwgaW5kZXgpIHtcbiAgICAgICAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBpdGVtID0gb2JqW2ldO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVnKGl0ZW0sIGluZGV4LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqW2ldID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIHJlZyhvYmosIGluZGV4KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoXy5pc0FycmF5KHJlc3VsdCkpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChyZWdBcnIocmVzdWx0W2ldLCBpKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtpXSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAocmVzdWx0IGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgcmVnQXJyKHJlc3VsdCk7XG4gICAgICAgIHJlc3VsdCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCFhY3Rpdml0aWVzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5fX3N1YkFjdGl2aXR5U2NoZWR1bGluZ1N0YXRlID0ge1xuICAgICAgICBlbmRCb29rbWFya05hbWU6IGVuZEJvb2ttYXJrTmFtZSxcbiAgICAgICAgZW5kQ2FsbGJhY2tOYW1lOiBlbmRDYWxsYmFja05hbWUsXG4gICAgICAgIGFjdGl2aXRpZXNNYXA6IGFjdGl2aXRpZXNNYXAsXG4gICAgICAgIG9yaWdpbmFsUmVzdWx0OiByZXN1bHRcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IGVuZEJNID0gc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVDb2xsZWN0aW5nQ29tcGxldGVkQk1OYW1lKHNlbGZJZCk7XG4gICAgICAgIGV4ZWNDb250ZXh0LmRlbGV0ZUJvb2ttYXJrKGVuZEJNKTtcbiAgICAgICAgY2FsbENvbnRleHQuc2NoZWR1bGUoYWN0aXZpdGllcywgXCJfc3ViQWN0aXZpdGllc0dvdFwiKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuZGVsZXRlKFwiX19zdWJBY3Rpdml0eVNjaGVkdWxpbmdTdGF0ZVwiKTtcbiAgICAgICAgY2FsbENvbnRleHQuZmFpbChlKTtcbiAgICB9XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX3N1YkFjdGl2aXRpZXNHb3QgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlYXNvbiAhPT0gQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICBjYWxsQ29udGV4dC5lbmQocmVhc29uLCByZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGV4ZWNDb250ZXh0ID0gY2FsbENvbnRleHQuZXhlY3V0aW9uQ29udGV4dDtcbiAgICAgICAgbGV0IHNlbGZJZCA9IGNhbGxDb250ZXh0Lmluc3RhbmNlSWQ7XG4gICAgICAgIGxldCBzdGF0ZSA9IHRoaXMuX19zdWJBY3Rpdml0eVNjaGVkdWxpbmdTdGF0ZTtcbiAgICAgICAgaWYgKCFfLmlzUGxhaW5PYmplY3Qoc3RhdGUpIHx8ICFfLmlzU3RyaW5nKHN0YXRlLmVuZEJvb2ttYXJrTmFtZSkgfHwgIV8uaXNTdHJpbmcoc3RhdGUuZW5kQ2FsbGJhY2tOYW1lKSB8fCAhKHN0YXRlLmFjdGl2aXRpZXNNYXAgaW5zdGFuY2VvZiBNYXApIHx8ICFzdGF0ZS5vcmlnaW5hbFJlc3VsdCkge1xuICAgICAgICAgICAgY2FsbENvbnRleHQuZmFpbChuZXcgZXJyb3JzLkFjdGl2aXR5UnVudGltZUVycm9yKFwiQ2FsbGJhY2sgJ19zdWJBY3Rpdml0aWVzR290JyBoYXMgYmVlbiBpbnZva2VkLCBidXQgdGhlcmUgaXMgbm8gdmFsaWQgJ19fc3ViQWFjdGl2aXR5U2NoZWR1bGluZ1N0YXRlJyB2YWx1ZSBpbiB0aGUgc2NvcGUuXCIpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV8uaXNBcnJheShyZXN1bHQpIHx8IHJlc3VsdC5sZW5ndGggIT09IHN0YXRlLmFjdGl2aXRpZXNNYXAuc2l6ZSkge1xuICAgICAgICAgICAgY2FsbENvbnRleHQuZmFpbChuZXcgZXJyb3JzLkFjdGl2aXR5UnVudGltZUVycm9yKFwiQ2FsbGJhY2sgJ19zdWJBY3Rpdml0aWVzR290JyBoYXMgYmVlbiBpbnZva2VkLCBidXQgdGhlIHJlc3VsdCBpcyBpbnZhbGlkLlwiKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZmluYWxSZXN1bHQgPSBzdGF0ZS5vcmlnaW5hbFJlc3VsdDtcblxuICAgICAgICBmb3IgKGxldCBrdnAgb2Ygc3RhdGUuYWN0aXZpdGllc01hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGxldCBhcnJJZHggPSBrdnBbMF07XG4gICAgICAgICAgICBsZXQgcG9zID0ga3ZwWzFdO1xuXG4gICAgICAgICAgICBpZiAoXy5pc051bWJlcihhcnJJZHgpICYmIGFycklkeCA+PSAwICYmIGFycklkeCA8IHJlc3VsdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSByZXN1bHRbYXJySWR4XTtcbiAgICAgICAgICAgICAgICBpZiAocG9zLmluZGV4ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbFJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxSZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBwb3MuaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzQXJyYXkoZmluYWxSZXN1bHQpICYmIGluZGV4ID49IDAgJiYgaW5kZXggPCBmaW5hbFJlc3VsdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb3Muc3ViSW5kZXggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmluYWxSZXN1bHRbaW5kZXhdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsUmVzdWx0W2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3ViQXJyYXkgPSBmaW5hbFJlc3VsdFtpbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN1YkluZGV4ID0gcG9zLnN1YkluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLmlzQXJyYXkoc3ViQXJyYXkpICYmIHN1YkluZGV4ID49IDAgJiYgc3ViSW5kZXggPCBzdWJBcnJheS5sZW5ndGggJiYgc3ViQXJyYXlbc3ViSW5kZXhdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YkFycmF5W3N1YkluZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsQ29udGV4dC5mYWlsKG5ldyBlcnJvcnMuQWN0aXZpdHlSdW50aW1lRXJyb3IoXCJDYWxsYmFjayAnX3N1YkFjdGl2aXRpZXNHb3QnIGhhcyBiZWVuIGludm9rZWQsIGJ1dCB0aGUgc3RhdGUgaGFzIGludmFsaWQgdmFsdWVzLlwiKSk7XG4gICAgICAgIH1cblxuICAgICAgICBleGVjQ29udGV4dC5jcmVhdGVCb29rbWFyayhzZWxmSWQsIHN0YXRlLmVuZEJvb2ttYXJrTmFtZSwgc3RhdGUuZW5kQ2FsbGJhY2tOYW1lKTtcbiAgICAgICAgZXhlY0NvbnRleHQucmVzdW1lQm9va21hcmtJblNjb3BlKGNhbGxDb250ZXh0LCBzdGF0ZS5lbmRCb29rbWFya05hbWUsIEFjdGl2aXR5LnN0YXRlcy5jb21wbGV0ZSwgZmluYWxSZXN1bHQpO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5kZWxldGUoXCJfX3N1YkFjdGl2aXR5U2NoZWR1bGluZ1N0YXRlXCIpO1xuICAgIH1cbn07XG4vKiBSVU4gKi9cblxuLyogU0NPUEUgKi9cbkFjdGl2aXR5LnByb3RvdHlwZS5fZ2V0U2NvcGVLZXlzID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBpZiAoIXNlbGYuX3Njb3BlS2V5cyB8fCAhc2VsZi5fc3RydWN0dXJlSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgc2VsZi5fc2NvcGVLZXlzID0gW107XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBzZWxmKSB7XG4gICAgICAgICAgICBpZiAoIXNlbGYubm9uU2NvcGVkUHJvcGVydGllcy5oYXMoa2V5KSAmJiAoXy5pc1VuZGVmaW5lZChBY3Rpdml0eS5wcm90b3R5cGVba2V5XSkgfHwga2V5ID09PSBcIl9kZWZhdWx0RW5kQ2FsbGJhY2tcIiB8fCBrZXkgPT09IFwiX3N1YkFjdGl2aXRpZXNHb3RcIikpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zY29wZUtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzZWxmLl9zY29wZUtleXM7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuY3JlYXRlU2NvcGVQYXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVJ1bnRpbWVFcnJvcihcIkNhbm5vdCBjcmVhdGUgYWN0aXZpdHkgc2NvcGUgZm9yIHVuaW5pdGlhbGl6ZWQgYWN0aXZpdGllcy5cIik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NyZWF0ZVNjb3BlUGFydEltcGwgPT09IG51bGwpIHtcbiAgICAgICAgbGV0IGZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgbGV0IHNyYyA9IFwicmV0dXJuIHtcIjtcbiAgICAgICAgZm9yIChsZXQgZmllbGROYW1lIG9mIHRoaXMuX2dldFNjb3BlS2V5cygpKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3JjICs9IFwiLFxcblwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKF8uaXNQbGFpbk9iamVjdCh0aGlzW2ZpZWxkTmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgc3JjICs9IGZpZWxkTmFtZSArIFwiOl8uY2xvbmUoYS5cIiArIGZpZWxkTmFtZSArIFwiLCB0cnVlKVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoXy5pc0FycmF5KHRoaXNbZmllbGROYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gZmllbGROYW1lICsgXCI6YS5cIiArIGZpZWxkTmFtZSArIFwiLnNsaWNlKDApXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gZmllbGROYW1lICsgXCI6YS5cIiArIGZpZWxkTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzcmMgKz0gXCJ9XCI7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVNjb3BlUGFydEltcGwgPSBuZXcgRnVuY3Rpb24oXCJhLF9cIiwgc3JjKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZGVidWcoXCJJbnZhbGlkIHNjb3BlIHBhcnQgZnVuY3Rpb246JXNcIiwgc3JjKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCh0aGlzLCBfKTtcbn07XG4vKiBTQ09QRSAqL1xuXG5BY3Rpdml0eS5zdGF0ZXMgPSBlbnVtcy5BY3Rpdml0eVN0YXRlcztcblxubW9kdWxlLmV4cG9ydHMgPSBBY3Rpdml0eTtcbiJdfQ==
