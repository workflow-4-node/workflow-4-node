"use strict";
var ActivityExecutionState = require("./activityExecutionState");
var ResumeBookmarkQueue = require("./resumeBookmarkQueue");
var enums = require("../common/enums");
var errors = require("../common/errors");
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");
var guids = require("../common/guids");
var ScopeTree = require("./scopeTree");
var is = require("../common/is");
var CallContext = require("./callContext");
var assert = require("better-assert");
var Bluebird = require("bluebird");
function ActivityExecutionContext(engine) {
  EventEmitter.call(this);
  this._activityStates = new Map();
  this._bookmarks = new Map();
  this._activityIds = new Map();
  this._resumeBMQueue = new ResumeBookmarkQueue();
  this._rootActivity = null;
  this._knownActivities = new Map();
  this._nextActivityId = 0;
  this._scopeTree = this._createScopeTree();
  this.engine = engine;
}
util.inherits(ActivityExecutionContext, EventEmitter);
Object.defineProperties(ActivityExecutionContext.prototype, {
  scope: {get: function() {
      return this._scopeTree.currentScope;
    }},
  hasScope: {get: function() {
      return !this._scopeTree.isOnInitial;
    }},
  rootActivity: {get: function() {
      return this._rootActivity;
    }}
});
ActivityExecutionContext.prototype.getInstanceId = function(activity, tryIt) {
  var id = this._activityIds.get(activity);
  if (_.isUndefined(id) && !tryIt) {
    throw new errors.ActivityStateExceptionError(("Activity " + activity + " is not part of the context."));
  }
  return id;
};
ActivityExecutionContext.prototype.setInstanceId = function(activity, id) {
  return this._activityIds.set(activity, id);
};
ActivityExecutionContext.prototype._createScopeTree = function() {
  var self = this;
  return new ScopeTree({resultCollected: function(context, reason, result, bookmarkName) {
      context.activity.resultCollected.call(context.scope, context, reason, result, bookmarkName);
    }}, function(id) {
    return self._getKnownActivity(id);
  });
};
ActivityExecutionContext.prototype.initialize = function(rootActivity) {
  if (this._rootActivity) {
    throw new Error("Context is already initialized.");
  }
  if (!is.activity(rootActivity)) {
    throw new TypeError("Argument 'rootActivity' value is not an activity.");
  }
  this._rootActivity = rootActivity;
  this._initialize(null, rootActivity, {instanceId: 0});
};
ActivityExecutionContext.prototype.appendToContext = function(args) {
  this._checkInit();
  var currMax = this._nextActivityId;
  var c = {instanceId: currMax};
  if (_.isArray(args)) {
    var state = this.getExecutionState(this._rootActivity);
    var $__5 = true;
    var $__6 = false;
    var $__7 = undefined;
    try {
      for (var $__3 = void 0,
          $__2 = (args)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
        var arg = $__3.value;
        {
          if (is.activity(arg)) {
            this._initialize(this._rootActivity, arg, c);
            state.childInstanceIds.add(this.getInstanceId(arg));
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
  } else {
    throw new TypeError("Argument 'args' value is not an array.");
  }
  return {
    fromId: currMax,
    toId: this._nextActivityId
  };
};
ActivityExecutionContext.prototype.removeFromContext = function(removeToken) {
  this._checkInit();
  if (removeToken && !_.isUndefined(removeToken.fromId) && !_.isUndefined(removeToken.toId)) {
    var state = this.getExecutionState(this._rootActivity);
    for (var id = removeToken.fromId; id <= removeToken.toId; id++) {
      var sid = id.toString();
      this._knownActivities.delete(sid);
      this._activityStates.delete(sid);
      state.childInstanceIds.delete(sid);
    }
  } else {
    throw new TypeError("Argument 'removeToken' value is not a valid remove token object.");
  }
  this._nextActivityId = removeToken.fromId;
};
ActivityExecutionContext.prototype._checkInit = function() {
  if (!this._rootActivity) {
    throw new Error("Context is not initialized.");
  }
};
ActivityExecutionContext.prototype._initialize = function(parent, activity, idCounter) {
  var activityId = this.getInstanceId(activity, true);
  var nextId = (idCounter.instanceId++).toString();
  if (!activityId) {
    activityId = nextId;
    this.setInstanceId(activity, activityId);
  } else if (activityId !== nextId) {
    throw new Error("Activity " + activity + " has been assigned to an other context in a different tree which is not allowed.");
  }
  this._nextActivityId = idCounter.instanceId;
  var state = this.getExecutionState(activityId);
  state.parentInstanceId = parent ? this.getInstanceId(parent) : null;
  this._knownActivities.set(activityId, activity);
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (activity.immediateChildren(this))[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var child = $__3.value;
      {
        this._initialize(activity, child, idCounter);
        state.childInstanceIds.add(this.getInstanceId(child));
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
};
ActivityExecutionContext.prototype.getExecutionState = function(idOrActivity) {
  var self = this;
  var id;
  if (_.isString(idOrActivity)) {
    id = idOrActivity;
  } else if (is.activity(idOrActivity)) {
    id = self.getInstanceId(idOrActivity);
  } else {
    throw new TypeError("Cannot get state of " + idOrActivity);
  }
  var state = self._activityStates.get(id);
  if (_.isUndefined(state)) {
    state = new ActivityExecutionState(id);
    state.on(enums.ActivityStates.run, function(args) {
      self.emit(enums.ActivityStates.run, args);
    });
    state.on(enums.ActivityStates.end, function(args) {
      self.emit(enums.ActivityStates.end, args);
    });
    self._activityStates.set(id, state);
  }
  return state;
};
ActivityExecutionContext.prototype._getKnownActivity = function(activityId) {
  var activity = this._knownActivities.get(activityId);
  if (!activity) {
    throw new errors.ActivityRuntimeError("Activity by id '" + activityId + "' not found.");
  }
  return activity;
};
ActivityExecutionContext.prototype.createBookmark = function(activityId, name, endCallback) {
  this.registerBookmark({
    name: name,
    instanceId: activityId,
    timestamp: new Date().getTime(),
    endCallback: endCallback
  });
  return name;
};
ActivityExecutionContext.prototype.registerBookmark = function(bookmark) {
  var bm = this._bookmarks.get(bookmark.name);
  if (bm) {
    throw new errors.ActivityRuntimeError("Bookmark '" + bookmark.name + "' already exists.");
  }
  this._bookmarks.set(bookmark.name, bookmark);
};
ActivityExecutionContext.prototype.isBookmarkExists = function(name) {
  return this._bookmarks.has(name);
};
ActivityExecutionContext.prototype.getBookmarkTimestamp = function(name, throwIfNotFound) {
  var bm = this._bookmarks.get(name);
  if (_.isUndefined(bm) && throwIfNotFound) {
    throw new Error("Bookmark '" + name + "' not found.");
  }
  return bm ? bm.timestamp : null;
};
ActivityExecutionContext.prototype.deleteBookmark = function(name) {
  this._bookmarks.delete(name);
};
ActivityExecutionContext.prototype.noopCallbacks = function(bookmarkNames) {
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (bookmarkNames)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var name = $__3.value;
      {
        var bm = this._bookmarks.get(name);
        if (bm) {
          bm.endCallback = _.noop;
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
};
ActivityExecutionContext.prototype.resumeBookmarkInScope = function(callContext, name, reason, result) {
  var bm = this._bookmarks.get(name);
  if (_.isUndefined(bm)) {
    throw new Error("Bookmark '" + name + "' doesn't exists. Cannot continue with reason: " + reason + ".");
  }
  var self = this;
  return new Bluebird(function(resolve, reject) {
    setImmediate(function() {
      try {
        bm = self._bookmarks.get(name);
        if (bm) {
          self._doResumeBookmark(callContext, bm, reason, result, reason === enums.ActivityStates.idle);
          resolve(true);
        }
        resolve(false);
      } catch (e) {
        reject(e);
      }
    });
  });
};
ActivityExecutionContext.prototype.resumeBookmarkInternal = function(callContext, name, reason, result) {
  var bm = this._bookmarks.get(name);
  this._resumeBMQueue.enqueue(name, reason, result);
};
ActivityExecutionContext.prototype.resumeBookmarkExternal = function(name, reason, result) {
  var self = this;
  var bm = self._bookmarks.get(name);
  if (!bm) {
    throw new errors.BookmarkNotFoundError("Internal resume bookmark request cannot be processed because bookmark '" + name + "' doesn't exists.");
  }
  self._doResumeBookmark(new CallContext(this, bm.instanceId), bm, reason, result);
};
ActivityExecutionContext.prototype.processResumeBookmarkQueue = function() {
  var self = this;
  var command = self._resumeBMQueue.dequeue();
  if (command) {
    var bm = self._bookmarks.get(command.name);
    if (!bm) {
      throw new errors.BookmarkNotFoundError("Internal resume bookmark request cannot be processed because bookmark '" + command.name + "' doesn't exists.");
    }
    self._doResumeBookmark(new CallContext(this, bm.instanceId), bm, command.reason, command.result);
    return true;
  }
  return false;
};
ActivityExecutionContext.prototype._doResumeBookmark = function(callContext, bookmark, reason, result, noRemove) {
  var scope = callContext.scope;
  if (!noRemove) {
    this._bookmarks.delete(bookmark.name);
  }
  var cb = bookmark.endCallback;
  if (_.isString(cb)) {
    cb = scope[bookmark.endCallback];
    if (!_.isFunction(cb)) {
      cb = null;
    }
  }
  if (!cb) {
    throw new errors.ActivityRuntimeError("Bookmark's '" + bookmark.name + "' callback '" + bookmark.endCallback + "' is not defined on the current scope.");
  }
  cb.call(scope, callContext, reason, result, bookmark);
};
ActivityExecutionContext.prototype.cancelExecution = function(scope, activityIds) {
  var self = this;
  var allIds = new Set();
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (activityIds)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var id = $__3.value;
      {
        self._cancelSubtree(scope, allIds, id);
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
  var $__12 = true;
  var $__13 = false;
  var $__14 = undefined;
  try {
    for (var $__10 = void 0,
        $__9 = (self._bookmarks.values())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__12 = ($__10 = $__9.next()).done); $__12 = true) {
      var bm = $__10.value;
      {
        if (allIds.has(bm.instanceId)) {
          self._bookmarks.delete(bm.name);
        }
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
};
ActivityExecutionContext.prototype._cancelSubtree = function(scope, allIds, activityId) {
  var self = this;
  allIds.add(activityId);
  var state = self.getExecutionState(activityId);
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (state.childInstanceIds.values())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var id = $__3.value;
      {
        self._cancelSubtree(scope, allIds, id);
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
  state.reportState(enums.ActivityStates.cancel, null, scope);
};
ActivityExecutionContext.prototype.deleteScopeOfActivity = function(callContext, activityId) {
  this._scopeTree.deleteScopePart(callContext.instanceId, activityId);
};
function mapToArray(map) {
  if (!map) {
    return null;
  }
  assert(map instanceof Map);
  var json = [];
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (map.entries())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var kvp = $__3.value;
      {
        json.push(kvp);
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
  return json;
}
function arrayToMap(json) {
  if (!json) {
    return null;
  }
  assert(_.isArray(json));
  var map = new Map();
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (json)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var kvp = $__3.value;
      {
        map.set(kvp[0], kvp[1]);
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
  return map;
}
ActivityExecutionContext.prototype.getStateAndPromotions = function(serializer, enablePromotions) {
  if (serializer && !_.isFunction(serializer.toJSON)) {
    throw new TypeError("Argument 'serializer' is not a serializer.");
  }
  var activityStates = new Map();
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (this._activityStates.values())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var s = $__3.value;
      {
        activityStates.set(s.instanceId, s.asJSON());
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
  var scopeStateAndPromotions = this._scopeTree.getExecutionState(this, enablePromotions);
  var serialized;
  if (serializer) {
    serialized = serializer.toJSON({
      activityStates: activityStates,
      bookmarks: this._bookmarks,
      scope: scopeStateAndPromotions.state
    });
  } else {
    serialized = {
      activityStates: mapToArray(activityStates),
      bookmarks: mapToArray(this._bookmarks),
      scope: scopeStateAndPromotions.state
    };
  }
  return {
    state: serialized,
    promotedProperties: scopeStateAndPromotions.promotedProperties
  };
};
ActivityExecutionContext.prototype.setState = function(serializer, json) {
  if (serializer && !_.isFunction(serializer.fromJSON)) {
    throw new TypeError("Argument 'serializer' is not a serializer.");
  }
  if (!_.isObject(json)) {
    throw new TypeError("Argument 'json' is not an object.");
  }
  if (serializer) {
    json = serializer.fromJSON(json);
    if (!(json.activityStates instanceof Map)) {
      throw new TypeError("ActivityStates property value of argument 'json' is not an Map instance.");
    }
    if (!(json.bookmarks instanceof Map)) {
      throw new TypeError("Bookmarks property value of argument 'json' is not an Map instance.");
    }
  } else {
    if (!json.activityStates) {
      throw new TypeError("ActivityStates property value of argument 'json' is not an object.");
    }
    if (!json.bookmarks) {
      throw new TypeError("Bookmarks property value of argument 'json' is not an object.");
    }
    json = {
      activityStates: arrayToMap(json.activityStates),
      bookmarks: arrayToMap(json.bookmarks),
      scope: json.scope
    };
  }
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (this._activityStates.values())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var s = $__3.value;
      {
        var stored = json.activityStates.get(s.instanceId);
        if (_.isUndefined(stored)) {
          throw new Error("Activity's of '" + s.instanceId + "' state not found.");
        }
        s.fromJSON(stored);
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
  this._bookmarks = json.bookmarks;
  this._scopeTree.setState(json.scope);
};
module.exports = ActivityExecutionContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUVBLEFBQUksRUFBQSxDQUFBLHNCQUFxQixFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsMEJBQXlCLENBQUMsQ0FBQztBQUNoRSxBQUFJLEVBQUEsQ0FBQSxtQkFBa0IsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLHVCQUFzQixDQUFDLENBQUM7QUFDMUQsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxrQkFBaUIsQ0FBQyxDQUFDO0FBQ3hDLEFBQUksRUFBQSxDQUFBLElBQUcsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO0FBQzFCLEFBQUksRUFBQSxDQUFBLFlBQVcsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLFFBQU8sQ0FBQyxhQUFhLENBQUM7QUFDakQsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxTQUFRLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxhQUFZLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxjQUFhLENBQUMsQ0FBQztBQUNoQyxBQUFJLEVBQUEsQ0FBQSxXQUFVLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxlQUFjLENBQUMsQ0FBQztBQUMxQyxBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxlQUFjLENBQUMsQ0FBQztBQUNyQyxB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QyxFQUFDLENBQUMsS0FBSyxDQUFDLENBQ3pFLE9BQW9CLEtBQUcsQ0FBRztRQWdiMUIsRUFBQTtBQUFvQztBQUN6QyxBQUFJLFVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxJQUFHLGVBQWUsSUFBSSxBQUFDLENBQUMsQ0FBQSxXQUFXLENBQUMsQ0FBQztBQUNsRCxXQUFJLENBQUEsWUFBWSxBQUFDLENBQUMsTUFBSyxDQUFDLENBQUc7QUFDdkIsY0FBTSxJQUFJLE1BQUksQUFBQyxDQUFDLGlCQUFnQixFQUFJLENBQUEsQ0FBQSxXQUFXLENBQUEsQ0FBSSxxQkFBbUIsQ0FBQyxDQUFDO1FBQzVFO0FBQUEsQUFDQSxRQUFBLFNBQVMsQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO01BQ3RCO0lBbmJJO0FBQUEsRUFGQSxDQUFFLFlBQTBCO0FBQzFCLFNBQW9CLEtBQUcsQ0FBQztBQUN4QixjQUFvQyxDQUFDO0VBQ3ZDLENBQUUsT0FBUTtBQUNSLE1BQUk7QUFDRixTQUFJLEtBQWlCLEdBQUssQ0FBQSxXQUF1QixHQUFLLEtBQUcsQ0FBRztBQUMxRCxrQkFBd0IsQUFBQyxFQUFDLENBQUM7TUFDN0I7QUFBQSxJQUNGLENBQUUsT0FBUTtBQUNSLGNBQXdCO0FBQ3RCLGtCQUF3QjtNQUMxQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsQUEwYUosS0FBRyxXQUFXLEVBQUksQ0FBQSxJQUFHLFVBQVUsQ0FBQztBQUNoQyxLQUFHLFdBQVcsU0FBUyxBQUFDLENBQUMsSUFBRyxNQUFNLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBR0QsS0FBSyxRQUFRLEVBQUkseUJBQXVCLENBQUM7QUFBQSIsImZpbGUiOiJhY3Rpdml0aWVzL2FjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiJsaWIvZXM2Iiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBBY3Rpdml0eUV4ZWN1dGlvblN0YXRlID0gcmVxdWlyZShcIi4vYWN0aXZpdHlFeGVjdXRpb25TdGF0ZVwiKTtcbmxldCBSZXN1bWVCb29rbWFya1F1ZXVlID0gcmVxdWlyZShcIi4vcmVzdW1lQm9va21hcmtRdWV1ZVwiKTtcbmxldCBlbnVtcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZW51bXNcIik7XG5sZXQgZXJyb3JzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lcnJvcnNcIik7XG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xubGV0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoXCJldmVudHNcIikuRXZlbnRFbWl0dGVyO1xubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xubGV0IGd1aWRzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9ndWlkc1wiKTtcbmxldCBTY29wZVRyZWUgPSByZXF1aXJlKFwiLi9zY29wZVRyZWVcIik7XG5sZXQgaXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2lzXCIpO1xubGV0IENhbGxDb250ZXh0ID0gcmVxdWlyZShcIi4vY2FsbENvbnRleHRcIik7XG5sZXQgYXNzZXJ0ID0gcmVxdWlyZShcImJldHRlci1hc3NlcnRcIik7XG5sZXQgQmx1ZWJpcmQgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XG5cbmZ1bmN0aW9uIEFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dChlbmdpbmUpIHtcbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuX2FjdGl2aXR5U3RhdGVzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2Jvb2ttYXJrcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9hY3Rpdml0eUlkcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9yZXN1bWVCTVF1ZXVlID0gbmV3IFJlc3VtZUJvb2ttYXJrUXVldWUoKTtcbiAgICB0aGlzLl9yb290QWN0aXZpdHkgPSBudWxsO1xuICAgIHRoaXMuX2tub3duQWN0aXZpdGllcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9uZXh0QWN0aXZpdHlJZCA9IDA7XG4gICAgdGhpcy5fc2NvcGVUcmVlID0gdGhpcy5fY3JlYXRlU2NvcGVUcmVlKCk7XG4gICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7IC8vIENvdWxkIGJlIG51bGwgaW4gc3BlY2lhbCBjYXNlcywgc2VlIHdvcmtmbG93UmVnaXN0cnkuanNcbn1cblxudXRpbC5pbmhlcml0cyhBY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQsIEV2ZW50RW1pdHRlcik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFxuICAgIEFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUsXG4gICAge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Njb3BlVHJlZS5jdXJyZW50U2NvcGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGhhc1Njb3BlOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIXRoaXMuX3Njb3BlVHJlZS5pc09uSW5pdGlhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcm9vdEFjdGl2aXR5OiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcm9vdEFjdGl2aXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuKTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5nZXRJbnN0YW5jZUlkID0gZnVuY3Rpb24oYWN0aXZpdHksIHRyeUl0KSB7XG4gICAgbGV0IGlkID0gdGhpcy5fYWN0aXZpdHlJZHMuZ2V0KGFjdGl2aXR5KTtcbiAgICBpZiAoXy5pc1VuZGVmaW5lZChpZCkgJiYgIXRyeUl0KSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKGBBY3Rpdml0eSAke2FjdGl2aXR5fSBpcyBub3QgcGFydCBvZiB0aGUgY29udGV4dC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5zZXRJbnN0YW5jZUlkID0gZnVuY3Rpb24oYWN0aXZpdHksIGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2aXR5SWRzLnNldChhY3Rpdml0eSwgaWQpO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5fY3JlYXRlU2NvcGVUcmVlID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFNjb3BlVHJlZShcbiAgICAgICAge1xuICAgICAgICAgICAgcmVzdWx0Q29sbGVjdGVkOiBmdW5jdGlvbiAoY29udGV4dCwgcmVhc29uLCByZXN1bHQsIGJvb2ttYXJrTmFtZSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuYWN0aXZpdHkucmVzdWx0Q29sbGVjdGVkLmNhbGwoY29udGV4dC5zY29wZSwgY29udGV4dCwgcmVhc29uLCByZXN1bHQsIGJvb2ttYXJrTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2dldEtub3duQWN0aXZpdHkoaWQpO1xuICAgICAgICB9KTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChyb290QWN0aXZpdHkpIHtcbiAgICBpZiAodGhpcy5fcm9vdEFjdGl2aXR5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbnRleHQgaXMgYWxyZWFkeSBpbml0aWFsaXplZC5cIik7XG4gICAgfVxuICAgIGlmICghaXMuYWN0aXZpdHkocm9vdEFjdGl2aXR5KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ3Jvb3RBY3Rpdml0eScgdmFsdWUgaXMgbm90IGFuIGFjdGl2aXR5LlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yb290QWN0aXZpdHkgPSByb290QWN0aXZpdHk7XG4gICAgdGhpcy5faW5pdGlhbGl6ZShudWxsLCByb290QWN0aXZpdHksIHsgaW5zdGFuY2VJZDogMCB9KTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuYXBwZW5kVG9Db250ZXh0ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICB0aGlzLl9jaGVja0luaXQoKTtcblxuICAgIGxldCBjdXJyTWF4ID0gdGhpcy5fbmV4dEFjdGl2aXR5SWQ7XG4gICAgbGV0IGMgPSB7IGluc3RhbmNlSWQ6IGN1cnJNYXggfTtcblxuICAgIGlmIChfLmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgbGV0IHN0YXRlID0gdGhpcy5nZXRFeGVjdXRpb25TdGF0ZSh0aGlzLl9yb290QWN0aXZpdHkpO1xuICAgICAgICBmb3IgKGxldCBhcmcgb2YgYXJncykge1xuICAgICAgICAgICAgaWYgKGlzLmFjdGl2aXR5KGFyZykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0aWFsaXplKHRoaXMuX3Jvb3RBY3Rpdml0eSwgYXJnLCBjKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5jaGlsZEluc3RhbmNlSWRzLmFkZCh0aGlzLmdldEluc3RhbmNlSWQoYXJnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnYXJncycgdmFsdWUgaXMgbm90IGFuIGFycmF5LlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBmcm9tSWQ6IGN1cnJNYXgsXG4gICAgICAgIHRvSWQ6IHRoaXMuX25leHRBY3Rpdml0eUlkXG4gICAgfTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUucmVtb3ZlRnJvbUNvbnRleHQgPSBmdW5jdGlvbiAocmVtb3ZlVG9rZW4pIHtcbiAgICB0aGlzLl9jaGVja0luaXQoKTtcblxuICAgIGlmIChyZW1vdmVUb2tlbiAmJiAhXy5pc1VuZGVmaW5lZChyZW1vdmVUb2tlbi5mcm9tSWQpICYmICFfLmlzVW5kZWZpbmVkKHJlbW92ZVRva2VuLnRvSWQpKSB7XG4gICAgICAgIGxldCBzdGF0ZSA9IHRoaXMuZ2V0RXhlY3V0aW9uU3RhdGUodGhpcy5fcm9vdEFjdGl2aXR5KTtcblxuICAgICAgICBmb3IgKGxldCBpZCA9IHJlbW92ZVRva2VuLmZyb21JZDsgaWQgPD0gcmVtb3ZlVG9rZW4udG9JZDsgaWQrKykge1xuICAgICAgICAgICAgbGV0IHNpZCA9IGlkLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB0aGlzLl9rbm93bkFjdGl2aXRpZXMuZGVsZXRlKHNpZCk7XG4gICAgICAgICAgICB0aGlzLl9hY3Rpdml0eVN0YXRlcy5kZWxldGUoc2lkKTtcbiAgICAgICAgICAgIHN0YXRlLmNoaWxkSW5zdGFuY2VJZHMuZGVsZXRlKHNpZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAncmVtb3ZlVG9rZW4nIHZhbHVlIGlzIG5vdCBhIHZhbGlkIHJlbW92ZSB0b2tlbiBvYmplY3QuXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX25leHRBY3Rpdml0eUlkID0gcmVtb3ZlVG9rZW4uZnJvbUlkO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5fY2hlY2tJbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fcm9vdEFjdGl2aXR5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbnRleHQgaXMgbm90IGluaXRpYWxpemVkLlwiKTtcbiAgICB9XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLl9pbml0aWFsaXplID0gZnVuY3Rpb24gKHBhcmVudCwgYWN0aXZpdHksIGlkQ291bnRlcikge1xuICAgIGxldCBhY3Rpdml0eUlkID0gdGhpcy5nZXRJbnN0YW5jZUlkKGFjdGl2aXR5LCB0cnVlKTtcbiAgICBsZXQgbmV4dElkID0gKGlkQ291bnRlci5pbnN0YW5jZUlkKyspLnRvU3RyaW5nKCk7XG4gICAgaWYgKCFhY3Rpdml0eUlkKSB7XG4gICAgICAgIGFjdGl2aXR5SWQgPSBuZXh0SWQ7XG4gICAgICAgIHRoaXMuc2V0SW5zdGFuY2VJZChhY3Rpdml0eSwgYWN0aXZpdHlJZCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGFjdGl2aXR5SWQgIT09IG5leHRJZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBY3Rpdml0eSBcIiArIGFjdGl2aXR5ICsgXCIgaGFzIGJlZW4gYXNzaWduZWQgdG8gYW4gb3RoZXIgY29udGV4dCBpbiBhIGRpZmZlcmVudCB0cmVlIHdoaWNoIGlzIG5vdCBhbGxvd2VkLlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLl9uZXh0QWN0aXZpdHlJZCA9IGlkQ291bnRlci5pbnN0YW5jZUlkO1xuICAgIGxldCBzdGF0ZSA9IHRoaXMuZ2V0RXhlY3V0aW9uU3RhdGUoYWN0aXZpdHlJZCk7XG4gICAgc3RhdGUucGFyZW50SW5zdGFuY2VJZCA9IHBhcmVudCA/IHRoaXMuZ2V0SW5zdGFuY2VJZChwYXJlbnQpIDogbnVsbDtcbiAgICB0aGlzLl9rbm93bkFjdGl2aXRpZXMuc2V0KGFjdGl2aXR5SWQsIGFjdGl2aXR5KTtcblxuICAgIGZvciAobGV0IGNoaWxkIG9mIGFjdGl2aXR5LmltbWVkaWF0ZUNoaWxkcmVuKHRoaXMpKSB7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemUoYWN0aXZpdHksIGNoaWxkLCBpZENvdW50ZXIpO1xuICAgICAgICBzdGF0ZS5jaGlsZEluc3RhbmNlSWRzLmFkZCh0aGlzLmdldEluc3RhbmNlSWQoY2hpbGQpKTtcbiAgICB9XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmdldEV4ZWN1dGlvblN0YXRlID0gZnVuY3Rpb24gKGlkT3JBY3Rpdml0eSkge1xuICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgIGxldCBpZDtcbiAgICBpZiAoXy5pc1N0cmluZyhpZE9yQWN0aXZpdHkpKSB7XG4gICAgICAgIGlkID0gaWRPckFjdGl2aXR5O1xuICAgIH1cbiAgICBlbHNlIGlmIChpcy5hY3Rpdml0eShpZE9yQWN0aXZpdHkpKSB7XG4gICAgICAgIGlkID0gc2VsZi5nZXRJbnN0YW5jZUlkKGlkT3JBY3Rpdml0eSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGdldCBzdGF0ZSBvZiBcIiArIGlkT3JBY3Rpdml0eSk7XG4gICAgfVxuICAgIGxldCBzdGF0ZSA9IHNlbGYuX2FjdGl2aXR5U3RhdGVzLmdldChpZCk7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoc3RhdGUpKSB7XG4gICAgICAgIHN0YXRlID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uU3RhdGUoaWQpO1xuICAgICAgICBzdGF0ZS5vbihcbiAgICAgICAgICAgIGVudW1zLkFjdGl2aXR5U3RhdGVzLnJ1bixcbiAgICAgICAgICAgIGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0KGVudW1zLkFjdGl2aXR5U3RhdGVzLnJ1biwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgc3RhdGUub24oXG4gICAgICAgICAgICBlbnVtcy5BY3Rpdml0eVN0YXRlcy5lbmQsXG4gICAgICAgICAgICBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdChlbnVtcy5BY3Rpdml0eVN0YXRlcy5lbmQsIGFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHNlbGYuX2FjdGl2aXR5U3RhdGVzLnNldChpZCwgc3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGU7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLl9nZXRLbm93bkFjdGl2aXR5ID0gZnVuY3Rpb24gKGFjdGl2aXR5SWQpIHtcbiAgICBsZXQgYWN0aXZpdHkgPSB0aGlzLl9rbm93bkFjdGl2aXRpZXMuZ2V0KGFjdGl2aXR5SWQpO1xuICAgIGlmICghYWN0aXZpdHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVJ1bnRpbWVFcnJvcihcIkFjdGl2aXR5IGJ5IGlkICdcIiArIGFjdGl2aXR5SWQgKyBcIicgbm90IGZvdW5kLlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGl2aXR5O1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5jcmVhdGVCb29rbWFyayA9IGZ1bmN0aW9uIChhY3Rpdml0eUlkLCBuYW1lLCBlbmRDYWxsYmFjaykge1xuICAgIHRoaXMucmVnaXN0ZXJCb29rbWFyayhcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGluc3RhbmNlSWQ6IGFjdGl2aXR5SWQsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgZW5kQ2FsbGJhY2s6IGVuZENhbGxiYWNrXG4gICAgICAgIH0pO1xuICAgIHJldHVybiBuYW1lO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5yZWdpc3RlckJvb2ttYXJrID0gZnVuY3Rpb24gKGJvb2ttYXJrKSB7XG4gICAgbGV0IGJtID0gdGhpcy5fYm9va21hcmtzLmdldChib29rbWFyay5uYW1lKTtcbiAgICBpZiAoYm0pIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVJ1bnRpbWVFcnJvcihcIkJvb2ttYXJrICdcIiArIGJvb2ttYXJrLm5hbWUgKyBcIicgYWxyZWFkeSBleGlzdHMuXCIpO1xuICAgIH1cbiAgICB0aGlzLl9ib29rbWFya3Muc2V0KGJvb2ttYXJrLm5hbWUsIGJvb2ttYXJrKTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuaXNCb29rbWFya0V4aXN0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Jvb2ttYXJrcy5oYXMobmFtZSk7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmdldEJvb2ttYXJrVGltZXN0YW1wID0gZnVuY3Rpb24gKG5hbWUsIHRocm93SWZOb3RGb3VuZCkge1xuICAgIGxldCBibSA9IHRoaXMuX2Jvb2ttYXJrcy5nZXQobmFtZSk7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoYm0pICYmIHRocm93SWZOb3RGb3VuZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCb29rbWFyayAnXCIgKyBuYW1lICsgXCInIG5vdCBmb3VuZC5cIik7XG4gICAgfVxuICAgIHJldHVybiBibSA/IGJtLnRpbWVzdGFtcCA6IG51bGw7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmRlbGV0ZUJvb2ttYXJrID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aGlzLl9ib29rbWFya3MuZGVsZXRlKG5hbWUpO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5ub29wQ2FsbGJhY2tzID0gZnVuY3Rpb24gKGJvb2ttYXJrTmFtZXMpIHtcbiAgICBmb3IgKGxldCBuYW1lIG9mIGJvb2ttYXJrTmFtZXMpIHtcbiAgICAgICAgbGV0IGJtID0gdGhpcy5fYm9va21hcmtzLmdldChuYW1lKTtcbiAgICAgICAgaWYgKGJtKSB7XG4gICAgICAgICAgICBibS5lbmRDYWxsYmFjayA9IF8ubm9vcDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUucmVzdW1lQm9va21hcmtJblNjb3BlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBuYW1lLCByZWFzb24sIHJlc3VsdCkge1xuICAgIGxldCBibSA9IHRoaXMuX2Jvb2ttYXJrcy5nZXQobmFtZSk7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoYm0pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJvb2ttYXJrICdcIiArIG5hbWUgKyBcIicgZG9lc24ndCBleGlzdHMuIENhbm5vdCBjb250aW51ZSB3aXRoIHJlYXNvbjogXCIgKyByZWFzb24gKyBcIi5cIik7XG4gICAgfVxuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IEJsdWViaXJkKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBibSA9IHNlbGYuX2Jvb2ttYXJrcy5nZXQobmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGJtKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGJtIGlzIHN0aWxsIGV4aXN0cy5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZG9SZXN1bWVCb29rbWFyayhjYWxsQ29udGV4dCwgYm0sIHJlYXNvbiwgcmVzdWx0LCByZWFzb24gPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGUpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUucmVzdW1lQm9va21hcmtJbnRlcm5hbCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgbmFtZSwgcmVhc29uLCByZXN1bHQpIHtcbiAgICBsZXQgYm0gPSB0aGlzLl9ib29rbWFya3MuZ2V0KG5hbWUpO1xuICAgIHRoaXMuX3Jlc3VtZUJNUXVldWUuZW5xdWV1ZShuYW1lLCByZWFzb24sIHJlc3VsdCk7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLnJlc3VtZUJvb2ttYXJrRXh0ZXJuYWwgPSBmdW5jdGlvbiAobmFtZSwgcmVhc29uLCByZXN1bHQpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IGJtID0gc2VsZi5fYm9va21hcmtzLmdldChuYW1lKTtcbiAgICBpZiAoIWJtKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuQm9va21hcmtOb3RGb3VuZEVycm9yKFwiSW50ZXJuYWwgcmVzdW1lIGJvb2ttYXJrIHJlcXVlc3QgY2Fubm90IGJlIHByb2Nlc3NlZCBiZWNhdXNlIGJvb2ttYXJrICdcIiArIG5hbWUgKyBcIicgZG9lc24ndCBleGlzdHMuXCIpO1xuICAgIH1cbiAgICBzZWxmLl9kb1Jlc3VtZUJvb2ttYXJrKG5ldyBDYWxsQ29udGV4dCh0aGlzLCBibS5pbnN0YW5jZUlkKSwgYm0sIHJlYXNvbiwgcmVzdWx0KTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUucHJvY2Vzc1Jlc3VtZUJvb2ttYXJrUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBjb21tYW5kID0gc2VsZi5fcmVzdW1lQk1RdWV1ZS5kZXF1ZXVlKCk7XG4gICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgbGV0IGJtID0gc2VsZi5fYm9va21hcmtzLmdldChjb21tYW5kLm5hbWUpO1xuICAgICAgICBpZiAoIWJtKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkJvb2ttYXJrTm90Rm91bmRFcnJvcihcIkludGVybmFsIHJlc3VtZSBib29rbWFyayByZXF1ZXN0IGNhbm5vdCBiZSBwcm9jZXNzZWQgYmVjYXVzZSBib29rbWFyayAnXCIgKyBjb21tYW5kLm5hbWUgKyBcIicgZG9lc24ndCBleGlzdHMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuX2RvUmVzdW1lQm9va21hcmsobmV3IENhbGxDb250ZXh0KHRoaXMsIGJtLmluc3RhbmNlSWQpLCBibSwgY29tbWFuZC5yZWFzb24sIGNvbW1hbmQucmVzdWx0KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuX2RvUmVzdW1lQm9va21hcmsgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIGJvb2ttYXJrLCByZWFzb24sIHJlc3VsdCwgbm9SZW1vdmUpIHtcbiAgICBsZXQgc2NvcGUgPSBjYWxsQ29udGV4dC5zY29wZTtcbiAgICBpZiAoIW5vUmVtb3ZlKSB7XG4gICAgICAgIHRoaXMuX2Jvb2ttYXJrcy5kZWxldGUoYm9va21hcmsubmFtZSk7XG4gICAgfVxuICAgIGxldCBjYiA9IGJvb2ttYXJrLmVuZENhbGxiYWNrO1xuICAgIGlmIChfLmlzU3RyaW5nKGNiKSkge1xuICAgICAgICBjYiA9IHNjb3BlW2Jvb2ttYXJrLmVuZENhbGxiYWNrXTtcbiAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24oY2IpKSB7XG4gICAgICAgICAgICBjYiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNiKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlSdW50aW1lRXJyb3IoXCJCb29rbWFyaydzICdcIiArIGJvb2ttYXJrLm5hbWUgKyBcIicgY2FsbGJhY2sgJ1wiICsgYm9va21hcmsuZW5kQ2FsbGJhY2sgKyBcIicgaXMgbm90IGRlZmluZWQgb24gdGhlIGN1cnJlbnQgc2NvcGUuXCIpO1xuICAgIH1cblxuICAgIGNiLmNhbGwoc2NvcGUsIGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCwgYm9va21hcmspO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5jYW5jZWxFeGVjdXRpb24gPSBmdW5jdGlvbiAoc2NvcGUsIGFjdGl2aXR5SWRzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBhbGxJZHMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaWQgb2YgYWN0aXZpdHlJZHMpIHtcbiAgICAgICAgc2VsZi5fY2FuY2VsU3VidHJlZShzY29wZSwgYWxsSWRzLCBpZCk7XG4gICAgfVxuICAgIGZvciAobGV0IGJtIG9mIHNlbGYuX2Jvb2ttYXJrcy52YWx1ZXMoKSkge1xuICAgICAgICBpZiAoYWxsSWRzLmhhcyhibS5pbnN0YW5jZUlkKSkge1xuICAgICAgICAgICAgc2VsZi5fYm9va21hcmtzLmRlbGV0ZShibS5uYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuX2NhbmNlbFN1YnRyZWUgPSBmdW5jdGlvbiAoc2NvcGUsIGFsbElkcywgYWN0aXZpdHlJZCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBhbGxJZHMuYWRkKGFjdGl2aXR5SWQpO1xuICAgIGxldCBzdGF0ZSA9IHNlbGYuZ2V0RXhlY3V0aW9uU3RhdGUoYWN0aXZpdHlJZCk7XG4gICAgZm9yIChsZXQgaWQgb2Ygc3RhdGUuY2hpbGRJbnN0YW5jZUlkcy52YWx1ZXMoKSkge1xuICAgICAgICBzZWxmLl9jYW5jZWxTdWJ0cmVlKHNjb3BlLCBhbGxJZHMsIGlkKTtcbiAgICB9XG4gICAgc3RhdGUucmVwb3J0U3RhdGUoZW51bXMuQWN0aXZpdHlTdGF0ZXMuY2FuY2VsLCBudWxsLCBzY29wZSk7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmRlbGV0ZVNjb3BlT2ZBY3Rpdml0eSA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgYWN0aXZpdHlJZCkge1xuICAgIHRoaXMuX3Njb3BlVHJlZS5kZWxldGVTY29wZVBhcnQoY2FsbENvbnRleHQuaW5zdGFuY2VJZCwgYWN0aXZpdHlJZCk7XG59O1xuXG4vKiBTRVJJQUxJWkFUSU9OICovXG5cbmZ1bmN0aW9uIG1hcFRvQXJyYXkobWFwKSB7XG4gICAgaWYgKCFtYXApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGFzc2VydChtYXAgaW5zdGFuY2VvZiBNYXApO1xuICAgIGxldCBqc29uID0gW107XG4gICAgZm9yIChsZXQga3ZwIG9mIG1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAganNvbi5wdXNoKGt2cCk7XG4gICAgfVxuICAgIHJldHVybiBqc29uO1xufVxuXG5mdW5jdGlvbiBhcnJheVRvTWFwKGpzb24pIHtcbiAgICBpZiAoIWpzb24pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGFzc2VydChfLmlzQXJyYXkoanNvbikpO1xuICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChsZXQga3ZwIG9mIGpzb24pIHtcbiAgICAgICAgbWFwLnNldChrdnBbMF0sIGt2cFsxXSk7XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuZ2V0U3RhdGVBbmRQcm9tb3Rpb25zID0gZnVuY3Rpb24gKHNlcmlhbGl6ZXIsIGVuYWJsZVByb21vdGlvbnMpIHtcbiAgICBpZiAoc2VyaWFsaXplciAmJiAhXy5pc0Z1bmN0aW9uKHNlcmlhbGl6ZXIudG9KU09OKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ3NlcmlhbGl6ZXInIGlzIG5vdCBhIHNlcmlhbGl6ZXIuXCIpO1xuICAgIH1cblxuICAgIGxldCBhY3Rpdml0eVN0YXRlcyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGxldCBzIG9mIHRoaXMuX2FjdGl2aXR5U3RhdGVzLnZhbHVlcygpKSB7XG4gICAgICAgIGFjdGl2aXR5U3RhdGVzLnNldChzLmluc3RhbmNlSWQsIHMuYXNKU09OKCkpO1xuICAgIH1cblxuICAgIGxldCBzY29wZVN0YXRlQW5kUHJvbW90aW9ucyA9IHRoaXMuX3Njb3BlVHJlZS5nZXRFeGVjdXRpb25TdGF0ZSh0aGlzLCBlbmFibGVQcm9tb3Rpb25zKTtcblxuICAgIGxldCBzZXJpYWxpemVkO1xuICAgIGlmIChzZXJpYWxpemVyKSB7XG4gICAgICAgIHNlcmlhbGl6ZWQgPSBzZXJpYWxpemVyLnRvSlNPTih7XG4gICAgICAgICAgICBhY3Rpdml0eVN0YXRlczogYWN0aXZpdHlTdGF0ZXMsXG4gICAgICAgICAgICBib29rbWFya3M6IHRoaXMuX2Jvb2ttYXJrcyxcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZVN0YXRlQW5kUHJvbW90aW9ucy5zdGF0ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNlcmlhbGl6ZWQgPSB7XG4gICAgICAgICAgICBhY3Rpdml0eVN0YXRlczogbWFwVG9BcnJheShhY3Rpdml0eVN0YXRlcyksXG4gICAgICAgICAgICBib29rbWFya3M6IG1hcFRvQXJyYXkodGhpcy5fYm9va21hcmtzKSxcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZVN0YXRlQW5kUHJvbW90aW9ucy5zdGF0ZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXRlOiBzZXJpYWxpemVkLFxuICAgICAgICBwcm9tb3RlZFByb3BlcnRpZXM6IHNjb3BlU3RhdGVBbmRQcm9tb3Rpb25zLnByb21vdGVkUHJvcGVydGllc1xuICAgIH07XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLnNldFN0YXRlID0gZnVuY3Rpb24gKHNlcmlhbGl6ZXIsIGpzb24pIHtcbiAgICBpZiAoc2VyaWFsaXplciAmJiAhXy5pc0Z1bmN0aW9uKHNlcmlhbGl6ZXIuZnJvbUpTT04pKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnc2VyaWFsaXplcicgaXMgbm90IGEgc2VyaWFsaXplci5cIik7XG4gICAgfVxuICAgIGlmICghXy5pc09iamVjdChqc29uKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ2pzb24nIGlzIG5vdCBhbiBvYmplY3QuXCIpO1xuICAgIH1cblxuICAgIGlmIChzZXJpYWxpemVyKSB7XG4gICAgICAgIGpzb24gPSBzZXJpYWxpemVyLmZyb21KU09OKGpzb24pO1xuICAgICAgICBpZiAoIShqc29uLmFjdGl2aXR5U3RhdGVzIGluc3RhbmNlb2YgTWFwKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFjdGl2aXR5U3RhdGVzIHByb3BlcnR5IHZhbHVlIG9mIGFyZ3VtZW50ICdqc29uJyBpcyBub3QgYW4gTWFwIGluc3RhbmNlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShqc29uLmJvb2ttYXJrcyBpbnN0YW5jZW9mIE1hcCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJCb29rbWFya3MgcHJvcGVydHkgdmFsdWUgb2YgYXJndW1lbnQgJ2pzb24nIGlzIG5vdCBhbiBNYXAgaW5zdGFuY2UuXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoIWpzb24uYWN0aXZpdHlTdGF0ZXMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBY3Rpdml0eVN0YXRlcyBwcm9wZXJ0eSB2YWx1ZSBvZiBhcmd1bWVudCAnanNvbicgaXMgbm90IGFuIG9iamVjdC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFqc29uLmJvb2ttYXJrcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkJvb2ttYXJrcyBwcm9wZXJ0eSB2YWx1ZSBvZiBhcmd1bWVudCAnanNvbicgaXMgbm90IGFuIG9iamVjdC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBqc29uID0ge1xuICAgICAgICAgICAgYWN0aXZpdHlTdGF0ZXM6IGFycmF5VG9NYXAoanNvbi5hY3Rpdml0eVN0YXRlcyksXG4gICAgICAgICAgICBib29rbWFya3M6IGFycmF5VG9NYXAoanNvbi5ib29rbWFya3MpLFxuICAgICAgICAgICAgc2NvcGU6IGpzb24uc2NvcGVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBzIG9mIHRoaXMuX2FjdGl2aXR5U3RhdGVzLnZhbHVlcygpKSB7XG4gICAgICAgIGxldCBzdG9yZWQgPSBqc29uLmFjdGl2aXR5U3RhdGVzLmdldChzLmluc3RhbmNlSWQpO1xuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChzdG9yZWQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBY3Rpdml0eSdzIG9mICdcIiArIHMuaW5zdGFuY2VJZCArIFwiJyBzdGF0ZSBub3QgZm91bmQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHMuZnJvbUpTT04oc3RvcmVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9ib29rbWFya3MgPSBqc29uLmJvb2ttYXJrcztcbiAgICB0aGlzLl9zY29wZVRyZWUuc2V0U3RhdGUoanNvbi5zY29wZSk7XG59O1xuLyogU0VSSUFMSVpBVElPTiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dDsiXX0=
