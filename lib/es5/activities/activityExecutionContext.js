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
function ActivityExecutionContext() {
  EventEmitter.call(this);
  this._activityStates = new Map();
  this._bookmarks = new Map();
  this._activityIds = new Map();
  this._resumeBMQueue = new ResumeBookmarkQueue();
  this._rootActivity = null;
  this._knownActivities = new Map();
  this._nextActivityId = 0;
  this._scopeTree = this._createScopeTree();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUVBLEFBQUksRUFBQSxDQUFBLHNCQUFxQixFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsMEJBQXlCLENBQUMsQ0FBQztBQUNoRSxBQUFJLEVBQUEsQ0FBQSxtQkFBa0IsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLHVCQUFzQixDQUFDLENBQUM7QUFDMUQsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxrQkFBaUIsQ0FBQyxDQUFDO0FBQ3hDLEFBQUksRUFBQSxDQUFBLElBQUcsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO0FBQzFCLEFBQUksRUFBQSxDQUFBLFlBQVcsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLFFBQU8sQ0FBQyxhQUFhLENBQUM7QUFDakQsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxTQUFRLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxhQUFZLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxjQUFhLENBQUMsQ0FBQztBQUNoQyxBQUFJLEVBQUEsQ0FBQSxXQUFVLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxlQUFjLENBQUMsQ0FBQztBQUMxQyxBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxlQUFjLENBQUMsQ0FBQztBQUNyQyxB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b0IsS0FBRyxDQUFHO1FBK2ExQixFQUFBO0FBQW9DO0FBQ3pDLEFBQUksVUFBQSxDQUFBLE1BQUssRUFBSSxDQUFBLElBQUcsZUFBZSxJQUFJLEFBQUMsQ0FBQyxDQUFBLFdBQVcsQ0FBQyxDQUFDO0FBQ2xELFdBQUksQ0FBQSxZQUFZLEFBQUMsQ0FBQyxNQUFLLENBQUMsQ0FBRztBQUN2QixjQUFNLElBQUksTUFBSSxBQUFDLENBQUMsaUJBQWdCLEVBQUksQ0FBQSxDQUFBLFdBQVcsQ0FBQSxDQUFJLHFCQUFtQixDQUFDLENBQUM7UUFDNUU7QUFBQSxBQUNBLFFBQUEsU0FBUyxBQUFDLENBQUMsTUFBSyxDQUFDLENBQUM7TUFDdEI7SUFsYkk7QUFBQSxFQUZBLENBQUUsWUFBMEI7QUFDMUIsU0FBb0IsS0FBRyxDQUFDO0FBQ3hCLGNBQW9DLENBQUM7RUFDdkMsQ0FBRSxPQUFRO0FBQ1IsTUFBSTtBQUNGLFNBQUksS0FBaUIsR0FBSyxDQUFBLFdBQXVCLEdBQUssS0FBRyxDQUFHO0FBQzFELGtCQUF3QixBQUFDLEVBQUMsQ0FBQztNQUM3QjtBQUFBLElBQ0YsQ0FBRSxPQUFRO0FBQ1IsY0FBd0I7QUFDdEIsa0JBQXdCO01BQzFCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxBQXlhSixLQUFHLFdBQVcsRUFBSSxDQUFBLElBQUcsVUFBVSxDQUFDO0FBQ2hDLEtBQUcsV0FBVyxTQUFTLEFBQUMsQ0FBQyxJQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFHRCxLQUFLLFFBQVEsRUFBSSx5QkFBdUIsQ0FBQztBQUFBIiwiZmlsZSI6ImFjdGl2aXRpZXMvYWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubGV0IEFjdGl2aXR5RXhlY3V0aW9uU3RhdGUgPSByZXF1aXJlKFwiLi9hY3Rpdml0eUV4ZWN1dGlvblN0YXRlXCIpO1xubGV0IFJlc3VtZUJvb2ttYXJrUXVldWUgPSByZXF1aXJlKFwiLi9yZXN1bWVCb29rbWFya1F1ZXVlXCIpO1xubGV0IGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcbmxldCBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcbmxldCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5sZXQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgZ3VpZHMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2d1aWRzXCIpO1xubGV0IFNjb3BlVHJlZSA9IHJlcXVpcmUoXCIuL3Njb3BlVHJlZVwiKTtcbmxldCBpcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vaXNcIik7XG5sZXQgQ2FsbENvbnRleHQgPSByZXF1aXJlKFwiLi9jYWxsQ29udGV4dFwiKTtcbmxldCBhc3NlcnQgPSByZXF1aXJlKFwiYmV0dGVyLWFzc2VydFwiKTtcbmxldCBCbHVlYmlyZCA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcblxuZnVuY3Rpb24gQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0KCkge1xuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5fYWN0aXZpdHlTdGF0ZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fYm9va21hcmtzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2FjdGl2aXR5SWRzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3Jlc3VtZUJNUXVldWUgPSBuZXcgUmVzdW1lQm9va21hcmtRdWV1ZSgpO1xuICAgIHRoaXMuX3Jvb3RBY3Rpdml0eSA9IG51bGw7XG4gICAgdGhpcy5fa25vd25BY3Rpdml0aWVzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX25leHRBY3Rpdml0eUlkID0gMDtcbiAgICB0aGlzLl9zY29wZVRyZWUgPSB0aGlzLl9jcmVhdGVTY29wZVRyZWUoKTtcbn1cblxudXRpbC5pbmhlcml0cyhBY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQsIEV2ZW50RW1pdHRlcik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFxuICAgIEFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUsXG4gICAge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Njb3BlVHJlZS5jdXJyZW50U2NvcGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGhhc1Njb3BlOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIXRoaXMuX3Njb3BlVHJlZS5pc09uSW5pdGlhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcm9vdEFjdGl2aXR5OiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcm9vdEFjdGl2aXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuKTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5nZXRJbnN0YW5jZUlkID0gZnVuY3Rpb24oYWN0aXZpdHksIHRyeUl0KSB7XG4gICAgbGV0IGlkID0gdGhpcy5fYWN0aXZpdHlJZHMuZ2V0KGFjdGl2aXR5KTtcbiAgICBpZiAoXy5pc1VuZGVmaW5lZChpZCkgJiYgIXRyeUl0KSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKGBBY3Rpdml0eSAke2FjdGl2aXR5fSBpcyBub3QgcGFydCBvZiB0aGUgY29udGV4dC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5zZXRJbnN0YW5jZUlkID0gZnVuY3Rpb24oYWN0aXZpdHksIGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2aXR5SWRzLnNldChhY3Rpdml0eSwgaWQpO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5fY3JlYXRlU2NvcGVUcmVlID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFNjb3BlVHJlZShcbiAgICAgICAge1xuICAgICAgICAgICAgcmVzdWx0Q29sbGVjdGVkOiBmdW5jdGlvbiAoY29udGV4dCwgcmVhc29uLCByZXN1bHQsIGJvb2ttYXJrTmFtZSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuYWN0aXZpdHkucmVzdWx0Q29sbGVjdGVkLmNhbGwoY29udGV4dC5zY29wZSwgY29udGV4dCwgcmVhc29uLCByZXN1bHQsIGJvb2ttYXJrTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2dldEtub3duQWN0aXZpdHkoaWQpO1xuICAgICAgICB9KTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChyb290QWN0aXZpdHkpIHtcbiAgICBpZiAodGhpcy5fcm9vdEFjdGl2aXR5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbnRleHQgaXMgYWxyZWFkeSBpbml0aWFsaXplZC5cIik7XG4gICAgfVxuICAgIGlmICghaXMuYWN0aXZpdHkocm9vdEFjdGl2aXR5KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ3Jvb3RBY3Rpdml0eScgdmFsdWUgaXMgbm90IGFuIGFjdGl2aXR5LlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yb290QWN0aXZpdHkgPSByb290QWN0aXZpdHk7XG4gICAgdGhpcy5faW5pdGlhbGl6ZShudWxsLCByb290QWN0aXZpdHksIHsgaW5zdGFuY2VJZDogMCB9KTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuYXBwZW5kVG9Db250ZXh0ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICB0aGlzLl9jaGVja0luaXQoKTtcblxuICAgIGxldCBjdXJyTWF4ID0gdGhpcy5fbmV4dEFjdGl2aXR5SWQ7XG4gICAgbGV0IGMgPSB7IGluc3RhbmNlSWQ6IGN1cnJNYXggfTtcblxuICAgIGlmIChfLmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgbGV0IHN0YXRlID0gdGhpcy5nZXRFeGVjdXRpb25TdGF0ZSh0aGlzLl9yb290QWN0aXZpdHkpO1xuICAgICAgICBmb3IgKGxldCBhcmcgb2YgYXJncykge1xuICAgICAgICAgICAgaWYgKGlzLmFjdGl2aXR5KGFyZykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0aWFsaXplKHRoaXMuX3Jvb3RBY3Rpdml0eSwgYXJnLCBjKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5jaGlsZEluc3RhbmNlSWRzLmFkZCh0aGlzLmdldEluc3RhbmNlSWQoYXJnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnYXJncycgdmFsdWUgaXMgbm90IGFuIGFycmF5LlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBmcm9tSWQ6IGN1cnJNYXgsXG4gICAgICAgIHRvSWQ6IHRoaXMuX25leHRBY3Rpdml0eUlkXG4gICAgfTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUucmVtb3ZlRnJvbUNvbnRleHQgPSBmdW5jdGlvbiAocmVtb3ZlVG9rZW4pIHtcbiAgICB0aGlzLl9jaGVja0luaXQoKTtcblxuICAgIGlmIChyZW1vdmVUb2tlbiAmJiAhXy5pc1VuZGVmaW5lZChyZW1vdmVUb2tlbi5mcm9tSWQpICYmICFfLmlzVW5kZWZpbmVkKHJlbW92ZVRva2VuLnRvSWQpKSB7XG4gICAgICAgIGxldCBzdGF0ZSA9IHRoaXMuZ2V0RXhlY3V0aW9uU3RhdGUodGhpcy5fcm9vdEFjdGl2aXR5KTtcblxuICAgICAgICBmb3IgKGxldCBpZCA9IHJlbW92ZVRva2VuLmZyb21JZDsgaWQgPD0gcmVtb3ZlVG9rZW4udG9JZDsgaWQrKykge1xuICAgICAgICAgICAgbGV0IHNpZCA9IGlkLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB0aGlzLl9rbm93bkFjdGl2aXRpZXMuZGVsZXRlKHNpZCk7XG4gICAgICAgICAgICB0aGlzLl9hY3Rpdml0eVN0YXRlcy5kZWxldGUoc2lkKTtcbiAgICAgICAgICAgIHN0YXRlLmNoaWxkSW5zdGFuY2VJZHMuZGVsZXRlKHNpZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAncmVtb3ZlVG9rZW4nIHZhbHVlIGlzIG5vdCBhIHZhbGlkIHJlbW92ZSB0b2tlbiBvYmplY3QuXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX25leHRBY3Rpdml0eUlkID0gcmVtb3ZlVG9rZW4uZnJvbUlkO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5fY2hlY2tJbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fcm9vdEFjdGl2aXR5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbnRleHQgaXMgbm90IGluaXRpYWxpemVkLlwiKTtcbiAgICB9XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLl9pbml0aWFsaXplID0gZnVuY3Rpb24gKHBhcmVudCwgYWN0aXZpdHksIGlkQ291bnRlcikge1xuICAgIGxldCBhY3Rpdml0eUlkID0gdGhpcy5nZXRJbnN0YW5jZUlkKGFjdGl2aXR5LCB0cnVlKTtcbiAgICBsZXQgbmV4dElkID0gKGlkQ291bnRlci5pbnN0YW5jZUlkKyspLnRvU3RyaW5nKCk7XG4gICAgaWYgKCFhY3Rpdml0eUlkKSB7XG4gICAgICAgIGFjdGl2aXR5SWQgPSBuZXh0SWQ7XG4gICAgICAgIHRoaXMuc2V0SW5zdGFuY2VJZChhY3Rpdml0eSwgYWN0aXZpdHlJZCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGFjdGl2aXR5SWQgIT09IG5leHRJZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBY3Rpdml0eSBcIiArIGFjdGl2aXR5ICsgXCIgaGFzIGJlZW4gYXNzaWduZWQgdG8gYW4gb3RoZXIgY29udGV4dCBpbiBhIGRpZmZlcmVudCB0cmVlIHdoaWNoIGlzIG5vdCBhbGxvd2VkLlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLl9uZXh0QWN0aXZpdHlJZCA9IGlkQ291bnRlci5pbnN0YW5jZUlkO1xuICAgIGxldCBzdGF0ZSA9IHRoaXMuZ2V0RXhlY3V0aW9uU3RhdGUoYWN0aXZpdHlJZCk7XG4gICAgc3RhdGUucGFyZW50SW5zdGFuY2VJZCA9IHBhcmVudCA/IHRoaXMuZ2V0SW5zdGFuY2VJZChwYXJlbnQpIDogbnVsbDtcbiAgICB0aGlzLl9rbm93bkFjdGl2aXRpZXMuc2V0KGFjdGl2aXR5SWQsIGFjdGl2aXR5KTtcblxuICAgIGZvciAobGV0IGNoaWxkIG9mIGFjdGl2aXR5LmltbWVkaWF0ZUNoaWxkcmVuKHRoaXMpKSB7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemUoYWN0aXZpdHksIGNoaWxkLCBpZENvdW50ZXIpO1xuICAgICAgICBzdGF0ZS5jaGlsZEluc3RhbmNlSWRzLmFkZCh0aGlzLmdldEluc3RhbmNlSWQoY2hpbGQpKTtcbiAgICB9XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmdldEV4ZWN1dGlvblN0YXRlID0gZnVuY3Rpb24gKGlkT3JBY3Rpdml0eSkge1xuICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgIGxldCBpZDtcbiAgICBpZiAoXy5pc1N0cmluZyhpZE9yQWN0aXZpdHkpKSB7XG4gICAgICAgIGlkID0gaWRPckFjdGl2aXR5O1xuICAgIH1cbiAgICBlbHNlIGlmIChpcy5hY3Rpdml0eShpZE9yQWN0aXZpdHkpKSB7XG4gICAgICAgIGlkID0gc2VsZi5nZXRJbnN0YW5jZUlkKGlkT3JBY3Rpdml0eSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGdldCBzdGF0ZSBvZiBcIiArIGlkT3JBY3Rpdml0eSk7XG4gICAgfVxuICAgIGxldCBzdGF0ZSA9IHNlbGYuX2FjdGl2aXR5U3RhdGVzLmdldChpZCk7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoc3RhdGUpKSB7XG4gICAgICAgIHN0YXRlID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uU3RhdGUoaWQpO1xuICAgICAgICBzdGF0ZS5vbihcbiAgICAgICAgICAgIGVudW1zLkFjdGl2aXR5U3RhdGVzLnJ1bixcbiAgICAgICAgICAgIGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0KGVudW1zLkFjdGl2aXR5U3RhdGVzLnJ1biwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgc3RhdGUub24oXG4gICAgICAgICAgICBlbnVtcy5BY3Rpdml0eVN0YXRlcy5lbmQsXG4gICAgICAgICAgICBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdChlbnVtcy5BY3Rpdml0eVN0YXRlcy5lbmQsIGFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHNlbGYuX2FjdGl2aXR5U3RhdGVzLnNldChpZCwgc3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGU7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLl9nZXRLbm93bkFjdGl2aXR5ID0gZnVuY3Rpb24gKGFjdGl2aXR5SWQpIHtcbiAgICBsZXQgYWN0aXZpdHkgPSB0aGlzLl9rbm93bkFjdGl2aXRpZXMuZ2V0KGFjdGl2aXR5SWQpO1xuICAgIGlmICghYWN0aXZpdHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVJ1bnRpbWVFcnJvcihcIkFjdGl2aXR5IGJ5IGlkICdcIiArIGFjdGl2aXR5SWQgKyBcIicgbm90IGZvdW5kLlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGl2aXR5O1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5jcmVhdGVCb29rbWFyayA9IGZ1bmN0aW9uIChhY3Rpdml0eUlkLCBuYW1lLCBlbmRDYWxsYmFjaykge1xuICAgIHRoaXMucmVnaXN0ZXJCb29rbWFyayhcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGluc3RhbmNlSWQ6IGFjdGl2aXR5SWQsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgZW5kQ2FsbGJhY2s6IGVuZENhbGxiYWNrXG4gICAgICAgIH0pO1xuICAgIHJldHVybiBuYW1lO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5yZWdpc3RlckJvb2ttYXJrID0gZnVuY3Rpb24gKGJvb2ttYXJrKSB7XG4gICAgbGV0IGJtID0gdGhpcy5fYm9va21hcmtzLmdldChib29rbWFyay5uYW1lKTtcbiAgICBpZiAoYm0pIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVJ1bnRpbWVFcnJvcihcIkJvb2ttYXJrICdcIiArIGJvb2ttYXJrLm5hbWUgKyBcIicgYWxyZWFkeSBleGlzdHMuXCIpO1xuICAgIH1cbiAgICB0aGlzLl9ib29rbWFya3Muc2V0KGJvb2ttYXJrLm5hbWUsIGJvb2ttYXJrKTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuaXNCb29rbWFya0V4aXN0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Jvb2ttYXJrcy5oYXMobmFtZSk7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmdldEJvb2ttYXJrVGltZXN0YW1wID0gZnVuY3Rpb24gKG5hbWUsIHRocm93SWZOb3RGb3VuZCkge1xuICAgIGxldCBibSA9IHRoaXMuX2Jvb2ttYXJrcy5nZXQobmFtZSk7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoYm0pICYmIHRocm93SWZOb3RGb3VuZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCb29rbWFyayAnXCIgKyBuYW1lICsgXCInIG5vdCBmb3VuZC5cIik7XG4gICAgfVxuICAgIHJldHVybiBibSA/IGJtLnRpbWVzdGFtcCA6IG51bGw7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmRlbGV0ZUJvb2ttYXJrID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aGlzLl9ib29rbWFya3MuZGVsZXRlKG5hbWUpO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5ub29wQ2FsbGJhY2tzID0gZnVuY3Rpb24gKGJvb2ttYXJrTmFtZXMpIHtcbiAgICBmb3IgKGxldCBuYW1lIG9mIGJvb2ttYXJrTmFtZXMpIHtcbiAgICAgICAgbGV0IGJtID0gdGhpcy5fYm9va21hcmtzLmdldChuYW1lKTtcbiAgICAgICAgaWYgKGJtKSB7XG4gICAgICAgICAgICBibS5lbmRDYWxsYmFjayA9IF8ubm9vcDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUucmVzdW1lQm9va21hcmtJblNjb3BlID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBuYW1lLCByZWFzb24sIHJlc3VsdCkge1xuICAgIGxldCBibSA9IHRoaXMuX2Jvb2ttYXJrcy5nZXQobmFtZSk7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoYm0pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJvb2ttYXJrICdcIiArIG5hbWUgKyBcIicgZG9lc24ndCBleGlzdHMuIENhbm5vdCBjb250aW51ZSB3aXRoIHJlYXNvbjogXCIgKyByZWFzb24gKyBcIi5cIik7XG4gICAgfVxuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IEJsdWViaXJkKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBibSA9IHNlbGYuX2Jvb2ttYXJrcy5nZXQobmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGJtKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGJtIGlzIHN0aWxsIGV4aXN0cy5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZG9SZXN1bWVCb29rbWFyayhjYWxsQ29udGV4dCwgYm0sIHJlYXNvbiwgcmVzdWx0LCByZWFzb24gPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGUpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUucmVzdW1lQm9va21hcmtJbnRlcm5hbCA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgbmFtZSwgcmVhc29uLCByZXN1bHQpIHtcbiAgICBsZXQgYm0gPSB0aGlzLl9ib29rbWFya3MuZ2V0KG5hbWUpO1xuICAgIHRoaXMuX3Jlc3VtZUJNUXVldWUuZW5xdWV1ZShuYW1lLCByZWFzb24sIHJlc3VsdCk7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLnJlc3VtZUJvb2ttYXJrRXh0ZXJuYWwgPSBmdW5jdGlvbiAobmFtZSwgcmVhc29uLCByZXN1bHQpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IGJtID0gc2VsZi5fYm9va21hcmtzLmdldChuYW1lKTtcbiAgICBpZiAoIWJtKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuQm9va21hcmtOb3RGb3VuZEVycm9yKFwiSW50ZXJuYWwgcmVzdW1lIGJvb2ttYXJrIHJlcXVlc3QgY2Fubm90IGJlIHByb2Nlc3NlZCBiZWNhdXNlIGJvb2ttYXJrICdcIiArIG5hbWUgKyBcIicgZG9lc24ndCBleGlzdHMuXCIpO1xuICAgIH1cbiAgICBzZWxmLl9kb1Jlc3VtZUJvb2ttYXJrKG5ldyBDYWxsQ29udGV4dCh0aGlzLCBibS5pbnN0YW5jZUlkKSwgYm0sIHJlYXNvbiwgcmVzdWx0KTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUucHJvY2Vzc1Jlc3VtZUJvb2ttYXJrUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBjb21tYW5kID0gc2VsZi5fcmVzdW1lQk1RdWV1ZS5kZXF1ZXVlKCk7XG4gICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgbGV0IGJtID0gc2VsZi5fYm9va21hcmtzLmdldChjb21tYW5kLm5hbWUpO1xuICAgICAgICBpZiAoIWJtKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkJvb2ttYXJrTm90Rm91bmRFcnJvcihcIkludGVybmFsIHJlc3VtZSBib29rbWFyayByZXF1ZXN0IGNhbm5vdCBiZSBwcm9jZXNzZWQgYmVjYXVzZSBib29rbWFyayAnXCIgKyBjb21tYW5kLm5hbWUgKyBcIicgZG9lc24ndCBleGlzdHMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuX2RvUmVzdW1lQm9va21hcmsobmV3IENhbGxDb250ZXh0KHRoaXMsIGJtLmluc3RhbmNlSWQpLCBibSwgY29tbWFuZC5yZWFzb24sIGNvbW1hbmQucmVzdWx0KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuX2RvUmVzdW1lQm9va21hcmsgPSBmdW5jdGlvbiAoY2FsbENvbnRleHQsIGJvb2ttYXJrLCByZWFzb24sIHJlc3VsdCwgbm9SZW1vdmUpIHtcbiAgICBsZXQgc2NvcGUgPSBjYWxsQ29udGV4dC5zY29wZTtcbiAgICBpZiAoIW5vUmVtb3ZlKSB7XG4gICAgICAgIHRoaXMuX2Jvb2ttYXJrcy5kZWxldGUoYm9va21hcmsubmFtZSk7XG4gICAgfVxuICAgIGxldCBjYiA9IGJvb2ttYXJrLmVuZENhbGxiYWNrO1xuICAgIGlmIChfLmlzU3RyaW5nKGNiKSkge1xuICAgICAgICBjYiA9IHNjb3BlW2Jvb2ttYXJrLmVuZENhbGxiYWNrXTtcbiAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24oY2IpKSB7XG4gICAgICAgICAgICBjYiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNiKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlSdW50aW1lRXJyb3IoXCJCb29rbWFyaydzICdcIiArIGJvb2ttYXJrLm5hbWUgKyBcIicgY2FsbGJhY2sgJ1wiICsgYm9va21hcmsuZW5kQ2FsbGJhY2sgKyBcIicgaXMgbm90IGRlZmluZWQgb24gdGhlIGN1cnJlbnQgc2NvcGUuXCIpO1xuICAgIH1cblxuICAgIGNiLmNhbGwoc2NvcGUsIGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCwgYm9va21hcmspO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5jYW5jZWxFeGVjdXRpb24gPSBmdW5jdGlvbiAoc2NvcGUsIGFjdGl2aXR5SWRzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBhbGxJZHMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaWQgb2YgYWN0aXZpdHlJZHMpIHtcbiAgICAgICAgc2VsZi5fY2FuY2VsU3VidHJlZShzY29wZSwgYWxsSWRzLCBpZCk7XG4gICAgfVxuICAgIGZvciAobGV0IGJtIG9mIHNlbGYuX2Jvb2ttYXJrcy52YWx1ZXMoKSkge1xuICAgICAgICBpZiAoYWxsSWRzLmhhcyhibS5pbnN0YW5jZUlkKSkge1xuICAgICAgICAgICAgc2VsZi5fYm9va21hcmtzLmRlbGV0ZShibS5uYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuX2NhbmNlbFN1YnRyZWUgPSBmdW5jdGlvbiAoc2NvcGUsIGFsbElkcywgYWN0aXZpdHlJZCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBhbGxJZHMuYWRkKGFjdGl2aXR5SWQpO1xuICAgIGxldCBzdGF0ZSA9IHNlbGYuZ2V0RXhlY3V0aW9uU3RhdGUoYWN0aXZpdHlJZCk7XG4gICAgZm9yIChsZXQgaWQgb2Ygc3RhdGUuY2hpbGRJbnN0YW5jZUlkcy52YWx1ZXMoKSkge1xuICAgICAgICBzZWxmLl9jYW5jZWxTdWJ0cmVlKHNjb3BlLCBhbGxJZHMsIGlkKTtcbiAgICB9XG4gICAgc3RhdGUucmVwb3J0U3RhdGUoZW51bXMuQWN0aXZpdHlTdGF0ZXMuY2FuY2VsLCBudWxsLCBzY29wZSk7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmRlbGV0ZVNjb3BlT2ZBY3Rpdml0eSA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgYWN0aXZpdHlJZCkge1xuICAgIHRoaXMuX3Njb3BlVHJlZS5kZWxldGVTY29wZVBhcnQoY2FsbENvbnRleHQuaW5zdGFuY2VJZCwgYWN0aXZpdHlJZCk7XG59O1xuXG4vKiBTRVJJQUxJWkFUSU9OICovXG5cbmZ1bmN0aW9uIG1hcFRvQXJyYXkobWFwKSB7XG4gICAgaWYgKCFtYXApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGFzc2VydChtYXAgaW5zdGFuY2VvZiBNYXApO1xuICAgIGxldCBqc29uID0gW107XG4gICAgZm9yIChsZXQga3ZwIG9mIG1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAganNvbi5wdXNoKGt2cCk7XG4gICAgfVxuICAgIHJldHVybiBqc29uO1xufVxuXG5mdW5jdGlvbiBhcnJheVRvTWFwKGpzb24pIHtcbiAgICBpZiAoIWpzb24pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGFzc2VydChfLmlzQXJyYXkoanNvbikpO1xuICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChsZXQga3ZwIG9mIGpzb24pIHtcbiAgICAgICAgbWFwLnNldChrdnBbMF0sIGt2cFsxXSk7XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuZ2V0U3RhdGVBbmRQcm9tb3Rpb25zID0gZnVuY3Rpb24gKHNlcmlhbGl6ZXIsIGVuYWJsZVByb21vdGlvbnMpIHtcbiAgICBpZiAoc2VyaWFsaXplciAmJiAhXy5pc0Z1bmN0aW9uKHNlcmlhbGl6ZXIudG9KU09OKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ3NlcmlhbGl6ZXInIGlzIG5vdCBhIHNlcmlhbGl6ZXIuXCIpO1xuICAgIH1cblxuICAgIGxldCBhY3Rpdml0eVN0YXRlcyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGxldCBzIG9mIHRoaXMuX2FjdGl2aXR5U3RhdGVzLnZhbHVlcygpKSB7XG4gICAgICAgIGFjdGl2aXR5U3RhdGVzLnNldChzLmluc3RhbmNlSWQsIHMuYXNKU09OKCkpO1xuICAgIH1cblxuICAgIGxldCBzY29wZVN0YXRlQW5kUHJvbW90aW9ucyA9IHRoaXMuX3Njb3BlVHJlZS5nZXRFeGVjdXRpb25TdGF0ZSh0aGlzLCBlbmFibGVQcm9tb3Rpb25zKTtcblxuICAgIGxldCBzZXJpYWxpemVkO1xuICAgIGlmIChzZXJpYWxpemVyKSB7XG4gICAgICAgIHNlcmlhbGl6ZWQgPSBzZXJpYWxpemVyLnRvSlNPTih7XG4gICAgICAgICAgICBhY3Rpdml0eVN0YXRlczogYWN0aXZpdHlTdGF0ZXMsXG4gICAgICAgICAgICBib29rbWFya3M6IHRoaXMuX2Jvb2ttYXJrcyxcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZVN0YXRlQW5kUHJvbW90aW9ucy5zdGF0ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNlcmlhbGl6ZWQgPSB7XG4gICAgICAgICAgICBhY3Rpdml0eVN0YXRlczogbWFwVG9BcnJheShhY3Rpdml0eVN0YXRlcyksXG4gICAgICAgICAgICBib29rbWFya3M6IG1hcFRvQXJyYXkodGhpcy5fYm9va21hcmtzKSxcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZVN0YXRlQW5kUHJvbW90aW9ucy5zdGF0ZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXRlOiBzZXJpYWxpemVkLFxuICAgICAgICBwcm9tb3RlZFByb3BlcnRpZXM6IHNjb3BlU3RhdGVBbmRQcm9tb3Rpb25zLnByb21vdGVkUHJvcGVydGllc1xuICAgIH07XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLnNldFN0YXRlID0gZnVuY3Rpb24gKHNlcmlhbGl6ZXIsIGpzb24pIHtcbiAgICBpZiAoc2VyaWFsaXplciAmJiAhXy5pc0Z1bmN0aW9uKHNlcmlhbGl6ZXIuZnJvbUpTT04pKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnc2VyaWFsaXplcicgaXMgbm90IGEgc2VyaWFsaXplci5cIik7XG4gICAgfVxuICAgIGlmICghXy5pc09iamVjdChqc29uKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ2pzb24nIGlzIG5vdCBhbiBvYmplY3QuXCIpO1xuICAgIH1cblxuICAgIGlmIChzZXJpYWxpemVyKSB7XG4gICAgICAgIGpzb24gPSBzZXJpYWxpemVyLmZyb21KU09OKGpzb24pO1xuICAgICAgICBpZiAoIShqc29uLmFjdGl2aXR5U3RhdGVzIGluc3RhbmNlb2YgTWFwKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFjdGl2aXR5U3RhdGVzIHByb3BlcnR5IHZhbHVlIG9mIGFyZ3VtZW50ICdqc29uJyBpcyBub3QgYW4gTWFwIGluc3RhbmNlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShqc29uLmJvb2ttYXJrcyBpbnN0YW5jZW9mIE1hcCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJCb29rbWFya3MgcHJvcGVydHkgdmFsdWUgb2YgYXJndW1lbnQgJ2pzb24nIGlzIG5vdCBhbiBNYXAgaW5zdGFuY2UuXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoIWpzb24uYWN0aXZpdHlTdGF0ZXMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBY3Rpdml0eVN0YXRlcyBwcm9wZXJ0eSB2YWx1ZSBvZiBhcmd1bWVudCAnanNvbicgaXMgbm90IGFuIG9iamVjdC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFqc29uLmJvb2ttYXJrcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkJvb2ttYXJrcyBwcm9wZXJ0eSB2YWx1ZSBvZiBhcmd1bWVudCAnanNvbicgaXMgbm90IGFuIG9iamVjdC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBqc29uID0ge1xuICAgICAgICAgICAgYWN0aXZpdHlTdGF0ZXM6IGFycmF5VG9NYXAoanNvbi5hY3Rpdml0eVN0YXRlcyksXG4gICAgICAgICAgICBib29rbWFya3M6IGFycmF5VG9NYXAoanNvbi5ib29rbWFya3MpLFxuICAgICAgICAgICAgc2NvcGU6IGpzb24uc2NvcGVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBzIG9mIHRoaXMuX2FjdGl2aXR5U3RhdGVzLnZhbHVlcygpKSB7XG4gICAgICAgIGxldCBzdG9yZWQgPSBqc29uLmFjdGl2aXR5U3RhdGVzLmdldChzLmluc3RhbmNlSWQpO1xuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChzdG9yZWQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBY3Rpdml0eSdzIG9mICdcIiArIHMuaW5zdGFuY2VJZCArIFwiJyBzdGF0ZSBub3QgZm91bmQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHMuZnJvbUpTT04oc3RvcmVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9ib29rbWFya3MgPSBqc29uLmJvb2ttYXJrcztcbiAgICB0aGlzLl9zY29wZVRyZWUuc2V0U3RhdGUoanNvbi5zY29wZSk7XG59O1xuLyogU0VSSUFMSVpBVElPTiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dDsiXX0=
