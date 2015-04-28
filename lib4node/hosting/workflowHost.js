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
//# sourceMappingURL=data:application/json;base64,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LENBQUE7QUFFQSxLQUFLLFFBQVEsRUFBSSxhQUFXLENBQUM7QUFDN0IiLCJmaWxlIjoiaG9zdGluZy93b3JrZmxvd0hvc3QuanMiLCJzb3VyY2VSb290IjoiQzovR0lUL21vbmdvLWNydW5jaC9kZXBzL3dvcmtmbG93LTQtbm9kZS9saWIvIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFdvcmtmbG93UmVnaXN0cnkgPSByZXF1aXJlKFwiLi93b3JrZmxvd1JlZ2lzdHJ5XCIpO1xyXG52YXIgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XHJcbnZhciBBY3Rpdml0eSA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL2FjdGl2aXR5XCIpO1xyXG52YXIgV29ya2Zsb3cgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy93b3JrZmxvd1wiKTtcclxudmFyIFdvcmtmbG93UGVyc2lzdGVuY2UgPSByZXF1aXJlKFwiLi93b3JrZmxvd1BlcnNpc3RlbmNlXCIpO1xyXG52YXIgV29ya2Zsb3dJbnN0YW5jZSA9IHJlcXVpcmUoXCIuL3dvcmtmbG93SW5zdGFuY2VcIik7XHJcbnZhciBJbnN0YW5jZUlkUGFyc2VyID0gcmVxdWlyZShcIi4vaW5zdGFuY2VJZFBhcnNlclwiKTtcclxudmFyIGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcclxudmFyIFByb21pc2UgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XHJcbnZhciBLbm93bkluc3RhU3RvcmUgPSByZXF1aXJlKFwiLi9rbm93bkluc3RhU3RvcmVcIik7XHJcbnZhciBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XHJcbnZhciBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcclxudmFyIFNlcmlhbGl6ZXIgPSByZXF1aXJlKFwiYmFja3BhY2stbm9kZVwiKS5zeXN0ZW0uU2VyaWFsaXplcjtcclxudmFyIGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcclxudmFyIGZhc3QgPSByZXF1aXJlKFwiZmFzdC5qc1wiKTtcclxudmFyIEtlZXBMb2NrQWxpdmUgPSByZXF1aXJlKFwiLi9rZWVwTG9ja0FsaXZlXCIpO1xyXG52YXIgYXN5bmNIZWxwZXJzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9hc3luY0hlbHBlcnNcIik7XHJcbnZhciBhc3luYyA9IGFzeW5jSGVscGVycy5hc3luYztcclxuXHJcbmZ1bmN0aW9uIFdvcmtmbG93SG9zdChvcHRpb25zKSB7XHJcbiAgICB0aGlzLl9yZWdpc3RyeSA9IG5ldyBXb3JrZmxvd1JlZ2lzdHJ5KCk7XHJcbiAgICB0aGlzLl90cmFja2VycyA9IFtdO1xyXG4gICAgdGhpcy5faXNJbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5faW5zdGFuY2VJZFBhcnNlciA9IG5ldyBJbnN0YW5jZUlkUGFyc2VyKCk7XHJcbiAgICB0aGlzLl9wZXJzaXN0ZW5jZSA9IG51bGw7XHJcbiAgICB0aGlzLl9vcHRpb25zID0gXy5leHRlbmQoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbnRlckxvY2tUaW1lb3V0OiAxMDAwMCxcclxuICAgICAgICAgICAgbG9ja1JlbmV3YWxUaW1lb3V0OiA1MDAwLFxyXG4gICAgICAgICAgICBhbHdheXNMb2FkU3RhdGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBsYXp5UGVyc2lzdGVuY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHBlcnNpc3RlbmNlOiBudWxsLFxyXG4gICAgICAgICAgICBzZXJpYWxpemVyOiBudWxsLFxyXG4gICAgICAgICAgICBlbmFibGVQcm9tb3Rpb25zOiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3B0aW9ucyk7XHJcblxyXG4gICAgaWYgKHRoaXMuX29wdGlvbnMucGVyc2lzdGVuY2UgIT09IG51bGwpIHRoaXMuX3BlcnNpc3RlbmNlID0gbmV3IFdvcmtmbG93UGVyc2lzdGVuY2UodGhpcy5fb3B0aW9ucy5wZXJzaXN0ZW5jZSk7XHJcbiAgICB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMgPSBuZXcgS25vd25JbnN0YVN0b3JlKCk7XHJcbn1cclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFxyXG4gICAgV29ya2Zsb3dIb3N0LnByb3RvdHlwZSwge1xyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9ucztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzSW5pdGlhbGl6ZWQ6IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faXNJbml0aWFsaXplZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGluc3RhbmNlSWRQYXJzZXI6IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faW5zdGFuY2VJZFBhcnNlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIF9pbkxvY2tUaW1lb3V0OiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKyBNYXRoLm1heCh0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICogMC40LCAzMDAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5yZWdpc3RlcldvcmtmbG93ID0gZnVuY3Rpb24gKHdvcmtmbG93KSB7XHJcbiAgICB0aGlzLl9yZWdpc3RyeS5yZWdpc3Rlcih3b3JrZmxvdyk7XHJcbn1cclxuXHJcbldvcmtmbG93SG9zdC5wcm90b3R5cGUucmVnaXN0ZXJBY3Rpdml0eSA9IGZ1bmN0aW9uIChhY3Rpdml0eSwgbmFtZSwgdmVyc2lvbikge1xyXG4gICAgaWYgKCEoYWN0aXZpdHkgaW5zdGFuY2VvZiBBY3Rpdml0eSkpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBY3Rpdml0eSBhcmd1bWVudCBleHBlY3RlZC5cIik7XHJcbiAgICB2YXIgd2YgPSBuZXcgV29ya2Zsb3coKTtcclxuICAgIHdmLm5hbWUgPSBuYW1lO1xyXG4gICAgd2YudmVyc2lvbiA9IHZlcnNpb247XHJcbiAgICB3Zi5hcmdzID0gW2FjdGl2aXR5XTtcclxuICAgIHRoaXMuX3JlZ2lzdHJ5LnJlZ2lzdGVyKHdmKTtcclxufVxyXG5cclxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5faW5pdGlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICghdGhpcy5faXNJbml0aWFsaXplZCkge1xyXG4gICAgICAgIC8vIERvIGluaXQgaGVyZSAuLi5cclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5pbnZva2VNZXRob2QgPSBhc3luYyhcclxuICAgIGZ1bmN0aW9uKiAod29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XHJcbiAgICAgICAgaWYgKCFfKHdvcmtmbG93TmFtZSkuaXNTdHJpbmcoKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFyZ3VtZW50ICd3b3JrZmxvd05hbWUnIGlzIG5vdCBhIHN0cmluZy5cIik7XHJcbiAgICAgICAgd29ya2Zsb3dOYW1lID0gd29ya2Zsb3dOYW1lLnRyaW0oKTtcclxuICAgICAgICBpZiAoIV8obWV0aG9kTmFtZSkuaXNTdHJpbmcoKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFyZ3VtZW50ICdtZXRob2ROYW1lJyBpcyBub3QgYSBzdHJpbmcuXCIpO1xyXG4gICAgICAgIG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lLnRyaW0oKTtcclxuXHJcbiAgICAgICAgaWYgKGlzLmRlZmluZWQoYXJncykgJiYgIV8uaXNBcnJheShhcmdzKSkgYXJncyA9IFthcmdzXTtcclxuXHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBzZWxmLl9pbml0aWFsaXplKCk7XHJcblxyXG4gICAgICAgIHZhciBpbnN0YW5jZUlkID0gbnVsbDtcclxuICAgICAgICB2YXIgY3JlYXRhYmxlV29ya2Zsb3cgPSBudWxsO1xyXG5cclxuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIHNlbGYuX3JlZ2lzdHJ5LmZvckVhY2hNZXRob2RJbmZvKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgZnVuY3Rpb24gKGluZm8pIHtcclxuICAgICAgICAgICAgdmFyIHRyeUlkID0gc2VsZi5faW5zdGFuY2VJZFBhcnNlci5wYXJzZShpbmZvLmluc3RhbmNlSWRQYXRoLCBhcmdzKTtcclxuICAgICAgICAgICAgaWYgKGlzLmRlZmluZWQodHJ5SWQpKSByZXN1bHRzLnB1c2goXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5mbzogaW5mbyxcclxuICAgICAgICAgICAgICAgICAgICBpZDogdHJ5SWRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHJlc3VsdHNbaV07XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuaW5mby5jYW5DcmVhdGVJbnN0YW5jZSAmJiAoIWNyZWF0YWJsZVdvcmtmbG93IHx8IGNyZWF0YWJsZVdvcmtmbG93LnZlcnNpb24gPCByZXN1bHQuaW5mby53b3JrZmxvdykpIHtcclxuICAgICAgICAgICAgICAgIGNyZWF0YWJsZVdvcmtmbG93ID0gcmVzdWx0LmluZm8ud29ya2Zsb3c7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpbnN0YW5jZUlkICYmICh5aWVsZCBzZWxmLl9jaGVja0lmSW5zdGFuY2VSdW5uaW5nKHdvcmtmbG93TmFtZSwgcmVzdWx0LmlkKSkpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlSWQgPSByZXN1bHQuaWQ7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlSWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkIChzZWxmLl9pbnZva2VNZXRob2RPblJ1bm5pbmdJbnN0YW5jZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY3JlYXRhYmxlV29ya2Zsb3cpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkIChzZWxmLl9jcmVhdGVJbnN0YW5jZUFuZEludm9rZU1ldGhvZChjcmVhdGFibGVXb3JrZmxvdywgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJDYW5ub3QgY3JlYXRlIG9yIGNvbnRpbnVlIHdvcmtmbG93ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBieSBjYWxsaW5nIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2NyZWF0ZUluc3RhbmNlQW5kSW52b2tlTWV0aG9kID0gYXN5bmMoXHJcbiAgICBmdW5jdGlvbiogKHdvcmtmbG93LCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBsb2NrSW5mbyA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmICghc2VsZi5fcGVyc2lzdGVuY2UpIHtcclxuICAgICAgICAgICAgdmFyIGluc3RhID0gbmV3IFdvcmtmbG93SW5zdGFuY2Uoc2VsZik7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY3JlYXRlKHdvcmtmbG93LCBtZXRob2ROYW1lLCBhcmdzLCBsb2NrSW5mbykpO1xyXG4gICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuYWRkKHdvcmtmbG93TmFtZSwgaW5zdGEpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbG9ja0luZm8gPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogbnVsbCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBoZWxkVG86IG51bGxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgLy8gV2hlbiBsb2NrIHdpbGwgaGVsZCwgdGhlbiB3ZSBzaG91bGQga2VlcCBpdCBhbGl2ZTpcclxuICAgICAgICAgICAgdmFyIGtlZXBMb2NrQWxpdmUgPSBuZXcgS2VlcExvY2tBbGl2ZShzZWxmLl9wZXJzaXN0ZW5jZSwgbG9ja0luZm8sIHNlbGYuX2luTG9ja1RpbWVvdXQsIHNlbGYub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluc3RhID0gbmV3IFdvcmtmbG93SW5zdGFuY2Uoc2VsZik7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0geWllbGQgKGluc3RhLmNyZWF0ZSh3b3JrZmxvdywgbWV0aG9kTmFtZSwgYXJncywgbG9ja0luZm8pKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmFkZCh3b3JrZmxvd05hbWUsIGluc3RhKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUGVyc2lzdCBhbmQgdW5sb2NrOlxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLnBlcnNpc3RTdGF0ZShpbnN0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHBlcnNpc3QgaW5zdGFuY2Ugb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgZXhpdCBsb2NrIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9pbnZva2VNZXRob2RPblJ1bm5pbmdJbnN0YW5jZSA9IGFzeW5jKFxyXG4gICAgZnVuY3Rpb24qIChpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICghc2VsZi5fcGVyc2lzdGVuY2UpIHtcclxuICAgICAgICAgICAgdmFyIGluc3RhID0geWllbGQgKHNlbGYuX3ZlcmlmeUFuZFJlc3RvcmVJbnN0YW5jZVN0YXRlKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHlpZWxkIChpbnN0YS5jYWxsTWV0aG9kKG1ldGhvZE5hbWUsIGFyZ3MpKTtcclxuICAgICAgICAgICAgICAgIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkluc3RhbmNlICdcIiArIGluc3RhLmlkICsgXCInIGlzIGluIGFuIGludmFsaWQgc3RhdGUgJ1wiICsgaW5zdGEuZXhlY1N0YXRlICsgXCInIGFmdGVyIGludm9jYXRpb24gb2YgdGhlIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcclxuICAgICAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIExvY2sgaXQ6XHJcbiAgICAgICAgICAgIHZhciBsb2NrTmFtZSA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuZG91YmxlS2V5cyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xyXG4gICAgICAgICAgICB2YXIgbG9ja0luZm8gPSB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UuZW50ZXJMb2NrKGxvY2tOYW1lLCBzZWxmLm9wdGlvbnMuZW50ZXJMb2NrVGltZW91dCwgc2VsZi5faW5Mb2NrVGltZW91dCkpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2hlbiBsb2NrIHdpbGwgaGVsZCwgdGhlbiB3ZSBzaG91bGQga2VlcCBpdCBhbGl2ZTpcclxuICAgICAgICAgICAgICAgIHZhciBrZWVwTG9ja0FsaXZlID0gbmV3IEtlZXBMb2NrQWxpdmUoc2VsZi5fcGVyc2lzdGVuY2UsIGxvY2tJbmZvLCBzZWxmLl9pbkxvY2tUaW1lb3V0LCBzZWxmLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBMT0NLRURcclxuICAgICAgICAgICAgICAgIHZhciBpbnN0YSA9IHlpZWxkIChzZWxmLl92ZXJpZnlBbmRSZXN0b3JlSW5zdGFuY2VTdGF0ZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpKTtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHlpZWxkIChpbnN0YS5jYWxsTWV0aG9kKG1ldGhvZE5hbWUsIGFyZ3MpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBlcnNpc3QgYW5kIHVubG9jazpcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHBlcnNpc3RBbmRVbmxvY2soKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fcGVyc2lzdGVuY2UucGVyc2lzdFN0YXRlKGluc3RhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbm5vdCBwZXJzaXN0IGluc3RhbmNlIGZvciB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgZXhpdCBsb2NrIGZvciB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluYWxseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmxhenlQZXJzaXN0ZW5jZSkgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzaXN0QW5kVW5sb2NrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDApOyBlbHNlIHlpZWxkIHBlcnNpc3RBbmRVbmxvY2soKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuY29tcGxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgc2VsZi5fcGVyc2lzdGVuY2UucmVtb3ZlU3RhdGUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHJlbW92ZSBzdGF0ZSBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgZXhpdCBsb2NrIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiSW5zdGFuY2UgJ1wiICsgaW5zdGEuaWQgKyBcIicgaXMgaW4gYW4gaW52YWxpZCBzdGF0ZSAnXCIgKyBpbnN0YS5leGVjU3RhdGUgKyBcIicgYWZ0ZXIgaW52b2NhdGlvbiBvZiB0aGUgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5fcGVyc2lzdGVuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5yZW1vdmVTdGF0ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkLCBmYWxzZSwgZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChyZW1vdmVFKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbm5vdCByZW1vdmUgc3RhdGUgb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgcmVtb3ZlRS5zdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGtlZXBMb2NrQWxpdmUpIGtlZXBMb2NrQWxpdmUuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChleGl0RSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IGV4aXQgbG9jayAnXCIgKyBsb2NrSW5mby5pZCArIFwiJzpcXG5cIiArIGV4aXRFLnN0YWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2VudGVyTG9ja0ZvckNyZWF0ZWRJbnN0YW5jZSA9IGFzeW5jKFxyXG4gICAgZnVuY3Rpb24qIChpbnN0YSwgbG9ja0luZm8pIHtcclxuICAgICAgICB2YXIgbGkgPSB5aWVsZCAodGhpcy5fcGVyc2lzdGVuY2UuZW50ZXJMb2NrKHNwZWNTdHJpbmdzLmhvc3RpbmcuZG91YmxlS2V5cyhpbnN0YS53b3JrZmxvd05hbWUsIGluc3RhLmlkKSwgdGhpcy5vcHRpb25zLmVudGVyTG9ja1RpbWVvdXQsIHRoaXMuX2dldEluTG9ja1RpbWVvdXQoKSkpO1xyXG4gICAgICAgIGlmICh5aWVsZCAodGhpcy5fcGVyc2lzdGVuY2UuaXNSdW5uaW5nKGluc3RhLndvcmtmbG93TmFtZSwgaW5zdGEuaWQpKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJDYW5ub3QgY3JlYXRlIGluc3RhbmNlIG9mIHdvcmtmbG93ICdcIiArIGluc3RhLndvcmtmbG93TmFtZSArIFwiJyBieSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJyBiZWNhdXNlIGl0J3MgYWxyZWFkeSBleGlzdHMuXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2NrSW5mby5pZCA9IGxpLmlkO1xyXG4gICAgICAgIGxvY2tJbmZvLm5hbWUgPSBsaS5uYW1lO1xyXG4gICAgICAgIGxvY2tJbmZvLmhlbGRUbyA9IGxpLmhlbGRUbztcclxuICAgIH0pO1xyXG5cclxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fZ2V0SW5Mb2NrVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICsgTWF0aC5tYXgodGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCAqIDAuNCwgMzAwMCk7XHJcbn1cclxuXHJcbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX3ZlcmlmeUFuZFJlc3RvcmVJbnN0YW5jZVN0YXRlID0gYXN5bmMoXHJcbiAgICBmdW5jdGlvbiogKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgaW5zdGEgPSBudWxsO1xyXG4gICAgICAgIHZhciBlcnJvclRleHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIkluc3RhbmNlICdcIiArIGluc3RhbmNlSWQgKyBcIicgaGFzIGJlZW4gaW52b2tlZCBlbHNld2hlcmUgc2luY2UgdGhlIGxvY2sgdG9vayBpbiB0aGUgY3VycmVudCBob3N0LlwiO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHNlbGYuX3BlcnNpc3RlbmNlKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGVhZGVyID0geWllbGQgKHNlbGYuX3BlcnNpc3RlbmNlLmdldFJ1bm5pbmdJbnN0YW5jZUlkSGVhZGVyKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpO1xyXG4gICAgICAgICAgICAgICAgaW5zdGEgPSB5aWVsZCAoc2VsZi5fcmVzdG9yZUluc3RhbmNlU3RhdGUoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBoZWFkZXIud29ya2Zsb3dWZXJzaW9uLCBoZWFkZXIudXBkYXRlZE9uKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLldvcmtmbG93RXJyb3IpIHRocm93IGU7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoZXJyb3JUZXh0KCkgKyBcIlxcbklubmVyIGVycm9yOlxcblwiICsgZS5zdGFjay50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaW5zdGEgPSBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuZ2V0KHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XHJcbiAgICAgICAgICAgIGlmICghaW5zdGEpIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihlcnJvclRleHQoKSArIFwiIElubmVyIGVycm9yOiBpbnN0YW5jZSBcIiArIGluc3RhbmNlSWQgKyBcIiBpcyB1bmtub3duLlwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpbnN0YTtcclxuICAgIH0pO1xyXG5cclxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fcmVzdG9yZUluc3RhbmNlU3RhdGUgPSBhc3luYyhcclxuICAgIGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCB3b3JrZmxvd1ZlcnNpb24sIGFjdHVhbFRpbWVzdGFtcCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKCFzZWxmLl9wZXJzaXN0ZW5jZSkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgaW5zdGFuY2UgZnJvbSBwZXJzaXN0ZW5jZSwgYmVjYXVzZSBob3N0IGhhcyBubyBwZXJzaXN0ZW5jZSByZWdpc3RlcmVkLlwiKTtcclxuXHJcbiAgICAgICAgdmFyIGluc3RhID0gc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldCh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xyXG4gICAgICAgIGlmIChpcy51bmRlZmluZWQoaW5zdGEpKSB7XHJcbiAgICAgICAgICAgIHZhciB3ZkRlc2MgPSBzZWxmLl9yZWdpc3RyeS5nZXREZXNjKHdvcmtmbG93TmFtZSwgd29ya2Zsb3dWZXJzaW9uKTtcclxuICAgICAgICAgICAgaW5zdGEgPSBuZXcgV29ya2Zsb3dJbnN0YW5jZSh0aGlzKTtcclxuICAgICAgICAgICAgaW5zdGEuc2V0V29ya2Zsb3cod2ZEZXNjLndvcmtmbG93LCBpbnN0YW5jZUlkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnN0YS51cGRhdGVkT24gPT09IG51bGwgfHwgaW5zdGEudXBkYXRlZE9uLmdldFRpbWUoKSAhPT0gYWN0dWFsVGltZXN0YW1wLmdldFRpbWUoKSB8fCBzZWxmLm9wdGlvbnMuYWx3YXlzTG9hZFN0YXRlKSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5sb2FkU3RhdGUod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSk7XHJcbiAgICAgICAgICAgIGluc3RhLnJlc3RvcmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnN0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnN0YTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2NoZWNrSWZJbnN0YW5jZVJ1bm5pbmcgPSBhc3luYyhcclxuICAgIGZ1bmN0aW9uKiAod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcy5leGlzdHMod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgaWYgKHRoaXMuX3BlcnNpc3RlbmNlKSByZXR1cm4geWllbGQgdGhpcy5fcGVyc2lzdGVuY2UuaXNSdW5uaW5nKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLmFkZFRyYWNrZXIgPSBmdW5jdGlvbiAodHJhY2tlcikge1xyXG4gICAgaWYgKCFfKHRyYWNrZXIpLmlzT2JqZWN0KCkpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0LlwiKTtcclxuICAgIHRoaXMuX3RyYWNrZXJzLnB1c2godHJhY2tlcik7XHJcbiAgICAvLyBUT0RPOiBhZGQgdHJhY2tlciB0byBhbGwgaW5zdGFuY2VzXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gV29ya2Zsb3dIb3N0O1xyXG4iXX0=
