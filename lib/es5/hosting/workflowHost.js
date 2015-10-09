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
  this._registry = new WorkflowRegistry(this._options.serializer);
  this._trackers = [];
  this._isInitialized = false;
  this._instanceIdParser = new InstanceIdParser();
  this._persistence = null;
  if (this._options.persistence !== null) {
    this._persistence = new WorkflowPersistence(this._options.persistence);
  }
  this._knownRunningInstances = new KnownInstaStore();
  this._wakeUp = null;
  this._shutdown = false;
}
util.inherits(WorkflowHost, EventEmitter);
WorkflowHost.events = enums.workflowEvents;
WorkflowHost.prototype.onWarn = function(error) {
  this.emit(WorkflowHost.events.warn, error);
};
WorkflowHost.prototype.onStart = function(instance, methodName, args) {
  this.emit(WorkflowHost.events.start, {
    instance: instance,
    methodName: methodName,
    args: args
  });
};
WorkflowHost.prototype.onInvoke = function(instance, methodName, args, idle, error) {
  this.emit(WorkflowHost.events.invoke, {
    instance: instance,
    methodName: methodName,
    args: args,
    idle: idle,
    error: error
  });
};
WorkflowHost.prototype.onEnd = function(instance, cancelled, error) {
  this.emit(WorkflowHost.events.invoke, {
    instance: instance,
    cancelled: cancelled,
    error: error
  });
};
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
WorkflowHost.prototype.registerDeprecatedWorkflow = function(workflow) {
  this.registerWorkflow(workflow, true);
};
WorkflowHost.prototype.registerWorkflow = function(workflow, deprecated) {
  this._verify();
  var desc = this._registry.register(workflow, deprecated);
  debug("Workflow registered. name: %s, version: %s", desc.name, desc.version);
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
        self.onWarn(e);
      });
      this._wakeUp.start();
    }
    this._isInitialized = true;
  }
};
WorkflowHost.prototype.stopDeprecatedVersions = async($traceurRuntime.initGeneratorFunction(function $__13(workflowName) {
  var self,
      remove,
      count,
      currentVersion,
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
          currentVersion = this._registry.getCurrentVersion(workflowName);
          $ctx.state = 79;
          break;
        case 79:
          $ctx.state = (currentVersion) ? 1 : 73;
          break;
        case 1:
          $ctx.state = 2;
          return this._getRunningInstanceHeadersForOtherVersion(workflowName, currentVersion);
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
      creatable,
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
          creatable = null;
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
                  version: r.info.version
                },
                id: r.id
              };
            }).toArray());
          }
          $ctx.state = 67;
          break;
        case 67:
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
          if (result.info.canCreateInstance && !result.info.deprecated) {
            creatable = result.info;
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
          $ctx.state = (instanceId) ? 41 : 64;
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
          $ctx.state = 25;
          return (self._invokeMethodOnRunningInstance(instanceId, workflowName, methodName, args));
        case 25:
          ir = $ctx.sent;
          $ctx.state = 27;
          break;
        case 27:
          debug("Invoke completed, result: %j", ir);
          $ctx.state = 31;
          break;
        case 31:
          $ctx.returnValue = ir;
          $ctx.state = -2;
          break;
        case 29:
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
          throw e;
          $ctx.state = -2;
          break;
        case 64:
          $ctx.state = (creatable) ? 60 : 62;
          break;
        case 60:
          debug("Found a creatable workflow (name: '%s', version: '%s'), invoking a create method on that.", creatable.workflow.name, creatable.version);
          $ctx.state = 61;
          break;
        case 61:
          $ctx.pushTry(51, null);
          $ctx.state = 54;
          break;
        case 54:
          $ctx.state = 44;
          return (self._createInstanceAndInvokeMethod(creatable.workflow, creatable.version, methodName, args));
        case 44:
          cr = $ctx.sent;
          $ctx.state = 46;
          break;
        case 46:
          debug("Create completed, result: %j", cr);
          $ctx.state = 50;
          break;
        case 50:
          $ctx.returnValue = cr;
          $ctx.state = -2;
          break;
        case 48:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 51:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 57;
          break;
        case 57:
          debug("Create failed: %s", e.stack);
          throw e;
          $ctx.state = -2;
          break;
        case 62:
          debug("No continuable workflows have been found.");
          throw new errors.MethodIsNotAccessibleError("Cannot create or continue workflow '" + workflowName + "' by calling method '" + methodName + "'.");
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__14, this);
}));
WorkflowHost.prototype._createInstanceAndInvokeMethod = async($traceurRuntime.initGeneratorFunction(function $__22(workflow, workflowVersion, methodName, args) {
  var workflowName,
      lockInfo,
      insta,
      result,
      keepLockAlive,
      insta$__9,
      result$__10,
      err,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          workflowName = workflow.name;
          lockInfo = null;
          $ctx.state = 66;
          break;
        case 66:
          $ctx.state = (!this._persistence) ? 7 : 62;
          break;
        case 7:
          insta = this._createWFInstance();
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = 2;
          return (insta.create(workflow, workflowVersion, methodName, args, lockInfo));
        case 2:
          result = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          this._knownRunningInstances.add(workflowName, insta);
          this.onStart(insta, methodName, args);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.returnValue = result;
          $ctx.state = -2;
          break;
        case 62:
          lockInfo = {
            id: null,
            name: null,
            heldTo: null
          };
          keepLockAlive = new KeepLockAlive(this._persistence, lockInfo, this._inLockTimeout, this.options.lockRenewalTimeout);
          $ctx.state = 63;
          break;
        case 63:
          $ctx.pushTry(null, 55);
          $ctx.state = 57;
          break;
        case 57:
          insta$__9 = this._createWFInstance();
          $ctx.state = 53;
          break;
        case 53:
          $ctx.state = 12;
          return (insta$__9.create(workflow, workflowVersion, methodName, args, lockInfo));
        case 12:
          result$__10 = $ctx.sent;
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = (insta$__9.execState === enums.activityStates.idle) ? 45 : 49;
          break;
        case 45:
          this._knownRunningInstances.add(workflowName, insta$__9);
          err = null;
          $ctx.state = 46;
          break;
        case 46:
          $ctx.pushTry(21, null);
          $ctx.state = 24;
          break;
        case 24:
          $ctx.state = 16;
          return this._persistence.persistState(insta$__9);
        case 16:
          $ctx.maybeThrow();
          $ctx.state = 18;
          break;
        case 18:
          this.onStart(insta$__9, methodName, args);
          $ctx.state = 20;
          break;
        case 20:
          $ctx.popTry();
          $ctx.state = 26;
          break;
        case 21:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 27;
          break;
        case 27:
          debug("Cannot persist instance of workflow name: '" + workflowName + "' instance id '" + insta$__9.id + "':\n" + e.stack);
          this._knownRunningInstances.remove(workflowName, insta$__9.id);
          err = e;
          $ctx.state = 26;
          break;
        case 26:
          $ctx.pushTry(34, null);
          $ctx.state = 37;
          break;
        case 37:
          $ctx.state = 31;
          return this._persistence.exitLock(lockInfo.id);
        case 31:
          $ctx.maybeThrow();
          $ctx.state = 33;
          break;
        case 33:
          $ctx.popTry();
          $ctx.state = 39;
          break;
        case 34:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 40;
          break;
        case 40:
          debug("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta$__9.id + "':\n" + e.stack);
          this.onWarn(e);
          $ctx.state = 39;
          break;
        case 39:
          if (err) {
            throw err;
          }
          $ctx.state = 48;
          break;
        case 48:
          $ctx.returnValue = result$__10;
          $ctx.state = 55;
          $ctx.finallyFallThrough = -2;
          break;
        case 49:
          $ctx.returnValue = result$__10;
          $ctx.state = 55;
          $ctx.finallyFallThrough = -2;
          break;
        case 55:
          $ctx.popTry();
          $ctx.state = 61;
          break;
        case 61:
          keepLockAlive.end();
          $ctx.state = 59;
          break;
        case 59:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__22, this);
}));
WorkflowHost.prototype._throwIfRecoverable = function(error, workflowName, methodName) {
  if (error instanceof errors.MethodIsNotAccessibleError) {
    debug("Method '%s' of workflow '%s' is not accessible at the current state, bacause it might be stepped on another instance to another state tha is exists at current in this host. Client should retry.", methodName, workflowName);
    throw error;
  }
};
WorkflowHost.prototype._invokeMethodOnRunningInstance = async($traceurRuntime.initGeneratorFunction(function $__23(instanceId, workflowName, methodName, args) {
  var self,
      insta,
      result,
      lockName,
      lockInfo,
      keepLockAlive,
      insta$__11,
      endWithError,
      persistAndUnlock,
      result$__12,
      msg,
      e,
      exitE;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          $ctx.state = 147;
          break;
        case 147:
          $ctx.state = (!self._persistence) ? 1 : 143;
          break;
        case 1:
          $ctx.state = 2;
          return (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
        case 2:
          insta = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.pushTry(21, null);
          $ctx.state = 24;
          break;
        case 24:
          $ctx.state = 6;
          return (insta.callMethod(methodName, args));
        case 6:
          result = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = (insta.execState === enums.activityStates.idle) ? 11 : 19;
          break;
        case 11:
          this.onInvoke(insta, methodName, args, true, null);
          $ctx.state = 12;
          break;
        case 12:
          $ctx.returnValue = result;
          $ctx.state = -2;
          break;
        case 19:
          $ctx.state = (insta.execState === enums.activityStates.complete) ? 15 : 17;
          break;
        case 15:
          self._deleteWFInstance(insta);
          this.onInvoke(insta, methodName, args, false, null);
          this.onEnd(insta, false, null);
          $ctx.state = 16;
          break;
        case 16:
          $ctx.returnValue = result;
          $ctx.state = -2;
          break;
        case 17:
          throw new errors.WorkflowError("Instance '" + insta.id + "' is in an invalid state '" + insta.execState + "' after invocation of the method '" + methodName + "'.");
          $ctx.state = 10;
          break;
        case 10:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 21:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 27;
          break;
        case 27:
          this._throwIfRecoverable(e, workflowName, methodName);
          self._deleteWFInstance(insta);
          this.onInvoke(insta, methodName, args, false, e);
          this.onEnd(insta, false, e);
          throw e;
          $ctx.state = -2;
          break;
        case 143:
          lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
          keepLockAlive = null;
          $ctx.state = 144;
          break;
        case 144:
          $ctx.pushTry(136, null);
          $ctx.state = 139;
          break;
        case 139:
          debug("Locking instance.");
          $ctx.state = 113;
          break;
        case 113:
          $ctx.state = 31;
          return (self._persistence.enterLock(lockName, self.options.enterLockTimeout, self._inLockTimeout));
        case 31:
          lockInfo = $ctx.sent;
          $ctx.state = 33;
          break;
        case 33:
          debug("Locked: %j", lockInfo);
          keepLockAlive = new KeepLockAlive(self._persistence, lockInfo, self._inLockTimeout, self.options.lockRenewalTimeout);
          $ctx.state = 115;
          break;
        case 115:
          $ctx.state = 35;
          return (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
        case 35:
          insta$__11 = $ctx.sent;
          $ctx.state = 37;
          break;
        case 37:
          endWithError = async($traceurRuntime.initGeneratorFunction(function $__24(e) {
            var removeE;
            return $traceurRuntime.createGeneratorInstance(function($ctx) {
              while (true)
                switch ($ctx.state) {
                  case 0:
                    self._deleteWFInstance(insta$__11);
                    $ctx.state = 15;
                    break;
                  case 15:
                    $ctx.pushTry(5, null);
                    $ctx.state = 8;
                    break;
                  case 8:
                    $ctx.state = 2;
                    return (self._persistence.removeState(workflowName, insta$__11.id, false, e));
                  case 2:
                    $ctx.maybeThrow();
                    $ctx.state = 4;
                    break;
                  case 4:
                    $ctx.popTry();
                    $ctx.state = 10;
                    break;
                  case 5:
                    $ctx.popTry();
                    $ctx.maybeUncatchable();
                    removeE = $ctx.storedException;
                    $ctx.state = 11;
                    break;
                  case 11:
                    debug("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + removeE.stack);
                    self.onWarn(removeE);
                    $ctx.state = 10;
                    break;
                  case 10:
                    self.onInvoke(insta$__11, methodName, args, false, e);
                    self.onEnd(insta$__11, false, e);
                    $ctx.state = -2;
                    break;
                  default:
                    return $ctx.end();
                }
            }, $__24, this);
          }));
          $ctx.state = 117;
          break;
        case 117:
          $ctx.pushTry(105, null);
          $ctx.state = 108;
          break;
        case 108:
          persistAndUnlock = function() {
            return self._persistence.persistState(insta$__11).finally(function() {
              debug("Unlocking: %j", lockInfo);
              return self._persistence.exitLock(lockInfo.id).then(function() {
                debug("Unlocked.");
              }, function(e) {
                debug("Cannot exit lock for workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + e.stack);
                self.onWarn(e);
              }).finally(function() {
                keepLockAlive.end();
              });
            });
          };
          $ctx.state = 96;
          break;
        case 96:
          $ctx.state = 39;
          return (insta$__11.callMethod(methodName, args));
        case 39:
          result$__12 = $ctx.sent;
          $ctx.state = 41;
          break;
        case 41:
          $ctx.state = (insta$__11.execState === enums.activityStates.idle) ? 50 : 93;
          break;
        case 50:
          $ctx.state = (self.options.lazyPersistence) ? 48 : 42;
          break;
        case 48:
          setImmediate(function() {
            persistAndUnlock().then(function() {
              self.onInvoke(insta$__11, methodName, args, true, null);
            }, function(e) {
              endWithError(e);
            });
          });
          $ctx.state = 49;
          break;
        case 42:
          $ctx.state = 43;
          return persistAndUnlock();
        case 43:
          $ctx.maybeThrow();
          $ctx.state = 45;
          break;
        case 45:
          this.onInvoke(insta$__11, methodName, args, true, null);
          $ctx.state = 49;
          break;
        case 49:
          $ctx.returnValue = result$__12;
          $ctx.state = -2;
          break;
        case 93:
          $ctx.state = (insta$__11.execState === enums.activityStates.complete) ? 89 : 91;
          break;
        case 89:
          self._deleteWFInstance(insta$__11);
          this.onInvoke(insta$__11, methodName, args, false, null);
          this.onEnd(insta$__11, false, null);
          $ctx.state = 90;
          break;
        case 90:
          $ctx.pushTry(null, 80);
          $ctx.state = 82;
          break;
        case 82:
          $ctx.pushTry(57, null);
          $ctx.state = 60;
          break;
        case 60:
          $ctx.state = 54;
          return self._persistence.removeState(workflowName, insta$__11.id, true);
        case 54:
          $ctx.maybeThrow();
          $ctx.state = 56;
          break;
        case 56:
          $ctx.popTry();
          $ctx.state = 62;
          break;
        case 57:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 63;
          break;
        case 63:
          debug("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + e.stack);
          this.onWarn(e);
          $ctx.state = 62;
          break;
        case 62:
          $ctx.pushTry(70, null);
          $ctx.state = 73;
          break;
        case 73:
          $ctx.state = 67;
          return self._persistence.exitLock(lockInfo.id);
        case 67:
          $ctx.maybeThrow();
          $ctx.state = 69;
          break;
        case 69:
          $ctx.popTry();
          $ctx.state = 80;
          $ctx.finallyFallThrough = 75;
          break;
        case 70:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 76;
          break;
        case 76:
          debug("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta$__11.id + "':\n" + e.stack);
          this.onWarn(e);
          $ctx.state = 80;
          $ctx.finallyFallThrough = 75;
          break;
        case 80:
          $ctx.popTry();
          $ctx.state = 86;
          break;
        case 86:
          keepLockAlive.end();
          $ctx.state = 84;
          break;
        case 75:
          $ctx.returnValue = result$__12;
          $ctx.state = -2;
          break;
        case 91:
          throw new errors.WorkflowError("Instance '" + insta$__11.id + "' is in an invalid state '" + insta$__11.execState + "' after invocation of the method '" + methodName + "'.");
          $ctx.state = 52;
          break;
        case 52:
          $ctx.popTry();
          $ctx.state = 110;
          break;
        case 105:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 101;
          break;
        case 101:
          this._throwIfRecoverable(e, workflowName, methodName);
          $ctx.state = 102;
          break;
        case 102:
          $ctx.state = 98;
          return endWithError(e);
        case 98:
          $ctx.maybeThrow();
          $ctx.state = 100;
          break;
        case 100:
          throw e;
          $ctx.state = 110;
          break;
        case 110:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 136:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 132;
          break;
        case 132:
          if (keepLockAlive) {
            keepLockAlive.end();
          }
          $ctx.state = 133;
          break;
        case 133:
          $ctx.state = (lockInfo) ? 124 : 127;
          break;
        case 124:
          $ctx.pushTry(122, null);
          $ctx.state = 125;
          break;
        case 125:
          $ctx.state = 119;
          return self._persistence.exitLock(lockInfo.id);
        case 119:
          $ctx.maybeThrow();
          $ctx.state = 121;
          break;
        case 121:
          $ctx.popTry();
          $ctx.state = 127;
          break;
        case 122:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          exitE = $ctx.storedException;
          $ctx.state = 128;
          break;
        case 128:
          debug("Cannot exit lock '" + lockInfo.id + "':\n" + exitE.stack);
          this.onWarn(exitE);
          $ctx.state = 127;
          break;
        case 127:
          if (e instanceof errors.TimeoutError) {
            msg = "Cannot call method of workflow '" + workflowName + "', because '" + methodName + "' is locked.";
            debug(msg);
            throw new errors.MethodIsNotAccessibleError(msg);
          }
          throw e;
          $ctx.state = -2;
          break;
        case 84:
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
      header;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          insta = null;
          $ctx.state = 16;
          break;
        case 16:
          $ctx.state = (self._persistence) ? 1 : 10;
          break;
        case 1:
          $ctx.state = 2;
          return (self._persistence.getRunningInstanceIdHeader(workflowName, instanceId));
        case 2:
          header = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = (header) ? 5 : 8;
          break;
        case 5:
          $ctx.state = 6;
          return (self._restoreInstanceState(instanceId, workflowName, header.workflowVersion, header.updatedOn));
        case 6:
          insta = $ctx.sent;
          $ctx.state = 8;
          break;
        case 10:
          insta = self._knownRunningInstances.get(workflowName, instanceId);
          $ctx.state = 8;
          break;
        case 8:
          if (!insta) {
            throw new errors.WorkflowNotFoundError(("Worflow (name: '" + workflowName + "', id: '" + instanceId + "') has been deleted since the lock has been taken."));
          }
          $ctx.state = 18;
          break;
        case 18:
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
            insta.setWorkflow(wfDesc.workflow, workflowVersion, instanceId);
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
          $ctx.state = (this._shutdown) ? 1 : 2;
          break;
        case 1:
          $ctx.state = -2;
          break;
        case 2:
          assert(_.isPlainObject(wakeupable));
          assert(_.isString(wakeupable.instanceId));
          assert(_.isString(wakeupable.workflowName));
          assert(_.isPlainObject(wakeupable.activeDelay));
          assert(_.isString(wakeupable.activeDelay.methodName));
          assert(_.isDate(wakeupable.activeDelay.delayTo));
          assert(_.isFunction(wakeupable.result.resolve));
          assert(_.isFunction(wakeupable.result.reject));
          $ctx.state = 27;
          break;
        case 27:
          $ctx.pushTry(19, null);
          $ctx.state = 22;
          break;
        case 22:
          debug("Invoking DelayTo instanceId: %s, workflowName:%s, methodName: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = 5;
          return this._invokeMethodOnRunningInstance(wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, [wakeupable.instanceId, wakeupable.activeDelay.delayTo]);
        case 5:
          result = $ctx.sent;
          $ctx.state = 7;
          break;
        case 7:
          debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s invoked.", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
          wakeupable.result.resolve();
          $ctx.state = 11;
          break;
        case 11:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 19:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 16;
          break;
        case 16:
          $ctx.state = (e instanceof errors.MethodIsNotAccessibleError || e instanceof errors.WorkflowNotFoundError) ? 14 : 13;
          break;
        case 14:
          debug("DelayTo's method is not accessible since it got selected for continuation.");
          wakeupable.result.resolve();
          $ctx.state = 15;
          break;
        case 15:
          $ctx.state = -2;
          break;
        case 13:
          debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s error: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, e.stack);
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
  }
  this._shutdown = true;
  this.removeAllListeners();
};
module.exports = WorkflowHost;
//# sourceMappingURL=data:application/json;base64,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QUFBQSxBQUNKLENBQUM7QUFFRCxXQUFXLFVBQVUsU0FBUyxFQUFJLFVBQVUsQUFBRCxDQUFHO0FBQzFDLEtBQUksSUFBRyxVQUFVLENBQUc7QUFDaEIsVUFBTTtFQUNWO0FBQUEsQUFDQSxLQUFJLElBQUcsUUFBUSxDQUFHO0FBQ2QsT0FBRyxRQUFRLEtBQUssQUFBQyxFQUFDLENBQUM7RUFDdkI7QUFBQSxBQUNBLEtBQUcsVUFBVSxFQUFJLEtBQUcsQ0FBQztBQUNyQixLQUFHLG1CQUFtQixBQUFDLEVBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQsS0FBSyxRQUFRLEVBQUksYUFBVyxDQUFDO0FBQzdCIiwiZmlsZSI6Imhvc3Rpbmcvd29ya2Zsb3dIb3N0LmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubGV0IFdvcmtmbG93UmVnaXN0cnkgPSByZXF1aXJlKFwiLi93b3JrZmxvd1JlZ2lzdHJ5XCIpO1xubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xubGV0IEFjdGl2aXR5ID0gcmVxdWlyZShcIi4uL2FjdGl2aXRpZXMvYWN0aXZpdHlcIik7XG5sZXQgV29ya2Zsb3cgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy93b3JrZmxvd1wiKTtcbmxldCBXb3JrZmxvd1BlcnNpc3RlbmNlID0gcmVxdWlyZShcIi4vd29ya2Zsb3dQZXJzaXN0ZW5jZVwiKTtcbmxldCBXb3JrZmxvd0luc3RhbmNlID0gcmVxdWlyZShcIi4vd29ya2Zsb3dJbnN0YW5jZVwiKTtcbmxldCBJbnN0YW5jZUlkUGFyc2VyID0gcmVxdWlyZShcIi4vaW5zdGFuY2VJZFBhcnNlclwiKTtcbmxldCBlbnVtcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZW51bXNcIik7XG5sZXQgQmx1ZWJpcmQgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XG5sZXQgS25vd25JbnN0YVN0b3JlID0gcmVxdWlyZShcIi4va25vd25JbnN0YVN0b3JlXCIpO1xubGV0IHNwZWNTdHJpbmdzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9zcGVjU3RyaW5nc1wiKTtcbmxldCBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcbmxldCBTZXJpYWxpemVyID0gcmVxdWlyZShcImJhY2twYWNrLW5vZGVcIikuc3lzdGVtLlNlcmlhbGl6ZXI7XG5sZXQgaXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2lzXCIpO1xubGV0IEtlZXBMb2NrQWxpdmUgPSByZXF1aXJlKFwiLi9rZWVwTG9ja0FsaXZlXCIpO1xubGV0IGFzeW5jSGVscGVycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vYXN5bmNIZWxwZXJzXCIpO1xubGV0IGFzeW5jID0gYXN5bmNIZWxwZXJzLmFzeW5jO1xubGV0IFdha2VVcCA9IHJlcXVpcmUoXCIuL3dha2VVcFwiKTtcbmxldCBhc3NlcnQgPSByZXF1aXJlKFwiYXNzZXJ0XCIpO1xubGV0IGRlYnVnID0gcmVxdWlyZShcImRlYnVnXCIpKFwid2Y0bm9kZTpXb3JrZmxvd0hvc3RcIik7XG5sZXQgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXI7XG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xuXG5mdW5jdGlvbiBXb3JrZmxvd0hvc3Qob3B0aW9ucykge1xuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5fb3B0aW9ucyA9IF8uZXh0ZW5kKFxuICAgICAgICB7XG4gICAgICAgICAgICBlbnRlckxvY2tUaW1lb3V0OiAxMDAwMCxcbiAgICAgICAgICAgIGxvY2tSZW5ld2FsVGltZW91dDogNTAwMCxcbiAgICAgICAgICAgIGFsd2F5c0xvYWRTdGF0ZTogZmFsc2UsXG4gICAgICAgICAgICBsYXp5UGVyc2lzdGVuY2U6IHRydWUsXG4gICAgICAgICAgICBwZXJzaXN0ZW5jZTogbnVsbCxcbiAgICAgICAgICAgIHNlcmlhbGl6ZXI6IG51bGwsXG4gICAgICAgICAgICBlbmFibGVQcm9tb3Rpb25zOiBmYWxzZSxcbiAgICAgICAgICAgIHdha2VVcE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogNTAwMCxcbiAgICAgICAgICAgICAgICBiYXRjaFNpemU6IDEwXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5fcmVnaXN0cnkgPSBuZXcgV29ya2Zsb3dSZWdpc3RyeSh0aGlzLl9vcHRpb25zLnNlcmlhbGl6ZXIpO1xuICAgIHRoaXMuX3RyYWNrZXJzID0gW107XG4gICAgdGhpcy5faXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuX2luc3RhbmNlSWRQYXJzZXIgPSBuZXcgSW5zdGFuY2VJZFBhcnNlcigpO1xuICAgIHRoaXMuX3BlcnNpc3RlbmNlID0gbnVsbDtcblxuICAgIGlmICh0aGlzLl9vcHRpb25zLnBlcnNpc3RlbmNlICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3BlcnNpc3RlbmNlID0gbmV3IFdvcmtmbG93UGVyc2lzdGVuY2UodGhpcy5fb3B0aW9ucy5wZXJzaXN0ZW5jZSk7XG4gICAgfVxuICAgIHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcyA9IG5ldyBLbm93bkluc3RhU3RvcmUoKTtcbiAgICB0aGlzLl93YWtlVXAgPSBudWxsO1xuICAgIHRoaXMuX3NodXRkb3duID0gZmFsc2U7XG59XG5cbnV0aWwuaW5oZXJpdHMoV29ya2Zsb3dIb3N0LCBFdmVudEVtaXR0ZXIpO1xuXG5Xb3JrZmxvd0hvc3QuZXZlbnRzID0gZW51bXMud29ya2Zsb3dFdmVudHM7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUub25XYXJuID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgdGhpcy5lbWl0KFdvcmtmbG93SG9zdC5ldmVudHMud2FybiwgZXJyb3IpO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5vblN0YXJ0ID0gZnVuY3Rpb24gKGluc3RhbmNlLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgdGhpcy5lbWl0KFdvcmtmbG93SG9zdC5ldmVudHMuc3RhcnQsIHtcbiAgICAgICAgaW5zdGFuY2U6IGluc3RhbmNlLFxuICAgICAgICBtZXRob2ROYW1lOiBtZXRob2ROYW1lLFxuICAgICAgICBhcmdzOiBhcmdzXG4gICAgfSk7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLm9uSW52b2tlID0gZnVuY3Rpb24gKGluc3RhbmNlLCBtZXRob2ROYW1lLCBhcmdzLCBpZGxlLCBlcnJvcikge1xuICAgIHRoaXMuZW1pdChXb3JrZmxvd0hvc3QuZXZlbnRzLmludm9rZSwge1xuICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2UsXG4gICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICAgIGlkbGU6IGlkbGUsXG4gICAgICAgIGVycm9yOiBlcnJvclxuICAgIH0pO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5vbkVuZCA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgY2FuY2VsbGVkLCBlcnJvcikge1xuICAgIHRoaXMuZW1pdChXb3JrZmxvd0hvc3QuZXZlbnRzLmludm9rZSwge1xuICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2UsXG4gICAgICAgIGNhbmNlbGxlZDogY2FuY2VsbGVkLFxuICAgICAgICBlcnJvcjogZXJyb3JcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFxuICAgIFdvcmtmbG93SG9zdC5wcm90b3R5cGUsIHtcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGlzSW5pdGlhbGl6ZWQ6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc0luaXRpYWxpemVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbnN0YW5jZUlkUGFyc2VyOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faW5zdGFuY2VJZFBhcnNlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcGVyc2lzdGVuY2U6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9wZXJzaXN0ZW5jZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX2luTG9ja1RpbWVvdXQ6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICsgTWF0aC5tYXgodGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCAqIDAuNCwgMzAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5yZWdpc3RlckRlcHJlY2F0ZWRXb3JrZmxvdyA9IGZ1bmN0aW9uICh3b3JrZmxvdykge1xuICAgIHRoaXMucmVnaXN0ZXJXb3JrZmxvdyh3b3JrZmxvdywgdHJ1ZSk7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLnJlZ2lzdGVyV29ya2Zsb3cgPSBmdW5jdGlvbiAod29ya2Zsb3csIGRlcHJlY2F0ZWQpIHtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgICBsZXQgZGVzYyA9IHRoaXMuX3JlZ2lzdHJ5LnJlZ2lzdGVyKHdvcmtmbG93LCBkZXByZWNhdGVkKTtcbiAgICBkZWJ1ZyhcIldvcmtmbG93IHJlZ2lzdGVyZWQuIG5hbWU6ICVzLCB2ZXJzaW9uOiAlc1wiLCBkZXNjLm5hbWUsIGRlc2MudmVyc2lvbik7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9pbml0aWFsaXplID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBpZiAoIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMud2FrZVVwT3B0aW9ucyAmJiB0aGlzLl9vcHRpb25zLndha2VVcE9wdGlvbnMuaW50ZXJ2YWwgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl93YWtlVXAgPSBuZXcgV2FrZVVwKHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcywgdGhpcy5fcGVyc2lzdGVuY2UsIHRoaXMuX29wdGlvbnMud2FrZVVwT3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl93YWtlVXAub24oXCJjb250aW51ZVwiLCBmdW5jdGlvbiAoaSkgeyBzZWxmLl9jb250aW51ZVdva2VVcEluc3RhbmNlKGkpOyB9KTtcbiAgICAgICAgICAgIHRoaXMuX3dha2VVcC5vbihcImVycm9yXCIsIGZ1bmN0aW9uIChlKSB7IHNlbGYub25XYXJuKGUpOyB9KTtcbiAgICAgICAgICAgIHRoaXMuX3dha2VVcC5zdGFydCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5zdG9wRGVwcmVjYXRlZFZlcnNpb25zID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUpIHtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgICBkZWJ1ZyhcIlN0b3BwaW5nIG91dGRhdGVkIHZlcnNpb25zIG9mIHdvcmtmbG93ICclcycuXCIsIHdvcmtmbG93TmFtZSk7XG5cbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IHJlbW92ZSA9IGZ1bmN0aW9uIChpbnN0YW5jZUlkKSB7XG4gICAgICAgIGxldCBrbm93bkluc3RhID0gc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldCh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgICAgICBpZiAoa25vd25JbnN0YSkge1xuICAgICAgICAgICAgZGVidWcoXCJSZW1vdmluZyBpbnN0YW5jZTogJXNcIiwgaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICBzZWxmLl9kZWxldGVXRkluc3RhbmNlKGtub3duSW5zdGEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGxldCBjb3VudCA9IDA7XG4gICAgbGV0IGN1cnJlbnRWZXJzaW9uID0gdGhpcy5fcmVnaXN0cnkuZ2V0Q3VycmVudFZlcnNpb24od29ya2Zsb3dOYW1lKTtcbiAgICBpZiAoY3VycmVudFZlcnNpb24pIHtcbiAgICAgICAgbGV0IG9sZFZlcnNpb25IZWFkZXJzID0geWllbGQgdGhpcy5fZ2V0UnVubmluZ0luc3RhbmNlSGVhZGVyc0Zvck90aGVyVmVyc2lvbih3b3JrZmxvd05hbWUsIGN1cnJlbnRWZXJzaW9uKTtcbiAgICAgICAgaWYgKG9sZFZlcnNpb25IZWFkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgZGVidWcoXCJUaGVyZSBpcyAlZCBvbGQgdmVyc2lvbiBydW5uaW5nLiBTdG9wcGluZyB0aGVtLlwiLCBvbGRWZXJzaW9uSGVhZGVycy5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaGVhZGVyIG9mIG9sZFZlcnNpb25IZWFkZXJzKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCJSZW1vdmluZyB3b3JrZmxvdyAnJXMnIG9mIHZlcnNpb24gJCVzIHdpdGggaWQ6ICclcycgZnJvbSBob3N0LlwiLCBoZWFkZXIud29ya2Zsb3dOYW1lLCBoZWFkZXIud29ya2Zsb3dWZXJzaW9uLCBoZWFkZXIuaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICAgICAgbGV0IGluc3RhbmNlSWQgPSBoZWFkZXIuaW5zdGFuY2VJZDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb2NrTmFtZSA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuZG91YmxlS2V5cyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvY2tJbmZvO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJMb2NraW5nIGluc3RhbmNlOiAlc1wiLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2tJbmZvID0geWllbGQgKHRoaXMuX3BlcnNpc3RlbmNlLmVudGVyTG9jayhsb2NrTmFtZSwgdGhpcy5vcHRpb25zLmVudGVyTG9ja1RpbWVvdXQsIHRoaXMuX2luTG9ja1RpbWVvdXQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBrZWVwTG9ja0FsaXZlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJMb2NrZWQ6ICVqXCIsIGxvY2tJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlID0gbmV3IEtlZXBMb2NrQWxpdmUodGhpcy5fcGVyc2lzdGVuY2UsIGxvY2tJbmZvLCB0aGlzLl9pbkxvY2tUaW1lb3V0LCB0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERvIHN0dWZmOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuX3BlcnNpc3RlbmNlLnJlbW92ZVN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCwgZmFsc2UsIFwiU1RPUFBFRC5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlKGluc3RhbmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIlJlbW92ZWQ6ICVzXCIsIGluc3RhbmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkVycm9yOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVW5sb2NrOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiVW5sb2NraW5nLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2VlcExvY2tBbGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmUoaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiRXJyb3I6ICVzXCIsIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoYENhbm5vdCBzdG9wIGluc3RhbmNlIG9mIHdvcmtmbG93ICcke3dvcmtmbG93TmFtZX0nIG9mIHZlcnNpb24gJHtoZWFkZXIud29ya2Zsb3dWZXJzaW9ufSB3aXRoIGlkOiAnJHtpbnN0YW5jZUlkfScgYmVjYXVzZSBvZiBhbiBpbnRlcm5hbCBlcnJvcjogJHtlLnN0YWNrfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGVidWcoXCJUaGVyZSBpcyBubyB3b3JrZmxvdyByZWdpc3RlcmVkIGJ5IG5hbWUgJyVzJy5cIiwgd29ya2Zsb3dOYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvdW50O1xufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuaW52b2tlTWV0aG9kID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgICBkZWJ1ZyhcIkludm9raW5nIG1ldGhvZDogJyVzJyBvZiB3b3JrZmxvdzogJyVzJyBieSBhcmd1bWVudHMgJyVqJ1wiLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpO1xuXG4gICAgaWYgKCFfKHdvcmtmbG93TmFtZSkuaXNTdHJpbmcoKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ3dvcmtmbG93TmFtZScgaXMgbm90IGEgc3RyaW5nLlwiKTtcbiAgICB9XG4gICAgd29ya2Zsb3dOYW1lID0gd29ya2Zsb3dOYW1lLnRyaW0oKTtcbiAgICBpZiAoIV8obWV0aG9kTmFtZSkuaXNTdHJpbmcoKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ21ldGhvZE5hbWUnIGlzIG5vdCBhIHN0cmluZy5cIik7XG4gICAgfVxuICAgIG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lLnRyaW0oKTtcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChhcmdzKSAmJiAhXy5pc0FycmF5KGFyZ3MpKSB7XG4gICAgICAgIGFyZ3MgPSBbYXJnc107XG4gICAgfVxuXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5faW5pdGlhbGl6ZSgpO1xuXG4gICAgbGV0IGluc3RhbmNlSWQgPSBudWxsO1xuICAgIGxldCBjcmVhdGFibGUgPSBudWxsO1xuXG4gICAgbGV0IHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGxldCBpbmZvIG9mIHNlbGYuX3JlZ2lzdHJ5Lm1ldGhvZEluZm9zKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSkpIHtcbiAgICAgICAgbGV0IHRyeUlkID0gc2VsZi5faW5zdGFuY2VJZFBhcnNlci5wYXJzZShpbmZvLmluc3RhbmNlSWRQYXRoLCBhcmdzKTtcbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHRyeUlkKSkge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaW5mbzogaW5mbyxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHRyeUlkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAgICAgICBkZWJ1ZyhcIlBvc3NpYmxlIG1ldGhvZHM6ICVqXCIsXG4gICAgICAgICAgICBfKHJlc3VsdHMpXG4gICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3c6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByLmluZm8ud29ya2Zsb3cubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiByLmluZm8udmVyc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiByLmlkXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudG9BcnJheSgpKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHJlc3VsdHNbaV07XG4gICAgICAgIC8vIFRoYXQgZmluZHMgdGhlIGxhdGVzdCB2ZXJzaW9uOlxuICAgICAgICBpZiAocmVzdWx0LmluZm8uY2FuQ3JlYXRlSW5zdGFuY2UgJiYgIXJlc3VsdC5pbmZvLmRlcHJlY2F0ZWQpIHtcbiAgICAgICAgICAgIGNyZWF0YWJsZSA9IHJlc3VsdC5pbmZvO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRoYXQgZmluZHMgYSBydW5uaW5nIGluc3RhbmNlIHdpdGggdGhlIGlkOlxuICAgICAgICBpZiAoXy5pc051bGwoaW5zdGFuY2VJZCkgJiYgKHlpZWxkIHNlbGYuX2NoZWNrSWZJbnN0YW5jZVJ1bm5pbmcod29ya2Zsb3dOYW1lLCByZXN1bHQuaWQpKSkge1xuICAgICAgICAgICAgaW5zdGFuY2VJZCA9IHJlc3VsdC5pZDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGluc3RhbmNlSWQpIHtcbiAgICAgICAgZGVidWcoXCJGb3VuZCBhIGNvbnRpbnVhYmxlIGluc3RhbmNlIGlkOiAlcy4gSW52b2tpbmcgbWV0aG9kIG9uIHRoYXQuXCIsIGluc3RhbmNlSWQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGlyID0geWllbGQgKHNlbGYuX2ludm9rZU1ldGhvZE9uUnVubmluZ0luc3RhbmNlKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgZGVidWcoXCJJbnZva2UgY29tcGxldGVkLCByZXN1bHQ6ICVqXCIsIGlyKTtcbiAgICAgICAgICAgIHJldHVybiBpcjtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZGVidWcoXCJJbnZva2UgZmFpbGVkOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoY3JlYXRhYmxlKSB7XG4gICAgICAgIGRlYnVnKFwiRm91bmQgYSBjcmVhdGFibGUgd29ya2Zsb3cgKG5hbWU6ICclcycsIHZlcnNpb246ICclcycpLCBpbnZva2luZyBhIGNyZWF0ZSBtZXRob2Qgb24gdGhhdC5cIiwgY3JlYXRhYmxlLndvcmtmbG93Lm5hbWUsIGNyZWF0YWJsZS52ZXJzaW9uKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBjciA9IHlpZWxkIChzZWxmLl9jcmVhdGVJbnN0YW5jZUFuZEludm9rZU1ldGhvZChjcmVhdGFibGUud29ya2Zsb3csIGNyZWF0YWJsZS52ZXJzaW9uLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICBkZWJ1ZyhcIkNyZWF0ZSBjb21wbGV0ZWQsIHJlc3VsdDogJWpcIiwgY3IpO1xuICAgICAgICAgICAgcmV0dXJuIGNyO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkNyZWF0ZSBmYWlsZWQ6ICVzXCIsIGUuc3RhY2spO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGVidWcoXCJObyBjb250aW51YWJsZSB3b3JrZmxvd3MgaGF2ZSBiZWVuIGZvdW5kLlwiKTtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5NZXRob2RJc05vdEFjY2Vzc2libGVFcnJvcihcIkNhbm5vdCBjcmVhdGUgb3IgY29udGludWUgd29ya2Zsb3cgJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGJ5IGNhbGxpbmcgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgIH1cbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jcmVhdGVJbnN0YW5jZUFuZEludm9rZU1ldGhvZCA9IGFzeW5jKGZ1bmN0aW9uKiAod29ya2Zsb3csIHdvcmtmbG93VmVyc2lvbiwgbWV0aG9kTmFtZSwgYXJncykge1xuICAgIGxldCB3b3JrZmxvd05hbWUgPSB3b3JrZmxvdy5uYW1lO1xuXG4gICAgbGV0IGxvY2tJbmZvID0gbnVsbDtcblxuICAgIGlmICghdGhpcy5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgbGV0IGluc3RhID0gdGhpcy5fY3JlYXRlV0ZJbnN0YW5jZSgpO1xuICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGluc3RhLmNyZWF0ZSh3b3JrZmxvdywgd29ya2Zsb3dWZXJzaW9uLCBtZXRob2ROYW1lLCBhcmdzLCBsb2NrSW5mbykpO1xuICAgICAgICB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuYWRkKHdvcmtmbG93TmFtZSwgaW5zdGEpO1xuICAgICAgICB0aGlzLm9uU3RhcnQoaW5zdGEsIG1ldGhvZE5hbWUsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbG9ja0luZm8gPSB7XG4gICAgICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgICBoZWxkVG86IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gV2hlbiBsb2NrIHdpbGwgaGVsZCwgdGhlbiB3ZSBzaG91bGQga2VlcCBpdCBhbGl2ZTpcbiAgICAgICAgbGV0IGtlZXBMb2NrQWxpdmUgPSBuZXcgS2VlcExvY2tBbGl2ZSh0aGlzLl9wZXJzaXN0ZW5jZSwgbG9ja0luZm8sIHRoaXMuX2luTG9ja1RpbWVvdXQsIHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGluc3RhID0gdGhpcy5fY3JlYXRlV0ZJbnN0YW5jZSgpO1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChpbnN0YS5jcmVhdGUod29ya2Zsb3csIHdvcmtmbG93VmVyc2lvbiwgbWV0aG9kTmFtZSwgYXJncywgbG9ja0luZm8pKTtcblxuICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuYWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcy5hZGQod29ya2Zsb3dOYW1lLCBpbnN0YSk7XG5cbiAgICAgICAgICAgICAgICAvLyBQZXJzaXN0IGFuZCB1bmxvY2s6XG4gICAgICAgICAgICAgICAgbGV0IGVyciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5fcGVyc2lzdGVuY2UucGVyc2lzdFN0YXRlKGluc3RhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN0YXJ0KGluc3RhLCBtZXRob2ROYW1lLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJDYW5ub3QgcGVyc2lzdCBpbnN0YW5jZSBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyID0gZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5fcGVyc2lzdGVuY2UuZXhpdExvY2sobG9ja0luZm8uaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBleGl0IGxvY2sgb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25XYXJuKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fdGhyb3dJZlJlY292ZXJhYmxlID0gZnVuY3Rpb24gKGVycm9yLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IpIHtcbiAgICAgICAgZGVidWcoXCJNZXRob2QgJyVzJyBvZiB3b3JrZmxvdyAnJXMnIGlzIG5vdCBhY2Nlc3NpYmxlIGF0IHRoZSBjdXJyZW50IHN0YXRlLCBiYWNhdXNlIGl0IG1pZ2h0IGJlIHN0ZXBwZWQgb24gYW5vdGhlciBpbnN0YW5jZSB0byBhbm90aGVyIHN0YXRlIHRoYSBpcyBleGlzdHMgYXQgY3VycmVudCBpbiB0aGlzIGhvc3QuIENsaWVudCBzaG91bGQgcmV0cnkuXCIsIG1ldGhvZE5hbWUsIHdvcmtmbG93TmFtZSk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2ludm9rZU1ldGhvZE9uUnVubmluZ0luc3RhbmNlID0gYXN5bmMoZnVuY3Rpb24qIChpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgIGxldCBpbnN0YSA9IHlpZWxkIChzZWxmLl92ZXJpZnlBbmRSZXN0b3JlSW5zdGFuY2VTdGF0ZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY2FsbE1ldGhvZChtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5hY3Rpdml0eVN0YXRlcy5pZGxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkludm9rZShpbnN0YSwgbWV0aG9kTmFtZSwgYXJncywgdHJ1ZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuYWN0aXZpdHlTdGF0ZXMuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9kZWxldGVXRkluc3RhbmNlKGluc3RhKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uSW52b2tlKGluc3RhLCBtZXRob2ROYW1lLCBhcmdzLCBmYWxzZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVuZChpbnN0YSwgZmFsc2UsIG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLldvcmtmbG93RXJyb3IoXCJJbnN0YW5jZSAnXCIgKyBpbnN0YS5pZCArIFwiJyBpcyBpbiBhbiBpbnZhbGlkIHN0YXRlICdcIiArIGluc3RhLmV4ZWNTdGF0ZSArIFwiJyBhZnRlciBpbnZvY2F0aW9uIG9mIHRoZSBtZXRob2QgJ1wiICsgbWV0aG9kTmFtZSArIFwiJy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Rocm93SWZSZWNvdmVyYWJsZShlLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUpO1xuICAgICAgICAgICAgc2VsZi5fZGVsZXRlV0ZJbnN0YW5jZShpbnN0YSk7XG4gICAgICAgICAgICB0aGlzLm9uSW52b2tlKGluc3RhLCBtZXRob2ROYW1lLCBhcmdzLCBmYWxzZSwgZSk7XG4gICAgICAgICAgICB0aGlzLm9uRW5kKGluc3RhLCBmYWxzZSwgZSk7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBMb2NrIGl0OlxuICAgICAgICBsZXQgbG9ja05hbWUgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmRvdWJsZUtleXMod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgbGV0IGxvY2tJbmZvO1xuICAgICAgICBsZXQga2VlcExvY2tBbGl2ZSA9IG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkxvY2tpbmcgaW5zdGFuY2UuXCIpO1xuICAgICAgICAgICAgbG9ja0luZm8gPSB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UuZW50ZXJMb2NrKGxvY2tOYW1lLCBzZWxmLm9wdGlvbnMuZW50ZXJMb2NrVGltZW91dCwgc2VsZi5faW5Mb2NrVGltZW91dCkpO1xuICAgICAgICAgICAgZGVidWcoXCJMb2NrZWQ6ICVqXCIsIGxvY2tJbmZvKTtcblxuICAgICAgICAgICAgLy8gV2hlbiBsb2NrIHdpbGwgaGVsZCwgdGhlbiB3ZSBzaG91bGQga2VlcCBpdCBhbGl2ZTpcbiAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUgPSBuZXcgS2VlcExvY2tBbGl2ZShzZWxmLl9wZXJzaXN0ZW5jZSwgbG9ja0luZm8sIHNlbGYuX2luTG9ja1RpbWVvdXQsIHNlbGYub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQpO1xuXG4gICAgICAgICAgICAvLyBMT0NLRURcbiAgICAgICAgICAgIGxldCBpbnN0YSA9IHlpZWxkIChzZWxmLl92ZXJpZnlBbmRSZXN0b3JlSW5zdGFuY2VTdGF0ZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpKTtcbiAgICAgICAgICAgIGxldCBlbmRXaXRoRXJyb3IgPSBhc3luYyhmdW5jdGlvbiooZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2RlbGV0ZVdGSW5zdGFuY2UoaW5zdGEpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5yZW1vdmVTdGF0ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkLCBmYWxzZSwgZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAocmVtb3ZlRSkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCByZW1vdmUgc3RhdGUgb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgcmVtb3ZlRS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25XYXJuKHJlbW92ZUUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLm9uSW52b2tlKGluc3RhLCBtZXRob2ROYW1lLCBhcmdzLCBmYWxzZSwgZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5vbkVuZChpbnN0YSwgZmFsc2UsIGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCBwZXJzaXN0QW5kVW5sb2NrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fcGVyc2lzdGVuY2UucGVyc2lzdFN0YXRlKGluc3RhKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiVW5sb2NraW5nOiAlalwiLCBsb2NrSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIlVubG9ja2VkLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IGV4aXQgbG9jayBmb3Igd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uV2FybihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY2FsbE1ldGhvZChtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuYWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBQZXJzaXN0IGFuZCB1bmxvY2s6XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm9wdGlvbnMubGF6eVBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcnNpc3RBbmRVbmxvY2soKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uSW52b2tlKGluc3RhLCBtZXRob2ROYW1lLCBhcmdzLCB0cnVlLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kV2l0aEVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgcGVyc2lzdEFuZFVubG9jaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkludm9rZShpbnN0YSwgbWV0aG9kTmFtZSwgYXJncywgdHJ1ZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLmFjdGl2aXR5U3RhdGVzLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2RlbGV0ZVdGSW5zdGFuY2UoaW5zdGEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uSW52b2tlKGluc3RhLCBtZXRob2ROYW1lLCBhcmdzLCBmYWxzZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FbmQoaW5zdGEsIGZhbHNlLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgc2VsZi5fcGVyc2lzdGVuY2UucmVtb3ZlU3RhdGUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IHJlbW92ZSBzdGF0ZSBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uV2FybihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IGV4aXQgbG9jayBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyBlLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uV2FybihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkluc3RhbmNlICdcIiArIGluc3RhLmlkICsgXCInIGlzIGluIGFuIGludmFsaWQgc3RhdGUgJ1wiICsgaW5zdGEuZXhlY1N0YXRlICsgXCInIGFmdGVyIGludm9jYXRpb24gb2YgdGhlIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Rocm93SWZSZWNvdmVyYWJsZShlLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUpO1xuICAgICAgICAgICAgICAgIHlpZWxkIGVuZFdpdGhFcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoa2VlcExvY2tBbGl2ZSkge1xuICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG9ja0luZm8pIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5leGl0TG9jayhsb2NrSW5mby5pZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChleGl0RSkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNhbm5vdCBleGl0IGxvY2sgJ1wiICsgbG9ja0luZm8uaWQgKyBcIic6XFxuXCIgKyBleGl0RS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25XYXJuKGV4aXRFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5UaW1lb3V0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICBsZXQgbXNnID0gXCJDYW5ub3QgY2FsbCBtZXRob2Qgb2Ygd29ya2Zsb3cgJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInLCBiZWNhdXNlICdcIiArIG1ldGhvZE5hbWUgKyBcIicgaXMgbG9ja2VkLlwiO1xuICAgICAgICAgICAgICAgIGRlYnVnKG1zZyk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5NZXRob2RJc05vdEFjY2Vzc2libGVFcnJvcihtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9lbnRlckxvY2tGb3JDcmVhdGVkSW5zdGFuY2UgPSBhc3luYyhmdW5jdGlvbiogKGluc3RhLCBsb2NrSW5mbykge1xuICAgIGxldCBsaSA9IHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5lbnRlckxvY2soc3BlY1N0cmluZ3MuaG9zdGluZy5kb3VibGVLZXlzKGluc3RhLndvcmtmbG93TmFtZSwgaW5zdGEuaWQpLCB0aGlzLm9wdGlvbnMuZW50ZXJMb2NrVGltZW91dCwgdGhpcy5fZ2V0SW5Mb2NrVGltZW91dCgpKSk7XG4gICAgaWYgKHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5pc1J1bm5pbmcoaW5zdGEud29ya2Zsb3dOYW1lLCBpbnN0YS5pZCkpKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkNhbm5vdCBjcmVhdGUgaW5zdGFuY2Ugb2Ygd29ya2Zsb3cgJ1wiICsgaW5zdGEud29ya2Zsb3dOYW1lICsgXCInIGJ5IGlkICdcIiArIGluc3RhLmlkICsgXCInIGJlY2F1c2UgaXQncyBhbHJlYWR5IGV4aXN0cy5cIik7XG4gICAgfVxuICAgIGxvY2tJbmZvLmlkID0gbGkuaWQ7XG4gICAgbG9ja0luZm8ubmFtZSA9IGxpLm5hbWU7XG4gICAgbG9ja0luZm8uaGVsZFRvID0gbGkuaGVsZFRvO1xufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2dldEluTG9ja1RpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKyBNYXRoLm1heCh0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0ICogMC40LCAzMDAwKTtcbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX3ZlcmlmeUFuZFJlc3RvcmVJbnN0YW5jZVN0YXRlID0gYXN5bmMoZnVuY3Rpb24qIChpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IGluc3RhID0gbnVsbDtcbiAgICBpZiAoc2VsZi5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgbGV0IGhlYWRlciA9IHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5nZXRSdW5uaW5nSW5zdGFuY2VJZEhlYWRlcih3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKTtcbiAgICAgICAgaWYgKGhlYWRlcikge1xuICAgICAgICAgICAgaW5zdGEgPSB5aWVsZCAoc2VsZi5fcmVzdG9yZUluc3RhbmNlU3RhdGUoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBoZWFkZXIud29ya2Zsb3dWZXJzaW9uLCBoZWFkZXIudXBkYXRlZE9uKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGluc3RhID0gc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldCh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgIH1cbiAgICBpZiAoIWluc3RhKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dOb3RGb3VuZEVycm9yKGBXb3JmbG93IChuYW1lOiAnJHt3b3JrZmxvd05hbWV9JywgaWQ6ICcke2luc3RhbmNlSWR9JykgaGFzIGJlZW4gZGVsZXRlZCBzaW5jZSB0aGUgbG9jayBoYXMgYmVlbiB0YWtlbi5gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdGE7XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fcmVzdG9yZUluc3RhbmNlU3RhdGUgPSBhc3luYyhmdW5jdGlvbiogKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgd29ya2Zsb3dWZXJzaW9uLCBhY3R1YWxUaW1lc3RhbXApIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCByZXN0b3JlIGluc3RhbmNlIGZyb20gcGVyc2lzdGVuY2UsIGJlY2F1c2UgaG9zdCBoYXMgbm8gcGVyc2lzdGVuY2UgcmVnaXN0ZXJlZC5cIik7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhID0gc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldCh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKGluc3RhKSkge1xuICAgICAgICBsZXQgd2ZEZXNjID0gc2VsZi5fcmVnaXN0cnkuZ2V0RGVzYyh3b3JrZmxvd05hbWUsIHdvcmtmbG93VmVyc2lvbik7XG4gICAgICAgIGluc3RhID0gc2VsZi5fY3JlYXRlV0ZJbnN0YW5jZSgpO1xuICAgICAgICBpbnN0YS5zZXRXb3JrZmxvdyh3ZkRlc2Mud29ya2Zsb3csIHdvcmtmbG93VmVyc2lvbiwgaW5zdGFuY2VJZCk7XG4gICAgfVxuXG4gICAgaWYgKGluc3RhLnVwZGF0ZWRPbiA9PT0gbnVsbCB8fCBpbnN0YS51cGRhdGVkT24uZ2V0VGltZSgpICE9PSBhY3R1YWxUaW1lc3RhbXAuZ2V0VGltZSgpIHx8IHNlbGYub3B0aW9ucy5hbHdheXNMb2FkU3RhdGUpIHtcbiAgICAgICAgbGV0IHN0YXRlID0geWllbGQgKHNlbGYuX3BlcnNpc3RlbmNlLmxvYWRTdGF0ZSh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKTtcbiAgICAgICAgaW5zdGEucmVzdG9yZVN0YXRlKHN0YXRlKTtcbiAgICAgICAgcmV0dXJuIGluc3RhO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGluc3RhO1xuICAgIH1cbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jaGVja0lmSW5zdGFuY2VSdW5uaW5nID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpIHtcbiAgICBpZiAodGhpcy5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgcmV0dXJuICh5aWVsZCB0aGlzLl9wZXJzaXN0ZW5jZS5pc1J1bm5pbmcod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuZXhpc3RzKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fZ2V0UnVubmluZ0luc3RhbmNlSGVhZGVyc0Zvck90aGVyVmVyc2lvbiA9IGFzeW5jKGZ1bmN0aW9uKiAod29ya2Zsb3dOYW1lLCB2ZXJzaW9uKSB7XG4gICAgaWYgKHRoaXMuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgIHJldHVybiAoeWllbGQgdGhpcy5fcGVyc2lzdGVuY2UuZ2V0UnVubmluZ0luc3RhbmNlSGVhZGVyc0Zvck90aGVyVmVyc2lvbih3b3JrZmxvd05hbWUsIHZlcnNpb24pKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcy5nZXRSdW5uaW5nSW5zdGFuY2VIZWFkZXJzRm9yT3RoZXJWZXJzaW9uKHdvcmtmbG93TmFtZSwgdmVyc2lvbik7XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5hZGRUcmFja2VyID0gZnVuY3Rpb24gKHRyYWNrZXIpIHtcbiAgICB0aGlzLl92ZXJpZnkoKTtcblxuICAgIGlmICghXy5pc09iamVjdCh0cmFja2VyKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgaXMgbm90IGFuIG9iamVjdC5cIik7XG4gICAgfVxuICAgIHRoaXMuX3RyYWNrZXJzLnB1c2godHJhY2tlcik7XG4gICAgdGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmFkZFRyYWNrZXIodHJhY2tlcik7XG59O1xuXG4vKiBXYWtlIFVwKi9cblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fY29udGludWVXb2tlVXBJbnN0YW5jZSA9IGFzeW5jKGZ1bmN0aW9uKih3YWtldXBhYmxlKSB7XG4gICAgaWYgKHRoaXMuX3NodXRkb3duKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhc3NlcnQoXy5pc1BsYWluT2JqZWN0KHdha2V1cGFibGUpKTtcbiAgICBhc3NlcnQoXy5pc1N0cmluZyh3YWtldXBhYmxlLmluc3RhbmNlSWQpKTtcbiAgICBhc3NlcnQoXy5pc1N0cmluZyh3YWtldXBhYmxlLndvcmtmbG93TmFtZSkpO1xuICAgIGFzc2VydChfLmlzUGxhaW5PYmplY3Qod2FrZXVwYWJsZS5hY3RpdmVEZWxheSkpO1xuICAgIGFzc2VydChfLmlzU3RyaW5nKHdha2V1cGFibGUuYWN0aXZlRGVsYXkubWV0aG9kTmFtZSkpO1xuICAgIGFzc2VydChfLmlzRGF0ZSh3YWtldXBhYmxlLmFjdGl2ZURlbGF5LmRlbGF5VG8pKTtcbiAgICBhc3NlcnQoXy5pc0Z1bmN0aW9uKHdha2V1cGFibGUucmVzdWx0LnJlc29sdmUpKTtcbiAgICBhc3NlcnQoXy5pc0Z1bmN0aW9uKHdha2V1cGFibGUucmVzdWx0LnJlamVjdCkpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgLy9pbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIG1ldGhvZE5hbWUsIGFyZ3NcbiAgICAgICAgZGVidWcoXCJJbnZva2luZyBEZWxheVRvIGluc3RhbmNlSWQ6ICVzLCB3b3JrZmxvd05hbWU6JXMsIG1ldGhvZE5hbWU6ICVzXCIsIHdha2V1cGFibGUuaW5zdGFuY2VJZCwgd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsIHdha2V1cGFibGUuYWN0aXZlRGVsYXkubWV0aG9kTmFtZSk7XG4gICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCB0aGlzLl9pbnZva2VNZXRob2RPblJ1bm5pbmdJbnN0YW5jZSh3YWtldXBhYmxlLmluc3RhbmNlSWQsIHdha2V1cGFibGUud29ya2Zsb3dOYW1lLCB3YWtldXBhYmxlLmFjdGl2ZURlbGF5Lm1ldGhvZE5hbWUsIFt3YWtldXBhYmxlLmluc3RhbmNlSWQsIHdha2V1cGFibGUuYWN0aXZlRGVsYXkuZGVsYXlUb10pO1xuICAgICAgICBkZWJ1ZyhcIkRlbGF5VG8gaW5zdGFuY2VJZDogJXMsIHdvcmtmbG93TmFtZTolcywgbWV0aG9kTmFtZTogJXMgaW52b2tlZC5cIiwgd2FrZXVwYWJsZS5pbnN0YW5jZUlkLCB3YWtldXBhYmxlLndvcmtmbG93TmFtZSwgd2FrZXVwYWJsZS5hY3RpdmVEZWxheS5tZXRob2ROYW1lKTtcbiAgICAgICAgd2FrZXVwYWJsZS5yZXN1bHQucmVzb2x2ZSgpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIGVycm9ycy5NZXRob2RJc05vdEFjY2Vzc2libGVFcnJvciB8fCBlIGluc3RhbmNlb2YgZXJyb3JzLldvcmtmbG93Tm90Rm91bmRFcnJvcikge1xuICAgICAgICAgICAgZGVidWcoXCJEZWxheVRvJ3MgbWV0aG9kIGlzIG5vdCBhY2Nlc3NpYmxlIHNpbmNlIGl0IGdvdCBzZWxlY3RlZCBmb3IgY29udGludWF0aW9uLlwiKTtcbiAgICAgICAgICAgIHdha2V1cGFibGUucmVzdWx0LnJlc29sdmUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkZWJ1ZyhcIkRlbGF5VG8gaW5zdGFuY2VJZDogJXMsIHdvcmtmbG93TmFtZTolcywgbWV0aG9kTmFtZTogJXMgZXJyb3I6ICVzXCIsIHdha2V1cGFibGUuaW5zdGFuY2VJZCwgd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsIHdha2V1cGFibGUuYWN0aXZlRGVsYXkubWV0aG9kTmFtZSwgZS5zdGFjayk7XG4gICAgICAgIHdha2V1cGFibGUucmVzdWx0LnJlamVjdChlKTtcbiAgICB9XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fY3JlYXRlV0ZJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IGluc3RhID0gbmV3IFdvcmtmbG93SW5zdGFuY2UodGhpcyk7XG4gICAgaW5zdGEub24oXG4gICAgICAgIGVudW1zLmV2ZW50cy53b3JrZmxvd0V2ZW50LFxuICAgICAgICBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgc2VsZi5lbWl0KGVudW1zLmV2ZW50cy53b3JrZmxvd0V2ZW50LCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIGluc3RhO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fZGVsZXRlV0ZJbnN0YW5jZSA9IGZ1bmN0aW9uIChpbnN0YSkge1xuICAgIGluc3RhLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgIHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUoaW5zdGEud29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XG59O1xuXG4vKiBTaHV0ZG93biAqL1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl92ZXJpZnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX3NodXRkb3duKSB7XG4gICAgICAgIHRocm93IG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIldvcmtmbG93IGhvc3QgaGFzIGJlZW4gc2h1dCBkb3duLlwiKTtcbiAgICB9XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLnNodXRkb3duID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9zaHV0ZG93bikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl93YWtlVXApIHtcbiAgICAgICAgdGhpcy5fd2FrZVVwLnN0b3AoKTtcbiAgICB9XG4gICAgdGhpcy5fc2h1dGRvd24gPSB0cnVlO1xuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmtmbG93SG9zdDtcbiJdfQ==
