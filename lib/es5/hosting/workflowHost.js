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
          setImmediate(persistAndUnlock);
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
//# sourceMappingURL=data:application/json;base64,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QUFNLEVBQUksQ0FBQSxDQTBZRCxJQUFHLHVCQUF1QixPQUFPLEFBQUMsQ0FBQyxZQUFXLENBQUcsV0FBUyxDQUFDLENBMVl4QyxRQUF3QyxDQUFDO0FBQ2hFLGVBQUk7O0FBRFosYUFBRyxZQUFZLEVBMllJLEtBQUcsQUEzWWEsQ0FBQTs7OztBQUFuQyxhQUFHLE1BQU0sRUFBSSxDQUFBLENBNllELElBQUcsYUFBYSxDQTdZRyxTQUF3QyxDQUFDO0FBQ2hFLGVBQUk7O2dCQTZZYyxDQUFBLElBQUcsYUFBYTtnQkFBaEIsZ0JBQTBCO2dCQUExQixXQUEyQixPQUFDLGFBQVcsQ0FBRyxXQUFTLENBQUM7Ozs7O0FBOVk5RSxzQkFBdUI7O2dCQUF2QixDQUFBLElBQUcsS0FBSzs7OztBQUFSLGFBQUcsWUFBWSxRQUFvQixDQUFBOzs7O0FBQW5DLGFBQUcsWUFBWSxFQWdaQSxNQUFJLEFBaFpnQixDQUFBOzs7O0FBQW5DLGVBQU8sQ0FBQSxJQUFHLElBQUksQUFBQyxFQUFDLENBQUE7O0FBQ21CLEVBQy9CLFFBQTZCLEtBQUcsQ0FBQyxDQUFDO0FBK1lsQyxDQWpabUQsQ0FpWmxELENBQUM7QUFFTixXQUFXLFVBQVUsV0FBVyxFQUFJLFVBQVUsT0FBTSxDQUFHO0FBQ25ELEtBQUksQ0FBQyxDQUFBLFNBQVMsQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFHO0FBQ3RCLFFBQU0sSUFBSSxVQUFRLEFBQUMsQ0FBQyw0QkFBMkIsQ0FBQyxDQUFDO0VBQ3JEO0FBQUEsQUFDQSxLQUFHLFVBQVUsS0FBSyxBQUFDLENBQUMsT0FBTSxDQUFDLENBQUM7QUFFaEMsQ0FBQztBQUVELEtBQUssUUFBUSxFQUFJLGFBQVcsQ0FBQztBQUM3QiIsImZpbGUiOiJob3N0aW5nL3dvcmtmbG93SG9zdC5qcyIsInNvdXJjZVJvb3QiOiJsaWIvZXM2Iiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBXb3JrZmxvd1JlZ2lzdHJ5ID0gcmVxdWlyZShcIi4vd29ya2Zsb3dSZWdpc3RyeVwiKTtcbmxldCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbmxldCBBY3Rpdml0eSA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL2FjdGl2aXR5XCIpO1xubGV0IFdvcmtmbG93ID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvd29ya2Zsb3dcIik7XG5sZXQgV29ya2Zsb3dQZXJzaXN0ZW5jZSA9IHJlcXVpcmUoXCIuL3dvcmtmbG93UGVyc2lzdGVuY2VcIik7XG5sZXQgV29ya2Zsb3dJbnN0YW5jZSA9IHJlcXVpcmUoXCIuL3dvcmtmbG93SW5zdGFuY2VcIik7XG5sZXQgSW5zdGFuY2VJZFBhcnNlciA9IHJlcXVpcmUoXCIuL2luc3RhbmNlSWRQYXJzZXJcIik7XG5sZXQgZW51bXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2VudW1zXCIpO1xubGV0IFByb21pc2UgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XG5sZXQgS25vd25JbnN0YVN0b3JlID0gcmVxdWlyZShcIi4va25vd25JbnN0YVN0b3JlXCIpO1xubGV0IHNwZWNTdHJpbmdzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9zcGVjU3RyaW5nc1wiKTtcbmxldCBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcbmxldCBTZXJpYWxpemVyID0gcmVxdWlyZShcImJhY2twYWNrLW5vZGVcIikuc3lzdGVtLlNlcmlhbGl6ZXI7XG5sZXQgaXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2lzXCIpO1xubGV0IEtlZXBMb2NrQWxpdmUgPSByZXF1aXJlKFwiLi9rZWVwTG9ja0FsaXZlXCIpO1xubGV0IGFzeW5jSGVscGVycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vYXN5bmNIZWxwZXJzXCIpO1xubGV0IGFzeW5jID0gYXN5bmNIZWxwZXJzLmFzeW5jO1xuXG5mdW5jdGlvbiBXb3JrZmxvd0hvc3Qob3B0aW9ucykge1xuICAgIHRoaXMuX3JlZ2lzdHJ5ID0gbmV3IFdvcmtmbG93UmVnaXN0cnkoKTtcbiAgICB0aGlzLl90cmFja2VycyA9IFtdO1xuICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9pbnN0YW5jZUlkUGFyc2VyID0gbmV3IEluc3RhbmNlSWRQYXJzZXIoKTtcbiAgICB0aGlzLl9wZXJzaXN0ZW5jZSA9IG51bGw7XG4gICAgdGhpcy5fb3B0aW9ucyA9IF8uZXh0ZW5kKFxuICAgICAgICB7XG4gICAgICAgICAgICBlbnRlckxvY2tUaW1lb3V0OiAxMDAwMCxcbiAgICAgICAgICAgIGxvY2tSZW5ld2FsVGltZW91dDogNTAwMCxcbiAgICAgICAgICAgIGFsd2F5c0xvYWRTdGF0ZTogZmFsc2UsXG4gICAgICAgICAgICBsYXp5UGVyc2lzdGVuY2U6IHRydWUsXG4gICAgICAgICAgICBwZXJzaXN0ZW5jZTogbnVsbCxcbiAgICAgICAgICAgIHNlcmlhbGl6ZXI6IG51bGwsXG4gICAgICAgICAgICBlbmFibGVQcm9tb3Rpb25zOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBvcHRpb25zKTtcblxuICAgIGlmICh0aGlzLl9vcHRpb25zLnBlcnNpc3RlbmNlICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3BlcnNpc3RlbmNlID0gbmV3IFdvcmtmbG93UGVyc2lzdGVuY2UodGhpcy5fb3B0aW9ucy5wZXJzaXN0ZW5jZSk7XG4gICAgfVxuICAgIHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcyA9IG5ldyBLbm93bkluc3RhU3RvcmUoKTtcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoXG4gICAgV29ya2Zsb3dIb3N0LnByb3RvdHlwZSwge1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0luaXRpYWxpemVkOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faXNJbml0aWFsaXplZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpbnN0YW5jZUlkUGFyc2VyOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faW5zdGFuY2VJZFBhcnNlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfaW5Mb2NrVGltZW91dDoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKyBNYXRoLm1heCh0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICogMC40LCAzMDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLnJlZ2lzdGVyV29ya2Zsb3cgPSBmdW5jdGlvbiAod29ya2Zsb3cpIHtcbiAgICB0aGlzLl9yZWdpc3RyeS5yZWdpc3Rlcih3b3JrZmxvdyk7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLnJlZ2lzdGVyQWN0aXZpdHkgPSBmdW5jdGlvbiAoYWN0aXZpdHksIG5hbWUsIHZlcnNpb24pIHtcbiAgICBpZiAoIShhY3Rpdml0eSBpbnN0YW5jZW9mIEFjdGl2aXR5KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQWN0aXZpdHkgYXJndW1lbnQgZXhwZWN0ZWQuXCIpO1xuICAgIH1cbiAgICBsZXQgd2YgPSBuZXcgV29ya2Zsb3coKTtcbiAgICB3Zi5uYW1lID0gbmFtZTtcbiAgICB3Zi52ZXJzaW9uID0gdmVyc2lvbjtcbiAgICB3Zi5hcmdzID0gW2FjdGl2aXR5XTtcbiAgICB0aGlzLl9yZWdpc3RyeS5yZWdpc3Rlcih3Zik7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9pbml0aWFsaXplID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5faXNJbml0aWFsaXplZCkge1xuICAgICAgICAvLyBEbyBpbml0IGhlcmUgLi4uXG4gICAgICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuaW52b2tlTWV0aG9kID0gYXN5bmMoXG4gICAgZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICAgICAgaWYgKCFfKHdvcmtmbG93TmFtZSkuaXNTdHJpbmcoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFyZ3VtZW50ICd3b3JrZmxvd05hbWUnIGlzIG5vdCBhIHN0cmluZy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgd29ya2Zsb3dOYW1lID0gd29ya2Zsb3dOYW1lLnRyaW0oKTtcbiAgICAgICAgaWYgKCFfKG1ldGhvZE5hbWUpLmlzU3RyaW5nKCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnbWV0aG9kTmFtZScgaXMgbm90IGEgc3RyaW5nLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBtZXRob2ROYW1lID0gbWV0aG9kTmFtZS50cmltKCk7XG5cbiAgICAgICAgaWYgKGlzLmRlZmluZWQoYXJncykgJiYgIV8uaXNBcnJheShhcmdzKSkge1xuICAgICAgICAgICAgYXJncyA9IFthcmdzXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICBzZWxmLl9pbml0aWFsaXplKCk7XG5cbiAgICAgICAgbGV0IGluc3RhbmNlSWQgPSBudWxsO1xuICAgICAgICBsZXQgY3JlYXRhYmxlV29ya2Zsb3cgPSBudWxsO1xuXG4gICAgICAgIGxldCByZXN1bHRzID0gW107XG4gICAgICAgIHNlbGYuX3JlZ2lzdHJ5LmZvckVhY2hNZXRob2RJbmZvKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgIGxldCB0cnlJZCA9IHNlbGYuX2luc3RhbmNlSWRQYXJzZXIucGFyc2UoaW5mby5pbnN0YW5jZUlkUGF0aCwgYXJncyk7XG4gICAgICAgICAgICBpZiAoaXMuZGVmaW5lZCh0cnlJZCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm86IGluZm8sXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdHJ5SWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHJlc3VsdHNbaV07XG4gICAgICAgICAgICBpZiAocmVzdWx0LmluZm8uY2FuQ3JlYXRlSW5zdGFuY2UgJiYgKCFjcmVhdGFibGVXb3JrZmxvdyB8fCBjcmVhdGFibGVXb3JrZmxvdy52ZXJzaW9uIDwgcmVzdWx0LmluZm8ud29ya2Zsb3cpKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRhYmxlV29ya2Zsb3cgPSByZXN1bHQuaW5mby53b3JrZmxvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaW5zdGFuY2VJZCAmJiAoeWllbGQgc2VsZi5fY2hlY2tJZkluc3RhbmNlUnVubmluZyh3b3JrZmxvd05hbWUsIHJlc3VsdC5pZCkpKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZCA9IHJlc3VsdC5pZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbnN0YW5jZUlkKSB7XG4gICAgICAgICAgICByZXR1cm4geWllbGQgKHNlbGYuX2ludm9rZU1ldGhvZE9uUnVubmluZ0luc3RhbmNlKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNyZWF0YWJsZVdvcmtmbG93KSB7XG4gICAgICAgICAgICByZXR1cm4geWllbGQgKHNlbGYuX2NyZWF0ZUluc3RhbmNlQW5kSW52b2tlTWV0aG9kKGNyZWF0YWJsZVdvcmtmbG93LCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkNhbm5vdCBjcmVhdGUgb3IgY29udGludWUgd29ya2Zsb3cgJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGJ5IGNhbGxpbmcgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2NyZWF0ZUluc3RhbmNlQW5kSW52b2tlTWV0aG9kID0gYXN5bmMoXG4gICAgZnVuY3Rpb24qICh3b3JrZmxvdywgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICBsZXQgbG9ja0luZm8gPSBudWxsO1xuXG4gICAgICAgIGlmICghc2VsZi5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgIGxldCBpbnN0YSA9IG5ldyBXb3JrZmxvd0luc3RhbmNlKHNlbGYpO1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChpbnN0YS5jcmVhdGUod29ya2Zsb3csIG1ldGhvZE5hbWUsIGFyZ3MsIGxvY2tJbmZvKSk7XG4gICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuYWRkKHdvcmtmbG93TmFtZSwgaW5zdGEpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxvY2tJbmZvID0ge1xuICAgICAgICAgICAgICAgIGlkOiBudWxsLFxuICAgICAgICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgICAgICAgaGVsZFRvOiBudWxsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gV2hlbiBsb2NrIHdpbGwgaGVsZCwgdGhlbiB3ZSBzaG91bGQga2VlcCBpdCBhbGl2ZTpcbiAgICAgICAgICAgIGxldCBrZWVwTG9ja0FsaXZlID0gbmV3IEtlZXBMb2NrQWxpdmUoc2VsZi5fcGVyc2lzdGVuY2UsIGxvY2tJbmZvLCBzZWxmLl9pbkxvY2tUaW1lb3V0LCBzZWxmLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0KTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IGluc3RhID0gbmV3IFdvcmtmbG93SW5zdGFuY2Uoc2VsZik7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChpbnN0YS5jcmVhdGUod29ya2Zsb3csIG1ldGhvZE5hbWUsIGFyZ3MsIGxvY2tJbmZvKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5hZGQod29ya2Zsb3dOYW1lLCBpbnN0YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUGVyc2lzdCBhbmQgdW5sb2NrOlxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgc2VsZi5fcGVyc2lzdGVuY2UucGVyc2lzdFN0YXRlKGluc3RhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgcGVyc2lzdCBpbnN0YW5jZSBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgZXhpdCBsb2NrIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9pbnZva2VNZXRob2RPblJ1bm5pbmdJbnN0YW5jZSA9IGFzeW5jKFxuICAgIGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICBpZiAoIXNlbGYuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICBsZXQgaW5zdGEgPSB5aWVsZCAoc2VsZi5fdmVyaWZ5QW5kUmVzdG9yZUluc3RhbmNlU3RhdGUoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY2FsbE1ldGhvZChtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJJbnN0YW5jZSAnXCIgKyBpbnN0YS5pZCArIFwiJyBpcyBpbiBhbiBpbnZhbGlkIHN0YXRlICdcIiArIGluc3RhLmV4ZWNTdGF0ZSArIFwiJyBhZnRlciBpbnZvY2F0aW9uIG9mIHRoZSBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBMb2NrIGl0OlxuICAgICAgICAgICAgbGV0IGxvY2tOYW1lID0gc3BlY1N0cmluZ3MuaG9zdGluZy5kb3VibGVLZXlzKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICBsZXQgbG9ja0luZm8gPSB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UuZW50ZXJMb2NrKGxvY2tOYW1lLCBzZWxmLm9wdGlvbnMuZW50ZXJMb2NrVGltZW91dCwgc2VsZi5faW5Mb2NrVGltZW91dCkpO1xuICAgICAgICAgICAgbGV0IGtlZXBMb2NrQWxpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gV2hlbiBsb2NrIHdpbGwgaGVsZCwgdGhlbiB3ZSBzaG91bGQga2VlcCBpdCBhbGl2ZTpcbiAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlID0gbmV3IEtlZXBMb2NrQWxpdmUoc2VsZi5fcGVyc2lzdGVuY2UsIGxvY2tJbmZvLCBzZWxmLl9pbkxvY2tUaW1lb3V0LCBzZWxmLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0KTtcblxuICAgICAgICAgICAgICAgIC8vIExPQ0tFRFxuICAgICAgICAgICAgICAgIGxldCBpbnN0YSA9IHlpZWxkIChzZWxmLl92ZXJpZnlBbmRSZXN0b3JlSW5zdGFuY2VTdGF0ZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGluc3RhLmNhbGxNZXRob2QobWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQZXJzaXN0IGFuZCB1bmxvY2s6XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwZXJzaXN0QW5kVW5sb2NrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9wZXJzaXN0ZW5jZS5wZXJzaXN0U3RhdGUoaW5zdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgcGVyc2lzdCBpbnN0YW5jZSBmb3Igd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluYWxseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fcGVyc2lzdGVuY2UuZXhpdExvY2sobG9ja0luZm8uaWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IGV4aXQgbG9jayBmb3Igd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluYWxseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5sYXp5UGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUocGVyc2lzdEFuZFVubG9jayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBwZXJzaXN0QW5kVW5sb2NrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgc2VsZi5fcGVyc2lzdGVuY2UucmVtb3ZlU3RhdGUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHJlbW92ZSBzdGF0ZSBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IGV4aXQgbG9jayBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkluc3RhbmNlICdcIiArIGluc3RhLmlkICsgXCInIGlzIGluIGFuIGludmFsaWQgc3RhdGUgJ1wiICsgaW5zdGEuZXhlY1N0YXRlICsgXCInIGFmdGVyIGludm9jYXRpb24gb2YgdGhlIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgKHNlbGYuX3BlcnNpc3RlbmNlLnJlbW92ZVN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQsIGZhbHNlLCBlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAocmVtb3ZlRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHJlbW92ZSBzdGF0ZSBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyByZW1vdmVFLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtlZXBMb2NrQWxpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgc2VsZi5fcGVyc2lzdGVuY2UuZXhpdExvY2sobG9ja0luZm8uaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXhpdEUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgZXhpdCBsb2NrICdcIiArIGxvY2tJbmZvLmlkICsgXCInOlxcblwiICsgZXhpdEUuc3RhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2VudGVyTG9ja0ZvckNyZWF0ZWRJbnN0YW5jZSA9IGFzeW5jKFxuICAgIGZ1bmN0aW9uKiAoaW5zdGEsIGxvY2tJbmZvKSB7XG4gICAgICAgIGxldCBsaSA9IHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5lbnRlckxvY2soc3BlY1N0cmluZ3MuaG9zdGluZy5kb3VibGVLZXlzKGluc3RhLndvcmtmbG93TmFtZSwgaW5zdGEuaWQpLCB0aGlzLm9wdGlvbnMuZW50ZXJMb2NrVGltZW91dCwgdGhpcy5fZ2V0SW5Mb2NrVGltZW91dCgpKSk7XG4gICAgICAgIGlmICh5aWVsZCAodGhpcy5fcGVyc2lzdGVuY2UuaXNSdW5uaW5nKGluc3RhLndvcmtmbG93TmFtZSwgaW5zdGEuaWQpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiQ2Fubm90IGNyZWF0ZSBpbnN0YW5jZSBvZiB3b3JrZmxvdyAnXCIgKyBpbnN0YS53b3JrZmxvd05hbWUgKyBcIicgYnkgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIicgYmVjYXVzZSBpdCdzIGFscmVhZHkgZXhpc3RzLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBsb2NrSW5mby5pZCA9IGxpLmlkO1xuICAgICAgICBsb2NrSW5mby5uYW1lID0gbGkubmFtZTtcbiAgICAgICAgbG9ja0luZm8uaGVsZFRvID0gbGkuaGVsZFRvO1xuICAgIH0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9nZXRJbkxvY2tUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICsgTWF0aC5tYXgodGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCAqIDAuNCwgMzAwMCk7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl92ZXJpZnlBbmRSZXN0b3JlSW5zdGFuY2VTdGF0ZSA9IGFzeW5jKFxuICAgIGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IGluc3RhID0gbnVsbDtcbiAgICAgICAgbGV0IGVycm9yVGV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBcIkluc3RhbmNlICdcIiArIGluc3RhbmNlSWQgKyBcIicgaGFzIGJlZW4gaW52b2tlZCBlbHNld2hlcmUgc2luY2UgdGhlIGxvY2sgdG9vayBpbiB0aGUgY3VycmVudCBob3N0LlwiO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoc2VsZi5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IGhlYWRlciA9IHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5nZXRSdW5uaW5nSW5zdGFuY2VJZEhlYWRlcih3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKTtcbiAgICAgICAgICAgICAgICBpbnN0YSA9IHlpZWxkIChzZWxmLl9yZXN0b3JlSW5zdGFuY2VTdGF0ZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIGhlYWRlci53b3JrZmxvd1ZlcnNpb24sIGhlYWRlci51cGRhdGVkT24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuV29ya2Zsb3dFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoZXJyb3JUZXh0KCkgKyBcIlxcbklubmVyIGVycm9yOlxcblwiICsgZS5zdGFjay50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGluc3RhID0gc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldCh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgICAgICAgICAgaWYgKCFpbnN0YSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihlcnJvclRleHQoKSArIFwiIElubmVyIGVycm9yOiBpbnN0YW5jZSBcIiArIGluc3RhbmNlSWQgKyBcIiBpcyB1bmtub3duLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnN0YTtcbiAgICB9KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fcmVzdG9yZUluc3RhbmNlU3RhdGUgPSBhc3luYyhcbiAgICBmdW5jdGlvbiogKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgd29ya2Zsb3dWZXJzaW9uLCBhY3R1YWxUaW1lc3RhbXApIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGlmICghc2VsZi5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIGluc3RhbmNlIGZyb20gcGVyc2lzdGVuY2UsIGJlY2F1c2UgaG9zdCBoYXMgbm8gcGVyc2lzdGVuY2UgcmVnaXN0ZXJlZC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW5zdGEgPSBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuZ2V0KHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XG4gICAgICAgIGlmIChpcy51bmRlZmluZWQoaW5zdGEpKSB7XG4gICAgICAgICAgICBsZXQgd2ZEZXNjID0gc2VsZi5fcmVnaXN0cnkuZ2V0RGVzYyh3b3JrZmxvd05hbWUsIHdvcmtmbG93VmVyc2lvbik7XG4gICAgICAgICAgICBpbnN0YSA9IG5ldyBXb3JrZmxvd0luc3RhbmNlKHRoaXMpO1xuICAgICAgICAgICAgaW5zdGEuc2V0V29ya2Zsb3cod2ZEZXNjLndvcmtmbG93LCBpbnN0YW5jZUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbnN0YS51cGRhdGVkT24gPT09IG51bGwgfHwgaW5zdGEudXBkYXRlZE9uLmdldFRpbWUoKSAhPT0gYWN0dWFsVGltZXN0YW1wLmdldFRpbWUoKSB8fCBzZWxmLm9wdGlvbnMuYWx3YXlzTG9hZFN0YXRlKSB7XG4gICAgICAgICAgICBsZXQgc3RhdGUgPSB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UubG9hZFN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpO1xuICAgICAgICAgICAgaW5zdGEucmVzdG9yZVN0YXRlKHN0YXRlKTtcbiAgICAgICAgICAgIHJldHVybiBpbnN0YTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbnN0YTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jaGVja0lmSW5zdGFuY2VSdW5uaW5nID0gYXN5bmMoXG4gICAgZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcy5leGlzdHMod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gKHlpZWxkIHRoaXMuX3BlcnNpc3RlbmNlLmlzUnVubmluZyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuYWRkVHJhY2tlciA9IGZ1bmN0aW9uICh0cmFja2VyKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KHRyYWNrZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0LlwiKTtcbiAgICB9XG4gICAgdGhpcy5fdHJhY2tlcnMucHVzaCh0cmFja2VyKTtcbiAgICAvLyBUT0RPOiBhZGQgdHJhY2tlciB0byBhbGwgaW5zdGFuY2VzXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmtmbG93SG9zdDtcbiJdfQ==
