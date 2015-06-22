"use strict";
var WorkflowRegistry = require("./workflowRegistry");
var _ = require("lodash");
var Activity = require("../activities/activity");
var Workflow = require("../activities/workflow");
var WorkflowPersistence = require("./workflowPersistence");
var WorkflowInstance = require("./workflowInstance");
var InstanceIdParser = require("./instanceIdParser");
var enums = require("../common/enums");
var Promise = require("bluebird");
var KnownInstaStore = require("./knownInstaStore");
var specStrings = require("../common/specStrings");
var errors = require("../common/errors");
var Serializer = require("backpack-node").system.Serializer;
var is = require("../common/is");
var fast = require("fast.js");
var KeepLockAlive = require("./keepLockAlive");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;
function WorkflowHost(options) {
  this._registry = new WorkflowRegistry();
  this._trackers = [];
  this._isInitialized = false;
  this._instanceIdParser = new InstanceIdParser();
  this._persistence = null;
  this._options = _.extend({
    enterLockTimeout: 10000,
    lockRenewalTimeout: 5000,
    alwaysLoadState: false,
    lazyPersistence: true,
    persistence: null,
    serializer: null,
    enablePromotions: false
  }, options);
  if (this._options.persistence !== null)
    this._persistence = new WorkflowPersistence(this._options.persistence);
  this._knownRunningInstances = new KnownInstaStore();
}
Object.defineProperties(WorkflowHost.prototype, {
  options: {get: function() {
      return this._options;
    }},
  isInitialized: {get: function() {
      return this._isInitialized;
    }},
  instanceIdParser: {get: function() {
      return this._instanceIdParser;
    }},
  _inLockTimeout: {get: function() {
      return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
    }}
});
WorkflowHost.prototype.registerWorkflow = function(workflow) {
  this._registry.register(workflow);
};
WorkflowHost.prototype.registerActivity = function(activity, name, version) {
  if (!(activity instanceof Activity))
    throw new TypeError("Activity argument expected.");
  var wf = new Workflow();
  wf.name = name;
  wf.version = version;
  wf.args = [activity];
  this._registry.register(wf);
};
WorkflowHost.prototype._initialize = function() {
  if (!this._isInitialized) {
    this._isInitialized = true;
  }
};
WorkflowHost.prototype.invokeMethod = async($traceurRuntime.initGeneratorFunction(function $__0(workflowName, methodName, args) {
  var self,
      instanceId,
      creatableWorkflow,
      results,
      i,
      result,
      $__1,
      $__2,
      $__3,
      $__4,
      $__5,
      $__6,
      $__7,
      $__8,
      $__9,
      $__10,
      $__11;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          if (!_(workflowName).isString())
            throw new TypeError("Argument 'workflowName' is not a string.");
          workflowName = workflowName.trim();
          if (!_(methodName).isString())
            throw new TypeError("Argument 'methodName' is not a string.");
          methodName = methodName.trim();
          if (is.defined(args) && !_.isArray(args))
            args = [args];
          self = this;
          self._initialize();
          instanceId = null;
          creatableWorkflow = null;
          results = [];
          self._registry.forEachMethodInfo(workflowName, methodName, function(info) {
            var tryId = self._instanceIdParser.parse(info.instanceIdPath, args);
            if (is.defined(tryId))
              results.push({
                info: info,
                id: tryId
              });
          });
          $ctx.state = 43;
          break;
        case 43:
          i = 0;
          $ctx.state = 21;
          break;
        case 21:
          $ctx.state = (i < results.length) ? 17 : 19;
          break;
        case 13:
          i++;
          $ctx.state = 21;
          break;
        case 17:
          result = results[i];
          if (result.info.canCreateInstance && (!creatableWorkflow || creatableWorkflow.version < result.info.workflow)) {
            creatableWorkflow = result.info.workflow;
          }
          $ctx.state = 18;
          break;
        case 18:
          $ctx.state = (!instanceId) ? 5 : 9;
          break;
        case 5:
          $__1 = self._checkIfInstanceRunning;
          $__2 = result.id;
          $__3 = $__1.call(self, workflowName, $__2);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__3;
        case 2:
          $__4 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__5 = $__4;
          $ctx.state = 8;
          break;
        case 9:
          $__5 = !instanceId;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__5) ? 14 : 13;
          break;
        case 14:
          instanceId = result.id;
          $ctx.state = 19;
          break;
        case 19:
          $ctx.state = (instanceId) ? 26 : 40;
          break;
        case 26:
          $__6 = self._invokeMethodOnRunningInstance;
          $__7 = $__6.call(self, instanceId, workflowName, methodName, args);
          $ctx.state = 27;
          break;
        case 27:
          $ctx.state = 23;
          return $__7;
        case 23:
          $__8 = $ctx.sent;
          $ctx.state = 25;
          break;
        case 25:
          $ctx.returnValue = $__8;
          $ctx.state = -2;
          break;
        case 40:
          $ctx.state = (creatableWorkflow) ? 34 : 38;
          break;
        case 34:
          $__9 = self._createInstanceAndInvokeMethod;
          $__10 = $__9.call(self, creatableWorkflow, workflowName, methodName, args);
          $ctx.state = 35;
          break;
        case 35:
          $ctx.state = 31;
          return $__10;
        case 31:
          $__11 = $ctx.sent;
          $ctx.state = 33;
          break;
        case 33:
          $ctx.returnValue = $__11;
          $ctx.state = -2;
          break;
        case 38:
          throw new errors.WorkflowError("Cannot create or continue workflow '" + workflowName + "' by calling method '" + methodName + "'.");
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__0, this);
}));
WorkflowHost.prototype._createInstanceAndInvokeMethod = async($traceurRuntime.initGeneratorFunction(function $__12(workflow, workflowName, methodName, args) {
  var self,
      lockInfo,
      insta,
      result,
      keepLockAlive,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          lockInfo = null;
          $ctx.state = 62;
          break;
        case 62:
          $ctx.state = (!self._persistence) ? 7 : 58;
          break;
        case 7:
          insta = new WorkflowInstance(self);
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = 2;
          return (insta.create(workflow, methodName, args, lockInfo));
        case 2:
          result = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          self._knownRunningInstances.add(workflowName, insta);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.returnValue = result;
          $ctx.state = -2;
          break;
        case 58:
          lockInfo = {
            id: null,
            name: null,
            heldTo: null
          };
          keepLockAlive = new KeepLockAlive(self._persistence, lockInfo, self._inLockTimeout, self.options.lockRenewalTimeout);
          $ctx.state = 59;
          break;
        case 59:
          $ctx.pushTry(null, 51);
          $ctx.state = 53;
          break;
        case 53:
          insta = new WorkflowInstance(self);
          $ctx.state = 49;
          break;
        case 49:
          $ctx.state = 12;
          return (insta.create(workflow, methodName, args, lockInfo));
        case 12:
          result = $ctx.sent;
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = (insta.execState === enums.ActivityStates.idle) ? 43 : 45;
          break;
        case 43:
          self._knownRunningInstances.add(workflowName, insta);
          $ctx.state = 44;
          break;
        case 44:
          $ctx.pushTry(19, null);
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = 16;
          return self._persistence.persistState(insta);
        case 16:
          $ctx.maybeThrow();
          $ctx.state = 18;
          break;
        case 18:
          $ctx.popTry();
          $ctx.state = 24;
          break;
        case 19:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 25;
          break;
        case 25:
          console.log("Cannot persist instance of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
          self._knownRunningInstances.remove(workflowName, insta.id);
          $ctx.state = 24;
          break;
        case 24:
          $ctx.pushTry(32, null);
          $ctx.state = 35;
          break;
        case 35:
          $ctx.state = 29;
          return self._persistence.exitLock(lockInfo.id);
        case 29:
          $ctx.maybeThrow();
          $ctx.state = 31;
          break;
        case 31:
          $ctx.popTry();
          $ctx.state = 37;
          break;
        case 32:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 38;
          break;
        case 38:
          console.log("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
          $ctx.state = 37;
          break;
        case 37:
          $ctx.returnValue = result;
          $ctx.state = 51;
          $ctx.finallyFallThrough = -2;
          break;
        case 45:
          $ctx.returnValue = result;
          $ctx.state = 51;
          $ctx.finallyFallThrough = -2;
          break;
        case 51:
          $ctx.popTry();
          $ctx.state = 57;
          break;
        case 57:
          keepLockAlive.end();
          $ctx.state = 55;
          break;
        case 55:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__12, this);
}));
WorkflowHost.prototype._invokeMethodOnRunningInstance = async($traceurRuntime.initGeneratorFunction(function $__13(instanceId, workflowName, methodName, args) {
  var self,
      insta,
      result,
      lockName,
      lockInfo,
      keepLockAlive,
      persistAndUnlock,
      e,
      removeE,
      exitE;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          $ctx.state = 148;
          break;
        case 148:
          $ctx.state = (!self._persistence) ? 1 : 144;
          break;
        case 1:
          $ctx.state = 2;
          return (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
        case 2:
          insta = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.pushTry(19, null);
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = 6;
          return (insta.callMethod(methodName, args));
        case 6:
          result = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = (insta.execState === enums.ActivityStates.idle) ? 9 : 17;
          break;
        case 9:
          $ctx.returnValue = result;
          $ctx.state = -2;
          break;
        case 17:
          $ctx.state = (insta.execState === enums.ActivityStates.complete) ? 13 : 15;
          break;
        case 13:
          self._knownRunningInstances.remove(workflowName, insta.id);
          $ctx.state = 14;
          break;
        case 14:
          $ctx.returnValue = result;
          $ctx.state = -2;
          break;
        case 15:
          throw new errors.WorkflowError("Instance '" + insta.id + "' is in an invalid state '" + insta.execState + "' after invocation of the method '" + methodName + "'.");
          $ctx.state = 10;
          break;
        case 10:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 19:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 25;
          break;
        case 25:
          self._knownRunningInstances.remove(workflowName, insta.id);
          throw e;
          $ctx.state = -2;
          break;
        case 144:
          lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
          $ctx.state = 145;
          break;
        case 145:
          $ctx.state = 29;
          return (self._persistence.enterLock(lockName, self.options.enterLockTimeout, self._inLockTimeout));
        case 29:
          lockInfo = $ctx.sent;
          $ctx.state = 31;
          break;
        case 31:
          $ctx.pushTry(137, null);
          $ctx.state = 140;
          break;
        case 140:
          keepLockAlive = new KeepLockAlive(self._persistence, lockInfo, self._inLockTimeout, self.options.lockRenewalTimeout);
          $ctx.state = 119;
          break;
        case 119:
          $ctx.state = 33;
          return (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
        case 33:
          insta = $ctx.sent;
          $ctx.state = 35;
          break;
        case 35:
          $ctx.pushTry(111, null);
          $ctx.state = 114;
          break;
        case 114:
          $ctx.state = 37;
          return (insta.callMethod(methodName, args));
        case 37:
          result = $ctx.sent;
          $ctx.state = 39;
          break;
        case 39:
          $ctx.state = (insta.execState === enums.ActivityStates.idle) ? 49 : 91;
          break;
        case 49:
          persistAndUnlock = function() {
            return self._persistence.persistState(insta).catch(function(e) {
              console.log("Cannot persist instance for workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
              self._knownRunningInstances.remove(workflowName, insta.id);
            }).finally(function() {
              return self._persistence.exitLock(lockInfo.id).catch(function(e) {
                console.log("Cannot exit lock for workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
              }).finally(function() {
                keepLockAlive.end();
              });
            });
          };
          $ctx.state = 50;
          break;
        case 50:
          $ctx.state = (self.options.lazyPersistence) ? 44 : 40;
          break;
        case 44:
          setTimeout(function() {
            persistAndUnlock();
          }, 0);
          $ctx.state = 45;
          break;
        case 40:
          $ctx.state = 41;
          return persistAndUnlock();
        case 41:
          $ctx.maybeThrow();
          $ctx.state = 45;
          break;
        case 45:
          $ctx.returnValue = result;
          $ctx.state = -2;
          break;
        case 91:
          $ctx.state = (insta.execState === enums.ActivityStates.complete) ? 87 : 89;
          break;
        case 87:
          self._knownRunningInstances.remove(workflowName, insta.id);
          $ctx.state = 88;
          break;
        case 88:
          $ctx.pushTry(null, 78);
          $ctx.state = 80;
          break;
        case 80:
          $ctx.pushTry(55, null);
          $ctx.state = 58;
          break;
        case 58:
          $ctx.state = 52;
          return self._persistence.removeState(workflowName, insta.id, true);
        case 52:
          $ctx.maybeThrow();
          $ctx.state = 54;
          break;
        case 54:
          $ctx.popTry();
          $ctx.state = 60;
          break;
        case 55:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 61;
          break;
        case 61:
          console.log("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
          $ctx.state = 60;
          break;
        case 60:
          $ctx.pushTry(68, null);
          $ctx.state = 71;
          break;
        case 71:
          $ctx.state = 65;
          return self._persistence.exitLock(lockInfo.id);
        case 65:
          $ctx.maybeThrow();
          $ctx.state = 67;
          break;
        case 67:
          $ctx.popTry();
          $ctx.state = 78;
          $ctx.finallyFallThrough = 73;
          break;
        case 68:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 74;
          break;
        case 74:
          console.log("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
          $ctx.state = 78;
          $ctx.finallyFallThrough = 73;
          break;
        case 78:
          $ctx.popTry();
          $ctx.state = 84;
          break;
        case 84:
          keepLockAlive.end();
          $ctx.state = 82;
          break;
        case 73:
          $ctx.returnValue = result;
          $ctx.state = -2;
          break;
        case 89:
          throw new errors.WorkflowError("Instance '" + insta.id + "' is in an invalid state '" + insta.execState + "' after invocation of the method '" + methodName + "'.");
          $ctx.state = 48;
          break;
        case 48:
          $ctx.popTry();
          $ctx.state = 116;
          break;
        case 111:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 107;
          break;
        case 107:
          self._knownRunningInstances.remove(workflowName, insta.id);
          $ctx.state = 108;
          break;
        case 108:
          $ctx.state = (self._persistence) ? 99 : 102;
          break;
        case 99:
          $ctx.pushTry(97, null);
          $ctx.state = 100;
          break;
        case 100:
          $ctx.state = 94;
          return (self._persistence.removeState(workflowName, insta.id, false, e));
        case 94:
          $ctx.maybeThrow();
          $ctx.state = 96;
          break;
        case 96:
          $ctx.popTry();
          $ctx.state = 102;
          break;
        case 97:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          removeE = $ctx.storedException;
          $ctx.state = 103;
          break;
        case 103:
          console.log("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + removeE.stack);
          $ctx.state = 102;
          break;
        case 102:
          throw e;
          $ctx.state = 116;
          break;
        case 116:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 137:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 133;
          break;
        case 133:
          if (keepLockAlive)
            keepLockAlive.end();
          $ctx.state = 134;
          break;
        case 134:
          $ctx.pushTry(124, null);
          $ctx.state = 127;
          break;
        case 127:
          $ctx.state = 121;
          return self._persistence.exitLock(lockInfo.id);
        case 121:
          $ctx.maybeThrow();
          $ctx.state = 123;
          break;
        case 123:
          $ctx.popTry();
          $ctx.state = 129;
          break;
        case 124:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          exitE = $ctx.storedException;
          $ctx.state = 130;
          break;
        case 130:
          console.log("Cannot exit lock '" + lockInfo.id + "':\n" + exitE.stack);
          $ctx.state = 129;
          break;
        case 129:
          throw e;
          $ctx.state = -2;
          break;
        case 82:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__13, this);
}));
WorkflowHost.prototype._enterLockForCreatedInstance = async($traceurRuntime.initGeneratorFunction(function $__14(insta, lockInfo) {
  var li,
      $__15,
      $__16,
      $__17,
      $__18,
      $__19,
      $__20;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = 2;
          return (this._persistence.enterLock(specStrings.hosting.doubleKeys(insta.workflowName, insta.id), this.options.enterLockTimeout, this._getInLockTimeout()));
        case 2:
          li = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__15 = this._persistence;
          $__16 = $__15.isRunning;
          $__17 = insta.workflowName;
          $__18 = insta.id;
          $__19 = $__16.call($__15, $__17, $__18);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return $__19;
        case 6:
          $__20 = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__20) ? 11 : 12;
          break;
        case 11:
          throw new errors.WorkflowError("Cannot create instance of workflow '" + insta.workflowName + "' by id '" + insta.id + "' because it's already exists.");
          $ctx.state = 12;
          break;
        case 12:
          lockInfo.id = li.id;
          lockInfo.name = li.name;
          lockInfo.heldTo = li.heldTo;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__14, this);
}));
WorkflowHost.prototype._getInLockTimeout = function() {
  return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
};
WorkflowHost.prototype._verifyAndRestoreInstanceState = async($traceurRuntime.initGeneratorFunction(function $__21(instanceId, workflowName, methodName, args) {
  var self,
      insta,
      errorText,
      header,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          insta = null;
          errorText = function() {
            return "Instance '" + instanceId + "' has been invoked elsewhere since the lock took in the current host.";
          };
          $ctx.state = 24;
          break;
        case 24:
          $ctx.state = (self._persistence) ? 11 : 18;
          break;
        case 11:
          $ctx.pushTry(9, null);
          $ctx.state = 12;
          break;
        case 12:
          $ctx.state = 2;
          return (self._persistence.getRunningInstanceIdHeader(workflowName, instanceId));
        case 2:
          header = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = 6;
          return (self._restoreInstanceState(instanceId, workflowName, header.workflowVersion, header.updatedOn));
        case 6:
          insta = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.popTry();
          $ctx.state = 14;
          break;
        case 9:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 15;
          break;
        case 15:
          if (e instanceof errors.WorkflowError)
            throw e;
          throw new errors.WorkflowError(errorText() + "\nInner error:\n" + e.stack.toString());
          $ctx.state = 14;
          break;
        case 18:
          insta = self._knownRunningInstances.get(workflowName, instanceId);
          if (!insta)
            throw new errors.WorkflowError(errorText() + " Inner error: instance " + instanceId + " is unknown.");
          $ctx.state = 14;
          break;
        case 14:
          $ctx.returnValue = insta;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__21, this);
}));
WorkflowHost.prototype._restoreInstanceState = async($traceurRuntime.initGeneratorFunction(function $__22(instanceId, workflowName, workflowVersion, actualTimestamp) {
  var self,
      insta,
      wfDesc,
      state;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          if (!self._persistence)
            throw new Error("Cannot restore instance from persistence, because host has no persistence registered.");
          insta = self._knownRunningInstances.get(workflowName, instanceId);
          if (is.undefined(insta)) {
            wfDesc = self._registry.getDesc(workflowName, workflowVersion);
            insta = new WorkflowInstance(this);
            insta.setWorkflow(wfDesc.workflow, instanceId);
          }
          $ctx.state = 13;
          break;
        case 13:
          $ctx.state = (insta.updatedOn === null || insta.updatedOn.getTime() !== actualTimestamp.getTime() || self.options.alwaysLoadState) ? 1 : 9;
          break;
        case 1:
          $ctx.state = 2;
          return (self._persistence.loadState(workflowName, instanceId));
        case 2:
          state = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          insta.restoreState(state);
          $ctx.state = 8;
          break;
        case 8:
          $ctx.returnValue = insta;
          $ctx.state = -2;
          break;
        case 9:
          $ctx.returnValue = insta;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__22, this);
}));
WorkflowHost.prototype._checkIfInstanceRunning = async($traceurRuntime.initGeneratorFunction(function $__23(workflowName, instanceId) {
  var $__24,
      $__25,
      $__26,
      $__27;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (this._knownRunningInstances.exists(workflowName, instanceId)) ? 1 : 2;
          break;
        case 1:
          $ctx.returnValue = true;
          $ctx.state = -2;
          break;
        case 2:
          $ctx.state = (this._persistence) ? 8 : 11;
          break;
        case 8:
          $__24 = this._persistence;
          $__25 = $__24.isRunning;
          $__26 = $__25.call($__24, workflowName, instanceId);
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = 5;
          return $__26;
        case 5:
          $__27 = $ctx.sent;
          $ctx.state = 7;
          break;
        case 7:
          $ctx.returnValue = $__27;
          $ctx.state = -2;
          break;
        case 11:
          $ctx.returnValue = false;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__23, this);
}));
WorkflowHost.prototype.addTracker = function(tracker) {
  if (!_(tracker).isObject())
    throw new TypeError("Argument is not an object.");
  this._trackers.push(tracker);
};
module.exports = WorkflowHost;
//# sourceMappingURL=data:application/json;base64,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LENBQUE7QUFFQSxLQUFLLFFBQVEsRUFBSSxhQUFXLENBQUM7QUFDN0IiLCJmaWxlIjoiaG9zdGluZy93b3JrZmxvd0hvc3QuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbInZhciBXb3JrZmxvd1JlZ2lzdHJ5ID0gcmVxdWlyZShcIi4vd29ya2Zsb3dSZWdpc3RyeVwiKTtcclxudmFyIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xyXG52YXIgQWN0aXZpdHkgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy9hY3Rpdml0eVwiKTtcclxudmFyIFdvcmtmbG93ID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvd29ya2Zsb3dcIik7XHJcbnZhciBXb3JrZmxvd1BlcnNpc3RlbmNlID0gcmVxdWlyZShcIi4vd29ya2Zsb3dQZXJzaXN0ZW5jZVwiKTtcclxudmFyIFdvcmtmbG93SW5zdGFuY2UgPSByZXF1aXJlKFwiLi93b3JrZmxvd0luc3RhbmNlXCIpO1xyXG52YXIgSW5zdGFuY2VJZFBhcnNlciA9IHJlcXVpcmUoXCIuL2luc3RhbmNlSWRQYXJzZXJcIik7XHJcbnZhciBlbnVtcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZW51bXNcIik7XHJcbnZhciBQcm9taXNlID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xyXG52YXIgS25vd25JbnN0YVN0b3JlID0gcmVxdWlyZShcIi4va25vd25JbnN0YVN0b3JlXCIpO1xyXG52YXIgc3BlY1N0cmluZ3MgPSByZXF1aXJlKFwiLi4vY29tbW9uL3NwZWNTdHJpbmdzXCIpO1xyXG52YXIgZXJyb3JzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lcnJvcnNcIik7XHJcbnZhciBTZXJpYWxpemVyID0gcmVxdWlyZShcImJhY2twYWNrLW5vZGVcIikuc3lzdGVtLlNlcmlhbGl6ZXI7XHJcbnZhciBpcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vaXNcIik7XHJcbnZhciBmYXN0ID0gcmVxdWlyZShcImZhc3QuanNcIik7XHJcbnZhciBLZWVwTG9ja0FsaXZlID0gcmVxdWlyZShcIi4va2VlcExvY2tBbGl2ZVwiKTtcclxudmFyIGFzeW5jSGVscGVycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vYXN5bmNIZWxwZXJzXCIpO1xyXG52YXIgYXN5bmMgPSBhc3luY0hlbHBlcnMuYXN5bmM7XHJcblxyXG5mdW5jdGlvbiBXb3JrZmxvd0hvc3Qob3B0aW9ucykge1xyXG4gICAgdGhpcy5fcmVnaXN0cnkgPSBuZXcgV29ya2Zsb3dSZWdpc3RyeSgpO1xyXG4gICAgdGhpcy5fdHJhY2tlcnMgPSBbXTtcclxuICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuX2luc3RhbmNlSWRQYXJzZXIgPSBuZXcgSW5zdGFuY2VJZFBhcnNlcigpO1xyXG4gICAgdGhpcy5fcGVyc2lzdGVuY2UgPSBudWxsO1xyXG4gICAgdGhpcy5fb3B0aW9ucyA9IF8uZXh0ZW5kKFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZW50ZXJMb2NrVGltZW91dDogMTAwMDAsXHJcbiAgICAgICAgICAgIGxvY2tSZW5ld2FsVGltZW91dDogNTAwMCxcclxuICAgICAgICAgICAgYWx3YXlzTG9hZFN0YXRlOiBmYWxzZSxcclxuICAgICAgICAgICAgbGF6eVBlcnNpc3RlbmNlOiB0cnVlLFxyXG4gICAgICAgICAgICBwZXJzaXN0ZW5jZTogbnVsbCxcclxuICAgICAgICAgICAgc2VyaWFsaXplcjogbnVsbCxcclxuICAgICAgICAgICAgZW5hYmxlUHJvbW90aW9uczogZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wdGlvbnMpO1xyXG5cclxuICAgIGlmICh0aGlzLl9vcHRpb25zLnBlcnNpc3RlbmNlICE9PSBudWxsKSB0aGlzLl9wZXJzaXN0ZW5jZSA9IG5ldyBXb3JrZmxvd1BlcnNpc3RlbmNlKHRoaXMuX29wdGlvbnMucGVyc2lzdGVuY2UpO1xyXG4gICAgdGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzID0gbmV3IEtub3duSW5zdGFTdG9yZSgpO1xyXG59XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhcclxuICAgIFdvcmtmbG93SG9zdC5wcm90b3R5cGUsIHtcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBpc0luaXRpYWxpemVkOiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzSW5pdGlhbGl6ZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBpbnN0YW5jZUlkUGFyc2VyOiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlSWRQYXJzZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBfaW5Mb2NrVGltZW91dDoge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICsgTWF0aC5tYXgodGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCAqIDAuNCwgMzAwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbldvcmtmbG93SG9zdC5wcm90b3R5cGUucmVnaXN0ZXJXb3JrZmxvdyA9IGZ1bmN0aW9uICh3b3JrZmxvdykge1xyXG4gICAgdGhpcy5fcmVnaXN0cnkucmVnaXN0ZXIod29ya2Zsb3cpO1xyXG59XHJcblxyXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLnJlZ2lzdGVyQWN0aXZpdHkgPSBmdW5jdGlvbiAoYWN0aXZpdHksIG5hbWUsIHZlcnNpb24pIHtcclxuICAgIGlmICghKGFjdGl2aXR5IGluc3RhbmNlb2YgQWN0aXZpdHkpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQWN0aXZpdHkgYXJndW1lbnQgZXhwZWN0ZWQuXCIpO1xyXG4gICAgdmFyIHdmID0gbmV3IFdvcmtmbG93KCk7XHJcbiAgICB3Zi5uYW1lID0gbmFtZTtcclxuICAgIHdmLnZlcnNpb24gPSB2ZXJzaW9uO1xyXG4gICAgd2YuYXJncyA9IFthY3Rpdml0eV07XHJcbiAgICB0aGlzLl9yZWdpc3RyeS5yZWdpc3Rlcih3Zik7XHJcbn1cclxuXHJcbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2luaXRpYWxpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAvLyBEbyBpbml0IGhlcmUgLi4uXHJcbiAgICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbldvcmtmbG93SG9zdC5wcm90b3R5cGUuaW52b2tlTWV0aG9kID0gYXN5bmMoXHJcbiAgICBmdW5jdGlvbiogKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykge1xyXG4gICAgICAgIGlmICghXyh3b3JrZmxvd05hbWUpLmlzU3RyaW5nKCkpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnd29ya2Zsb3dOYW1lJyBpcyBub3QgYSBzdHJpbmcuXCIpO1xyXG4gICAgICAgIHdvcmtmbG93TmFtZSA9IHdvcmtmbG93TmFtZS50cmltKCk7XHJcbiAgICAgICAgaWYgKCFfKG1ldGhvZE5hbWUpLmlzU3RyaW5nKCkpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnbWV0aG9kTmFtZScgaXMgbm90IGEgc3RyaW5nLlwiKTtcclxuICAgICAgICBtZXRob2ROYW1lID0gbWV0aG9kTmFtZS50cmltKCk7XHJcblxyXG4gICAgICAgIGlmIChpcy5kZWZpbmVkKGFyZ3MpICYmICFfLmlzQXJyYXkoYXJncykpIGFyZ3MgPSBbYXJnc107XHJcblxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgc2VsZi5faW5pdGlhbGl6ZSgpO1xyXG5cclxuICAgICAgICB2YXIgaW5zdGFuY2VJZCA9IG51bGw7XHJcbiAgICAgICAgdmFyIGNyZWF0YWJsZVdvcmtmbG93ID0gbnVsbDtcclxuXHJcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuICAgICAgICBzZWxmLl9yZWdpc3RyeS5mb3JFYWNoTWV0aG9kSW5mbyh3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGZ1bmN0aW9uIChpbmZvKSB7XHJcbiAgICAgICAgICAgIHZhciB0cnlJZCA9IHNlbGYuX2luc3RhbmNlSWRQYXJzZXIucGFyc2UoaW5mby5pbnN0YW5jZUlkUGF0aCwgYXJncyk7XHJcbiAgICAgICAgICAgIGlmIChpcy5kZWZpbmVkKHRyeUlkKSkgcmVzdWx0cy5wdXNoKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZm86IGluZm8sXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRyeUlkXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSByZXN1bHRzW2ldO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0LmluZm8uY2FuQ3JlYXRlSW5zdGFuY2UgJiYgKCFjcmVhdGFibGVXb3JrZmxvdyB8fCBjcmVhdGFibGVXb3JrZmxvdy52ZXJzaW9uIDwgcmVzdWx0LmluZm8ud29ya2Zsb3cpKSB7XHJcbiAgICAgICAgICAgICAgICBjcmVhdGFibGVXb3JrZmxvdyA9IHJlc3VsdC5pbmZvLndvcmtmbG93O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2VJZCAmJiAoeWllbGQgc2VsZi5fY2hlY2tJZkluc3RhbmNlUnVubmluZyh3b3JrZmxvd05hbWUsIHJlc3VsdC5pZCkpKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUlkID0gcmVzdWx0LmlkO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZUlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCAoc2VsZi5faW52b2tlTWV0aG9kT25SdW5uaW5nSW5zdGFuY2UoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGNyZWF0YWJsZVdvcmtmbG93KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCAoc2VsZi5fY3JlYXRlSW5zdGFuY2VBbmRJbnZva2VNZXRob2QoY3JlYXRhYmxlV29ya2Zsb3csIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiQ2Fubm90IGNyZWF0ZSBvciBjb250aW51ZSB3b3JrZmxvdyAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgYnkgY2FsbGluZyBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jcmVhdGVJbnN0YW5jZUFuZEludm9rZU1ldGhvZCA9IGFzeW5jKFxyXG4gICAgZnVuY3Rpb24qICh3b3JrZmxvdywgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgbG9ja0luZm8gPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuX3BlcnNpc3RlbmNlKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnN0YSA9IG5ldyBXb3JrZmxvd0luc3RhbmNlKHNlbGYpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0geWllbGQgKGluc3RhLmNyZWF0ZSh3b3JrZmxvdywgbWV0aG9kTmFtZSwgYXJncywgbG9ja0luZm8pKTtcclxuICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmFkZCh3b3JrZmxvd05hbWUsIGluc3RhKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxvY2tJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgaGVsZFRvOiBudWxsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vIFdoZW4gbG9jayB3aWxsIGhlbGQsIHRoZW4gd2Ugc2hvdWxkIGtlZXAgaXQgYWxpdmU6XHJcbiAgICAgICAgICAgIHZhciBrZWVwTG9ja0FsaXZlID0gbmV3IEtlZXBMb2NrQWxpdmUoc2VsZi5fcGVyc2lzdGVuY2UsIGxvY2tJbmZvLCBzZWxmLl9pbkxvY2tUaW1lb3V0LCBzZWxmLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0KTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhciBpbnN0YSA9IG5ldyBXb3JrZmxvd0luc3RhbmNlKHNlbGYpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHlpZWxkIChpbnN0YS5jcmVhdGUod29ya2Zsb3csIG1ldGhvZE5hbWUsIGFyZ3MsIGxvY2tJbmZvKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5hZGQod29ya2Zsb3dOYW1lLCBpbnN0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFBlcnNpc3QgYW5kIHVubG9jazpcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5wZXJzaXN0U3RhdGUoaW5zdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbm5vdCBwZXJzaXN0IGluc3RhbmNlIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IGV4aXQgbG9jayBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5faW52b2tlTWV0aG9kT25SdW5uaW5nSW5zdGFuY2UgPSBhc3luYyhcclxuICAgIGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoIXNlbGYuX3BlcnNpc3RlbmNlKSB7XHJcbiAgICAgICAgICAgIHZhciBpbnN0YSA9IHlpZWxkIChzZWxmLl92ZXJpZnlBbmRSZXN0b3JlSW5zdGFuY2VTdGF0ZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY2FsbE1ldGhvZChtZXRob2ROYW1lLCBhcmdzKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJJbnN0YW5jZSAnXCIgKyBpbnN0YS5pZCArIFwiJyBpcyBpbiBhbiBpbnZhbGlkIHN0YXRlICdcIiArIGluc3RhLmV4ZWNTdGF0ZSArIFwiJyBhZnRlciBpbnZvY2F0aW9uIG9mIHRoZSBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBMb2NrIGl0OlxyXG4gICAgICAgICAgICB2YXIgbG9ja05hbWUgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmRvdWJsZUtleXMod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcclxuICAgICAgICAgICAgdmFyIGxvY2tJbmZvID0geWllbGQgKHNlbGYuX3BlcnNpc3RlbmNlLmVudGVyTG9jayhsb2NrTmFtZSwgc2VsZi5vcHRpb25zLmVudGVyTG9ja1RpbWVvdXQsIHNlbGYuX2luTG9ja1RpbWVvdXQpKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gbG9jayB3aWxsIGhlbGQsIHRoZW4gd2Ugc2hvdWxkIGtlZXAgaXQgYWxpdmU6XHJcbiAgICAgICAgICAgICAgICB2YXIga2VlcExvY2tBbGl2ZSA9IG5ldyBLZWVwTG9ja0FsaXZlKHNlbGYuX3BlcnNpc3RlbmNlLCBsb2NrSW5mbywgc2VsZi5faW5Mb2NrVGltZW91dCwgc2VsZi5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTE9DS0VEXHJcbiAgICAgICAgICAgICAgICB2YXIgaW5zdGEgPSB5aWVsZCAoc2VsZi5fdmVyaWZ5QW5kUmVzdG9yZUluc3RhbmNlU3RhdGUoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY2FsbE1ldGhvZChtZXRob2ROYW1lLCBhcmdzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQZXJzaXN0IGFuZCB1bmxvY2s6XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBwZXJzaXN0QW5kVW5sb2NrKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX3BlcnNpc3RlbmNlLnBlcnNpc3RTdGF0ZShpbnN0YSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgcGVyc2lzdCBpbnN0YW5jZSBmb3Igd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluYWxseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IGV4aXQgbG9jayBmb3Igd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5sYXp5UGVyc2lzdGVuY2UpIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyc2lzdEFuZFVubG9jaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAwKTsgZWxzZSB5aWVsZCBwZXJzaXN0QW5kVW5sb2NrKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmNvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLnJlbW92ZVN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbm5vdCByZW1vdmUgc3RhdGUgb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IGV4aXQgbG9jayBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkluc3RhbmNlICdcIiArIGluc3RhLmlkICsgXCInIGlzIGluIGFuIGludmFsaWQgc3RhdGUgJ1wiICsgaW5zdGEuZXhlY1N0YXRlICsgXCInIGFmdGVyIGludm9jYXRpb24gb2YgdGhlIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuX3BlcnNpc3RlbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UucmVtb3ZlU3RhdGUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCwgZmFsc2UsIGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAocmVtb3ZlRSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgcmVtb3ZlIHN0YXRlIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIHJlbW92ZUUuc3RhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZWVwTG9ja0FsaXZlKSBrZWVwTG9ja0FsaXZlLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXhpdEUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbm5vdCBleGl0IGxvY2sgJ1wiICsgbG9ja0luZm8uaWQgKyBcIic6XFxuXCIgKyBleGl0RS5zdGFjayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UgPSBhc3luYyhcclxuICAgIGZ1bmN0aW9uKiAoaW5zdGEsIGxvY2tJbmZvKSB7XHJcbiAgICAgICAgdmFyIGxpID0geWllbGQgKHRoaXMuX3BlcnNpc3RlbmNlLmVudGVyTG9jayhzcGVjU3RyaW5ncy5ob3N0aW5nLmRvdWJsZUtleXMoaW5zdGEud29ya2Zsb3dOYW1lLCBpbnN0YS5pZCksIHRoaXMub3B0aW9ucy5lbnRlckxvY2tUaW1lb3V0LCB0aGlzLl9nZXRJbkxvY2tUaW1lb3V0KCkpKTtcclxuICAgICAgICBpZiAoeWllbGQgKHRoaXMuX3BlcnNpc3RlbmNlLmlzUnVubmluZyhpbnN0YS53b3JrZmxvd05hbWUsIGluc3RhLmlkKSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiQ2Fubm90IGNyZWF0ZSBpbnN0YW5jZSBvZiB3b3JrZmxvdyAnXCIgKyBpbnN0YS53b3JrZmxvd05hbWUgKyBcIicgYnkgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIicgYmVjYXVzZSBpdCdzIGFscmVhZHkgZXhpc3RzLlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbG9ja0luZm8uaWQgPSBsaS5pZDtcclxuICAgICAgICBsb2NrSW5mby5uYW1lID0gbGkubmFtZTtcclxuICAgICAgICBsb2NrSW5mby5oZWxkVG8gPSBsaS5oZWxkVG87XHJcbiAgICB9KTtcclxuXHJcbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2dldEluTG9ja1RpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCArIE1hdGgubWF4KHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKiAwLjQsIDMwMDApO1xyXG59XHJcblxyXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl92ZXJpZnlBbmRSZXN0b3JlSW5zdGFuY2VTdGF0ZSA9IGFzeW5jKFxyXG4gICAgZnVuY3Rpb24qIChpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGluc3RhID0gbnVsbDtcclxuICAgICAgICB2YXIgZXJyb3JUZXh0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJJbnN0YW5jZSAnXCIgKyBpbnN0YW5jZUlkICsgXCInIGhhcyBiZWVuIGludm9rZWQgZWxzZXdoZXJlIHNpbmNlIHRoZSBsb2NrIHRvb2sgaW4gdGhlIGN1cnJlbnQgaG9zdC5cIjtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChzZWxmLl9wZXJzaXN0ZW5jZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGhlYWRlciA9IHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5nZXRSdW5uaW5nSW5zdGFuY2VJZEhlYWRlcih3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKTtcclxuICAgICAgICAgICAgICAgIGluc3RhID0geWllbGQgKHNlbGYuX3Jlc3RvcmVJbnN0YW5jZVN0YXRlKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgaGVhZGVyLndvcmtmbG93VmVyc2lvbiwgaGVhZGVyLnVwZGF0ZWRPbikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5Xb3JrZmxvd0Vycm9yKSB0aHJvdyBlO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKGVycm9yVGV4dCgpICsgXCJcXG5Jbm5lciBlcnJvcjpcXG5cIiArIGUuc3RhY2sudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGluc3RhID0gc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldCh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xyXG4gICAgICAgICAgICBpZiAoIWluc3RhKSB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoZXJyb3JUZXh0KCkgKyBcIiBJbm5lciBlcnJvcjogaW5zdGFuY2UgXCIgKyBpbnN0YW5jZUlkICsgXCIgaXMgdW5rbm93bi5cIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaW5zdGE7XHJcbiAgICB9KTtcclxuXHJcbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX3Jlc3RvcmVJbnN0YW5jZVN0YXRlID0gYXN5bmMoXHJcbiAgICBmdW5jdGlvbiogKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgd29ya2Zsb3dWZXJzaW9uLCBhY3R1YWxUaW1lc3RhbXApIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICghc2VsZi5fcGVyc2lzdGVuY2UpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIGluc3RhbmNlIGZyb20gcGVyc2lzdGVuY2UsIGJlY2F1c2UgaG9zdCBoYXMgbm8gcGVyc2lzdGVuY2UgcmVnaXN0ZXJlZC5cIik7XHJcblxyXG4gICAgICAgIHZhciBpbnN0YSA9IHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5nZXQod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcclxuICAgICAgICBpZiAoaXMudW5kZWZpbmVkKGluc3RhKSkge1xyXG4gICAgICAgICAgICB2YXIgd2ZEZXNjID0gc2VsZi5fcmVnaXN0cnkuZ2V0RGVzYyh3b3JrZmxvd05hbWUsIHdvcmtmbG93VmVyc2lvbik7XHJcbiAgICAgICAgICAgIGluc3RhID0gbmV3IFdvcmtmbG93SW5zdGFuY2UodGhpcyk7XHJcbiAgICAgICAgICAgIGluc3RhLnNldFdvcmtmbG93KHdmRGVzYy53b3JrZmxvdywgaW5zdGFuY2VJZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5zdGEudXBkYXRlZE9uID09PSBudWxsIHx8IGluc3RhLnVwZGF0ZWRPbi5nZXRUaW1lKCkgIT09IGFjdHVhbFRpbWVzdGFtcC5nZXRUaW1lKCkgfHwgc2VsZi5vcHRpb25zLmFsd2F5c0xvYWRTdGF0ZSkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UubG9hZFN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpO1xyXG4gICAgICAgICAgICBpbnN0YS5yZXN0b3JlU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gaW5zdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5zdGE7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jaGVja0lmSW5zdGFuY2VSdW5uaW5nID0gYXN5bmMoXHJcbiAgICBmdW5jdGlvbiogKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuZXhpc3RzKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpIHJldHVybiB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLl9wZXJzaXN0ZW5jZSkgcmV0dXJuIHlpZWxkIHRoaXMuX3BlcnNpc3RlbmNlLmlzUnVubmluZyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5hZGRUcmFja2VyID0gZnVuY3Rpb24gKHRyYWNrZXIpIHtcclxuICAgIGlmICghXyh0cmFja2VyKS5pc09iamVjdCgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgaXMgbm90IGFuIG9iamVjdC5cIik7XHJcbiAgICB0aGlzLl90cmFja2Vycy5wdXNoKHRyYWNrZXIpO1xyXG4gICAgLy8gVE9ETzogYWRkIHRyYWNrZXIgdG8gYWxsIGluc3RhbmNlc1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmtmbG93SG9zdDtcclxuIl19
