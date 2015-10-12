"use strict";
var Workflow = require("../activities/workflow");
var ActivityExecutionEngine = require("../activities/activityExecutionEngine");
var BeginMethod = require("../activities/beginMethod");
var EndMethod = require("../activities/endMethod");
var errors = require("../common/errors");
var enums = require("../common/enums");
var specStrings = require("../common/specStrings");
var _ = require("lodash");
var constants = require("../common/constants");
var Bluebird = require("bluebird");
var is = require("../common/is");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var debug = require("debug")("wf4node:WorkflowInstance");
function WorkflowInstance(host) {
  EventEmitter.call(this);
  this._host = host;
  this.id = null;
  this._engine = null;
  this._createdOn = null;
  this._beginMethodWithCreateInstCallback = null;
  this._endMethodCallback = null;
  this._idleInstanceIdPathCallback = null;
  this._activeDelays = [];
  this._workflowVersion = null;
}
util.inherits(WorkflowInstance, EventEmitter);
Object.defineProperties(WorkflowInstance.prototype, {
  execState: {get: function() {
      return this._engine ? this._engine.execState : null;
    }},
  workflowName: {get: function() {
      return this._engine ? this._engine.rootActivity.name.trim() : null;
    }},
  workflowVersion: {get: function() {
      return this._workflowVersion;
    }},
  createdOn: {get: function() {
      return this._createdOn;
    }},
  updatedOn: {get: function() {
      return this._engine ? this._engine.updatedOn : null;
    }},
  activeDelays: {get: function() {
      return this._activeDelays;
    }},
  persistence: {get: function() {
      return this._host._persistence;
    }}
});
WorkflowInstance.prototype.create = async($traceurRuntime.initGeneratorFunction(function $__9(workflow, workflowVersion, methodName, args, lockInfo) {
  var self,
      createMethodReached,
      instanceIdPath,
      createEndMethodReached,
      result,
      endInstanceIdPath,
      idleMethods,
      $__10,
      $__11,
      $__12,
      $__13,
      $__14,
      $__15,
      $__16,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          self.setWorkflow(workflow, workflowVersion);
          self._resetCallbacksAndState();
          createMethodReached = false;
          instanceIdPath = null;
          self._beginMethodWithCreateInstCallback = function(mn, ip) {
            if (mn === methodName) {
              createMethodReached = true;
              instanceIdPath = ip;
            }
          };
          self._createdOn = new Date();
          $ctx.state = 61;
          break;
        case 61:
          $ctx.pushTry(47, 48);
          $ctx.state = 50;
          break;
        case 50:
          $__10 = self._engine;
          $__11 = $__10.isIdle;
          $__12 = self._engine;
          $__13 = $__12.invoke;
          $__14 = $__13.call($__12);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__14;
        case 2:
          $__15 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__16 = $__11.call($__10, $__15);
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__16) ? 43 : 44;
          break;
        case 43:
          $ctx.state = (createMethodReached) ? 35 : 41;
          break;
        case 35:
          self._resetCallbacksAndState();
          $ctx.state = 36;
          break;
        case 36:
          $ctx.state = (instanceIdPath) ? 13 : 12;
          break;
        case 13:
          if (_.isUndefined(self.id = self._host._instanceIdParser.parse(instanceIdPath, args))) {
            throw new errors.WorkflowError("Cannot parse BeginMethod's instanceIdPath '" + instanceIdPath + "' on arguments of method '" + methodName + "'.");
          }
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = 10;
          return (self._enterLockForCreatedInstance(lockInfo));
        case 10:
          $ctx.maybeThrow();
          $ctx.state = 12;
          break;
        case 12:
          createEndMethodReached = false;
          endInstanceIdPath = null;
          self._endMethodCallback = function(mn, ip, r) {
            if (mn === methodName) {
              createEndMethodReached = true;
              endInstanceIdPath = ip;
              result = r;
            }
          };
          idleMethods = [];
          self._idleInstanceIdPathCallback = function(mn, ip) {
            idleMethods.push({
              methodName: mn,
              instanceIdPath: ip
            });
          };
          $ctx.state = 38;
          break;
        case 38:
          $ctx.state = 17;
          return (self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.activityStates.complete, args));
        case 17:
          $ctx.maybeThrow();
          $ctx.state = 19;
          break;
        case 19:
          $ctx.state = (createEndMethodReached) ? 29 : 30;
          break;
        case 29:
          $ctx.state = (_.isUndefined(self.id)) ? 28 : 23;
          break;
        case 28:
          $ctx.state = (endInstanceIdPath) ? 24 : 26;
          break;
        case 24:
          if (_.isUndefined(self.id = self._host._instanceIdParser.parse(endInstanceIdPath, result))) {
            throw new errors.WorkflowError("Cannot parse EndMethods's instanceIdPath '" + instanceIdPath + "' on arguments of method '" + methodName + "'.");
          }
          $ctx.state = 25;
          break;
        case 25:
          $ctx.state = 21;
          return self._enterLockForCreatedInstance(lockInfo);
        case 21:
          $ctx.maybeThrow();
          $ctx.state = 23;
          break;
        case 26:
          throw new errors.WorkflowError("BeginMethod or EndMethod of method '" + methodName + "' doesn't specify an instanceIdPath property value.");
          $ctx.state = 23;
          break;
        case 30:
          throw new errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method '" + methodName + "'.");
          $ctx.state = 23;
          break;
        case 23:
          if (self.execState === enums.activityStates.idle) {
            if (idleMethods.length === 0) {
              throw new errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for.");
            }
          } else {
            if (idleMethods.length !== 0) {
              throw new errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for.");
            }
          }
          $ctx.state = 40;
          break;
        case 40:
          $ctx.returnValue = result;
          $ctx.state = 48;
          $ctx.finallyFallThrough = -2;
          break;
        case 41:
          throw new errors.WorkflowError("Workflow has gone to idle without reaching an instance creator BeginMethod activity of method '" + methodName + "'.");
          $ctx.state = 34;
          break;
        case 44:
          throw new errors.WorkflowError("Workflow has been completed without reaching an instance creator BeginMethod activity.");
          $ctx.state = 34;
          break;
        case 34:
          $ctx.popTry();
          $ctx.state = 48;
          $ctx.finallyFallThrough = -2;
          break;
        case 47:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 53;
          break;
        case 53:
          debug("Create error: %s", e.stack);
          if (e instanceof errors.TimeoutError) {
            throw new errors.MethodIsNotAccessibleError("Cannot create instanceof workflow '" + self.workflowName + "', because '" + methodName + "' is locked.");
          }
          if (e instanceof errors.BookmarkNotFoundError) {
            throw new errors.MethodIsNotAccessibleError("Cannot create instanceof workflow '" + self.workflowName + "', because bookmark of '" + methodName + "' doesn't exist.");
          }
          throw e;
          $ctx.state = 48;
          $ctx.finallyFallThrough = -2;
          break;
        case 48:
          $ctx.popTry();
          $ctx.state = 59;
          break;
        case 59:
          self._resetCallbacks();
          $ctx.state = 57;
          break;
        case 57:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__9, this);
}));
WorkflowInstance.prototype._enterLockForCreatedInstance = async($traceurRuntime.initGeneratorFunction(function $__17(lockInfo) {
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (lockInfo) ? 1 : -2;
          break;
        case 1:
          $ctx.state = 2;
          return this._host._enterLockForCreatedInstance(this, lockInfo);
        case 2:
          $ctx.maybeThrow();
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__17, this);
}));
WorkflowInstance.prototype.setWorkflow = function(workflow, workflowVersion, instanceId) {
  var self = this;
  if (!(workflow instanceof Workflow)) {
    throw new TypeError("Workflow argument expected.");
  }
  if (!(_.isString(workflowVersion)) || !workflowVersion) {
    throw new TypeError("Workflow version expected.");
  }
  this._workflowVersion = workflowVersion;
  this._engine = new ActivityExecutionEngine(workflow, this);
  this._engine.on(enums.events.workflowEvent, function(args) {
    var arr = _.toArray(args);
    arr.splice(0, 0, self.instanceId);
    self.emit(enums.events.workflowEvent, args);
  });
  this._addMyTrackers();
  if (!_.isUndefined(instanceId)) {
    this.id = instanceId;
  }
  this._copyParsFromHost();
};
WorkflowInstance.prototype.callMethod = async($traceurRuntime.initGeneratorFunction(function $__18(methodName, args) {
  var self,
      endMethodReached,
      result,
      idleMethods,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          self._resetCallbacksAndState();
          endMethodReached = false;
          result = null;
          self._endMethodCallback = function(mn, ip, r) {
            if (mn === methodName) {
              endMethodReached = true;
              result = r;
            }
          };
          idleMethods = [];
          self._idleInstanceIdPathCallback = function(mn, ip) {
            idleMethods.push({
              methodName: mn,
              instanceIdPath: ip
            });
          };
          $ctx.state = 23;
          break;
        case 23:
          $ctx.pushTry(9, 10);
          $ctx.state = 12;
          break;
        case 12:
          $ctx.state = 2;
          return self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.activityStates.complete, args);
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          if (!endMethodReached) {
            throw new errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method name '" + methodName + "'.");
          }
          if (self.execState === enums.activityStates.idle) {
            if (idleMethods.length === 0) {
              throw new errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for.");
            }
          } else {
            if (idleMethods.length !== 0) {
              throw new errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for.");
            }
          }
          $ctx.state = 8;
          break;
        case 8:
          $ctx.returnValue = result;
          $ctx.state = 10;
          $ctx.finallyFallThrough = -2;
          break;
        case 6:
          $ctx.popTry();
          $ctx.state = 10;
          $ctx.finallyFallThrough = -2;
          break;
        case 9:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 15;
          break;
        case 15:
          debug("Call method error: %s", e.stack);
          if (e instanceof errors.BookmarkNotFoundError) {
            throw new errors.MethodIsNotAccessibleError("Cannot call method '" + methodName + "' of workflow '" + self.workflowName + "', because its bookmark doesn't exist.");
          }
          throw e;
          $ctx.state = 10;
          $ctx.finallyFallThrough = -2;
          break;
        case 10:
          $ctx.popTry();
          $ctx.state = 21;
          break;
        case 21:
          self._resetCallbacks();
          $ctx.state = 19;
          break;
        case 19:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__18, this);
}));
WorkflowInstance.prototype._copyParsFromHost = function() {
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (this._host._trackers)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var t = $__3.value;
      {
        this._engine.addTracker(t);
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
WorkflowInstance.prototype._addMyTrackers = function() {
  this._addBeginMethodWithCreateInstHelperTracker();
  this._addEndMethodHelperTracker();
  this._addIdleInstanceIdPathTracker();
};
WorkflowInstance.prototype._resetCallbacks = function() {
  this._beginMethodWithCreateInstCallback = null;
  this._endMethodCallback = null;
  this._idleInstanceIdPathCallback = null;
};
WorkflowInstance.prototype._resetCallbacksAndState = function() {
  this._resetCallbacks();
  this._activeDelays = [];
};
WorkflowInstance.prototype._addBeginMethodWithCreateInstHelperTracker = function() {
  var self = this;
  var tracker = {
    activityStateFilter: function(args) {
      return self._beginMethodWithCreateInstCallback && args.scope.$activity instanceof BeginMethod && args.scope.canCreateInstance && _.isString(args.scope.methodName) && (!args.scope.instanceIdPath || _.isString(args.scope.instanceIdPath)) && args.reason === enums.activityStates.idle;
    },
    activityStateChanged: function(args) {
      var methodName = args.scope.methodName.trim();
      var instanceIdPath = args.scope.instanceIdPath ? args.scope.instanceIdPath.trim() : null;
      self._beginMethodWithCreateInstCallback(methodName, instanceIdPath);
    }
  };
  self._engine.addTracker(tracker);
};
WorkflowInstance.prototype._addEndMethodHelperTracker = function() {
  var self = this;
  var tracker = {
    activityStateFilter: function(args) {
      return self._endMethodCallback && args.scope.$activity instanceof EndMethod && _.isString(args.scope.methodName) && (!args.scope.instanceIdPath || _.isString(args.scope.instanceIdPath)) && args.reason === enums.activityStates.complete;
    },
    activityStateChanged: function(args) {
      var methodName = args.scope.methodName.trim();
      var instanceIdPath = args.scope.instanceIdPath ? args.scope.instanceIdPath.trim() : null;
      self._endMethodCallback(methodName, instanceIdPath, args.result);
    }
  };
  self._engine.addTracker(tracker);
};
WorkflowInstance.prototype._addIdleInstanceIdPathTracker = function() {
  var self = this;
  var tracker = {
    activityStateFilter: function(args) {
      return self._idleInstanceIdPathCallback && args.scope.$activity instanceof BeginMethod && _.isString(args.scope.methodName) && _.isString(args.scope.instanceIdPath) && args.reason === enums.activityStates.idle;
    },
    activityStateChanged: function(args) {
      var methodName = args.scope.methodName.trim();
      var instanceIdPath = args.scope.instanceIdPath.trim();
      self._idleInstanceIdPathCallback(methodName, instanceIdPath);
      if (specStrings.hosting.isDelayToMethodName(methodName)) {
        self._activeDelays.push({
          methodName: methodName,
          delayTo: args.scope.delayTo
        });
      }
    }
  };
  self._engine.addTracker(tracker);
};
WorkflowInstance.prototype.getStateToPersist = function() {
  var sp = this._engine.getStateAndPromotions(this._host.options.serializer, this._host.options.enablePromotions);
  return {
    instanceId: this.id,
    createdOn: this.createdOn,
    workflowName: this.workflowName,
    workflowVersion: this.workflowVersion,
    updatedOn: this._engine.updatedOn,
    state: sp.state,
    promotedProperties: sp.promotedProperties,
    activeDelays: this._activeDelays
  };
};
WorkflowInstance.prototype.restoreState = function(json) {
  if (!_.isObject(json)) {
    throw new TypeError("Argument 'json' is not an object.");
  }
  if (json.instanceId !== this.id) {
    throw new Error("State instanceId property value of '" + json.instanceId + "' is different than the current instance id '" + this.id + "'.");
  }
  if (json.workflowName !== this.workflowName) {
    throw new Error("State workflowName property value of '" + json.workflowName + "' is different than the current Workflow name '" + this.workflowName + "'.");
  }
  if (json.workflowVersion !== this.workflowVersion) {
    throw new Error("State workflowVersion property value of '" + json.workflowVersion + "' is different than the current Workflow version '" + this.workflowVersion + "'.");
  }
  if (!_.isDate(json.createdOn)) {
    throw new Error("State createdOn property value of '" + json.createdOn + "' is not a Date.");
  }
  this._createdOn = json.createdOn;
  this._engine.setState(this._host.options.serializer, json.state);
};
WorkflowInstance.prototype.addTracker = function(tracker) {
  this._engine.addTracker(tracker);
};
module.exports = WorkflowInstance;

//# sourceMappingURL=workflowInstance.js.map
