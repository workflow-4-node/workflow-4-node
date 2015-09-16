"use strict";
var Workflow = require("../activities/workflow");
var ActivityExecutionEngine = require("../activities/activityExecutionEngine");
var BeginMethod = require("../activities/beginMethod");
var EndMethod = require("../activities/endMethod");
var errors = require("../common/errors");
var enums = require("../common/enums");
var specStrings = require("../common/specStrings");
var _ = require("lodash");
var guids = require("../common/guids");
var Bluebird = require("bluebird");
var is = require("../common/is");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;
var util = require("util");
var debug = require("debug")("wf4node:WorkflowInstance");
function WorkflowInstance(host) {
  this._host = host;
  this.id = null;
  this._engine = null;
  this._createdOn = null;
  this._beginMethodWithCreateInstCallback = null;
  this._endMethodCallback = null;
  this._idleInstanceIdPathCallback = null;
  this._activeDelays = [];
}
Object.defineProperties(WorkflowInstance.prototype, {
  execState: {get: function() {
      return this._engine ? this._engine.execState : null;
    }},
  workflowName: {get: function() {
      return this._engine ? this._engine.rootActivity.name.trim() : null;
    }},
  workflowVersion: {get: function() {
      return this._engine ? this._engine.rootActivity.version : null;
    }},
  createdOn: {get: function() {
      return this._createdOn;
    }},
  updatedOn: {get: function() {
      return this._engine ? this._engine.updatedOn : null;
    }},
  activeDelays: {get: function() {
      return this._activeDelays;
    }}
});
WorkflowInstance.prototype.create = async($traceurRuntime.initGeneratorFunction(function $__9(workflow, methodName, args, lockInfo) {
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
          self.setWorkflow(workflow);
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
          return (self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.ActivityStates.complete, args));
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
          if (self.execState === enums.ActivityStates.idle) {
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
WorkflowInstance.prototype.setWorkflow = function(workflow, instanceId) {
  if (!(workflow instanceof Workflow)) {
    throw new TypeError("Workflow argument expected.");
  }
  this._engine = new ActivityExecutionEngine(workflow);
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
          return self._engine.resumeBookmark(specStrings.hosting.createBeginMethodBMName(methodName), enums.ActivityStates.complete, args);
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          if (!endMethodReached) {
            throw new errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method name '" + methodName + "'.");
          }
          if (self.execState === enums.ActivityStates.idle) {
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
      return self._beginMethodWithCreateInstCallback && args.scope.$activity instanceof BeginMethod && args.scope.canCreateInstance && _.isString(args.scope.methodName) && (!args.scope.instanceIdPath || _.isString(args.scope.instanceIdPath)) && args.reason === enums.ActivityStates.idle;
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
      return self._endMethodCallback && args.scope.$activity instanceof EndMethod && _.isString(args.scope.methodName) && (!args.scope.instanceIdPath || _.isString(args.scope.instanceIdPath)) && args.reason === enums.ActivityStates.complete;
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
      return self._idleInstanceIdPathCallback && args.scope.$activity instanceof BeginMethod && _.isString(args.scope.methodName) && _.isString(args.scope.instanceIdPath) && args.reason === enums.ActivityStates.idle;
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
    throw new Error("State workflowName property value of '" + json.workflowVersion + "' is different than the current Workflow version '" + this.workflowVersion + "'.");
  }
  if (!_.isDate(json.createdOn)) {
    throw new Error("State createdOn property value of '" + json.createdOn + "' is not a Date.");
  }
  this._createdOn = json.createdOn;
  this._engine.setState(this._host.options.serializer, json.state);
};
module.exports = WorkflowInstance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvcmtmbG93SW5zdGFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFFQSxBQUFJLEVBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyx3QkFBdUIsQ0FBQyxDQUFDO0FBQ2hELEFBQUksRUFBQSxDQUFBLHVCQUFzQixFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsdUNBQXNDLENBQUMsQ0FBQztBQUM5RSxBQUFJLEVBQUEsQ0FBQSxXQUFVLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQywyQkFBMEIsQ0FBQyxDQUFDO0FBQ3RELEFBQUksRUFBQSxDQUFBLFNBQVEsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLHlCQUF3QixDQUFDLENBQUM7QUFDbEQsQUFBSSxFQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsa0JBQWlCLENBQUMsQ0FBQztBQUN4QyxBQUFJLEVBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxpQkFBZ0IsQ0FBQyxDQUFDO0FBQ3RDLEFBQUksRUFBQSxDQUFBLFdBQVUsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLHVCQUFzQixDQUFDLENBQUM7QUFDbEQsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQztBQUNsQyxBQUFJLEVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxjQUFhLENBQUMsQ0FBQztBQUNoQyxBQUFJLEVBQUEsQ0FBQSxZQUFXLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyx3QkFBdUIsQ0FBQyxDQUFDO0FBQ3BELEFBQUksRUFB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QUFJLENBQUMsQ0FBQSxPQUFPLEFBQUMsQ0FBQyxJQUFHLFVBQVUsQ0FBQyxDQUFHO0FBQzNCLFFBQU0sSUFBSSxNQUFJLEFBQUMsQ0FBQyxxQ0FBb0MsRUFBSSxDQUFBLElBQUcsVUFBVSxDQUFBLENBQUksbUJBQWlCLENBQUMsQ0FBQztFQUNoRztBQUFBLEFBRUEsS0FBRyxXQUFXLEVBQUksQ0FBQSxJQUFHLFVBQVUsQ0FBQztBQUNoQyxLQUFHLFFBQVEsU0FBUyxBQUFDLENBQUMsSUFBRyxNQUFNLFFBQVEsV0FBVyxDQUFHLENBQUEsSUFBRyxNQUFNLENBQUMsQ0FBQztBQUNwRSxDQUFDO0FBRUQsS0FBSyxRQUFRLEVBQUksaUJBQWUsQ0FBQztBQUNqQyIsImZpbGUiOiJob3N0aW5nL3dvcmtmbG93SW5zdGFuY2UuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5sZXQgV29ya2Zsb3cgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy93b3JrZmxvd1wiKTtcbmxldCBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL2FjdGl2aXR5RXhlY3V0aW9uRW5naW5lXCIpO1xubGV0IEJlZ2luTWV0aG9kID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvYmVnaW5NZXRob2RcIik7XG5sZXQgRW5kTWV0aG9kID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvZW5kTWV0aG9kXCIpO1xubGV0IGVycm9ycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZXJyb3JzXCIpO1xubGV0IGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcbmxldCBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgZ3VpZHMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2d1aWRzXCIpO1xubGV0IEJsdWViaXJkID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBhc3luY0hlbHBlcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2FzeW5jSGVscGVyc1wiKTtcbmxldCBhc3luYyA9IGFzeW5jSGVscGVycy5hc3luYztcbmxldCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5sZXQgZGVidWcgPSByZXF1aXJlKFwiZGVidWdcIikoXCJ3ZjRub2RlOldvcmtmbG93SW5zdGFuY2VcIik7XG5cbmZ1bmN0aW9uIFdvcmtmbG93SW5zdGFuY2UoaG9zdCkge1xuICAgIHRoaXMuX2hvc3QgPSBob3N0O1xuICAgIHRoaXMuaWQgPSBudWxsO1xuICAgIHRoaXMuX2VuZ2luZSA9IG51bGw7XG4gICAgdGhpcy5fY3JlYXRlZE9uID0gbnVsbDtcbiAgICB0aGlzLl9iZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0Q2FsbGJhY2sgPSBudWxsO1xuICAgIHRoaXMuX2VuZE1ldGhvZENhbGxiYWNrID0gbnVsbDtcbiAgICB0aGlzLl9pZGxlSW5zdGFuY2VJZFBhdGhDYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5fYWN0aXZlRGVsYXlzID0gW107XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFxuICAgIFdvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLCB7XG4gICAgICAgIGV4ZWNTdGF0ZToge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2VuZ2luZSA/IHRoaXMuX2VuZ2luZS5leGVjU3RhdGUgOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB3b3JrZmxvd05hbWU6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUgPyB0aGlzLl9lbmdpbmUucm9vdEFjdGl2aXR5Lm5hbWUudHJpbSgpIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgd29ya2Zsb3dWZXJzaW9uOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZW5naW5lID8gdGhpcy5fZW5naW5lLnJvb3RBY3Rpdml0eS52ZXJzaW9uIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZE9uOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlZE9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGVkT246IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUgPyB0aGlzLl9lbmdpbmUudXBkYXRlZE9uIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYWN0aXZlRGVsYXlzOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlRGVsYXlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLmNyZWF0ZSA9IGFzeW5jKGZ1bmN0aW9uKiAod29ya2Zsb3csIG1ldGhvZE5hbWUsIGFyZ3MsIGxvY2tJbmZvKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5zZXRXb3JrZmxvdyh3b3JrZmxvdyk7XG4gICAgc2VsZi5fcmVzZXRDYWxsYmFja3NBbmRTdGF0ZSgpO1xuXG4gICAgbGV0IGNyZWF0ZU1ldGhvZFJlYWNoZWQgPSBmYWxzZTtcbiAgICBsZXQgaW5zdGFuY2VJZFBhdGggPSBudWxsO1xuICAgIHNlbGYuX2JlZ2luTWV0aG9kV2l0aENyZWF0ZUluc3RDYWxsYmFjayA9IGZ1bmN0aW9uIChtbiwgaXApIHtcbiAgICAgICAgaWYgKG1uID09PSBtZXRob2ROYW1lKSB7XG4gICAgICAgICAgICBjcmVhdGVNZXRob2RSZWFjaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoID0gaXA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgc2VsZi5fY3JlYXRlZE9uID0gbmV3IERhdGUoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGlmIChzZWxmLl9lbmdpbmUuaXNJZGxlKHlpZWxkIHNlbGYuX2VuZ2luZS5pbnZva2UoKSkpIHtcbiAgICAgICAgICAgIGlmIChjcmVhdGVNZXRob2RSZWFjaGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fcmVzZXRDYWxsYmFja3NBbmRTdGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlSWRQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHNlbGYuaWQgPSBzZWxmLl9ob3N0Ll9pbnN0YW5jZUlkUGFyc2VyLnBhcnNlKGluc3RhbmNlSWRQYXRoLCBhcmdzKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkNhbm5vdCBwYXJzZSBCZWdpbk1ldGhvZCdzIGluc3RhbmNlSWRQYXRoICdcIiArIGluc3RhbmNlSWRQYXRoICsgXCInIG9uIGFyZ3VtZW50cyBvZiBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgeWllbGQgKHNlbGYuX2VudGVyTG9ja0ZvckNyZWF0ZWRJbnN0YW5jZShsb2NrSW5mbykpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjcmVhdGVFbmRNZXRob2RSZWFjaGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBsZXQgZW5kSW5zdGFuY2VJZFBhdGggPSBudWxsO1xuICAgICAgICAgICAgICAgIHNlbGYuX2VuZE1ldGhvZENhbGxiYWNrID1cbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG1uLCBpcCwgcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1uID09PSBtZXRob2ROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRW5kTWV0aG9kUmVhY2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kSW5zdGFuY2VJZFBhdGggPSBpcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgbGV0IGlkbGVNZXRob2RzID0gW107XG4gICAgICAgICAgICAgICAgc2VsZi5faWRsZUluc3RhbmNlSWRQYXRoQ2FsbGJhY2sgPVxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAobW4sIGlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZGxlTWV0aG9kcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogbW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBpcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgeWllbGQgKHNlbGYuX2VuZ2luZS5yZXN1bWVCb29rbWFyayhzcGVjU3RyaW5ncy5ob3N0aW5nLmNyZWF0ZUJlZ2luTWV0aG9kQk1OYW1lKG1ldGhvZE5hbWUpLCBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSwgYXJncykpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNyZWF0ZUVuZE1ldGhvZFJlYWNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoc2VsZi5pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmRJbnN0YW5jZUlkUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHNlbGYuaWQgPSBzZWxmLl9ob3N0Ll9pbnN0YW5jZUlkUGFyc2VyLnBhcnNlKGVuZEluc3RhbmNlSWRQYXRoLCByZXN1bHQpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJDYW5ub3QgcGFyc2UgRW5kTWV0aG9kcydzIGluc3RhbmNlSWRQYXRoICdcIiArIGluc3RhbmNlSWRQYXRoICsgXCInIG9uIGFyZ3VtZW50cyBvZiBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX2VudGVyTG9ja0ZvckNyZWF0ZWRJbnN0YW5jZShsb2NrSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJCZWdpbk1ldGhvZCBvciBFbmRNZXRob2Qgb2YgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicgZG9lc24ndCBzcGVjaWZ5IGFuIGluc3RhbmNlSWRQYXRoIHByb3BlcnR5IHZhbHVlLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGJlZW4gY29tcGxldGVkIG9yIGdvbmUgdG8gaWRsZSB3aXRob3V0IHJlYWNoaW5nIGFuIEVuZE1ldGhvZCBhY3Rpdml0eSBvZiBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZGxlTWV0aG9kcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBnb25lIHRvIGlkbGUsIGJ1dCB0aGVyZSBpcyBubyBhY3RpdmUgQmVnaW5NZXRob2QgYWN0aXZpdGllcyB0byB3YWl0IGZvci5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZGxlTWV0aG9kcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBjb21wbGV0ZWQsIGJ1dCB0aGVyZSBpcyBhY3RpdmUgQmVnaW5NZXRob2QgYWN0aXZpdGllcyB0byB3YWl0IGZvci5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGdvbmUgdG8gaWRsZSB3aXRob3V0IHJlYWNoaW5nIGFuIGluc3RhbmNlIGNyZWF0b3IgQmVnaW5NZXRob2QgYWN0aXZpdHkgb2YgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGJlZW4gY29tcGxldGVkIHdpdGhvdXQgcmVhY2hpbmcgYW4gaW5zdGFuY2UgY3JlYXRvciBCZWdpbk1ldGhvZCBhY3Rpdml0eS5cIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVidWcoXCJDcmVhdGUgZXJyb3I6ICVzXCIsIGUuc3RhY2spO1xuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5UaW1lb3V0RXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IoXCJDYW5ub3QgY3JlYXRlIGluc3RhbmNlb2Ygd29ya2Zsb3cgJ1wiICsgc2VsZi53b3JrZmxvd05hbWUgKyBcIicsIGJlY2F1c2UgJ1wiICsgbWV0aG9kTmFtZSArIFwiJyBpcyBsb2NrZWQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLkJvb2ttYXJrTm90Rm91bmRFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5NZXRob2RJc05vdEFjY2Vzc2libGVFcnJvcihcIkNhbm5vdCBjcmVhdGUgaW5zdGFuY2VvZiB3b3JrZmxvdyAnXCIgKyBzZWxmLndvcmtmbG93TmFtZSArIFwiJywgYmVjYXVzZSBib29rbWFyayBvZiAnXCIgKyBtZXRob2ROYW1lICsgXCInIGRvZXNuJ3QgZXhpc3QuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICBzZWxmLl9yZXNldENhbGxiYWNrcygpO1xuICAgIH1cbn0pO1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fZW50ZXJMb2NrRm9yQ3JlYXRlZEluc3RhbmNlID0gYXN5bmMoXG4gICAgZnVuY3Rpb24qIChsb2NrSW5mbykge1xuICAgICAgICBpZiAobG9ja0luZm8pIHtcbiAgICAgICAgICAgIHlpZWxkIHRoaXMuX2hvc3QuX2VudGVyTG9ja0ZvckNyZWF0ZWRJbnN0YW5jZSh0aGlzLCBsb2NrSW5mbyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuc2V0V29ya2Zsb3cgPSBmdW5jdGlvbiAod29ya2Zsb3csIGluc3RhbmNlSWQpIHtcbiAgICBpZiAoISh3b3JrZmxvdyBpbnN0YW5jZW9mIFdvcmtmbG93KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiV29ya2Zsb3cgYXJndW1lbnQgZXhwZWN0ZWQuXCIpO1xuICAgIH1cbiAgICB0aGlzLl9lbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUod29ya2Zsb3cpO1xuICAgIHRoaXMuX2FkZE15VHJhY2tlcnMoKTtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoaW5zdGFuY2VJZCkpIHtcbiAgICAgICAgdGhpcy5pZCA9IGluc3RhbmNlSWQ7XG4gICAgfVxuICAgIHRoaXMuX2NvcHlQYXJzRnJvbUhvc3QoKTtcbn07XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLmNhbGxNZXRob2QgPSBhc3luYyhmdW5jdGlvbiogKG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLl9yZXNldENhbGxiYWNrc0FuZFN0YXRlKCk7XG5cbiAgICBsZXQgZW5kTWV0aG9kUmVhY2hlZCA9IGZhbHNlO1xuICAgIGxldCByZXN1bHQgPSBudWxsO1xuICAgIHNlbGYuX2VuZE1ldGhvZENhbGxiYWNrID1cbiAgICAgICAgZnVuY3Rpb24gKG1uLCBpcCwgcikge1xuICAgICAgICAgICAgaWYgKG1uID09PSBtZXRob2ROYW1lKSB7XG4gICAgICAgICAgICAgICAgZW5kTWV0aG9kUmVhY2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIGxldCBpZGxlTWV0aG9kcyA9IFtdO1xuICAgIHNlbGYuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrID1cbiAgICAgICAgZnVuY3Rpb24gKG1uLCBpcCkge1xuICAgICAgICAgICAgaWRsZU1ldGhvZHMucHVzaChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1uLFxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogaXBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgIHRyeSB7XG4gICAgICAgIHlpZWxkIHNlbGYuX2VuZ2luZS5yZXN1bWVCb29rbWFyayhzcGVjU3RyaW5ncy5ob3N0aW5nLmNyZWF0ZUJlZ2luTWV0aG9kQk1OYW1lKG1ldGhvZE5hbWUpLCBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSwgYXJncyk7XG5cbiAgICAgICAgaWYgKCFlbmRNZXRob2RSZWFjaGVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBoYXMgYmVlbiBjb21wbGV0ZWQgb3IgZ29uZSB0byBpZGxlIHdpdGhvdXQgcmVhY2hpbmcgYW4gRW5kTWV0aG9kIGFjdGl2aXR5IG9mIG1ldGhvZCBuYW1lICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XG4gICAgICAgICAgICBpZiAoaWRsZU1ldGhvZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGdvbmUgdG8gaWRsZSwgYnV0IHRoZXJlIGlzIG5vIGFjdGl2ZSBCZWdpbk1ldGhvZCBhY3Rpdml0aWVzIHRvIHdhaXQgZm9yLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpZGxlTWV0aG9kcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBoYXMgY29tcGxldGVkLCBidXQgdGhlcmUgaXMgYWN0aXZlIEJlZ2luTWV0aG9kIGFjdGl2aXRpZXMgdG8gd2FpdCBmb3IuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVidWcoXCJDYWxsIG1ldGhvZCBlcnJvcjogJXNcIiwgZS5zdGFjayk7XG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLkJvb2ttYXJrTm90Rm91bmRFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5NZXRob2RJc05vdEFjY2Vzc2libGVFcnJvcihcIkNhbm5vdCBjYWxsIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInIG9mIHdvcmtmbG93ICdcIiArIHNlbGYud29ya2Zsb3dOYW1lICsgXCInLCBiZWNhdXNlIGl0cyBib29rbWFyayBkb2Vzbid0IGV4aXN0LlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgICAgc2VsZi5fcmVzZXRDYWxsYmFja3MoKTtcbiAgICB9XG59KTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2NvcHlQYXJzRnJvbUhvc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yIChsZXQgdCBvZiB0aGlzLl9ob3N0Ll90cmFja2Vycykge1xuICAgICAgICB0aGlzLl9lbmdpbmUuYWRkVHJhY2tlcih0KTtcbiAgICB9XG59O1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fYWRkTXlUcmFja2VycyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9hZGRCZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0SGVscGVyVHJhY2tlcigpO1xuICAgIHRoaXMuX2FkZEVuZE1ldGhvZEhlbHBlclRyYWNrZXIoKTtcbiAgICB0aGlzLl9hZGRJZGxlSW5zdGFuY2VJZFBhdGhUcmFja2VyKCk7XG59O1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fcmVzZXRDYWxsYmFja3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fYmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdENhbGxiYWNrID0gbnVsbDtcbiAgICB0aGlzLl9lbmRNZXRob2RDYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5faWRsZUluc3RhbmNlSWRQYXRoQ2FsbGJhY2sgPSBudWxsO1xufTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX3Jlc2V0Q2FsbGJhY2tzQW5kU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fcmVzZXRDYWxsYmFja3MoKTtcbiAgICB0aGlzLl9hY3RpdmVEZWxheXMgPSBbXTtcbn07XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLl9hZGRCZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0SGVscGVyVHJhY2tlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IHRyYWNrZXIgPSB7XG4gICAgICAgIGFjdGl2aXR5U3RhdGVGaWx0ZXI6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5fYmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdENhbGxiYWNrICYmXG4gICAgICAgICAgICAgICAgYXJncy5zY29wZS4kYWN0aXZpdHkgaW5zdGFuY2VvZiBCZWdpbk1ldGhvZCAmJlxuICAgICAgICAgICAgICAgIGFyZ3Muc2NvcGUuY2FuQ3JlYXRlSW5zdGFuY2UgJiZcbiAgICAgICAgICAgICAgICBfLmlzU3RyaW5nKGFyZ3Muc2NvcGUubWV0aG9kTmFtZSkgJiZcbiAgICAgICAgICAgICAgICAoIWFyZ3Muc2NvcGUuaW5zdGFuY2VJZFBhdGggfHwgXy5pc1N0cmluZyhhcmdzLnNjb3BlLmluc3RhbmNlSWRQYXRoKSkgJiZcbiAgICAgICAgICAgICAgICBhcmdzLnJlYXNvbiA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZTtcbiAgICAgICAgfSxcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUNoYW5nZWQ6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbWV0aG9kTmFtZSA9IGFyZ3Muc2NvcGUubWV0aG9kTmFtZS50cmltKCk7XG4gICAgICAgICAgICBsZXQgaW5zdGFuY2VJZFBhdGggPSBhcmdzLnNjb3BlLmluc3RhbmNlSWRQYXRoID8gYXJncy5zY29wZS5pbnN0YW5jZUlkUGF0aC50cmltKCkgOiBudWxsO1xuICAgICAgICAgICAgc2VsZi5fYmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdENhbGxiYWNrKG1ldGhvZE5hbWUsIGluc3RhbmNlSWRQYXRoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc2VsZi5fZW5naW5lLmFkZFRyYWNrZXIodHJhY2tlcik7XG59O1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fYWRkRW5kTWV0aG9kSGVscGVyVHJhY2tlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IHRyYWNrZXIgPSB7XG4gICAgICAgIGFjdGl2aXR5U3RhdGVGaWx0ZXI6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5fZW5kTWV0aG9kQ2FsbGJhY2sgJiZcbiAgICAgICAgICAgICAgICBhcmdzLnNjb3BlLiRhY3Rpdml0eSBpbnN0YW5jZW9mIEVuZE1ldGhvZCAmJlxuICAgICAgICAgICAgICAgIF8uaXNTdHJpbmcoYXJncy5zY29wZS5tZXRob2ROYW1lKSAmJlxuICAgICAgICAgICAgICAgICghYXJncy5zY29wZS5pbnN0YW5jZUlkUGF0aCB8fCBfLmlzU3RyaW5nKGFyZ3Muc2NvcGUuaW5zdGFuY2VJZFBhdGgpKSAmJlxuICAgICAgICAgICAgICAgIGFyZ3MucmVhc29uID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZTtcbiAgICAgICAgfSxcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUNoYW5nZWQ6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbWV0aG9kTmFtZSA9IGFyZ3Muc2NvcGUubWV0aG9kTmFtZS50cmltKCk7XG4gICAgICAgICAgICBsZXQgaW5zdGFuY2VJZFBhdGggPSBhcmdzLnNjb3BlLmluc3RhbmNlSWRQYXRoID8gYXJncy5zY29wZS5pbnN0YW5jZUlkUGF0aC50cmltKCkgOiBudWxsO1xuICAgICAgICAgICAgc2VsZi5fZW5kTWV0aG9kQ2FsbGJhY2sobWV0aG9kTmFtZSwgaW5zdGFuY2VJZFBhdGgsIGFyZ3MucmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc2VsZi5fZW5naW5lLmFkZFRyYWNrZXIodHJhY2tlcik7XG59O1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fYWRkSWRsZUluc3RhbmNlSWRQYXRoVHJhY2tlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IHRyYWNrZXIgPSB7XG4gICAgICAgIGFjdGl2aXR5U3RhdGVGaWx0ZXI6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5faWRsZUluc3RhbmNlSWRQYXRoQ2FsbGJhY2sgJiZcbiAgICAgICAgICAgICAgICBhcmdzLnNjb3BlLiRhY3Rpdml0eSBpbnN0YW5jZW9mIEJlZ2luTWV0aG9kICYmXG4gICAgICAgICAgICAgICAgXy5pc1N0cmluZyhhcmdzLnNjb3BlLm1ldGhvZE5hbWUpICYmXG4gICAgICAgICAgICAgICAgXy5pc1N0cmluZyhhcmdzLnNjb3BlLmluc3RhbmNlSWRQYXRoKSAmJlxuICAgICAgICAgICAgICAgIGFyZ3MucmVhc29uID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlO1xuICAgICAgICB9LFxuICAgICAgICBhY3Rpdml0eVN0YXRlQ2hhbmdlZDogZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBtZXRob2ROYW1lID0gYXJncy5zY29wZS5tZXRob2ROYW1lLnRyaW0oKTtcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZUlkUGF0aCA9IGFyZ3Muc2NvcGUuaW5zdGFuY2VJZFBhdGgudHJpbSgpO1xuICAgICAgICAgICAgc2VsZi5faWRsZUluc3RhbmNlSWRQYXRoQ2FsbGJhY2sobWV0aG9kTmFtZSwgaW5zdGFuY2VJZFBhdGgpO1xuXG4gICAgICAgICAgICAvLyBUaGlzIGlzIHdoZXJlIGEgbWV0aG9kIGdvZXMgaWRsZS5cbiAgICAgICAgICAgIC8vIFNvIGlmIGl0IGEgRGVsYXlUbyBtZXRob2QsIHdlIHNob3VsZCByZW1lbWJlciB0aGF0LlxuICAgICAgICAgICAgaWYgKHNwZWNTdHJpbmdzLmhvc3RpbmcuaXNEZWxheVRvTWV0aG9kTmFtZShtZXRob2ROYW1lKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2FjdGl2ZURlbGF5cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogbWV0aG9kTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXlUbzogYXJncy5zY29wZS5kZWxheVRvXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNlbGYuX2VuZ2luZS5hZGRUcmFja2VyKHRyYWNrZXIpO1xufTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuZ2V0U3RhdGVUb1BlcnNpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNwID0gdGhpcy5fZW5naW5lLmdldFN0YXRlQW5kUHJvbW90aW9ucyh0aGlzLl9ob3N0Lm9wdGlvbnMuc2VyaWFsaXplciwgdGhpcy5faG9zdC5vcHRpb25zLmVuYWJsZVByb21vdGlvbnMpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGluc3RhbmNlSWQ6IHRoaXMuaWQsXG4gICAgICAgIGNyZWF0ZWRPbjogdGhpcy5jcmVhdGVkT24sXG4gICAgICAgIHdvcmtmbG93TmFtZTogdGhpcy53b3JrZmxvd05hbWUsXG4gICAgICAgIHdvcmtmbG93VmVyc2lvbjogdGhpcy53b3JrZmxvd1ZlcnNpb24sXG4gICAgICAgIHVwZGF0ZWRPbjogdGhpcy5fZW5naW5lLnVwZGF0ZWRPbixcbiAgICAgICAgc3RhdGU6IHNwLnN0YXRlLFxuICAgICAgICBwcm9tb3RlZFByb3BlcnRpZXM6IHNwLnByb21vdGVkUHJvcGVydGllcyxcbiAgICAgICAgYWN0aXZlRGVsYXlzOiB0aGlzLl9hY3RpdmVEZWxheXNcbiAgICB9O1xufTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUucmVzdG9yZVN0YXRlID0gZnVuY3Rpb24gKGpzb24pIHtcbiAgICBpZiAoIV8uaXNPYmplY3QoanNvbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFyZ3VtZW50ICdqc29uJyBpcyBub3QgYW4gb2JqZWN0LlwiKTtcbiAgICB9XG4gICAgaWYgKGpzb24uaW5zdGFuY2VJZCAhPT0gdGhpcy5pZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdGF0ZSBpbnN0YW5jZUlkIHByb3BlcnR5IHZhbHVlIG9mICdcIiArIGpzb24uaW5zdGFuY2VJZCArIFwiJyBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgY3VycmVudCBpbnN0YW5jZSBpZCAnXCIgKyB0aGlzLmlkICsgXCInLlwiKTtcbiAgICB9XG4gICAgaWYgKGpzb24ud29ya2Zsb3dOYW1lICE9PSB0aGlzLndvcmtmbG93TmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdGF0ZSB3b3JrZmxvd05hbWUgcHJvcGVydHkgdmFsdWUgb2YgJ1wiICsganNvbi53b3JrZmxvd05hbWUgKyBcIicgaXMgZGlmZmVyZW50IHRoYW4gdGhlIGN1cnJlbnQgV29ya2Zsb3cgbmFtZSAnXCIgKyB0aGlzLndvcmtmbG93TmFtZSArIFwiJy5cIik7XG4gICAgfVxuICAgIGlmIChqc29uLndvcmtmbG93VmVyc2lvbiAhPT0gdGhpcy53b3JrZmxvd1ZlcnNpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgd29ya2Zsb3dOYW1lIHByb3BlcnR5IHZhbHVlIG9mICdcIiArIGpzb24ud29ya2Zsb3dWZXJzaW9uICsgXCInIGlzIGRpZmZlcmVudCB0aGFuIHRoZSBjdXJyZW50IFdvcmtmbG93IHZlcnNpb24gJ1wiICsgdGhpcy53b3JrZmxvd1ZlcnNpb24gKyBcIicuXCIpO1xuICAgIH1cbiAgICBpZiAoIV8uaXNEYXRlKGpzb24uY3JlYXRlZE9uKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdGF0ZSBjcmVhdGVkT24gcHJvcGVydHkgdmFsdWUgb2YgJ1wiICsganNvbi5jcmVhdGVkT24gKyBcIicgaXMgbm90IGEgRGF0ZS5cIik7XG4gICAgfVxuXG4gICAgdGhpcy5fY3JlYXRlZE9uID0ganNvbi5jcmVhdGVkT247XG4gICAgdGhpcy5fZW5naW5lLnNldFN0YXRlKHRoaXMuX2hvc3Qub3B0aW9ucy5zZXJpYWxpemVyLCBqc29uLnN0YXRlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gV29ya2Zsb3dJbnN0YW5jZTtcbiJdfQ==
