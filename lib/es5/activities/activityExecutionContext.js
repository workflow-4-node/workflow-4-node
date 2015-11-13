"use strict";
var ActivityExecutionState = require("./activityExecutionState");
var ResumeBookmarkQueue = require("./resumeBookmarkQueue");
var enums = require("../common/enums");
var errors = require("../common/errors");
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");
var constants = require("../common/constants");
var ScopeTree = require("./scopeTree");
var is = require("../common/is");
var CallContext = require("./callContext");
var assert = require("better-assert");
var Bluebird = require("bluebird");
var converters = require("../common/converters");
function ActivityExecutionContext(engine) {
  EventEmitter.call(this);
  this._activityStates = new Map();
  this._bookmarks = new Map();
  this._resumeBMQueue = new ResumeBookmarkQueue();
  this.rootActivity = null;
  this._knownActivities = new Map();
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
    }}
});
ActivityExecutionContext.prototype._createScopeTree = function() {
  var self = this;
  return new ScopeTree({resultCollected: function(context, reason, result, bookmarkName) {
      context.activity.resultCollected.call(context.scope, context, reason, result, bookmarkName);
    }}, function(id) {
    return self._getKnownActivity(id);
  });
};
ActivityExecutionContext.prototype.initialize = function(rootActivity) {
  if (this.rootActivity) {
    throw new Error("Context is already initialized.");
  }
  if (!is.activity(rootActivity)) {
    throw new TypeError("Argument 'rootActivity' value is not an activity.");
  }
  this.rootActivity = rootActivity;
  this._initialize(null, rootActivity, {instanceId: 0});
};
ActivityExecutionContext.prototype._checkInit = function() {
  if (!this.rootActivity) {
    throw new Error("Context is not initialized.");
  }
};
ActivityExecutionContext.prototype._initialize = function(parent, activity, idCounter) {
  var activityId = activity._instanceId;
  var nextId = (idCounter.instanceId++).toString();
  if (!activityId) {
    activityId = nextId;
    activity.instanceId = activityId;
  } else if (activityId !== nextId) {
    throw new errors.ActivityRuntimeError("Activity " + activity + " has been assigned to an other position.");
  }
  var state = this.getExecutionState(activityId);
  state.parentInstanceId = parent ? parent.instanceId : null;
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
        state.childInstanceIds.add(child.instanceId);
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
    id = idOrActivity.instanceId;
  } else {
    throw new TypeError("Cannot get state of " + idOrActivity);
  }
  var state = self._activityStates.get(id);
  if (_.isUndefined(state)) {
    state = new ActivityExecutionState(id);
    state.on(enums.activityStates.run, function(args) {
      self.emit(enums.activityStates.run, args);
    });
    state.on(enums.activityStates.end, function(args) {
      self.emit(enums.activityStates.end, args);
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
          self._doResumeBookmark(callContext, bm, reason, result, reason === enums.activityStates.idle);
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
  state.reportState(enums.activityStates.cancel, null, scope);
};
ActivityExecutionContext.prototype.deleteScopeOfActivity = function(callContext, activityId) {
  this._scopeTree.deleteScopePart(callContext.instanceId, activityId);
};
ActivityExecutionContext.prototype.emitWorkflowEvent = function(args) {
  this.emit(enums.events.workflowEvent, args);
};
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
  var scopeStateAndPromotions = this._scopeTree.getExecutionState(this, enablePromotions, serializer);
  var serialized;
  if (serializer) {
    serialized = serializer.toJSON({
      activityStates: activityStates,
      bookmarks: this._bookmarks,
      scope: scopeStateAndPromotions.state
    });
  } else {
    serialized = {
      activityStates: converters.mapToArray(activityStates),
      bookmarks: converters.mapToArray(this._bookmarks),
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
      throw new TypeError("activityStates property value of argument 'json' is not an Map instance.");
    }
    if (!(json.bookmarks instanceof Map)) {
      throw new TypeError("Bookmarks property value of argument 'json' is not an Map instance.");
    }
  } else {
    if (!json.activityStates) {
      throw new TypeError("activityStates property value of argument 'json' is not an object.");
    }
    if (!json.bookmarks) {
      throw new TypeError("Bookmarks property value of argument 'json' is not an object.");
    }
    json = {
      activityStates: converters.arrayToMap(json.activityStates),
      bookmarks: converters.arrayToMap(json.bookmarks),
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
  this._scopeTree.setState(json.scope, serializer);
};
module.exports = ActivityExecutionContext;

//# sourceMappingURL=activityExecutionContext.js.map
