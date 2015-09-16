"use strict";
var WorkflowRegistry = require("./workflowRegistry");
var _ = require("lodash");
var Activity = require("../activities/activity");
var Workflow = require("../activities/workflow");
var WorkflowPersistence = require("./workflowPersistence");
var WorkflowInstance = require("./workflowInstance");
var InstanceIdParser = require("./instanceIdParser");
var enums = require("../common/enums");
var Bluebird = require("bluebird");
var KnownInstaStore = require("./knownInstaStore");
var specStrings = require("../common/specStrings");
var errors = require("../common/errors");
var Serializer = require("backpack-node").system.Serializer;
var is = require("../common/is");
var KeepLockAlive = require("./keepLockAlive");
var asyncHelpers = require("../common/asyncHelpers");
var async = asyncHelpers.async;
var WakeUp = require("./wakeUp");
var assert = require("assert");
var debug = require("debug")("wf4node:WorkflowHost");
var EventEmitter = require("events").EventEmitter;
var util = require("util");
function WorkflowHost(options) {
  EventEmitter.call(this);
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
    enablePromotions: false,
    wakeUpOptions: {
      interval: 5000,
      batchSize: 10
    }
  }, options);
  if (this._options.persistence !== null) {
    this._persistence = new WorkflowPersistence(this._options.persistence);
  }
  this._knownRunningInstances = new KnownInstaStore();
  this._wakeUp = null;
  this._shutdown = false;
}
util.inherits(WorkflowHost, EventEmitter);
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
  persistence: {get: function() {
      return this._persistence;
    }},
  _inLockTimeout: {get: function() {
      return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
    }}
});
WorkflowHost.prototype.registerWorkflow = function(workflow) {
  this._verify();
  this._registry.register(workflow);
  this.emit("registered", {
    name: workflow.name,
    version: workflow.version
  });
};
WorkflowHost.prototype.registerActivity = function(activity, name, version) {
  this._verify();
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
  var self = this;
  if (!this._isInitialized) {
    if (this._options.wakeUpOptions && this._options.wakeUpOptions.interval > 0) {
      this._wakeUp = new WakeUp(this._knownRunningInstances, this._persistence, this._options.wakeUpOptions);
      this._wakeUp.on("continue", function(i) {
        self._continueWokeUpInstance(i);
      });
      this._wakeUp.on("error", function(e) {
        self.emit("error", e);
      });
      this._wakeUp.start();
    }
    this._isInitialized = true;
  }
};
WorkflowHost.prototype.invokeMethod = async($traceurRuntime.initGeneratorFunction(function $__13(workflowName, methodName, args) {
  var self,
      instanceId,
      creatableWorkflow,
      results,
      $__5,
      $__6,
      $__7,
      $__3,
      $__2,
      info,
      tryId,
      i,
      result,
      ir,
      cr,
      $__14,
      $__15,
      $__16,
      $__17,
      $__18,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          this._verify();
          debug("Invoking method: '%s' of workflow: '%s' by arguments '%j'", workflowName, methodName, args);
          if (!_(workflowName).isString()) {
            throw new TypeError("Argument 'workflowName' is not a string.");
          }
          workflowName = workflowName.trim();
          if (!_(methodName).isString()) {
            throw new TypeError("Argument 'methodName' is not a string.");
          }
          methodName = methodName.trim();
          if (!_.isUndefined(args) && !_.isArray(args)) {
            args = [args];
          }
          self = this;
          self._initialize();
          instanceId = null;
          creatableWorkflow = null;
          results = [];
          $__5 = true;
          $__6 = false;
          $__7 = undefined;
          try {
            for ($__3 = void 0, $__2 = (self._registry.methodInfos(workflowName, methodName))[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
              info = $__3.value;
              {
                tryId = self._instanceIdParser.parse(info.instanceIdPath, args);
                if (!_.isUndefined(tryId)) {
                  results.push({
                    info: info,
                    id: tryId
                  });
                }
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
          if (process.env.NODE_ENV !== "production") {
            debug("Possible methods: %j", _(results).map(function(r) {
              return {
                workflow: {
                  name: r.info.workflow.name,
                  version: r.info.workflow.version
                },
                id: r.id
              };
            }).toArray());
          }
          $ctx.state = 69;
          break;
        case 69:
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
          $__14 = self._checkIfInstanceRunning;
          $__15 = result.id;
          $__16 = $__14.call(self, workflowName, $__15);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__16;
        case 2:
          $__17 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__18 = $__17;
          $ctx.state = 8;
          break;
        case 9:
          $__18 = !instanceId;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__18) ? 14 : 13;
          break;
        case 14:
          instanceId = result.id;
          $ctx.state = 19;
          break;
        case 19:
          $ctx.state = (instanceId) ? 41 : 66;
          break;
        case 41:
          debug("Found a continuable instance id: %s. Invoking method on that.", instanceId);
          $ctx.state = 42;
          break;
        case 42:
          $ctx.pushTry(32, null);
          $ctx.state = 35;
          break;
        case 35:
          this.emit("invoke", {
            instanceId: instanceId,
            workflowName: workflowName,
            methodName: methodName,
            args: args
          });
          $ctx.state = 29;
          break;
        case 29:
          $ctx.state = 23;
          return (self._invokeMethodOnRunningInstance(instanceId, workflowName, methodName, args));
        case 23:
          ir = $ctx.sent;
          $ctx.state = 25;
          break;
        case 25:
          this.emit("invokeComplete", {
            instanceId: instanceId,
            workflowName: workflowName,
            methodName: methodName,
            args: args
          });
          debug("Invoke completed, result: %j", ir);
          $ctx.state = 31;
          break;
        case 31:
          $ctx.returnValue = ir;
          $ctx.state = -2;
          break;
        case 27:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 32:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 38;
          break;
        case 38:
          debug("Invoke failed: %s", e.stack);
          this.emit("invokeFail", {
            instanceId: instanceId,
            workflowName: workflowName,
            methodName: methodName,
            args: args,
            error: e
          });
          this.emit("error", e);
          throw e;
          $ctx.state = -2;
          break;
        case 66:
          $ctx.state = (creatableWorkflow) ? 62 : 64;
          break;
        case 62:
          debug("Found a creatable workflow (name: '%s', version: '%d'), invoking a create method on that.", creatableWorkflow.name, creatableWorkflow.version);
          $ctx.state = 63;
          break;
        case 63:
          $ctx.pushTry(53, null);
          $ctx.state = 56;
          break;
        case 56:
          this.emit("create", {
            creatableWorkflow: creatableWorkflow,
            workflowName: workflowName,
            methodName: methodName,
            args: args
          });
          $ctx.state = 50;
          break;
        case 50:
          $ctx.state = 44;
          return (self._createInstanceAndInvokeMethod(creatableWorkflow, workflowName, methodName, args));
        case 44:
          cr = $ctx.sent;
          $ctx.state = 46;
          break;
        case 46:
          this.emit("createComplete", {
            creatableWorkflow: creatableWorkflow,
            workflowName: workflowName,
            methodName: methodName,
            args: args
          });
          debug("Create completed, result: %j", cr);
          $ctx.state = 52;
          break;
        case 52:
          $ctx.returnValue = cr;
          $ctx.state = -2;
          break;
        case 48:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 53:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 59;
          break;
        case 59:
          debug("Create failed: %s", e.stack);
          this.emit("createFail", {
            creatableWorkflow: creatableWorkflow,
            workflowName: workflowName,
            methodName: methodName,
            args: args,
            error: e
          });
          this.emit("error", e);
          throw e;
          $ctx.state = -2;
          break;
        case 64:
          debug("No continuable workflows have been found.");
          throw new errors.MethodIsNotAccessibleError("Cannot create or continue workflow '" + workflowName + "' by calling method '" + methodName + "'.");
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__13, this);
}));
WorkflowHost.prototype._createInstanceAndInvokeMethod = async($traceurRuntime.initGeneratorFunction(function $__19(workflow, workflowName, methodName, args) {
  var self,
      lockInfo,
      insta,
      result,
      keepLockAlive,
      insta$__9,
      result$__10,
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
          insta$__9 = new WorkflowInstance(self);
          $ctx.state = 49;
          break;
        case 49:
          $ctx.state = 12;
          return (insta$__9.create(workflow, methodName, args, lockInfo));
        case 12:
          result$__10 = $ctx.sent;
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = (insta$__9.execState === enums.ActivityStates.idle) ? 43 : 45;
          break;
        case 43:
          self._knownRunningInstances.add(workflowName, insta$__9);
          $ctx.state = 44;
          break;
        case 44:
          $ctx.pushTry(19, null);
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = 16;
          return self._persistence.persistState(insta$__9);
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
          debug("Cannot persist instance of workflow name: '" + workflowName + "' instance id '" + insta$__9.id + "':\n" + e.stack);
          self.emit("error", e);
          self._knownRunningInstances.remove(workflowName, insta$__9.id);
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
          debug("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta$__9.id + "':\n" + e.stack);
          self.emit("error", e);
          $ctx.state = 37;
          break;
        case 37:
          $ctx.returnValue = result$__10;
          $ctx.state = 51;
          $ctx.finallyFallThrough = -2;
          break;
        case 45:
          $ctx.returnValue = result$__10;
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
  }, $__19, this);
}));
WorkflowHost.prototype._invokeMethodOnRunningInstance = async($traceurRuntime.initGeneratorFunction(function $__20(instanceId, workflowName, methodName, args) {
  var self,
      insta,
      result,
      lockName,
      lockInfo,
      keepLockAlive,
      insta$__11,
      result$__12,
      persistAndUnlock,
      e,
      removeE,
      exitE;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          $ctx.state = 163;
          break;
        case 163:
          $ctx.state = (!self._persistence) ? 1 : 157;
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
        case 157:
          lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
          $ctx.state = 158;
          break;
        case 158:
          $ctx.pushTry(36, null);
          $ctx.state = 39;
          break;
        case 39:
          debug("Locking instance.");
          $ctx.state = 33;
          break;
        case 33:
          $ctx.state = 29;
          return (self._persistence.enterLock(lockName, self.options.enterLockTimeout, self._inLockTimeout));
        case 29:
          lockInfo = $ctx.sent;
          $ctx.state = 31;
          break;
        case 31:
          debug("Locked: %j", lockInfo);
          $ctx.state = 35;
          break;
        case 35:
          $ctx.popTry();
          $ctx.state = 41;
          break;
        case 36:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 42;
          break;
        case 42:
          if (e instanceof errors.TimeoutError) {
            throw new errors.MethodIsNotAccessibleError("Cannot call method of workflow '" + workflowName + "', because '" + methodName + "' is locked.");
          }
          throw e;
          $ctx.state = 41;
          break;
        case 41:
          keepLockAlive = null;
          $ctx.state = 160;
          break;
        case 160:
          $ctx.pushTry(150, null);
          $ctx.state = 153;
          break;
        case 153:
          keepLockAlive = new KeepLockAlive(self._persistence, lockInfo, self._inLockTimeout, self.options.lockRenewalTimeout);
          $ctx.state = 132;
          break;
        case 132:
          $ctx.state = 46;
          return (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
        case 46:
          insta$__11 = $ctx.sent;
          $ctx.state = 48;
          break;
        case 48:
          $ctx.pushTry(124, null);
          $ctx.state = 127;
          break;
        case 127:
          $ctx.state = 50;
          return (insta$__11.callMethod(methodName, args));
        case 50:
          result$__12 = $ctx.sent;
          $ctx.state = 52;
          break;
        case 52:
          $ctx.state = (insta$__11.execState === enums.ActivityStates.idle) ? 62 : 104;
          break;
        case 62:
          persistAndUnlock = function() {
            return self._persistence.persistState(insta$__11).catch(function(e) {
              debug("Cannot persist instance for workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + e.stack);
              self.emit("error", e);
              self._knownRunningInstances.remove(workflowName, insta$__11.id);
            }).finally(function() {
              debug("Unlocking: %j", lockInfo);
              return self._persistence.exitLock(lockInfo.id).then(function() {
                debug("Unlocked.");
              }, function(e) {
                debug("Cannot exit lock for workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + e.stack);
                self.emit("error", e);
              }).finally(function() {
                keepLockAlive.end();
              });
            });
          };
          $ctx.state = 63;
          break;
        case 63:
          $ctx.state = (self.options.lazyPersistence) ? 57 : 53;
          break;
        case 57:
          setImmediate(persistAndUnlock);
          $ctx.state = 58;
          break;
        case 53:
          $ctx.state = 54;
          return persistAndUnlock();
        case 54:
          $ctx.maybeThrow();
          $ctx.state = 58;
          break;
        case 58:
          $ctx.returnValue = result$__12;
          $ctx.state = -2;
          break;
        case 104:
          $ctx.state = (insta$__11.execState === enums.ActivityStates.complete) ? 100 : 102;
          break;
        case 100:
          self._knownRunningInstances.remove(workflowName, insta$__11.id);
          $ctx.state = 101;
          break;
        case 101:
          $ctx.pushTry(null, 91);
          $ctx.state = 93;
          break;
        case 93:
          $ctx.pushTry(68, null);
          $ctx.state = 71;
          break;
        case 71:
          $ctx.state = 65;
          return self._persistence.removeState(workflowName, insta$__11.id, true);
        case 65:
          $ctx.maybeThrow();
          $ctx.state = 67;
          break;
        case 67:
          $ctx.popTry();
          $ctx.state = 73;
          break;
        case 68:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 74;
          break;
        case 74:
          debug("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + e.stack);
          self.emit("error", e);
          $ctx.state = 73;
          break;
        case 73:
          $ctx.pushTry(81, null);
          $ctx.state = 84;
          break;
        case 84:
          $ctx.state = 78;
          return self._persistence.exitLock(lockInfo.id);
        case 78:
          $ctx.maybeThrow();
          $ctx.state = 80;
          break;
        case 80:
          $ctx.popTry();
          $ctx.state = 91;
          $ctx.finallyFallThrough = 86;
          break;
        case 81:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 87;
          break;
        case 87:
          debug("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + e.stack);
          self.emit("error", e);
          $ctx.state = 91;
          $ctx.finallyFallThrough = 86;
          break;
        case 91:
          $ctx.popTry();
          $ctx.state = 97;
          break;
        case 97:
          keepLockAlive.end();
          $ctx.state = 95;
          break;
        case 86:
          $ctx.returnValue = result$__12;
          $ctx.state = -2;
          break;
        case 102:
          throw new errors.WorkflowError("Instance '" + insta$__11.id + "' is in an invalid state '" + insta$__11.execState + "' after invocation of the method '" + methodName + "'.");
          $ctx.state = 61;
          break;
        case 61:
          $ctx.popTry();
          $ctx.state = 129;
          break;
        case 124:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 120;
          break;
        case 120:
          self._knownRunningInstances.remove(workflowName, insta$__11.id);
          $ctx.state = 121;
          break;
        case 121:
          $ctx.state = (self._persistence) ? 112 : 115;
          break;
        case 112:
          $ctx.pushTry(110, null);
          $ctx.state = 113;
          break;
        case 113:
          $ctx.state = 107;
          return (self._persistence.removeState(workflowName, insta$__11.id, false, e));
        case 107:
          $ctx.maybeThrow();
          $ctx.state = 109;
          break;
        case 109:
          $ctx.popTry();
          $ctx.state = 115;
          break;
        case 110:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          removeE = $ctx.storedException;
          $ctx.state = 116;
          break;
        case 116:
          debug("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + removeE.stack);
          self.emit(removeE);
          $ctx.state = 115;
          break;
        case 115:
          throw e;
          $ctx.state = 129;
          break;
        case 129:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 150:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 146;
          break;
        case 146:
          if (keepLockAlive) {
            keepLockAlive.end();
          }
          $ctx.state = 147;
          break;
        case 147:
          $ctx.pushTry(137, null);
          $ctx.state = 140;
          break;
        case 140:
          $ctx.state = 134;
          return self._persistence.exitLock(lockInfo.id);
        case 134:
          $ctx.maybeThrow();
          $ctx.state = 136;
          break;
        case 136:
          $ctx.popTry();
          $ctx.state = 142;
          break;
        case 137:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          exitE = $ctx.storedException;
          $ctx.state = 143;
          break;
        case 143:
          debug("Cannot exit lock '" + lockInfo.id + "':\n" + exitE.stack);
          self.emit("error", exitE);
          $ctx.state = 142;
          break;
        case 142:
          throw e;
          $ctx.state = -2;
          break;
        case 95:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__20, this);
}));
WorkflowHost.prototype._enterLockForCreatedInstance = async($traceurRuntime.initGeneratorFunction(function $__21(insta, lockInfo) {
  var li,
      $__22,
      $__23,
      $__24,
      $__25,
      $__26,
      $__27;
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
          $__22 = this._persistence;
          $__23 = $__22.isRunning;
          $__24 = insta.workflowName;
          $__25 = insta.id;
          $__26 = $__23.call($__22, $__24, $__25);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return $__26;
        case 6:
          $__27 = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__27) ? 11 : 12;
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
  }, $__21, this);
}));
WorkflowHost.prototype._getInLockTimeout = function() {
  return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
};
WorkflowHost.prototype._verifyAndRestoreInstanceState = async($traceurRuntime.initGeneratorFunction(function $__28(instanceId, workflowName, methodName, args) {
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
          if (e instanceof errors.WorkflowError || !_.isUndefined(global[e.name]) || e.name === "AssertionError") {
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
  }, $__28, this);
}));
WorkflowHost.prototype._restoreInstanceState = async($traceurRuntime.initGeneratorFunction(function $__29(instanceId, workflowName, workflowVersion, actualTimestamp) {
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
          if (_.isUndefined(insta)) {
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
  }, $__29, this);
}));
WorkflowHost.prototype._checkIfInstanceRunning = async($traceurRuntime.initGeneratorFunction(function $__30(workflowName, instanceId) {
  var $__31,
      $__32,
      $__33,
      $__34;
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
          $__31 = this._persistence;
          $__32 = $__31.isRunning;
          $__33 = $__32.call($__31, workflowName, instanceId);
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = 5;
          return $__33;
        case 5:
          $__34 = $ctx.sent;
          $ctx.state = 7;
          break;
        case 7:
          $ctx.returnValue = $__34;
          $ctx.state = -2;
          break;
        case 11:
          $ctx.returnValue = false;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__30, this);
}));
WorkflowHost.prototype.addTracker = function(tracker) {
  this._verify();
  if (!_.isObject(tracker)) {
    throw new TypeError("Argument is not an object.");
  }
  this._trackers.push(tracker);
};
WorkflowHost.prototype._continueWokeUpInstance = async($traceurRuntime.initGeneratorFunction(function $__35(wakeupable) {
  var result,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          assert(_.isPlainObject(wakeupable));
          assert(_.isString(wakeupable.instanceId));
          assert(_.isString(wakeupable.workflowName));
          assert(_.isPlainObject(wakeupable.activeDelay));
          assert(_.isString(wakeupable.activeDelay.methodName));
          assert(_.isDate(wakeupable.activeDelay.delayTo));
          assert(_.isFunction(wakeupable.result.resolve));
          assert(_.isFunction(wakeupable.result.reject));
          $ctx.state = 24;
          break;
        case 24:
          $ctx.pushTry(16, null);
          $ctx.state = 19;
          break;
        case 19:
          debug("Invoking DelayTo instanceId: %s, workflowName:%s, methodName: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
          this.emit("delayTo", {
            instanceId: wakeupable.instanceId,
            workflowName: wakeupable.workflowName,
            activeDelay: wakeupable.activeDelay
          });
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return this._invokeMethodOnRunningInstance(wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, [wakeupable.instanceId, wakeupable.activeDelay.delayTo]);
        case 2:
          result = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s invoked.", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
          this.emit("delayToComplete", {
            instanceId: wakeupable.instanceId,
            workflowName: wakeupable.workflowName,
            activeDelay: wakeupable.activeDelay,
            result: result
          });
          wakeupable.result.resolve(result);
          $ctx.state = 8;
          break;
        case 8:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 16:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 13;
          break;
        case 13:
          $ctx.state = (e instanceof errors.MethodIsNotAccessibleError || e instanceof errors.WorkflowNotFoundError) ? 11 : 10;
          break;
        case 11:
          debug("DelayTo's method is not accessible since it got selected for continuation.");
          this.emit("delayToComplete", {
            instanceId: wakeupable.instanceId,
            workflowName: wakeupable.workflowName,
            activeDelay: wakeupable.activeDelay,
            result: e
          });
          wakeupable.result.resolve(e);
          $ctx.state = 12;
          break;
        case 12:
          $ctx.state = -2;
          break;
        case 10:
          debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s error: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, e.stack);
          this.emit("delayToFail", {
            instanceId: wakeupable.instanceId,
            workflowName: wakeupable.workflowName,
            activeDelay: wakeupable.activeDelay,
            error: e
          });
          wakeupable.result.reject(e);
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__35, this);
}));
WorkflowHost.prototype._verify = function() {
  if (this._shutdown) {
    throw new errors.WorkflowError("Workflow host has been shut down.");
  }
};
WorkflowHost.prototype.shutdown = function() {
  if (this._shutdown) {
    return;
  }
  if (this._wakeUp) {
    this._wakeUp.stop();
    this._wakeUp.removeAllListeners();
    this._wakeUp = null;
  }
  this._shutdown = true;
  this.removeAllListeners();
};
module.exports = WorkflowHost;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxtQ0FBa0MsQ0FBQyxDQUFDO0VBQ3ZFO0FBQUEsQUFDSixDQUFDO0FBRUQsV0FBVyxVQUFVLFNBQVMsRUFBSSxVQUFVLEFBQUQsQ0FBRztBQUMxQyxLQUFJLElBQUcsVUFBVSxDQUFHO0FBQ2hCLFVBQU07RUFDVjtBQUFBLEFBRUEsS0FBSSxJQUFHLFFBQVEsQ0FBRztBQUNkLE9BQUcsUUFBUSxLQUFLLEFBQUMsRUFBQyxDQUFDO0FBQ25CLE9BQUcsUUFBUSxtQkFBbUIsQUFBQyxFQUFDLENBQUM7QUFDakMsT0FBRyxRQUFRLEVBQUksS0FBRyxDQUFDO0VBQ3ZCO0FBQUEsQUFFQSxLQUFHLFVBQVUsRUFBSSxLQUFHLENBQUM7QUFDckIsS0FBRyxtQkFBbUIsQUFBQyxFQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVELEtBQUssUUFBUSxFQUFJLGFBQVcsQ0FBQztBQUM3QiIsImZpbGUiOiJob3N0aW5nL3dvcmtmbG93SG9zdC5qcyIsInNvdXJjZVJvb3QiOiJsaWIvZXM2Iiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmxldCBXb3JrZmxvd1JlZ2lzdHJ5ID0gcmVxdWlyZShcIi4vd29ya2Zsb3dSZWdpc3RyeVwiKTtcbmxldCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbmxldCBBY3Rpdml0eSA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL2FjdGl2aXR5XCIpO1xubGV0IFdvcmtmbG93ID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvd29ya2Zsb3dcIik7XG5sZXQgV29ya2Zsb3dQZXJzaXN0ZW5jZSA9IHJlcXVpcmUoXCIuL3dvcmtmbG93UGVyc2lzdGVuY2VcIik7XG5sZXQgV29ya2Zsb3dJbnN0YW5jZSA9IHJlcXVpcmUoXCIuL3dvcmtmbG93SW5zdGFuY2VcIik7XG5sZXQgSW5zdGFuY2VJZFBhcnNlciA9IHJlcXVpcmUoXCIuL2luc3RhbmNlSWRQYXJzZXJcIik7XG5sZXQgZW51bXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2VudW1zXCIpO1xubGV0IEJsdWViaXJkID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xubGV0IEtub3duSW5zdGFTdG9yZSA9IHJlcXVpcmUoXCIuL2tub3duSW5zdGFTdG9yZVwiKTtcbmxldCBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XG5sZXQgZXJyb3JzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lcnJvcnNcIik7XG5sZXQgU2VyaWFsaXplciA9IHJlcXVpcmUoXCJiYWNrcGFjay1ub2RlXCIpLnN5c3RlbS5TZXJpYWxpemVyO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBLZWVwTG9ja0FsaXZlID0gcmVxdWlyZShcIi4va2VlcExvY2tBbGl2ZVwiKTtcbmxldCBhc3luY0hlbHBlcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2FzeW5jSGVscGVyc1wiKTtcbmxldCBhc3luYyA9IGFzeW5jSGVscGVycy5hc3luYztcbmxldCBXYWtlVXAgPSByZXF1aXJlKFwiLi93YWtlVXBcIik7XG5sZXQgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKTtcbmxldCBkZWJ1ZyA9IHJlcXVpcmUoXCJkZWJ1Z1wiKShcIndmNG5vZGU6V29ya2Zsb3dIb3N0XCIpO1xubGV0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoXCJldmVudHNcIikuRXZlbnRFbWl0dGVyO1xubGV0IHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcblxuZnVuY3Rpb24gV29ya2Zsb3dIb3N0KG9wdGlvbnMpIHtcbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuX3JlZ2lzdHJ5ID0gbmV3IFdvcmtmbG93UmVnaXN0cnkoKTtcbiAgICB0aGlzLl90cmFja2VycyA9IFtdO1xuICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9pbnN0YW5jZUlkUGFyc2VyID0gbmV3IEluc3RhbmNlSWRQYXJzZXIoKTtcbiAgICB0aGlzLl9wZXJzaXN0ZW5jZSA9IG51bGw7XG4gICAgdGhpcy5fb3B0aW9ucyA9IF8uZXh0ZW5kKFxuICAgICAgICB7XG4gICAgICAgICAgICBlbnRlckxvY2tUaW1lb3V0OiAxMDAwMCxcbiAgICAgICAgICAgIGxvY2tSZW5ld2FsVGltZW91dDogNTAwMCxcbiAgICAgICAgICAgIGFsd2F5c0xvYWRTdGF0ZTogZmFsc2UsXG4gICAgICAgICAgICBsYXp5UGVyc2lzdGVuY2U6IHRydWUsXG4gICAgICAgICAgICBwZXJzaXN0ZW5jZTogbnVsbCxcbiAgICAgICAgICAgIHNlcmlhbGl6ZXI6IG51bGwsXG4gICAgICAgICAgICBlbmFibGVQcm9tb3Rpb25zOiBmYWxzZSxcbiAgICAgICAgICAgIHdha2VVcE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogNTAwMCxcbiAgICAgICAgICAgICAgICBiYXRjaFNpemU6IDEwXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9wdGlvbnMpO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMucGVyc2lzdGVuY2UgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fcGVyc2lzdGVuY2UgPSBuZXcgV29ya2Zsb3dQZXJzaXN0ZW5jZSh0aGlzLl9vcHRpb25zLnBlcnNpc3RlbmNlKTtcbiAgICB9XG4gICAgdGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzID0gbmV3IEtub3duSW5zdGFTdG9yZSgpO1xuICAgIHRoaXMuX3dha2VVcCA9IG51bGw7XG4gICAgdGhpcy5fc2h1dGRvd24gPSBmYWxzZTtcbn1cblxudXRpbC5pbmhlcml0cyhXb3JrZmxvd0hvc3QsIEV2ZW50RW1pdHRlcik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFxuICAgIFdvcmtmbG93SG9zdC5wcm90b3R5cGUsIHtcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGlzSW5pdGlhbGl6ZWQ6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc0luaXRpYWxpemVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbnN0YW5jZUlkUGFyc2VyOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faW5zdGFuY2VJZFBhcnNlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcGVyc2lzdGVuY2U6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9wZXJzaXN0ZW5jZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX2luTG9ja1RpbWVvdXQ6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICsgTWF0aC5tYXgodGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCAqIDAuNCwgMzAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5yZWdpc3RlcldvcmtmbG93ID0gZnVuY3Rpb24gKHdvcmtmbG93KSB7XG4gICAgdGhpcy5fdmVyaWZ5KCk7XG4gICAgdGhpcy5fcmVnaXN0cnkucmVnaXN0ZXIod29ya2Zsb3cpO1xuICAgIHRoaXMuZW1pdChcInJlZ2lzdGVyZWRcIiwgeyBuYW1lOiB3b3JrZmxvdy5uYW1lLCB2ZXJzaW9uOiB3b3JrZmxvdy52ZXJzaW9uIH0pO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5yZWdpc3RlckFjdGl2aXR5ID0gZnVuY3Rpb24gKGFjdGl2aXR5LCBuYW1lLCB2ZXJzaW9uKSB7XG4gICAgdGhpcy5fdmVyaWZ5KCk7XG4gICAgaWYgKCEoYWN0aXZpdHkgaW5zdGFuY2VvZiBBY3Rpdml0eSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFjdGl2aXR5IGFyZ3VtZW50IGV4cGVjdGVkLlwiKTtcbiAgICB9XG4gICAgbGV0IHdmID0gbmV3IFdvcmtmbG93KCk7XG4gICAgd2YubmFtZSA9IG5hbWU7XG4gICAgd2YudmVyc2lvbiA9IHZlcnNpb247XG4gICAgd2YuYXJncyA9IFthY3Rpdml0eV07XG4gICAgdGhpcy5fcmVnaXN0cnkucmVnaXN0ZXIod2YpO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5faW5pdGlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCF0aGlzLl9pc0luaXRpYWxpemVkKSB7XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLndha2VVcE9wdGlvbnMgJiYgdGhpcy5fb3B0aW9ucy53YWtlVXBPcHRpb25zLmludGVydmFsID4gMCkge1xuICAgICAgICAgICAgdGhpcy5fd2FrZVVwID0gbmV3IFdha2VVcCh0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMsIHRoaXMuX3BlcnNpc3RlbmNlLCB0aGlzLl9vcHRpb25zLndha2VVcE9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5fd2FrZVVwLm9uKFwiY29udGludWVcIiwgZnVuY3Rpb24gKGkpIHsgc2VsZi5fY29udGludWVXb2tlVXBJbnN0YW5jZShpKTsgfSk7XG4gICAgICAgICAgICB0aGlzLl93YWtlVXAub24oXCJlcnJvclwiLCBmdW5jdGlvbiAoZSkgeyBzZWxmLmVtaXQoXCJlcnJvclwiLCBlKTsgfSk7XG4gICAgICAgICAgICB0aGlzLl93YWtlVXAuc3RhcnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuaW52b2tlTWV0aG9kID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgICBkZWJ1ZyhcIkludm9raW5nIG1ldGhvZDogJyVzJyBvZiB3b3JrZmxvdzogJyVzJyBieSBhcmd1bWVudHMgJyVqJ1wiLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpO1xuXG4gICAgaWYgKCFfKHdvcmtmbG93TmFtZSkuaXNTdHJpbmcoKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ3dvcmtmbG93TmFtZScgaXMgbm90IGEgc3RyaW5nLlwiKTtcbiAgICB9XG4gICAgd29ya2Zsb3dOYW1lID0gd29ya2Zsb3dOYW1lLnRyaW0oKTtcbiAgICBpZiAoIV8obWV0aG9kTmFtZSkuaXNTdHJpbmcoKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ21ldGhvZE5hbWUnIGlzIG5vdCBhIHN0cmluZy5cIik7XG4gICAgfVxuICAgIG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lLnRyaW0oKTtcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChhcmdzKSAmJiAhXy5pc0FycmF5KGFyZ3MpKSB7XG4gICAgICAgIGFyZ3MgPSBbYXJnc107XG4gICAgfVxuXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5faW5pdGlhbGl6ZSgpO1xuXG4gICAgbGV0IGluc3RhbmNlSWQgPSBudWxsO1xuICAgIGxldCBjcmVhdGFibGVXb3JrZmxvdyA9IG51bGw7XG5cbiAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAobGV0IGluZm8gb2Ygc2VsZi5fcmVnaXN0cnkubWV0aG9kSW5mb3Mod29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lKSkge1xuICAgICAgICBsZXQgdHJ5SWQgPSBzZWxmLl9pbnN0YW5jZUlkUGFyc2VyLnBhcnNlKGluZm8uaW5zdGFuY2VJZFBhdGgsIGFyZ3MpO1xuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQodHJ5SWQpKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpbmZvOiBpbmZvLFxuICAgICAgICAgICAgICAgICAgICBpZDogdHJ5SWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICAgIGRlYnVnKFwiUG9zc2libGUgbWV0aG9kczogJWpcIixcbiAgICAgICAgICAgIF8ocmVzdWx0cylcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvdzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHIuaW5mby53b3JrZmxvdy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IHIuaW5mby53b3JrZmxvdy52ZXJzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHIuaWRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50b0FycmF5KCkpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcmVzdWx0c1tpXTtcbiAgICAgICAgaWYgKHJlc3VsdC5pbmZvLmNhbkNyZWF0ZUluc3RhbmNlICYmICghY3JlYXRhYmxlV29ya2Zsb3cgfHwgY3JlYXRhYmxlV29ya2Zsb3cudmVyc2lvbiA8IHJlc3VsdC5pbmZvLndvcmtmbG93KSkge1xuICAgICAgICAgICAgY3JlYXRhYmxlV29ya2Zsb3cgPSByZXN1bHQuaW5mby53b3JrZmxvdztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWluc3RhbmNlSWQgJiYgKHlpZWxkIHNlbGYuX2NoZWNrSWZJbnN0YW5jZVJ1bm5pbmcod29ya2Zsb3dOYW1lLCByZXN1bHQuaWQpKSkge1xuICAgICAgICAgICAgaW5zdGFuY2VJZCA9IHJlc3VsdC5pZDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGluc3RhbmNlSWQpIHtcbiAgICAgICAgZGVidWcoXCJGb3VuZCBhIGNvbnRpbnVhYmxlIGluc3RhbmNlIGlkOiAlcy4gSW52b2tpbmcgbWV0aG9kIG9uIHRoYXQuXCIsIGluc3RhbmNlSWQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiaW52b2tlXCIsIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUlkOiBpbnN0YW5jZUlkLFxuICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgaXIgPSB5aWVsZCAoc2VsZi5faW52b2tlTWV0aG9kT25SdW5uaW5nSW5zdGFuY2UoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJpbnZva2VDb21wbGV0ZVwiLCB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZDogaW5zdGFuY2VJZCxcbiAgICAgICAgICAgICAgICB3b3JrZmxvd05hbWU6IHdvcmtmbG93TmFtZSxcbiAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBtZXRob2ROYW1lLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVidWcoXCJJbnZva2UgY29tcGxldGVkLCByZXN1bHQ6ICVqXCIsIGlyKTtcbiAgICAgICAgICAgIHJldHVybiBpcjtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZGVidWcoXCJJbnZva2UgZmFpbGVkOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImludm9rZUZhaWxcIiwge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlSWQ6IGluc3RhbmNlSWQsXG4gICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogbWV0aG9kTmFtZSxcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImVycm9yXCIsIGUpO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChjcmVhdGFibGVXb3JrZmxvdykge1xuICAgICAgICBkZWJ1ZyhcIkZvdW5kIGEgY3JlYXRhYmxlIHdvcmtmbG93IChuYW1lOiAnJXMnLCB2ZXJzaW9uOiAnJWQnKSwgaW52b2tpbmcgYSBjcmVhdGUgbWV0aG9kIG9uIHRoYXQuXCIsIGNyZWF0YWJsZVdvcmtmbG93Lm5hbWUsIGNyZWF0YWJsZVdvcmtmbG93LnZlcnNpb24pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiY3JlYXRlXCIsIHtcbiAgICAgICAgICAgICAgICBjcmVhdGFibGVXb3JrZmxvdzogY3JlYXRhYmxlV29ya2Zsb3csXG4gICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogbWV0aG9kTmFtZSxcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBjciA9IHlpZWxkIChzZWxmLl9jcmVhdGVJbnN0YW5jZUFuZEludm9rZU1ldGhvZChjcmVhdGFibGVXb3JrZmxvdywgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJjcmVhdGVDb21wbGV0ZVwiLCB7XG4gICAgICAgICAgICAgICAgY3JlYXRhYmxlV29ya2Zsb3c6IGNyZWF0YWJsZVdvcmtmbG93LFxuICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkZWJ1ZyhcIkNyZWF0ZSBjb21wbGV0ZWQsIHJlc3VsdDogJWpcIiwgY3IpO1xuICAgICAgICAgICAgcmV0dXJuIGNyO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkNyZWF0ZSBmYWlsZWQ6ICVzXCIsIGUuc3RhY2spO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiY3JlYXRlRmFpbFwiLCB7XG4gICAgICAgICAgICAgICAgY3JlYXRhYmxlV29ya2Zsb3c6IGNyZWF0YWJsZVdvcmtmbG93LFxuICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgICAgICAgICAgYXJnczogYXJncyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCBlKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRlYnVnKFwiTm8gY29udGludWFibGUgd29ya2Zsb3dzIGhhdmUgYmVlbiBmb3VuZC5cIik7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IoXCJDYW5ub3QgY3JlYXRlIG9yIGNvbnRpbnVlIHdvcmtmbG93ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBieSBjYWxsaW5nIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICB9XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fY3JlYXRlSW5zdGFuY2VBbmRJbnZva2VNZXRob2QgPSBhc3luYyhcbiAgICBmdW5jdGlvbiogKHdvcmtmbG93LCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGxldCBsb2NrSW5mbyA9IG51bGw7XG5cbiAgICAgICAgaWYgKCFzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgbGV0IGluc3RhID0gbmV3IFdvcmtmbG93SW5zdGFuY2Uoc2VsZik7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGluc3RhLmNyZWF0ZSh3b3JrZmxvdywgbWV0aG9kTmFtZSwgYXJncywgbG9ja0luZm8pKTtcbiAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5hZGQod29ya2Zsb3dOYW1lLCBpbnN0YSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbG9ja0luZm8gPSB7XG4gICAgICAgICAgICAgICAgaWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgICAgICBoZWxkVG86IG51bGxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBXaGVuIGxvY2sgd2lsbCBoZWxkLCB0aGVuIHdlIHNob3VsZCBrZWVwIGl0IGFsaXZlOlxuICAgICAgICAgICAgbGV0IGtlZXBMb2NrQWxpdmUgPSBuZXcgS2VlcExvY2tBbGl2ZShzZWxmLl9wZXJzaXN0ZW5jZSwgbG9ja0luZm8sIHNlbGYuX2luTG9ja1RpbWVvdXQsIHNlbGYub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgaW5zdGEgPSBuZXcgV29ya2Zsb3dJbnN0YW5jZShzZWxmKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGluc3RhLmNyZWF0ZSh3b3JrZmxvdywgbWV0aG9kTmFtZSwgYXJncywgbG9ja0luZm8pKTtcblxuICAgICAgICAgICAgICAgIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmFkZCh3b3JrZmxvd05hbWUsIGluc3RhKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBQZXJzaXN0IGFuZCB1bmxvY2s6XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5wZXJzaXN0U3RhdGUoaW5zdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBwZXJzaXN0IGluc3RhbmNlIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IGV4aXQgbG9jayBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdChcImVycm9yXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9pbnZva2VNZXRob2RPblJ1bm5pbmdJbnN0YW5jZSA9IGFzeW5jKGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICBsZXQgaW5zdGEgPSB5aWVsZCAoc2VsZi5fdmVyaWZ5QW5kUmVzdG9yZUluc3RhbmNlU3RhdGUoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGluc3RhLmNhbGxNZXRob2QobWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiSW5zdGFuY2UgJ1wiICsgaW5zdGEuaWQgKyBcIicgaXMgaW4gYW4gaW52YWxpZCBzdGF0ZSAnXCIgKyBpbnN0YS5leGVjU3RhdGUgKyBcIicgYWZ0ZXIgaW52b2NhdGlvbiBvZiB0aGUgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gTG9jayBpdDpcbiAgICAgICAgbGV0IGxvY2tOYW1lID0gc3BlY1N0cmluZ3MuaG9zdGluZy5kb3VibGVLZXlzKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XG4gICAgICAgIGxldCBsb2NrSW5mbztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRlYnVnKFwiTG9ja2luZyBpbnN0YW5jZS5cIik7XG4gICAgICAgICAgICBsb2NrSW5mbyA9IHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5lbnRlckxvY2sobG9ja05hbWUsIHNlbGYub3B0aW9ucy5lbnRlckxvY2tUaW1lb3V0LCBzZWxmLl9pbkxvY2tUaW1lb3V0KSk7XG4gICAgICAgICAgICBkZWJ1ZyhcIkxvY2tlZDogJWpcIiwgbG9ja0luZm8pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5UaW1lb3V0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLk1ldGhvZElzTm90QWNjZXNzaWJsZUVycm9yKFwiQ2Fubm90IGNhbGwgbWV0aG9kIG9mIHdvcmtmbG93ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJywgYmVjYXVzZSAnXCIgKyBtZXRob2ROYW1lICsgXCInIGlzIGxvY2tlZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBrZWVwTG9ja0FsaXZlID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gbG9jayB3aWxsIGhlbGQsIHRoZW4gd2Ugc2hvdWxkIGtlZXAgaXQgYWxpdmU6XG4gICAgICAgICAgICBrZWVwTG9ja0FsaXZlID0gbmV3IEtlZXBMb2NrQWxpdmUoc2VsZi5fcGVyc2lzdGVuY2UsIGxvY2tJbmZvLCBzZWxmLl9pbkxvY2tUaW1lb3V0LCBzZWxmLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0KTtcblxuICAgICAgICAgICAgLy8gTE9DS0VEXG4gICAgICAgICAgICBsZXQgaW5zdGEgPSB5aWVsZCAoc2VsZi5fdmVyaWZ5QW5kUmVzdG9yZUluc3RhbmNlU3RhdGUoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY2FsbE1ldGhvZChtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBQZXJzaXN0IGFuZCB1bmxvY2s6XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHBlcnNpc3RBbmRVbmxvY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fcGVyc2lzdGVuY2UucGVyc2lzdFN0YXRlKGluc3RhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBwZXJzaXN0IGluc3RhbmNlIGZvciB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluYWxseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiVW5sb2NraW5nOiAlalwiLCBsb2NrSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIlVubG9ja2VkLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IGV4aXQgbG9jayBmb3Igd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmxhenlQZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKHBlcnNpc3RBbmRVbmxvY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgcGVyc2lzdEFuZFVubG9jaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5yZW1vdmVTdGF0ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJDYW5ub3QgcmVtb3ZlIHN0YXRlIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdChcImVycm9yXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJDYW5ub3QgZXhpdCBsb2NrIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdChcImVycm9yXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiSW5zdGFuY2UgJ1wiICsgaW5zdGEuaWQgKyBcIicgaXMgaW4gYW4gaW52YWxpZCBzdGF0ZSAnXCIgKyBpbnN0YS5leGVjU3RhdGUgKyBcIicgYWZ0ZXIgaW52b2NhdGlvbiBvZiB0aGUgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5yZW1vdmVTdGF0ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkLCBmYWxzZSwgZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChyZW1vdmVFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCByZW1vdmUgc3RhdGUgb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgcmVtb3ZlRS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVtaXQocmVtb3ZlRSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGtlZXBMb2NrQWxpdmUpIHtcbiAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXhpdEUpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBleGl0IGxvY2sgJ1wiICsgbG9ja0luZm8uaWQgKyBcIic6XFxuXCIgKyBleGl0RS5zdGFjayk7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZXhpdEUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UgPSBhc3luYyhmdW5jdGlvbiogKGluc3RhLCBsb2NrSW5mbykge1xuICAgIGxldCBsaSA9IHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5lbnRlckxvY2soc3BlY1N0cmluZ3MuaG9zdGluZy5kb3VibGVLZXlzKGluc3RhLndvcmtmbG93TmFtZSwgaW5zdGEuaWQpLCB0aGlzLm9wdGlvbnMuZW50ZXJMb2NrVGltZW91dCwgdGhpcy5fZ2V0SW5Mb2NrVGltZW91dCgpKSk7XG4gICAgaWYgKHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5pc1J1bm5pbmcoaW5zdGEud29ya2Zsb3dOYW1lLCBpbnN0YS5pZCkpKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkNhbm5vdCBjcmVhdGUgaW5zdGFuY2Ugb2Ygd29ya2Zsb3cgJ1wiICsgaW5zdGEud29ya2Zsb3dOYW1lICsgXCInIGJ5IGlkICdcIiArIGluc3RhLmlkICsgXCInIGJlY2F1c2UgaXQncyBhbHJlYWR5IGV4aXN0cy5cIik7XG4gICAgfVxuICAgIGxvY2tJbmZvLmlkID0gbGkuaWQ7XG4gICAgbG9ja0luZm8ubmFtZSA9IGxpLm5hbWU7XG4gICAgbG9ja0luZm8uaGVsZFRvID0gbGkuaGVsZFRvO1xufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2dldEluTG9ja1RpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKyBNYXRoLm1heCh0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICogMC40LCAzMDAwKTtcbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX3ZlcmlmeUFuZFJlc3RvcmVJbnN0YW5jZVN0YXRlID0gYXN5bmMoZnVuY3Rpb24qIChpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IGluc3RhID0gbnVsbDtcbiAgICBsZXQgZXJyb3JUZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gXCJJbnN0YW5jZSAnXCIgKyBpbnN0YW5jZUlkICsgXCInIGhhcyBiZWVuIGludm9rZWQgZWxzZXdoZXJlIHNpbmNlIHRoZSBsb2NrIHRvb2sgaW4gdGhlIGN1cnJlbnQgaG9zdC5cIjtcbiAgICB9O1xuICAgIGlmIChzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGhlYWRlciA9IHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5nZXRSdW5uaW5nSW5zdGFuY2VJZEhlYWRlcih3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKTtcbiAgICAgICAgICAgIGluc3RhID0geWllbGQgKHNlbGYuX3Jlc3RvcmVJbnN0YW5jZVN0YXRlKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgaGVhZGVyLndvcmtmbG93VmVyc2lvbiwgaGVhZGVyLnVwZGF0ZWRPbikpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5Xb3JrZmxvd0Vycm9yIHx8ICFfLmlzVW5kZWZpbmVkKGdsb2JhbFtlLm5hbWVdKSB8fCBlLm5hbWUgPT09IFwiQXNzZXJ0aW9uRXJyb3JcIikge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoZXJyb3JUZXh0KCkgKyBcIlxcbklubmVyIGVycm9yOlxcblwiICsgZS5zdGFjay50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaW5zdGEgPSBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuZ2V0KHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XG4gICAgICAgIGlmICghaW5zdGEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihlcnJvclRleHQoKSArIFwiIElubmVyIGVycm9yOiBpbnN0YW5jZSBcIiArIGluc3RhbmNlSWQgKyBcIiBpcyB1bmtub3duLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbnN0YTtcbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9yZXN0b3JlSW5zdGFuY2VTdGF0ZSA9IGFzeW5jKFxuICAgIGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCB3b3JrZmxvd1ZlcnNpb24sIGFjdHVhbFRpbWVzdGFtcCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCFzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgaW5zdGFuY2UgZnJvbSBwZXJzaXN0ZW5jZSwgYmVjYXVzZSBob3N0IGhhcyBubyBwZXJzaXN0ZW5jZSByZWdpc3RlcmVkLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbnN0YSA9IHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5nZXQod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoaW5zdGEpKSB7XG4gICAgICAgICAgICBsZXQgd2ZEZXNjID0gc2VsZi5fcmVnaXN0cnkuZ2V0RGVzYyh3b3JrZmxvd05hbWUsIHdvcmtmbG93VmVyc2lvbik7XG4gICAgICAgICAgICBpbnN0YSA9IG5ldyBXb3JrZmxvd0luc3RhbmNlKHRoaXMpO1xuICAgICAgICAgICAgaW5zdGEuc2V0V29ya2Zsb3cod2ZEZXNjLndvcmtmbG93LCBpbnN0YW5jZUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbnN0YS51cGRhdGVkT24gPT09IG51bGwgfHwgaW5zdGEudXBkYXRlZE9uLmdldFRpbWUoKSAhPT0gYWN0dWFsVGltZXN0YW1wLmdldFRpbWUoKSB8fCBzZWxmLm9wdGlvbnMuYWx3YXlzTG9hZFN0YXRlKSB7XG4gICAgICAgICAgICBsZXQgc3RhdGUgPSB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UubG9hZFN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpO1xuICAgICAgICAgICAgaW5zdGEucmVzdG9yZVN0YXRlKHN0YXRlKTtcbiAgICAgICAgICAgIHJldHVybiBpbnN0YTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpbnN0YTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jaGVja0lmSW5zdGFuY2VSdW5uaW5nID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpIHtcbiAgICBpZiAodGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmV4aXN0cyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgcmV0dXJuICh5aWVsZCB0aGlzLl9wZXJzaXN0ZW5jZS5pc1J1bm5pbmcod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLmFkZFRyYWNrZXIgPSBmdW5jdGlvbiAodHJhY2tlcikge1xuICAgIHRoaXMuX3ZlcmlmeSgpO1xuXG4gICAgaWYgKCFfLmlzT2JqZWN0KHRyYWNrZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0LlwiKTtcbiAgICB9XG4gICAgdGhpcy5fdHJhY2tlcnMucHVzaCh0cmFja2VyKTtcbiAgICAvLyBUT0RPOiBhZGQgdHJhY2tlciB0byBhbGwgaW5zdGFuY2VzXG59O1xuXG4vKiBXYWtlIFVwKi9cblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fY29udGludWVXb2tlVXBJbnN0YW5jZSA9IGFzeW5jKGZ1bmN0aW9uKih3YWtldXBhYmxlKSB7XG4gICAgYXNzZXJ0KF8uaXNQbGFpbk9iamVjdCh3YWtldXBhYmxlKSk7XG4gICAgYXNzZXJ0KF8uaXNTdHJpbmcod2FrZXVwYWJsZS5pbnN0YW5jZUlkKSk7XG4gICAgYXNzZXJ0KF8uaXNTdHJpbmcod2FrZXVwYWJsZS53b3JrZmxvd05hbWUpKTtcbiAgICBhc3NlcnQoXy5pc1BsYWluT2JqZWN0KHdha2V1cGFibGUuYWN0aXZlRGVsYXkpKTtcbiAgICBhc3NlcnQoXy5pc1N0cmluZyh3YWtldXBhYmxlLmFjdGl2ZURlbGF5Lm1ldGhvZE5hbWUpKTtcbiAgICBhc3NlcnQoXy5pc0RhdGUod2FrZXVwYWJsZS5hY3RpdmVEZWxheS5kZWxheVRvKSk7XG4gICAgYXNzZXJ0KF8uaXNGdW5jdGlvbih3YWtldXBhYmxlLnJlc3VsdC5yZXNvbHZlKSk7XG4gICAgYXNzZXJ0KF8uaXNGdW5jdGlvbih3YWtldXBhYmxlLnJlc3VsdC5yZWplY3QpKTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzXG4gICAgICAgIGRlYnVnKFwiSW52b2tpbmcgRGVsYXlUbyBpbnN0YW5jZUlkOiAlcywgd29ya2Zsb3dOYW1lOiVzLCBtZXRob2ROYW1lOiAlc1wiLCB3YWtldXBhYmxlLmluc3RhbmNlSWQsIHdha2V1cGFibGUud29ya2Zsb3dOYW1lLCB3YWtldXBhYmxlLmFjdGl2ZURlbGF5Lm1ldGhvZE5hbWUpO1xuICAgICAgICB0aGlzLmVtaXQoXCJkZWxheVRvXCIsIHtcbiAgICAgICAgICAgIGluc3RhbmNlSWQ6IHdha2V1cGFibGUuaW5zdGFuY2VJZCxcbiAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsXG4gICAgICAgICAgICBhY3RpdmVEZWxheTogd2FrZXVwYWJsZS5hY3RpdmVEZWxheVxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIHRoaXMuX2ludm9rZU1ldGhvZE9uUnVubmluZ0luc3RhbmNlKHdha2V1cGFibGUuaW5zdGFuY2VJZCwgd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsIHdha2V1cGFibGUuYWN0aXZlRGVsYXkubWV0aG9kTmFtZSwgW3dha2V1cGFibGUuaW5zdGFuY2VJZCwgd2FrZXVwYWJsZS5hY3RpdmVEZWxheS5kZWxheVRvXSk7XG4gICAgICAgIGRlYnVnKFwiRGVsYXlUbyBpbnN0YW5jZUlkOiAlcywgd29ya2Zsb3dOYW1lOiVzLCBtZXRob2ROYW1lOiAlcyBpbnZva2VkLlwiLCB3YWtldXBhYmxlLmluc3RhbmNlSWQsIHdha2V1cGFibGUud29ya2Zsb3dOYW1lLCB3YWtldXBhYmxlLmFjdGl2ZURlbGF5Lm1ldGhvZE5hbWUpO1xuICAgICAgICB0aGlzLmVtaXQoXCJkZWxheVRvQ29tcGxldGVcIiwge1xuICAgICAgICAgICAgaW5zdGFuY2VJZDogd2FrZXVwYWJsZS5pbnN0YW5jZUlkLFxuICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3YWtldXBhYmxlLndvcmtmbG93TmFtZSxcbiAgICAgICAgICAgIGFjdGl2ZURlbGF5OiB3YWtldXBhYmxlLmFjdGl2ZURlbGF5LFxuICAgICAgICAgICAgcmVzdWx0OiByZXN1bHRcbiAgICAgICAgfSk7XG4gICAgICAgIHdha2V1cGFibGUucmVzdWx0LnJlc29sdmUocmVzdWx0KTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IgfHwgZSBpbnN0YW5jZW9mIGVycm9ycy5Xb3JrZmxvd05vdEZvdW5kRXJyb3IpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiRGVsYXlUbydzIG1ldGhvZCBpcyBub3QgYWNjZXNzaWJsZSBzaW5jZSBpdCBnb3Qgc2VsZWN0ZWQgZm9yIGNvbnRpbnVhdGlvbi5cIik7XG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJkZWxheVRvQ29tcGxldGVcIiwge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlSWQ6IHdha2V1cGFibGUuaW5zdGFuY2VJZCxcbiAgICAgICAgICAgICAgICB3b3JrZmxvd05hbWU6IHdha2V1cGFibGUud29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgIGFjdGl2ZURlbGF5OiB3YWtldXBhYmxlLmFjdGl2ZURlbGF5LFxuICAgICAgICAgICAgICAgIHJlc3VsdDogZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3YWtldXBhYmxlLnJlc3VsdC5yZXNvbHZlKGUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRlYnVnKFwiRGVsYXlUbyBpbnN0YW5jZUlkOiAlcywgd29ya2Zsb3dOYW1lOiVzLCBtZXRob2ROYW1lOiAlcyBlcnJvcjogJXNcIiwgd2FrZXVwYWJsZS5pbnN0YW5jZUlkLCB3YWtldXBhYmxlLndvcmtmbG93TmFtZSwgd2FrZXVwYWJsZS5hY3RpdmVEZWxheS5tZXRob2ROYW1lLCBlLnN0YWNrKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiZGVsYXlUb0ZhaWxcIiwge1xuICAgICAgICAgICAgaW5zdGFuY2VJZDogd2FrZXVwYWJsZS5pbnN0YW5jZUlkLFxuICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3YWtldXBhYmxlLndvcmtmbG93TmFtZSxcbiAgICAgICAgICAgIGFjdGl2ZURlbGF5OiB3YWtldXBhYmxlLmFjdGl2ZURlbGF5LFxuICAgICAgICAgICAgZXJyb3I6IGVcbiAgICAgICAgfSk7XG4gICAgICAgIHdha2V1cGFibGUucmVzdWx0LnJlamVjdChlKTtcbiAgICB9XG59KTtcblxuLyogU2h1dGRvd24gKi9cblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fdmVyaWZ5ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9zaHV0ZG93bikge1xuICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBob3N0IGhhcyBiZWVuIHNodXQgZG93bi5cIik7XG4gICAgfVxufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fc2h1dGRvd24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl93YWtlVXApIHtcbiAgICAgICAgdGhpcy5fd2FrZVVwLnN0b3AoKTtcbiAgICAgICAgdGhpcy5fd2FrZVVwLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLl93YWtlVXAgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX3NodXRkb3duID0gdHJ1ZTtcbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXb3JrZmxvd0hvc3Q7XG4iXX0=
