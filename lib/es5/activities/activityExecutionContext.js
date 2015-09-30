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
ActivityExecutionContext.prototype.emitWorkflowEvent = function(args) {
  this.emit(enums.events.workflowEvent, args);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUVBLEFBQUksRUFBQSxDQUFBLHNCQUFxQixFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsMEJBQXlCLENBQUMsQ0FBQztBQUNoRSxBQUFJLEVBQUEsQ0FBQSxtQkFBa0IsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLHVCQUFzQixDQUFDLENBQUM7QUFDMUQsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxrQkFBaUIsQ0FBQyxDQUFDO0FBQ3hDLEFBQUksRUFBQSxDQUFBLElBQUcsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO0FBQzFCLEFBQUksRUFBQSxDQUFBLFlBQVcsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLFFBQU8sQ0FBQyxhQUFhLENBQUM7QUFDakQsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxTQUFRLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxhQUFZLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxjQUFhLENBQUMsQ0FBQztBQUNoQyxBQUFJLEVBQUEsQ0FBQSxXQUFVLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxlQUFjLENBQUMsQ0FBQztBQUMxQyxBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxlQUFjLENBQUMsQ0FBQztBQUNyQyxB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Yi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubGV0IEFjdGl2aXR5RXhlY3V0aW9uU3RhdGUgPSByZXF1aXJlKFwiLi9hY3Rpdml0eUV4ZWN1dGlvblN0YXRlXCIpO1xubGV0IFJlc3VtZUJvb2ttYXJrUXVldWUgPSByZXF1aXJlKFwiLi9yZXN1bWVCb29rbWFya1F1ZXVlXCIpO1xubGV0IGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcbmxldCBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcbmxldCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5sZXQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgZ3VpZHMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2d1aWRzXCIpO1xubGV0IFNjb3BlVHJlZSA9IHJlcXVpcmUoXCIuL3Njb3BlVHJlZVwiKTtcbmxldCBpcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vaXNcIik7XG5sZXQgQ2FsbENvbnRleHQgPSByZXF1aXJlKFwiLi9jYWxsQ29udGV4dFwiKTtcbmxldCBhc3NlcnQgPSByZXF1aXJlKFwiYmV0dGVyLWFzc2VydFwiKTtcbmxldCBCbHVlYmlyZCA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcblxuZnVuY3Rpb24gQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0KGVuZ2luZSkge1xuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5fYWN0aXZpdHlTdGF0ZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fYm9va21hcmtzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2FjdGl2aXR5SWRzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3Jlc3VtZUJNUXVldWUgPSBuZXcgUmVzdW1lQm9va21hcmtRdWV1ZSgpO1xuICAgIHRoaXMuX3Jvb3RBY3Rpdml0eSA9IG51bGw7XG4gICAgdGhpcy5fa25vd25BY3Rpdml0aWVzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX25leHRBY3Rpdml0eUlkID0gMDtcbiAgICB0aGlzLl9zY29wZVRyZWUgPSB0aGlzLl9jcmVhdGVTY29wZVRyZWUoKTtcbiAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTsgLy8gQ291bGQgYmUgbnVsbCBpbiBzcGVjaWFsIGNhc2VzLCBzZWUgd29ya2Zsb3dSZWdpc3RyeS5qc1xufVxuXG51dGlsLmluaGVyaXRzKEFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dCwgRXZlbnRFbWl0dGVyKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoXG4gICAgQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZSxcbiAgICB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2NvcGVUcmVlLmN1cnJlbnRTY29wZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaGFzU2NvcGU6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhdGhpcy5fc2NvcGVUcmVlLmlzT25Jbml0aWFsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByb290QWN0aXZpdHk6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9yb290QWN0aXZpdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4pO1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmdldEluc3RhbmNlSWQgPSBmdW5jdGlvbiAoYWN0aXZpdHksIHRyeUl0KSB7XG4gICAgbGV0IGlkID0gdGhpcy5fYWN0aXZpdHlJZHMuZ2V0KGFjdGl2aXR5KTtcbiAgICBpZiAoXy5pc1VuZGVmaW5lZChpZCkgJiYgIXRyeUl0KSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlTdGF0ZUV4Y2VwdGlvbkVycm9yKGBBY3Rpdml0eSAke2FjdGl2aXR5fSBpcyBub3QgcGFydCBvZiB0aGUgY29udGV4dC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5zZXRJbnN0YW5jZUlkID0gZnVuY3Rpb24gKGFjdGl2aXR5LCBpZCkge1xuICAgIHJldHVybiB0aGlzLl9hY3Rpdml0eUlkcy5zZXQoYWN0aXZpdHksIGlkKTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuX2NyZWF0ZVNjb3BlVHJlZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBTY29wZVRyZWUoXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJlc3VsdENvbGxlY3RlZDogZnVuY3Rpb24gKGNvbnRleHQsIHJlYXNvbiwgcmVzdWx0LCBib29rbWFya05hbWUpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmFjdGl2aXR5LnJlc3VsdENvbGxlY3RlZC5jYWxsKGNvbnRleHQuc2NvcGUsIGNvbnRleHQsIHJlYXNvbiwgcmVzdWx0LCBib29rbWFya05hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLl9nZXRLbm93bkFjdGl2aXR5KGlkKTtcbiAgICAgICAgfSk7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAocm9vdEFjdGl2aXR5KSB7XG4gICAgaWYgKHRoaXMuX3Jvb3RBY3Rpdml0eSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb250ZXh0IGlzIGFscmVhZHkgaW5pdGlhbGl6ZWQuXCIpO1xuICAgIH1cbiAgICBpZiAoIWlzLmFjdGl2aXR5KHJvb3RBY3Rpdml0eSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFyZ3VtZW50ICdyb290QWN0aXZpdHknIHZhbHVlIGlzIG5vdCBhbiBhY3Rpdml0eS5cIik7XG4gICAgfVxuXG4gICAgdGhpcy5fcm9vdEFjdGl2aXR5ID0gcm9vdEFjdGl2aXR5O1xuICAgIHRoaXMuX2luaXRpYWxpemUobnVsbCwgcm9vdEFjdGl2aXR5LCB7IGluc3RhbmNlSWQ6IDAgfSk7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmFwcGVuZFRvQ29udGV4dCA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgdGhpcy5fY2hlY2tJbml0KCk7XG5cbiAgICBsZXQgY3Vyck1heCA9IHRoaXMuX25leHRBY3Rpdml0eUlkO1xuICAgIGxldCBjID0geyBpbnN0YW5jZUlkOiBjdXJyTWF4IH07XG5cbiAgICBpZiAoXy5pc0FycmF5KGFyZ3MpKSB7XG4gICAgICAgIGxldCBzdGF0ZSA9IHRoaXMuZ2V0RXhlY3V0aW9uU3RhdGUodGhpcy5fcm9vdEFjdGl2aXR5KTtcbiAgICAgICAgZm9yIChsZXQgYXJnIG9mIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChpcy5hY3Rpdml0eShhcmcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdGlhbGl6ZSh0aGlzLl9yb290QWN0aXZpdHksIGFyZywgYyk7XG4gICAgICAgICAgICAgICAgc3RhdGUuY2hpbGRJbnN0YW5jZUlkcy5hZGQodGhpcy5nZXRJbnN0YW5jZUlkKGFyZykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ2FyZ3MnIHZhbHVlIGlzIG5vdCBhbiBhcnJheS5cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZnJvbUlkOiBjdXJyTWF4LFxuICAgICAgICB0b0lkOiB0aGlzLl9uZXh0QWN0aXZpdHlJZFxuICAgIH07XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLnJlbW92ZUZyb21Db250ZXh0ID0gZnVuY3Rpb24gKHJlbW92ZVRva2VuKSB7XG4gICAgdGhpcy5fY2hlY2tJbml0KCk7XG5cbiAgICBpZiAocmVtb3ZlVG9rZW4gJiYgIV8uaXNVbmRlZmluZWQocmVtb3ZlVG9rZW4uZnJvbUlkKSAmJiAhXy5pc1VuZGVmaW5lZChyZW1vdmVUb2tlbi50b0lkKSkge1xuICAgICAgICBsZXQgc3RhdGUgPSB0aGlzLmdldEV4ZWN1dGlvblN0YXRlKHRoaXMuX3Jvb3RBY3Rpdml0eSk7XG5cbiAgICAgICAgZm9yIChsZXQgaWQgPSByZW1vdmVUb2tlbi5mcm9tSWQ7IGlkIDw9IHJlbW92ZVRva2VuLnRvSWQ7IGlkKyspIHtcbiAgICAgICAgICAgIGxldCBzaWQgPSBpZC50b1N0cmluZygpO1xuICAgICAgICAgICAgdGhpcy5fa25vd25BY3Rpdml0aWVzLmRlbGV0ZShzaWQpO1xuICAgICAgICAgICAgdGhpcy5fYWN0aXZpdHlTdGF0ZXMuZGVsZXRlKHNpZCk7XG4gICAgICAgICAgICBzdGF0ZS5jaGlsZEluc3RhbmNlSWRzLmRlbGV0ZShzaWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ3JlbW92ZVRva2VuJyB2YWx1ZSBpcyBub3QgYSB2YWxpZCByZW1vdmUgdG9rZW4gb2JqZWN0LlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLl9uZXh0QWN0aXZpdHlJZCA9IHJlbW92ZVRva2VuLmZyb21JZDtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuX2NoZWNrSW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX3Jvb3RBY3Rpdml0eSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb250ZXh0IGlzIG5vdCBpbml0aWFsaXplZC5cIik7XG4gICAgfVxufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5faW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChwYXJlbnQsIGFjdGl2aXR5LCBpZENvdW50ZXIpIHtcbiAgICBsZXQgYWN0aXZpdHlJZCA9IHRoaXMuZ2V0SW5zdGFuY2VJZChhY3Rpdml0eSwgdHJ1ZSk7XG4gICAgbGV0IG5leHRJZCA9IChpZENvdW50ZXIuaW5zdGFuY2VJZCsrKS50b1N0cmluZygpO1xuICAgIGlmICghYWN0aXZpdHlJZCkge1xuICAgICAgICBhY3Rpdml0eUlkID0gbmV4dElkO1xuICAgICAgICB0aGlzLnNldEluc3RhbmNlSWQoYWN0aXZpdHksIGFjdGl2aXR5SWQpO1xuICAgIH1cbiAgICBlbHNlIGlmIChhY3Rpdml0eUlkICE9PSBuZXh0SWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWN0aXZpdHkgXCIgKyBhY3Rpdml0eSArIFwiIGhhcyBiZWVuIGFzc2lnbmVkIHRvIGFuIG90aGVyIGNvbnRleHQgaW4gYSBkaWZmZXJlbnQgdHJlZSB3aGljaCBpcyBub3QgYWxsb3dlZC5cIik7XG4gICAgfVxuXG4gICAgdGhpcy5fbmV4dEFjdGl2aXR5SWQgPSBpZENvdW50ZXIuaW5zdGFuY2VJZDtcbiAgICBsZXQgc3RhdGUgPSB0aGlzLmdldEV4ZWN1dGlvblN0YXRlKGFjdGl2aXR5SWQpO1xuICAgIHN0YXRlLnBhcmVudEluc3RhbmNlSWQgPSBwYXJlbnQgPyB0aGlzLmdldEluc3RhbmNlSWQocGFyZW50KSA6IG51bGw7XG4gICAgdGhpcy5fa25vd25BY3Rpdml0aWVzLnNldChhY3Rpdml0eUlkLCBhY3Rpdml0eSk7XG5cbiAgICBmb3IgKGxldCBjaGlsZCBvZiBhY3Rpdml0eS5pbW1lZGlhdGVDaGlsZHJlbih0aGlzKSkge1xuICAgICAgICB0aGlzLl9pbml0aWFsaXplKGFjdGl2aXR5LCBjaGlsZCwgaWRDb3VudGVyKTtcbiAgICAgICAgc3RhdGUuY2hpbGRJbnN0YW5jZUlkcy5hZGQodGhpcy5nZXRJbnN0YW5jZUlkKGNoaWxkKSk7XG4gICAgfVxufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5nZXRFeGVjdXRpb25TdGF0ZSA9IGZ1bmN0aW9uIChpZE9yQWN0aXZpdHkpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgaWQ7XG4gICAgaWYgKF8uaXNTdHJpbmcoaWRPckFjdGl2aXR5KSkge1xuICAgICAgICBpZCA9IGlkT3JBY3Rpdml0eTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXMuYWN0aXZpdHkoaWRPckFjdGl2aXR5KSkge1xuICAgICAgICBpZCA9IHNlbGYuZ2V0SW5zdGFuY2VJZChpZE9yQWN0aXZpdHkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBnZXQgc3RhdGUgb2YgXCIgKyBpZE9yQWN0aXZpdHkpO1xuICAgIH1cbiAgICBsZXQgc3RhdGUgPSBzZWxmLl9hY3Rpdml0eVN0YXRlcy5nZXQoaWQpO1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKHN0YXRlKSkge1xuICAgICAgICBzdGF0ZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvblN0YXRlKGlkKTtcbiAgICAgICAgc3RhdGUub24oXG4gICAgICAgICAgICBlbnVtcy5BY3Rpdml0eVN0YXRlcy5ydW4sXG4gICAgICAgICAgICBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdChlbnVtcy5BY3Rpdml0eVN0YXRlcy5ydW4sIGFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHN0YXRlLm9uKFxuICAgICAgICAgICAgZW51bXMuQWN0aXZpdHlTdGF0ZXMuZW5kLFxuICAgICAgICAgICAgZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXQoZW51bXMuQWN0aXZpdHlTdGF0ZXMuZW5kLCBhcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBzZWxmLl9hY3Rpdml0eVN0YXRlcy5zZXQoaWQsIHN0YXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5fZ2V0S25vd25BY3Rpdml0eSA9IGZ1bmN0aW9uIChhY3Rpdml0eUlkKSB7XG4gICAgbGV0IGFjdGl2aXR5ID0gdGhpcy5fa25vd25BY3Rpdml0aWVzLmdldChhY3Rpdml0eUlkKTtcbiAgICBpZiAoIWFjdGl2aXR5KSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlSdW50aW1lRXJyb3IoXCJBY3Rpdml0eSBieSBpZCAnXCIgKyBhY3Rpdml0eUlkICsgXCInIG5vdCBmb3VuZC5cIik7XG4gICAgfVxuICAgIHJldHVybiBhY3Rpdml0eTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuY3JlYXRlQm9va21hcmsgPSBmdW5jdGlvbiAoYWN0aXZpdHlJZCwgbmFtZSwgZW5kQ2FsbGJhY2spIHtcbiAgICB0aGlzLnJlZ2lzdGVyQm9va21hcmsoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBpbnN0YW5jZUlkOiBhY3Rpdml0eUlkLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgICAgICAgIGVuZENhbGxiYWNrOiBlbmRDYWxsYmFja1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gbmFtZTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUucmVnaXN0ZXJCb29rbWFyayA9IGZ1bmN0aW9uIChib29rbWFyaykge1xuICAgIGxldCBibSA9IHRoaXMuX2Jvb2ttYXJrcy5nZXQoYm9va21hcmsubmFtZSk7XG4gICAgaWYgKGJtKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlSdW50aW1lRXJyb3IoXCJCb29rbWFyayAnXCIgKyBib29rbWFyay5uYW1lICsgXCInIGFscmVhZHkgZXhpc3RzLlwiKTtcbiAgICB9XG4gICAgdGhpcy5fYm9va21hcmtzLnNldChib29rbWFyay5uYW1lLCBib29rbWFyayk7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmlzQm9va21hcmtFeGlzdHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9ib29rbWFya3MuaGFzKG5hbWUpO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5nZXRCb29rbWFya1RpbWVzdGFtcCA9IGZ1bmN0aW9uIChuYW1lLCB0aHJvd0lmTm90Rm91bmQpIHtcbiAgICBsZXQgYm0gPSB0aGlzLl9ib29rbWFya3MuZ2V0KG5hbWUpO1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKGJtKSAmJiB0aHJvd0lmTm90Rm91bmQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQm9va21hcmsgJ1wiICsgbmFtZSArIFwiJyBub3QgZm91bmQuXCIpO1xuICAgIH1cbiAgICByZXR1cm4gYm0gPyBibS50aW1lc3RhbXAgOiBudWxsO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5kZWxldGVCb29rbWFyayA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhpcy5fYm9va21hcmtzLmRlbGV0ZShuYW1lKTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUubm9vcENhbGxiYWNrcyA9IGZ1bmN0aW9uIChib29rbWFya05hbWVzKSB7XG4gICAgZm9yIChsZXQgbmFtZSBvZiBib29rbWFya05hbWVzKSB7XG4gICAgICAgIGxldCBibSA9IHRoaXMuX2Jvb2ttYXJrcy5nZXQobmFtZSk7XG4gICAgICAgIGlmIChibSkge1xuICAgICAgICAgICAgYm0uZW5kQ2FsbGJhY2sgPSBfLm5vb3A7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLnJlc3VtZUJvb2ttYXJrSW5TY29wZSA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgbmFtZSwgcmVhc29uLCByZXN1bHQpIHtcbiAgICBsZXQgYm0gPSB0aGlzLl9ib29rbWFya3MuZ2V0KG5hbWUpO1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKGJtKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCb29rbWFyayAnXCIgKyBuYW1lICsgXCInIGRvZXNuJ3QgZXhpc3RzLiBDYW5ub3QgY29udGludWUgd2l0aCByZWFzb246IFwiICsgcmVhc29uICsgXCIuXCIpO1xuICAgIH1cbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBCbHVlYmlyZChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJtID0gc2VsZi5fYm9va21hcmtzLmdldChuYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoYm0pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYm0gaXMgc3RpbGwgZXhpc3RzLlxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9kb1Jlc3VtZUJvb2ttYXJrKGNhbGxDb250ZXh0LCBibSwgcmVhc29uLCByZXN1bHQsIHJlYXNvbiA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5yZXN1bWVCb29rbWFya0ludGVybmFsID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBuYW1lLCByZWFzb24sIHJlc3VsdCkge1xuICAgIGxldCBibSA9IHRoaXMuX2Jvb2ttYXJrcy5nZXQobmFtZSk7XG4gICAgdGhpcy5fcmVzdW1lQk1RdWV1ZS5lbnF1ZXVlKG5hbWUsIHJlYXNvbiwgcmVzdWx0KTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUucmVzdW1lQm9va21hcmtFeHRlcm5hbCA9IGZ1bmN0aW9uIChuYW1lLCByZWFzb24sIHJlc3VsdCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBsZXQgYm0gPSBzZWxmLl9ib29rbWFya3MuZ2V0KG5hbWUpO1xuICAgIGlmICghYm0pIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Cb29rbWFya05vdEZvdW5kRXJyb3IoXCJJbnRlcm5hbCByZXN1bWUgYm9va21hcmsgcmVxdWVzdCBjYW5ub3QgYmUgcHJvY2Vzc2VkIGJlY2F1c2UgYm9va21hcmsgJ1wiICsgbmFtZSArIFwiJyBkb2Vzbid0IGV4aXN0cy5cIik7XG4gICAgfVxuICAgIHNlbGYuX2RvUmVzdW1lQm9va21hcmsobmV3IENhbGxDb250ZXh0KHRoaXMsIGJtLmluc3RhbmNlSWQpLCBibSwgcmVhc29uLCByZXN1bHQpO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5wcm9jZXNzUmVzdW1lQm9va21hcmtRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IGNvbW1hbmQgPSBzZWxmLl9yZXN1bWVCTVF1ZXVlLmRlcXVldWUoKTtcbiAgICBpZiAoY29tbWFuZCkge1xuICAgICAgICBsZXQgYm0gPSBzZWxmLl9ib29rbWFya3MuZ2V0KGNvbW1hbmQubmFtZSk7XG4gICAgICAgIGlmICghYm0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuQm9va21hcmtOb3RGb3VuZEVycm9yKFwiSW50ZXJuYWwgcmVzdW1lIGJvb2ttYXJrIHJlcXVlc3QgY2Fubm90IGJlIHByb2Nlc3NlZCBiZWNhdXNlIGJvb2ttYXJrICdcIiArIGNvbW1hbmQubmFtZSArIFwiJyBkb2Vzbid0IGV4aXN0cy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5fZG9SZXN1bWVCb29rbWFyayhuZXcgQ2FsbENvbnRleHQodGhpcywgYm0uaW5zdGFuY2VJZCksIGJtLCBjb21tYW5kLnJlYXNvbiwgY29tbWFuZC5yZXN1bHQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5fZG9SZXN1bWVCb29rbWFyayA9IGZ1bmN0aW9uIChjYWxsQ29udGV4dCwgYm9va21hcmssIHJlYXNvbiwgcmVzdWx0LCBub1JlbW92ZSkge1xuICAgIGxldCBzY29wZSA9IGNhbGxDb250ZXh0LnNjb3BlO1xuICAgIGlmICghbm9SZW1vdmUpIHtcbiAgICAgICAgdGhpcy5fYm9va21hcmtzLmRlbGV0ZShib29rbWFyay5uYW1lKTtcbiAgICB9XG4gICAgbGV0IGNiID0gYm9va21hcmsuZW5kQ2FsbGJhY2s7XG4gICAgaWYgKF8uaXNTdHJpbmcoY2IpKSB7XG4gICAgICAgIGNiID0gc2NvcGVbYm9va21hcmsuZW5kQ2FsbGJhY2tdO1xuICAgICAgICBpZiAoIV8uaXNGdW5jdGlvbihjYikpIHtcbiAgICAgICAgICAgIGNiID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICghY2IpIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVJ1bnRpbWVFcnJvcihcIkJvb2ttYXJrJ3MgJ1wiICsgYm9va21hcmsubmFtZSArIFwiJyBjYWxsYmFjayAnXCIgKyBib29rbWFyay5lbmRDYWxsYmFjayArIFwiJyBpcyBub3QgZGVmaW5lZCBvbiB0aGUgY3VycmVudCBzY29wZS5cIik7XG4gICAgfVxuXG4gICAgY2IuY2FsbChzY29wZSwgY2FsbENvbnRleHQsIHJlYXNvbiwgcmVzdWx0LCBib29rbWFyayk7XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLmNhbmNlbEV4ZWN1dGlvbiA9IGZ1bmN0aW9uIChzY29wZSwgYWN0aXZpdHlJZHMpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IGFsbElkcyA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBpZCBvZiBhY3Rpdml0eUlkcykge1xuICAgICAgICBzZWxmLl9jYW5jZWxTdWJ0cmVlKHNjb3BlLCBhbGxJZHMsIGlkKTtcbiAgICB9XG4gICAgZm9yIChsZXQgYm0gb2Ygc2VsZi5fYm9va21hcmtzLnZhbHVlcygpKSB7XG4gICAgICAgIGlmIChhbGxJZHMuaGFzKGJtLmluc3RhbmNlSWQpKSB7XG4gICAgICAgICAgICBzZWxmLl9ib29rbWFya3MuZGVsZXRlKGJtLm5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuQWN0aXZpdHlFeGVjdXRpb25Db250ZXh0LnByb3RvdHlwZS5fY2FuY2VsU3VidHJlZSA9IGZ1bmN0aW9uIChzY29wZSwgYWxsSWRzLCBhY3Rpdml0eUlkKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGFsbElkcy5hZGQoYWN0aXZpdHlJZCk7XG4gICAgbGV0IHN0YXRlID0gc2VsZi5nZXRFeGVjdXRpb25TdGF0ZShhY3Rpdml0eUlkKTtcbiAgICBmb3IgKGxldCBpZCBvZiBzdGF0ZS5jaGlsZEluc3RhbmNlSWRzLnZhbHVlcygpKSB7XG4gICAgICAgIHNlbGYuX2NhbmNlbFN1YnRyZWUoc2NvcGUsIGFsbElkcywgaWQpO1xuICAgIH1cbiAgICBzdGF0ZS5yZXBvcnRTdGF0ZShlbnVtcy5BY3Rpdml0eVN0YXRlcy5jYW5jZWwsIG51bGwsIHNjb3BlKTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuZGVsZXRlU2NvcGVPZkFjdGl2aXR5ID0gZnVuY3Rpb24gKGNhbGxDb250ZXh0LCBhY3Rpdml0eUlkKSB7XG4gICAgdGhpcy5fc2NvcGVUcmVlLmRlbGV0ZVNjb3BlUGFydChjYWxsQ29udGV4dC5pbnN0YW5jZUlkLCBhY3Rpdml0eUlkKTtcbn07XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuZW1pdFdvcmtmbG93RXZlbnQgPSBmdW5jdGlvbiAoYXJncykge1xuICAgIHRoaXMuZW1pdChlbnVtcy5ldmVudHMud29ya2Zsb3dFdmVudCwgYXJncyk7XG59O1xuXG4vKiBTRVJJQUxJWkFUSU9OICovXG5cbmZ1bmN0aW9uIG1hcFRvQXJyYXkobWFwKSB7XG4gICAgaWYgKCFtYXApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGFzc2VydChtYXAgaW5zdGFuY2VvZiBNYXApO1xuICAgIGxldCBqc29uID0gW107XG4gICAgZm9yIChsZXQga3ZwIG9mIG1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAganNvbi5wdXNoKGt2cCk7XG4gICAgfVxuICAgIHJldHVybiBqc29uO1xufVxuXG5mdW5jdGlvbiBhcnJheVRvTWFwKGpzb24pIHtcbiAgICBpZiAoIWpzb24pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGFzc2VydChfLmlzQXJyYXkoanNvbikpO1xuICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChsZXQga3ZwIG9mIGpzb24pIHtcbiAgICAgICAgbWFwLnNldChrdnBbMF0sIGt2cFsxXSk7XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5cbkFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dC5wcm90b3R5cGUuZ2V0U3RhdGVBbmRQcm9tb3Rpb25zID0gZnVuY3Rpb24gKHNlcmlhbGl6ZXIsIGVuYWJsZVByb21vdGlvbnMpIHtcbiAgICBpZiAoc2VyaWFsaXplciAmJiAhXy5pc0Z1bmN0aW9uKHNlcmlhbGl6ZXIudG9KU09OKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ3NlcmlhbGl6ZXInIGlzIG5vdCBhIHNlcmlhbGl6ZXIuXCIpO1xuICAgIH1cblxuICAgIGxldCBhY3Rpdml0eVN0YXRlcyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGxldCBzIG9mIHRoaXMuX2FjdGl2aXR5U3RhdGVzLnZhbHVlcygpKSB7XG4gICAgICAgIGFjdGl2aXR5U3RhdGVzLnNldChzLmluc3RhbmNlSWQsIHMuYXNKU09OKCkpO1xuICAgIH1cblxuICAgIGxldCBzY29wZVN0YXRlQW5kUHJvbW90aW9ucyA9IHRoaXMuX3Njb3BlVHJlZS5nZXRFeGVjdXRpb25TdGF0ZSh0aGlzLCBlbmFibGVQcm9tb3Rpb25zKTtcblxuICAgIGxldCBzZXJpYWxpemVkO1xuICAgIGlmIChzZXJpYWxpemVyKSB7XG4gICAgICAgIHNlcmlhbGl6ZWQgPSBzZXJpYWxpemVyLnRvSlNPTih7XG4gICAgICAgICAgICBhY3Rpdml0eVN0YXRlczogYWN0aXZpdHlTdGF0ZXMsXG4gICAgICAgICAgICBib29rbWFya3M6IHRoaXMuX2Jvb2ttYXJrcyxcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZVN0YXRlQW5kUHJvbW90aW9ucy5zdGF0ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNlcmlhbGl6ZWQgPSB7XG4gICAgICAgICAgICBhY3Rpdml0eVN0YXRlczogbWFwVG9BcnJheShhY3Rpdml0eVN0YXRlcyksXG4gICAgICAgICAgICBib29rbWFya3M6IG1hcFRvQXJyYXkodGhpcy5fYm9va21hcmtzKSxcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZVN0YXRlQW5kUHJvbW90aW9ucy5zdGF0ZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXRlOiBzZXJpYWxpemVkLFxuICAgICAgICBwcm9tb3RlZFByb3BlcnRpZXM6IHNjb3BlU3RhdGVBbmRQcm9tb3Rpb25zLnByb21vdGVkUHJvcGVydGllc1xuICAgIH07XG59O1xuXG5BY3Rpdml0eUV4ZWN1dGlvbkNvbnRleHQucHJvdG90eXBlLnNldFN0YXRlID0gZnVuY3Rpb24gKHNlcmlhbGl6ZXIsIGpzb24pIHtcbiAgICBpZiAoc2VyaWFsaXplciAmJiAhXy5pc0Z1bmN0aW9uKHNlcmlhbGl6ZXIuZnJvbUpTT04pKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnc2VyaWFsaXplcicgaXMgbm90IGEgc2VyaWFsaXplci5cIik7XG4gICAgfVxuICAgIGlmICghXy5pc09iamVjdChqc29uKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ2pzb24nIGlzIG5vdCBhbiBvYmplY3QuXCIpO1xuICAgIH1cblxuICAgIGlmIChzZXJpYWxpemVyKSB7XG4gICAgICAgIGpzb24gPSBzZXJpYWxpemVyLmZyb21KU09OKGpzb24pO1xuICAgICAgICBpZiAoIShqc29uLmFjdGl2aXR5U3RhdGVzIGluc3RhbmNlb2YgTWFwKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFjdGl2aXR5U3RhdGVzIHByb3BlcnR5IHZhbHVlIG9mIGFyZ3VtZW50ICdqc29uJyBpcyBub3QgYW4gTWFwIGluc3RhbmNlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShqc29uLmJvb2ttYXJrcyBpbnN0YW5jZW9mIE1hcCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJCb29rbWFya3MgcHJvcGVydHkgdmFsdWUgb2YgYXJndW1lbnQgJ2pzb24nIGlzIG5vdCBhbiBNYXAgaW5zdGFuY2UuXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoIWpzb24uYWN0aXZpdHlTdGF0ZXMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBY3Rpdml0eVN0YXRlcyBwcm9wZXJ0eSB2YWx1ZSBvZiBhcmd1bWVudCAnanNvbicgaXMgbm90IGFuIG9iamVjdC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFqc29uLmJvb2ttYXJrcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkJvb2ttYXJrcyBwcm9wZXJ0eSB2YWx1ZSBvZiBhcmd1bWVudCAnanNvbicgaXMgbm90IGFuIG9iamVjdC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBqc29uID0ge1xuICAgICAgICAgICAgYWN0aXZpdHlTdGF0ZXM6IGFycmF5VG9NYXAoanNvbi5hY3Rpdml0eVN0YXRlcyksXG4gICAgICAgICAgICBib29rbWFya3M6IGFycmF5VG9NYXAoanNvbi5ib29rbWFya3MpLFxuICAgICAgICAgICAgc2NvcGU6IGpzb24uc2NvcGVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBzIG9mIHRoaXMuX2FjdGl2aXR5U3RhdGVzLnZhbHVlcygpKSB7XG4gICAgICAgIGxldCBzdG9yZWQgPSBqc29uLmFjdGl2aXR5U3RhdGVzLmdldChzLmluc3RhbmNlSWQpO1xuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChzdG9yZWQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBY3Rpdml0eSdzIG9mICdcIiArIHMuaW5zdGFuY2VJZCArIFwiJyBzdGF0ZSBub3QgZm91bmQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHMuZnJvbUpTT04oc3RvcmVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9ib29rbWFya3MgPSBqc29uLmJvb2ttYXJrcztcbiAgICB0aGlzLl9zY29wZVRyZWUuc2V0U3RhdGUoanNvbi5zY29wZSk7XG59O1xuLyogU0VSSUFMSVpBVElPTiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2aXR5RXhlY3V0aW9uQ29udGV4dDsiXX0=
