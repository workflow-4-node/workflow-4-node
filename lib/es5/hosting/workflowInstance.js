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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvcmtmbG93SW5zdGFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFFQSxBQUFJLEVBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyx3QkFBdUIsQ0FBQyxDQUFDO0FBQ2hELEFBQUksRUFBQSxDQUFBLHVCQUFzQixFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsdUNBQXNDLENBQUMsQ0FBQztBQUM5RSxBQUFJLEVBQUEsQ0FBQSxXQUFVLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQywyQkFBMEIsQ0FBQyxDQUFDO0FBQ3RELEFBQUksRUFBQSxDQUFBLFNBQVEsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLHlCQUF3QixDQUFDLENBQUM7QUFDbEQsQUFBSSxFQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsa0JBQWlCLENBQUMsQ0FBQztBQUN4QyxBQUFJLEVBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxpQkFBZ0IsQ0FBQyxDQUFDO0FBQ3RDLEFBQUksRUFBQSxDQUFBLFdBQVUsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLHVCQUFzQixDQUFDLENBQUM7QUFDbEQsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQztBQUNsQyxBQUFJLEVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxjQUFhLENBQUMsQ0FBQztBQUNoQyxBQUFJLEVBQUEsQ0FBQSxZQUFXLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyx3QkFBdUIsQ0FBQyxDQUFDO0FBQ3BELEFBQUksRUFB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QUcsUUFBUSxTQUFTLEFBQUMsQ0FBQyxJQUFHLE1BQU0sUUFBUSxXQUFXLENBQUcsQ0FBQSxJQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRCxlQUFlLFVBQVUsV0FBVyxFQUFJLFVBQVMsT0FBTSxDQUFHO0FBQ3RELEtBQUcsUUFBUSxXQUFXLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsS0FBSyxRQUFRLEVBQUksaUJBQWUsQ0FBQztBQUNqQyIsImZpbGUiOiJob3N0aW5nL3dvcmtmbG93SW5zdGFuY2UuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5sZXQgV29ya2Zsb3cgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy93b3JrZmxvd1wiKTtcbmxldCBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL2FjdGl2aXR5RXhlY3V0aW9uRW5naW5lXCIpO1xubGV0IEJlZ2luTWV0aG9kID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvYmVnaW5NZXRob2RcIik7XG5sZXQgRW5kTWV0aG9kID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvZW5kTWV0aG9kXCIpO1xubGV0IGVycm9ycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZXJyb3JzXCIpO1xubGV0IGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcbmxldCBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgZ3VpZHMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2d1aWRzXCIpO1xubGV0IEJsdWViaXJkID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBhc3luY0hlbHBlcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2FzeW5jSGVscGVyc1wiKTtcbmxldCBhc3luYyA9IGFzeW5jSGVscGVycy5hc3luYztcbmxldCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xubGV0IGRlYnVnID0gcmVxdWlyZShcImRlYnVnXCIpKFwid2Y0bm9kZTpXb3JrZmxvd0luc3RhbmNlXCIpO1xuXG5mdW5jdGlvbiBXb3JrZmxvd0luc3RhbmNlKGhvc3QpIHtcbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuX2hvc3QgPSBob3N0O1xuICAgIHRoaXMuaWQgPSBudWxsO1xuICAgIHRoaXMuX2VuZ2luZSA9IG51bGw7XG4gICAgdGhpcy5fY3JlYXRlZE9uID0gbnVsbDtcbiAgICB0aGlzLl9iZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0Q2FsbGJhY2sgPSBudWxsO1xuICAgIHRoaXMuX2VuZE1ldGhvZENhbGxiYWNrID0gbnVsbDtcbiAgICB0aGlzLl9pZGxlSW5zdGFuY2VJZFBhdGhDYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5fYWN0aXZlRGVsYXlzID0gW107XG4gICAgdGhpcy5fd29ya2Zsb3dWZXJzaW9uID0gbnVsbDtcbn1cblxudXRpbC5pbmhlcml0cyhXb3JrZmxvd0luc3RhbmNlLCBFdmVudEVtaXR0ZXIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhcbiAgICBXb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZSwge1xuICAgICAgICBleGVjU3RhdGU6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUgPyB0aGlzLl9lbmdpbmUuZXhlY1N0YXRlIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgd29ya2Zsb3dOYW1lOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZW5naW5lID8gdGhpcy5fZW5naW5lLnJvb3RBY3Rpdml0eS5uYW1lLnRyaW0oKSA6IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHdvcmtmbG93VmVyc2lvbjoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dvcmtmbG93VmVyc2lvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZE9uOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlZE9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGVkT246IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUgPyB0aGlzLl9lbmdpbmUudXBkYXRlZE9uIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYWN0aXZlRGVsYXlzOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlRGVsYXlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLmNyZWF0ZSA9IGFzeW5jKGZ1bmN0aW9uKiAod29ya2Zsb3csIHdvcmtmbG93VmVyc2lvbiwgbWV0aG9kTmFtZSwgYXJncywgbG9ja0luZm8pIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLnNldFdvcmtmbG93KHdvcmtmbG93LCB3b3JrZmxvd1ZlcnNpb24pO1xuICAgIHNlbGYuX3Jlc2V0Q2FsbGJhY2tzQW5kU3RhdGUoKTtcblxuICAgIGxldCBjcmVhdGVNZXRob2RSZWFjaGVkID0gZmFsc2U7XG4gICAgbGV0IGluc3RhbmNlSWRQYXRoID0gbnVsbDtcbiAgICBzZWxmLl9iZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0Q2FsbGJhY2sgPSBmdW5jdGlvbiAobW4sIGlwKSB7XG4gICAgICAgIGlmIChtbiA9PT0gbWV0aG9kTmFtZSkge1xuICAgICAgICAgICAgY3JlYXRlTWV0aG9kUmVhY2hlZCA9IHRydWU7XG4gICAgICAgICAgICBpbnN0YW5jZUlkUGF0aCA9IGlwO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNlbGYuX2NyZWF0ZWRPbiA9IG5ldyBEYXRlKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoc2VsZi5fZW5naW5lLmlzSWRsZSh5aWVsZCBzZWxmLl9lbmdpbmUuaW52b2tlKCkpKSB7XG4gICAgICAgICAgICBpZiAoY3JlYXRlTWV0aG9kUmVhY2hlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3Jlc2V0Q2FsbGJhY2tzQW5kU3RhdGUoKTtcblxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZUlkUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChzZWxmLmlkID0gc2VsZi5faG9zdC5faW5zdGFuY2VJZFBhcnNlci5wYXJzZShpbnN0YW5jZUlkUGF0aCwgYXJncykpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJDYW5ub3QgcGFyc2UgQmVnaW5NZXRob2QncyBpbnN0YW5jZUlkUGF0aCAnXCIgKyBpbnN0YW5jZUlkUGF0aCArIFwiJyBvbiBhcmd1bWVudHMgb2YgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIChzZWxmLl9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UobG9ja0luZm8pKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgY3JlYXRlRW5kTWV0aG9kUmVhY2hlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgICAgICAgICAgbGV0IGVuZEluc3RhbmNlSWRQYXRoID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzZWxmLl9lbmRNZXRob2RDYWxsYmFjayA9XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChtbiwgaXAsIHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtbiA9PT0gbWV0aG9kTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUVuZE1ldGhvZFJlYWNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZEluc3RhbmNlSWRQYXRoID0gaXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGxldCBpZGxlTWV0aG9kcyA9IFtdO1xuICAgICAgICAgICAgICAgIHNlbGYuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrID1cbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG1uLCBpcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRsZU1ldGhvZHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogaXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHlpZWxkIChzZWxmLl9lbmdpbmUucmVzdW1lQm9va21hcmsoc3BlY1N0cmluZ3MuaG9zdGluZy5jcmVhdGVCZWdpbk1ldGhvZEJNTmFtZShtZXRob2ROYW1lKSwgZW51bXMuYWN0aXZpdHlTdGF0ZXMuY29tcGxldGUsIGFyZ3MpKTtcblxuICAgICAgICAgICAgICAgIGlmIChjcmVhdGVFbmRNZXRob2RSZWFjaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHNlbGYuaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW5kSW5zdGFuY2VJZFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChzZWxmLmlkID0gc2VsZi5faG9zdC5faW5zdGFuY2VJZFBhcnNlci5wYXJzZShlbmRJbnN0YW5jZUlkUGF0aCwgcmVzdWx0KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiQ2Fubm90IHBhcnNlIEVuZE1ldGhvZHMncyBpbnN0YW5jZUlkUGF0aCAnXCIgKyBpbnN0YW5jZUlkUGF0aCArIFwiJyBvbiBhcmd1bWVudHMgb2YgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UobG9ja0luZm8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiQmVnaW5NZXRob2Qgb3IgRW5kTWV0aG9kIG9mIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInIGRvZXNuJ3Qgc3BlY2lmeSBhbiBpbnN0YW5jZUlkUGF0aCBwcm9wZXJ0eSB2YWx1ZS5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBiZWVuIGNvbXBsZXRlZCBvciBnb25lIHRvIGlkbGUgd2l0aG91dCByZWFjaGluZyBhbiBFbmRNZXRob2QgYWN0aXZpdHkgb2YgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmV4ZWNTdGF0ZSA9PT0gZW51bXMuYWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWRsZU1ldGhvZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBoYXMgZ29uZSB0byBpZGxlLCBidXQgdGhlcmUgaXMgbm8gYWN0aXZlIEJlZ2luTWV0aG9kIGFjdGl2aXRpZXMgdG8gd2FpdCBmb3IuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWRsZU1ldGhvZHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBoYXMgY29tcGxldGVkLCBidXQgdGhlcmUgaXMgYWN0aXZlIEJlZ2luTWV0aG9kIGFjdGl2aXRpZXMgdG8gd2FpdCBmb3IuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBnb25lIHRvIGlkbGUgd2l0aG91dCByZWFjaGluZyBhbiBpbnN0YW5jZSBjcmVhdG9yIEJlZ2luTWV0aG9kIGFjdGl2aXR5IG9mIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBiZWVuIGNvbXBsZXRlZCB3aXRob3V0IHJlYWNoaW5nIGFuIGluc3RhbmNlIGNyZWF0b3IgQmVnaW5NZXRob2QgYWN0aXZpdHkuXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGRlYnVnKFwiQ3JlYXRlIGVycm9yOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuVGltZW91dEVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLk1ldGhvZElzTm90QWNjZXNzaWJsZUVycm9yKFwiQ2Fubm90IGNyZWF0ZSBpbnN0YW5jZW9mIHdvcmtmbG93ICdcIiArIHNlbGYud29ya2Zsb3dOYW1lICsgXCInLCBiZWNhdXNlICdcIiArIG1ldGhvZE5hbWUgKyBcIicgaXMgbG9ja2VkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5Cb29rbWFya05vdEZvdW5kRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IoXCJDYW5ub3QgY3JlYXRlIGluc3RhbmNlb2Ygd29ya2Zsb3cgJ1wiICsgc2VsZi53b3JrZmxvd05hbWUgKyBcIicsIGJlY2F1c2UgYm9va21hcmsgb2YgJ1wiICsgbWV0aG9kTmFtZSArIFwiJyBkb2Vzbid0IGV4aXN0LlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgICAgc2VsZi5fcmVzZXRDYWxsYmFja3MoKTtcbiAgICB9XG59KTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2VudGVyTG9ja0ZvckNyZWF0ZWRJbnN0YW5jZSA9IGFzeW5jKFxuICAgIGZ1bmN0aW9uKiAobG9ja0luZm8pIHtcbiAgICAgICAgaWYgKGxvY2tJbmZvKSB7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLl9ob3N0Ll9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UodGhpcywgbG9ja0luZm8pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLnNldFdvcmtmbG93ID0gZnVuY3Rpb24gKHdvcmtmbG93LCB3b3JrZmxvd1ZlcnNpb24sIGluc3RhbmNlSWQpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCEod29ya2Zsb3cgaW5zdGFuY2VvZiBXb3JrZmxvdykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIldvcmtmbG93IGFyZ3VtZW50IGV4cGVjdGVkLlwiKTtcbiAgICB9XG4gICAgaWYgKCEoXy5pc1N0cmluZyh3b3JrZmxvd1ZlcnNpb24pKSB8fCAhd29ya2Zsb3dWZXJzaW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJXb3JrZmxvdyB2ZXJzaW9uIGV4cGVjdGVkLlwiKTtcbiAgICB9XG4gICAgdGhpcy5fd29ya2Zsb3dWZXJzaW9uID0gd29ya2Zsb3dWZXJzaW9uO1xuICAgIHRoaXMuX2VuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh3b3JrZmxvdywgdGhpcyk7XG4gICAgdGhpcy5fZW5naW5lLm9uKFxuICAgICAgICBlbnVtcy5ldmVudHMud29ya2Zsb3dFdmVudCxcbiAgICAgICAgZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBhcnIgPSBfLnRvQXJyYXkoYXJncyk7XG4gICAgICAgICAgICBhcnIuc3BsaWNlKDAsIDAsIHNlbGYuaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICBzZWxmLmVtaXQoZW51bXMuZXZlbnRzLndvcmtmbG93RXZlbnQsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB0aGlzLl9hZGRNeVRyYWNrZXJzKCk7XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGluc3RhbmNlSWQpKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpbnN0YW5jZUlkO1xuICAgIH1cbiAgICB0aGlzLl9jb3B5UGFyc0Zyb21Ib3N0KCk7XG59O1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5jYWxsTWV0aG9kID0gYXN5bmMoZnVuY3Rpb24qIChtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5fcmVzZXRDYWxsYmFja3NBbmRTdGF0ZSgpO1xuXG4gICAgbGV0IGVuZE1ldGhvZFJlYWNoZWQgPSBmYWxzZTtcbiAgICBsZXQgcmVzdWx0ID0gbnVsbDtcbiAgICBzZWxmLl9lbmRNZXRob2RDYWxsYmFjayA9XG4gICAgICAgIGZ1bmN0aW9uIChtbiwgaXAsIHIpIHtcbiAgICAgICAgICAgIGlmIChtbiA9PT0gbWV0aG9kTmFtZSkge1xuICAgICAgICAgICAgICAgIGVuZE1ldGhvZFJlYWNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICBsZXQgaWRsZU1ldGhvZHMgPSBbXTtcbiAgICBzZWxmLl9pZGxlSW5zdGFuY2VJZFBhdGhDYWxsYmFjayA9XG4gICAgICAgIGZ1bmN0aW9uIChtbiwgaXApIHtcbiAgICAgICAgICAgIGlkbGVNZXRob2RzLnB1c2goXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBtbixcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IGlwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgICB5aWVsZCBzZWxmLl9lbmdpbmUucmVzdW1lQm9va21hcmsoc3BlY1N0cmluZ3MuaG9zdGluZy5jcmVhdGVCZWdpbk1ldGhvZEJNTmFtZShtZXRob2ROYW1lKSwgZW51bXMuYWN0aXZpdHlTdGF0ZXMuY29tcGxldGUsIGFyZ3MpO1xuXG4gICAgICAgIGlmICghZW5kTWV0aG9kUmVhY2hlZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGJlZW4gY29tcGxldGVkIG9yIGdvbmUgdG8gaWRsZSB3aXRob3V0IHJlYWNoaW5nIGFuIEVuZE1ldGhvZCBhY3Rpdml0eSBvZiBtZXRob2QgbmFtZSAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLmV4ZWNTdGF0ZSA9PT0gZW51bXMuYWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgaWYgKGlkbGVNZXRob2RzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBnb25lIHRvIGlkbGUsIGJ1dCB0aGVyZSBpcyBubyBhY3RpdmUgQmVnaW5NZXRob2QgYWN0aXZpdGllcyB0byB3YWl0IGZvci5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoaWRsZU1ldGhvZHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGNvbXBsZXRlZCwgYnV0IHRoZXJlIGlzIGFjdGl2ZSBCZWdpbk1ldGhvZCBhY3Rpdml0aWVzIHRvIHdhaXQgZm9yLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGRlYnVnKFwiQ2FsbCBtZXRob2QgZXJyb3I6ICVzXCIsIGUuc3RhY2spO1xuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5Cb29rbWFya05vdEZvdW5kRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IoXCJDYW5ub3QgY2FsbCBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJyBvZiB3b3JrZmxvdyAnXCIgKyBzZWxmLndvcmtmbG93TmFtZSArIFwiJywgYmVjYXVzZSBpdHMgYm9va21hcmsgZG9lc24ndCBleGlzdC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHNlbGYuX3Jlc2V0Q2FsbGJhY2tzKCk7XG4gICAgfVxufSk7XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLl9jb3B5UGFyc0Zyb21Ib3N0ID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAobGV0IHQgb2YgdGhpcy5faG9zdC5fdHJhY2tlcnMpIHtcbiAgICAgICAgdGhpcy5fZW5naW5lLmFkZFRyYWNrZXIodCk7XG4gICAgfVxufTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2FkZE15VHJhY2tlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fYWRkQmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdEhlbHBlclRyYWNrZXIoKTtcbiAgICB0aGlzLl9hZGRFbmRNZXRob2RIZWxwZXJUcmFja2VyKCk7XG4gICAgdGhpcy5fYWRkSWRsZUluc3RhbmNlSWRQYXRoVHJhY2tlcigpO1xufTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX3Jlc2V0Q2FsbGJhY2tzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2JlZ2luTWV0aG9kV2l0aENyZWF0ZUluc3RDYWxsYmFjayA9IG51bGw7XG4gICAgdGhpcy5fZW5kTWV0aG9kQ2FsbGJhY2sgPSBudWxsO1xuICAgIHRoaXMuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrID0gbnVsbDtcbn07XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLl9yZXNldENhbGxiYWNrc0FuZFN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX3Jlc2V0Q2FsbGJhY2tzKCk7XG4gICAgdGhpcy5fYWN0aXZlRGVsYXlzID0gW107XG59O1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fYWRkQmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdEhlbHBlclRyYWNrZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCB0cmFja2VyID0ge1xuICAgICAgICBhY3Rpdml0eVN0YXRlRmlsdGVyOiBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2JlZ2luTWV0aG9kV2l0aENyZWF0ZUluc3RDYWxsYmFjayAmJlxuICAgICAgICAgICAgICAgIGFyZ3Muc2NvcGUuJGFjdGl2aXR5IGluc3RhbmNlb2YgQmVnaW5NZXRob2QgJiZcbiAgICAgICAgICAgICAgICBhcmdzLnNjb3BlLmNhbkNyZWF0ZUluc3RhbmNlICYmXG4gICAgICAgICAgICAgICAgXy5pc1N0cmluZyhhcmdzLnNjb3BlLm1ldGhvZE5hbWUpICYmXG4gICAgICAgICAgICAgICAgKCFhcmdzLnNjb3BlLmluc3RhbmNlSWRQYXRoIHx8IF8uaXNTdHJpbmcoYXJncy5zY29wZS5pbnN0YW5jZUlkUGF0aCkpICYmXG4gICAgICAgICAgICAgICAgYXJncy5yZWFzb24gPT09IGVudW1zLmFjdGl2aXR5U3RhdGVzLmlkbGU7XG4gICAgICAgIH0sXG4gICAgICAgIGFjdGl2aXR5U3RhdGVDaGFuZ2VkOiBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgbGV0IG1ldGhvZE5hbWUgPSBhcmdzLnNjb3BlLm1ldGhvZE5hbWUudHJpbSgpO1xuICAgICAgICAgICAgbGV0IGluc3RhbmNlSWRQYXRoID0gYXJncy5zY29wZS5pbnN0YW5jZUlkUGF0aCA/IGFyZ3Muc2NvcGUuaW5zdGFuY2VJZFBhdGgudHJpbSgpIDogbnVsbDtcbiAgICAgICAgICAgIHNlbGYuX2JlZ2luTWV0aG9kV2l0aENyZWF0ZUluc3RDYWxsYmFjayhtZXRob2ROYW1lLCBpbnN0YW5jZUlkUGF0aCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNlbGYuX2VuZ2luZS5hZGRUcmFja2VyKHRyYWNrZXIpO1xufTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2FkZEVuZE1ldGhvZEhlbHBlclRyYWNrZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCB0cmFja2VyID0ge1xuICAgICAgICBhY3Rpdml0eVN0YXRlRmlsdGVyOiBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2VuZE1ldGhvZENhbGxiYWNrICYmXG4gICAgICAgICAgICAgICAgYXJncy5zY29wZS4kYWN0aXZpdHkgaW5zdGFuY2VvZiBFbmRNZXRob2QgJiZcbiAgICAgICAgICAgICAgICBfLmlzU3RyaW5nKGFyZ3Muc2NvcGUubWV0aG9kTmFtZSkgJiZcbiAgICAgICAgICAgICAgICAoIWFyZ3Muc2NvcGUuaW5zdGFuY2VJZFBhdGggfHwgXy5pc1N0cmluZyhhcmdzLnNjb3BlLmluc3RhbmNlSWRQYXRoKSkgJiZcbiAgICAgICAgICAgICAgICBhcmdzLnJlYXNvbiA9PT0gZW51bXMuYWN0aXZpdHlTdGF0ZXMuY29tcGxldGU7XG4gICAgICAgIH0sXG4gICAgICAgIGFjdGl2aXR5U3RhdGVDaGFuZ2VkOiBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgbGV0IG1ldGhvZE5hbWUgPSBhcmdzLnNjb3BlLm1ldGhvZE5hbWUudHJpbSgpO1xuICAgICAgICAgICAgbGV0IGluc3RhbmNlSWRQYXRoID0gYXJncy5zY29wZS5pbnN0YW5jZUlkUGF0aCA/IGFyZ3Muc2NvcGUuaW5zdGFuY2VJZFBhdGgudHJpbSgpIDogbnVsbDtcbiAgICAgICAgICAgIHNlbGYuX2VuZE1ldGhvZENhbGxiYWNrKG1ldGhvZE5hbWUsIGluc3RhbmNlSWRQYXRoLCBhcmdzLnJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNlbGYuX2VuZ2luZS5hZGRUcmFja2VyKHRyYWNrZXIpO1xufTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2FkZElkbGVJbnN0YW5jZUlkUGF0aFRyYWNrZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCB0cmFja2VyID0ge1xuICAgICAgICBhY3Rpdml0eVN0YXRlRmlsdGVyOiBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrICYmXG4gICAgICAgICAgICAgICAgYXJncy5zY29wZS4kYWN0aXZpdHkgaW5zdGFuY2VvZiBCZWdpbk1ldGhvZCAmJlxuICAgICAgICAgICAgICAgIF8uaXNTdHJpbmcoYXJncy5zY29wZS5tZXRob2ROYW1lKSAmJlxuICAgICAgICAgICAgICAgIF8uaXNTdHJpbmcoYXJncy5zY29wZS5pbnN0YW5jZUlkUGF0aCkgJiZcbiAgICAgICAgICAgICAgICBhcmdzLnJlYXNvbiA9PT0gZW51bXMuYWN0aXZpdHlTdGF0ZXMuaWRsZTtcbiAgICAgICAgfSxcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUNoYW5nZWQ6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbWV0aG9kTmFtZSA9IGFyZ3Muc2NvcGUubWV0aG9kTmFtZS50cmltKCk7XG4gICAgICAgICAgICBsZXQgaW5zdGFuY2VJZFBhdGggPSBhcmdzLnNjb3BlLmluc3RhbmNlSWRQYXRoLnRyaW0oKTtcbiAgICAgICAgICAgIHNlbGYuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrKG1ldGhvZE5hbWUsIGluc3RhbmNlSWRQYXRoKTtcblxuICAgICAgICAgICAgLy8gVGhpcyBpcyB3aGVyZSBhIG1ldGhvZCBnb2VzIGlkbGUuXG4gICAgICAgICAgICAvLyBTbyBpZiBpdCBhIERlbGF5VG8gbWV0aG9kLCB3ZSBzaG91bGQgcmVtZW1iZXIgdGhhdC5cbiAgICAgICAgICAgIGlmIChzcGVjU3RyaW5ncy5ob3N0aW5nLmlzRGVsYXlUb01ldGhvZE5hbWUobWV0aG9kTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9hY3RpdmVEZWxheXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5VG86IGFyZ3Muc2NvcGUuZGVsYXlUb1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBzZWxmLl9lbmdpbmUuYWRkVHJhY2tlcih0cmFja2VyKTtcbn07XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLmdldFN0YXRlVG9QZXJzaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzcCA9IHRoaXMuX2VuZ2luZS5nZXRTdGF0ZUFuZFByb21vdGlvbnModGhpcy5faG9zdC5vcHRpb25zLnNlcmlhbGl6ZXIsIHRoaXMuX2hvc3Qub3B0aW9ucy5lbmFibGVQcm9tb3Rpb25zKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBpbnN0YW5jZUlkOiB0aGlzLmlkLFxuICAgICAgICBjcmVhdGVkT246IHRoaXMuY3JlYXRlZE9uLFxuICAgICAgICB3b3JrZmxvd05hbWU6IHRoaXMud29ya2Zsb3dOYW1lLFxuICAgICAgICB3b3JrZmxvd1ZlcnNpb246IHRoaXMud29ya2Zsb3dWZXJzaW9uLFxuICAgICAgICB1cGRhdGVkT246IHRoaXMuX2VuZ2luZS51cGRhdGVkT24sXG4gICAgICAgIHN0YXRlOiBzcC5zdGF0ZSxcbiAgICAgICAgcHJvbW90ZWRQcm9wZXJ0aWVzOiBzcC5wcm9tb3RlZFByb3BlcnRpZXMsXG4gICAgICAgIGFjdGl2ZURlbGF5czogdGhpcy5fYWN0aXZlRGVsYXlzXG4gICAgfTtcbn07XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLnJlc3RvcmVTdGF0ZSA9IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KGpzb24pKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnanNvbicgaXMgbm90IGFuIG9iamVjdC5cIik7XG4gICAgfVxuICAgIGlmIChqc29uLmluc3RhbmNlSWQgIT09IHRoaXMuaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgaW5zdGFuY2VJZCBwcm9wZXJ0eSB2YWx1ZSBvZiAnXCIgKyBqc29uLmluc3RhbmNlSWQgKyBcIicgaXMgZGlmZmVyZW50IHRoYW4gdGhlIGN1cnJlbnQgaW5zdGFuY2UgaWQgJ1wiICsgdGhpcy5pZCArIFwiJy5cIik7XG4gICAgfVxuICAgIGlmIChqc29uLndvcmtmbG93TmFtZSAhPT0gdGhpcy53b3JrZmxvd05hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgd29ya2Zsb3dOYW1lIHByb3BlcnR5IHZhbHVlIG9mICdcIiArIGpzb24ud29ya2Zsb3dOYW1lICsgXCInIGlzIGRpZmZlcmVudCB0aGFuIHRoZSBjdXJyZW50IFdvcmtmbG93IG5hbWUgJ1wiICsgdGhpcy53b3JrZmxvd05hbWUgKyBcIicuXCIpO1xuICAgIH1cbiAgICBpZiAoanNvbi53b3JrZmxvd1ZlcnNpb24gIT09IHRoaXMud29ya2Zsb3dWZXJzaW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN0YXRlIHdvcmtmbG93VmVyc2lvbiBwcm9wZXJ0eSB2YWx1ZSBvZiAnXCIgKyBqc29uLndvcmtmbG93VmVyc2lvbiArIFwiJyBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgY3VycmVudCBXb3JrZmxvdyB2ZXJzaW9uICdcIiArIHRoaXMud29ya2Zsb3dWZXJzaW9uICsgXCInLlwiKTtcbiAgICB9XG4gICAgaWYgKCFfLmlzRGF0ZShqc29uLmNyZWF0ZWRPbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgY3JlYXRlZE9uIHByb3BlcnR5IHZhbHVlIG9mICdcIiArIGpzb24uY3JlYXRlZE9uICsgXCInIGlzIG5vdCBhIERhdGUuXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX2NyZWF0ZWRPbiA9IGpzb24uY3JlYXRlZE9uO1xuICAgIHRoaXMuX2VuZ2luZS5zZXRTdGF0ZSh0aGlzLl9ob3N0Lm9wdGlvbnMuc2VyaWFsaXplciwganNvbi5zdGF0ZSk7XG59O1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5hZGRUcmFja2VyID0gZnVuY3Rpb24odHJhY2tlcikge1xuICAgIHRoaXMuX2VuZ2luZS5hZGRUcmFja2VyKHRyYWNrZXIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXb3JrZmxvd0luc3RhbmNlO1xuIl19
