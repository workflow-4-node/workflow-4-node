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
          throw new errors.WorkflowError(("Cannot stop instance of workflow '" + workflowName + "' of version " + header.workflowVersion + " with id: '" + instanceId + "' because of an internal error: " + e.message));
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
//# sourceMappingURL=data:application/json;base64,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QUNuQixPQUFHLFFBQVEsbUJBQW1CLEFBQUMsRUFBQyxDQUFDO0FBQ2pDLE9BQUcsUUFBUSxFQUFJLEtBQUcsQ0FBQztFQUN2QjtBQUFBLEFBRUEsS0FBRyxVQUFVLEVBQUksS0FBRyxDQUFDO0FBQ3JCLEtBQUcsbUJBQW1CLEFBQUMsRUFBQyxDQUFDO0FBQzdCLENBQUM7QUFFRCxLQUFLLFFBQVEsRUFBSSxhQUFXLENBQUM7QUFDN0IiLCJmaWxlIjoiaG9zdGluZy93b3JrZmxvd0hvc3QuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5sZXQgV29ya2Zsb3dSZWdpc3RyeSA9IHJlcXVpcmUoXCIuL3dvcmtmbG93UmVnaXN0cnlcIik7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgQWN0aXZpdHkgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy9hY3Rpdml0eVwiKTtcbmxldCBXb3JrZmxvdyA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL3dvcmtmbG93XCIpO1xubGV0IFdvcmtmbG93UGVyc2lzdGVuY2UgPSByZXF1aXJlKFwiLi93b3JrZmxvd1BlcnNpc3RlbmNlXCIpO1xubGV0IFdvcmtmbG93SW5zdGFuY2UgPSByZXF1aXJlKFwiLi93b3JrZmxvd0luc3RhbmNlXCIpO1xubGV0IEluc3RhbmNlSWRQYXJzZXIgPSByZXF1aXJlKFwiLi9pbnN0YW5jZUlkUGFyc2VyXCIpO1xubGV0IGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcbmxldCBCbHVlYmlyZCA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcbmxldCBLbm93bkluc3RhU3RvcmUgPSByZXF1aXJlKFwiLi9rbm93bkluc3RhU3RvcmVcIik7XG5sZXQgc3BlY1N0cmluZ3MgPSByZXF1aXJlKFwiLi4vY29tbW9uL3NwZWNTdHJpbmdzXCIpO1xubGV0IGVycm9ycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZXJyb3JzXCIpO1xubGV0IFNlcmlhbGl6ZXIgPSByZXF1aXJlKFwiYmFja3BhY2stbm9kZVwiKS5zeXN0ZW0uU2VyaWFsaXplcjtcbmxldCBpcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vaXNcIik7XG5sZXQgS2VlcExvY2tBbGl2ZSA9IHJlcXVpcmUoXCIuL2tlZXBMb2NrQWxpdmVcIik7XG5sZXQgYXN5bmNIZWxwZXJzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9hc3luY0hlbHBlcnNcIik7XG5sZXQgYXN5bmMgPSBhc3luY0hlbHBlcnMuYXN5bmM7XG5sZXQgV2FrZVVwID0gcmVxdWlyZShcIi4vd2FrZVVwXCIpO1xubGV0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG5sZXQgZGVidWcgPSByZXF1aXJlKFwiZGVidWdcIikoXCJ3ZjRub2RlOldvcmtmbG93SG9zdFwiKTtcbmxldCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlcjtcbmxldCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5cbmZ1bmN0aW9uIFdvcmtmbG93SG9zdChvcHRpb25zKSB7XG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLl9yZWdpc3RyeSA9IG5ldyBXb3JrZmxvd1JlZ2lzdHJ5KCk7XG4gICAgdGhpcy5fdHJhY2tlcnMgPSBbXTtcbiAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5faW5zdGFuY2VJZFBhcnNlciA9IG5ldyBJbnN0YW5jZUlkUGFyc2VyKCk7XG4gICAgdGhpcy5fcGVyc2lzdGVuY2UgPSBudWxsO1xuICAgIHRoaXMuX29wdGlvbnMgPSBfLmV4dGVuZChcbiAgICAgICAge1xuICAgICAgICAgICAgZW50ZXJMb2NrVGltZW91dDogMTAwMDAsXG4gICAgICAgICAgICBsb2NrUmVuZXdhbFRpbWVvdXQ6IDUwMDAsXG4gICAgICAgICAgICBhbHdheXNMb2FkU3RhdGU6IGZhbHNlLFxuICAgICAgICAgICAgbGF6eVBlcnNpc3RlbmNlOiB0cnVlLFxuICAgICAgICAgICAgcGVyc2lzdGVuY2U6IG51bGwsXG4gICAgICAgICAgICBzZXJpYWxpemVyOiBudWxsLFxuICAgICAgICAgICAgZW5hYmxlUHJvbW90aW9uczogZmFsc2UsXG4gICAgICAgICAgICB3YWtlVXBPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgaW50ZXJ2YWw6IDUwMDAsXG4gICAgICAgICAgICAgICAgYmF0Y2hTaXplOiAxMFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBvcHRpb25zKTtcblxuICAgIGlmICh0aGlzLl9vcHRpb25zLnBlcnNpc3RlbmNlICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3BlcnNpc3RlbmNlID0gbmV3IFdvcmtmbG93UGVyc2lzdGVuY2UodGhpcy5fb3B0aW9ucy5wZXJzaXN0ZW5jZSk7XG4gICAgfVxuICAgIHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcyA9IG5ldyBLbm93bkluc3RhU3RvcmUoKTtcbiAgICB0aGlzLl93YWtlVXAgPSBudWxsO1xuICAgIHRoaXMuX3NodXRkb3duID0gZmFsc2U7XG59XG5cbnV0aWwuaW5oZXJpdHMoV29ya2Zsb3dIb3N0LCBFdmVudEVtaXR0ZXIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhcbiAgICBXb3JrZmxvd0hvc3QucHJvdG90eXBlLCB7XG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpc0luaXRpYWxpemVkOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faXNJbml0aWFsaXplZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaW5zdGFuY2VJZFBhcnNlcjoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlSWRQYXJzZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHBlcnNpc3RlbmNlOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcGVyc2lzdGVuY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9pbkxvY2tUaW1lb3V0OiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCArIE1hdGgubWF4KHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKiAwLjQsIDMwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUucmVnaXN0ZXJXb3JrZmxvdyA9IGZ1bmN0aW9uICh3b3JrZmxvdykge1xuICAgIHRoaXMuX3ZlcmlmeSgpO1xuICAgIHRoaXMuX3JlZ2lzdHJ5LnJlZ2lzdGVyKHdvcmtmbG93KTtcbiAgICB0aGlzLmVtaXQoXCJyZWdpc3RlcmVkXCIsIHsgbmFtZTogd29ya2Zsb3cubmFtZSwgdmVyc2lvbjogd29ya2Zsb3cudmVyc2lvbiB9KTtcbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUucmVnaXN0ZXJBY3Rpdml0eSA9IGZ1bmN0aW9uIChhY3Rpdml0eSwgbmFtZSwgdmVyc2lvbikge1xuICAgIHRoaXMuX3ZlcmlmeSgpO1xuICAgIGlmICghKGFjdGl2aXR5IGluc3RhbmNlb2YgQWN0aXZpdHkpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBY3Rpdml0eSBhcmd1bWVudCBleHBlY3RlZC5cIik7XG4gICAgfVxuICAgIGxldCB3ZiA9IG5ldyBXb3JrZmxvdygpO1xuICAgIHdmLm5hbWUgPSBuYW1lO1xuICAgIHdmLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgIHdmLmFyZ3MgPSBbYWN0aXZpdHldO1xuICAgIHRoaXMuX3JlZ2lzdHJ5LnJlZ2lzdGVyKHdmKTtcbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2luaXRpYWxpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmICghdGhpcy5faXNJbml0aWFsaXplZCkge1xuICAgICAgICBpZiAodGhpcy5fb3B0aW9ucy53YWtlVXBPcHRpb25zICYmIHRoaXMuX29wdGlvbnMud2FrZVVwT3B0aW9ucy5pbnRlcnZhbCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3dha2VVcCA9IG5ldyBXYWtlVXAodGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzLCB0aGlzLl9wZXJzaXN0ZW5jZSwgdGhpcy5fb3B0aW9ucy53YWtlVXBPcHRpb25zKTtcbiAgICAgICAgICAgIHRoaXMuX3dha2VVcC5vbihcImNvbnRpbnVlXCIsIGZ1bmN0aW9uIChpKSB7IHNlbGYuX2NvbnRpbnVlV29rZVVwSW5zdGFuY2UoaSk7IH0pO1xuICAgICAgICAgICAgdGhpcy5fd2FrZVVwLm9uKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGUpIHsgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZSk7IH0pO1xuICAgICAgICAgICAgdGhpcy5fd2FrZVVwLnN0YXJ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLnN0b3BPdXRkYXRlZFZlcnNpb25zID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUpIHtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgICBkZWJ1ZyhcIlN0b3BwaW5nIG91dGRhdGVkIHZlcnNpb25zIG9mIHdvcmtmbG93ICclcycuXCIsIHdvcmtmbG93TmFtZSk7XG5cbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IHJlbW92ZSA9IGZ1bmN0aW9uKGluc3RhbmNlSWQpIHtcbiAgICAgICAgbGV0IGtub3duSW5zdGEgPSBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuZ2V0KHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XG4gICAgICAgIGlmIChrbm93bkluc3RhKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIlJlbW92aW5nIGluc3RhbmNlOiAlc1wiLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgIHNlbGYuX2RlbGV0ZVdGSW5zdGFuY2Uoa25vd25JbnN0YSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBsZXQgdG9wVmVyc2lvbiA9IHRoaXMuX3JlZ2lzdHJ5LmdldFRvcFZlcnNpb24od29ya2Zsb3dOYW1lKTtcbiAgICBpZiAodG9wVmVyc2lvbikge1xuICAgICAgICBsZXQgb2xkVmVyc2lvbkhlYWRlcnMgPSB5aWVsZCB0aGlzLl9nZXRSdW5uaW5nSW5zdGFuY2VIZWFkZXJzRm9yT3RoZXJWZXJzaW9uKHdvcmtmbG93TmFtZSwgdG9wVmVyc2lvbik7XG4gICAgICAgIGlmIChvbGRWZXJzaW9uSGVhZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiVGhlcmUgaXMgJWQgb2xkIHZlcnNpb24gcnVubmluZy4gU3RvcHBpbmcgdGhlbS5cIiwgb2xkVmVyc2lvbkhlYWRlcnMubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGhlYWRlciBvZiBvbGRWZXJzaW9uSGVhZGVycykge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiUmVtb3Zpbmcgd29ya2Zsb3cgJyVzJyBvZiB2ZXJzaW9uICQlcyB3aXRoIGlkOiAnJXMnIGZyb20gaG9zdC5cIiwgaGVhZGVyLndvcmtmbG93TmFtZSwgaGVhZGVyLndvcmtmbG93VmVyc2lvbiwgaGVhZGVyLmluc3RhbmNlSWQpO1xuICAgICAgICAgICAgICAgIGxldCBpbnN0YW5jZUlkID0gaGVhZGVyLmluc3RhbmNlSWQ7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9ja05hbWUgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmRvdWJsZUtleXMod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb2NrSW5mbztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiTG9ja2luZyBpbnN0YW5jZTogJXNcIiwgaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NrSW5mbyA9IHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5lbnRlckxvY2sobG9ja05hbWUsIHRoaXMub3B0aW9ucy5lbnRlckxvY2tUaW1lb3V0LCB0aGlzLl9pbkxvY2tUaW1lb3V0KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQga2VlcExvY2tBbGl2ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiTG9ja2VkOiAlalwiLCBsb2NrSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZSA9IG5ldyBLZWVwTG9ja0FsaXZlKHRoaXMuX3BlcnNpc3RlbmNlLCBsb2NrSW5mbywgdGhpcy5faW5Mb2NrVGltZW91dCwgdGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEbyBzdHVmZjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLl9wZXJzaXN0ZW5jZS5yZW1vdmVTdGF0ZSh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQsIGZhbHNlLCBcIlNUT1BQRUQuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZShpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJSZW1vdmVkOiAlc1wiLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJFcnJvcjogJXNcIiwgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVubG9jazpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIlVubG9ja2luZy5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtlZXBMb2NrQWxpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5fcGVyc2lzdGVuY2UuZXhpdExvY2sobG9ja0luZm8uaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlKGluc3RhbmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkVycm9yOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKGBDYW5ub3Qgc3RvcCBpbnN0YW5jZSBvZiB3b3JrZmxvdyAnJHt3b3JrZmxvd05hbWV9JyBvZiB2ZXJzaW9uICR7aGVhZGVyLndvcmtmbG93VmVyc2lvbn0gd2l0aCBpZDogJyR7aW5zdGFuY2VJZH0nIGJlY2F1c2Ugb2YgYW4gaW50ZXJuYWwgZXJyb3I6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGVidWcoXCJUaGVyZSBpcyBubyB3b3JrZmxvdyByZWdpc3RlcmVkIGJ5IG5hbWUgJyVzJy5cIiwgd29ya2Zsb3dOYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvdW50O1xufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuaW52b2tlTWV0aG9kID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgICBkZWJ1ZyhcIkludm9raW5nIG1ldGhvZDogJyVzJyBvZiB3b3JrZmxvdzogJyVzJyBieSBhcmd1bWVudHMgJyVqJ1wiLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpO1xuXG4gICAgaWYgKCFfKHdvcmtmbG93TmFtZSkuaXNTdHJpbmcoKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ3dvcmtmbG93TmFtZScgaXMgbm90IGEgc3RyaW5nLlwiKTtcbiAgICB9XG4gICAgd29ya2Zsb3dOYW1lID0gd29ya2Zsb3dOYW1lLnRyaW0oKTtcbiAgICBpZiAoIV8obWV0aG9kTmFtZSkuaXNTdHJpbmcoKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ21ldGhvZE5hbWUnIGlzIG5vdCBhIHN0cmluZy5cIik7XG4gICAgfVxuICAgIG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lLnRyaW0oKTtcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChhcmdzKSAmJiAhXy5pc0FycmF5KGFyZ3MpKSB7XG4gICAgICAgIGFyZ3MgPSBbYXJnc107XG4gICAgfVxuXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5faW5pdGlhbGl6ZSgpO1xuXG4gICAgbGV0IGluc3RhbmNlSWQgPSBudWxsO1xuICAgIGxldCBjcmVhdGFibGVXb3JrZmxvdyA9IG51bGw7XG5cbiAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAobGV0IGluZm8gb2Ygc2VsZi5fcmVnaXN0cnkubWV0aG9kSW5mb3Mod29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lKSkge1xuICAgICAgICBsZXQgdHJ5SWQgPSBzZWxmLl9pbnN0YW5jZUlkUGFyc2VyLnBhcnNlKGluZm8uaW5zdGFuY2VJZFBhdGgsIGFyZ3MpO1xuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQodHJ5SWQpKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpbmZvOiBpbmZvLFxuICAgICAgICAgICAgICAgICAgICBpZDogdHJ5SWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICAgIGRlYnVnKFwiUG9zc2libGUgbWV0aG9kczogJWpcIixcbiAgICAgICAgICAgIF8ocmVzdWx0cylcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvdzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHIuaW5mby53b3JrZmxvdy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IHIuaW5mby53b3JrZmxvdy52ZXJzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHIuaWRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50b0FycmF5KCkpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcmVzdWx0c1tpXTtcbiAgICAgICAgLy8gVGhhdCBmaW5kcyB0aGUgbGF0ZXN0IHZlcnNpb246XG4gICAgICAgIGlmIChyZXN1bHQuaW5mby5jYW5DcmVhdGVJbnN0YW5jZSAmJiAoIWNyZWF0YWJsZVdvcmtmbG93IHx8IGNyZWF0YWJsZVdvcmtmbG93LnZlcnNpb24gPCByZXN1bHQuaW5mby53b3JrZmxvdy52ZXJzaW9uKSkge1xuICAgICAgICAgICAgY3JlYXRhYmxlV29ya2Zsb3cgPSByZXN1bHQuaW5mby53b3JrZmxvdztcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGF0IGZpbmRzIGEgcnVubmluZyBpbnN0YW5jZSB3aXRoIHRoZSBpZDpcbiAgICAgICAgaWYgKF8uaXNOdWxsKGluc3RhbmNlSWQpICYmICh5aWVsZCBzZWxmLl9jaGVja0lmSW5zdGFuY2VSdW5uaW5nKHdvcmtmbG93TmFtZSwgcmVzdWx0LmlkKSkpIHtcbiAgICAgICAgICAgIGluc3RhbmNlSWQgPSByZXN1bHQuaWQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpbnN0YW5jZUlkKSB7XG4gICAgICAgIGRlYnVnKFwiRm91bmQgYSBjb250aW51YWJsZSBpbnN0YW5jZSBpZDogJXMuIEludm9raW5nIG1ldGhvZCBvbiB0aGF0LlwiLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImludm9rZVwiLCB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZDogaW5zdGFuY2VJZCxcbiAgICAgICAgICAgICAgICB3b3JrZmxvd05hbWU6IHdvcmtmbG93TmFtZSxcbiAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBtZXRob2ROYW1lLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IGlyID0geWllbGQgKHNlbGYuX2ludm9rZU1ldGhvZE9uUnVubmluZ0luc3RhbmNlKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiaW52b2tlQ29tcGxldGVcIiwge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlSWQ6IGluc3RhbmNlSWQsXG4gICAgICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogbWV0aG9kTmFtZSxcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRlYnVnKFwiSW52b2tlIGNvbXBsZXRlZCwgcmVzdWx0OiAlalwiLCBpcik7XG4gICAgICAgICAgICByZXR1cm4gaXI7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiSW52b2tlIGZhaWxlZDogJXNcIiwgZS5zdGFjayk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJpbnZva2VGYWlsXCIsIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUlkOiBpbnN0YW5jZUlkLFxuICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgICAgICAgICAgYXJnczogYXJncyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCBlKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoY3JlYXRhYmxlV29ya2Zsb3cpIHtcbiAgICAgICAgZGVidWcoXCJGb3VuZCBhIGNyZWF0YWJsZSB3b3JrZmxvdyAobmFtZTogJyVzJywgdmVyc2lvbjogJyVkJyksIGludm9raW5nIGEgY3JlYXRlIG1ldGhvZCBvbiB0aGF0LlwiLCBjcmVhdGFibGVXb3JrZmxvdy5uYW1lLCBjcmVhdGFibGVXb3JrZmxvdy52ZXJzaW9uKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImNyZWF0ZVwiLCB7XG4gICAgICAgICAgICAgICAgY3JlYXRhYmxlV29ya2Zsb3c6IGNyZWF0YWJsZVdvcmtmbG93LFxuICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgY3IgPSB5aWVsZCAoc2VsZi5fY3JlYXRlSW5zdGFuY2VBbmRJbnZva2VNZXRob2QoY3JlYXRhYmxlV29ya2Zsb3csIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiY3JlYXRlQ29tcGxldGVcIiwge1xuICAgICAgICAgICAgICAgIGNyZWF0YWJsZVdvcmtmbG93OiBjcmVhdGFibGVXb3JrZmxvdyxcbiAgICAgICAgICAgICAgICB3b3JrZmxvd05hbWU6IHdvcmtmbG93TmFtZSxcbiAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBtZXRob2ROYW1lLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVidWcoXCJDcmVhdGUgY29tcGxldGVkLCByZXN1bHQ6ICVqXCIsIGNyKTtcbiAgICAgICAgICAgIHJldHVybiBjcjtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZGVidWcoXCJDcmVhdGUgZmFpbGVkOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImNyZWF0ZUZhaWxcIiwge1xuICAgICAgICAgICAgICAgIGNyZWF0YWJsZVdvcmtmbG93OiBjcmVhdGFibGVXb3JrZmxvdyxcbiAgICAgICAgICAgICAgICB3b3JrZmxvd05hbWU6IHdvcmtmbG93TmFtZSxcbiAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBtZXRob2ROYW1lLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkZWJ1ZyhcIk5vIGNvbnRpbnVhYmxlIHdvcmtmbG93cyBoYXZlIGJlZW4gZm91bmQuXCIpO1xuICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLk1ldGhvZElzTm90QWNjZXNzaWJsZUVycm9yKFwiQ2Fubm90IGNyZWF0ZSBvciBjb250aW51ZSB3b3JrZmxvdyAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgYnkgY2FsbGluZyBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XG4gICAgfVxufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2NyZWF0ZUluc3RhbmNlQW5kSW52b2tlTWV0aG9kID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvdywgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgbGV0IGxvY2tJbmZvID0gbnVsbDtcblxuICAgIGlmICghc2VsZi5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgbGV0IGluc3RhID0gc2VsZi5fY3JlYXRlV0ZJbnN0YW5jZSgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGluc3RhLmNyZWF0ZSh3b3JrZmxvdywgbWV0aG9kTmFtZSwgYXJncywgbG9ja0luZm8pKTtcbiAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmFkZCh3b3JrZmxvd05hbWUsIGluc3RhKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxvY2tJbmZvID0ge1xuICAgICAgICAgICAgaWQ6IG51bGwsXG4gICAgICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICAgICAgaGVsZFRvOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIC8vIFdoZW4gbG9jayB3aWxsIGhlbGQsIHRoZW4gd2Ugc2hvdWxkIGtlZXAgaXQgYWxpdmU6XG4gICAgICAgIGxldCBrZWVwTG9ja0FsaXZlID0gbmV3IEtlZXBMb2NrQWxpdmUoc2VsZi5fcGVyc2lzdGVuY2UsIGxvY2tJbmZvLCBzZWxmLl9pbkxvY2tUaW1lb3V0LCBzZWxmLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBpbnN0YSA9IHNlbGYuX2NyZWF0ZVdGSW5zdGFuY2UoKTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY3JlYXRlKHdvcmtmbG93LCBtZXRob2ROYW1lLCBhcmdzLCBsb2NrSW5mbykpO1xuXG4gICAgICAgICAgICBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmFkZCh3b3JrZmxvd05hbWUsIGluc3RhKTtcblxuICAgICAgICAgICAgICAgIC8vIFBlcnNpc3QgYW5kIHVubG9jazpcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5wZXJzaXN0U3RhdGUoaW5zdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBwZXJzaXN0IGluc3RhbmNlIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmVtaXQoXCJlcnJvclwiLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgc2VsZi5fcGVyc2lzdGVuY2UuZXhpdExvY2sobG9ja0luZm8uaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBleGl0IGxvY2sgb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdChcImVycm9yXCIsIGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9pbnZva2VNZXRob2RPblJ1bm5pbmdJbnN0YW5jZSA9IGFzeW5jKGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICBsZXQgaW5zdGEgPSB5aWVsZCAoc2VsZi5fdmVyaWZ5QW5kUmVzdG9yZUluc3RhbmNlU3RhdGUoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGluc3RhLmNhbGxNZXRob2QobWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLkFjdGl2aXR5U3RhdGVzLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZGVsZXRlV0ZJbnN0YW5jZShpbnN0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkluc3RhbmNlICdcIiArIGluc3RhLmlkICsgXCInIGlzIGluIGFuIGludmFsaWQgc3RhdGUgJ1wiICsgaW5zdGEuZXhlY1N0YXRlICsgXCInIGFmdGVyIGludm9jYXRpb24gb2YgdGhlIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIk1ldGhvZCBpcyBub3QgYWNjZXNzaWJsZSBhdCB0aGUgY3VycmVudCBzdGF0ZSwgYmFjYXVzZSBpdCBtaWdodCBiZSBzdGVwcGVkIG9uIGFub3RoZXIgaW5zdGFuY2UgdG8gYW5vdGhlciBzdGF0ZSB0aGEgaXMgZXhpc3RzIGF0IGN1cnJlbnQgaW4gdGhpcyBob3N0LiBDbGllbnQgc2hvdWxkIHJldHJ5LlwiKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5fZGVsZXRlV0ZJbnN0YW5jZShpbnN0YSk7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBMb2NrIGl0OlxuICAgICAgICBsZXQgbG9ja05hbWUgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmRvdWJsZUtleXMod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgbGV0IGxvY2tJbmZvO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGVidWcoXCJMb2NraW5nIGluc3RhbmNlLlwiKTtcbiAgICAgICAgICAgIGxvY2tJbmZvID0geWllbGQgKHNlbGYuX3BlcnNpc3RlbmNlLmVudGVyTG9jayhsb2NrTmFtZSwgc2VsZi5vcHRpb25zLmVudGVyTG9ja1RpbWVvdXQsIHNlbGYuX2luTG9ja1RpbWVvdXQpKTtcbiAgICAgICAgICAgIGRlYnVnKFwiTG9ja2VkOiAlalwiLCBsb2NrSW5mbyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLlRpbWVvdXRFcnJvcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IoXCJDYW5ub3QgY2FsbCBtZXRob2Qgb2Ygd29ya2Zsb3cgJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInLCBiZWNhdXNlICdcIiArIG1ldGhvZE5hbWUgKyBcIicgaXMgbG9ja2VkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGtlZXBMb2NrQWxpdmUgPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiBsb2NrIHdpbGwgaGVsZCwgdGhlbiB3ZSBzaG91bGQga2VlcCBpdCBhbGl2ZTpcbiAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUgPSBuZXcgS2VlcExvY2tBbGl2ZShzZWxmLl9wZXJzaXN0ZW5jZSwgbG9ja0luZm8sIHNlbGYuX2luTG9ja1RpbWVvdXQsIHNlbGYub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQpO1xuXG4gICAgICAgICAgICAvLyBMT0NLRURcbiAgICAgICAgICAgIGxldCBpbnN0YSA9IHlpZWxkIChzZWxmLl92ZXJpZnlBbmRSZXN0b3JlSW5zdGFuY2VTdGF0ZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IHBlcnNpc3RBbmRVbmxvY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9wZXJzaXN0ZW5jZS5wZXJzaXN0U3RhdGUoaW5zdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBwZXJzaXN0IGluc3RhbmNlIGZvciB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVtaXQoXCJlcnJvclwiLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9kZWxldGVXRkluc3RhbmNlKGluc3RhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmluYWxseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJVbmxvY2tpbmc6ICVqXCIsIGxvY2tJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fcGVyc2lzdGVuY2UuZXhpdExvY2sobG9ja0luZm8uaWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiVW5sb2NrZWQuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJDYW5ub3QgZXhpdCBsb2NrIGZvciB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZW1pdChcImVycm9yXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluYWxseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChpbnN0YS5jYWxsTWV0aG9kKG1ldGhvZE5hbWUsIGFyZ3MpKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5BY3Rpdml0eVN0YXRlcy5pZGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFBlcnNpc3QgYW5kIHVubG9jazpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5sYXp5UGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZShwZXJzaXN0QW5kVW5sb2NrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHBlcnNpc3RBbmRVbmxvY2soKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuQWN0aXZpdHlTdGF0ZXMuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZGVsZXRlV0ZJbnN0YW5jZShpbnN0YSk7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLnJlbW92ZVN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCByZW1vdmUgc3RhdGUgb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgc2VsZi5fcGVyc2lzdGVuY2UuZXhpdExvY2sobG9ja0luZm8uaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBleGl0IGxvY2sgb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbWl0KFwiZXJyb3JcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJJbnN0YW5jZSAnXCIgKyBpbnN0YS5pZCArIFwiJyBpcyBpbiBhbiBpbnZhbGlkIHN0YXRlICdcIiArIGluc3RhLmV4ZWNTdGF0ZSArIFwiJyBhZnRlciBpbnZvY2F0aW9uIG9mIHRoZSBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5NZXRob2RJc05vdEFjY2Vzc2libGVFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIk1ldGhvZCBpcyBub3QgYWNjZXNzaWJsZSBhdCB0aGUgY3VycmVudCBzdGF0ZSwgYmFjYXVzZSBpdCBtaWdodCBiZSBzdGVwcGVkIG9uIGFub3RoZXIgaW5zdGFuY2UgdG8gYW5vdGhlciBzdGF0ZSB0aGEgaXMgZXhpc3RzIGF0IGN1cnJlbnQgaW4gdGhpcyBob3N0LiBDbGllbnQgc2hvdWxkIHJldHJ5LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2RlbGV0ZVdGSW5zdGFuY2UoaW5zdGEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgKHNlbGYuX3BlcnNpc3RlbmNlLnJlbW92ZVN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQsIGZhbHNlLCBlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAocmVtb3ZlRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IHJlbW92ZSBzdGF0ZSBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyByZW1vdmVFLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVtaXQocmVtb3ZlRSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChrZWVwTG9ja0FsaXZlKSB7XG4gICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgeWllbGQgc2VsZi5fcGVyc2lzdGVuY2UuZXhpdExvY2sobG9ja0luZm8uaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGV4aXRFKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCJDYW5ub3QgZXhpdCBsb2NrICdcIiArIGxvY2tJbmZvLmlkICsgXCInOlxcblwiICsgZXhpdEUuc3RhY2spO1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdChcImVycm9yXCIsIGV4aXRFKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fZW50ZXJMb2NrRm9yQ3JlYXRlZEluc3RhbmNlID0gYXN5bmMoZnVuY3Rpb24qIChpbnN0YSwgbG9ja0luZm8pIHtcbiAgICBsZXQgbGkgPSB5aWVsZCAodGhpcy5fcGVyc2lzdGVuY2UuZW50ZXJMb2NrKHNwZWNTdHJpbmdzLmhvc3RpbmcuZG91YmxlS2V5cyhpbnN0YS53b3JrZmxvd05hbWUsIGluc3RhLmlkKSwgdGhpcy5vcHRpb25zLmVudGVyTG9ja1RpbWVvdXQsIHRoaXMuX2dldEluTG9ja1RpbWVvdXQoKSkpO1xuICAgIGlmICh5aWVsZCAodGhpcy5fcGVyc2lzdGVuY2UuaXNSdW5uaW5nKGluc3RhLndvcmtmbG93TmFtZSwgaW5zdGEuaWQpKSkge1xuICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJDYW5ub3QgY3JlYXRlIGluc3RhbmNlIG9mIHdvcmtmbG93ICdcIiArIGluc3RhLndvcmtmbG93TmFtZSArIFwiJyBieSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJyBiZWNhdXNlIGl0J3MgYWxyZWFkeSBleGlzdHMuXCIpO1xuICAgIH1cbiAgICBsb2NrSW5mby5pZCA9IGxpLmlkO1xuICAgIGxvY2tJbmZvLm5hbWUgPSBsaS5uYW1lO1xuICAgIGxvY2tJbmZvLmhlbGRUbyA9IGxpLmhlbGRUbztcbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9nZXRJbkxvY2tUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICsgTWF0aC5tYXgodGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCAqIDAuNCwgMzAwMCk7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl92ZXJpZnlBbmRSZXN0b3JlSW5zdGFuY2VTdGF0ZSA9IGFzeW5jKGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBpbnN0YSA9IG51bGw7XG4gICAgbGV0IGVycm9yVGV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwiSW5zdGFuY2UgJ1wiICsgaW5zdGFuY2VJZCArIFwiJyBoYXMgYmVlbiBpbnZva2VkIGVsc2V3aGVyZSBzaW5jZSB0aGUgbG9jayB0b29rIGluIHRoZSBjdXJyZW50IGhvc3QuXCI7XG4gICAgfTtcbiAgICBpZiAoc2VsZi5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBoZWFkZXIgPSB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UuZ2V0UnVubmluZ0luc3RhbmNlSWRIZWFkZXIod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSk7XG4gICAgICAgICAgICBpZiAoaGVhZGVyKSB7XG4gICAgICAgICAgICAgICAgaW5zdGEgPSB5aWVsZCAoc2VsZi5fcmVzdG9yZUluc3RhbmNlU3RhdGUoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBoZWFkZXIud29ya2Zsb3dWZXJzaW9uLCBoZWFkZXIudXBkYXRlZE9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoZXJyb3JUZXh0KCkgKyBcIiBJbm5lciBlcnJvcjogaW5zdGFuY2UgXCIgKyBpbnN0YW5jZUlkICsgXCIgaXMgdW5rbm93bi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLldvcmtmbG93RXJyb3IgfHwgIV8uaXNVbmRlZmluZWQoZ2xvYmFsW2UubmFtZV0pIHx8IGUubmFtZSA9PT0gXCJBc3NlcnRpb25FcnJvclwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihlcnJvclRleHQoKSArIFwiXFxuSW5uZXIgZXJyb3I6XFxuXCIgKyBlLnN0YWNrLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpbnN0YSA9IHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5nZXQod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgaWYgKCFpbnN0YSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKGVycm9yVGV4dCgpICsgXCIgSW5uZXIgZXJyb3I6IGluc3RhbmNlIFwiICsgaW5zdGFuY2VJZCArIFwiIGlzIHVua25vd24uXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGluc3RhO1xufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX3Jlc3RvcmVJbnN0YW5jZVN0YXRlID0gYXN5bmMoZnVuY3Rpb24qIChpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIHdvcmtmbG93VmVyc2lvbiwgYWN0dWFsVGltZXN0YW1wKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVzdG9yZSBpbnN0YW5jZSBmcm9tIHBlcnNpc3RlbmNlLCBiZWNhdXNlIGhvc3QgaGFzIG5vIHBlcnNpc3RlbmNlIHJlZ2lzdGVyZWQuXCIpO1xuICAgIH1cblxuICAgIGxldCBpbnN0YSA9IHNlbGYuX2tub3duUnVubmluZ0luc3RhbmNlcy5nZXQod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbiAgICBpZiAoXy5pc1VuZGVmaW5lZChpbnN0YSkpIHtcbiAgICAgICAgbGV0IHdmRGVzYyA9IHNlbGYuX3JlZ2lzdHJ5LmdldERlc2Mod29ya2Zsb3dOYW1lLCB3b3JrZmxvd1ZlcnNpb24pO1xuICAgICAgICBpbnN0YSA9IHNlbGYuX2NyZWF0ZVdGSW5zdGFuY2UoKTtcbiAgICAgICAgaW5zdGEuc2V0V29ya2Zsb3cod2ZEZXNjLndvcmtmbG93LCBpbnN0YW5jZUlkKTtcbiAgICB9XG5cbiAgICBpZiAoaW5zdGEudXBkYXRlZE9uID09PSBudWxsIHx8IGluc3RhLnVwZGF0ZWRPbi5nZXRUaW1lKCkgIT09IGFjdHVhbFRpbWVzdGFtcC5nZXRUaW1lKCkgfHwgc2VsZi5vcHRpb25zLmFsd2F5c0xvYWRTdGF0ZSkge1xuICAgICAgICBsZXQgc3RhdGUgPSB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UubG9hZFN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpO1xuICAgICAgICBpbnN0YS5yZXN0b3JlU3RhdGUoc3RhdGUpO1xuICAgICAgICByZXR1cm4gaW5zdGE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gaW5zdGE7XG4gICAgfVxufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2NoZWNrSWZJbnN0YW5jZVJ1bm5pbmcgPSBhc3luYyhmdW5jdGlvbiogKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkge1xuICAgIGlmICh0aGlzLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICByZXR1cm4gKHlpZWxkIHRoaXMuX3BlcnNpc3RlbmNlLmlzUnVubmluZyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcy5leGlzdHMod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9nZXRSdW5uaW5nSW5zdGFuY2VIZWFkZXJzRm9yT3RoZXJWZXJzaW9uID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIHZlcnNpb24pIHtcbiAgICBpZiAodGhpcy5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgcmV0dXJuICh5aWVsZCB0aGlzLl9wZXJzaXN0ZW5jZS5nZXRSdW5uaW5nSW5zdGFuY2VIZWFkZXJzRm9yT3RoZXJWZXJzaW9uKHdvcmtmbG93TmFtZSwgdmVyc2lvbikpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldFJ1bm5pbmdJbnN0YW5jZUhlYWRlcnNGb3JPdGhlclZlcnNpb24od29ya2Zsb3dOYW1lLCB2ZXJzaW9uKTtcbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLmFkZFRyYWNrZXIgPSBmdW5jdGlvbiAodHJhY2tlcikge1xuICAgIHRoaXMuX3ZlcmlmeSgpO1xuXG4gICAgaWYgKCFfLmlzT2JqZWN0KHRyYWNrZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0LlwiKTtcbiAgICB9XG4gICAgdGhpcy5fdHJhY2tlcnMucHVzaCh0cmFja2VyKTtcbiAgICB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuYWRkVHJhY2tlcih0cmFja2VyKTtcbn07XG5cbi8qIFdha2UgVXAqL1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jb250aW51ZVdva2VVcEluc3RhbmNlID0gYXN5bmMoZnVuY3Rpb24qKHdha2V1cGFibGUpIHtcbiAgICBhc3NlcnQoXy5pc1BsYWluT2JqZWN0KHdha2V1cGFibGUpKTtcbiAgICBhc3NlcnQoXy5pc1N0cmluZyh3YWtldXBhYmxlLmluc3RhbmNlSWQpKTtcbiAgICBhc3NlcnQoXy5pc1N0cmluZyh3YWtldXBhYmxlLndvcmtmbG93TmFtZSkpO1xuICAgIGFzc2VydChfLmlzUGxhaW5PYmplY3Qod2FrZXVwYWJsZS5hY3RpdmVEZWxheSkpO1xuICAgIGFzc2VydChfLmlzU3RyaW5nKHdha2V1cGFibGUuYWN0aXZlRGVsYXkubWV0aG9kTmFtZSkpO1xuICAgIGFzc2VydChfLmlzRGF0ZSh3YWtldXBhYmxlLmFjdGl2ZURlbGF5LmRlbGF5VG8pKTtcbiAgICBhc3NlcnQoXy5pc0Z1bmN0aW9uKHdha2V1cGFibGUucmVzdWx0LnJlc29sdmUpKTtcbiAgICBhc3NlcnQoXy5pc0Z1bmN0aW9uKHdha2V1cGFibGUucmVzdWx0LnJlamVjdCkpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgLy9pbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3NcbiAgICAgICAgZGVidWcoXCJJbnZva2luZyBEZWxheVRvIGluc3RhbmNlSWQ6ICVzLCB3b3JrZmxvd05hbWU6JXMsIG1ldGhvZE5hbWU6ICVzXCIsIHdha2V1cGFibGUuaW5zdGFuY2VJZCwgd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsIHdha2V1cGFibGUuYWN0aXZlRGVsYXkubWV0aG9kTmFtZSk7XG4gICAgICAgIHRoaXMuZW1pdChcImRlbGF5VG9cIiwge1xuICAgICAgICAgICAgaW5zdGFuY2VJZDogd2FrZXVwYWJsZS5pbnN0YW5jZUlkLFxuICAgICAgICAgICAgd29ya2Zsb3dOYW1lOiB3YWtldXBhYmxlLndvcmtmbG93TmFtZSxcbiAgICAgICAgICAgIGFjdGl2ZURlbGF5OiB3YWtldXBhYmxlLmFjdGl2ZURlbGF5XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgdGhpcy5faW52b2tlTWV0aG9kT25SdW5uaW5nSW5zdGFuY2Uod2FrZXVwYWJsZS5pbnN0YW5jZUlkLCB3YWtldXBhYmxlLndvcmtmbG93TmFtZSwgd2FrZXVwYWJsZS5hY3RpdmVEZWxheS5tZXRob2ROYW1lLCBbd2FrZXVwYWJsZS5pbnN0YW5jZUlkLCB3YWtldXBhYmxlLmFjdGl2ZURlbGF5LmRlbGF5VG9dKTtcbiAgICAgICAgZGVidWcoXCJEZWxheVRvIGluc3RhbmNlSWQ6ICVzLCB3b3JrZmxvd05hbWU6JXMsIG1ldGhvZE5hbWU6ICVzIGludm9rZWQuXCIsIHdha2V1cGFibGUuaW5zdGFuY2VJZCwgd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsIHdha2V1cGFibGUuYWN0aXZlRGVsYXkubWV0aG9kTmFtZSk7XG4gICAgICAgIHRoaXMuZW1pdChcImRlbGF5VG9Db21wbGV0ZVwiLCB7XG4gICAgICAgICAgICBpbnN0YW5jZUlkOiB3YWtldXBhYmxlLmluc3RhbmNlSWQsXG4gICAgICAgICAgICB3b3JrZmxvd05hbWU6IHdha2V1cGFibGUud29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgYWN0aXZlRGVsYXk6IHdha2V1cGFibGUuYWN0aXZlRGVsYXksXG4gICAgICAgICAgICByZXN1bHQ6IHJlc3VsdFxuICAgICAgICB9KTtcbiAgICAgICAgd2FrZXVwYWJsZS5yZXN1bHQucmVzb2x2ZShyZXN1bHQpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5NZXRob2RJc05vdEFjY2Vzc2libGVFcnJvciB8fCBlIGluc3RhbmNlb2YgZXJyb3JzLldvcmtmbG93Tm90Rm91bmRFcnJvcikge1xuICAgICAgICAgICAgZGVidWcoXCJEZWxheVRvJ3MgbWV0aG9kIGlzIG5vdCBhY2Nlc3NpYmxlIHNpbmNlIGl0IGdvdCBzZWxlY3RlZCBmb3IgY29udGludWF0aW9uLlwiKTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImRlbGF5VG9Db21wbGV0ZVwiLCB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZDogd2FrZXVwYWJsZS5pbnN0YW5jZUlkLFxuICAgICAgICAgICAgICAgIHdvcmtmbG93TmFtZTogd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsXG4gICAgICAgICAgICAgICAgYWN0aXZlRGVsYXk6IHdha2V1cGFibGUuYWN0aXZlRGVsYXksXG4gICAgICAgICAgICAgICAgcmVzdWx0OiBlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHdha2V1cGFibGUucmVzdWx0LnJlc29sdmUoZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZGVidWcoXCJEZWxheVRvIGluc3RhbmNlSWQ6ICVzLCB3b3JrZmxvd05hbWU6JXMsIG1ldGhvZE5hbWU6ICVzIGVycm9yOiAlc1wiLCB3YWtldXBhYmxlLmluc3RhbmNlSWQsIHdha2V1cGFibGUud29ya2Zsb3dOYW1lLCB3YWtldXBhYmxlLmFjdGl2ZURlbGF5Lm1ldGhvZE5hbWUsIGUuc3RhY2spO1xuICAgICAgICB0aGlzLmVtaXQoXCJkZWxheVRvRmFpbFwiLCB7XG4gICAgICAgICAgICBpbnN0YW5jZUlkOiB3YWtldXBhYmxlLmluc3RhbmNlSWQsXG4gICAgICAgICAgICB3b3JrZmxvd05hbWU6IHdha2V1cGFibGUud29ya2Zsb3dOYW1lLFxuICAgICAgICAgICAgYWN0aXZlRGVsYXk6IHdha2V1cGFibGUuYWN0aXZlRGVsYXksXG4gICAgICAgICAgICBlcnJvcjogZVxuICAgICAgICB9KTtcbiAgICAgICAgd2FrZXVwYWJsZS5yZXN1bHQucmVqZWN0KGUpO1xuICAgIH1cbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jcmVhdGVXRkluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBsZXQgaW5zdGEgPSBuZXcgV29ya2Zsb3dJbnN0YW5jZSh0aGlzKTtcbiAgICBpbnN0YS5vbihcbiAgICAgICAgZW51bXMuZXZlbnRzLndvcmtmbG93RXZlbnQsXG4gICAgICAgIGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICBzZWxmLmVtaXQoZW51bXMuZXZlbnRzLndvcmtmbG93RXZlbnQsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gaW5zdGE7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9kZWxldGVXRkluc3RhbmNlID0gZnVuY3Rpb24oaW5zdGEpIHtcbiAgICBpbnN0YS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMucmVtb3ZlKGluc3RhLndvcmtmbG93TmFtZSwgaW5zdGEuaWQpO1xufTtcblxuLyogU2h1dGRvd24gKi9cblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fdmVyaWZ5ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9zaHV0ZG93bikge1xuICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJXb3JrZmxvdyBob3N0IGhhcyBiZWVuIHNodXQgZG93bi5cIik7XG4gICAgfVxufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5zaHV0ZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fc2h1dGRvd24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl93YWtlVXApIHtcbiAgICAgICAgdGhpcy5fd2FrZVVwLnN0b3AoKTtcbiAgICAgICAgdGhpcy5fd2FrZVVwLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLl93YWtlVXAgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX3NodXRkb3duID0gdHJ1ZTtcbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXb3JrZmxvd0hvc3Q7XG4iXX0=
