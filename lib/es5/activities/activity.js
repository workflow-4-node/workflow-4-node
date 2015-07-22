"use strict";
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
function Activity() {
  this[guids.types.activity] = true;
  this._runtimeId = uuid.v4();
  this.instanceId = null;
  this.args = null;
  this.displayName = null;
  this.id = null;
  this._structureInitialized = false;
  this._scopeKeys = null;
  this["@require"] = null;
  this.nonSerializedProperties = new Set();
  this.nonScopedProperties = new Set();
  this.nonScopedProperties.add(guids.types.activity);
  this.nonScopedProperties.add("nonScopedProperties");
  this.nonScopedProperties.add("nonSerializedProperties");
  this.nonScopedProperties.add("_runtimeId");
  this.nonScopedProperties.add("activity");
  this.nonScopedProperties.add("id");
  this.nonScopedProperties.add("instanceId");
  this.nonScopedProperties.add("args");
  this.nonScopedProperties.add("__typeTag");
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
  }
});
Activity.prototype.toString = function() {
  return (this.displayName ? (this.displayName + " ") : "") + "(" + this.constructor.name + ":" + this.instanceId + ")";
};
Activity.prototype.forEach = function(f) {
  var visited = {};
  return this._doForEach(f, visited, null);
};
Activity.prototype.forEachChild = function(f) {
  var visited = {};
  return this._doForEach(f, visited, this);
};
Activity.prototype.forEachImmediateChild = function(f, execContext) {
  var self = this;
  for (var fieldName in self) {
    var fieldValue = self[fieldName];
    if (fieldValue) {
      if (_.isArray(fieldValue)) {
        var $__3 = true;
        var $__4 = false;
        var $__5 = undefined;
        try {
          for (var $__1 = void 0,
              $__0 = (fieldValue)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
            var obj = $__1.value;
            {
              if (obj instanceof Activity) {
                f(obj);
              }
            }
          }
        } catch ($__6) {
          $__4 = true;
          $__5 = $__6;
        } finally {
          try {
            if (!$__3 && $__0.return != null) {
              $__0.return();
            }
          } finally {
            if ($__4) {
              throw $__5;
            }
          }
        }
      } else if (fieldValue instanceof Activity) {
        f(fieldValue);
      }
    }
  }
};
Activity.prototype._doForEach = function(f, visited, except) {
  var self = this;
  if (is.undefined(visited[self._runtimeId])) {
    visited[self._runtimeId] = true;
    if (self !== except) {
      f(self);
    }
    for (var fieldName in self) {
      var fieldValue = self[fieldName];
      if (fieldValue) {
        if (_.isArray(fieldValue)) {
          var $__3 = true;
          var $__4 = false;
          var $__5 = undefined;
          try {
            for (var $__1 = void 0,
                $__0 = (fieldValue)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
              var obj = $__1.value;
              {
                if (obj instanceof Activity) {
                  obj._doForEach(f, visited, except);
                }
              }
            }
          } catch ($__6) {
            $__4 = true;
            $__5 = $__6;
          } finally {
            try {
              if (!$__3 && $__0.return != null) {
                $__0.return();
              }
            } finally {
              if ($__4) {
                throw $__5;
              }
            }
          }
        } else if (fieldValue instanceof Activity) {
          fieldValue._doForEach(f, visited, except);
        }
      }
    }
  }
};
Activity.prototype._initializeStructure = function() {
  if (!this._structureInitialized) {
    this.initializeStructure();
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
      value.forEach(function(item) {
        newSet.add(item);
      });
      return newSet;
    } else if (_.isArray(value)) {
      if (canCloneArrays) {
        var newArray = [];
        var $__3 = true;
        var $__4 = false;
        var $__5 = undefined;
        try {
          for (var $__1 = void 0,
              $__0 = (value)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
            var item = $__1.value;
            {
              newArray.push(makeClone(item, false));
            }
          }
        } catch ($__6) {
          $__4 = true;
          $__5 = $__6;
        } finally {
          try {
            if (!$__3 && $__0.return != null) {
              $__0.return();
            }
          } finally {
            if ($__4) {
              throw $__5;
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
    state.reportState(Activity.states.run);
    try {
      self.initializeExec.call(myCallContext.scope);
      self.run.call(myCallContext.scope, myCallContext, args || self.args || []);
    } catch (e) {
      self.fail(e);
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
    return ;
  }
  state.execState = reason;
  var inIdle = reason === Activity.states.idle;
  var execContext = callContext.executionContext;
  callContext = callContext.back(inIdle);
  if (callContext) {
    try {
      var bmName = specStrings.activities.createValueCollectedBMName(this);
      if (execContext.isBookmarkExists(bmName)) {
        state.emitState(result);
        execContext.resumeBookmarkInScope(callContext, bmName, reason, result);
        return ;
      }
    } catch (e) {
      callContext.fail(e);
    }
  } else {
    if (inIdle && execContext.processResumeBookmarkQueue()) {
      return ;
    }
  }
  state.emitState(result);
};
Activity.prototype._defaultEndCallback = function(callContext, reason, result) {
  callContext.end(reason, result);
};
Activity.prototype.schedule = function(callContext, obj, endCallback) {
  var self = this;
  var scope = callContext.scope;
  var execContext = callContext.executionContext;
  if (!endCallback) {
    endCallback = "_defaultEndCallback";
  }
  if (!_.isString(endCallback)) {
    callContext.fail(new TypeError("Provided argument 'endCallback' value is not a string."));
    return ;
  }
  var cb = scope.get(endCallback);
  if (!_.isFunction(cb)) {
    callContext.fail(new TypeError(("'" + endCallback + "' is not a function.")));
    return ;
  }
  var bookmarkNames = [];
  try {
    var isGenerator = is.generator(obj);
    if (_.isArray(obj) && obj.length || isGenerator) {
      scope.set("__collectValues", []);
      var activities = [];
      var variables = [];
      var items = isGenerator ? obj() : obj;
      var $__3 = true;
      var $__4 = false;
      var $__5 = undefined;
      try {
        for (var $__1 = void 0,
            $__0 = (items)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
          var item = $__1.value;
          {
            if (item instanceof Activity) {
              scope.get("__collectValues").push(specStrings.activities.asValueToCollect(item));
              activities.push(item);
              variables.push(null);
            } else if (_.isObject(item) && item.activity instanceof Activity) {
              scope.get("__collectValues").push(specStrings.activities.asValueToCollect(item.activity));
              activities.push(item.activity);
              variables.push(_.isObject(item.variables) ? item.variables : null);
            } else {
              scope.get("__collectValues").push(item);
              variables.push(null);
            }
          }
        }
      } catch ($__6) {
        $__4 = true;
        $__5 = $__6;
      } finally {
        try {
          if (!$__3 && $__0.return != null) {
            $__0.return();
          }
        } finally {
          if ($__4) {
            throw $__5;
          }
        }
      }
      if (activities.length) {
        scope.set("__collectPickRound2", false);
        scope.set("__collectErrors", []);
        scope.set("__collectCancelCounts", 0);
        scope.set("__collectIdleCounts", 0);
        scope.set("__collectRemaining", activities.length);
        var endBM = scope.set("__collectEndBookmarkName", specStrings.activities.createCollectingCompletedBMName(self));
        bookmarkNames.push(execContext.createBookmark(self.instanceId, scope.get("__collectEndBookmarkName"), endCallback));
        var len = activities.length;
        for (var i = 0; i < len; i++) {
          var childActivity = activities[i];
          var childVariables = variables[i];
          bookmarkNames.push(execContext.createBookmark(self.instanceId, specStrings.activities.createValueCollectedBMName(childActivity), "resultCollected"));
          childActivity._start(callContext, childVariables);
          if (!execContext.isBookmarkExists(endBM)) {
            break;
          }
        }
      } else {
        var result = scope.get("__collectValues");
        scope.delete("__collectValues");
        scope.get(endCallback).call(scope, callContext, Activity.states.complete, result);
      }
    } else if (obj instanceof Activity) {
      bookmarkNames.push(execContext.createBookmark(self.instanceId, specStrings.activities.createValueCollectedBMName(obj), endCallback));
      obj.start(callContext);
    } else if (_.isObject(obj) && obj.activity instanceof Activity) {
      bookmarkNames.push(execContext.createBookmark(self.instanceId, specStrings.activities.createValueCollectedBMName(obj.activity), endCallback));
      obj.activity._start(callContext, _.isObject(obj.variables) ? obj.variables : null);
    } else {
      scope.get(endCallback).call(scope, callContext, Activity.states.complete, obj);
    }
  } catch (e) {
    execContext.noopCallbacks(bookmarkNames);
    scope.get(endCallback).call(scope, callContext, Activity.states.fail, e);
  }
};
Activity.prototype.resultCollected = function(callContext, reason, result, bookmark) {
  var self = this;
  try {
    var execContext = callContext.executionContext;
    var childId = specStrings.getString(bookmark.name);
    var argMarker = specStrings.activities.asValueToCollect(childId);
    var resultIndex = self.get("__collectValues").indexOf(argMarker);
    var pickCurrent = false;
    if (resultIndex === -1) {
      self.get("__collectErrors").push(new errors.ActivityStateExceptionError("Activity '" + childId + "' is not found in __collectValues."));
    } else {
      if (self.get("__collectPick") && (reason !== Activity.states.idle || self.get("__collectPickRound2"))) {
        var ids = [];
        var $__3 = true;
        var $__4 = false;
        var $__5 = undefined;
        try {
          for (var $__1 = void 0,
              $__0 = (self.get("__collectValues"))[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
            var cv = $__1.value;
            {
              var id = specStrings.getString(cv);
              if (id && id !== childId) {
                ids.push(id);
                execContext.deleteScopeOfActivity(callContext, id);
                var ibmName = specStrings.activities.createValueCollectedBMName(id);
                execContext.deleteBookmark(ibmName);
              }
            }
          }
        } catch ($__6) {
          $__4 = true;
          $__5 = $__6;
        } finally {
          try {
            if (!$__3 && $__0.return != null) {
              $__0.return();
            }
          } finally {
            if ($__4) {
              throw $__5;
            }
          }
        }
        execContext.cancelExecution(ids);
        pickCurrent = true;
      } else {
        switch (reason) {
          case Activity.states.complete:
            self.get("__collectValues")[resultIndex] = result;
            break;
          case Activity.states.cancel:
            self.inc("__collectCancelCounts");
            self.get("__collectValues")[resultIndex] = null;
            break;
          case Activity.states.idle:
            self.inc("__collectIdleCounts");
            break;
          case Activity.states.fail:
            result = result || new errors.ActivityStateExceptionError("Unknown error.");
            self.get("__collectErrors").push(result);
            self.get("__collectValues")[resultIndex] = null;
            break;
          default:
            self.get("__collectErrors").push(new errors.ActivityStateExceptionError("Bookmark should not be continued with reason '" + reason + "'."));
            self.get("__collectValues")[resultIndex] = null;
            break;
        }
      }
    }
    if (self.dec("__collectRemaining") === 0 || pickCurrent) {
      var endBookmarkName = self.get("__collectEndBookmarkName");
      if (!pickCurrent) {
        if (self.get("__collectErrors").length) {
          reason = Activity.states.fail;
          var __collectErrors = self.get("__collectErrors");
          if (__collectErrors.length === 1) {
            result = __collectErrors[0];
          } else {
            result = new errors.AggregateError(__collectErrors);
          }
        } else if (self.get("__collectCancelCounts")) {
          reason = Activity.states.cancel;
        } else if (self.get("__collectIdleCounts")) {
          reason = Activity.states.idle;
          self.set("__collectRemaining", 1);
          self.dec("__collectIdleCounts");
          if (self.get("__collectPick")) {
            self.set("__collectPickRound2", true);
          }
        } else {
          reason = Activity.states.complete;
          result = self.get("__collectValues");
        }
      }
      if (!self.get("__collectRemaining")) {
        self.delete("__collectValues");
        self.delete("__collectRemaining");
        self.delete("__collectIdleCounts");
        self.delete("__collectEndBookmarkName");
        self.delete("__collectCancelCounts");
        self.delete("__collectErrors");
        self.delete("__collectPick");
        self.delete("__collectPickRound2");
      }
      execContext.resumeBookmarkInScope(callContext, endBookmarkName, reason, result);
    }
  } catch (e) {
    callContext.fail(e);
  }
};
Activity.prototype._getScopeKeys = function() {
  var self = this;
  if (!self._scopeKeys || !self._structureInitialized) {
    self._scopeKeys = [];
    for (var key in self) {
      if (!self.nonScopedProperties.has(key) && (_.isUndefined(Activity.prototype[key]) || key === "_defaultEndCallback")) {
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
    var $__3 = true;
    var $__4 = false;
    var $__5 = undefined;
    try {
      for (var $__1 = void 0,
          $__0 = (this._getScopeKeys())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
        var fieldName = $__1.value;
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
    } catch ($__6) {
      $__4 = true;
      $__5 = $__6;
    } finally {
      try {
        if (!$__3 && $__0.return != null) {
          $__0.return();
        }
      } finally {
        if ($__4) {
          throw $__5;
        }
      }
    }
    src += "}";
    this._createScopePartImpl = new Function("a,_", src);
  }
  return this._createScopePartImpl(this, _);
};
Activity.states = enums.ActivityStates;
module.exports = Activity;
//# sourceMappingURL=data:application/json;base64,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QUcsQ0FBRztBQUMxRCxvQkFBd0IsQUFBQyxFQUFDLENBQUM7UUFDN0I7QUFBQSxNQUNGLENBQUUsT0FBUTtBQUNSLGdCQUF3QjtBQUN0QixvQkFBd0I7UUFDMUI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEFBMGdCQSxNQUFFLEdBQUssSUFBRSxDQUFDO0FBRVYsT0FBRyxxQkFBcUIsRUFBSSxJQUFJLFNBQU8sQUFBQyxDQUFDLEtBQUksQ0FBRyxJQUFFLENBQUMsQ0FBQztFQUN4RDtBQUFBLEFBRUEsT0FBTyxDQUFBLElBQUcscUJBQXFCLEFBQUMsQ0FBQyxJQUFHLENBQUcsRUFBQSxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUdELE9BQU8sT0FBTyxFQUFJLENBQUEsS0FBSSxlQUFlLENBQUM7QUFFdEMsS0FBSyxRQUFRLEVBQUksU0FBTyxDQUFDO0FBQ3pCIiwiZmlsZSI6ImFjdGl2aXRpZXMvYWN0aXZpdHkuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIi8qanNoaW50IC1XMDU0ICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5sZXQgZ3VpZHMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2d1aWRzXCIpO1xubGV0IGVycm9ycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZXJyb3JzXCIpO1xubGV0IGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcbmxldCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbmxldCBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBDYWxsQ29udGV4dCA9IHJlcXVpcmUoXCIuL2NhbGxDb250ZXh0XCIpO1xubGV0IHV1aWQgPSByZXF1aXJlKCdub2RlLXV1aWQnKTtcbmxldCBhc3luYyA9IHJlcXVpcmUoXCIuLi9jb21tb24vYXN5bmNIZWxwZXJzXCIpLmFzeW5jO1xuXG5mdW5jdGlvbiBBY3Rpdml0eSgpIHtcbiAgICB0aGlzW2d1aWRzLnR5cGVzLmFjdGl2aXR5XSA9IHRydWU7XG4gICAgdGhpcy5fcnVudGltZUlkID0gdXVpZC52NCgpO1xuICAgIHRoaXMuaW5zdGFuY2VJZCA9IG51bGw7XG4gICAgdGhpcy5hcmdzID0gbnVsbDtcbiAgICB0aGlzLmRpc3BsYXlOYW1lID0gbnVsbDtcbiAgICB0aGlzLmlkID0gbnVsbDtcbiAgICB0aGlzLl9zdHJ1Y3R1cmVJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuX3Njb3BlS2V5cyA9IG51bGw7XG4gICAgdGhpc1tcIkByZXF1aXJlXCJdID0gbnVsbDtcblxuICAgIC8vIFByb3BlcnRpZXMgbm90IHNlcmlhbGl6ZWQ6XG4gICAgdGhpcy5ub25TZXJpYWxpemVkUHJvcGVydGllcyA9IG5ldyBTZXQoKTtcblxuICAgIC8vIFByb3BlcnRpZXMgYXJlIG5vdCBnb2luZyB0byBjb3BpZWQgaW4gdGhlIHNjb3BlOlxuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKGd1aWRzLnR5cGVzLmFjdGl2aXR5KTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwibm9uU2NvcGVkUHJvcGVydGllc1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwibm9uU2VyaWFsaXplZFByb3BlcnRpZXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl9ydW50aW1lSWRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImFjdGl2aXR5XCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJpZFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiaW5zdGFuY2VJZFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiYXJnc1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiX190eXBlVGFnXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJkaXNwbGF5TmFtZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY29tcGxldGVcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImNhbmNlbFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiaWRsZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiZmFpbFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiZW5kXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJzY2hlZHVsZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY3JlYXRlQm9va21hcmtcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInJlc3VtZUJvb2ttYXJrXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJyZXN1bHRDb2xsZWN0ZWRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImNvZGVQcm9wZXJ0aWVzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJpbml0aWFsaXplU3RydWN0dXJlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfaW5pdGlhbGl6ZVN0cnVjdHVyZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiX3N0cnVjdHVyZUluaXRpYWxpemVkXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjbG9uZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiX3Njb3BlS2V5c1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiX2NyZWF0ZVNjb3BlUGFydEltcGxcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIkByZXF1aXJlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJpbml0aWFsaXplRXhlY1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwidW5Jbml0aWFsaXplRXhlY1wiKTtcblxuICAgIHRoaXMuY29kZVByb3BlcnRpZXMgPSBuZXcgU2V0KCk7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEFjdGl2aXR5LnByb3RvdHlwZSwge1xuICAgIF9zY29wZUtleXM6IHtcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgX2NyZWF0ZVNjb3BlUGFydEltcGw6IHtcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH1cbn0pO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLmRpc3BsYXlOYW1lID8gKHRoaXMuZGlzcGxheU5hbWUgKyBcIiBcIikgOiBcIlwiKSArIFwiKFwiICsgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgXCI6XCIgKyB0aGlzLmluc3RhbmNlSWQgKyBcIilcIjtcbn07XG5cbi8qIGZvckVhY2ggKi9cbkFjdGl2aXR5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGYpIHtcbiAgICBsZXQgdmlzaXRlZCA9IHt9O1xuICAgIHJldHVybiB0aGlzLl9kb0ZvckVhY2goZiwgdmlzaXRlZCwgbnVsbCk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuZm9yRWFjaENoaWxkID0gZnVuY3Rpb24gKGYpIHtcbiAgICBsZXQgdmlzaXRlZCA9IHt9O1xuICAgIHJldHVybiB0aGlzLl9kb0ZvckVhY2goZiwgdmlzaXRlZCwgdGhpcyk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuZm9yRWFjaEltbWVkaWF0ZUNoaWxkID0gZnVuY3Rpb24gKGYsIGV4ZWNDb250ZXh0KSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgZm9yIChsZXQgZmllbGROYW1lIGluIHNlbGYpIHtcbiAgICAgICAgbGV0IGZpZWxkVmFsdWUgPSBzZWxmW2ZpZWxkTmFtZV07XG4gICAgICAgIGlmIChmaWVsZFZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmKG9iaik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChmaWVsZFZhbHVlIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICBmKGZpZWxkVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLl9kb0ZvckVhY2ggPSBmdW5jdGlvbiAoZiwgdmlzaXRlZCwgZXhjZXB0KSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmIChpcy51bmRlZmluZWQodmlzaXRlZFtzZWxmLl9ydW50aW1lSWRdKSkge1xuICAgICAgICB2aXNpdGVkW3NlbGYuX3J1bnRpbWVJZF0gPSB0cnVlO1xuXG4gICAgICAgIGlmIChzZWxmICE9PSBleGNlcHQpIHtcbiAgICAgICAgICAgIGYoc2VsZik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgaW4gc2VsZikge1xuICAgICAgICAgICAgbGV0IGZpZWxkVmFsdWUgPSBzZWxmW2ZpZWxkTmFtZV07XG4gICAgICAgICAgICBpZiAoZmllbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLmlzQXJyYXkoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5fZG9Gb3JFYWNoKGYsIHZpc2l0ZWQsIGV4Y2VwdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmllbGRWYWx1ZSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUuX2RvRm9yRWFjaChmLCB2aXNpdGVkLCBleGNlcHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG4vKiBmb3JFYWNoICovXG5cbi8qIFN0cnVjdHVyZSAqL1xuQWN0aXZpdHkucHJvdG90eXBlLl9pbml0aWFsaXplU3RydWN0dXJlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fc3RydWN0dXJlSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplU3RydWN0dXJlKCk7XG4gICAgICAgIHRoaXMuX3N0cnVjdHVyZUluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuaW5pdGlhbGl6ZVN0cnVjdHVyZSA9IF8ubm9vcDtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIG1ha2VDbG9uZSh2YWx1ZSwgY2FuQ2xvbmVBcnJheXMpIHtcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5jbG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBsZXQgbmV3U2V0ID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgdmFsdWUuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIG5ld1NldC5hZGQoaXRlbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBuZXdTZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKGNhbkNsb25lQXJyYXlzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld0FycmF5ID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdBcnJheS5wdXNoKG1ha2VDbG9uZShpdGVtLCBmYWxzZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3QXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY2xvbmUgYWN0aXZpdHkncyBuZXN0ZWQgYXJyYXlzLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCBDb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG4gICAgbGV0IG5ld0luc3QgPSBuZXcgQ29uc3RydWN0b3IoKTtcbiAgICBmb3IgKGxldCBrZXkgaW4gdGhpcykge1xuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzW2tleV07XG4gICAgICAgIGlmIChuZXdJbnN0W2tleV0gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBuZXdJbnN0W2tleV0gPSBtYWtlQ2xvbmUodmFsdWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdJbnN0O1xufTtcblxuLyogUlVOICovXG5BY3Rpdml0eS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIShjYWxsQ29udGV4dCBpbnN0YW5jZW9mIENhbGxDb250ZXh0KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCAnY29udGV4dCcgaXMgbm90IGFuIGluc3RhbmNlIG9mIEFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5cIik7XG4gICAgfVxuXG4gICAgbGV0IGFyZ3MgPSBzZWxmLmFyZ3M7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGFyZ3MgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fc3RhcnQoY2FsbENvbnRleHQsIG51bGwsIGFyZ3MpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLl9zdGFydCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgdmFyaWFibGVzLCBhcmdzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IG15Q2FsbENvbnRleHQgPSBjYWxsQ29udGV4dC5uZXh0KHNlbGYsIHZhcmlhYmxlcyk7XG4gICAgbGV0IHN0YXRlID0gbXlDYWxsQ29udGV4dC5leGVjdXRpb25TdGF0ZTtcbiAgICBpZiAoc3RhdGUuaXNSdW5uaW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFjdGl2aXR5IGlzIGFscmVhZHkgcnVubmluZy5cIik7XG4gICAgfVxuXG4gICAgLy8gV2Ugc2hvdWxkIGFsbG93IElPIG9wZXJhdGlvbnMgdG8gZXhlY3V0ZTpcbiAgICBzZXRJbW1lZGlhdGUoXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHN0YXRlLnJlcG9ydFN0YXRlKEFjdGl2aXR5LnN0YXRlcy5ydW4pO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzZWxmLmluaXRpYWxpemVFeGVjLmNhbGwobXlDYWxsQ29udGV4dC5zY29wZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5ydW4uY2FsbChteUNhbGxDb250ZXh0LnNjb3BlLCBteUNhbGxDb250ZXh0LCBhcmdzIHx8IHNlbGYuYXJncyB8fCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmFpbChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuaW5pdGlhbGl6ZUV4ZWMgPSBfLm5vb3A7XG5cbkFjdGl2aXR5LnByb3RvdHlwZS51bkluaXRpYWxpemVFeGVjID0gXy5ub29wO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBhcmdzKSB7XG4gICAgY2FsbENvbnRleHQuYWN0aXZpdHkuY29tcGxldGUoY2FsbENvbnRleHQsIGFyZ3MpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZXN1bHQpIHtcbiAgICB0aGlzLmVuZChjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCByZXN1bHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCkge1xuICAgIHRoaXMuZW5kKGNhbGxDb250ZXh0LCBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pZGxlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0KSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5pZGxlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5mYWlsID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBlKSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5mYWlsLCBlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgdGhpcy51bkluaXRpYWxpemVFeGVjLmNhbGwoY2FsbENvbnRleHQuc2NvcGUsIHJlYXNvbiwgcmVzdWx0KTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBgdW5Jbml0aWFsaXplRXhlYyBmYWlsZWQuIFJlYXNvbiBvZiBlbmRpbmcgd2FzICcke3JlYXNvbn0nIGFuZCB0aGUgcmVzdWx0IGlzICcke3Jlc3VsdH0uYDtcbiAgICAgICAgcmVhc29uID0gQWN0aXZpdHkuc3RhdGVzLmZhaWw7XG4gICAgICAgIHJlc3VsdCA9IGU7XG4gICAgfVxuXG4gICAgbGV0IHN0YXRlID0gY2FsbENvbnRleHQuZXhlY3V0aW9uU3RhdGU7XG5cbiAgICBpZiAoc3RhdGUuZXhlY1N0YXRlID09PSBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsIHx8IHN0YXRlLmV4ZWNTdGF0ZSA9PT0gQWN0aXZpdHkuc3RhdGVzLmZhaWwpIHtcbiAgICAgICAgLy8gSXQgd2FzIGNhbmNlbGxlZCBvciBmYWlsZWQ6XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZS5leGVjU3RhdGUgPSByZWFzb247XG5cbiAgICBsZXQgaW5JZGxlID0gcmVhc29uID09PSBBY3Rpdml0eS5zdGF0ZXMuaWRsZTtcbiAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgIGNhbGxDb250ZXh0ID0gY2FsbENvbnRleHQuYmFjayhpbklkbGUpO1xuXG4gICAgaWYgKGNhbGxDb250ZXh0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgYm1OYW1lID0gc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVWYWx1ZUNvbGxlY3RlZEJNTmFtZSh0aGlzKTtcbiAgICAgICAgICAgIGlmIChleGVjQ29udGV4dC5pc0Jvb2ttYXJrRXhpc3RzKGJtTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5lbWl0U3RhdGUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5yZXN1bWVCb29rbWFya0luU2NvcGUoY2FsbENvbnRleHQsIGJtTmFtZSwgcmVhc29uLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY2FsbENvbnRleHQuZmFpbChlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gV2UncmUgb24gcm9vdCwgZG9uZS5cbiAgICAgICAgLy8gSWYgd2YgaW4gaWRsZSwgYnV0IHRoZXJlIGFyZSBpbnRlcm5hbCBib29rbWFyayByZXN1bWUgcmVxdWVzdCxcbiAgICAgICAgLy8gdGhlbiBpbnN0ZWFkIG9mIGVtaXR0aW5nIGRvbmUsIHdlIGhhdmUgdG8gY29udGludWUgdGhlbS5cbiAgICAgICAgaWYgKGluSWRsZSAmJiBleGVjQ29udGV4dC5wcm9jZXNzUmVzdW1lQm9va21hcmtRdWV1ZSgpKSB7XG4gICAgICAgICAgICAvLyBXZSBzaG91bGQgbm90IGVtbWl0IGlkbGUgZXZlbnQsIGJlY2F1c2UgdGhlcmUgd2FzIGludGVybmFsIGJvb2ttYXJrIGNvbnRpbnV0YXRpb25zLCBzbyB3ZSdyZSBkb25lLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGUuZW1pdFN0YXRlKHJlc3VsdCk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuX2RlZmF1bHRFbmRDYWxsYmFjayA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQpIHtcbiAgICBjYWxsQ29udGV4dC5lbmQocmVhc29uLCByZXN1bHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnNjaGVkdWxlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBvYmosIGVuZENhbGxiYWNrKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBzY29wZSA9IGNhbGxDb250ZXh0LnNjb3BlO1xuICAgIGxldCBleGVjQ29udGV4dCA9IGNhbGxDb250ZXh0LmV4ZWN1dGlvbkNvbnRleHQ7XG5cbiAgICBpZiAoIWVuZENhbGxiYWNrKSB7XG4gICAgICAgIGVuZENhbGxiYWNrID0gXCJfZGVmYXVsdEVuZENhbGxiYWNrXCI7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzU3RyaW5nKGVuZENhbGxiYWNrKSkge1xuICAgICAgICBjYWxsQ29udGV4dC5mYWlsKG5ldyBUeXBlRXJyb3IoXCJQcm92aWRlZCBhcmd1bWVudCAnZW5kQ2FsbGJhY2snIHZhbHVlIGlzIG5vdCBhIHN0cmluZy5cIikpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBjYiA9IHNjb3BlLmdldChlbmRDYWxsYmFjayk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oY2IpKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwobmV3IFR5cGVFcnJvcihgJyR7ZW5kQ2FsbGJhY2t9JyBpcyBub3QgYSBmdW5jdGlvbi5gKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgYm9va21hcmtOYW1lcyA9IFtdO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGlzR2VuZXJhdG9yID0gaXMuZ2VuZXJhdG9yKG9iaik7XG4gICAgICAgIGlmIChfLmlzQXJyYXkob2JqKSAmJiBvYmoubGVuZ3RoIHx8IGlzR2VuZXJhdG9yKSB7XG4gICAgICAgICAgICBzY29wZS5zZXQoXCJfX2NvbGxlY3RWYWx1ZXNcIiwgW10pO1xuICAgICAgICAgICAgbGV0IGFjdGl2aXRpZXMgPSBbXTtcbiAgICAgICAgICAgIGxldCB2YXJpYWJsZXMgPSBbXTtcbiAgICAgICAgICAgIGxldCBpdGVtcyA9IGlzR2VuZXJhdG9yID8gb2JqKCkgOiBvYmo7XG4gICAgICAgICAgICBmb3IgKGxldCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5nZXQoXCJfX2NvbGxlY3RWYWx1ZXNcIikucHVzaChzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmFzVmFsdWVUb0NvbGxlY3QoaXRlbSkpO1xuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0aWVzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlcy5wdXNoKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChfLmlzT2JqZWN0KGl0ZW0pICYmIGl0ZW0uYWN0aXZpdHkgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5nZXQoXCJfX2NvbGxlY3RWYWx1ZXNcIikucHVzaChzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmFzVmFsdWVUb0NvbGxlY3QoaXRlbS5hY3Rpdml0eSkpO1xuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0aWVzLnB1c2goaXRlbS5hY3Rpdml0eSk7XG4gICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlcy5wdXNoKF8uaXNPYmplY3QoaXRlbS52YXJpYWJsZXMpID8gaXRlbS52YXJpYWJsZXMgOiBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmdldChcIl9fY29sbGVjdFZhbHVlc1wiKS5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXMucHVzaChudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWN0aXZpdGllcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5zZXQoXCJfX2NvbGxlY3RQaWNrUm91bmQyXCIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzY29wZS5zZXQoXCJfX2NvbGxlY3RFcnJvcnNcIiwgW10pO1xuICAgICAgICAgICAgICAgIHNjb3BlLnNldChcIl9fY29sbGVjdENhbmNlbENvdW50c1wiLCAwKTtcbiAgICAgICAgICAgICAgICBzY29wZS5zZXQoXCJfX2NvbGxlY3RJZGxlQ291bnRzXCIsIDApO1xuICAgICAgICAgICAgICAgIHNjb3BlLnNldChcIl9fY29sbGVjdFJlbWFpbmluZ1wiLCBhY3Rpdml0aWVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGV0IGVuZEJNID0gc2NvcGUuc2V0KFwiX19jb2xsZWN0RW5kQm9va21hcmtOYW1lXCIsIHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlQ29sbGVjdGluZ0NvbXBsZXRlZEJNTmFtZShzZWxmKSk7XG4gICAgICAgICAgICAgICAgYm9va21hcmtOYW1lcy5wdXNoKGV4ZWNDb250ZXh0LmNyZWF0ZUJvb2ttYXJrKHNlbGYuaW5zdGFuY2VJZCwgc2NvcGUuZ2V0KFwiX19jb2xsZWN0RW5kQm9va21hcmtOYW1lXCIpLCBlbmRDYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgIGxldCBsZW4gPSBhY3Rpdml0aWVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZEFjdGl2aXR5ID0gYWN0aXZpdGllc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkVmFyaWFibGVzID0gdmFyaWFibGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICBib29rbWFya05hbWVzLnB1c2goZXhlY0NvbnRleHQuY3JlYXRlQm9va21hcmsoc2VsZi5pbnN0YW5jZUlkLCBzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmNyZWF0ZVZhbHVlQ29sbGVjdGVkQk1OYW1lKGNoaWxkQWN0aXZpdHkpLCBcInJlc3VsdENvbGxlY3RlZFwiKSk7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkQWN0aXZpdHkuX3N0YXJ0KGNhbGxDb250ZXh0LCBjaGlsZFZhcmlhYmxlcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXhlY0NvbnRleHQuaXNCb29rbWFya0V4aXN0cyhlbmRCTSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGN1cnJlbnQgYWN0aXZpdHkgaGFzIGJlZW4gZW5kZWQgKGJ5IFBpY2sgZm9yIGV4KVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gc2NvcGUuZ2V0KFwiX19jb2xsZWN0VmFsdWVzXCIpO1xuICAgICAgICAgICAgICAgIHNjb3BlLmRlbGV0ZShcIl9fY29sbGVjdFZhbHVlc1wiKTtcbiAgICAgICAgICAgICAgICBzY29wZS5nZXQoZW5kQ2FsbGJhY2spLmNhbGwoc2NvcGUsIGNhbGxDb250ZXh0LCBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGUsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgIGJvb2ttYXJrTmFtZXMucHVzaChleGVjQ29udGV4dC5jcmVhdGVCb29rbWFyayhzZWxmLmluc3RhbmNlSWQsIHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlVmFsdWVDb2xsZWN0ZWRCTU5hbWUob2JqKSwgZW5kQ2FsbGJhY2spKTtcbiAgICAgICAgICAgIG9iai5zdGFydChjYWxsQ29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoXy5pc09iamVjdChvYmopICYmIG9iai5hY3Rpdml0eSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICBib29rbWFya05hbWVzLnB1c2goZXhlY0NvbnRleHQuY3JlYXRlQm9va21hcmsoc2VsZi5pbnN0YW5jZUlkLCBzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmNyZWF0ZVZhbHVlQ29sbGVjdGVkQk1OYW1lKG9iai5hY3Rpdml0eSksIGVuZENhbGxiYWNrKSk7XG4gICAgICAgICAgICBvYmouYWN0aXZpdHkuX3N0YXJ0KGNhbGxDb250ZXh0LCBfLmlzT2JqZWN0KG9iai52YXJpYWJsZXMpID8gb2JqLnZhcmlhYmxlcyA6IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2NvcGUuZ2V0KGVuZENhbGxiYWNrKS5jYWxsKHNjb3BlLCBjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCBvYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIC8vIFJ1bnRpbWUgZXJyb3IgaGFwcGVuZWQhXG4gICAgICAgIC8vIFdlIGNhbm5vdCBkbyBhbnl0aGluZyBmdXRoZXIgd2hlbiBhbHJlYWR5IHNjaGVkdWxlZCBhY3Rpdml0aWVzIGZpbmlzaGVkLFxuICAgICAgICAvLyBzbyBtYWtlIHRoZWlyIGVuZCBjYWxsYmFja3MgYXMgbm9vcDpcbiAgICAgICAgZXhlY0NvbnRleHQubm9vcENhbGxiYWNrcyhib29rbWFya05hbWVzKTtcbiAgICAgICAgc2NvcGUuZ2V0KGVuZENhbGxiYWNrKS5jYWxsKHNjb3BlLCBjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmZhaWwsIGUpO1xuICAgIH1cbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5yZXN1bHRDb2xsZWN0ZWQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0LCBib29rbWFyaykge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICB0cnkge1xuICAgICAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgICAgICBsZXQgY2hpbGRJZCA9IHNwZWNTdHJpbmdzLmdldFN0cmluZyhib29rbWFyay5uYW1lKTtcbiAgICAgICAgbGV0IGFyZ01hcmtlciA9IHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuYXNWYWx1ZVRvQ29sbGVjdChjaGlsZElkKTtcbiAgICAgICAgbGV0IHJlc3VsdEluZGV4ID0gc2VsZi5nZXQoXCJfX2NvbGxlY3RWYWx1ZXNcIikuaW5kZXhPZihhcmdNYXJrZXIpO1xuICAgICAgICBsZXQgcGlja0N1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHJlc3VsdEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgc2VsZi5nZXQoXCJfX2NvbGxlY3RFcnJvcnNcIikucHVzaChuZXcgZXJyb3JzLkFjdGl2aXR5U3RhdGVFeGNlcHRpb25FcnJvcihcIkFjdGl2aXR5ICdcIiArIGNoaWxkSWQgKyBcIicgaXMgbm90IGZvdW5kIGluIF9fY29sbGVjdFZhbHVlcy5cIikpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNlbGYuZ2V0KFwiX19jb2xsZWN0UGlja1wiKSAmJiAocmVhc29uICE9PSBBY3Rpdml0eS5zdGF0ZXMuaWRsZSB8fCBzZWxmLmdldChcIl9fY29sbGVjdFBpY2tSb3VuZDJcIikpKSB7XG4gICAgICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIHBpY2sgY3VycmVudCByZXN1bHQsIGFuZCBzaHV0IGRvd24gb3RoZXJzOlxuICAgICAgICAgICAgICAgIGxldCBpZHMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjdiBvZiBzZWxmLmdldChcIl9fY29sbGVjdFZhbHVlc1wiKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaWQgPSBzcGVjU3RyaW5ncy5nZXRTdHJpbmcoY3YpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWQgJiYgaWQgIT09IGNoaWxkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkcy5wdXNoKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWNDb250ZXh0LmRlbGV0ZVNjb3BlT2ZBY3Rpdml0eShjYWxsQ29udGV4dCwgaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlibU5hbWUgPSBzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmNyZWF0ZVZhbHVlQ29sbGVjdGVkQk1OYW1lKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWNDb250ZXh0LmRlbGV0ZUJvb2ttYXJrKGlibU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV4ZWNDb250ZXh0LmNhbmNlbEV4ZWN1dGlvbihpZHMpO1xuICAgICAgICAgICAgICAgIHBpY2tDdXJyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXQoXCJfX2NvbGxlY3RWYWx1ZXNcIilbcmVzdWx0SW5kZXhdID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aXZpdHkuc3RhdGVzLmNhbmNlbDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaW5jKFwiX19jb2xsZWN0Q2FuY2VsQ291bnRzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXQoXCJfX2NvbGxlY3RWYWx1ZXNcIilbcmVzdWx0SW5kZXhdID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEFjdGl2aXR5LnN0YXRlcy5pZGxlOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pbmMoXCJfX2NvbGxlY3RJZGxlQ291bnRzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQWN0aXZpdHkuc3RhdGVzLmZhaWw6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwgbmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoXCJVbmtub3duIGVycm9yLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0KFwiX19jb2xsZWN0RXJyb3JzXCIpLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0KFwiX19jb2xsZWN0VmFsdWVzXCIpW3Jlc3VsdEluZGV4XSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0KFwiX19jb2xsZWN0RXJyb3JzXCIpLnB1c2gobmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoXCJCb29rbWFyayBzaG91bGQgbm90IGJlIGNvbnRpbnVlZCB3aXRoIHJlYXNvbiAnXCIgKyByZWFzb24gKyBcIicuXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0KFwiX19jb2xsZWN0VmFsdWVzXCIpW3Jlc3VsdEluZGV4XSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGYuZGVjKFwiX19jb2xsZWN0UmVtYWluaW5nXCIpID09PSAwIHx8IHBpY2tDdXJyZW50KSB7XG4gICAgICAgICAgICBsZXQgZW5kQm9va21hcmtOYW1lID0gc2VsZi5nZXQoXCJfX2NvbGxlY3RFbmRCb29rbWFya05hbWVcIik7XG5cbiAgICAgICAgICAgIGlmICghcGlja0N1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5nZXQoXCJfX2NvbGxlY3RFcnJvcnNcIikubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbiA9IEFjdGl2aXR5LnN0YXRlcy5mYWlsO1xuICAgICAgICAgICAgICAgICAgICBsZXQgX19jb2xsZWN0RXJyb3JzID0gc2VsZi5nZXQoXCJfX2NvbGxlY3RFcnJvcnNcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfX2NvbGxlY3RFcnJvcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBfX2NvbGxlY3RFcnJvcnNbMF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgZXJyb3JzLkFnZ3JlZ2F0ZUVycm9yKF9fY29sbGVjdEVycm9ycyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2VsZi5nZXQoXCJfX2NvbGxlY3RDYW5jZWxDb3VudHNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVhc29uID0gQWN0aXZpdHkuc3RhdGVzLmNhbmNlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2VsZi5nZXQoXCJfX2NvbGxlY3RJZGxlQ291bnRzXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbiA9IEFjdGl2aXR5LnN0YXRlcy5pZGxlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldChcIl9fY29sbGVjdFJlbWFpbmluZ1wiLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kZWMoXCJfX2NvbGxlY3RJZGxlQ291bnRzXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5nZXQoXCJfX2NvbGxlY3RQaWNrXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSdyZSBpbiBwaWNrIG1vZGUsIGFuZCBhbGwgcmVzdWx0IHdhcyBpZGxlXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNldChcIl9fY29sbGVjdFBpY2tSb3VuZDJcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbiA9IEFjdGl2aXR5LnN0YXRlcy5jb21wbGV0ZTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gc2VsZi5nZXQoXCJfX2NvbGxlY3RWYWx1ZXNcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXNlbGYuZ2V0KFwiX19jb2xsZWN0UmVtYWluaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kZWxldGUoXCJfX2NvbGxlY3RWYWx1ZXNcIik7XG4gICAgICAgICAgICAgICAgc2VsZi5kZWxldGUoXCJfX2NvbGxlY3RSZW1haW5pbmdcIik7XG4gICAgICAgICAgICAgICAgc2VsZi5kZWxldGUoXCJfX2NvbGxlY3RJZGxlQ291bnRzXCIpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGVsZXRlKFwiX19jb2xsZWN0RW5kQm9va21hcmtOYW1lXCIpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGVsZXRlKFwiX19jb2xsZWN0Q2FuY2VsQ291bnRzXCIpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGVsZXRlKFwiX19jb2xsZWN0RXJyb3JzXCIpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGVsZXRlKFwiX19jb2xsZWN0UGlja1wiKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRlbGV0ZShcIl9fY29sbGVjdFBpY2tSb3VuZDJcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4ZWNDb250ZXh0LnJlc3VtZUJvb2ttYXJrSW5TY29wZShjYWxsQ29udGV4dCwgZW5kQm9va21hcmtOYW1lLCByZWFzb24sIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FsbENvbnRleHQuZmFpbChlKTtcbiAgICB9XG59O1xuLyogUlVOICovXG5cbi8qIFNDT1BFICovXG5BY3Rpdml0eS5wcm90b3R5cGUuX2dldFNjb3BlS2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFzZWxmLl9zY29wZUtleXMgfHwgIXNlbGYuX3N0cnVjdHVyZUluaXRpYWxpemVkKSB7XG4gICAgICAgIHNlbGYuX3Njb3BlS2V5cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBrZXkgaW4gc2VsZikge1xuICAgICAgICAgICAgaWYgKCFzZWxmLm5vblNjb3BlZFByb3BlcnRpZXMuaGFzKGtleSkgJiYgKF8uaXNVbmRlZmluZWQoQWN0aXZpdHkucHJvdG90eXBlW2tleV0pIHx8IGtleSA9PT0gXCJfZGVmYXVsdEVuZENhbGxiYWNrXCIpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2NvcGVLZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2VsZi5fc2NvcGVLZXlzO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNyZWF0ZVNjb3BlUGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX3N0cnVjdHVyZUluaXRpYWxpemVkKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlSdW50aW1lRXJyb3IoXCJDYW5ub3QgY3JlYXRlIGFjdGl2aXR5IHNjb3BlIGZvciB1bmluaXRpYWxpemVkIGFjdGl2aXRpZXMuXCIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jcmVhdGVTY29wZVBhcnRJbXBsID09PSBudWxsKSB7XG4gICAgICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgICAgIGxldCBzcmMgPSBcInJldHVybiB7XCI7XG4gICAgICAgIGZvciAobGV0IGZpZWxkTmFtZSBvZiB0aGlzLl9nZXRTY29wZUtleXMoKSkge1xuICAgICAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNyYyArPSBcIixcXG5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfLmlzUGxhaW5PYmplY3QodGhpc1tmaWVsZE5hbWVdKSkge1xuICAgICAgICAgICAgICAgIHNyYyArPSBmaWVsZE5hbWUgKyBcIjpfLmNsb25lKGEuXCIgKyBmaWVsZE5hbWUgKyBcIiwgdHJ1ZSlcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKF8uaXNBcnJheSh0aGlzW2ZpZWxkTmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgc3JjICs9IGZpZWxkTmFtZSArIFwiOmEuXCIgKyBmaWVsZE5hbWUgKyBcIi5zbGljZSgwKVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3JjICs9IGZpZWxkTmFtZSArIFwiOmEuXCIgKyBmaWVsZE5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3JjICs9IFwifVwiO1xuXG4gICAgICAgIHRoaXMuX2NyZWF0ZVNjb3BlUGFydEltcGwgPSBuZXcgRnVuY3Rpb24oXCJhLF9cIiwgc3JjKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCh0aGlzLCBfKTtcbn07XG4vKiBTQ09QRSAqL1xuXG5BY3Rpdml0eS5zdGF0ZXMgPSBlbnVtcy5BY3Rpdml0eVN0YXRlcztcblxubW9kdWxlLmV4cG9ydHMgPSBBY3Rpdml0eTtcbiJdfQ==
