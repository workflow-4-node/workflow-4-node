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
var fast = require("fast.js");
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
WorkflowInstance.prototype.create = async($traceurRuntime.initGeneratorFunction(function $__0(workflow, methodName, args, lockInfo) {
  var self,
      createMethodReached,
      instanceIdPath,
      createEndMethodReached,
      result,
      endInstanceIdPath,
      idleMethods,
      $__1,
      $__2,
      $__3,
      $__4,
      $__5,
      $__6,
      $__7;
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
          $__1 = self._engine;
          $__2 = $__1.isIdle;
          $__3 = self._engine;
          $__4 = $__3.invoke;
          $__5 = $__4.call($__3);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__5;
        case 2:
          $__6 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__7 = $__2.call($__1, $__6);
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__7) ? 43 : 44;
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
          return (self._enterLockForCreatedInstance(lockInfo));
        case 21:
          $ctx.maybeThrow();
          $ctx.state = 23;
          break;
        case 26:
          throw new errors.WorkflowError("BeginMethod or EndMethod of method '" + methodName + "' doesn't specify an instanceIdPath property value.");
          $ctx.state = 23;
          break;
        case 30:
          throw errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method '" + methodName + "'.");
          $ctx.state = 23;
          break;
        case 23:
          if (self.execState === enums.ActivityStates.idle) {
            if (idleMethods.length === 0) {
              throw errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
            }
          } else {
            if (idleMethods.length != 0) {
              throw errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
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
          throw errors.WorkflowError("Workflow has gone to idle without reaching an instance creator BeginMethod activity of method '" + methodName + "'.");
          $ctx.state = 48;
          $ctx.finallyFallThrough = -2;
          break;
        case 44:
          throw errors.WorkflowError("Workflow has been completed without reaching an instance creator BeginMethod activity.");
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
  }, $__0, this);
}));
WorkflowInstance.prototype._enterLockForCreatedInstance = async($traceurRuntime.initGeneratorFunction(function $__8(lockInfo) {
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (lockInfo) ? 1 : -2;
          break;
        case 1:
          $ctx.state = 2;
          return (this._host._enterLockForCreatedInstance(this, lockInfo));
        case 2:
          $ctx.maybeThrow();
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__8, this);
}));
WorkflowInstance.prototype.setWorkflow = function(workflow, instanceId) {
  if (!(workflow instanceof Workflow))
    throw new TypeError("Workflow argument expected.");
  this._engine = new ActivityExecutionEngine(workflow);
  this._addMyTrackers();
  if (is.defined(instanceId))
    this.id = instanceId;
  this._copyParsFromHost();
};
WorkflowInstance.prototype.callMethod = async($traceurRuntime.initGeneratorFunction(function $__9(methodName, args) {
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
            throw errors.WorkflowError("Workflow has been completed or gone to idle without reaching an EndMethod activity of method name '" + methodName + "'.");
          }
          if (self.execState === enums.ActivityStates.idle) {
            if (idleMethods.length === 0) {
              throw errors.WorkflowError("Workflow has gone to idle, but there is no active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
            }
          } else {
            if (idleMethods.length != 0) {
              throw errors.WorkflowError("Workflow has completed, but there is active BeginMethod activities to wait for (TODO: Timer support errors might be causes this error.).");
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
  }, $__9, this);
}));
WorkflowInstance.prototype._copyParsFromHost = function() {
  var self = this;
  fast.forEach(self._host._trackers, function(t) {
    self._engine.addTracker(t);
  });
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
  if (!_.isObject(json))
    throw new TypeError("Argument 'json' is not an object.");
  if (json.instanceId !== this.id)
    throw new Error("State instanceId property value of '" + json.instanceId + "' is different than the current instance id '" + this.id + "'.");
  if (json.workflowName !== this.workflowName)
    throw new Error("State workflowName property value of '" + json.workflowName + "' is different than the current Workflow name '" + this.workflowName + "'.");
  if (json.workflowVersion !== this.workflowVersion)
    throw new Error("State workflowName property value of '" + json.workflowVersion + "' is different than the current Workflow version '" + this.workflowVersion + "'.");
  if (!_.isDate(json.createdOn))
    throw new Error("State createdOn property value of '" + json.createdOn + "' is not a Date.");
  this._createdOn = json.createdOn;
  this._engine.setState(this._host.options.serializer, json.state);
};
module.exports = WorkflowInstance;
//# sourceMappingURL=data:application/json;base64,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QUFDaEMsS0FBRyxRQUFRLFNBQVMsQUFBQyxDQUFDLElBQUcsTUFBTSxRQUFRLFdBQVcsQ0FBRyxDQUFBLElBQUcsTUFBTSxDQUFDLENBQUM7QUFDcEUsQ0FBQTtBQUVBLEtBQUssUUFBUSxFQUFJLGlCQUFlLENBQUM7QUFDakMiLCJmaWxlIjoiaG9zdGluZy93b3JrZmxvd0luc3RhbmNlLmpzIiwic291cmNlUm9vdCI6IkM6L0dJVC93b3JrZmxvdy00LW5vZGUvbGliLyIsInNvdXJjZXNDb250ZW50IjpbInZhciBXb3JrZmxvdyA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL3dvcmtmbG93XCIpO1xyXG52YXIgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy9hY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZVwiKTtcclxudmFyIEJlZ2luTWV0aG9kID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvYmVnaW5NZXRob2RcIik7XHJcbnZhciBFbmRNZXRob2QgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy9lbmRNZXRob2RcIik7XHJcbnZhciBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcclxudmFyIGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcclxudmFyIHNwZWNTdHJpbmdzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9zcGVjU3RyaW5nc1wiKTtcclxudmFyIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xyXG52YXIgZ3VpZHMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2d1aWRzXCIpO1xyXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcclxudmFyIGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcclxudmFyIGZhc3QgPSByZXF1aXJlKFwiZmFzdC5qc1wiKTtcclxudmFyIGFzeW5jSGVscGVycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vYXN5bmNIZWxwZXJzXCIpO1xyXG52YXIgYXN5bmMgPSBhc3luY0hlbHBlcnMuYXN5bmM7XHJcbnZhciB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XHJcblxyXG5mdW5jdGlvbiBXb3JrZmxvd0luc3RhbmNlKGhvc3QpIHtcclxuICAgIHRoaXMuX2hvc3QgPSBob3N0O1xyXG4gICAgdGhpcy5pZCA9IG51bGw7XHJcbiAgICB0aGlzLl9lbmdpbmUgPSBudWxsO1xyXG4gICAgdGhpcy5fY3JlYXRlZE9uID0gbnVsbDtcclxuICAgIHRoaXMuX2JlZ2luTWV0aG9kV2l0aENyZWF0ZUluc3RDYWxsYmFjayA9IG51bGw7XHJcbiAgICB0aGlzLl9lbmRNZXRob2RDYWxsYmFjayA9IG51bGw7XHJcbiAgICB0aGlzLl9pZGxlSW5zdGFuY2VJZFBhdGhDYWxsYmFjayA9IG51bGw7XHJcbn1cclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFxyXG4gICAgV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUsIHtcclxuICAgICAgICBleGVjU3RhdGU6IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZW5naW5lID8gdGhpcy5fZW5naW5lLmV4ZWNTdGF0ZSA6IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHdvcmtmbG93TmFtZToge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUgPyB0aGlzLl9lbmdpbmUucm9vdEFjdGl2aXR5Lm5hbWUudHJpbSgpIDogbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd29ya2Zsb3dWZXJzaW9uOiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2VuZ2luZSA/IHRoaXMuX2VuZ2luZS5yb290QWN0aXZpdHkudmVyc2lvbiA6IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWRPbjoge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVkT247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZWRPbjoge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUgPyB0aGlzLl9lbmdpbmUudXBkYXRlZE9uIDogbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuY3JlYXRlID0gYXN5bmMoXHJcbiAgICBmdW5jdGlvbiogKHdvcmtmbG93LCBtZXRob2ROYW1lLCBhcmdzLCBsb2NrSW5mbykge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgc2VsZi5zZXRXb3JrZmxvdyh3b3JrZmxvdyk7XHJcblxyXG4gICAgICAgIHZhciBjcmVhdGVNZXRob2RSZWFjaGVkID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGluc3RhbmNlSWRQYXRoID0gbnVsbDtcclxuICAgICAgICBzZWxmLl9iZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0Q2FsbGJhY2sgPSBmdW5jdGlvbiAobW4sIGlwKSB7XHJcbiAgICAgICAgICAgIGlmIChtbiA9PT0gbWV0aG9kTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgY3JlYXRlTWV0aG9kUmVhY2hlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aCA9IGlwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZWxmLl9jcmVhdGVkT24gPSBuZXcgRGF0ZSgpO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5fZW5naW5lLmlzSWRsZSh5aWVsZCBzZWxmLl9lbmdpbmUuaW52b2tlKCkpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3JlYXRlTWV0aG9kUmVhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2NsZWFyQ2FsbGJhY2tzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZUlkUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXMudW5kZWZpbmVkKHNlbGYuaWQgPSBzZWxmLl9ob3N0Ll9pbnN0YW5jZUlkUGFyc2VyLnBhcnNlKGluc3RhbmNlSWRQYXRoLCBhcmdzKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkNhbm5vdCBwYXJzZSBCZWdpbk1ldGhvZCdzIGluc3RhbmNlSWRQYXRoICdcIiArIGluc3RhbmNlSWRQYXRoICsgXCInIG9uIGFyZ3VtZW50cyBvZiBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgKHNlbGYuX2VudGVyTG9ja0ZvckNyZWF0ZWRJbnN0YW5jZShsb2NrSW5mbykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNyZWF0ZUVuZE1ldGhvZFJlYWNoZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbmRJbnN0YW5jZUlkUGF0aCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZW5kTWV0aG9kQ2FsbGJhY2sgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAobW4sIGlwLCByKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobW4gPT09IG1ldGhvZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVFbmRNZXRob2RSZWFjaGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRJbnN0YW5jZUlkUGF0aCA9IGlwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpZGxlTWV0aG9kcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG1uLCBpcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRsZU1ldGhvZHMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogaXBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgKHNlbGYuX2VuZ2luZS5yZXN1bWVCb29rbWFyayhzcGVjU3RyaW5ncy5ob3N0aW5nLmNyZWF0ZUJlZ2luTWV0aG9kQk1OYW1lKG1ldGhvZE5hbWUpLCBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSwgYXJncykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3JlYXRlRW5kTWV0aG9kUmVhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXMudW5kZWZpbmVkKHNlbGYuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW5kSW5zdGFuY2VJZFBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXMudW5kZWZpbmVkKHNlbGYuaWQgPSBzZWxmLl9ob3N0Ll9pbnN0YW5jZUlkUGFyc2VyLnBhcnNlKGVuZEluc3RhbmNlSWRQYXRoLCByZXN1bHQpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJDYW5ub3QgcGFyc2UgRW5kTWV0aG9kcydzIGluc3RhbmNlSWRQYXRoICdcIiArIGluc3RhbmNlSWRQYXRoICsgXCInIG9uIGFyZ3VtZW50cyBvZiBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIChzZWxmLl9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UobG9ja0luZm8pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiQmVnaW5NZXRob2Qgb3IgRW5kTWV0aG9kIG9mIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInIGRvZXNuJ3Qgc3BlY2lmeSBhbiBpbnN0YW5jZUlkUGF0aCBwcm9wZXJ0eSB2YWx1ZS5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGJlZW4gY29tcGxldGVkIG9yIGdvbmUgdG8gaWRsZSB3aXRob3V0IHJlYWNoaW5nIGFuIEVuZE1ldGhvZCBhY3Rpdml0eSBvZiBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkbGVNZXRob2RzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBoYXMgZ29uZSB0byBpZGxlLCBidXQgdGhlcmUgaXMgbm8gYWN0aXZlIEJlZ2luTWV0aG9kIGFjdGl2aXRpZXMgdG8gd2FpdCBmb3IgKFRPRE86IFRpbWVyIHN1cHBvcnQgZXJyb3JzIG1pZ2h0IGJlIGNhdXNlcyB0aGlzIGVycm9yLikuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWRsZU1ldGhvZHMubGVuZ3RoICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGNvbXBsZXRlZCwgYnV0IHRoZXJlIGlzIGFjdGl2ZSBCZWdpbk1ldGhvZCBhY3Rpdml0aWVzIHRvIHdhaXQgZm9yIChUT0RPOiBUaW1lciBzdXBwb3J0IGVycm9ycyBtaWdodCBiZSBjYXVzZXMgdGhpcyBlcnJvci4pLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGdvbmUgdG8gaWRsZSB3aXRob3V0IHJlYWNoaW5nIGFuIGluc3RhbmNlIGNyZWF0b3IgQmVnaW5NZXRob2QgYWN0aXZpdHkgb2YgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBoYXMgYmVlbiBjb21wbGV0ZWQgd2l0aG91dCByZWFjaGluZyBhbiBpbnN0YW5jZSBjcmVhdG9yIEJlZ2luTWV0aG9kIGFjdGl2aXR5LlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHtcclxuICAgICAgICAgICAgc2VsZi5fY2xlYXJDYWxsYmFja3MoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLl9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UgPSBhc3luYyhcclxuICAgIGZ1bmN0aW9uKiAobG9ja0luZm8pIHtcclxuICAgICAgICBpZiAobG9ja0luZm8pIHlpZWxkICh0aGlzLl9ob3N0Ll9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UodGhpcywgbG9ja0luZm8pKTtcclxuICAgIH0pO1xyXG5cclxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuc2V0V29ya2Zsb3cgPSBmdW5jdGlvbiAod29ya2Zsb3csIGluc3RhbmNlSWQpIHtcclxuICAgIGlmICghKHdvcmtmbG93IGluc3RhbmNlb2YgV29ya2Zsb3cpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiV29ya2Zsb3cgYXJndW1lbnQgZXhwZWN0ZWQuXCIpO1xyXG4gICAgdGhpcy5fZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHdvcmtmbG93KTtcclxuICAgIHRoaXMuX2FkZE15VHJhY2tlcnMoKTtcclxuICAgIGlmIChpcy5kZWZpbmVkKGluc3RhbmNlSWQpKSB0aGlzLmlkID0gaW5zdGFuY2VJZDtcclxuICAgIHRoaXMuX2NvcHlQYXJzRnJvbUhvc3QoKTtcclxufVxyXG5cclxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuY2FsbE1ldGhvZCA9IGFzeW5jKFxyXG4gICAgZnVuY3Rpb24qIChtZXRob2ROYW1lLCBhcmdzKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgZW5kTWV0aG9kUmVhY2hlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBudWxsO1xyXG4gICAgICAgIHNlbGYuX2VuZE1ldGhvZENhbGxiYWNrID1cclxuICAgICAgICAgICAgZnVuY3Rpb24gKG1uLCBpcCwgcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1uID09PSBtZXRob2ROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kTWV0aG9kUmVhY2hlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGlkbGVNZXRob2RzID0gW107XHJcbiAgICAgICAgc2VsZi5faWRsZUluc3RhbmNlSWRQYXRoQ2FsbGJhY2sgPVxyXG4gICAgICAgICAgICBmdW5jdGlvbiAobW4sIGlwKSB7XHJcbiAgICAgICAgICAgICAgICBpZGxlTWV0aG9kcy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogbW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBpcFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB5aWVsZCBzZWxmLl9lbmdpbmUucmVzdW1lQm9va21hcmsoc3BlY1N0cmluZ3MuaG9zdGluZy5jcmVhdGVCZWdpbk1ldGhvZEJNTmFtZShtZXRob2ROYW1lKSwgZW51bXMuQWN0aXZpdHlTdGF0ZXMuY29tcGxldGUsIGFyZ3MpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFlbmRNZXRob2RSZWFjaGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBiZWVuIGNvbXBsZXRlZCBvciBnb25lIHRvIGlkbGUgd2l0aG91dCByZWFjaGluZyBhbiBFbmRNZXRob2QgYWN0aXZpdHkgb2YgbWV0aG9kIG5hbWUgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkbGVNZXRob2RzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGdvbmUgdG8gaWRsZSwgYnV0IHRoZXJlIGlzIG5vIGFjdGl2ZSBCZWdpbk1ldGhvZCBhY3Rpdml0aWVzIHRvIHdhaXQgZm9yIChUT0RPOiBUaW1lciBzdXBwb3J0IGVycm9ycyBtaWdodCBiZSBjYXVzZXMgdGhpcyBlcnJvci4pLlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChpZGxlTWV0aG9kcy5sZW5ndGggIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGNvbXBsZXRlZCwgYnV0IHRoZXJlIGlzIGFjdGl2ZSBCZWdpbk1ldGhvZCBhY3Rpdml0aWVzIHRvIHdhaXQgZm9yIChUT0RPOiBUaW1lciBzdXBwb3J0IGVycm9ycyBtaWdodCBiZSBjYXVzZXMgdGhpcyBlcnJvci4pLlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7XHJcbiAgICAgICAgICAgIHNlbGYuX2NsZWFyQ2FsbGJhY2tzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fY29weVBhcnNGcm9tSG9zdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIGZhc3QuZm9yRWFjaChzZWxmLl9ob3N0Ll90cmFja2VycyxcclxuICAgICAgICBmdW5jdGlvbiAodCkge1xyXG4gICAgICAgICAgICBzZWxmLl9lbmdpbmUuYWRkVHJhY2tlcih0KTtcclxuICAgICAgICB9KTtcclxufVxyXG5cclxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2FkZE15VHJhY2tlcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9hZGRCZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0SGVscGVyVHJhY2tlcigpO1xyXG4gICAgdGhpcy5fYWRkRW5kTWV0aG9kSGVscGVyVHJhY2tlcigpO1xyXG4gICAgdGhpcy5fYWRkSWRsZUluc3RhbmNlSWRQYXRoVHJhY2tlcigpO1xyXG59XHJcblxyXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fY2xlYXJDYWxsYmFja3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9iZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0Q2FsbGJhY2sgPSBudWxsO1xyXG4gICAgdGhpcy5fZW5kTWV0aG9kQ2FsbGJhY2sgPSBudWxsO1xyXG4gICAgdGhpcy5faWRsZUluc3RhbmNlSWRQYXRoQ2FsbGJhY2sgPSBudWxsO1xyXG59XHJcblxyXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fYWRkQmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdEhlbHBlclRyYWNrZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB2YXIgdHJhY2tlciA9IHtcclxuICAgICAgICBhY3Rpdml0eVN0YXRlRmlsdGVyOiBmdW5jdGlvbiAoYWN0aXZpdHksIHJlYXNvbiwgcmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLl9iZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0Q2FsbGJhY2sgJiZcclxuICAgICAgICAgICAgICAgIGFjdGl2aXR5IGluc3RhbmNlb2YgQmVnaW5NZXRob2QgJiZcclxuICAgICAgICAgICAgICAgIGFjdGl2aXR5LmNhbkNyZWF0ZUluc3RhbmNlICYmXHJcbiAgICAgICAgICAgICAgICBfKGFjdGl2aXR5Lm1ldGhvZE5hbWUpLmlzU3RyaW5nKCkgJiZcclxuICAgICAgICAgICAgICAgICghYWN0aXZpdHkuaW5zdGFuY2VJZFBhdGggfHwgXyhhY3Rpdml0eS5pbnN0YW5jZUlkUGF0aCkuaXNTdHJpbmcoKSkgJiZcclxuICAgICAgICAgICAgICAgIHJlYXNvbiA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFjdGl2aXR5U3RhdGVDaGFuZ2VkOiBmdW5jdGlvbiAoYWN0aXZpdHksIHJlYXNvbiwgcmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHZhciBtZXRob2ROYW1lID0gYWN0aXZpdHkubWV0aG9kTmFtZS50cmltKCk7XHJcbiAgICAgICAgICAgIHZhciBpbnN0YW5jZUlkUGF0aCA9IGFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoID8gYWN0aXZpdHkuaW5zdGFuY2VJZFBhdGgudHJpbSgpIDogbnVsbDtcclxuICAgICAgICAgICAgc2VsZi5fYmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdENhbGxiYWNrKG1ldGhvZE5hbWUsIGluc3RhbmNlSWRQYXRoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgc2VsZi5fZW5naW5lLmFkZFRyYWNrZXIodHJhY2tlcik7XHJcbn1cclxuXHJcbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLl9hZGRFbmRNZXRob2RIZWxwZXJUcmFja2VyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIHRyYWNrZXIgPSB7XHJcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUZpbHRlcjogZnVuY3Rpb24gKGFjdGl2aXR5LCByZWFzb24sIHJlc3VsdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5fZW5kTWV0aG9kQ2FsbGJhY2sgJiZcclxuICAgICAgICAgICAgICAgIGFjdGl2aXR5IGluc3RhbmNlb2YgRW5kTWV0aG9kICYmXHJcbiAgICAgICAgICAgICAgICBfKGFjdGl2aXR5Lm1ldGhvZE5hbWUpLmlzU3RyaW5nKCkgJiZcclxuICAgICAgICAgICAgICAgICghYWN0aXZpdHkuaW5zdGFuY2VJZFBhdGggfHwgXyhhY3Rpdml0eS5pbnN0YW5jZUlkUGF0aCkuaXNTdHJpbmcoKSkgJiZcclxuICAgICAgICAgICAgICAgIHJlYXNvbiA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuY29tcGxldGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY3Rpdml0eVN0YXRlQ2hhbmdlZDogZnVuY3Rpb24gKGFjdGl2aXR5LCByZWFzb24sIHJlc3VsdCkge1xyXG4gICAgICAgICAgICB2YXIgbWV0aG9kTmFtZSA9IGFjdGl2aXR5Lm1ldGhvZE5hbWUudHJpbSgpO1xyXG4gICAgICAgICAgICB2YXIgaW5zdGFuY2VJZFBhdGggPSBhY3Rpdml0eS5pbnN0YW5jZUlkUGF0aCA/IGFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoLnRyaW0oKSA6IG51bGw7XHJcbiAgICAgICAgICAgIHNlbGYuX2VuZE1ldGhvZENhbGxiYWNrKG1ldGhvZE5hbWUsIGluc3RhbmNlSWRQYXRoLCByZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBzZWxmLl9lbmdpbmUuYWRkVHJhY2tlcih0cmFja2VyKTtcclxufVxyXG5cclxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2FkZElkbGVJbnN0YW5jZUlkUGF0aFRyYWNrZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB2YXIgdHJhY2tlciA9IHtcclxuICAgICAgICBhY3Rpdml0eVN0YXRlRmlsdGVyOiBmdW5jdGlvbiAoYWN0aXZpdHksIHJlYXNvbiwgcmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLl9pZGxlSW5zdGFuY2VJZFBhdGhDYWxsYmFjayAmJlxyXG4gICAgICAgICAgICAgICAgYWN0aXZpdHkgaW5zdGFuY2VvZiBCZWdpbk1ldGhvZCAmJlxyXG4gICAgICAgICAgICAgICAgXyhhY3Rpdml0eS5tZXRob2ROYW1lKS5pc1N0cmluZygpICYmXHJcbiAgICAgICAgICAgICAgICBfKGFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoKS5pc1N0cmluZygpICYmXHJcbiAgICAgICAgICAgICAgICByZWFzb24gPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY3Rpdml0eVN0YXRlQ2hhbmdlZDogZnVuY3Rpb24gKGFjdGl2aXR5LCByZWFzb24sIHJlc3VsdCkge1xyXG4gICAgICAgICAgICB2YXIgbWV0aG9kTmFtZSA9IGFjdGl2aXR5Lm1ldGhvZE5hbWUudHJpbSgpO1xyXG4gICAgICAgICAgICB2YXIgaW5zdGFuY2VJZFBhdGggPSBhY3Rpdml0eS5pbnN0YW5jZUlkUGF0aC50cmltKCk7XHJcbiAgICAgICAgICAgIHNlbGYuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrKG1ldGhvZE5hbWUsIGluc3RhbmNlSWRQYXRoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgc2VsZi5fZW5naW5lLmFkZFRyYWNrZXIodHJhY2tlcik7XHJcbn1cclxuXHJcbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLmdldFN0YXRlVG9QZXJzaXN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNwID0gdGhpcy5fZW5naW5lLmdldFN0YXRlQW5kUHJvbW90aW9ucyh0aGlzLl9ob3N0Lm9wdGlvbnMuc2VyaWFsaXplciwgdGhpcy5faG9zdC5vcHRpb25zLmVuYWJsZVByb21vdGlvbnMpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpbnN0YW5jZUlkOiB0aGlzLmlkLFxyXG4gICAgICAgIGNyZWF0ZWRPbjogdGhpcy5jcmVhdGVkT24sXHJcbiAgICAgICAgd29ya2Zsb3dOYW1lOiB0aGlzLndvcmtmbG93TmFtZSxcclxuICAgICAgICB3b3JrZmxvd1ZlcnNpb246IHRoaXMud29ya2Zsb3dWZXJzaW9uLFxyXG4gICAgICAgIHVwZGF0ZWRPbjogdGhpcy5fZW5naW5lLnVwZGF0ZWRPbixcclxuICAgICAgICBzdGF0ZTogc3Auc3RhdGUsXHJcbiAgICAgICAgcHJvbW90ZWRQcm9wZXJ0aWVzOiBzcC5wcm9tb3RlZFByb3BlcnRpZXNcclxuICAgIH07XHJcbn1cclxuXHJcbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLnJlc3RvcmVTdGF0ZSA9IGZ1bmN0aW9uIChqc29uKSB7XHJcbiAgICBpZiAoIV8uaXNPYmplY3QoanNvbikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnanNvbicgaXMgbm90IGFuIG9iamVjdC5cIik7XHJcbiAgICBpZiAoanNvbi5pbnN0YW5jZUlkICE9PSB0aGlzLmlkKSB0aHJvdyBuZXcgRXJyb3IoXCJTdGF0ZSBpbnN0YW5jZUlkIHByb3BlcnR5IHZhbHVlIG9mICdcIiArIGpzb24uaW5zdGFuY2VJZCArIFwiJyBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgY3VycmVudCBpbnN0YW5jZSBpZCAnXCIgKyB0aGlzLmlkICsgXCInLlwiKTtcclxuICAgIGlmIChqc29uLndvcmtmbG93TmFtZSAhPT0gdGhpcy53b3JrZmxvd05hbWUpIHRocm93IG5ldyBFcnJvcihcIlN0YXRlIHdvcmtmbG93TmFtZSBwcm9wZXJ0eSB2YWx1ZSBvZiAnXCIgKyBqc29uLndvcmtmbG93TmFtZSArIFwiJyBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgY3VycmVudCBXb3JrZmxvdyBuYW1lICdcIiArIHRoaXMud29ya2Zsb3dOYW1lICsgXCInLlwiKTtcclxuICAgIGlmIChqc29uLndvcmtmbG93VmVyc2lvbiAhPT0gdGhpcy53b3JrZmxvd1ZlcnNpb24pIHRocm93IG5ldyBFcnJvcihcIlN0YXRlIHdvcmtmbG93TmFtZSBwcm9wZXJ0eSB2YWx1ZSBvZiAnXCIgKyBqc29uLndvcmtmbG93VmVyc2lvbiArIFwiJyBpcyBkaWZmZXJlbnQgdGhhbiB0aGUgY3VycmVudCBXb3JrZmxvdyB2ZXJzaW9uICdcIiArIHRoaXMud29ya2Zsb3dWZXJzaW9uICsgXCInLlwiKTtcclxuICAgIGlmICghXy5pc0RhdGUoanNvbi5jcmVhdGVkT24pKSB0aHJvdyBuZXcgRXJyb3IoXCJTdGF0ZSBjcmVhdGVkT24gcHJvcGVydHkgdmFsdWUgb2YgJ1wiICsganNvbi5jcmVhdGVkT24gKyBcIicgaXMgbm90IGEgRGF0ZS5cIik7XHJcblxyXG4gICAgdGhpcy5fY3JlYXRlZE9uID0ganNvbi5jcmVhdGVkT247XHJcbiAgICB0aGlzLl9lbmdpbmUuc2V0U3RhdGUodGhpcy5faG9zdC5vcHRpb25zLnNlcmlhbGl6ZXIsIGpzb24uc3RhdGUpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmtmbG93SW5zdGFuY2U7XHJcbiJdfQ==
