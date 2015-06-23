"use strict";
"use strict";
var guids = require("../common/guids");
var errors = require("../common/errors");
var enums = require("../common/enums");
var _ = require("lodash");
var specStrings = require("../common/specStrings");
var WFObject = require("../common/wfObject");
var util = require("util");
var StrSet = require("backpack-node").collections.StrSet;
var is = require("../common/is");
var CallContext = require("./callContext");
function Activity() {
  WFObject.call(this);
  this[guids.types.activity] = true;
  this.id = null;
  this.args = null;
  this.displayName = "";
  this.nonSerializedProperties = new StrSet();
  this.nonScopedProperties = new StrSet();
  this.nonScopedProperties.add(guids.types.activity);
  this.nonScopedProperties.add("nonScopedProperties");
  this.nonScopedProperties.add("nonSerializedProperties");
  this.nonScopedProperties.add("_instanceId");
  this.nonScopedProperties.add("activity");
  this.nonScopedProperties.add("id");
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
  this.codeProperties = new StrSet();
}
util.inherits(Activity, WFObject);
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
  return (this.displayName ? (this.displayName + " ") : "") + "(" + this.constructor.name + ":" + this.id + ")";
};
Activity.prototype.forEach = function(f) {
  var visited = {};
  return this._forEach(f, visited, null);
};
Activity.prototype.forEachChild = function(f) {
  var visited = {};
  return this._forEach(f, visited, this);
};
Activity.prototype.forEachImmediateChild = function(f) {
  var self = this;
  var $__10 = true;
  var $__11 = false;
  var $__12 = undefined;
  try {
    for (var $__8 = void 0,
        $__7 = (self.getKeys())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__10 = ($__8 = $__7.next()).done); $__10 = true) {
      var fieldName = $__8.value;
      {
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
    }
  } catch ($__13) {
    $__11 = true;
    $__12 = $__13;
  } finally {
    try {
      if (!$__10 && $__7.return != null) {
        $__7.return();
      }
    } finally {
      if ($__11) {
        throw $__12;
      }
    }
  }
};
Activity.prototype._forEach = function(f, visited, except) {
  var self = this;
  if (is.undefined(visited[self._instanceId])) {
    visited[self._instanceId] = true;
    if (self !== except) {
      f(self);
    }
    var $__10 = true;
    var $__11 = false;
    var $__12 = undefined;
    try {
      for (var $__8 = void 0,
          $__7 = (self.getKeys())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__10 = ($__8 = $__7.next()).done); $__10 = true) {
        var fieldName = $__8.value;
        {
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
                      obj._forEach(f, visited, except);
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
              fieldValue._forEach(f, visited, except);
            }
          }
        }
      }
    } catch ($__13) {
      $__11 = true;
      $__12 = $__13;
    } finally {
      try {
        if (!$__10 && $__7.return != null) {
          $__7.return();
        }
      } finally {
        if ($__11) {
          throw $__12;
        }
      }
    }
  }
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
  state.reportState(Activity.states.run);
  self.run.call(myCallContext.scope, myCallContext, args || self.args || []);
};
Activity.prototype.run = function(callContext, args) {
  this.complete(callContext, args);
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
  var state = callContext.executionState;
  if (state.execState === Activity.states.cancel || state.execState === Activity.states.fail) {
    return ;
  }
  state.execState = reason;
  var inIdle = reason === Activity.states.idle;
  var execContext = callContext.executionContext;
  callContext = callContext.back(inIdle);
  if (callContext) {
    var bmName = specStrings.activities.createValueCollectedBMName(this);
    if (execContext.isBookmarkExists(bmName)) {
      state.emitState(result);
      execContext.resumeBookmarkInScope(callContext, bmName, reason, result);
      return ;
    }
  } else {
    if (inIdle && execContext.processResumeBookmarkQueue()) {
      return ;
    }
  }
  state.emitState(result);
};
Activity.prototype.schedule = function(callContext, obj, endCallback) {
  var self = this;
  var scope = callContext.scope;
  var execContext = callContext.executionContext;
  if (!_.isString(endCallback)) {
    callContext.fail(new TypeError("Provided argument 'endCallback' value is not a string."));
    return ;
  }
  var cb = scope.get(endCallback);
  if (!_.isFunction(cb)) {
    callContext.fail(new TypeError(("'" + endCallback + "' is not a function.")));
    return ;
  }
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
      execContext.createBookmark(self.id, scope.get("__collectEndBookmarkName"), endCallback);
      var len = activities.length;
      for (var i = 0; i < len; i++) {
        var childActivity = activities[i];
        var childVariables = variables[i];
        execContext.createBookmark(self.id, specStrings.activities.createValueCollectedBMName(childActivity), "resultCollected");
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
    execContext.createBookmark(self.id, specStrings.activities.createValueCollectedBMName(obj), endCallback);
    obj.start(callContext);
  } else if (_.isObject(obj) && obj.activity instanceof Activity) {
    execContext.createBookmark(self.id, specStrings.activities.createValueCollectedBMName(obj.activity), endCallback);
    obj._start(callContext, _.isObject(obj.variables) ? obj.variables : null);
  } else {
    scope.get(endCallback).call(scope, callContext, Activity.states.complete, obj);
  }
};
Activity.prototype.resultCollected = function(callContext, reason, result, bookmark) {
  var self = this;
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
};
Activity.prototype._getScopeKeys = function() {
  var self = this;
  if (!self._scopeKeys) {
    self._scopeKeys = [];
    var $__3 = true;
    var $__4 = false;
    var $__5 = undefined;
    try {
      for (var $__1 = void 0,
          $__0 = (self.getKeys())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
        var key = $__1.value;
        {
          if (self.nonScopedProperties.exists(key)) {
            continue;
          }
          if (Activity.prototype[key]) {
            continue;
          }
          self._scopeKeys.push(key);
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
  }
  return self._scopeKeys;
};
Activity.prototype.createScopePart = function() {
  var self = this;
  if (this._createScopePartImpl === null) {
    var first = true;
    var src = "return {";
    var $__3 = true;
    var $__4 = false;
    var $__5 = undefined;
    try {
      for (var $__1 = void 0,
          $__0 = (self._getScopeKeys())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
        var fieldName = $__1.value;
        {
          if (first) {
            first = false;
          } else {
            src += ",\n";
          }
          if (_.isPlainObject(self[fieldName])) {
            src += fieldName + ":_.clone(a." + fieldName + ", true)";
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
//# sourceMappingURL=data:application/json;base64,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b3VyY2VzQ29udGVudCI6WyIvKmpzaGludCAtVzA1NCAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxubGV0IGd1aWRzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9ndWlkc1wiKTtcbmxldCBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcbmxldCBlbnVtcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZW51bXNcIik7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgc3BlY1N0cmluZ3MgPSByZXF1aXJlKFwiLi4vY29tbW9uL3NwZWNTdHJpbmdzXCIpO1xubGV0IFdGT2JqZWN0ID0gcmVxdWlyZShcIi4uL2NvbW1vbi93Zk9iamVjdFwiKTtcbmxldCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5sZXQgU3RyU2V0ID0gcmVxdWlyZShcImJhY2twYWNrLW5vZGVcIikuY29sbGVjdGlvbnMuU3RyU2V0O1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBDYWxsQ29udGV4dCA9IHJlcXVpcmUoXCIuL2NhbGxDb250ZXh0XCIpO1xuXG5mdW5jdGlvbiBBY3Rpdml0eSgpIHtcbiAgICBXRk9iamVjdC5jYWxsKHRoaXMpO1xuXG4gICAgdGhpc1tndWlkcy50eXBlcy5hY3Rpdml0eV0gPSB0cnVlO1xuICAgIHRoaXMuaWQgPSBudWxsO1xuICAgIHRoaXMuYXJncyA9IG51bGw7XG4gICAgdGhpcy5kaXNwbGF5TmFtZSA9IFwiXCI7XG5cbiAgICAvLyBQcm9wZXJ0aWVzIG5vdCBzZXJpYWxpemVkOlxuICAgIHRoaXMubm9uU2VyaWFsaXplZFByb3BlcnRpZXMgPSBuZXcgU3RyU2V0KCk7XG5cbiAgICAvLyBQcm9wZXJ0aWVzIGFyZSBub3QgZ29pbmcgdG8gY29waWVkIGluIHRoZSBzY29wZTpcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMgPSBuZXcgU3RyU2V0KCk7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChndWlkcy50eXBlcy5hY3Rpdml0eSk7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIm5vblNjb3BlZFByb3BlcnRpZXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIm5vblNlcmlhbGl6ZWRQcm9wZXJ0aWVzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfaW5zdGFuY2VJZFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiYWN0aXZpdHlcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImlkXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJhcmdzXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJfX3R5cGVUYWdcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcImRpc3BsYXlOYW1lXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjb21wbGV0ZVwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY2FuY2VsXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJpZGxlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJmYWlsXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJlbmRcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInNjaGVkdWxlXCIpO1xuICAgIHRoaXMubm9uU2NvcGVkUHJvcGVydGllcy5hZGQoXCJjcmVhdGVCb29rbWFya1wiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwicmVzdW1lQm9va21hcmtcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcInJlc3VsdENvbGxlY3RlZFwiKTtcbiAgICB0aGlzLm5vblNjb3BlZFByb3BlcnRpZXMuYWRkKFwiY29kZVByb3BlcnRpZXNcIik7XG5cbiAgICB0aGlzLmNvZGVQcm9wZXJ0aWVzID0gbmV3IFN0clNldCgpO1xufVxuXG51dGlsLmluaGVyaXRzKEFjdGl2aXR5LCBXRk9iamVjdCk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEFjdGl2aXR5LnByb3RvdHlwZSwge1xuICAgIF9zY29wZUtleXM6IHtcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgX2NyZWF0ZVNjb3BlUGFydEltcGw6IHtcbiAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH1cbn0pO1xuXG5BY3Rpdml0eS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLmRpc3BsYXlOYW1lID8gKHRoaXMuZGlzcGxheU5hbWUgKyBcIiBcIikgOiBcIlwiKSArIFwiKFwiICsgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgXCI6XCIgKyB0aGlzLmlkICsgXCIpXCI7XG59O1xuXG4vKiBmb3JFYWNoICovXG5BY3Rpdml0eS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChmKSB7XG4gICAgbGV0IHZpc2l0ZWQgPSB7fTtcbiAgICByZXR1cm4gdGhpcy5fZm9yRWFjaChmLCB2aXNpdGVkLCBudWxsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5mb3JFYWNoQ2hpbGQgPSBmdW5jdGlvbiAoZikge1xuICAgIGxldCB2aXNpdGVkID0ge307XG4gICAgcmV0dXJuIHRoaXMuX2ZvckVhY2goZiwgdmlzaXRlZCwgdGhpcyk7XG59O1xuXG5BY3Rpdml0eS5wcm90b3R5cGUuZm9yRWFjaEltbWVkaWF0ZUNoaWxkID0gZnVuY3Rpb24gKGYpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBmb3IgKGxldCBmaWVsZE5hbWUgb2Ygc2VsZi5nZXRLZXlzKCkpIHtcbiAgICAgICAgbGV0IGZpZWxkVmFsdWUgPSBzZWxmW2ZpZWxkTmFtZV07XG4gICAgICAgIGlmIChmaWVsZFZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmKG9iaik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChmaWVsZFZhbHVlIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICBmKGZpZWxkVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLl9mb3JFYWNoID0gZnVuY3Rpb24gKGYsIHZpc2l0ZWQsIGV4Y2VwdCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBpZiAoaXMudW5kZWZpbmVkKHZpc2l0ZWRbc2VsZi5faW5zdGFuY2VJZF0pKSB7XG4gICAgICAgIHZpc2l0ZWRbc2VsZi5faW5zdGFuY2VJZF0gPSB0cnVlO1xuXG4gICAgICAgIGlmIChzZWxmICE9PSBleGNlcHQpIHtcbiAgICAgICAgICAgIGYoc2VsZik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgb2Ygc2VsZi5nZXRLZXlzKCkpIHtcbiAgICAgICAgICAgIGxldCBmaWVsZFZhbHVlID0gc2VsZltmaWVsZE5hbWVdO1xuICAgICAgICAgICAgaWYgKGZpZWxkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoXy5pc0FycmF5KGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG9iaiBvZiBmaWVsZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmouX2ZvckVhY2goZiwgdmlzaXRlZCwgZXhjZXB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmaWVsZFZhbHVlIGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZS5fZm9yRWFjaChmLCB2aXNpdGVkLCBleGNlcHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG4vKiBmb3JFYWNoICovXG5cbi8qIFJVTiAqL1xuQWN0aXZpdHkucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0KSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCEoY2FsbENvbnRleHQgaW5zdGFuY2VvZiBDYWxsQ29udGV4dCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgJ2NvbnRleHQnIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBBY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQuXCIpO1xuICAgIH1cblxuICAgIGxldCBhcmdzID0gc2VsZi5hcmdzO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBhcmdzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3N0YXJ0KGNhbGxDb250ZXh0LCBudWxsLCBhcmdzKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5fc3RhcnQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHZhcmlhYmxlcywgYXJncykge1xuICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgIGxldCBteUNhbGxDb250ZXh0ID0gY2FsbENvbnRleHQubmV4dChzZWxmLCB2YXJpYWJsZXMpO1xuICAgIGxldCBzdGF0ZSA9IG15Q2FsbENvbnRleHQuZXhlY3V0aW9uU3RhdGU7XG4gICAgaWYgKHN0YXRlLmlzUnVubmluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBY3Rpdml0eSBpcyBhbHJlYWR5IHJ1bm5pbmcuXCIpO1xuICAgIH1cblxuICAgIHN0YXRlLnJlcG9ydFN0YXRlKEFjdGl2aXR5LnN0YXRlcy5ydW4pO1xuICAgIHNlbGYucnVuLmNhbGwobXlDYWxsQ29udGV4dC5zY29wZSwgbXlDYWxsQ29udGV4dCwgYXJncyB8fCBzZWxmLmFyZ3MgfHwgW10pO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgYXJncykge1xuICAgIHRoaXMuY29tcGxldGUoY2FsbENvbnRleHQsIGFyZ3MpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCByZXN1bHQpIHtcbiAgICB0aGlzLmVuZChjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCByZXN1bHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCkge1xuICAgIHRoaXMuZW5kKGNhbGxDb250ZXh0LCBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5pZGxlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0KSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5pZGxlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5mYWlsID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBlKSB7XG4gICAgdGhpcy5lbmQoY2FsbENvbnRleHQsIEFjdGl2aXR5LnN0YXRlcy5mYWlsLCBlKTtcbn07XG5cbkFjdGl2aXR5LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0KSB7XG4gICAgbGV0IHN0YXRlID0gY2FsbENvbnRleHQuZXhlY3V0aW9uU3RhdGU7XG5cbiAgICBpZiAoc3RhdGUuZXhlY1N0YXRlID09PSBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsIHx8IHN0YXRlLmV4ZWNTdGF0ZSA9PT0gQWN0aXZpdHkuc3RhdGVzLmZhaWwpIHtcbiAgICAgICAgLy8gSXQgd2FzIGNhbmNlbGxlZCBvciBmYWlsZWQ6XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZS5leGVjU3RhdGUgPSByZWFzb247XG5cbiAgICBsZXQgaW5JZGxlID0gcmVhc29uID09PSBBY3Rpdml0eS5zdGF0ZXMuaWRsZTtcbiAgICBsZXQgZXhlY0NvbnRleHQgPSBjYWxsQ29udGV4dC5leGVjdXRpb25Db250ZXh0O1xuICAgIGNhbGxDb250ZXh0ID0gY2FsbENvbnRleHQuYmFjayhpbklkbGUpO1xuXG4gICAgaWYgKGNhbGxDb250ZXh0KSB7XG4gICAgICAgIGxldCBibU5hbWUgPSBzcGVjU3RyaW5ncy5hY3Rpdml0aWVzLmNyZWF0ZVZhbHVlQ29sbGVjdGVkQk1OYW1lKHRoaXMpO1xuICAgICAgICBpZiAoZXhlY0NvbnRleHQuaXNCb29rbWFya0V4aXN0cyhibU5hbWUpKSB7XG4gICAgICAgICAgICBzdGF0ZS5lbWl0U3RhdGUocmVzdWx0KTtcbiAgICAgICAgICAgIGV4ZWNDb250ZXh0LnJlc3VtZUJvb2ttYXJrSW5TY29wZShjYWxsQ29udGV4dCwgYm1OYW1lLCByZWFzb24sIHJlc3VsdCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFdlJ3JlIG9uIHJvb3QsIGRvbmUuXG4gICAgICAgIC8vIElmIHdmIGluIGlkbGUsIGJ1dCB0aGVyZSBhcmUgaW50ZXJuYWwgYm9va21hcmsgcmVzdW1lIHJlcXVlc3QsXG4gICAgICAgIC8vIHRoZW4gaW5zdGVhZCBvZiBlbWl0dGluZyBkb25lLCB3ZSBoYXZlIHRvIGNvbnRpbnVlIHRoZW0uXG4gICAgICAgIGlmIChpbklkbGUgJiYgZXhlY0NvbnRleHQucHJvY2Vzc1Jlc3VtZUJvb2ttYXJrUXVldWUoKSkge1xuICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIG5vdCBlbW1pdCBpZGxlIGV2ZW50LCBiZWNhdXNlIHRoZXJlIHdhcyBpbnRlcm5hbCBib29rbWFyayBjb250aW51dGF0aW9ucywgc28gd2UncmUgZG9uZS5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRlLmVtaXRTdGF0ZShyZXN1bHQpO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnNjaGVkdWxlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBvYmosIGVuZENhbGxiYWNrKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBzY29wZSA9IGNhbGxDb250ZXh0LnNjb3BlO1xuICAgIGxldCBleGVjQ29udGV4dCA9IGNhbGxDb250ZXh0LmV4ZWN1dGlvbkNvbnRleHQ7XG5cbiAgICBpZiAoIV8uaXNTdHJpbmcoZW5kQ2FsbGJhY2spKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LmZhaWwobmV3IFR5cGVFcnJvcihcIlByb3ZpZGVkIGFyZ3VtZW50ICdlbmRDYWxsYmFjaycgdmFsdWUgaXMgbm90IGEgc3RyaW5nLlwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGNiID0gc2NvcGUuZ2V0KGVuZENhbGxiYWNrKTtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihjYikpIHtcbiAgICAgICAgY2FsbENvbnRleHQuZmFpbChuZXcgVHlwZUVycm9yKGAnJHtlbmRDYWxsYmFja30nIGlzIG5vdCBhIGZ1bmN0aW9uLmApKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGlzR2VuZXJhdG9yID0gaXMuZ2VuZXJhdG9yKG9iaik7XG4gICAgaWYgKF8uaXNBcnJheShvYmopICYmIG9iai5sZW5ndGggfHwgaXNHZW5lcmF0b3IpIHtcbiAgICAgICAgc2NvcGUuc2V0KFwiX19jb2xsZWN0VmFsdWVzXCIsIFtdKTtcbiAgICAgICAgbGV0IGFjdGl2aXRpZXMgPSBbXTtcbiAgICAgICAgbGV0IHZhcmlhYmxlcyA9IFtdO1xuICAgICAgICBsZXQgaXRlbXMgPSBpc0dlbmVyYXRvciA/IG9iaigpIDogb2JqO1xuICAgICAgICBmb3IgKGxldCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuZ2V0KFwiX19jb2xsZWN0VmFsdWVzXCIpLnB1c2goc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5hc1ZhbHVlVG9Db2xsZWN0KGl0ZW0pKTtcbiAgICAgICAgICAgICAgICBhY3Rpdml0aWVzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgdmFyaWFibGVzLnB1c2gobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChfLmlzT2JqZWN0KGl0ZW0pICYmIGl0ZW0uYWN0aXZpdHkgaW5zdGFuY2VvZiBBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLmdldChcIl9fY29sbGVjdFZhbHVlc1wiKS5wdXNoKHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuYXNWYWx1ZVRvQ29sbGVjdChpdGVtLmFjdGl2aXR5KSk7XG4gICAgICAgICAgICAgICAgYWN0aXZpdGllcy5wdXNoKGl0ZW0uYWN0aXZpdHkpO1xuICAgICAgICAgICAgICAgIHZhcmlhYmxlcy5wdXNoKF8uaXNPYmplY3QoaXRlbS52YXJpYWJsZXMpID8gaXRlbS52YXJpYWJsZXMgOiBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjb3BlLmdldChcIl9fY29sbGVjdFZhbHVlc1wiKS5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIHZhcmlhYmxlcy5wdXNoKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpdml0aWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgc2NvcGUuc2V0KFwiX19jb2xsZWN0UGlja1JvdW5kMlwiLCBmYWxzZSk7XG4gICAgICAgICAgICBzY29wZS5zZXQoXCJfX2NvbGxlY3RFcnJvcnNcIiwgW10pO1xuICAgICAgICAgICAgc2NvcGUuc2V0KFwiX19jb2xsZWN0Q2FuY2VsQ291bnRzXCIsIDApO1xuICAgICAgICAgICAgc2NvcGUuc2V0KFwiX19jb2xsZWN0SWRsZUNvdW50c1wiLCAwKTtcbiAgICAgICAgICAgIHNjb3BlLnNldChcIl9fY29sbGVjdFJlbWFpbmluZ1wiLCBhY3Rpdml0aWVzLmxlbmd0aCk7XG4gICAgICAgICAgICBsZXQgZW5kQk0gPSBzY29wZS5zZXQoXCJfX2NvbGxlY3RFbmRCb29rbWFya05hbWVcIiwgc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVDb2xsZWN0aW5nQ29tcGxldGVkQk1OYW1lKHNlbGYpKTtcbiAgICAgICAgICAgIGV4ZWNDb250ZXh0LmNyZWF0ZUJvb2ttYXJrKHNlbGYuaWQsIHNjb3BlLmdldChcIl9fY29sbGVjdEVuZEJvb2ttYXJrTmFtZVwiKSwgZW5kQ2FsbGJhY2spO1xuICAgICAgICAgICAgbGV0IGxlbiA9IGFjdGl2aXRpZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZEFjdGl2aXR5ID0gYWN0aXZpdGllc1tpXTtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGRWYXJpYWJsZXMgPSB2YXJpYWJsZXNbaV07XG4gICAgICAgICAgICAgICAgZXhlY0NvbnRleHQuY3JlYXRlQm9va21hcmsoc2VsZi5pZCwgc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVWYWx1ZUNvbGxlY3RlZEJNTmFtZShjaGlsZEFjdGl2aXR5KSwgXCJyZXN1bHRDb2xsZWN0ZWRcIik7XG4gICAgICAgICAgICAgICAgY2hpbGRBY3Rpdml0eS5fc3RhcnQoY2FsbENvbnRleHQsIGNoaWxkVmFyaWFibGVzKTtcbiAgICAgICAgICAgICAgICBpZiAoIWV4ZWNDb250ZXh0LmlzQm9va21hcmtFeGlzdHMoZW5kQk0pKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGN1cnJlbnQgYWN0aXZpdHkgaGFzIGJlZW4gZW5kZWQgKGJ5IFBpY2sgZm9yIGV4KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gc2NvcGUuZ2V0KFwiX19jb2xsZWN0VmFsdWVzXCIpO1xuICAgICAgICAgICAgc2NvcGUuZGVsZXRlKFwiX19jb2xsZWN0VmFsdWVzXCIpO1xuICAgICAgICAgICAgc2NvcGUuZ2V0KGVuZENhbGxiYWNrKS5jYWxsKHNjb3BlLCBjYWxsQ29udGV4dCwgQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIEFjdGl2aXR5KSB7XG4gICAgICAgIGV4ZWNDb250ZXh0LmNyZWF0ZUJvb2ttYXJrKHNlbGYuaWQsIHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlVmFsdWVDb2xsZWN0ZWRCTU5hbWUob2JqKSwgZW5kQ2FsbGJhY2spO1xuICAgICAgICBvYmouc3RhcnQoY2FsbENvbnRleHQpO1xuICAgIH1cbiAgICBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikgJiYgb2JqLmFjdGl2aXR5IGluc3RhbmNlb2YgQWN0aXZpdHkpIHtcbiAgICAgICAgZXhlY0NvbnRleHQuY3JlYXRlQm9va21hcmsoc2VsZi5pZCwgc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5jcmVhdGVWYWx1ZUNvbGxlY3RlZEJNTmFtZShvYmouYWN0aXZpdHkpLCBlbmRDYWxsYmFjayk7XG4gICAgICAgIG9iai5fc3RhcnQoY2FsbENvbnRleHQsIF8uaXNPYmplY3Qob2JqLnZhcmlhYmxlcykgPyBvYmoudmFyaWFibGVzIDogbnVsbCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzY29wZS5nZXQoZW5kQ2FsbGJhY2spLmNhbGwoc2NvcGUsIGNhbGxDb250ZXh0LCBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGUsIG9iaik7XG4gICAgfVxufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLnJlc3VsdENvbGxlY3RlZCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgcmVhc29uLCByZXN1bHQsIGJvb2ttYXJrKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IGV4ZWNDb250ZXh0ID0gY2FsbENvbnRleHQuZXhlY3V0aW9uQ29udGV4dDtcbiAgICBsZXQgY2hpbGRJZCA9IHNwZWNTdHJpbmdzLmdldFN0cmluZyhib29rbWFyay5uYW1lKTtcbiAgICBsZXQgYXJnTWFya2VyID0gc3BlY1N0cmluZ3MuYWN0aXZpdGllcy5hc1ZhbHVlVG9Db2xsZWN0KGNoaWxkSWQpO1xuICAgIGxldCByZXN1bHRJbmRleCA9IHNlbGYuZ2V0KFwiX19jb2xsZWN0VmFsdWVzXCIpLmluZGV4T2YoYXJnTWFya2VyKTtcbiAgICBsZXQgcGlja0N1cnJlbnQgPSBmYWxzZTtcbiAgICBpZiAocmVzdWx0SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHNlbGYuZ2V0KFwiX19jb2xsZWN0RXJyb3JzXCIpLnB1c2gobmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoXCJBY3Rpdml0eSAnXCIgKyBjaGlsZElkICsgXCInIGlzIG5vdCBmb3VuZCBpbiBfX2NvbGxlY3RWYWx1ZXMuXCIpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChzZWxmLmdldChcIl9fY29sbGVjdFBpY2tcIikgJiYgKHJlYXNvbiAhPT0gQWN0aXZpdHkuc3RhdGVzLmlkbGUgfHwgc2VsZi5nZXQoXCJfX2NvbGxlY3RQaWNrUm91bmQyXCIpKSkge1xuICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIHBpY2sgY3VycmVudCByZXN1bHQsIGFuZCBzaHV0IGRvd24gb3RoZXJzOlxuICAgICAgICAgICAgbGV0IGlkcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgY3Ygb2Ygc2VsZi5nZXQoXCJfX2NvbGxlY3RWYWx1ZXNcIikpIHtcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBzcGVjU3RyaW5ncy5nZXRTdHJpbmcoY3YpO1xuICAgICAgICAgICAgICAgIGlmIChpZCAmJiBpZCAhPT0gY2hpbGRJZCkge1xuICAgICAgICAgICAgICAgICAgICBpZHMucHVzaChpZCk7XG4gICAgICAgICAgICAgICAgICAgIGV4ZWNDb250ZXh0LmRlbGV0ZVNjb3BlT2ZBY3Rpdml0eShjYWxsQ29udGV4dCwgaWQpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaWJtTmFtZSA9IHNwZWNTdHJpbmdzLmFjdGl2aXRpZXMuY3JlYXRlVmFsdWVDb2xsZWN0ZWRCTU5hbWUoaWQpO1xuICAgICAgICAgICAgICAgICAgICBleGVjQ29udGV4dC5kZWxldGVCb29rbWFyayhpYm1OYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleGVjQ29udGV4dC5jYW5jZWxFeGVjdXRpb24oaWRzKTtcbiAgICAgICAgICAgIHBpY2tDdXJyZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN3aXRjaCAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBBY3Rpdml0eS5zdGF0ZXMuY29tcGxldGU6XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0KFwiX19jb2xsZWN0VmFsdWVzXCIpW3Jlc3VsdEluZGV4XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsOlxuICAgICAgICAgICAgICAgICAgICBzZWxmLmluYyhcIl9fY29sbGVjdENhbmNlbENvdW50c1wiKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXQoXCJfX2NvbGxlY3RWYWx1ZXNcIilbcmVzdWx0SW5kZXhdID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBBY3Rpdml0eS5zdGF0ZXMuaWRsZTpcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbmMoXCJfX2NvbGxlY3RJZGxlQ291bnRzXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEFjdGl2aXR5LnN0YXRlcy5mYWlsOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwgbmV3IGVycm9ycy5BY3Rpdml0eVN0YXRlRXhjZXB0aW9uRXJyb3IoXCJVbmtub3duIGVycm9yLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXQoXCJfX2NvbGxlY3RFcnJvcnNcIikucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmdldChcIl9fY29sbGVjdFZhbHVlc1wiKVtyZXN1bHRJbmRleF0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBzZWxmLmdldChcIl9fY29sbGVjdEVycm9yc1wiKS5wdXNoKG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKFwiQm9va21hcmsgc2hvdWxkIG5vdCBiZSBjb250aW51ZWQgd2l0aCByZWFzb24gJ1wiICsgcmVhc29uICsgXCInLlwiKSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0KFwiX19jb2xsZWN0VmFsdWVzXCIpW3Jlc3VsdEluZGV4XSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzZWxmLmRlYyhcIl9fY29sbGVjdFJlbWFpbmluZ1wiKSA9PT0gMCB8fCBwaWNrQ3VycmVudCkge1xuICAgICAgICBsZXQgZW5kQm9va21hcmtOYW1lID0gc2VsZi5nZXQoXCJfX2NvbGxlY3RFbmRCb29rbWFya05hbWVcIik7XG5cbiAgICAgICAgaWYgKCFwaWNrQ3VycmVudCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuZ2V0KFwiX19jb2xsZWN0RXJyb3JzXCIpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJlYXNvbiA9IEFjdGl2aXR5LnN0YXRlcy5mYWlsO1xuICAgICAgICAgICAgICAgIGxldCBfX2NvbGxlY3RFcnJvcnMgPSBzZWxmLmdldChcIl9fY29sbGVjdEVycm9yc1wiKTtcbiAgICAgICAgICAgICAgICBpZiAoX19jb2xsZWN0RXJyb3JzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBfX2NvbGxlY3RFcnJvcnNbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgZXJyb3JzLkFnZ3JlZ2F0ZUVycm9yKF9fY29sbGVjdEVycm9ycyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2VsZi5nZXQoXCJfX2NvbGxlY3RDYW5jZWxDb3VudHNcIikpIHtcbiAgICAgICAgICAgICAgICByZWFzb24gPSBBY3Rpdml0eS5zdGF0ZXMuY2FuY2VsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2VsZi5nZXQoXCJfX2NvbGxlY3RJZGxlQ291bnRzXCIpKSB7XG4gICAgICAgICAgICAgICAgcmVhc29uID0gQWN0aXZpdHkuc3RhdGVzLmlkbGU7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXQoXCJfX2NvbGxlY3RSZW1haW5pbmdcIiwgMSk7XG4gICAgICAgICAgICAgICAgc2VsZi5kZWMoXCJfX2NvbGxlY3RJZGxlQ291bnRzXCIpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmdldChcIl9fY29sbGVjdFBpY2tcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UncmUgaW4gcGljayBtb2RlLCBhbmQgYWxsIHJlc3VsdCB3YXMgaWRsZVxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldChcIl9fY29sbGVjdFBpY2tSb3VuZDJcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVhc29uID0gQWN0aXZpdHkuc3RhdGVzLmNvbXBsZXRlO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlbGYuZ2V0KFwiX19jb2xsZWN0VmFsdWVzXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzZWxmLmdldChcIl9fY29sbGVjdFJlbWFpbmluZ1wiKSkge1xuICAgICAgICAgICAgc2VsZi5kZWxldGUoXCJfX2NvbGxlY3RWYWx1ZXNcIik7XG4gICAgICAgICAgICBzZWxmLmRlbGV0ZShcIl9fY29sbGVjdFJlbWFpbmluZ1wiKTtcbiAgICAgICAgICAgIHNlbGYuZGVsZXRlKFwiX19jb2xsZWN0SWRsZUNvdW50c1wiKTtcbiAgICAgICAgICAgIHNlbGYuZGVsZXRlKFwiX19jb2xsZWN0RW5kQm9va21hcmtOYW1lXCIpO1xuICAgICAgICAgICAgc2VsZi5kZWxldGUoXCJfX2NvbGxlY3RDYW5jZWxDb3VudHNcIik7XG4gICAgICAgICAgICBzZWxmLmRlbGV0ZShcIl9fY29sbGVjdEVycm9yc1wiKTtcbiAgICAgICAgICAgIHNlbGYuZGVsZXRlKFwiX19jb2xsZWN0UGlja1wiKTtcbiAgICAgICAgICAgIHNlbGYuZGVsZXRlKFwiX19jb2xsZWN0UGlja1JvdW5kMlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV4ZWNDb250ZXh0LnJlc3VtZUJvb2ttYXJrSW5TY29wZShjYWxsQ29udGV4dCwgZW5kQm9va21hcmtOYW1lLCByZWFzb24sIHJlc3VsdCk7XG4gICAgfVxufTtcbi8qIFJVTiAqL1xuXG4vKiBTQ09QRSAqL1xuQWN0aXZpdHkucHJvdG90eXBlLl9nZXRTY29wZUtleXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmICghc2VsZi5fc2NvcGVLZXlzKSB7XG4gICAgICAgIHNlbGYuX3Njb3BlS2V5cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBrZXkgb2Ygc2VsZi5nZXRLZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLm5vblNjb3BlZFByb3BlcnRpZXMuZXhpc3RzKGtleSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBY3Rpdml0eS5wcm90b3R5cGVba2V5XSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5fc2NvcGVLZXlzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2VsZi5fc2NvcGVLZXlzO1xufTtcblxuQWN0aXZpdHkucHJvdG90eXBlLmNyZWF0ZVNjb3BlUGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCA9PT0gbnVsbCkge1xuICAgICAgICBsZXQgZmlyc3QgPSB0cnVlO1xuICAgICAgICBsZXQgc3JjID0gXCJyZXR1cm4ge1wiO1xuICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgb2Ygc2VsZi5fZ2V0U2NvcGVLZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gXCIsXFxuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KHNlbGZbZmllbGROYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gZmllbGROYW1lICsgXCI6Xy5jbG9uZShhLlwiICsgZmllbGROYW1lICsgXCIsIHRydWUpXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcmMgKz0gZmllbGROYW1lICsgXCI6YS5cIiArIGZpZWxkTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzcmMgKz0gXCJ9XCI7XG5cbiAgICAgICAgdGhpcy5fY3JlYXRlU2NvcGVQYXJ0SW1wbCA9IG5ldyBGdW5jdGlvbihcImEsX1wiLCBzcmMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVTY29wZVBhcnRJbXBsKHRoaXMsIF8pO1xufTtcbi8qIFNDT1BFICovXG5cbkFjdGl2aXR5LnN0YXRlcyA9IGVudW1zLkFjdGl2aXR5U3RhdGVzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2aXR5O1xuIl19
