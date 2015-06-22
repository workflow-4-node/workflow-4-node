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
//# sourceMappingURL=data:application/json;base64,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QUFDaEMsS0FBRyxRQUFRLFNBQVMsQUFBQyxDQUFDLElBQUcsTUFBTSxRQUFRLFdBQVcsQ0FBRyxDQUFBLElBQUcsTUFBTSxDQUFDLENBQUM7QUFDcEUsQ0FBQTtBQUVBLEtBQUssUUFBUSxFQUFJLGlCQUFlLENBQUM7QUFDakMiLCJmaWxlIjoiaG9zdGluZy93b3JrZmxvd0luc3RhbmNlLmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgV29ya2Zsb3cgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy93b3JrZmxvd1wiKTtcclxudmFyIEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvYWN0aXZpdHlFeGVjdXRpb25FbmdpbmVcIik7XHJcbnZhciBCZWdpbk1ldGhvZCA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL2JlZ2luTWV0aG9kXCIpO1xyXG52YXIgRW5kTWV0aG9kID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvZW5kTWV0aG9kXCIpO1xyXG52YXIgZXJyb3JzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lcnJvcnNcIik7XHJcbnZhciBlbnVtcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZW51bXNcIik7XHJcbnZhciBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XHJcbnZhciBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcclxudmFyIGd1aWRzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9ndWlkc1wiKTtcclxudmFyIFByb21pc2UgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XHJcbnZhciBpcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vaXNcIik7XHJcbnZhciBmYXN0ID0gcmVxdWlyZShcImZhc3QuanNcIik7XHJcbnZhciBhc3luY0hlbHBlcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2FzeW5jSGVscGVyc1wiKTtcclxudmFyIGFzeW5jID0gYXN5bmNIZWxwZXJzLmFzeW5jO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xyXG5cclxuZnVuY3Rpb24gV29ya2Zsb3dJbnN0YW5jZShob3N0KSB7XHJcbiAgICB0aGlzLl9ob3N0ID0gaG9zdDtcclxuICAgIHRoaXMuaWQgPSBudWxsO1xyXG4gICAgdGhpcy5fZW5naW5lID0gbnVsbDtcclxuICAgIHRoaXMuX2NyZWF0ZWRPbiA9IG51bGw7XHJcbiAgICB0aGlzLl9iZWdpbk1ldGhvZFdpdGhDcmVhdGVJbnN0Q2FsbGJhY2sgPSBudWxsO1xyXG4gICAgdGhpcy5fZW5kTWV0aG9kQ2FsbGJhY2sgPSBudWxsO1xyXG4gICAgdGhpcy5faWRsZUluc3RhbmNlSWRQYXRoQ2FsbGJhY2sgPSBudWxsO1xyXG59XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhcclxuICAgIFdvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLCB7XHJcbiAgICAgICAgZXhlY1N0YXRlOiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2VuZ2luZSA/IHRoaXMuX2VuZ2luZS5leGVjU3RhdGUgOiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB3b3JrZmxvd05hbWU6IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZW5naW5lID8gdGhpcy5fZW5naW5lLnJvb3RBY3Rpdml0eS5uYW1lLnRyaW0oKSA6IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHdvcmtmbG93VmVyc2lvbjoge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lbmdpbmUgPyB0aGlzLl9lbmdpbmUucm9vdEFjdGl2aXR5LnZlcnNpb24gOiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkT246IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlZE9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGVkT246IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZW5naW5lID8gdGhpcy5fZW5naW5lLnVwZGF0ZWRPbiA6IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLmNyZWF0ZSA9IGFzeW5jKFxyXG4gICAgZnVuY3Rpb24qICh3b3JrZmxvdywgbWV0aG9kTmFtZSwgYXJncywgbG9ja0luZm8pIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHNlbGYuc2V0V29ya2Zsb3cod29ya2Zsb3cpO1xyXG5cclxuICAgICAgICB2YXIgY3JlYXRlTWV0aG9kUmVhY2hlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBpbnN0YW5jZUlkUGF0aCA9IG51bGw7XHJcbiAgICAgICAgc2VsZi5fYmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdENhbGxiYWNrID0gZnVuY3Rpb24gKG1uLCBpcCkge1xyXG4gICAgICAgICAgICBpZiAobW4gPT09IG1ldGhvZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGNyZWF0ZU1ldGhvZFJlYWNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGggPSBpcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VsZi5fY3JlYXRlZE9uID0gbmV3IERhdGUoKTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHNlbGYuX2VuZ2luZS5pc0lkbGUoeWllbGQgc2VsZi5fZW5naW5lLmludm9rZSgpKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNyZWF0ZU1ldGhvZFJlYWNoZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9jbGVhckNhbGxiYWNrcygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2VJZFBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzLnVuZGVmaW5lZChzZWxmLmlkID0gc2VsZi5faG9zdC5faW5zdGFuY2VJZFBhcnNlci5wYXJzZShpbnN0YW5jZUlkUGF0aCwgYXJncykpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJDYW5ub3QgcGFyc2UgQmVnaW5NZXRob2QncyBpbnN0YW5jZUlkUGF0aCAnXCIgKyBpbnN0YW5jZUlkUGF0aCArIFwiJyBvbiBhcmd1bWVudHMgb2YgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIChzZWxmLl9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UobG9ja0luZm8pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjcmVhdGVFbmRNZXRob2RSZWFjaGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZW5kSW5zdGFuY2VJZFBhdGggPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2VuZE1ldGhvZENhbGxiYWNrID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG1uLCBpcCwgcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1uID09PSBtZXRob2ROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRW5kTWV0aG9kUmVhY2hlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kSW5zdGFuY2VJZFBhdGggPSBpcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgaWRsZU1ldGhvZHMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9pZGxlSW5zdGFuY2VJZFBhdGhDYWxsYmFjayA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChtbiwgaXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVNZXRob2RzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBtbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IGlwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIChzZWxmLl9lbmdpbmUucmVzdW1lQm9va21hcmsoc3BlY1N0cmluZ3MuaG9zdGluZy5jcmVhdGVCZWdpbk1ldGhvZEJNTmFtZShtZXRob2ROYW1lKSwgZW51bXMuQWN0aXZpdHlTdGF0ZXMuY29tcGxldGUsIGFyZ3MpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNyZWF0ZUVuZE1ldGhvZFJlYWNoZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzLnVuZGVmaW5lZChzZWxmLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuZEluc3RhbmNlSWRQYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzLnVuZGVmaW5lZChzZWxmLmlkID0gc2VsZi5faG9zdC5faW5zdGFuY2VJZFBhcnNlci5wYXJzZShlbmRJbnN0YW5jZUlkUGF0aCwgcmVzdWx0KSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiQ2Fubm90IHBhcnNlIEVuZE1ldGhvZHMncyBpbnN0YW5jZUlkUGF0aCAnXCIgKyBpbnN0YW5jZUlkUGF0aCArIFwiJyBvbiBhcmd1bWVudHMgb2YgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCAoc2VsZi5fZW50ZXJMb2NrRm9yQ3JlYXRlZEluc3RhbmNlKGxvY2tJbmZvKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkJlZ2luTWV0aG9kIG9yIEVuZE1ldGhvZCBvZiBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJyBkb2Vzbid0IHNwZWNpZnkgYW4gaW5zdGFuY2VJZFBhdGggcHJvcGVydHkgdmFsdWUuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBiZWVuIGNvbXBsZXRlZCBvciBnb25lIHRvIGlkbGUgd2l0aG91dCByZWFjaGluZyBhbiBFbmRNZXRob2QgYWN0aXZpdHkgb2YgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZGxlTWV0aG9kcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGdvbmUgdG8gaWRsZSwgYnV0IHRoZXJlIGlzIG5vIGFjdGl2ZSBCZWdpbk1ldGhvZCBhY3Rpdml0aWVzIHRvIHdhaXQgZm9yIChUT0RPOiBUaW1lciBzdXBwb3J0IGVycm9ycyBtaWdodCBiZSBjYXVzZXMgdGhpcyBlcnJvci4pLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkbGVNZXRob2RzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBjb21wbGV0ZWQsIGJ1dCB0aGVyZSBpcyBhY3RpdmUgQmVnaW5NZXRob2QgYWN0aXZpdGllcyB0byB3YWl0IGZvciAoVE9ETzogVGltZXIgc3VwcG9ydCBlcnJvcnMgbWlnaHQgYmUgY2F1c2VzIHRoaXMgZXJyb3IuKS5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBnb25lIHRvIGlkbGUgd2l0aG91dCByZWFjaGluZyBhbiBpbnN0YW5jZSBjcmVhdG9yIEJlZ2luTWV0aG9kIGFjdGl2aXR5IG9mIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaGFzIGJlZW4gY29tcGxldGVkIHdpdGhvdXQgcmVhY2hpbmcgYW4gaW5zdGFuY2UgY3JlYXRvciBCZWdpbk1ldGhvZCBhY3Rpdml0eS5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7XHJcbiAgICAgICAgICAgIHNlbGYuX2NsZWFyQ2FsbGJhY2tzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fZW50ZXJMb2NrRm9yQ3JlYXRlZEluc3RhbmNlID0gYXN5bmMoXHJcbiAgICBmdW5jdGlvbiogKGxvY2tJbmZvKSB7XHJcbiAgICAgICAgaWYgKGxvY2tJbmZvKSB5aWVsZCAodGhpcy5faG9zdC5fZW50ZXJMb2NrRm9yQ3JlYXRlZEluc3RhbmNlKHRoaXMsIGxvY2tJbmZvKSk7XHJcbiAgICB9KTtcclxuXHJcbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLnNldFdvcmtmbG93ID0gZnVuY3Rpb24gKHdvcmtmbG93LCBpbnN0YW5jZUlkKSB7XHJcbiAgICBpZiAoISh3b3JrZmxvdyBpbnN0YW5jZW9mIFdvcmtmbG93KSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIldvcmtmbG93IGFyZ3VtZW50IGV4cGVjdGVkLlwiKTtcclxuICAgIHRoaXMuX2VuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh3b3JrZmxvdyk7XHJcbiAgICB0aGlzLl9hZGRNeVRyYWNrZXJzKCk7XHJcbiAgICBpZiAoaXMuZGVmaW5lZChpbnN0YW5jZUlkKSkgdGhpcy5pZCA9IGluc3RhbmNlSWQ7XHJcbiAgICB0aGlzLl9jb3B5UGFyc0Zyb21Ib3N0KCk7XHJcbn1cclxuXHJcbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLmNhbGxNZXRob2QgPSBhc3luYyhcclxuICAgIGZ1bmN0aW9uKiAobWV0aG9kTmFtZSwgYXJncykge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIGVuZE1ldGhvZFJlYWNoZWQgPSBmYWxzZTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcclxuICAgICAgICBzZWxmLl9lbmRNZXRob2RDYWxsYmFjayA9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChtbiwgaXAsIHIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtbiA9PT0gbWV0aG9kTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZE1ldGhvZFJlYWNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBpZGxlTWV0aG9kcyA9IFtdO1xyXG4gICAgICAgIHNlbGYuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrID1cclxuICAgICAgICAgICAgZnVuY3Rpb24gKG1uLCBpcCkge1xyXG4gICAgICAgICAgICAgICAgaWRsZU1ldGhvZHMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogaXBcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgeWllbGQgc2VsZi5fZW5naW5lLnJlc3VtZUJvb2ttYXJrKHNwZWNTdHJpbmdzLmhvc3RpbmcuY3JlYXRlQmVnaW5NZXRob2RCTU5hbWUobWV0aG9kTmFtZSksIGVudW1zLkFjdGl2aXR5U3RhdGVzLmNvbXBsZXRlLCBhcmdzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZW5kTWV0aG9kUmVhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBoYXMgYmVlbiBjb21wbGV0ZWQgb3IgZ29uZSB0byBpZGxlIHdpdGhvdXQgcmVhY2hpbmcgYW4gRW5kTWV0aG9kIGFjdGl2aXR5IG9mIG1ldGhvZCBuYW1lICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpZGxlTWV0aG9kcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBnb25lIHRvIGlkbGUsIGJ1dCB0aGVyZSBpcyBubyBhY3RpdmUgQmVnaW5NZXRob2QgYWN0aXZpdGllcyB0byB3YWl0IGZvciAoVE9ETzogVGltZXIgc3VwcG9ydCBlcnJvcnMgbWlnaHQgYmUgY2F1c2VzIHRoaXMgZXJyb3IuKS5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaWRsZU1ldGhvZHMubGVuZ3RoICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhhcyBjb21wbGV0ZWQsIGJ1dCB0aGVyZSBpcyBhY3RpdmUgQmVnaW5NZXRob2QgYWN0aXZpdGllcyB0byB3YWl0IGZvciAoVE9ETzogVGltZXIgc3VwcG9ydCBlcnJvcnMgbWlnaHQgYmUgY2F1c2VzIHRoaXMgZXJyb3IuKS5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkge1xyXG4gICAgICAgICAgICBzZWxmLl9jbGVhckNhbGxiYWNrcygpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2NvcHlQYXJzRnJvbUhvc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBmYXN0LmZvckVhY2goc2VsZi5faG9zdC5fdHJhY2tlcnMsXHJcbiAgICAgICAgZnVuY3Rpb24gKHQpIHtcclxuICAgICAgICAgICAgc2VsZi5fZW5naW5lLmFkZFRyYWNrZXIodCk7XHJcbiAgICAgICAgfSk7XHJcbn1cclxuXHJcbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLl9hZGRNeVRyYWNrZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fYWRkQmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdEhlbHBlclRyYWNrZXIoKTtcclxuICAgIHRoaXMuX2FkZEVuZE1ldGhvZEhlbHBlclRyYWNrZXIoKTtcclxuICAgIHRoaXMuX2FkZElkbGVJbnN0YW5jZUlkUGF0aFRyYWNrZXIoKTtcclxufVxyXG5cclxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2NsZWFyQ2FsbGJhY2tzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fYmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdENhbGxiYWNrID0gbnVsbDtcclxuICAgIHRoaXMuX2VuZE1ldGhvZENhbGxiYWNrID0gbnVsbDtcclxuICAgIHRoaXMuX2lkbGVJbnN0YW5jZUlkUGF0aENhbGxiYWNrID0gbnVsbDtcclxufVxyXG5cclxuV29ya2Zsb3dJbnN0YW5jZS5wcm90b3R5cGUuX2FkZEJlZ2luTWV0aG9kV2l0aENyZWF0ZUluc3RIZWxwZXJUcmFja2VyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIHRyYWNrZXIgPSB7XHJcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUZpbHRlcjogZnVuY3Rpb24gKGFjdGl2aXR5LCByZWFzb24sIHJlc3VsdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5fYmVnaW5NZXRob2RXaXRoQ3JlYXRlSW5zdENhbGxiYWNrICYmXHJcbiAgICAgICAgICAgICAgICBhY3Rpdml0eSBpbnN0YW5jZW9mIEJlZ2luTWV0aG9kICYmXHJcbiAgICAgICAgICAgICAgICBhY3Rpdml0eS5jYW5DcmVhdGVJbnN0YW5jZSAmJlxyXG4gICAgICAgICAgICAgICAgXyhhY3Rpdml0eS5tZXRob2ROYW1lKS5pc1N0cmluZygpICYmXHJcbiAgICAgICAgICAgICAgICAoIWFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoIHx8IF8oYWN0aXZpdHkuaW5zdGFuY2VJZFBhdGgpLmlzU3RyaW5nKCkpICYmXHJcbiAgICAgICAgICAgICAgICByZWFzb24gPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhY3Rpdml0eVN0YXRlQ2hhbmdlZDogZnVuY3Rpb24gKGFjdGl2aXR5LCByZWFzb24sIHJlc3VsdCkge1xyXG4gICAgICAgICAgICB2YXIgbWV0aG9kTmFtZSA9IGFjdGl2aXR5Lm1ldGhvZE5hbWUudHJpbSgpO1xyXG4gICAgICAgICAgICB2YXIgaW5zdGFuY2VJZFBhdGggPSBhY3Rpdml0eS5pbnN0YW5jZUlkUGF0aCA/IGFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoLnRyaW0oKSA6IG51bGw7XHJcbiAgICAgICAgICAgIHNlbGYuX2JlZ2luTWV0aG9kV2l0aENyZWF0ZUluc3RDYWxsYmFjayhtZXRob2ROYW1lLCBpbnN0YW5jZUlkUGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHNlbGYuX2VuZ2luZS5hZGRUcmFja2VyKHRyYWNrZXIpO1xyXG59XHJcblxyXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5fYWRkRW5kTWV0aG9kSGVscGVyVHJhY2tlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHZhciB0cmFja2VyID0ge1xyXG4gICAgICAgIGFjdGl2aXR5U3RhdGVGaWx0ZXI6IGZ1bmN0aW9uIChhY3Rpdml0eSwgcmVhc29uLCByZXN1bHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2VuZE1ldGhvZENhbGxiYWNrICYmXHJcbiAgICAgICAgICAgICAgICBhY3Rpdml0eSBpbnN0YW5jZW9mIEVuZE1ldGhvZCAmJlxyXG4gICAgICAgICAgICAgICAgXyhhY3Rpdml0eS5tZXRob2ROYW1lKS5pc1N0cmluZygpICYmXHJcbiAgICAgICAgICAgICAgICAoIWFjdGl2aXR5Lmluc3RhbmNlSWRQYXRoIHx8IF8oYWN0aXZpdHkuaW5zdGFuY2VJZFBhdGgpLmlzU3RyaW5nKCkpICYmXHJcbiAgICAgICAgICAgICAgICByZWFzb24gPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmNvbXBsZXRlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUNoYW5nZWQ6IGZ1bmN0aW9uIChhY3Rpdml0eSwgcmVhc29uLCByZXN1bHQpIHtcclxuICAgICAgICAgICAgdmFyIG1ldGhvZE5hbWUgPSBhY3Rpdml0eS5tZXRob2ROYW1lLnRyaW0oKTtcclxuICAgICAgICAgICAgdmFyIGluc3RhbmNlSWRQYXRoID0gYWN0aXZpdHkuaW5zdGFuY2VJZFBhdGggPyBhY3Rpdml0eS5pbnN0YW5jZUlkUGF0aC50cmltKCkgOiBudWxsO1xyXG4gICAgICAgICAgICBzZWxmLl9lbmRNZXRob2RDYWxsYmFjayhtZXRob2ROYW1lLCBpbnN0YW5jZUlkUGF0aCwgcmVzdWx0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgc2VsZi5fZW5naW5lLmFkZFRyYWNrZXIodHJhY2tlcik7XHJcbn1cclxuXHJcbldvcmtmbG93SW5zdGFuY2UucHJvdG90eXBlLl9hZGRJZGxlSW5zdGFuY2VJZFBhdGhUcmFja2VyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIHRyYWNrZXIgPSB7XHJcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUZpbHRlcjogZnVuY3Rpb24gKGFjdGl2aXR5LCByZWFzb24sIHJlc3VsdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5faWRsZUluc3RhbmNlSWRQYXRoQ2FsbGJhY2sgJiZcclxuICAgICAgICAgICAgICAgIGFjdGl2aXR5IGluc3RhbmNlb2YgQmVnaW5NZXRob2QgJiZcclxuICAgICAgICAgICAgICAgIF8oYWN0aXZpdHkubWV0aG9kTmFtZSkuaXNTdHJpbmcoKSAmJlxyXG4gICAgICAgICAgICAgICAgXyhhY3Rpdml0eS5pbnN0YW5jZUlkUGF0aCkuaXNTdHJpbmcoKSAmJlxyXG4gICAgICAgICAgICAgICAgcmVhc29uID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWN0aXZpdHlTdGF0ZUNoYW5nZWQ6IGZ1bmN0aW9uIChhY3Rpdml0eSwgcmVhc29uLCByZXN1bHQpIHtcclxuICAgICAgICAgICAgdmFyIG1ldGhvZE5hbWUgPSBhY3Rpdml0eS5tZXRob2ROYW1lLnRyaW0oKTtcclxuICAgICAgICAgICAgdmFyIGluc3RhbmNlSWRQYXRoID0gYWN0aXZpdHkuaW5zdGFuY2VJZFBhdGgudHJpbSgpO1xyXG4gICAgICAgICAgICBzZWxmLl9pZGxlSW5zdGFuY2VJZFBhdGhDYWxsYmFjayhtZXRob2ROYW1lLCBpbnN0YW5jZUlkUGF0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHNlbGYuX2VuZ2luZS5hZGRUcmFja2VyKHRyYWNrZXIpO1xyXG59XHJcblxyXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5nZXRTdGF0ZVRvUGVyc2lzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzcCA9IHRoaXMuX2VuZ2luZS5nZXRTdGF0ZUFuZFByb21vdGlvbnModGhpcy5faG9zdC5vcHRpb25zLnNlcmlhbGl6ZXIsIHRoaXMuX2hvc3Qub3B0aW9ucy5lbmFibGVQcm9tb3Rpb25zKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaW5zdGFuY2VJZDogdGhpcy5pZCxcclxuICAgICAgICBjcmVhdGVkT246IHRoaXMuY3JlYXRlZE9uLFxyXG4gICAgICAgIHdvcmtmbG93TmFtZTogdGhpcy53b3JrZmxvd05hbWUsXHJcbiAgICAgICAgd29ya2Zsb3dWZXJzaW9uOiB0aGlzLndvcmtmbG93VmVyc2lvbixcclxuICAgICAgICB1cGRhdGVkT246IHRoaXMuX2VuZ2luZS51cGRhdGVkT24sXHJcbiAgICAgICAgc3RhdGU6IHNwLnN0YXRlLFxyXG4gICAgICAgIHByb21vdGVkUHJvcGVydGllczogc3AucHJvbW90ZWRQcm9wZXJ0aWVzXHJcbiAgICB9O1xyXG59XHJcblxyXG5Xb3JrZmxvd0luc3RhbmNlLnByb3RvdHlwZS5yZXN0b3JlU3RhdGUgPSBmdW5jdGlvbiAoanNvbikge1xyXG4gICAgaWYgKCFfLmlzT2JqZWN0KGpzb24pKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ2pzb24nIGlzIG5vdCBhbiBvYmplY3QuXCIpO1xyXG4gICAgaWYgKGpzb24uaW5zdGFuY2VJZCAhPT0gdGhpcy5pZCkgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgaW5zdGFuY2VJZCBwcm9wZXJ0eSB2YWx1ZSBvZiAnXCIgKyBqc29uLmluc3RhbmNlSWQgKyBcIicgaXMgZGlmZmVyZW50IHRoYW4gdGhlIGN1cnJlbnQgaW5zdGFuY2UgaWQgJ1wiICsgdGhpcy5pZCArIFwiJy5cIik7XHJcbiAgICBpZiAoanNvbi53b3JrZmxvd05hbWUgIT09IHRoaXMud29ya2Zsb3dOYW1lKSB0aHJvdyBuZXcgRXJyb3IoXCJTdGF0ZSB3b3JrZmxvd05hbWUgcHJvcGVydHkgdmFsdWUgb2YgJ1wiICsganNvbi53b3JrZmxvd05hbWUgKyBcIicgaXMgZGlmZmVyZW50IHRoYW4gdGhlIGN1cnJlbnQgV29ya2Zsb3cgbmFtZSAnXCIgKyB0aGlzLndvcmtmbG93TmFtZSArIFwiJy5cIik7XHJcbiAgICBpZiAoanNvbi53b3JrZmxvd1ZlcnNpb24gIT09IHRoaXMud29ya2Zsb3dWZXJzaW9uKSB0aHJvdyBuZXcgRXJyb3IoXCJTdGF0ZSB3b3JrZmxvd05hbWUgcHJvcGVydHkgdmFsdWUgb2YgJ1wiICsganNvbi53b3JrZmxvd1ZlcnNpb24gKyBcIicgaXMgZGlmZmVyZW50IHRoYW4gdGhlIGN1cnJlbnQgV29ya2Zsb3cgdmVyc2lvbiAnXCIgKyB0aGlzLndvcmtmbG93VmVyc2lvbiArIFwiJy5cIik7XHJcbiAgICBpZiAoIV8uaXNEYXRlKGpzb24uY3JlYXRlZE9uKSkgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgY3JlYXRlZE9uIHByb3BlcnR5IHZhbHVlIG9mICdcIiArIGpzb24uY3JlYXRlZE9uICsgXCInIGlzIG5vdCBhIERhdGUuXCIpO1xyXG5cclxuICAgIHRoaXMuX2NyZWF0ZWRPbiA9IGpzb24uY3JlYXRlZE9uO1xyXG4gICAgdGhpcy5fZW5naW5lLnNldFN0YXRlKHRoaXMuX2hvc3Qub3B0aW9ucy5zZXJpYWxpemVyLCBqc29uLnN0YXRlKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBXb3JrZmxvd0luc3RhbmNlO1xyXG4iXX0=
