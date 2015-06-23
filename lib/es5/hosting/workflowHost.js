"use strict";
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
  if (this._options.persistence !== null) {
    this._persistence = new WorkflowPersistence(this._options.persistence);
  }
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
  if (!(activity instanceof Activity)) {
    throw new TypeError("Activity argument expected.");
  }
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
WorkflowHost.prototype.invokeMethod = async($traceurRuntime.initGeneratorFunction(function $__4(workflowName, methodName, args) {
  var self,
      instanceId,
      creatableWorkflow,
      results,
      i,
      result,
      $__5,
      $__6,
      $__7,
      $__8,
      $__9,
      $__10,
      $__11,
      $__12,
      $__13,
      $__14,
      $__15;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          if (!_(workflowName).isString()) {
            throw new TypeError("Argument 'workflowName' is not a string.");
          }
          workflowName = workflowName.trim();
          if (!_(methodName).isString()) {
            throw new TypeError("Argument 'methodName' is not a string.");
          }
          methodName = methodName.trim();
          if (is.defined(args) && !_.isArray(args)) {
            args = [args];
          }
          self = this;
          self._initialize();
          instanceId = null;
          creatableWorkflow = null;
          results = [];
          self._registry.forEachMethodInfo(workflowName, methodName, function(info) {
            var tryId = self._instanceIdParser.parse(info.instanceIdPath, args);
            if (is.defined(tryId)) {
              results.push({
                info: info,
                id: tryId
              });
            }
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
          $__5 = self._checkIfInstanceRunning;
          $__6 = result.id;
          $__7 = $__5.call(self, workflowName, $__6);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__7;
        case 2:
          $__8 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__9 = $__8;
          $ctx.state = 8;
          break;
        case 9:
          $__9 = !instanceId;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__9) ? 14 : 13;
          break;
        case 14:
          instanceId = result.id;
          $ctx.state = 19;
          break;
        case 19:
          $ctx.state = (instanceId) ? 26 : 40;
          break;
        case 26:
          $__10 = self._invokeMethodOnRunningInstance;
          $__11 = $__10.call(self, instanceId, workflowName, methodName, args);
          $ctx.state = 27;
          break;
        case 27:
          $ctx.state = 23;
          return $__11;
        case 23:
          $__12 = $ctx.sent;
          $ctx.state = 25;
          break;
        case 25:
          $ctx.returnValue = $__12;
          $ctx.state = -2;
          break;
        case 40:
          $ctx.state = (creatableWorkflow) ? 34 : 38;
          break;
        case 34:
          $__13 = self._createInstanceAndInvokeMethod;
          $__14 = $__13.call(self, creatableWorkflow, workflowName, methodName, args);
          $ctx.state = 35;
          break;
        case 35:
          $ctx.state = 31;
          return $__14;
        case 31:
          $__15 = $ctx.sent;
          $ctx.state = 33;
          break;
        case 33:
          $ctx.returnValue = $__15;
          $ctx.state = -2;
          break;
        case 38:
          throw new errors.WorkflowError("Cannot create or continue workflow '" + workflowName + "' by calling method '" + methodName + "'.");
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__4, this);
}));
WorkflowHost.prototype._createInstanceAndInvokeMethod = async($traceurRuntime.initGeneratorFunction(function $__16(workflow, workflowName, methodName, args) {
  var self,
      lockInfo,
      insta,
      result,
      keepLockAlive,
      insta$__0,
      result$__1,
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
          insta$__0 = new WorkflowInstance(self);
          $ctx.state = 49;
          break;
        case 49:
          $ctx.state = 12;
          return (insta$__0.create(workflow, methodName, args, lockInfo));
        case 12:
          result$__1 = $ctx.sent;
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = (insta$__0.execState === enums.ActivityStates.idle) ? 43 : 45;
          break;
        case 43:
          self._knownRunningInstances.add(workflowName, insta$__0);
          $ctx.state = 44;
          break;
        case 44:
          $ctx.pushTry(19, null);
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = 16;
          return self._persistence.persistState(insta$__0);
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
          console.log("Cannot persist instance of workflow name: '" + workflowName + "' instance id '" + insta$__0.id + "':\n" + e.stack);
          self._knownRunningInstances.remove(workflowName, insta$__0.id);
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
          console.log("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta$__0.id + "':\n" + e.stack);
          $ctx.state = 37;
          break;
        case 37:
          $ctx.returnValue = result$__1;
          $ctx.state = 51;
          $ctx.finallyFallThrough = -2;
          break;
        case 45:
          $ctx.returnValue = result$__1;
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
  }, $__16, this);
}));
WorkflowHost.prototype._invokeMethodOnRunningInstance = async($traceurRuntime.initGeneratorFunction(function $__17(instanceId, workflowName, methodName, args) {
  var self,
      insta,
      result,
      lockName,
      lockInfo,
      keepLockAlive,
      insta$__2,
      result$__3,
      persistAndUnlock,
      e,
      removeE,
      exitE;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          $ctx.state = 150;
          break;
        case 150:
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
          keepLockAlive = false;
          $ctx.state = 147;
          break;
        case 147:
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
          insta$__2 = $ctx.sent;
          $ctx.state = 35;
          break;
        case 35:
          $ctx.pushTry(111, null);
          $ctx.state = 114;
          break;
        case 114:
          $ctx.state = 37;
          return (insta$__2.callMethod(methodName, args));
        case 37:
          result$__3 = $ctx.sent;
          $ctx.state = 39;
          break;
        case 39:
          $ctx.state = (insta$__2.execState === enums.ActivityStates.idle) ? 49 : 91;
          break;
        case 49:
          persistAndUnlock = function() {
            return self._persistence.persistState(insta$__2).catch(function(e) {
              console.log("Cannot persist instance for workflow name: '" + workflowName + "' instance id '" + insta$__2.id + "':\n" + e.stack);
              self._knownRunningInstances.remove(workflowName, insta$__2.id);
            }).finally(function() {
              return self._persistence.exitLock(lockInfo.id).catch(function(e) {
                console.log("Cannot exit lock for workflow name: '" + workflowName + "' instance id '" + insta$__2.id + "':\n" + e.stack);
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
          setTimeout(persistAndUnlock, 0);
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
          $ctx.returnValue = result$__3;
          $ctx.state = -2;
          break;
        case 91:
          $ctx.state = (insta$__2.execState === enums.ActivityStates.complete) ? 87 : 89;
          break;
        case 87:
          self._knownRunningInstances.remove(workflowName, insta$__2.id);
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
          return self._persistence.removeState(workflowName, insta$__2.id, true);
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
          console.log("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta$__2.id + "':\n" + e.stack);
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
          console.log("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta$__2.id + "':\n" + e.stack);
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
          $ctx.returnValue = result$__3;
          $ctx.state = -2;
          break;
        case 89:
          throw new errors.WorkflowError("Instance '" + insta$__2.id + "' is in an invalid state '" + insta$__2.execState + "' after invocation of the method '" + methodName + "'.");
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
          self._knownRunningInstances.remove(workflowName, insta$__2.id);
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
          return (self._persistence.removeState(workflowName, insta$__2.id, false, e));
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
          console.log("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta$__2.id + "':\n" + removeE.stack);
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
          if (keepLockAlive) {
            keepLockAlive.end();
          }
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
  }, $__17, this);
}));
WorkflowHost.prototype._enterLockForCreatedInstance = async($traceurRuntime.initGeneratorFunction(function $__18(insta, lockInfo) {
  var li,
      $__19,
      $__20,
      $__21,
      $__22,
      $__23,
      $__24;
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
          $__19 = this._persistence;
          $__20 = $__19.isRunning;
          $__21 = insta.workflowName;
          $__22 = insta.id;
          $__23 = $__20.call($__19, $__21, $__22);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return $__23;
        case 6:
          $__24 = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__24) ? 11 : 12;
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
  }, $__18, this);
}));
WorkflowHost.prototype._getInLockTimeout = function() {
  return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
};
WorkflowHost.prototype._verifyAndRestoreInstanceState = async($traceurRuntime.initGeneratorFunction(function $__25(instanceId, workflowName, methodName, args) {
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
          if (e instanceof errors.WorkflowError) {
            throw e;
          }
          throw new errors.WorkflowError(errorText() + "\nInner error:\n" + e.stack.toString());
          $ctx.state = 14;
          break;
        case 18:
          insta = self._knownRunningInstances.get(workflowName, instanceId);
          if (!insta) {
            throw new errors.WorkflowError(errorText() + " Inner error: instance " + instanceId + " is unknown.");
          }
          $ctx.state = 14;
          break;
        case 14:
          $ctx.returnValue = insta;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__25, this);
}));
WorkflowHost.prototype._restoreInstanceState = async($traceurRuntime.initGeneratorFunction(function $__26(instanceId, workflowName, workflowVersion, actualTimestamp) {
  var self,
      insta,
      wfDesc,
      state;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          if (!self._persistence) {
            throw new Error("Cannot restore instance from persistence, because host has no persistence registered.");
          }
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
  }, $__26, this);
}));
WorkflowHost.prototype._checkIfInstanceRunning = async($traceurRuntime.initGeneratorFunction(function $__27(workflowName, instanceId) {
  var $__28,
      $__29,
      $__30,
      $__31;
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
          $__28 = this._persistence;
          $__29 = $__28.isRunning;
          $__30 = $__29.call($__28, workflowName, instanceId);
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = 5;
          return $__30;
        case 5:
          $__31 = $ctx.sent;
          $ctx.state = 7;
          break;
        case 7:
          $ctx.returnValue = $__31;
          $ctx.state = -2;
          break;
        case 11:
          $ctx.returnValue = false;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__27, this);
}));
WorkflowHost.prototype.addTracker = function(tracker) {
  if (!_.isObject(tracker)) {
    throw new TypeError("Argument is not an object.");
  }
  this._trackers.push(tracker);
};
module.exports = WorkflowHost;
//# sourceMappingURL=data:application/json;base64,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RGhCLGFBQUcsTUFBTSxFQUFJLENBQUEsQ0EwWUQsSUFBRyx1QkFBdUIsT0FBTyxBQUFDLENBQUMsWUFBVyxDQUFHLFdBQVMsQ0FBQyxDQTFZeEMsUUFBd0MsQ0FBQztBQUNoRSxlQUFJOztBQURaLGFBQUcsWUFBWSxFQTJZSSxLQUFHLEFBM1lhLENBQUE7Ozs7QUFBbkMsYUFBRyxNQUFNLEVBQUksQ0FBQSxDQTZZRCxJQUFHLGFBQWEsQ0E3WUcsU0FBd0MsQ0FBQztBQUNoRSxlQUFJOztnQkE2WWMsQ0FBQSxJQUFHLGFBQWE7Z0JBQWhCLGdCQUEwQjtnQkFBMUIsV0FBMkIsT0FBQyxhQUFXLENBQUcsV0FBUyxDQUFDOzs7OztBQTlZOUUsc0JBQXVCOztnQkFBdkIsQ0FBQSxJQUFHLEtBQUs7Ozs7QUFBUixhQUFHLFlBQVksUUFBb0IsQ0FBQTs7OztBQUFuQyxhQUFHLFlBQVksRUFnWkEsTUFBSSxBQWhaZ0IsQ0FBQTs7OztBQUFuQyxlQUFPLENBQUEsSUFBRyxJQUFJLEFBQUMsRUFBQyxDQUFBOztBQUNtQixFQUMvQixRQUE2QixLQUFHLENBQUMsQ0FBQztBQStZbEMsQ0FqWm1ELENBaVpsRCxDQUFDO0FBRU4sV0FBVyxVQUFVLFdBQVcsRUFBSSxVQUFVLE9BQU0sQ0FBRztBQUNuRCxLQUFJLENBQUMsQ0FBQSxTQUFTLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBRztBQUN0QixRQUFNLElBQUksVUFBUSxBQUFDLENBQUMsNEJBQTJCLENBQUMsQ0FBQztFQUNyRDtBQUFBLEFBQ0EsS0FBRyxVQUFVLEtBQUssQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBRWhDLENBQUM7QUFFRCxLQUFLLFFBQVEsRUFBSSxhQUFXLENBQUM7QUFDN0IiLCJmaWxlIjoiaG9zdGluZy93b3JrZmxvd0hvc3QuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5sZXQgV29ya2Zsb3dSZWdpc3RyeSA9IHJlcXVpcmUoXCIuL3dvcmtmbG93UmVnaXN0cnlcIik7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgQWN0aXZpdHkgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy9hY3Rpdml0eVwiKTtcbmxldCBXb3JrZmxvdyA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL3dvcmtmbG93XCIpO1xubGV0IFdvcmtmbG93UGVyc2lzdGVuY2UgPSByZXF1aXJlKFwiLi93b3JrZmxvd1BlcnNpc3RlbmNlXCIpO1xubGV0IFdvcmtmbG93SW5zdGFuY2UgPSByZXF1aXJlKFwiLi93b3JrZmxvd0luc3RhbmNlXCIpO1xubGV0IEluc3RhbmNlSWRQYXJzZXIgPSByZXF1aXJlKFwiLi9pbnN0YW5jZUlkUGFyc2VyXCIpO1xubGV0IGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcbmxldCBQcm9taXNlID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xubGV0IEtub3duSW5zdGFTdG9yZSA9IHJlcXVpcmUoXCIuL2tub3duSW5zdGFTdG9yZVwiKTtcbmxldCBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XG5sZXQgZXJyb3JzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lcnJvcnNcIik7XG5sZXQgU2VyaWFsaXplciA9IHJlcXVpcmUoXCJiYWNrcGFjay1ub2RlXCIpLnN5c3RlbS5TZXJpYWxpemVyO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBLZWVwTG9ja0FsaXZlID0gcmVxdWlyZShcIi4va2VlcExvY2tBbGl2ZVwiKTtcbmxldCBhc3luY0hlbHBlcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2FzeW5jSGVscGVyc1wiKTtcbmxldCBhc3luYyA9IGFzeW5jSGVscGVycy5hc3luYztcblxuZnVuY3Rpb24gV29ya2Zsb3dIb3N0KG9wdGlvbnMpIHtcbiAgICB0aGlzLl9yZWdpc3RyeSA9IG5ldyBXb3JrZmxvd1JlZ2lzdHJ5KCk7XG4gICAgdGhpcy5fdHJhY2tlcnMgPSBbXTtcbiAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5faW5zdGFuY2VJZFBhcnNlciA9IG5ldyBJbnN0YW5jZUlkUGFyc2VyKCk7XG4gICAgdGhpcy5fcGVyc2lzdGVuY2UgPSBudWxsO1xuICAgIHRoaXMuX29wdGlvbnMgPSBfLmV4dGVuZChcbiAgICAgICAge1xuICAgICAgICAgICAgZW50ZXJMb2NrVGltZW91dDogMTAwMDAsXG4gICAgICAgICAgICBsb2NrUmVuZXdhbFRpbWVvdXQ6IDUwMDAsXG4gICAgICAgICAgICBhbHdheXNMb2FkU3RhdGU6IGZhbHNlLFxuICAgICAgICAgICAgbGF6eVBlcnNpc3RlbmNlOiB0cnVlLFxuICAgICAgICAgICAgcGVyc2lzdGVuY2U6IG51bGwsXG4gICAgICAgICAgICBzZXJpYWxpemVyOiBudWxsLFxuICAgICAgICAgICAgZW5hYmxlUHJvbW90aW9uczogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9ucyk7XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5wZXJzaXN0ZW5jZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9wZXJzaXN0ZW5jZSA9IG5ldyBXb3JrZmxvd1BlcnNpc3RlbmNlKHRoaXMuX29wdGlvbnMucGVyc2lzdGVuY2UpO1xuICAgIH1cbiAgICB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMgPSBuZXcgS25vd25JbnN0YVN0b3JlKCk7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFxuICAgIFdvcmtmbG93SG9zdC5wcm90b3R5cGUsIHtcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNJbml0aWFsaXplZDoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzSW5pdGlhbGl6ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5zdGFuY2VJZFBhcnNlcjoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlSWRQYXJzZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2luTG9ja1RpbWVvdXQ6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICsgTWF0aC5tYXgodGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCAqIDAuNCwgMzAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5yZWdpc3RlcldvcmtmbG93ID0gZnVuY3Rpb24gKHdvcmtmbG93KSB7XG4gICAgdGhpcy5fcmVnaXN0cnkucmVnaXN0ZXIod29ya2Zsb3cpO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5yZWdpc3RlckFjdGl2aXR5ID0gZnVuY3Rpb24gKGFjdGl2aXR5LCBuYW1lLCB2ZXJzaW9uKSB7XG4gICAgaWYgKCEoYWN0aXZpdHkgaW5zdGFuY2VvZiBBY3Rpdml0eSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFjdGl2aXR5IGFyZ3VtZW50IGV4cGVjdGVkLlwiKTtcbiAgICB9XG4gICAgbGV0IHdmID0gbmV3IFdvcmtmbG93KCk7XG4gICAgd2YubmFtZSA9IG5hbWU7XG4gICAgd2YudmVyc2lvbiA9IHZlcnNpb247XG4gICAgd2YuYXJncyA9IFthY3Rpdml0eV07XG4gICAgdGhpcy5fcmVnaXN0cnkucmVnaXN0ZXIod2YpO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5faW5pdGlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgLy8gRG8gaW5pdCBoZXJlIC4uLlxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLmludm9rZU1ldGhvZCA9IGFzeW5jKFxuICAgIGZ1bmN0aW9uKiAod29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgICAgIGlmICghXyh3b3JrZmxvd05hbWUpLmlzU3RyaW5nKCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnd29ya2Zsb3dOYW1lJyBpcyBub3QgYSBzdHJpbmcuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHdvcmtmbG93TmFtZSA9IHdvcmtmbG93TmFtZS50cmltKCk7XG4gICAgICAgIGlmICghXyhtZXRob2ROYW1lKS5pc1N0cmluZygpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ21ldGhvZE5hbWUnIGlzIG5vdCBhIHN0cmluZy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWUudHJpbSgpO1xuXG4gICAgICAgIGlmIChpcy5kZWZpbmVkKGFyZ3MpICYmICFfLmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgICAgIGFyZ3MgPSBbYXJnc107XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgc2VsZi5faW5pdGlhbGl6ZSgpO1xuXG4gICAgICAgIGxldCBpbnN0YW5jZUlkID0gbnVsbDtcbiAgICAgICAgbGV0IGNyZWF0YWJsZVdvcmtmbG93ID0gbnVsbDtcblxuICAgICAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgICAgICBzZWxmLl9yZWdpc3RyeS5mb3JFYWNoTWV0aG9kSW5mbyh3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICBsZXQgdHJ5SWQgPSBzZWxmLl9pbnN0YW5jZUlkUGFyc2VyLnBhcnNlKGluZm8uaW5zdGFuY2VJZFBhdGgsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGlzLmRlZmluZWQodHJ5SWQpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiBpbmZvLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRyeUlkXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSByZXN1bHRzW2ldO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5pbmZvLmNhbkNyZWF0ZUluc3RhbmNlICYmICghY3JlYXRhYmxlV29ya2Zsb3cgfHwgY3JlYXRhYmxlV29ya2Zsb3cudmVyc2lvbiA8IHJlc3VsdC5pbmZvLndvcmtmbG93KSkge1xuICAgICAgICAgICAgICAgIGNyZWF0YWJsZVdvcmtmbG93ID0gcmVzdWx0LmluZm8ud29ya2Zsb3c7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWluc3RhbmNlSWQgJiYgKHlpZWxkIHNlbGYuX2NoZWNrSWZJbnN0YW5jZVJ1bm5pbmcod29ya2Zsb3dOYW1lLCByZXN1bHQuaWQpKSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlSWQgPSByZXN1bHQuaWQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5zdGFuY2VJZCkge1xuICAgICAgICAgICAgcmV0dXJuIHlpZWxkIChzZWxmLl9pbnZva2VNZXRob2RPblJ1bm5pbmdJbnN0YW5jZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjcmVhdGFibGVXb3JrZmxvdykge1xuICAgICAgICAgICAgcmV0dXJuIHlpZWxkIChzZWxmLl9jcmVhdGVJbnN0YW5jZUFuZEludm9rZU1ldGhvZChjcmVhdGFibGVXb3JrZmxvdywgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJDYW5ub3QgY3JlYXRlIG9yIGNvbnRpbnVlIHdvcmtmbG93ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBieSBjYWxsaW5nIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jcmVhdGVJbnN0YW5jZUFuZEludm9rZU1ldGhvZCA9IGFzeW5jKFxuICAgIGZ1bmN0aW9uKiAod29ya2Zsb3csIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgbGV0IGxvY2tJbmZvID0gbnVsbDtcblxuICAgICAgICBpZiAoIXNlbGYuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICBsZXQgaW5zdGEgPSBuZXcgV29ya2Zsb3dJbnN0YW5jZShzZWxmKTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY3JlYXRlKHdvcmtmbG93LCBtZXRob2ROYW1lLCBhcmdzLCBsb2NrSW5mbykpO1xuICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmFkZCh3b3JrZmxvd05hbWUsIGluc3RhKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2NrSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICAgICAgICAgIGhlbGRUbzogbnVsbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIFdoZW4gbG9jayB3aWxsIGhlbGQsIHRoZW4gd2Ugc2hvdWxkIGtlZXAgaXQgYWxpdmU6XG4gICAgICAgICAgICBsZXQga2VlcExvY2tBbGl2ZSA9IG5ldyBLZWVwTG9ja0FsaXZlKHNlbGYuX3BlcnNpc3RlbmNlLCBsb2NrSW5mbywgc2VsZi5faW5Mb2NrVGltZW91dCwgc2VsZi5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCBpbnN0YSA9IG5ldyBXb3JrZmxvd0luc3RhbmNlKHNlbGYpO1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY3JlYXRlKHdvcmtmbG93LCBtZXRob2ROYW1lLCBhcmdzLCBsb2NrSW5mbykpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuYWRkKHdvcmtmbG93TmFtZSwgaW5zdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFBlcnNpc3QgYW5kIHVubG9jazpcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLnBlcnNpc3RTdGF0ZShpbnN0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHBlcnNpc3QgaW5zdGFuY2Ugb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IGV4aXQgbG9jayBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5faW52b2tlTWV0aG9kT25SdW5uaW5nSW5zdGFuY2UgPSBhc3luYyhcbiAgICBmdW5jdGlvbiogKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCFzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgbGV0IGluc3RhID0geWllbGQgKHNlbGYuX3ZlcmlmeUFuZFJlc3RvcmVJbnN0YW5jZVN0YXRlKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGluc3RhLmNhbGxNZXRob2QobWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiSW5zdGFuY2UgJ1wiICsgaW5zdGEuaWQgKyBcIicgaXMgaW4gYW4gaW52YWxpZCBzdGF0ZSAnXCIgKyBpbnN0YS5leGVjU3RhdGUgKyBcIicgYWZ0ZXIgaW52b2NhdGlvbiBvZiB0aGUgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTG9jayBpdDpcbiAgICAgICAgICAgIGxldCBsb2NrTmFtZSA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuZG91YmxlS2V5cyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgICAgICAgICAgbGV0IGxvY2tJbmZvID0geWllbGQgKHNlbGYuX3BlcnNpc3RlbmNlLmVudGVyTG9jayhsb2NrTmFtZSwgc2VsZi5vcHRpb25zLmVudGVyTG9ja1RpbWVvdXQsIHNlbGYuX2luTG9ja1RpbWVvdXQpKTtcbiAgICAgICAgICAgIGxldCBrZWVwTG9ja0FsaXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gbG9jayB3aWxsIGhlbGQsIHRoZW4gd2Ugc2hvdWxkIGtlZXAgaXQgYWxpdmU6XG4gICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZSA9IG5ldyBLZWVwTG9ja0FsaXZlKHNlbGYuX3BlcnNpc3RlbmNlLCBsb2NrSW5mbywgc2VsZi5faW5Mb2NrVGltZW91dCwgc2VsZi5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCk7XG5cbiAgICAgICAgICAgICAgICAvLyBMT0NLRURcbiAgICAgICAgICAgICAgICBsZXQgaW5zdGEgPSB5aWVsZCAoc2VsZi5fdmVyaWZ5QW5kUmVzdG9yZUluc3RhbmNlU3RhdGUoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChpbnN0YS5jYWxsTWV0aG9kKG1ldGhvZE5hbWUsIGFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGVyc2lzdCBhbmQgdW5sb2NrOlxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGVyc2lzdEFuZFVubG9jayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fcGVyc2lzdGVuY2UucGVyc2lzdFN0YXRlKGluc3RhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHBlcnNpc3QgaW5zdGFuY2UgZm9yIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbm5vdCBleGl0IGxvY2sgZm9yIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm9wdGlvbnMubGF6eVBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChwZXJzaXN0QW5kVW5sb2NrLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHBlcnNpc3RBbmRVbmxvY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5yZW1vdmVTdGF0ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgcmVtb3ZlIHN0YXRlIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgZXhpdCBsb2NrIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiSW5zdGFuY2UgJ1wiICsgaW5zdGEuaWQgKyBcIicgaXMgaW4gYW4gaW52YWxpZCBzdGF0ZSAnXCIgKyBpbnN0YS5leGVjU3RhdGUgKyBcIicgYWZ0ZXIgaW52b2NhdGlvbiBvZiB0aGUgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UucmVtb3ZlU3RhdGUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCwgZmFsc2UsIGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChyZW1vdmVFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgcmVtb3ZlIHN0YXRlIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIHJlbW92ZUUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2VlcExvY2tBbGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChleGl0RSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbm5vdCBleGl0IGxvY2sgJ1wiICsgbG9ja0luZm8uaWQgKyBcIic6XFxuXCIgKyBleGl0RS5zdGFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fZW50ZXJMb2NrRm9yQ3JlYXRlZEluc3RhbmNlID0gYXN5bmMoXG4gICAgZnVuY3Rpb24qIChpbnN0YSwgbG9ja0luZm8pIHtcbiAgICAgICAgbGV0IGxpID0geWllbGQgKHRoaXMuX3BlcnNpc3RlbmNlLmVudGVyTG9jayhzcGVjU3RyaW5ncy5ob3N0aW5nLmRvdWJsZUtleXMoaW5zdGEud29ya2Zsb3dOYW1lLCBpbnN0YS5pZCksIHRoaXMub3B0aW9ucy5lbnRlckxvY2tUaW1lb3V0LCB0aGlzLl9nZXRJbkxvY2tUaW1lb3V0KCkpKTtcbiAgICAgICAgaWYgKHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5pc1J1bm5pbmcoaW5zdGEud29ya2Zsb3dOYW1lLCBpbnN0YS5pZCkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJDYW5ub3QgY3JlYXRlIGluc3RhbmNlIG9mIHdvcmtmbG93ICdcIiArIGluc3RhLndvcmtmbG93TmFtZSArIFwiJyBieSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJyBiZWNhdXNlIGl0J3MgYWxyZWFkeSBleGlzdHMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxvY2tJbmZvLmlkID0gbGkuaWQ7XG4gICAgICAgIGxvY2tJbmZvLm5hbWUgPSBsaS5uYW1lO1xuICAgICAgICBsb2NrSW5mby5oZWxkVG8gPSBsaS5oZWxkVG87XG4gICAgfSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2dldEluTG9ja1RpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKyBNYXRoLm1heCh0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICogMC40LCAzMDAwKTtcbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX3ZlcmlmeUFuZFJlc3RvcmVJbnN0YW5jZVN0YXRlID0gYXN5bmMoXG4gICAgZnVuY3Rpb24qIChpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgaW5zdGEgPSBudWxsO1xuICAgICAgICBsZXQgZXJyb3JUZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiSW5zdGFuY2UgJ1wiICsgaW5zdGFuY2VJZCArIFwiJyBoYXMgYmVlbiBpbnZva2VkIGVsc2V3aGVyZSBzaW5jZSB0aGUgbG9jayB0b29rIGluIHRoZSBjdXJyZW50IGhvc3QuXCI7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgaGVhZGVyID0geWllbGQgKHNlbGYuX3BlcnNpc3RlbmNlLmdldFJ1bm5pbmdJbnN0YW5jZUlkSGVhZGVyKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpO1xuICAgICAgICAgICAgICAgIGluc3RhID0geWllbGQgKHNlbGYuX3Jlc3RvcmVJbnN0YW5jZVN0YXRlKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgaGVhZGVyLndvcmtmbG93VmVyc2lvbiwgaGVhZGVyLnVwZGF0ZWRPbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5Xb3JrZmxvd0Vycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihlcnJvclRleHQoKSArIFwiXFxuSW5uZXIgZXJyb3I6XFxuXCIgKyBlLnN0YWNrLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW5zdGEgPSBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuZ2V0KHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICBpZiAoIWluc3RhKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKGVycm9yVGV4dCgpICsgXCIgSW5uZXIgZXJyb3I6IGluc3RhbmNlIFwiICsgaW5zdGFuY2VJZCArIFwiIGlzIHVua25vd24uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhO1xuICAgIH0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9yZXN0b3JlSW5zdGFuY2VTdGF0ZSA9IGFzeW5jKFxuICAgIGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCB3b3JrZmxvd1ZlcnNpb24sIGFjdHVhbFRpbWVzdGFtcCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCFzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgaW5zdGFuY2UgZnJvbSBwZXJzaXN0ZW5jZSwgYmVjYXVzZSBob3N0IGhhcyBubyBwZXJzaXN0ZW5jZSByZWdpc3RlcmVkLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbnN0YSA9IHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5nZXQod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgaWYgKGlzLnVuZGVmaW5lZChpbnN0YSkpIHtcbiAgICAgICAgICAgIGxldCB3ZkRlc2MgPSBzZWxmLl9yZWdpc3RyeS5nZXREZXNjKHdvcmtmbG93TmFtZSwgd29ya2Zsb3dWZXJzaW9uKTtcbiAgICAgICAgICAgIGluc3RhID0gbmV3IFdvcmtmbG93SW5zdGFuY2UodGhpcyk7XG4gICAgICAgICAgICBpbnN0YS5zZXRXb3JrZmxvdyh3ZkRlc2Mud29ya2Zsb3csIGluc3RhbmNlSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluc3RhLnVwZGF0ZWRPbiA9PT0gbnVsbCB8fCBpbnN0YS51cGRhdGVkT24uZ2V0VGltZSgpICE9PSBhY3R1YWxUaW1lc3RhbXAuZ2V0VGltZSgpIHx8IHNlbGYub3B0aW9ucy5hbHdheXNMb2FkU3RhdGUpIHtcbiAgICAgICAgICAgIGxldCBzdGF0ZSA9IHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5sb2FkU3RhdGUod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSk7XG4gICAgICAgICAgICBpbnN0YS5yZXN0b3JlU3RhdGUoc3RhdGUpO1xuICAgICAgICAgICAgcmV0dXJuIGluc3RhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGluc3RhO1xuICAgICAgICB9XG4gICAgfSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2NoZWNrSWZJbnN0YW5jZVJ1bm5pbmcgPSBhc3luYyhcbiAgICBmdW5jdGlvbiogKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkge1xuICAgICAgICBpZiAodGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmV4aXN0cyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiAoeWllbGQgdGhpcy5fcGVyc2lzdGVuY2UuaXNSdW5uaW5nKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5hZGRUcmFja2VyID0gZnVuY3Rpb24gKHRyYWNrZXIpIHtcbiAgICBpZiAoIV8uaXNPYmplY3QodHJhY2tlcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFyZ3VtZW50IGlzIG5vdCBhbiBvYmplY3QuXCIpO1xuICAgIH1cbiAgICB0aGlzLl90cmFja2Vycy5wdXNoKHRyYWNrZXIpO1xuICAgIC8vIFRPRE86IGFkZCB0cmFja2VyIHRvIGFsbCBpbnN0YW5jZXNcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gV29ya2Zsb3dIb3N0O1xuIl19
