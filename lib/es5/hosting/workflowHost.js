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
WorkflowHost.prototype.stopOutdatedVersions = async($traceurRuntime.initGeneratorFunction(function $__13(workflowName) {
  var self,
      remove,
      count,
      topVersion,
      oldVersionHeaders,
      $__5,
      $__6,
      $__7,
      $__3,
      $__2,
      header,
      instanceId,
      lockName,
      lockInfo,
      keepLockAlive,
      e,
      $__8;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          this._verify();
          debug("Stopping outdated versions of workflow '%s'.", workflowName);
          $ctx.state = 90;
          break;
        case 90:
          $ctx.pushTry(80, null);
          $ctx.state = 83;
          break;
        case 83:
          self = this;
          remove = function(instanceId) {
            var knownInsta = self._knownRunningInstances.get(workflowName, instanceId);
            if (knownInsta) {
              debug("Removing instance: %s", instanceId);
              self._deleteWFInstance(knownInsta);
            }
          };
          count = 0;
          topVersion = this._registry.getTopVersion(workflowName);
          $ctx.state = 79;
          break;
        case 79:
          $ctx.state = (topVersion) ? 1 : 73;
          break;
        case 1:
          $ctx.state = 2;
          return this._getRunningInstanceHeadersForOtherVersion(workflowName, topVersion);
        case 2:
          oldVersionHeaders = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = (oldVersionHeaders.length) ? 70 : 62;
          break;
        case 70:
          debug("There is %d old version running. Stopping them.", oldVersionHeaders.length);
          $__5 = true;
          $__6 = false;
          $__7 = undefined;
          $ctx.state = 71;
          break;
        case 71:
          $ctx.pushTry(57, 58);
          $ctx.state = 60;
          break;
        case 60:
          $__3 = void 0, $__2 = (oldVersionHeaders)[$traceurRuntime.toProperty(Symbol.iterator)]();
          $ctx.state = 56;
          break;
        case 56:
          $ctx.state = (!($__5 = ($__3 = $__2.next()).done)) ? 52 : 54;
          break;
        case 46:
          $__5 = true;
          $ctx.state = 56;
          break;
        case 52:
          header = $__3.value;
          $ctx.state = 53;
          break;
        case 53:
          debug("Removing workflow '%s' of version $%s with id: '%s' from host.", header.workflowName, header.workflowVersion, header.instanceId);
          instanceId = header.instanceId;
          $ctx.state = 51;
          break;
        case 51:
          $ctx.pushTry(41, null);
          $ctx.state = 44;
          break;
        case 44:
          $ctx.state = (this._persistence) ? 34 : 38;
          break;
        case 34:
          lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
          lockInfo = void 0;
          debug("Locking instance: %s", instanceId);
          $ctx.state = 35;
          break;
        case 35:
          $ctx.state = 6;
          return (this._persistence.enterLock(lockName, this.options.enterLockTimeout, this._inLockTimeout));
        case 6:
          lockInfo = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          keepLockAlive = null;
          $ctx.state = 37;
          break;
        case 37:
          $ctx.pushTry(23, 24);
          $ctx.state = 26;
          break;
        case 26:
          debug("Locked: %j", lockInfo);
          keepLockAlive = new KeepLockAlive(this._persistence, lockInfo, this._inLockTimeout, this.options.lockRenewalTimeout);
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = 10;
          return this._persistence.removeState(workflowName, instanceId, false, "STOPPED.");
        case 10:
          $ctx.maybeThrow();
          $ctx.state = 12;
          break;
        case 12:
          remove(instanceId);
          count++;
          debug("Removed: %s", instanceId);
          $ctx.state = 16;
          break;
        case 16:
          $ctx.popTry();
          $ctx.state = 24;
          $ctx.finallyFallThrough = 28;
          break;
        case 23:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 29;
          break;
        case 29:
          debug("Error: %s", e.stack);
          throw e;
          $ctx.state = 24;
          $ctx.finallyFallThrough = 28;
          break;
        case 24:
          $ctx.popTry();
          $ctx.state = 33;
          break;
        case 33:
          debug("Unlocking.");
          if (keepLockAlive) {
            keepLockAlive.end();
          }
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = 18;
          return this._persistence.exitLock(lockInfo.id);
        case 18:
          $ctx.maybeThrow();
          $ctx.state = 20;
          break;
        case 38:
          remove(instanceId);
          count++;
          $ctx.state = 28;
          break;
        case 28:
          $ctx.popTry();
          $ctx.state = 46;
          break;
        case 41:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 47;
          break;
        case 47:
          debug("Error: %s", e.stack);
          throw new errors.WorkflowError(("Cannot stop instance of workflow '" + workflowName + "' of version " + header.workflowVersion + " with id: '" + instanceId + "' because of an internal error: " + e.stack));
          $ctx.state = 46;
          break;
        case 54:
          $ctx.popTry();
          $ctx.state = 58;
          $ctx.finallyFallThrough = 62;
          break;
        case 57:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          $__8 = $ctx.storedException;
          $ctx.state = 63;
          break;
        case 63:
          $__6 = true;
          $__7 = $__8;
          $ctx.state = 58;
          $ctx.finallyFallThrough = 62;
          break;
        case 58:
          $ctx.popTry();
          $ctx.state = 69;
          break;
        case 69:
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
          $ctx.state = 67;
          break;
        case 73:
          debug("There is no workflow registered by name '%s'.", workflowName);
          $ctx.state = 62;
          break;
        case 62:
          $ctx.returnValue = count;
          $ctx.state = -2;
          break;
        case 77:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 80:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 86;
          break;
        case 86:
          this.emit("error", e);
          throw e;
          $ctx.state = -2;
          break;
        case 67:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        case 20:
          switch ($ctx.finallyFallThrough) {
            case 71:
            case 60:
            case 56:
            case 46:
            case 52:
            case 53:
            case 51:
            case 44:
            case 34:
            case 35:
            case 6:
            case 8:
            case 37:
            case 26:
            case 14:
            case 10:
            case 12:
            case 16:
            case 23:
            case 29:
            case 24:
            case 33:
            case 22:
            case 18:
            case 20:
            case 38:
            case 28:
            case 41:
            case 47:
            case 54:
            case 57:
            case 63:
              $ctx.state = $ctx.finallyFallThrough;
              $ctx.finallyFallThrough = -1;
              break;
            default:
              $ctx.state = 58;
              break;
          }
          break;
        default:
          return $ctx.end();
      }
  }, $__13, this);
}));
WorkflowHost.prototype.invokeMethod = async($traceurRuntime.initGeneratorFunction(function $__14(workflowName, methodName, args) {
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
      $__15,
      $__16,
      $__17,
      $__18,
      $__19,
      $__20,
      $__21,
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
          $ctx.state = 71;
          break;
        case 71:
          i = 0;
          $ctx.state = 23;
          break;
        case 23:
          $ctx.state = (i < results.length) ? 19 : 21;
          break;
        case 15:
          i++;
          $ctx.state = 23;
          break;
        case 19:
          result = results[i];
          if (result.info.canCreateInstance && (!creatableWorkflow || creatableWorkflow.version < result.info.workflow.version)) {
            creatableWorkflow = result.info.workflow;
          }
          $ctx.state = 20;
          break;
        case 20:
          $__15 = _.isNull;
          $__16 = $__15.call(_, instanceId);
          $ctx.state = 13;
          break;
        case 13:
          $ctx.state = ($__16) ? 5 : 9;
          break;
        case 5:
          $__17 = self._checkIfInstanceRunning;
          $__18 = result.id;
          $__19 = $__17.call(self, workflowName, $__18);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__19;
        case 2:
          $__20 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__21 = $__20;
          $ctx.state = 8;
          break;
        case 9:
          $__21 = $__16;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__21) ? 16 : 15;
          break;
        case 16:
          instanceId = result.id;
          $ctx.state = 21;
          break;
        case 21:
          $ctx.state = (instanceId) ? 43 : 68;
          break;
        case 43:
          debug("Found a continuable instance id: %s. Invoking method on that.", instanceId);
          $ctx.state = 44;
          break;
        case 44:
          $ctx.pushTry(34, null);
          $ctx.state = 37;
          break;
        case 37:
          this.emit("invoke", {
            instanceId: instanceId,
            workflowName: workflowName,
            methodName: methodName,
            args: args
          });
          $ctx.state = 31;
          break;
        case 31:
          $ctx.state = 25;
          return (self._invokeMethodOnRunningInstance(instanceId, workflowName, methodName, args));
        case 25:
          ir = $ctx.sent;
          $ctx.state = 27;
          break;
        case 27:
          this.emit("invokeComplete", {
            instanceId: instanceId,
            workflowName: workflowName,
            methodName: methodName,
            args: args
          });
          debug("Invoke completed, result: %j", ir);
          $ctx.state = 33;
          break;
        case 33:
          $ctx.returnValue = ir;
          $ctx.state = -2;
          break;
        case 29:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 34:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 40;
          break;
        case 40:
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
        case 68:
          $ctx.state = (creatableWorkflow) ? 64 : 66;
          break;
        case 64:
          debug("Found a creatable workflow (name: '%s', version: '%d'), invoking a create method on that.", creatableWorkflow.name, creatableWorkflow.version);
          $ctx.state = 65;
          break;
        case 65:
          $ctx.pushTry(55, null);
          $ctx.state = 58;
          break;
        case 58:
          this.emit("create", {
            creatableWorkflow: creatableWorkflow,
            workflowName: workflowName,
            methodName: methodName,
            args: args
          });
          $ctx.state = 52;
          break;
        case 52:
          $ctx.state = 46;
          return (self._createInstanceAndInvokeMethod(creatableWorkflow, workflowName, methodName, args));
        case 46:
          cr = $ctx.sent;
          $ctx.state = 48;
          break;
        case 48:
          this.emit("createComplete", {
            creatableWorkflow: creatableWorkflow,
            workflowName: workflowName,
            methodName: methodName,
            args: args
          });
          debug("Create completed, result: %j", cr);
          $ctx.state = 54;
          break;
        case 54:
          $ctx.returnValue = cr;
          $ctx.state = -2;
          break;
        case 50:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 55:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 61;
          break;
        case 61:
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
        case 66:
          debug("No continuable workflows have been found.");
          throw new errors.MethodIsNotAccessibleError("Cannot create or continue workflow '" + workflowName + "' by calling method '" + methodName + "'.");
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__14, this);
}));
WorkflowHost.prototype._createInstanceAndInvokeMethod = async($traceurRuntime.initGeneratorFunction(function $__22(workflow, workflowName, methodName, args) {
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
          insta = self._createWFInstance();
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
          insta$__9 = self._createWFInstance();
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
  }, $__22, this);
}));
WorkflowHost.prototype._invokeMethodOnRunningInstance = async($traceurRuntime.initGeneratorFunction(function $__23(instanceId, workflowName, methodName, args) {
  var self,
      insta,
      result,
      lockName,
      lockInfo,
      keepLockAlive,
      insta$__11,
      persistAndUnlock,
      result$__12,
      e,
      removeE,
      exitE;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          $ctx.state = 166;
          break;
        case 166:
          $ctx.state = (!self._persistence) ? 1 : 160;
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
          self._deleteWFInstance(insta);
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
          if (e instanceof errors.MethodIsNotAccessibleError) {
            debug("Method is not accessible at the current state, bacause it might be stepped on another instance to another state tha is exists at current in this host. Client should retry.");
            throw e;
          }
          self._deleteWFInstance(insta);
          throw e;
          $ctx.state = -2;
          break;
        case 160:
          lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
          $ctx.state = 161;
          break;
        case 161:
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
          $ctx.state = 163;
          break;
        case 163:
          $ctx.pushTry(153, null);
          $ctx.state = 156;
          break;
        case 156:
          keepLockAlive = new KeepLockAlive(self._persistence, lockInfo, self._inLockTimeout, self.options.lockRenewalTimeout);
          $ctx.state = 135;
          break;
        case 135:
          $ctx.state = 46;
          return (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
        case 46:
          insta$__11 = $ctx.sent;
          $ctx.state = 48;
          break;
        case 48:
          $ctx.pushTry(127, null);
          $ctx.state = 130;
          break;
        case 130:
          persistAndUnlock = function() {
            return self._persistence.persistState(insta$__11).catch(function(e) {
              debug("Cannot persist instance for workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + e.stack);
              self.emit("error", e);
              self._deleteWFInstance(insta$__11);
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
          $ctx.state = 105;
          break;
        case 105:
          $ctx.state = 50;
          return (insta$__11.callMethod(methodName, args));
        case 50:
          result$__12 = $ctx.sent;
          $ctx.state = 52;
          break;
        case 52:
          $ctx.state = (insta$__11.execState === enums.ActivityStates.idle) ? 59 : 102;
          break;
        case 59:
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
        case 102:
          $ctx.state = (insta$__11.execState === enums.ActivityStates.complete) ? 98 : 100;
          break;
        case 98:
          self._deleteWFInstance(insta$__11);
          $ctx.state = 99;
          break;
        case 99:
          $ctx.pushTry(null, 89);
          $ctx.state = 91;
          break;
        case 91:
          $ctx.pushTry(66, null);
          $ctx.state = 69;
          break;
        case 69:
          $ctx.state = 63;
          return self._persistence.removeState(workflowName, insta$__11.id, true);
        case 63:
          $ctx.maybeThrow();
          $ctx.state = 65;
          break;
        case 65:
          $ctx.popTry();
          $ctx.state = 71;
          break;
        case 66:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 72;
          break;
        case 72:
          debug("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + e.stack);
          self.emit("error", e);
          $ctx.state = 71;
          break;
        case 71:
          $ctx.pushTry(79, null);
          $ctx.state = 82;
          break;
        case 82:
          $ctx.state = 76;
          return self._persistence.exitLock(lockInfo.id);
        case 76:
          $ctx.maybeThrow();
          $ctx.state = 78;
          break;
        case 78:
          $ctx.popTry();
          $ctx.state = 89;
          $ctx.finallyFallThrough = 84;
          break;
        case 79:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 85;
          break;
        case 85:
          debug("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + e.stack);
          self.emit("error", e);
          $ctx.state = 89;
          $ctx.finallyFallThrough = 84;
          break;
        case 89:
          $ctx.popTry();
          $ctx.state = 95;
          break;
        case 95:
          keepLockAlive.end();
          $ctx.state = 93;
          break;
        case 84:
          $ctx.returnValue = result$__12;
          $ctx.state = -2;
          break;
        case 100:
          throw new errors.WorkflowError("Instance '" + insta$__11.id + "' is in an invalid state '" + insta$__11.execState + "' after invocation of the method '" + methodName + "'.");
          $ctx.state = 61;
          break;
        case 61:
          $ctx.popTry();
          $ctx.state = 132;
          break;
        case 127:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 126;
          break;
        case 126:
          $ctx.state = (e instanceof errors.MethodIsNotAccessibleError) ? 124 : 120;
          break;
        case 124:
          debug("Method is not accessible at the current state, bacause it might be stepped on another instance to another state tha is exists at current in this host. Client should retry.");
          throw e;
          $ctx.state = 132;
          break;
        case 120:
          self._deleteWFInstance(insta$__11);
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
          $ctx.state = 132;
          break;
        case 132:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 153:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 149;
          break;
        case 149:
          if (keepLockAlive) {
            keepLockAlive.end();
          }
          $ctx.state = 150;
          break;
        case 150:
          $ctx.pushTry(140, null);
          $ctx.state = 143;
          break;
        case 143:
          $ctx.state = 137;
          return self._persistence.exitLock(lockInfo.id);
        case 137:
          $ctx.maybeThrow();
          $ctx.state = 139;
          break;
        case 139:
          $ctx.popTry();
          $ctx.state = 145;
          break;
        case 140:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          exitE = $ctx.storedException;
          $ctx.state = 146;
          break;
        case 146:
          debug("Cannot exit lock '" + lockInfo.id + "':\n" + exitE.stack);
          self.emit("error", exitE);
          $ctx.state = 145;
          break;
        case 145:
          throw e;
          $ctx.state = -2;
          break;
        case 93:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__23, this);
}));
WorkflowHost.prototype._enterLockForCreatedInstance = async($traceurRuntime.initGeneratorFunction(function $__24(insta, lockInfo) {
  var li,
      $__25,
      $__26,
      $__27,
      $__28,
      $__29,
      $__30;
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
          $__25 = this._persistence;
          $__26 = $__25.isRunning;
          $__27 = insta.workflowName;
          $__28 = insta.id;
          $__29 = $__26.call($__25, $__27, $__28);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return $__29;
        case 6:
          $__30 = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__30) ? 11 : 12;
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
  }, $__24, this);
}));
WorkflowHost.prototype._getInLockTimeout = function() {
  return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
};
WorkflowHost.prototype._verifyAndRestoreInstanceState = async($traceurRuntime.initGeneratorFunction(function $__31(instanceId, workflowName, methodName, args) {
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
          $ctx.state = 27;
          break;
        case 27:
          $ctx.state = (self._persistence) ? 14 : 21;
          break;
        case 14:
          $ctx.pushTry(12, null);
          $ctx.state = 15;
          break;
        case 15:
          $ctx.state = 2;
          return (self._persistence.getRunningInstanceIdHeader(workflowName, instanceId));
        case 2:
          header = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = (header) ? 5 : 9;
          break;
        case 5:
          $ctx.state = 6;
          return (self._restoreInstanceState(instanceId, workflowName, header.workflowVersion, header.updatedOn));
        case 6:
          insta = $ctx.sent;
          $ctx.state = 8;
          break;
        case 9:
          throw new errors.WorkflowError(errorText() + " Inner error: instance " + instanceId + " is unknown.");
          $ctx.state = 8;
          break;
        case 8:
          $ctx.popTry();
          $ctx.state = 17;
          break;
        case 12:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 18;
          break;
        case 18:
          if (e instanceof errors.WorkflowError || !_.isUndefined(global[e.name]) || e.name === "AssertionError") {
            throw e;
          }
          throw new errors.WorkflowError(errorText() + "\nInner error:\n" + e.stack.toString());
          $ctx.state = 17;
          break;
        case 21:
          insta = self._knownRunningInstances.get(workflowName, instanceId);
          if (!insta) {
            throw new errors.WorkflowError(errorText() + " Inner error: instance " + instanceId + " is unknown.");
          }
          $ctx.state = 17;
          break;
        case 17:
          $ctx.returnValue = insta;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__31, this);
}));
WorkflowHost.prototype._restoreInstanceState = async($traceurRuntime.initGeneratorFunction(function $__32(instanceId, workflowName, workflowVersion, actualTimestamp) {
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
            insta = self._createWFInstance();
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
  }, $__32, this);
}));
WorkflowHost.prototype._checkIfInstanceRunning = async($traceurRuntime.initGeneratorFunction(function $__33(workflowName, instanceId) {
  var $__34,
      $__35,
      $__36,
      $__37;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (this._persistence) ? 5 : 8;
          break;
        case 5:
          $__34 = this._persistence;
          $__35 = $__34.isRunning;
          $__36 = $__35.call($__34, workflowName, instanceId);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__36;
        case 2:
          $__37 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.returnValue = $__37;
          $ctx.state = -2;
          break;
        case 8:
          $ctx.returnValue = this._knownRunningInstances.exists(workflowName, instanceId);
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__33, this);
}));
WorkflowHost.prototype._getRunningInstanceHeadersForOtherVersion = async($traceurRuntime.initGeneratorFunction(function $__38(workflowName, version) {
  var $__39,
      $__40,
      $__41,
      $__42;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (this._persistence) ? 5 : 8;
          break;
        case 5:
          $__39 = this._persistence;
          $__40 = $__39.getRunningInstanceHeadersForOtherVersion;
          $__41 = $__40.call($__39, workflowName, version);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__41;
        case 2:
          $__42 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.returnValue = $__42;
          $ctx.state = -2;
          break;
        case 8:
          $ctx.returnValue = this._knownRunningInstances.getRunningInstanceHeadersForOtherVersion(workflowName, version);
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__38, this);
}));
WorkflowHost.prototype.addTracker = function(tracker) {
  this._verify();
  if (!_.isObject(tracker)) {
    throw new TypeError("Argument is not an object.");
  }
  this._trackers.push(tracker);
  this._knownRunningInstances.addTracker(tracker);
};
WorkflowHost.prototype._continueWokeUpInstance = async($traceurRuntime.initGeneratorFunction(function $__43(wakeupable) {
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
          this.emit("error", e);
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__43, this);
}));
WorkflowHost.prototype._createWFInstance = function() {
  var self = this;
  var insta = new WorkflowInstance(this);
  insta.on(enums.events.workflowEvent, function(args) {
    self.emit(enums.events.workflowEvent, args);
  });
  return insta;
};
WorkflowHost.prototype._deleteWFInstance = function(insta) {
  insta.removeAllListeners();
  this._knownRunningInstances.remove(insta.workflowName, insta.id);
};
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
//# sourceMappingURL=data:application/json;base64,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QUFDcEUsQ0FBQztBQUlELFdBQVcsVUFBVSxRQUFRLEVBQUksVUFBVSxBQUFELENBQUc7QUFDekMsS0FBSSxJQUFHLFVBQVUsQ0FBRztBQUNoQixRQUFNLElBQUksQ0FBQSxNQUFLLGNBQWMsQUFBQyxDQUFDLG1DQUFrQyxDQUFDLENBQUM7RUFDdkU7QUFBQSxBQUNKLENBQUM7QUFFRCxXQUFXLFVBQVUsU0FBUyxFQUFJLFVBQVUsQUFBRCxDQUFHO0FBQzFDLEtBQUksSUFBRyxVQUFVLENBQUc7QUFDaEIsVUFBTTtFQUNWO0FBQUEsQUFFQSxLQUFJLElBQUcsUUFBUSxDQUFHO0FBQ2QsT0FBRyxRQUFRLEtBQUssQUFBQyxFQUFDLENBQUM7QUFDbkIsT0FBRyxRQUFRLG1CQUFtQixBQUFDLEVBQUMsQ0FBQztBQUNqQyxPQUFHLFFBQVEsRUFBSSxLQUFHLENBQUM7RUFDdkI7QUFBQSxBQUVBLEtBQUcsVUFBVSxFQUFJLEtBQUcsQ0FBQztBQUNyQixLQUFHLG1CQUFtQixBQUFDLEVBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQsS0FBSyxRQUFRLEVBQUksYUFBVyxDQUFDO0FBQzdCIiwiZmlsZSI6Imhvc3Rpbmcvd29ya2Zsb3dIb3N0LmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubGV0IFdvcmtmbG93UmVnaXN0cnkgPSByZXF1aXJlKFwiLi93b3JrZmxvd1JlZ2lzdHJ5XCIpO1xubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xubGV0IEFjdGl2aXR5ID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvYWN0aXZpdHlcIik7XG5sZXQgV29ya2Zsb3cgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy93b3JrZmxvd1wiKTtcbmxldCBXb3JrZmxvd1BlcnNpc3RlbmNlID0gcmVxdWlyZShcIi4vd29ya2Zsb3dQZXJzaXN0ZW5jZVwiKTtcbmxldCBXb3JrZmxvd0luc3RhbmNlID0gcmVxdWlyZShcIi4vd29ya2Zsb3dJbnN0YW5jZVwiKTtcbmxldCBJbnN0YW5jZUlkUGFyc2VyID0gcmVxdWlyZShcIi4vaW5zdGFuY2VJZFBhcnNlclwiKTtcbmxldCBlbnVtcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZW51bXNcIik7XG5sZXQgQmx1ZWJpcmQgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XG5sZXQgS25vd25JbnN0YVN0b3JlID0gcmVxdWlyZShcIi4va25vd25JbnN0YVN0b3JlXCIpO1xubGV0IHNwZWNTdHJpbmdzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9zcGVjU3RyaW5nc1wiKTtcbmxldCBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcbmxldCBTZXJpYWxpemVyID0gcmVxdWlyZShcImJhY2twYWNrLW5vZGVcIikuc3lzdGVtLlNlcmlhbGl6ZXI7XG5sZXQgaXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2lzXCIpO1xubGV0IEtlZXBMb2NrQWxpdmUgPSByZXF1aXJlKFwiLi9rZWVwTG9ja0FsaXZlXCIpO1xubGV0IGFzeW5jSGVscGVycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vYXN5bmNIZWxwZXJzXCIpO1xubGV0IGFzeW5jID0gYXN5bmNIZWxwZXJzLmFzeW5jO1xubGV0IFdha2VVcCA9IHJlcXVpcmUoXCIuL3dha2VVcFwiKTtcbmxldCBhc3NlcnQgPSByZXF1aXJlKFwiYXNzZXJ0XCIpO1xubGV0IGRlYnVnID0gcmVxdWlyZShcImRlYnVnXCIpKFwid2Y0bm9kZTpXb3JrZmxvd0hvc3RcIik7XG5sZXQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xuXG5mdW5jdGlvbiBXb3JrZmxvd0hvc3Qob3B0aW9ucykge1xuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5fcmVnaXN0cnkgPSBuZXcgV29ya2Zsb3dSZWdpc3RyeSgpO1xuICAgIHRoaXMuX3RyYWNrZXJzID0gW107XG4gICAgdGhpcy5faXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuX2luc3RhbmNlSWRQYXJzZXIgPSBuZXcgSW5zdGFuY2VJZFBhcnNlcigpO1xuICAgIHRoaXMuX3BlcnNpc3RlbmNlID0gbnVsbDtcbiAgICB0aGlzLl9vcHRpb25zID0gXy5leHRlbmQoXG4gICAgICAgIHtcbiAgICAgICAgICAgIGVudGVyTG9ja1RpbWVvdXQ6IDEwMDAwLFxuICAgICAgICAgICAgbG9ja1JlbmV3YWxUaW1lb3V0OiA1MDAwLFxuICAgICAgICAgICAgYWx3YXlzTG9hZFN0YXRlOiBmYWxzZSxcbiAgICAgICAgICAgIGxhenlQZXJzaXN0ZW5jZTogdHJ1ZSxcbiAgICAgICAgICAgIHBlcnNpc3RlbmNlOiBudWxsLFxuICAgICAgICAgICAgc2VyaWFsaXplcjogbnVsbCxcbiAgICAgICAgICAgIGVuYWJsZVByb21vdGlvbnM6IGZhbHNlLFxuICAgICAgICAgICAgd2FrZVVwT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGludGVydmFsOiA1MDAwLFxuICAgICAgICAgICAgICAgIGJhdGNoU2l6ZTogMTBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9ucyk7XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5wZXJzaXN0ZW5jZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9wZXJzaXN0ZW5jZSA9IG5ldyBXb3JrZmxvd1BlcnNpc3RlbmNlKHRoaXMuX29wdGlvbnMucGVyc2lzdGVuY2UpO1xuICAgIH1cbiAgICB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMgPSBuZXcgS25vd25JbnN0YVN0b3JlKCk7XG4gICAgdGhpcy5fd2FrZVVwID0gbnVsbDtcbiAgICB0aGlzLl9zaHV0ZG93biA9IGZhbHNlO1xufVxuXG51dGlsLmluaGVyaXRzKFdvcmtmbG93SG9zdCwgRXZlbnRFbWl0dGVyKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoXG4gICAgV29ya2Zsb3dIb3N0LnByb3RvdHlwZSwge1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaXNJbml0aWFsaXplZDoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzSW5pdGlhbGl6ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGluc3RhbmNlSWRQYXJzZXI6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9pbnN0YW5jZUlkUGFyc2VyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBwZXJzaXN0ZW5jZToge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BlcnNpc3RlbmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfaW5Mb2NrVGltZW91dDoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKyBNYXRoLm1heCh0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICogMC40LCAzMDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLnJlZ2lzdGVyV29ya2Zsb3cgPSBmdW5jdGlvbiAod29ya2Zsb3cpIHtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgICB0aGlzLl9yZWdpc3RyeS5yZWdpc3Rlcih3b3JrZmxvdyk7XG4gICAgdGhpcy5lbWl0KFwicmVnaXN0ZXJlZFwiLCB7IG5hbWU6IHdvcmtmbG93Lm5hbWUsIHZlcnNpb246IHdvcmtmbG93LnZlcnNpb24gfSk7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLnJlZ2lzdGVyQWN0aXZpdHkgPSBmdW5jdGlvbiAoYWN0aXZpdHksIG5hbWUsIHZlcnNpb24pIHtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgICBpZiAoIShhY3Rpdml0eSBpbnN0YW5jZW9mIEFjdGl2aXR5KSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQWN0aXZpdHkgYXJndW1lbnQgZXhwZWN0ZWQuXCIpO1xuICAgIH1cbiAgICBsZXQgd2YgPSBuZXcgV29ya2Zsb3coKTtcbiAgICB3Zi5uYW1lID0gbmFtZTtcbiAgICB3Zi52ZXJzaW9uID0gdmVyc2lvbjtcbiAgICB3Zi5hcmdzID0gW2FjdGl2aXR5XTtcbiAgICB0aGlzLl9yZWdpc3RyeS5yZWdpc3Rlcih3Zik7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9pbml0aWFsaXplID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBpZiAoIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMud2FrZVVwT3B0aW9ucyAmJiB0aGlzLl9vcHRpb25zLndha2VVcE9wdGlvbnMuaW50ZXJ2YWwgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl93YWtlVXAgPSBuZXcgV2FrZVVwKHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcywgdGhpcy5fcGVyc2lzdGVuY2UsIHRoaXMuX29wdGlvbnMud2FrZVVwT3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl93YWtlVXAub24oXCJjb250aW51ZVwiLCBmdW5jdGlvbiAoaSkgeyBzZWxmLl9jb250aW51ZVdva2VVcEluc3RhbmNlKGkpOyB9KTtcbiAgICAgICAgICAgIHRoaXMuX3dha2VVcC5vbihcImVycm9yXCIsIGZ1bmN0aW9uIChlKSB7IHNlbGYuZW1pdChcImVycm9yXCIsIGUpOyB9KTtcbiAgICAgICAgICAgIHRoaXMuX3dha2VVcC5zdGFydCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5zdG9wT3V0ZGF0ZWRWZXJzaW9ucyA9IGFzeW5jKGZ1bmN0aW9uKiAod29ya2Zsb3dOYW1lKSB7XG4gICAgdGhpcy5fdmVyaWZ5KCk7XG4gICAgZGVidWcoXCJTdG9wcGluZyBvdXRkYXRlZCB2ZXJzaW9ucyBvZiB3b3JrZmxvdyAnJXMnLlwiLCB3b3JrZmxvd05hbWUpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgcmVtb3ZlID0gZnVuY3Rpb24gKGluc3RhbmNlSWQpIHtcbiAgICAgICAgICAgIGxldCBrbm93bkluc3RhID0gc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldCh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgICAgICAgICAgaWYgKGtub3duSW5zdGEpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIlJlbW92aW5nIGluc3RhbmNlOiAlc1wiLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9kZWxldGVXRkluc3RhbmNlKGtub3duSW5zdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgIGxldCB0b3BWZXJzaW9uID0gdGhpcy5fcmVnaXN0cnkuZ2V0VG9wVmVyc2lvbih3b3JrZmxvd05hbWUpO1xuICAgICAgICBpZiAodG9wVmVyc2lvbikge1xuICAgICAgICAgICAgbGV0IG9sZFZlcnNpb25IZWFkZXJzID0geWllbGQgdGhpcy5fZ2V0UnVubmluZ0luc3RhbmNlSGVhZGVyc0Zvck90aGVyVmVyc2lvbih3b3JrZmxvd05hbWUsIHRvcFZlcnNpb24pO1xuICAgICAgICAgICAgaWYgKG9sZFZlcnNpb25IZWFkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiVGhlcmUgaXMgJWQgb2xkIHZlcnNpb24gcnVubmluZy4gU3RvcHBpbmcgdGhlbS5cIiwgb2xkVmVyc2lvbkhlYWRlcnMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBoZWFkZXIgb2Ygb2xkVmVyc2lvbkhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJSZW1vdmluZyB3b3JrZmxvdyAnJXMnIG9mIHZlcnNpb24gJCVzIHdpdGggaWQ6ICclcycgZnJvbSBob3N0LlwiLCBoZWFkZXIud29ya2Zsb3dOYW1lLCBoZWFkZXIud29ya2Zsb3dWZXJzaW9uLCBoZWFkZXIuaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbnN0YW5jZUlkID0gaGVhZGVyLmluc3RhbmNlSWQ7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9ja05hbWUgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmRvdWJsZUtleXMod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9ja0luZm87XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJMb2NraW5nIGluc3RhbmNlOiAlc1wiLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NrSW5mbyA9IHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5lbnRlckxvY2sobG9ja05hbWUsIHRoaXMub3B0aW9ucy5lbnRlckxvY2tUaW1lb3V0LCB0aGlzLl9pbkxvY2tUaW1lb3V0KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGtlZXBMb2NrQWxpdmUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiTG9ja2VkOiAlalwiLCBsb2NrSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUgPSBuZXcgS2VlcExvY2tBbGl2ZSh0aGlzLl9wZXJzaXN0ZW5jZSwgbG9ja0luZm8sIHRoaXMuX2luTG9ja1RpbWVvdXQsIHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERvIHN0dWZmOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLl9wZXJzaXN0ZW5jZS5yZW1vdmVTdGF0ZSh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQsIGZhbHNlLCBcIlNUT1BQRUQuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmUoaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJSZW1vdmVkOiAlc1wiLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJFcnJvcjogJXNcIiwgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVbmxvY2s6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiVW5sb2NraW5nLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtlZXBMb2NrQWxpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5fcGVyc2lzdGVuY2UuZXhpdExvY2sobG9ja0luZm8uaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZShpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkVycm9yOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihgQ2Fubm90IHN0b3AgaW5zdGFuY2Ugb2Ygd29ya2Zsb3cgJyR7d29ya2Zsb3dOYW1lfScgb2YgdmVyc2lvbiAke2hlYWRlci53b3JrZmxvd1ZlcnNpb259IHdpdGggaWQ6ICcke2luc3RhbmNlSWR9JyBiZWNhdXNlIG9mIGFuIGludGVybmFsIGVycm9yOiAke2Uuc3RhY2t9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIlRoZXJlIGlzIG5vIHdvcmtmbG93IHJlZ2lzdGVyZWQgYnkgbmFtZSAnJXMnLlwiLCB3b3JrZmxvd05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICB9XG4gICAgY2F0Y2goZSkge1xuICAgICAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCBlKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5pbnZva2VNZXRob2QgPSBhc3luYyhmdW5jdGlvbiogKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykge1xuICAgIHRoaXMuX3ZlcmlmeSgpO1xuICAgIGRlYnVnKFwiSW52b2tpbmcgbWV0aG9kOiAnJXMnIG9mIHdvcmtmbG93OiAnJXMnIGJ5IGFyZ3VtZW50cyAnJWonXCIsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncyk7XG5cbiAgICBpZiAoIV8od29ya2Zsb3dOYW1lKS5pc1N0cmluZygpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnd29ya2Zsb3dOYW1lJyBpcyBub3QgYSBzdHJpbmcuXCIpO1xuICAgIH1cbiAgICB3b3JrZmxvd05hbWUgPSB3b3JrZmxvd05hbWUudHJpbSgpO1xuICAgIGlmICghXyhtZXRob2ROYW1lKS5pc1N0cmluZygpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnbWV0aG9kTmFtZScgaXMgbm90IGEgc3RyaW5nLlwiKTtcbiAgICB9XG4gICAgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWUudHJpbSgpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGFyZ3MpICYmICFfLmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgYXJncyA9IFthcmdzXTtcbiAgICB9XG5cbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLl9pbml0aWFsaXplKCk7XG5cbiAgICBsZXQgaW5zdGFuY2VJZCA9IG51bGw7XG4gICAgbGV0IGNyZWF0YWJsZVdvcmtmbG93ID0gbnVsbDtcblxuICAgIGxldCByZXN1bHRzID0gW107XG4gICAgZm9yIChsZXQgaW5mbyBvZiBzZWxmLl9yZWdpc3RyeS5tZXRob2RJbmZvcyh3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUpKSB7XG4gICAgICAgIGxldCB0cnlJZCA9IHNlbGYuX2luc3RhbmNlSWRQYXJzZXIucGFyc2UoaW5mby5pbnN0YW5jZUlkUGF0aCwgYXJncyk7XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZCh0cnlJZCkpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGluZm86IGluZm8sXG4gICAgICAgICAgICAgICAgICAgIGlkOiB0cnlJZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICAgICAgZGVidWcoXCJQb3NzaWJsZSBtZXRob2RzOiAlalwiLFxuICAgICAgICAgICAgXyhyZXN1bHRzKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogci5pbmZvLndvcmtmbG93Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogci5pbmZvLndvcmtmbG93LnZlcnNpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogci5pZFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRvQXJyYXkoKSk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSByZXN1bHRzW2ldO1xuICAgICAgICAvLyBUaGF0IGZpbmRzIHRoZSBsYXRlc3QgdmVyc2lvbjpcbiAgICAgICAgaWYgKHJlc3VsdC5pbmZvLmNhbkNyZWF0ZUluc3RhbmNlICYmICghY3JlYXRhYmxlV29ya2Zsb3cgfHwgY3JlYXRhYmxlV29ya2Zsb3cudmVyc2lvbiA8IHJlc3VsdC5pbmZvLndvcmtmbG93LnZlcnNpb24pKSB7XG4gICAgICAgICAgICBjcmVhdGFibGVXb3JrZmxvdyA9IHJlc3VsdC5pbmZvLndvcmtmbG93O1xuICAgICAgICB9XG4gICAgICAgIC8vIFRoYXQgZmluZHMgYSBydW5uaW5nIGluc3RhbmNlIHdpdGggdGhlIGlkOlxuICAgICAgICBpZiAoXy5pc051bGwoaW5zdGFuY2VJZCkgJiYgKHlpZWxkIHNlbGYuX2NoZWNrSWZJbnN0YW5jZVJ1bm5pbmcod29ya2Zsb3dOYW1lLCByZXN1bHQuaWQpKSkge1xuICAgICAgICAgICAgaW5zdGFuY2VJZCA9IHJlc3VsdC5pZDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGluc3RhbmNlSWQpIHtcbiAgICAgICAgZGVidWcoXCJGb3VuZCBhIGNvbnRpbnVhYmxlIGluc3RhbmNlIGlkOiAlcy4gSW52b2tpbmcgbWV0aG9kIG9uIHRoYXQuXCIsIGluc3RhbmNlSWQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiaW52b2tlXCIsIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUlkOiBpbnN0YW5jZUlkLFxuICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgaXIgPSB5aWVsZCAoc2VsZi5faW52b2tlTWV0aG9kT25SdW5uaW5nSW5zdGFuY2UoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJpbnZva2VDb21wbGV0ZVwiLCB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZDogaW5zdGFuY2VJZCxcbiAgICAgICAgICAgICAgICB3b3JrZmxvd05hbWU6IHdvcmtmbG93TmFtZSxcbiAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBtZXRob2ROYW1lLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVidWcoXCJJbnZva2UgY29tcGxldGVkLCByZXN1bHQ6ICVqXCIsIGlyKTtcbiAgICAgICAgICAgIHJldHVybiBpcjtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZGVidWcoXCJJbnZva2UgZmFpbGVkOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImludm9rZUZhaWxcIiwge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlSWQ6IGluc3RhbmNlSWQsXG4gICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogbWV0aG9kTmFtZSxcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImVycm9yXCIsIGUpO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChjcmVhdGFibGVXb3JrZmxvdykge1xuICAgICAgICBkZWJ1ZyhcIkZvdW5kIGEgY3JlYXRhYmxlIHdvcmtmbG93IChuYW1lOiAnJXMnLCB2ZXJzaW9uOiAnJWQnKSwgaW52b2tpbmcgYSBjcmVhdGUgbWV0aG9kIG9uIHRoYXQuXCIsIGNyZWF0YWJsZVdvcmtmbG93Lm5hbWUsIGNyZWF0YWJsZVdvcmtmbG93LnZlcnNpb24pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiY3JlYXRlXCIsIHtcbiAgICAgICAgICAgICAgICBjcmVhdGFibGVXb3JrZmxvdzogY3JlYXRhYmxlV29ya2Zsb3csXG4gICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogbWV0aG9kTmFtZSxcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBjciA9IHlpZWxkIChzZWxmLl9jcmVhdGVJbnN0YW5jZUFuZEludm9rZU1ldGhvZChjcmVhdGFibGVXb3JrZmxvdywgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJjcmVhdGVDb21wbGV0ZVwiLCB7XG4gICAgICAgICAgICAgICAgY3JlYXRhYmxlV29ya2Zsb3c6IGNyZWF0YWJsZVdvcmtmbG93LFxuICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkZWJ1ZyhcIkNyZWF0ZSBjb21wbGV0ZWQsIHJlc3VsdDogJWpcIiwgY3IpO1xuICAgICAgICAgICAgcmV0dXJuIGNyO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkNyZWF0ZSBmYWlsZWQ6ICVzXCIsIGUuc3RhY2spO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiY3JlYXRlRmFpbFwiLCB7XG4gICAgICAgICAgICAgICAgY3JlYXRhYmxlV29ya2Zsb3c6IGNyZWF0YWJsZVdvcmtmbG93LFxuICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgICAgICAgICAgYXJnczogYXJncyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCBlKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRlYnVnKFwiTm8gY29udGludWFibGUgd29ya2Zsb3dzIGhhdmUgYmVlbiBmb3VuZC5cIik7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IoXCJDYW5ub3QgY3JlYXRlIG9yIGNvbnRpbnVlIHdvcmtmbG93ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBieSBjYWxsaW5nIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICB9XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fY3JlYXRlSW5zdGFuY2VBbmRJbnZva2VNZXRob2QgPSBhc3luYyhmdW5jdGlvbiogKHdvcmtmbG93LCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBsZXQgbG9ja0luZm8gPSBudWxsO1xuXG4gICAgaWYgKCFzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICBsZXQgaW5zdGEgPSBzZWxmLl9jcmVhdGVXRkluc3RhbmNlKCk7XG4gICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY3JlYXRlKHdvcmtmbG93LCBtZXRob2ROYW1lLCBhcmdzLCBsb2NrSW5mbykpO1xuICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuYWRkKHdvcmtmbG93TmFtZSwgaW5zdGEpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbG9ja0luZm8gPSB7XG4gICAgICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgICBoZWxkVG86IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gV2hlbiBsb2NrIHdpbGwgaGVsZCwgdGhlbiB3ZSBzaG91bGQga2VlcCBpdCBhbGl2ZTpcbiAgICAgICAgbGV0IGtlZXBMb2NrQWxpdmUgPSBuZXcgS2VlcExvY2tBbGl2ZShzZWxmLl9wZXJzaXN0ZW5jZSwgbG9ja0luZm8sIHNlbGYuX2luTG9ja1RpbWVvdXQsIHNlbGYub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGluc3RhID0gc2VsZi5fY3JlYXRlV0ZJbnN0YW5jZSgpO1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChpbnN0YS5jcmVhdGUod29ya2Zsb3csIG1ldGhvZE5hbWUsIGFyZ3MsIGxvY2tJbmZvKSk7XG5cbiAgICAgICAgICAgIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuYWRkKHdvcmtmbG93TmFtZSwgaW5zdGEpO1xuXG4gICAgICAgICAgICAgICAgLy8gUGVyc2lzdCBhbmQgdW5sb2NrOlxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLnBlcnNpc3RTdGF0ZShpbnN0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IHBlcnNpc3QgaW5zdGFuY2Ugb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdChcImVycm9yXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IGV4aXQgbG9jayBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2ludm9rZU1ldGhvZE9uUnVubmluZ0luc3RhbmNlID0gYXN5bmMoZnVuY3Rpb24qIChpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgIGxldCBpbnN0YSA9IHlpZWxkIChzZWxmLl92ZXJpZnlBbmRSZXN0b3JlSW5zdGFuY2VTdGF0ZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY2FsbE1ldGhvZChtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9kZWxldGVXRkluc3RhbmNlKGluc3RhKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiSW5zdGFuY2UgJ1wiICsgaW5zdGEuaWQgKyBcIicgaXMgaW4gYW4gaW52YWxpZCBzdGF0ZSAnXCIgKyBpbnN0YS5leGVjU3RhdGUgKyBcIicgYWZ0ZXIgaW52b2NhdGlvbiBvZiB0aGUgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5NZXRob2RJc05vdEFjY2Vzc2libGVFcnJvcikge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiTWV0aG9kIGlzIG5vdCBhY2Nlc3NpYmxlIGF0IHRoZSBjdXJyZW50IHN0YXRlLCBiYWNhdXNlIGl0IG1pZ2h0IGJlIHN0ZXBwZWQgb24gYW5vdGhlciBpbnN0YW5jZSB0byBhbm90aGVyIHN0YXRlIHRoYSBpcyBleGlzdHMgYXQgY3VycmVudCBpbiB0aGlzIGhvc3QuIENsaWVudCBzaG91bGQgcmV0cnkuXCIpO1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLl9kZWxldGVXRkluc3RhbmNlKGluc3RhKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIExvY2sgaXQ6XG4gICAgICAgIGxldCBsb2NrTmFtZSA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuZG91YmxlS2V5cyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgICAgICBsZXQgbG9ja0luZm87XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkxvY2tpbmcgaW5zdGFuY2UuXCIpO1xuICAgICAgICAgICAgbG9ja0luZm8gPSB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UuZW50ZXJMb2NrKGxvY2tOYW1lLCBzZWxmLm9wdGlvbnMuZW50ZXJMb2NrVGltZW91dCwgc2VsZi5faW5Mb2NrVGltZW91dCkpO1xuICAgICAgICAgICAgZGVidWcoXCJMb2NrZWQ6ICVqXCIsIGxvY2tJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuVGltZW91dEVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5NZXRob2RJc05vdEFjY2Vzc2libGVFcnJvcihcIkNhbm5vdCBjYWxsIG1ldGhvZCBvZiB3b3JrZmxvdyAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicsIGJlY2F1c2UgJ1wiICsgbWV0aG9kTmFtZSArIFwiJyBpcyBsb2NrZWQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQga2VlcExvY2tBbGl2ZSA9IG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIGxvY2sgd2lsbCBoZWxkLCB0aGVuIHdlIHNob3VsZCBrZWVwIGl0IGFsaXZlOlxuICAgICAgICAgICAga2VlcExvY2tBbGl2ZSA9IG5ldyBLZWVwTG9ja0FsaXZlKHNlbGYuX3BlcnNpc3RlbmNlLCBsb2NrSW5mbywgc2VsZi5faW5Mb2NrVGltZW91dCwgc2VsZi5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCk7XG5cbiAgICAgICAgICAgIC8vIExPQ0tFRFxuICAgICAgICAgICAgbGV0IGluc3RhID0geWllbGQgKHNlbGYuX3ZlcmlmeUFuZFJlc3RvcmVJbnN0YW5jZVN0YXRlKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgcGVyc2lzdEFuZFVubG9jayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX3BlcnNpc3RlbmNlLnBlcnNpc3RTdGF0ZShpbnN0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IHBlcnNpc3QgaW5zdGFuY2UgZm9yIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdChcImVycm9yXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2RlbGV0ZVdGSW5zdGFuY2UoaW5zdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIlVubG9ja2luZzogJWpcIiwgbG9ja0luZm8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJVbmxvY2tlZC5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBleGl0IGxvY2sgZm9yIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGluc3RhLmNhbGxNZXRob2QobWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmlkbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUGVyc2lzdCBhbmQgdW5sb2NrOlxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmxhenlQZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKHBlcnNpc3RBbmRVbmxvY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgcGVyc2lzdEFuZFVubG9jaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9kZWxldGVXRkluc3RhbmNlKGluc3RhKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgc2VsZi5fcGVyc2lzdGVuY2UucmVtb3ZlU3RhdGUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IHJlbW92ZSBzdGF0ZSBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVtaXQoXCJlcnJvclwiLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IGV4aXQgbG9jayBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVtaXQoXCJlcnJvclwiLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkluc3RhbmNlICdcIiArIGluc3RhLmlkICsgXCInIGlzIGluIGFuIGludmFsaWQgc3RhdGUgJ1wiICsgaW5zdGEuZXhlY1N0YXRlICsgXCInIGFmdGVyIGludm9jYXRpb24gb2YgdGhlIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLk1ldGhvZElzTm90QWNjZXNzaWJsZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiTWV0aG9kIGlzIG5vdCBhY2Nlc3NpYmxlIGF0IHRoZSBjdXJyZW50IHN0YXRlLCBiYWNhdXNlIGl0IG1pZ2h0IGJlIHN0ZXBwZWQgb24gYW5vdGhlciBpbnN0YW5jZSB0byBhbm90aGVyIHN0YXRlIHRoYSBpcyBleGlzdHMgYXQgY3VycmVudCBpbiB0aGlzIGhvc3QuIENsaWVudCBzaG91bGQgcmV0cnkuXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZGVsZXRlV0ZJbnN0YW5jZShpbnN0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UucmVtb3ZlU3RhdGUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCwgZmFsc2UsIGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChyZW1vdmVFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJDYW5ub3QgcmVtb3ZlIHN0YXRlIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIHJlbW92ZUUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdChyZW1vdmVFKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGtlZXBMb2NrQWxpdmUpIHtcbiAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXhpdEUpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBleGl0IGxvY2sgJ1wiICsgbG9ja0luZm8uaWQgKyBcIic6XFxuXCIgKyBleGl0RS5zdGFjayk7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZXhpdEUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UgPSBhc3luYyhmdW5jdGlvbiogKGluc3RhLCBsb2NrSW5mbykge1xuICAgIGxldCBsaSA9IHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5lbnRlckxvY2soc3BlY1N0cmluZ3MuaG9zdGluZy5kb3VibGVLZXlzKGluc3RhLndvcmtmbG93TmFtZSwgaW5zdGEuaWQpLCB0aGlzLm9wdGlvbnMuZW50ZXJMb2NrVGltZW91dCwgdGhpcy5fZ2V0SW5Mb2NrVGltZW91dCgpKSk7XG4gICAgaWYgKHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5pc1J1bm5pbmcoaW5zdGEud29ya2Zsb3dOYW1lLCBpbnN0YS5pZCkpKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkNhbm5vdCBjcmVhdGUgaW5zdGFuY2Ugb2Ygd29ya2Zsb3cgJ1wiICsgaW5zdGEud29ya2Zsb3dOYW1lICsgXCInIGJ5IGlkICdcIiArIGluc3RhLmlkICsgXCInIGJlY2F1c2UgaXQncyBhbHJlYWR5IGV4aXN0cy5cIik7XG4gICAgfVxuICAgIGxvY2tJbmZvLmlkID0gbGkuaWQ7XG4gICAgbG9ja0luZm8ubmFtZSA9IGxpLm5hbWU7XG4gICAgbG9ja0luZm8uaGVsZFRvID0gbGkuaGVsZFRvO1xufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2dldEluTG9ja1RpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKyBNYXRoLm1heCh0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICogMC40LCAzMDAwKTtcbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX3ZlcmlmeUFuZFJlc3RvcmVJbnN0YW5jZVN0YXRlID0gYXN5bmMoZnVuY3Rpb24qIChpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IGluc3RhID0gbnVsbDtcbiAgICBsZXQgZXJyb3JUZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gXCJJbnN0YW5jZSAnXCIgKyBpbnN0YW5jZUlkICsgXCInIGhhcyBiZWVuIGludm9rZWQgZWxzZXdoZXJlIHNpbmNlIHRoZSBsb2NrIHRvb2sgaW4gdGhlIGN1cnJlbnQgaG9zdC5cIjtcbiAgICB9O1xuICAgIGlmIChzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGhlYWRlciA9IHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5nZXRSdW5uaW5nSW5zdGFuY2VJZEhlYWRlcih3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKTtcbiAgICAgICAgICAgIGlmIChoZWFkZXIpIHtcbiAgICAgICAgICAgICAgICBpbnN0YSA9IHlpZWxkIChzZWxmLl9yZXN0b3JlSW5zdGFuY2VTdGF0ZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIGhlYWRlci53b3JrZmxvd1ZlcnNpb24sIGhlYWRlci51cGRhdGVkT24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihlcnJvclRleHQoKSArIFwiIElubmVyIGVycm9yOiBpbnN0YW5jZSBcIiArIGluc3RhbmNlSWQgKyBcIiBpcyB1bmtub3duLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuV29ya2Zsb3dFcnJvciB8fCAhXy5pc1VuZGVmaW5lZChnbG9iYWxbZS5uYW1lXSkgfHwgZS5uYW1lID09PSBcIkFzc2VydGlvbkVycm9yXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKGVycm9yVGV4dCgpICsgXCJcXG5Jbm5lciBlcnJvcjpcXG5cIiArIGUuc3RhY2sudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGluc3RhID0gc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldCh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgICAgICBpZiAoIWluc3RhKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoZXJyb3JUZXh0KCkgKyBcIiBJbm5lciBlcnJvcjogaW5zdGFuY2UgXCIgKyBpbnN0YW5jZUlkICsgXCIgaXMgdW5rbm93bi5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdGE7XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fcmVzdG9yZUluc3RhbmNlU3RhdGUgPSBhc3luYyhmdW5jdGlvbiogKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgd29ya2Zsb3dWZXJzaW9uLCBhY3R1YWxUaW1lc3RhbXApIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIGluc3RhbmNlIGZyb20gcGVyc2lzdGVuY2UsIGJlY2F1c2UgaG9zdCBoYXMgbm8gcGVyc2lzdGVuY2UgcmVnaXN0ZXJlZC5cIik7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhID0gc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldCh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKGluc3RhKSkge1xuICAgICAgICBsZXQgd2ZEZXNjID0gc2VsZi5fcmVnaXN0cnkuZ2V0RGVzYyh3b3JrZmxvd05hbWUsIHdvcmtmbG93VmVyc2lvbik7XG4gICAgICAgIGluc3RhID0gc2VsZi5fY3JlYXRlV0ZJbnN0YW5jZSgpO1xuICAgICAgICBpbnN0YS5zZXRXb3JrZmxvdyh3ZkRlc2Mud29ya2Zsb3csIGluc3RhbmNlSWQpO1xuICAgIH1cblxuICAgIGlmIChpbnN0YS51cGRhdGVkT24gPT09IG51bGwgfHwgaW5zdGEudXBkYXRlZE9uLmdldFRpbWUoKSAhPT0gYWN0dWFsVGltZXN0YW1wLmdldFRpbWUoKSB8fCBzZWxmLm9wdGlvbnMuYWx3YXlzTG9hZFN0YXRlKSB7XG4gICAgICAgIGxldCBzdGF0ZSA9IHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5sb2FkU3RhdGUod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSk7XG4gICAgICAgIGluc3RhLnJlc3RvcmVTdGF0ZShzdGF0ZSk7XG4gICAgICAgIHJldHVybiBpbnN0YTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnN0YTtcbiAgICB9XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fY2hlY2tJZkluc3RhbmNlUnVubmluZyA9IGFzeW5jKGZ1bmN0aW9uKiAod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSB7XG4gICAgaWYgKHRoaXMuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgIHJldHVybiAoeWllbGQgdGhpcy5fcGVyc2lzdGVuY2UuaXNSdW5uaW5nKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmV4aXN0cyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2dldFJ1bm5pbmdJbnN0YW5jZUhlYWRlcnNGb3JPdGhlclZlcnNpb24gPSBhc3luYyhmdW5jdGlvbiogKHdvcmtmbG93TmFtZSwgdmVyc2lvbikge1xuICAgIGlmICh0aGlzLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICByZXR1cm4gKHlpZWxkIHRoaXMuX3BlcnNpc3RlbmNlLmdldFJ1bm5pbmdJbnN0YW5jZUhlYWRlcnNGb3JPdGhlclZlcnNpb24od29ya2Zsb3dOYW1lLCB2ZXJzaW9uKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuZ2V0UnVubmluZ0luc3RhbmNlSGVhZGVyc0Zvck90aGVyVmVyc2lvbih3b3JrZmxvd05hbWUsIHZlcnNpb24pO1xufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuYWRkVHJhY2tlciA9IGZ1bmN0aW9uICh0cmFja2VyKSB7XG4gICAgdGhpcy5fdmVyaWZ5KCk7XG5cbiAgICBpZiAoIV8uaXNPYmplY3QodHJhY2tlcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFyZ3VtZW50IGlzIG5vdCBhbiBvYmplY3QuXCIpO1xuICAgIH1cbiAgICB0aGlzLl90cmFja2Vycy5wdXNoKHRyYWNrZXIpO1xuICAgIHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcy5hZGRUcmFja2VyKHRyYWNrZXIpO1xufTtcblxuLyogV2FrZSBVcCovXG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2NvbnRpbnVlV29rZVVwSW5zdGFuY2UgPSBhc3luYyhmdW5jdGlvbiood2FrZXVwYWJsZSkge1xuICAgIGFzc2VydChfLmlzUGxhaW5PYmplY3Qod2FrZXVwYWJsZSkpO1xuICAgIGFzc2VydChfLmlzU3RyaW5nKHdha2V1cGFibGUuaW5zdGFuY2VJZCkpO1xuICAgIGFzc2VydChfLmlzU3RyaW5nKHdha2V1cGFibGUud29ya2Zsb3dOYW1lKSk7XG4gICAgYXNzZXJ0KF8uaXNQbGFpbk9iamVjdCh3YWtldXBhYmxlLmFjdGl2ZURlbGF5KSk7XG4gICAgYXNzZXJ0KF8uaXNTdHJpbmcod2FrZXVwYWJsZS5hY3RpdmVEZWxheS5tZXRob2ROYW1lKSk7XG4gICAgYXNzZXJ0KF8uaXNEYXRlKHdha2V1cGFibGUuYWN0aXZlRGVsYXkuZGVsYXlUbykpO1xuICAgIGFzc2VydChfLmlzRnVuY3Rpb24od2FrZXVwYWJsZS5yZXN1bHQucmVzb2x2ZSkpO1xuICAgIGFzc2VydChfLmlzRnVuY3Rpb24od2FrZXVwYWJsZS5yZXN1bHQucmVqZWN0KSk7XG5cbiAgICB0cnkge1xuICAgICAgICAvL2luc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJnc1xuICAgICAgICBkZWJ1ZyhcIkludm9raW5nIERlbGF5VG8gaW5zdGFuY2VJZDogJXMsIHdvcmtmbG93TmFtZTolcywgbWV0aG9kTmFtZTogJXNcIiwgd2FrZXVwYWJsZS5pbnN0YW5jZUlkLCB3YWtldXBhYmxlLndvcmtmbG93TmFtZSwgd2FrZXVwYWJsZS5hY3RpdmVEZWxheS5tZXRob2ROYW1lKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiZGVsYXlUb1wiLCB7XG4gICAgICAgICAgICBpbnN0YW5jZUlkOiB3YWtldXBhYmxlLmluc3RhbmNlSWQsXG4gICAgICAgICAgICB3b3JrZmxvd05hbWU6IHdha2V1cGFibGUud29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgYWN0aXZlRGVsYXk6IHdha2V1cGFibGUuYWN0aXZlRGVsYXlcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCB0aGlzLl9pbnZva2VNZXRob2RPblJ1bm5pbmdJbnN0YW5jZSh3YWtldXBhYmxlLmluc3RhbmNlSWQsIHdha2V1cGFibGUud29ya2Zsb3dOYW1lLCB3YWtldXBhYmxlLmFjdGl2ZURlbGF5Lm1ldGhvZE5hbWUsIFt3YWtldXBhYmxlLmluc3RhbmNlSWQsIHdha2V1cGFibGUuYWN0aXZlRGVsYXkuZGVsYXlUb10pO1xuICAgICAgICBkZWJ1ZyhcIkRlbGF5VG8gaW5zdGFuY2VJZDogJXMsIHdvcmtmbG93TmFtZTolcywgbWV0aG9kTmFtZTogJXMgaW52b2tlZC5cIiwgd2FrZXVwYWJsZS5pbnN0YW5jZUlkLCB3YWtldXBhYmxlLndvcmtmbG93TmFtZSwgd2FrZXVwYWJsZS5hY3RpdmVEZWxheS5tZXRob2ROYW1lKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiZGVsYXlUb0NvbXBsZXRlXCIsIHtcbiAgICAgICAgICAgIGluc3RhbmNlSWQ6IHdha2V1cGFibGUuaW5zdGFuY2VJZCxcbiAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsXG4gICAgICAgICAgICBhY3RpdmVEZWxheTogd2FrZXVwYWJsZS5hY3RpdmVEZWxheSxcbiAgICAgICAgICAgIHJlc3VsdDogcmVzdWx0XG4gICAgICAgIH0pO1xuICAgICAgICB3YWtldXBhYmxlLnJlc3VsdC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLk1ldGhvZElzTm90QWNjZXNzaWJsZUVycm9yIHx8IGUgaW5zdGFuY2VvZiBlcnJvcnMuV29ya2Zsb3dOb3RGb3VuZEVycm9yKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkRlbGF5VG8ncyBtZXRob2QgaXMgbm90IGFjY2Vzc2libGUgc2luY2UgaXQgZ290IHNlbGVjdGVkIGZvciBjb250aW51YXRpb24uXCIpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiZGVsYXlUb0NvbXBsZXRlXCIsIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUlkOiB3YWtldXBhYmxlLmluc3RhbmNlSWQsXG4gICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3YWtldXBhYmxlLndvcmtmbG93TmFtZSxcbiAgICAgICAgICAgICAgICBhY3RpdmVEZWxheTogd2FrZXVwYWJsZS5hY3RpdmVEZWxheSxcbiAgICAgICAgICAgICAgICByZXN1bHQ6IGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd2FrZXVwYWJsZS5yZXN1bHQucmVzb2x2ZShlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkZWJ1ZyhcIkRlbGF5VG8gaW5zdGFuY2VJZDogJXMsIHdvcmtmbG93TmFtZTolcywgbWV0aG9kTmFtZTogJXMgZXJyb3I6ICVzXCIsIHdha2V1cGFibGUuaW5zdGFuY2VJZCwgd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsIHdha2V1cGFibGUuYWN0aXZlRGVsYXkubWV0aG9kTmFtZSwgZS5zdGFjayk7XG4gICAgICAgIHRoaXMuZW1pdChcImRlbGF5VG9GYWlsXCIsIHtcbiAgICAgICAgICAgIGluc3RhbmNlSWQ6IHdha2V1cGFibGUuaW5zdGFuY2VJZCxcbiAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsXG4gICAgICAgICAgICBhY3RpdmVEZWxheTogd2FrZXVwYWJsZS5hY3RpdmVEZWxheSxcbiAgICAgICAgICAgIGVycm9yOiBlXG4gICAgICAgIH0pO1xuICAgICAgICB3YWtldXBhYmxlLnJlc3VsdC5yZWplY3QoZSk7XG4gICAgICAgIHRoaXMuZW1pdChcImVycm9yXCIsIGUpO1xuICAgIH1cbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jcmVhdGVXRkluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBsZXQgaW5zdGEgPSBuZXcgV29ya2Zsb3dJbnN0YW5jZSh0aGlzKTtcbiAgICBpbnN0YS5vbihcbiAgICAgICAgZW51bXMuZXZlbnRzLndvcmtmbG93RXZlbnQsXG4gICAgICAgIGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICBzZWxmLmVtaXQoZW51bXMuZXZlbnRzLndvcmtmbG93RXZlbnQsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gaW5zdGE7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9kZWxldGVXRkluc3RhbmNlID0gZnVuY3Rpb24oaW5zdGEpIHtcbiAgICBpbnN0YS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKGluc3RhLndvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xufTtcblxuLyogU2h1dGRvd24gKi9cblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fdmVyaWZ5ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9zaHV0ZG93bikge1xuICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBob3N0IGhhcyBiZWVuIHNodXQgZG93bi5cIik7XG4gICAgfVxufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fc2h1dGRvd24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl93YWtlVXApIHtcbiAgICAgICAgdGhpcy5fd2FrZVVwLnN0b3AoKTtcbiAgICAgICAgdGhpcy5fd2FrZVVwLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLl93YWtlVXAgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX3NodXRkb3duID0gdHJ1ZTtcbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXb3JrZmxvd0hvc3Q7XG4iXX0=
