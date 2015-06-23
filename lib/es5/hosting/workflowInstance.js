"use strict";
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
var Promise = require("bluebird");
var is = require("../common/is");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;
var util = require("util");
function WorkflowInstance(host) {
  this._host = host;
  this.id = null;
  this._engine = null;
  this._createdOn = null;
  this._beginMethodWithCreateInstCallback = null;
  this._endMethodCallback = null;
  this._idleInstanceIdPathCallback = null;
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
    }}
});
WorkflowInstance.prototype.create = async($traceurRuntime.initGeneratorFunction(function $__7(workflow, methodName, args, lockInfo) {
  var self,
      createMethodReached,
      instanceIdPath,
      createEndMethodReached,
      result,
      endInstanceIdPath,
      idleMethods,
      $__8,
      $__9,
      $__10,
      $__11,
      $__12,
      $__13,
      $__14;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          self.setWorkflow(workflow);
          createMethodReached = false;
          instanceIdPath = null;
          self._beginMethodWithCreateInstCallback = function(mn, ip) {
            if (mn === methodName) {
              createMethodReached = true;
              instanceIdPath = ip;
            }
          };
          self._createdOn = new Date();
          $ctx.state = 56;
          break;
        case 56:
          $ctx.pushTry(null, 48);
          $ctx.state = 50;
          break;
        case 50:
          $__8 = self._engine;
          $__9 = $__8.isIdle;
          $__10 = self._engine;
          $__11 = $__10.invoke;
          $__12 = $__11.call($__10);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__12;
        case 2:
          $__13 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__14 = $__9.call($__8, $__13);
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__14) ? 43 : 44;
          break;
        case 43:
          $ctx.state = (createMethodReached) ? 35 : 41;
          break;
        case 35:
          self._clearCallbacks();
          $ctx.state = 36;
          break;
        case 36:
          $ctx.state = (instanceIdPath) ? 13 : 12;
          break;
        case 13:
          if (is.undefined(self.id = self._host._instanceIdParser.parse(instanceIdPath, args))) {
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
          $ctx.state = (is.undefined(self.id)) ? 28 : 23;
          break;
        case 28:
          $ctx.state = (endInstanceIdPath) ? 24 : 26;
          break;
        case 24:
          if (is.undefined(self.id = self._host._instanceIdParser.parse(endInstanceIdPath, result))) {
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
              throw new errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
            }
          } else {
            if (idleMethods.length !== 0) {
              throw new errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
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
          $ctx.state = 48;
          $ctx.finallyFallThrough = -2;
          break;
        case 44:
          throw new errors.WorkflowError("Workflow has been completed without reaching an instance creator BeginMethod activity.");
          $ctx.state = 48;
          $ctx.finallyFallThrough = -2;
          break;
        case 48:
          $ctx.popTry();
          $ctx.state = 54;
          break;
        case 54:
          self._clearCallbacks();
          $ctx.state = 52;
          break;
        case 52:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__7, this);
}));
WorkflowInstance.prototype._enterLockForCreatedInstance = async($traceurRuntime.initGeneratorFunction(function $__15(lockInfo) {
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
  }, $__15, this);
}));
WorkflowInstance.prototype.setWorkflow = function(workflow, instanceId) {
  if (!(workflow instanceof Workflow)) {
    throw new TypeError("Workflow argument expected.");
  }
  this._engine = new ActivityExecutionEngine(workflow);
  this._addMyTrackers();
  if (is.defined(instanceId)) {
    this.id = instanceId;
  }
  this._copyParsFromHost();
};
WorkflowInstance.prototype.callMethod = async($traceurRuntime.initGeneratorFunction(function $__16(methodName, args) {
  var self,
      endMethodReached,
      result,
      idleMethods;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
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
          $ctx.state = 18;
          break;
        case 18:
          $ctx.pushTry(null, 10);
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
              throw new errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
            }
          } else {
            if (idleMethods.length !== 0) {
              throw new errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
            }
          }
          $ctx.state = 8;
          break;
        case 8:
          $ctx.returnValue = result;
          $ctx.state = 10;
          $ctx.finallyFallThrough = -2;
          break;
        case 10:
          $ctx.popTry();
          $ctx.state = 16;
          break;
        case 16:
          self._clearCallbacks();
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__16, this);
}));
WorkflowInstance.prototype._copyParsFromHost = function() {
  var $__3 = true;
  var $__4 = false;
  var $__5 = undefined;
  try {
    for (var $__1 = void 0,
        $__0 = (this._host._trackers)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
      var t = $__1.value;
      {
        this._engine.addTracker(t);
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
};
WorkflowInstance.prototype._addMyTrackers = function() {
  this._addBeginMethodWithCreateInstHelperTracker();
  this._addEndMethodHelperTracker();
  this._addIdleInstanceIdPathTracker();
};
WorkflowInstance.prototype._clearCallbacks = function() {
  this._beginMethodWithCreateInstCallback = null;
  this._endMethodCallback = null;
  this._idleInstanceIdPathCallback = null;
};
WorkflowInstance.prototype._addBeginMethodWithCreateInstHelperTracker = function() {
  var self = this;
  var tracker = {
    activityStateFilter: function(activity, reason, result) {
      return self._beginMethodWithCreateInstCallback && activity instanceof BeginMethod && activity.canCreateInstance && _(activity.methodName).isString() && (!activity.instanceIdPath || _(activity.instanceIdPath).isString()) && reason === enums.ActivityStates.idle;
    },
    activityStateChanged: function(activity, reason, result) {
      var methodName = activity.methodName.trim();
      var instanceIdPath = activity.instanceIdPath ? activity.instanceIdPath.trim() : null;
      self._beginMethodWithCreateInstCallback(methodName, instanceIdPath);
    }
  };
  self._engine.addTracker(tracker);
};
WorkflowInstance.prototype._addEndMethodHelperTracker = function() {
  var self = this;
  var tracker = {
    activityStateFilter: function(activity, reason, result) {
      return self._endMethodCallback && activity instanceof EndMethod && _(activity.methodName).isString() && (!activity.instanceIdPath || _(activity.instanceIdPath).isString()) && reason === enums.ActivityStates.complete;
    },
    activityStateChanged: function(activity, reason, result) {
      var methodName = activity.methodName.trim();
      var instanceIdPath = activity.instanceIdPath ? activity.instanceIdPath.trim() : null;
      self._endMethodCallback(methodName, instanceIdPath, result);
    }
  };
  self._engine.addTracker(tracker);
};
WorkflowInstance.prototype._addIdleInstanceIdPathTracker = function() {
  var self = this;
  var tracker = {
    activityStateFilter: function(activity, reason, result) {
      return self._idleInstanceIdPathCallback && activity instanceof BeginMethod && _(activity.methodName).isString() && _(activity.instanceIdPath).isString() && reason === enums.ActivityStates.idle;
    },
    activityStateChanged: function(activity, reason, result) {
      var methodName = activity.methodName.trim();
      var instanceIdPath = activity.instanceIdPath.trim();
      self._idleInstanceIdPathCallback(methodName, instanceIdPath);
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
    promotedProperties: sp.promotedProperties
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndvcmtmbG93SW5zdGFuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxXQUFXLENBQUM7QUFFWixBQUFJLEVBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyx3QkFBdUIsQ0FBQyxDQUFDO0FBQ2hELEFBQUksRUFBQSxDQUFBLHVCQUFzQixFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsdUNBQXNDLENBQUMsQ0FBQztBQUM5RSxBQUFJLEVBQUEsQ0FBQSxXQUFVLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQywyQkFBMEIsQ0FBQyxDQUFDO0FBQ3RELEFBQUksRUFBQSxDQUFBLFNBQVEsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLHlCQUF3QixDQUFDLENBQUM7QUFDbEQsQUFBSSxFQUFBLENBQUEsTUFBSyxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsa0JBQWlCLENBQUMsQ0FBQztBQUN4QyxBQUFJLEVBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxpQkFBZ0IsQ0FBQyxDQUFDO0FBQ3RDLEFBQUksRUFBQSxDQUFBLFdBQVUsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLHVCQUFzQixDQUFDLENBQUM7QUFDbEQsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsaUJBQWdCLENBQUMsQ0FBQztBQUN0QyxBQUFJLEVBQUEsQ0FBQSxPQUFNLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQztBQUNqQyxBQUFJLEVBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxjQUFhLENBQUMsQ0FBQztBQUNoQyxBQUFJLEVBQUEsQ0FBQSxZQUFXLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyx3QkFBdUIsQ0FBQyxDQUFDO0FBQ3BELEFBQUksRUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLFlBQVcsTUFBTSxDQUFDO0FBQzlCLEFBQUksRUFBQSxDQUFBLElBQUcsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO0FBRTFCLE9BQVMsaUJBQWUsQ0FBRSxJQUFHLENBQUc7QUFDNUIsS0FBRyxNQUFNLEVBQUksS0FBRyxDQUFDO0FBQ2pCLEtBQUcsR0FBRyxFQUFJLEtBQUcsQ0FBQztBQUNkLEtBQUcsUUFBUSxFQUFJLEtBQUcsQ0FBQztBQUNuQixLQUFHLFdBQVcsRUFBSSxLQUFHLENBQUM7QUFDdEIsS0FBRyxtQ0FBbUMsRUFBSSxLQUFHLENBQUM7QUFDOUMsS0FBRyxtQkFBbUIsRUFBSSxLQUFHLENBQUM7QUFDOUIsS0FBRyw0QkFBNEIsRUFBSSxLQUFHLENBQUM7QUFDM0M7QUFBQSxBQUVBLEtBQUssaUJBQWlCLEFBQUMsQ0FDbkIsZ0JBQWUsVUFBVSxDQUFHO0FBQ3hCLFVBQVEsQ0FBRyxFQUNQLEdBQUUsQ0FBRyxVQUFVLEFBQUQsQ0FBRztBQUNiLFdBQU8sQ0FBQSxJQUFHLFFBQVEsRUFBSSxDQUFBLElBQUcsUUFBUSxVQUFVLEVBQUksS0FBRyxDQUFDO0lBQ3ZELENBQ0o7QUFDQSxhQUFXLENBQUcsRUFDVixHQUFFLENBQUcsVUFBVSxBQUFELENBQUc7QUFDYixXQUFPLENBQUEsSUFBRyxRQUFRLEVBQUksQ0FBQSxJQUFHLFFBQVEsYUFBYSxLQUFLLEtBQUssQUFBQyxFQUFDLENBQUEsQ0FBSSxLQUFHLENBQUM7SUFDdEUsQ0FDSjtBQUNBLGdCQUFjLENBQUcsRUFDYixHQUFFLENBQUcsVUFBVSxBQUFELENBQUc7QUFDYixXQUFPLENBQUEsSUFBRyxRQUFRLEVBQUksQ0FBQSxJQUFHLFFBQVEsYUFBYSxRQUFRLEVBQUksS0FBRyxDQUFDO0lBQ2xFLENBQ0o7QUFDQSxVQUFRLENBQUcsRUFDUCxHQUFFLENBQUcsVUFBVSxBQUFELENBQUc7QUFDYixXQUFPLENBQUEsSUFBRyxXQUFXLENBQUM7SUFDMUIsQ0FDSjtBQUNBLFVBQVEsQ0FBRyxFQUNQLEdBQUUsQ0FBRyxVQUFVLEFBQUQsQ0FBRztBQUNiLFdBQU8sQ0FBQSxJQUFHLFFBQVEsRUFBSSxDQUFBLElBQUcsUUFBUSxVQUFVLEVBQUksS0FBRyxDQUFDO0lBQ3ZELENBQ0o7QUFBQSxBQUNKLENBQUMsQ0FBQztBQUVOLGVBQWUsVUFBVSxPQUFPLEVBQUksQ0FBQSxLQUFJLEFBQUMsQ0F4RHpDLGVBQWMsc0JBQXNCLEFBQUMsQ0F5RGpDLGNBQVcsUUFBTyxDQUFHLENBQUEsVUFBUyxDQUFHLENBQUEsSUFBRyxDQUFHLENBQUEsUUFBTzs7Ozs7Ozs7Ozs7Ozs7O0FBekRsRCxPQUFPLENBQVAsZUFBYyx3QkFBd0IsQUFBZCxDQUF4QixTQUFTLElBQUcsQ0FBRztBQUNULFVBQU8sSUFBRzs7O2VBeURHLEtBQUc7QUFFZCxhQUFHLFlBQVksQUFBQyxDQUFDLFFBQU8sQ0FBQyxDQUFDOzhCQUVBLE1BQUk7eUJBQ1QsS0FBRztBQUN4QixhQUFHLG1DQUFtQyxFQUFJLFVBQVUsRUFBQyxDQUFHLENBQUEsRUFBQyxDQUFHO0FBQ3hELGVBQUksRUFBQyxJQUFNLFdBQVMsQ0FBRztBQUNuQixnQ0FBa0IsRUFBSSxLQUFHLENBQUM7QUFDMUIsMkJBQWEsRUFBSSxHQUFDLENBQUM7WUFDdkI7QUFBQSxVQUNKLENBQUM7QUFFRCxhQUFHLFdBQVcsRUFBSSxJQUFJLEtBQUcsQUFBQyxFQUFDLENBQUM7Ozs7QUF2RXBDLGFBQUcsUUFBUSxBQUFDLFVBRWlCLENBQUM7Ozs7ZUF3RWQsQ0FBQSxJQUFHLFFBQVE7ZUFBWCxZQUFrQjtnQkFBUSxDQUFBLElBQUcsUUFBUTtnQkFBWCxhQUFrQjtnQkFBbEIsV0FBbUIsT0FBQzs7Ozs7QUExRTlELHNCQUF1Qjs7Z0JBQXZCLENBQUEsSUFBRyxLQUFLOzs7O2dCQTBFUSxVQUFtQixhQUE0Qjs7OztBQTFFL0QsYUFBRyxNQUFNLEVBQUksQ0FBQSxPQUFrQixVQUF3QyxDQUFDO0FBQ2hFLGVBQUk7O0FBRFosYUFBRyxNQUFNLEVBQUksQ0FBQSxDQTJFTyxtQkFBa0IsQ0EzRVAsVUFBd0MsQ0FBQztBQUNoRSxlQUFJOztBQTJFUSxhQUFHLGdCQUFnQixBQUFDLEVBQUMsQ0FBQzs7OztBQTVFMUMsYUFBRyxNQUFNLEVBQUksQ0FBQSxDQThFVyxjQUFhLENBOUVOLFVBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUE4RVksYUFBSSxFQUFDLFVBQVUsQUFBQyxDQUFDLElBQUcsR0FBRyxFQUFJLENBQUEsSUFBRyxNQUFNLGtCQUFrQixNQUFNLEFBQUMsQ0FBQyxjQUFhLENBQUcsS0FBRyxDQUFDLENBQUMsQ0FBRztBQUNsRixnQkFBTSxJQUFJLENBQUEsTUFBSyxjQUFjLEFBQUMsQ0FBQyw2Q0FBNEMsRUFBSSxlQUFhLENBQUEsQ0FBSSw2QkFBMkIsQ0FBQSxDQUFJLFdBQVMsQ0FBQSxDQUFJLEtBQUcsQ0FBQyxDQUFDO1VBQ3JKO0FBQUE7Ozs7QUFqRnhCLGVBa0Y4QixFQUFDLElBQUcsNkJBQTZCLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQyxDQWxGbkQ7O0FBQXZCLGFBQUcsV0FBVyxBQUFDLEVBQUMsQ0FBQTs7OztpQ0FxRmlDLE1BQUk7NEJBRVQsS0FBRztBQUMzQixhQUFHLG1CQUFtQixFQUNsQixVQUFVLEVBQUMsQ0FBRyxDQUFBLEVBQUMsQ0FBRyxDQUFBLENBQUEsQ0FBRztBQUNqQixlQUFJLEVBQUMsSUFBTSxXQUFTLENBQUc7QUFDbkIsbUNBQXFCLEVBQUksS0FBRyxDQUFDO0FBQzdCLDhCQUFnQixFQUFJLEdBQUMsQ0FBQztBQUN0QixtQkFBSyxFQUFJLEVBQUEsQ0FBQztZQUNkO0FBQUEsVUFDSixDQUFDO3NCQUVhLEdBQUM7QUFDbkIsYUFBRyw0QkFBNEIsRUFDM0IsVUFBVSxFQUFDLENBQUcsQ0FBQSxFQUFDLENBQUc7QUFDZCxzQkFBVSxLQUFLLEFBQUMsQ0FDWjtBQUNJLHVCQUFTLENBQUcsR0FBQztBQUNiLDJCQUFhLENBQUcsR0FBQztBQUFBLFlBQ3JCLENBQUMsQ0FBQztVQUNWLENBQUM7Ozs7O0FBekd6QixlQTJHMEIsRUFBQyxJQUFHLFFBQVEsZUFBZSxBQUFDLENBQUMsV0FBVSxRQUFRLHdCQUF3QixBQUFDLENBQUMsVUFBUyxDQUFDLENBQUcsQ0FBQSxLQUFJLGVBQWUsU0FBUyxDQUFHLEtBQUcsQ0FBQyxDQUFDLENBM0c3SDs7QUFBdkIsYUFBRyxXQUFXLEFBQUMsRUFBQyxDQUFBOzs7O0FBQWhCLGFBQUcsTUFBTSxFQUFJLENBQUEsQ0E2R1csc0JBQXFCLENBN0dkLFVBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUFEWixhQUFHLE1BQU0sRUFBSSxDQUFBLENBOEdlLEVBQUMsVUFBVSxBQUFDLENBQUMsSUFBRyxHQUFHLENBQUMsQ0E5R2pCLFVBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUFEWixhQUFHLE1BQU0sRUFBSSxDQUFBLENBK0dtQixpQkFBZ0IsQ0EvR2pCLFVBQXdDLENBQUM7QUFDaEUsZUFBSTs7QUErR29CLGFBQUksRUFBQyxVQUFVLEFBQUMsQ0FBQyxJQUFHLEdBQUcsRUFBSSxDQUFBLElBQUcsTUFBTSxrQkFBa0IsTUFBTSxBQUFDLENBQUMsaUJBQWdCLENBQUcsT0FBSyxDQUFDLENBQUMsQ0FBRztBQUN2RixnQkFBTSxJQUFJLENBQUEsTUFBSyxjQUFjLEFBQUMsQ0FBQyw0Q0FBMkMsRUFBSSxlQUFhLENBQUEsQ0FBSSw2QkFBMkIsQ0FBQSxDQUFJLFdBQVMsQ0FBQSxDQUFJLEtBQUcsQ0FBQyxDQUFDO1VBQ3BKO0FBQUE7Ozs7QUFsSGhDLGVBbUhzQyxDQUFBLElBQUcsNkJBQTZCLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FuSHpEOztBQUF2QixhQUFHLFdBQVcsQUFBQyxFQUFDLENBQUE7Ozs7QUFzSGdCLGNBQU0sSUFBSSxDQUFBLE1BQUssY0FBYyxBQUFDLENBQUMsc0NBQXFDLEVBQUksV0FBUyxDQUFBLENBQUksc0RBQW9ELENBQUMsQ0FBQzs7OztBQUtuSixjQUFNLElBQUksQ0FBQSxNQUFLLGNBQWMsQUFBQyxDQUFDLGdHQUErRixFQUFJLFdBQVMsQ0FBQSxDQUFJLEtBQUcsQ0FBQyxDQUFDOzs7O0FBR3hKLGFBQUksSUFBRyxVQUFVLElBQU0sQ0FBQSxLQUFJLGVBQWUsS0FBSyxDQUFHO0FBQzlDLGVBQUksV0FBVSxPQUFPLElBQU0sRUFBQSxDQUFHO0FBQzFCLGtCQUFNLElBQUksQ0FBQSxNQUFLLGNBQWMsQUFBQyxDQUFDLGdKQUErSSxDQUFDLENBQUM7WUFDcEw7QUFBQSxVQUNKLEtBQ0s7QUFDRCxlQUFJLFdBQVUsT0FBTyxJQUFNLEVBQUEsQ0FBRztBQUMxQixrQkFBTSxJQUFJLENBQUEsTUFBSyxjQUFjLEFBQUMsQ0FBQywwSUFBeUksQ0FBQyxDQUFDO1lBQzlLO0FBQUEsVUFDSjtBQUFBOzs7QUF2SXBCLGFBQUcsWUFBWSxFQXlJWSxPQUFLLEFBeklHLENBQUE7O0FBQW5DLGFBQUcsbUJBQW1CLEtBQW9CLENBQUE7OztBQTRJdEIsY0FBTSxJQUFJLENBQUEsTUFBSyxjQUFjLEFBQUMsQ0FBQyxpR0FBZ0csRUFBSSxXQUFTLENBQUEsQ0FBSSxLQUFHLENBQUMsQ0FBQzs7QUE1SXpLLGFBQUcsbUJBQW1CLEtBQW9CLENBQUE7OztBQWdKMUIsY0FBTSxJQUFJLENBQUEsTUFBSyxjQUFjLEFBQUMsQ0FBQyx3RkFBdUYsQ0FBQyxDQUFDOztBQWhKeEksYUFBRyxtQkFBbUIsS0FBb0IsQ0FBQTs7O0FBQTFDLGFBQUcsT0FBTyxBQUFDLEVBQUMsQ0FBQzs7OztBQW9KRCxhQUFHLGdCQUFnQixBQUFDLEVBQUMsQ0FBQzs7OztBQW5KWixhQUFHLE1BQU0sRUFBSSxDQUFBLElBQUcsbUJBQW1CLENBQUM7QUFDcEMsZUFBSzs7QUFGM0IsZUFBTyxDQUFBLElBQUcsSUFBSSxBQUFDLEVBQUMsQ0FBQTs7QUFDbUIsRUFDL0IsT0FBNkIsS0FBRyxDQUFDLENBQUM7QUFvSmxDLENBdEptRCxDQXNKbEQsQ0FBQztBQUVOLGVBQWUsVUFBVSw2QkFBNkIsRUFBSSxDQUFBLEtBQUksQUFBQyxDQXhKL0QsZUFBYyxzQkFBc0IsQUFBQyxDQXlKakMsZUFBVyxRQUFPO0FBekp0QixPQUFPLENBQVAsZUFBYyx3QkFBd0IsQUFBZCxDQUF4QixTQUFTLElBQUcsQ0FBRztBQUNULFVBQU8sSUFBRzs7O0FBRGhCLGFBQUcsTUFBTSxFQUFJLENBQUEsQ0EwSkQsUUFBTyxDQTFKWSxTQUF3QyxDQUFDO0FBQ2hFLGVBQUk7OztBQURaLGVBMkprQixDQUFBLElBQUcsTUFBTSw2QkFBNkIsQUFBQyxDQUFDLElBQUcsQ0FBRyxTQUFPLENBQUMsQ0EzSmpEOztBQUF2QixhQUFHLFdBQVcsQUFBQyxFQUFDLENBQUE7Ozs7QUFBaEIsZUFBTyxDQUFBLElBQUcsSUFBSSxBQUFDLEVBQUMsQ0FBQTs7QUFDbUIsRUFDL0IsUUFBNkIsS0FBRyxDQUFDLENBQUM7QUEySmxDLENBN0ptRCxDQTZKbEQsQ0FBQztBQUVOLGVBQWUsVUFBVSxZQUFZLEVBQUksVUFBVSxRQUFPLENBQUcsQ0FBQSxVQUFTLENBQUc7QUFDckUsS0FBSSxDQUFDLENBQUMsUUFBTyxXQUFhLFNBQU8sQ0FBQyxDQUFHO0FBQ2pDLFFBQU0sSUFBSSxVQUFRLEFBQUMsQ0FBQyw2QkFBNEIsQ0FBQyxDQUFDO0VBQ3REO0FBQUEsQUFDQSxLQUFHLFFBQVEsRUFBSSxJQUFJLHdCQUFzQixBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDcEQsS0FBRyxlQUFlLEFBQUMsRUFBQyxDQUFDO0FBQ3JCLEtBQUksRUFBQyxRQUFRLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBRztBQUN4QixPQUFHLEdBQUcsRUFBSSxXQUFTLENBQUM7RUFDeEI7QUFBQSxBQUNBLEtBQUcsa0JBQWtCLEFBQUMsRUFBQyxDQUFDO0FBQzVCLENBQUM7QUFFRCxlQUFlLFVBQVUsV0FBVyxFQUFJLENBQUEsS0FBSSxBQUFDLENBM0s3QyxlQUFjLHNCQUFzQixBQUFDLENBNEtqQyxlQUFXLFVBQVMsQ0FBRyxDQUFBLElBQUc7Ozs7O0FBNUs5QixPQUFPLENBQVAsZUFBYyx3QkFBd0IsQUFBZCxDQUF4QixTQUFTLElBQUcsQ0FBRztBQUNULFVBQU8sSUFBRzs7O2VBNEtHLEtBQUc7MkJBRVMsTUFBSTtpQkFDZCxLQUFHO0FBQ2hCLGFBQUcsbUJBQW1CLEVBQ2xCLFVBQVUsRUFBQyxDQUFHLENBQUEsRUFBQyxDQUFHLENBQUEsQ0FBQSxDQUFHO0FBQ2pCLGVBQUksRUFBQyxJQUFNLFdBQVMsQ0FBRztBQUNuQiw2QkFBZSxFQUFJLEtBQUcsQ0FBQztBQUN2QixtQkFBSyxFQUFJLEVBQUEsQ0FBQztZQUNkO0FBQUEsVUFDSixDQUFDO3NCQUVhLEdBQUM7QUFDbkIsYUFBRyw0QkFBNEIsRUFDM0IsVUFBVSxFQUFDLENBQUcsQ0FBQSxFQUFDLENBQUc7QUFDZCxzQkFBVSxLQUFLLEFBQUMsQ0FDWjtBQUNJLHVCQUFTLENBQUcsR0FBQztBQUNiLDJCQUFhLENBQUcsR0FBQztBQUFBLFlBQ3JCLENBQUMsQ0FBQztVQUNWLENBQUM7Ozs7QUFqTWIsYUFBRyxRQUFRLEFBQUMsVUFFaUIsQ0FBQzs7Ozs7QUFGOUIsZUFvTWtCLENBQUEsSUFBRyxRQUFRLGVBQWUsQUFBQyxDQUFDLFdBQVUsUUFBUSx3QkFBd0IsQUFBQyxDQUFDLFVBQVMsQ0FBQyxDQUFHLENBQUEsS0FBSSxlQUFlLFNBQVMsQ0FBRyxLQUFHLENBQUMsQ0FwTW5IOztBQUF2QixhQUFHLFdBQVcsQUFBQyxFQUFDLENBQUE7Ozs7QUFzTUosYUFBSSxDQUFDLGdCQUFlLENBQUc7QUFDbkIsZ0JBQU0sSUFBSSxDQUFBLE1BQUssY0FBYyxBQUFDLENBQUMscUdBQW9HLEVBQUksV0FBUyxDQUFBLENBQUksS0FBRyxDQUFDLENBQUM7VUFDN0o7QUFBQSxBQUVBLGFBQUksSUFBRyxVQUFVLElBQU0sQ0FBQSxLQUFJLGVBQWUsS0FBSyxDQUFHO0FBQzlDLGVBQUksV0FBVSxPQUFPLElBQU0sRUFBQSxDQUFHO0FBQzFCLGtCQUFNLElBQUksQ0FBQSxNQUFLLGNBQWMsQUFBQyxDQUFDLGdKQUErSSxDQUFDLENBQUM7WUFDcEw7QUFBQSxVQUNKLEtBQ0s7QUFDRCxlQUFJLFdBQVUsT0FBTyxJQUFNLEVBQUEsQ0FBRztBQUMxQixrQkFBTSxJQUFJLENBQUEsTUFBSyxjQUFjLEFBQUMsQ0FBQywwSUFBeUksQ0FBQyxDQUFDO1lBQzlLO0FBQUEsVUFDSjtBQUFBOzs7QUFuTlosYUFBRyxZQUFZLEVBcU5JLE9BQUssQUFyTlcsQ0FBQTs7QUFBbkMsYUFBRyxtQkFBbUIsS0FBb0IsQ0FBQTs7O0FBQTFDLGFBQUcsT0FBTyxBQUFDLEVBQUMsQ0FBQzs7OztBQXdORCxhQUFHLGdCQUFnQixBQUFDLEVBQUMsQ0FBQzs7OztBQXZOWixhQUFHLE1BQU0sRUFBSSxDQUFBLElBQUcsbUJBQW1CLENBQUM7QUFDcEMsZUFBSzs7QUFGM0IsZUFBTyxDQUFBLElBQUcsSUFBSSxBQUFDLEVBQUMsQ0FBQTs7QUFDbUIsRUFDL0IsUUFBNkIsS0FBRyxDQUFDLENBQUM7QUF3TmxDLENBMU5tRCxDQTBObEQsQ0FBQztBQUVOLGVBQWUsVUFBVSxrQkFBa0IsRUFBSSxVQUFVLEFBQUQ7QUEzTmhELEFBQUksSUFBQSxPQUFvQixLQUFHLENBQUM7QUFDNUIsQUFBSSxJQUFBLE9BQW9CLE1BQUksQ0FBQztBQUM3QixBQUFJLElBQUEsT0FBb0IsVUFBUSxDQUFDO0FBQ2pDLElBQUk7QUFISixRQUFTLEdBQUEsT0FEakIsS0FBSyxFQUFBLEFBQzRCO0FBQ2hCLGFBQW9CLENBQUEsQ0EyTm5CLElBQUcsTUFBTSxVQUFVLENBM05rQixDQUNsQyxlQUFjLFdBQVcsQUFBQyxDQUFDLE1BQUssU0FBUyxDQUFDLENBQUMsQUFBQyxFQUFDLENBQ3JELEVBQUMsQ0FBQyxNQUFvQixDQUFBLENBQUMsTUFBb0IsQ0FBQSxTQUFxQixBQUFDLEVBQUMsQ0FBQyxLQUFLLENBQUMsQ0FDekUsT0FBb0IsS0FBRyxDQUFHO1FBd04xQixFQUFBO0FBQTJCO0FBQ2hDLFdBQUcsUUFBUSxXQUFXLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztNQUM5QjtJQXZOSTtBQUFBLEVBRkEsQ0FBRSxZQUEwQjtBQUMxQixTQUFvQixLQUFHLENBQUM7QUFDeEIsY0FBb0MsQ0FBQztFQUN2QyxDQUFFLE9BQVE7QUFDUixNQUFJO0FBQ0YsU0FBSSxLQUFpQixHQUFLLENBQUEsV0FBdUIsR0FBSyxLQUFHLENBQUc7QUFDMUQsa0JBQXdCLEFBQUMsRUFBQyxDQUFDO01BQzdCO0FBQUEsSUFDRixDQUFFLE9BQVE7QUFDUixjQUF3QjtBQUN0QixrQkFBd0I7TUFDMUI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEFBNk1SLENBQUM7QUFFRCxlQUFlLFVBQVUsZUFBZSxFQUFJLFVBQVUsQUFBRCxDQUFHO0FBQ3BELEtBQUcsMkNBQTJDLEFBQUMsRUFBQyxDQUFDO0FBQ2pELEtBQUcsMkJBQTJCLEFBQUMsRUFBQyxDQUFDO0FBQ2pDLEtBQUcsOEJBQThCLEFBQUMsRUFBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxlQUFlLFVBQVUsZ0JBQWdCLEVBQUksVUFBVSxBQUFELENBQUc7QUFDckQsS0FBRyxtQ0FBbUMsRUFBSSxLQUFHLENBQUM7QUFDOUMsS0FBRyxtQkFBbUIsRUFBSSxLQUFHLENBQUM7QUFDOUIsS0FBRyw0QkFBNEIsRUFBSSxLQUFHLENBQUM7QUFDM0MsQ0FBQztBQUVELGVBQWUsVUFBVSwyQ0FBMkMsRUFBSSxVQUFVLEFBQUQsQ0FBRztBQUNoRixBQUFJLElBQUEsQ0FBQSxJQUFHLEVBQUksS0FBRyxDQUFDO0FBQ2YsQUFBSSxJQUFBLENBQUEsT0FBTSxFQUFJO0FBQ1Ysc0JBQWtCLENBQUcsVUFBVSxRQUFPLENBQUcsQ0FBQSxNQUFLLENBQUcsQ0FBQSxNQUFLLENBQUc7QUFDckQsV0FBTyxDQUFBLElBQUcsbUNBQW1DLEdBQ3pDLENBQUEsUUFBTyxXQUFhLFlBQVUsQ0FBQSxFQUM5QixDQUFBLFFBQU8sa0JBQWtCLENBQUEsRUFDekIsQ0FBQSxDQUFBLEFBQUMsQ0FBQyxRQUFPLFdBQVcsQ0FBQyxTQUFTLEFBQUMsRUFBQyxDQUFBLEVBQ2hDLEVBQUMsQ0FBQyxRQUFPLGVBQWUsQ0FBQSxFQUFLLENBQUEsQ0FBQSxBQUFDLENBQUMsUUFBTyxlQUFlLENBQUMsU0FBUyxBQUFDLEVBQUMsQ0FBQyxDQUFBLEVBQ2xFLENBQUEsTUFBSyxJQUFNLENBQUEsS0FBSSxlQUFlLEtBQUssQ0FBQztJQUM1QztBQUNBLHVCQUFtQixDQUFHLFVBQVUsUUFBTyxDQUFHLENBQUEsTUFBSyxDQUFHLENBQUEsTUFBSyxDQUFHO0FBQ3RELEFBQUksUUFBQSxDQUFBLFVBQVMsRUFBSSxDQUFBLFFBQU8sV0FBVyxLQUFLLEFBQUMsRUFBQyxDQUFDO0FBQzNDLEFBQUksUUFBQSxDQUFBLGNBQWEsRUFBSSxDQUFBLFFBQU8sZUFBZSxFQUFJLENBQUEsUUFBTyxlQUFlLEtBQUssQUFBQyxFQUFDLENBQUEsQ0FBSSxLQUFHLENBQUM7QUFDcEYsU0FBRyxtQ0FBbUMsQUFBQyxDQUFDLFVBQVMsQ0FBRyxlQUFhLENBQUMsQ0FBQztJQUN2RTtBQUFBLEVBQ0osQ0FBQztBQUNELEtBQUcsUUFBUSxXQUFXLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsZUFBZSxVQUFVLDJCQUEyQixFQUFJLFVBQVUsQUFBRCxDQUFHO0FBQ2hFLEFBQUksSUFBQSxDQUFBLElBQUcsRUFBSSxLQUFHLENBQUM7QUFDZixBQUFJLElBQUEsQ0FBQSxPQUFNLEVBQUk7QUFDVixzQkFBa0IsQ0FBRyxVQUFVLFFBQU8sQ0FBRyxDQUFBLE1BQUssQ0FBRyxDQUFBLE1BQUssQ0FBRztBQUNyRCxXQUFPLENBQUEsSUFBRyxtQkFBbUIsR0FDekIsQ0FBQSxRQUFPLFdBQWEsVUFBUSxDQUFBLEVBQzVCLENBQUEsQ0FBQSxBQUFDLENBQUMsUUFBTyxXQUFXLENBQUMsU0FBUyxBQUFDLEVBQUMsQ0FBQSxFQUNoQyxFQUFDLENBQUMsUUFBTyxlQUFlLENBQUEsRUFBSyxDQUFBLENBQUEsQUFBQyxDQUFDLFFBQU8sZUFBZSxDQUFDLFNBQVMsQUFBQyxFQUFDLENBQUMsQ0FBQSxFQUNsRSxDQUFBLE1BQUssSUFBTSxDQUFBLEtBQUksZUFBZSxTQUFTLENBQUM7SUFDaEQ7QUFDQSx1QkFBbUIsQ0FBRyxVQUFVLFFBQU8sQ0FBRyxDQUFBLE1BQUssQ0FBRyxDQUFBLE1BQUssQ0FBRztBQUN0RCxBQUFJLFFBQUEsQ0FBQSxVQUFTLEVBQUksQ0FBQSxRQUFPLFdBQVcsS0FBSyxBQUFDLEVBQUMsQ0FBQztBQUMzQyxBQUFJLFFBQUEsQ0FBQSxjQUFhLEVBQUksQ0FBQSxRQUFPLGVBQWUsRUFBSSxDQUFBLFFBQU8sZUFBZSxLQUFLLEFBQUMsRUFBQyxDQUFBLENBQUksS0FBRyxDQUFDO0FBQ3BGLFNBQUcsbUJBQW1CLEFBQUMsQ0FBQyxVQUFTLENBQUcsZUFBYSxDQUFHLE9BQUssQ0FBQyxDQUFDO0lBQy9EO0FBQUEsRUFDSixDQUFDO0FBQ0QsS0FBRyxRQUFRLFdBQVcsQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxlQUFlLFVBQVUsOEJBQThCLEVBQUksVUFBVSxBQUFELENBQUc7QUFDbkUsQUFBSSxJQUFBLENBQUEsSUFBRyxFQUFJLEtBQUcsQ0FBQztBQUNmLEFBQUksSUFBQSxDQUFBLE9BQU0sRUFBSTtBQUNWLHNCQUFrQixDQUFHLFVBQVUsUUFBTyxDQUFHLENBQUEsTUFBSyxDQUFHLENBQUEsTUFBSyxDQUFHO0FBQ3JELFdBQU8sQ0FBQSxJQUFHLDRCQUE0QixHQUNsQyxDQUFBLFFBQU8sV0FBYSxZQUFVLENBQUEsRUFDOUIsQ0FBQSxDQUFBLEFBQUMsQ0FBQyxRQUFPLFdBQVcsQ0FBQyxTQUFTLEFBQUMsRUFBQyxDQUFBLEVBQ2hDLENBQUEsQ0FBQSxBQUFDLENBQUMsUUFBTyxlQUFlLENBQUMsU0FBUyxBQUFDLEVBQUMsQ0FBQSxFQUNwQyxDQUFBLE1BQUssSUFBTSxDQUFBLEtBQUksZUFBZSxLQUFLLENBQUM7SUFDNUM7QUFDQSx1QkFBbUIsQ0FBRyxVQUFVLFFBQU8sQ0FBRyxDQUFBLE1BQUssQ0FBRyxDQUFBLE1BQUssQ0FBRztBQUN0RCxBQUFJLFFBQUEsQ0FBQSxVQUFTLEVBQUksQ0FBQSxRQUFPLFdBQVcsS0FBSyxBQUFDLEVBQUMsQ0FBQztBQUMzQyxBQUFJLFFBQUEsQ0FBQSxjQUFhLEVBQUksQ0FBQSxRQUFPLGVBQWUsS0FBSyxBQUFDLEVBQUMsQ0FBQztBQUNuRCxTQUFHLDRCQUE0QixBQUFDLENBQUMsVUFBUyxDQUFHLGVBQWEsQ0FBQyxDQUFDO0lBQ2hFO0FBQUEsRUFDSixDQUFDO0FBQ0QsS0FBRyxRQUFRLFdBQVcsQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxlQUFlLFVBQVUsa0JBQWtCLEVBQUksVUFBVSxBQUFELENBQUc7QUFDdkQsQUFBSSxJQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsSUFBRyxRQUFRLHNCQUFzQixBQUFDLENBQUMsSUFBRyxNQUFNLFFBQVEsV0FBVyxDQUFHLENBQUEsSUFBRyxNQUFNLFFBQVEsaUJBQWlCLENBQUMsQ0FBQztBQUMvRyxPQUFPO0FBQ0gsYUFBUyxDQUFHLENBQUEsSUFBRyxHQUFHO0FBQ2xCLFlBQVEsQ0FBRyxDQUFBLElBQUcsVUFBVTtBQUN4QixlQUFXLENBQUcsQ0FBQSxJQUFHLGFBQWE7QUFDOUIsa0JBQWMsQ0FBRyxDQUFBLElBQUcsZ0JBQWdCO0FBQ3BDLFlBQVEsQ0FBRyxDQUFBLElBQUcsUUFBUSxVQUFVO0FBQ2hDLFFBQUksQ0FBRyxDQUFBLEVBQUMsTUFBTTtBQUNkLHFCQUFpQixDQUFHLENBQUEsRUFBQyxtQkFBbUI7QUFBQSxFQUM1QyxDQUFDO0FBQ0wsQ0FBQztBQUVELGVBQWUsVUFBVSxhQUFhLEVBQUksVUFBVSxJQUFHLENBQUc7QUFDdEQsS0FBSSxDQUFDLENBQUEsU0FBUyxBQUFDLENBQUMsSUFBRyxDQUFDLENBQUc7QUFDbkIsUUFBTSxJQUFJLFVBQVEsQUFBQyxDQUFDLG1DQUFrQyxDQUFDLENBQUM7RUFDNUQ7QUFBQSxBQUNBLEtBQUksSUFBRyxXQUFXLElBQU0sQ0FBQSxJQUFHLEdBQUcsQ0FBRztBQUM3QixRQUFNLElBQUksTUFBSSxBQUFDLENBQUMsc0NBQXFDLEVBQUksQ0FBQSxJQUFHLFdBQVcsQ0FBQSxDQUFJLGdEQUE4QyxDQUFBLENBQUksQ0FBQSxJQUFHLEdBQUcsQ0FBQSxDQUFJLEtBQUcsQ0FBQyxDQUFDO0VBQ2hKO0FBQUEsQUFDQSxLQUFJLElBQUcsYUFBYSxJQUFNLENBQUEsSUFBRyxhQUFhLENBQUc7QUFDekMsUUFBTSxJQUFJLE1BQUksQUFBQyxDQUFDLHdDQUF1QyxFQUFJLENBQUEsSUFBRyxhQUFhLENBQUEsQ0FBSSxrREFBZ0QsQ0FBQSxDQUFJLENBQUEsSUFBRyxhQUFhLENBQUEsQ0FBSSxLQUFHLENBQUMsQ0FBQztFQUNoSztBQUFBLEFBQ0EsS0FBSSxJQUFHLGdCQUFnQixJQUFNLENBQUEsSUFBRyxnQkFBZ0IsQ0FBRztBQUMvQyxRQUFNLElBQUksTUFBSSxBQUFDLENBQUMsd0NBQXVDLEVBQUksQ0FBQSxJQUFHLGdCQUFnQixDQUFBLENBQUkscURBQW1ELENBQUEsQ0FBSSxDQUFBLElBQUcsZ0JBQWdCLENBQUEsQ0FBSSxLQUFHLENBQUMsQ0FBQztFQUN6SztBQUFBLEFBQ0EsS0FBSSxDQUFDLENBQUEsT0FBTyxBQUFDLENBQUMsSUFBRyxVQUFVLENBQUMsQ0FBRztBQUMzQixRQUFNLElBQUksTUFBSSxBQUFDLENBQUMscUNBQW9DLEVBQUksQ0FBQSxJQUFHLFVBQVUsQ0FBQSxDQUFJLG1CQUFpQixDQUFDLENBQUM7RUFDaEc7QUFBQSxBQUVBLEtBQUcsV0FBVyxFQUFJLENBQUEsSUFBRyxVQUFVLENBQUM7QUFDaEMsS0FBRyxRQUFRLFNBQVMsQUFBQyxDQUFDLElBQUcsTUFBTSxRQUFRLFdBQVcsQ0FBRyxDQUFBLElBQUcsTUFBTSxDQUFDLENBQUM7QUFDcEUsQ0FBQztBQUVELEtBQUssUUFBUSxFQUFJLGlCQUFlLENBQUM7QUFDakMiLCJmaWxlIjoiaG9zdGluZy93b3JrZmxvd0luc3RhbmNlLmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubGV0IFdvcmtmbG93ID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvd29ya2Zsb3dcIik7XG5sZXQgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy9hY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZVwiKTtcbmxldCBCZWdpbk1ldGhvZCA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL2JlZ2luTWV0aG9kXCIpO1xubGV0IEVuZE1ldGhvZCA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL2VuZE1ldGhvZFwiKTtcbmxldCBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcbmxldCBlbnVtcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZW51bXNcIik7XG5sZXQgc3BlY1N0cmluZ3MgPSByZXF1aXJlKFwiLi4vY29tbW9uL3NwZWNTdHJpbmdzXCIpO1xubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xubGV0IGd1aWRzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9ndWlkc1wiKTtcbmxldCBQcm9taXNlID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBhc3luY0hlbHBlcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2FzeW5jSGVscGVyc1wiKTtcbmxldCBhc3luYyA9IGFzeW5jSGVscGVycy5hc3luYztcbmxldCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5cbmZ1bmN0aW9uIFdvcmtmbG93SW5zdGFuY2UoaG9zdCkge1xuICAgIHRoaXMuX2hvc3QgPSBob3N0O1xuICAgIHRoaXMuaWQgPSBudWxsO1xuICAgIHRoaXMuX2VuZ2luZSA9IG51bGw7XG4gICAgdGhpcy5fY3JlYXRlZE9uID0gbnVsbDtcbiAgICB0aGlzLl9iZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0Q2FsbGJhY2sgPSBudWxsO1xuICAgIHRoaXMuX2VuZE1ldGhvZENhbGxiYWNrID0gbnVsbDtcbiAgICB0aGlzLl9pZGxlSW5zdGFuY2VJZFBhdGhDYWxsYmFjayA9IG51bGw7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFxuICAgIFdvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLCB7XG4gICAgICAgIGV4ZWNTdGF0ZToge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2VuZ2luZSA/IHRoaXMuX2VuZ2luZS5leGVjU3RhdGUgOiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB3b3JrZmxvd05hbWU6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUgPyB0aGlzLl9lbmdpbmUucm9vdEFjdGl2aXR5Lm5hbWUudHJpbSgpIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgd29ya2Zsb3dWZXJzaW9uOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZW5naW5lID8gdGhpcy5fZW5naW5lLnJvb3RBY3Rpdml0eS52ZXJzaW9uIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZE9uOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlZE9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGVkT246IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUgPyB0aGlzLl9lbmdpbmUudXBkYXRlZE9uIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5jcmVhdGUgPSBhc3luYyhcbiAgICBmdW5jdGlvbiogKHdvcmtmbG93LCBtZXRob2ROYW1lLCBhcmdzLCBsb2NrSW5mbykge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgc2VsZi5zZXRXb3JrZmxvdyh3b3JrZmxvdyk7XG5cbiAgICAgICAgbGV0IGNyZWF0ZU1ldGhvZFJlYWNoZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IGluc3RhbmNlSWRQYXRoID0gbnVsbDtcbiAgICAgICAgc2VsZi5fYmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdENhbGxiYWNrID0gZnVuY3Rpb24gKG1uLCBpcCkge1xuICAgICAgICAgICAgaWYgKG1uID09PSBtZXRob2ROYW1lKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlTWV0aG9kUmVhY2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGggPSBpcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBzZWxmLl9jcmVhdGVkT24gPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5fZW5naW5lLmlzSWRsZSh5aWVsZCBzZWxmLl9lbmdpbmUuaW52b2tlKCkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNyZWF0ZU1ldGhvZFJlYWNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fY2xlYXJDYWxsYmFja3MoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2VJZFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpcy51bmRlZmluZWQoc2VsZi5pZCA9IHNlbGYuX2hvc3QuX2luc3RhbmNlSWRQYXJzZXIucGFyc2UoaW5zdGFuY2VJZFBhdGgsIGFyZ3MpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkNhbm5vdCBwYXJzZSBCZWdpbk1ldGhvZCdzIGluc3RhbmNlSWRQYXRoICdcIiArIGluc3RhbmNlSWRQYXRoICsgXCInIG9uIGFyZ3VtZW50cyBvZiBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCAoc2VsZi5fZW50ZXJMb2NrRm9yQ3JlYXRlZEluc3RhbmNlKGxvY2tJbmZvKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsZXQgY3JlYXRlRW5kTWV0aG9kUmVhY2hlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICBsZXQgZW5kSW5zdGFuY2VJZFBhdGggPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9lbmRNZXRob2RDYWxsYmFjayA9XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAobW4sIGlwLCByKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1uID09PSBtZXRob2ROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUVuZE1ldGhvZFJlYWNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRJbnN0YW5jZUlkUGF0aCA9IGlwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGlkbGVNZXRob2RzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChtbiwgaXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlTWV0aG9kcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBtbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBpcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgeWllbGQgKHNlbGYuX2VuZ2luZS5yZXN1bWVCb29rbWFyayhzcGVjU3RyaW5ncy5ob3N0aW5nLmNyZWF0ZUJlZ2luTWV0aG9kQk1OYW1lKG1ldGhvZE5hbWUpLCBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSwgYXJncykpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVFbmRNZXRob2RSZWFjaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXMudW5kZWZpbmVkKHNlbGYuaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuZEluc3RhbmNlSWRQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpcy51bmRlZmluZWQoc2VsZi5pZCA9IHNlbGYuX2hvc3QuX2luc3RhbmNlSWRQYXJzZXIucGFyc2UoZW5kSW5zdGFuY2VJZFBhdGgsIHJlc3VsdCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJDYW5ub3QgcGFyc2UgRW5kTWV0aG9kcydzIGluc3RhbmNlSWRQYXRoICdcIiArIGluc3RhbmNlSWRQYXRoICsgXCInIG9uIGFyZ3VtZW50cyBvZiBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgc2VsZi5fZW50ZXJMb2NrRm9yQ3JlYXRlZEluc3RhbmNlKGxvY2tJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkJlZ2luTWV0aG9kIG9yIEVuZE1ldGhvZCBvZiBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJyBkb2Vzbid0IHNwZWNpZnkgYW4gaW5zdGFuY2VJZFBhdGggcHJvcGVydHkgdmFsdWUuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBiZWVuIGNvbXBsZXRlZCBvciBnb25lIHRvIGlkbGUgd2l0aG91dCByZWFjaGluZyBhbiBFbmRNZXRob2QgYWN0aXZpdHkgb2YgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWRsZU1ldGhvZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGdvbmUgdG8gaWRsZSwgYnV0IHRoZXJlIGlzIG5vIGFjdGl2ZSBCZWdpbk1ldGhvZCBhY3Rpdml0aWVzIHRvIHdhaXQgZm9yIChUT0RPOiBUaW1lciBzdXBwb3J0IGVycm9ycyBtaWdodCBiZSBjYXVzZXMgdGhpcyBlcnJvci4pLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZGxlTWV0aG9kcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBoYXMgY29tcGxldGVkLCBidXQgdGhlcmUgaXMgYWN0aXZlIEJlZ2luTWV0aG9kIGFjdGl2aXRpZXMgdG8gd2FpdCBmb3IgKFRPRE86IFRpbWVyIHN1cHBvcnQgZXJyb3JzIG1pZ2h0IGJlIGNhdXNlcyB0aGlzIGVycm9yLikuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBnb25lIHRvIGlkbGUgd2l0aG91dCByZWFjaGluZyBhbiBpbnN0YW5jZSBjcmVhdG9yIEJlZ2luTWV0aG9kIGFjdGl2aXR5IG9mIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBoYXMgYmVlbiBjb21wbGV0ZWQgd2l0aG91dCByZWFjaGluZyBhbiBpbnN0YW5jZSBjcmVhdG9yIEJlZ2luTWV0aG9kIGFjdGl2aXR5LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNlbGYuX2NsZWFyQ2FsbGJhY2tzKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2VudGVyTG9ja0ZvckNyZWF0ZWRJbnN0YW5jZSA9IGFzeW5jKFxuICAgIGZ1bmN0aW9uKiAobG9ja0luZm8pIHtcbiAgICAgICAgaWYgKGxvY2tJbmZvKSB7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLl9ob3N0Ll9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UodGhpcywgbG9ja0luZm8pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLnNldFdvcmtmbG93ID0gZnVuY3Rpb24gKHdvcmtmbG93LCBpbnN0YW5jZUlkKSB7XG4gICAgaWYgKCEod29ya2Zsb3cgaW5zdGFuY2VvZiBXb3JrZmxvdykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIldvcmtmbG93IGFyZ3VtZW50IGV4cGVjdGVkLlwiKTtcbiAgICB9XG4gICAgdGhpcy5fZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHdvcmtmbG93KTtcbiAgICB0aGlzLl9hZGRNeVRyYWNrZXJzKCk7XG4gICAgaWYgKGlzLmRlZmluZWQoaW5zdGFuY2VJZCkpIHtcbiAgICAgICAgdGhpcy5pZCA9IGluc3RhbmNlSWQ7XG4gICAgfVxuICAgIHRoaXMuX2NvcHlQYXJzRnJvbUhvc3QoKTtcbn07XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLmNhbGxNZXRob2QgPSBhc3luYyhcbiAgICBmdW5jdGlvbiogKG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGxldCBlbmRNZXRob2RSZWFjaGVkID0gZmFsc2U7XG4gICAgICAgIGxldCByZXN1bHQgPSBudWxsO1xuICAgICAgICBzZWxmLl9lbmRNZXRob2RDYWxsYmFjayA9XG4gICAgICAgICAgICBmdW5jdGlvbiAobW4sIGlwLCByKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1uID09PSBtZXRob2ROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZE1ldGhvZFJlYWNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgbGV0IGlkbGVNZXRob2RzID0gW107XG4gICAgICAgIHNlbGYuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrID1cbiAgICAgICAgICAgIGZ1bmN0aW9uIChtbiwgaXApIHtcbiAgICAgICAgICAgICAgICBpZGxlTWV0aG9kcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBtbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBpcFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHlpZWxkIHNlbGYuX2VuZ2luZS5yZXN1bWVCb29rbWFyayhzcGVjU3RyaW5ncy5ob3N0aW5nLmNyZWF0ZUJlZ2luTWV0aG9kQk1OYW1lKG1ldGhvZE5hbWUpLCBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSwgYXJncyk7XG5cbiAgICAgICAgICAgIGlmICghZW5kTWV0aG9kUmVhY2hlZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBiZWVuIGNvbXBsZXRlZCBvciBnb25lIHRvIGlkbGUgd2l0aG91dCByZWFjaGluZyBhbiBFbmRNZXRob2QgYWN0aXZpdHkgb2YgbWV0aG9kIG5hbWUgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZWxmLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgIGlmIChpZGxlTWV0aG9kcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGdvbmUgdG8gaWRsZSwgYnV0IHRoZXJlIGlzIG5vIGFjdGl2ZSBCZWdpbk1ldGhvZCBhY3Rpdml0aWVzIHRvIHdhaXQgZm9yIChUT0RPOiBUaW1lciBzdXBwb3J0IGVycm9ycyBtaWdodCBiZSBjYXVzZXMgdGhpcyBlcnJvci4pLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaWRsZU1ldGhvZHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBjb21wbGV0ZWQsIGJ1dCB0aGVyZSBpcyBhY3RpdmUgQmVnaW5NZXRob2QgYWN0aXZpdGllcyB0byB3YWl0IGZvciAoVE9ETzogVGltZXIgc3VwcG9ydCBlcnJvcnMgbWlnaHQgYmUgY2F1c2VzIHRoaXMgZXJyb3IuKS5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2VsZi5fY2xlYXJDYWxsYmFja3MoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fY29weVBhcnNGcm9tSG9zdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKGxldCB0IG9mIHRoaXMuX2hvc3QuX3RyYWNrZXJzKSB7XG4gICAgICAgIHRoaXMuX2VuZ2luZS5hZGRUcmFja2VyKHQpO1xuICAgIH1cbn07XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLl9hZGRNeVRyYWNrZXJzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2FkZEJlZ2luTWV0aG9kV2l0aENyZWF0ZUluc3RIZWxwZXJUcmFja2VyKCk7XG4gICAgdGhpcy5fYWRkRW5kTWV0aG9kSGVscGVyVHJhY2tlcigpO1xuICAgIHRoaXMuX2FkZElkbGVJbnN0YW5jZUlkUGF0aFRyYWNrZXIoKTtcbn07XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLl9jbGVhckNhbGxiYWNrcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9iZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0Q2FsbGJhY2sgPSBudWxsO1xuICAgIHRoaXMuX2VuZE1ldGhvZENhbGxiYWNrID0gbnVsbDtcbiAgICB0aGlzLl9pZGxlSW5zdGFuY2VJZFBhdGhDYWxsYmFjayA9IG51bGw7XG59O1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fYWRkQmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdEhlbHBlclRyYWNrZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCB0cmFja2VyID0ge1xuICAgICAgICBhY3Rpdml0eVN0YXRlRmlsdGVyOiBmdW5jdGlvbiAoYWN0aXZpdHksIHJlYXNvbiwgcmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5fYmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdENhbGxiYWNrICYmXG4gICAgICAgICAgICAgICAgYWN0aXZpdHkgaW5zdGFuY2VvZiBCZWdpbk1ldGhvZCAmJlxuICAgICAgICAgICAgICAgIGFjdGl2aXR5LmNhbkNyZWF0ZUluc3RhbmNlICYmXG4gICAgICAgICAgICAgICAgXyhhY3Rpdml0eS5tZXRob2ROYW1lKS5pc1N0cmluZygpICYmXG4gICAgICAgICAgICAgICAgKCFhY3Rpdml0eS5pbnN0YW5jZUlkUGF0aCB8fCBfKGFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoKS5pc1N0cmluZygpKSAmJlxuICAgICAgICAgICAgICAgIHJlYXNvbiA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZTtcbiAgICAgICAgfSxcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUNoYW5nZWQ6IGZ1bmN0aW9uIChhY3Rpdml0eSwgcmVhc29uLCByZXN1bHQpIHtcbiAgICAgICAgICAgIGxldCBtZXRob2ROYW1lID0gYWN0aXZpdHkubWV0aG9kTmFtZS50cmltKCk7XG4gICAgICAgICAgICBsZXQgaW5zdGFuY2VJZFBhdGggPSBhY3Rpdml0eS5pbnN0YW5jZUlkUGF0aCA/IGFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoLnRyaW0oKSA6IG51bGw7XG4gICAgICAgICAgICBzZWxmLl9iZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0Q2FsbGJhY2sobWV0aG9kTmFtZSwgaW5zdGFuY2VJZFBhdGgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzZWxmLl9lbmdpbmUuYWRkVHJhY2tlcih0cmFja2VyKTtcbn07XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLl9hZGRFbmRNZXRob2RIZWxwZXJUcmFja2VyID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBsZXQgdHJhY2tlciA9IHtcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUZpbHRlcjogZnVuY3Rpb24gKGFjdGl2aXR5LCByZWFzb24sIHJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2VuZE1ldGhvZENhbGxiYWNrICYmXG4gICAgICAgICAgICAgICAgYWN0aXZpdHkgaW5zdGFuY2VvZiBFbmRNZXRob2QgJiZcbiAgICAgICAgICAgICAgICBfKGFjdGl2aXR5Lm1ldGhvZE5hbWUpLmlzU3RyaW5nKCkgJiZcbiAgICAgICAgICAgICAgICAoIWFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoIHx8IF8oYWN0aXZpdHkuaW5zdGFuY2VJZFBhdGgpLmlzU3RyaW5nKCkpICYmXG4gICAgICAgICAgICAgICAgcmVhc29uID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZTtcbiAgICAgICAgfSxcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUNoYW5nZWQ6IGZ1bmN0aW9uIChhY3Rpdml0eSwgcmVhc29uLCByZXN1bHQpIHtcbiAgICAgICAgICAgIGxldCBtZXRob2ROYW1lID0gYWN0aXZpdHkubWV0aG9kTmFtZS50cmltKCk7XG4gICAgICAgICAgICBsZXQgaW5zdGFuY2VJZFBhdGggPSBhY3Rpdml0eS5pbnN0YW5jZUlkUGF0aCA/IGFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoLnRyaW0oKSA6IG51bGw7XG4gICAgICAgICAgICBzZWxmLl9lbmRNZXRob2RDYWxsYmFjayhtZXRob2ROYW1lLCBpbnN0YW5jZUlkUGF0aCwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc2VsZi5fZW5naW5lLmFkZFRyYWNrZXIodHJhY2tlcik7XG59O1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fYWRkSWRsZUluc3RhbmNlSWRQYXRoVHJhY2tlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IHRyYWNrZXIgPSB7XG4gICAgICAgIGFjdGl2aXR5U3RhdGVGaWx0ZXI6IGZ1bmN0aW9uIChhY3Rpdml0eSwgcmVhc29uLCByZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLl9pZGxlSW5zdGFuY2VJZFBhdGhDYWxsYmFjayAmJlxuICAgICAgICAgICAgICAgIGFjdGl2aXR5IGluc3RhbmNlb2YgQmVnaW5NZXRob2QgJiZcbiAgICAgICAgICAgICAgICBfKGFjdGl2aXR5Lm1ldGhvZE5hbWUpLmlzU3RyaW5nKCkgJiZcbiAgICAgICAgICAgICAgICBfKGFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoKS5pc1N0cmluZygpICYmXG4gICAgICAgICAgICAgICAgcmVhc29uID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlO1xuICAgICAgICB9LFxuICAgICAgICBhY3Rpdml0eVN0YXRlQ2hhbmdlZDogZnVuY3Rpb24gKGFjdGl2aXR5LCByZWFzb24sIHJlc3VsdCkge1xuICAgICAgICAgICAgbGV0IG1ldGhvZE5hbWUgPSBhY3Rpdml0eS5tZXRob2ROYW1lLnRyaW0oKTtcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZUlkUGF0aCA9IGFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoLnRyaW0oKTtcbiAgICAgICAgICAgIHNlbGYuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrKG1ldGhvZE5hbWUsIGluc3RhbmNlSWRQYXRoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc2VsZi5fZW5naW5lLmFkZFRyYWNrZXIodHJhY2tlcik7XG59O1xuXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5nZXRTdGF0ZVRvUGVyc2lzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc3AgPSB0aGlzLl9lbmdpbmUuZ2V0U3RhdGVBbmRQcm9tb3Rpb25zKHRoaXMuX2hvc3Qub3B0aW9ucy5zZXJpYWxpemVyLCB0aGlzLl9ob3N0Lm9wdGlvbnMuZW5hYmxlUHJvbW90aW9ucyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5zdGFuY2VJZDogdGhpcy5pZCxcbiAgICAgICAgY3JlYXRlZE9uOiB0aGlzLmNyZWF0ZWRPbixcbiAgICAgICAgd29ya2Zsb3dOYW1lOiB0aGlzLndvcmtmbG93TmFtZSxcbiAgICAgICAgd29ya2Zsb3dWZXJzaW9uOiB0aGlzLndvcmtmbG93VmVyc2lvbixcbiAgICAgICAgdXBkYXRlZE9uOiB0aGlzLl9lbmdpbmUudXBkYXRlZE9uLFxuICAgICAgICBzdGF0ZTogc3Auc3RhdGUsXG4gICAgICAgIHByb21vdGVkUHJvcGVydGllczogc3AucHJvbW90ZWRQcm9wZXJ0aWVzXG4gICAgfTtcbn07XG5cbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLnJlc3RvcmVTdGF0ZSA9IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KGpzb24pKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnanNvbicgaXMgbm90IGFuIG9iamVjdC5cIik7XG4gICAgfVxuICAgIGlmIChqc29uLmluc3RhbmNlSWQgIT09IHRoaXMuaWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgaW5zdGFuY2VJZCBwcm9wZXJ0eSB2YWx1ZSBvZiAnXCIgKyBqc29uLmluc3RhbmNlSWQgKyBcIicgaXMgZGlmZmVyZW50IHRoYW4gdGhlIGN1cnJlbnQgaW5zdGFuY2UgaWQgJ1wiICsgdGhpcy5pZCArIFwiJy5cIik7XG4gICAgfVxuICAgIGlmIChqc29uLndvcmtmbG93TmFtZSAhPT0gdGhpcy53b3JrZmxvd05hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgd29ya2Zsb3dOYW1lIHByb3BlcnR5IHZhbHVlIG9mICdcIiArIGpzb24ud29ya2Zsb3dOYW1lICsgXCInIGlzIGRpZmZlcmVudCB0aGFuIHRoZSBjdXJyZW50IFdvcmtmbG93IG5hbWUgJ1wiICsgdGhpcy53b3JrZmxvd05hbWUgKyBcIicuXCIpO1xuICAgIH1cbiAgICBpZiAoanNvbi53b3JrZmxvd1ZlcnNpb24gIT09IHRoaXMud29ya2Zsb3dWZXJzaW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN0YXRlIHdvcmtmbG93TmFtZSBwcm9wZXJ0eSB2YWx1ZSBvZiAnXCIgKyBqc29uLndvcmtmbG93VmVyc2lvbiArIFwiJyBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgY3VycmVudCBXb3JrZmxvdyB2ZXJzaW9uICdcIiArIHRoaXMud29ya2Zsb3dWZXJzaW9uICsgXCInLlwiKTtcbiAgICB9XG4gICAgaWYgKCFfLmlzRGF0ZShqc29uLmNyZWF0ZWRPbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgY3JlYXRlZE9uIHByb3BlcnR5IHZhbHVlIG9mICdcIiArIGpzb24uY3JlYXRlZE9uICsgXCInIGlzIG5vdCBhIERhdGUuXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX2NyZWF0ZWRPbiA9IGpzb24uY3JlYXRlZE9uO1xuICAgIHRoaXMuX2VuZ2luZS5zZXRTdGF0ZSh0aGlzLl9ob3N0Lm9wdGlvbnMuc2VyaWFsaXplciwganNvbi5zdGF0ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmtmbG93SW5zdGFuY2U7XG4iXX0=
