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
WorkflowHost.prototype.onWorkflowEvent = function(args) {
  this.emit(WorkflowHost.events.workflowEvent, args);
};
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
WorkflowHost.prototype.onInvoke = function(instance, methodName, args, result, idle, error) {
  this.emit(WorkflowHost.events.invoke, {
    instance: instance,
    methodName: methodName,
    args: args,
    idle: idle,
    error: error
  });
};
WorkflowHost.prototype.onEnd = function(instance, result, cancelled, error) {
  this.emit(WorkflowHost.events.end, {
    instance: instance,
    result: result,
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
  return this.registerWorkflow(workflow, true);
};
WorkflowHost.prototype.registerWorkflow = function(workflow, deprecated) {
  this._verify();
  var desc = this._registry.register(workflow, deprecated);
  debug("Workflow registered. name: %s, version: %s", desc.name, desc.version);
  return desc.version;
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
WorkflowHost.prototype.stop = async($traceurRuntime.initGeneratorFunction(function $__13(workflowName, instanceId) {
  var self,
      remove,
      lockName,
      lockInfo,
      keepLockAlive,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          remove = function(instanceId) {
            var knownInsta = self._knownRunningInstances.get(workflowName, instanceId);
            if (knownInsta) {
              debug("Removing instance: %s", instanceId);
              self._deleteWFInstance(knownInsta);
              self.onEnd(knownInsta, undefined, true);
            }
          };
          debug("Stopping workflow '%s' with id: '%s'.", workflowName, instanceId);
          $ctx.state = 47;
          break;
        case 47:
          $ctx.pushTry(37, null);
          $ctx.state = 40;
          break;
        case 40:
          $ctx.state = (this._persistence) ? 30 : 34;
          break;
        case 30:
          lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
          debug("Locking instance: %s", instanceId);
          $ctx.state = 31;
          break;
        case 31:
          $ctx.state = 2;
          return (this._persistence.enterLock(lockName, this.options.enterLockTimeout, this._inLockTimeout));
        case 2:
          lockInfo = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          keepLockAlive = null;
          $ctx.state = 33;
          break;
        case 33:
          $ctx.pushTry(19, 20);
          $ctx.state = 22;
          break;
        case 22:
          debug("Locked: %j", lockInfo);
          keepLockAlive = new KeepLockAlive(this._persistence, lockInfo, this._inLockTimeout, this.options.lockRenewalTimeout);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return this._persistence.removeState(workflowName, instanceId, false, "STOPPED.");
        case 6:
          $ctx.maybeThrow();
          $ctx.state = 8;
          break;
        case 8:
          remove(instanceId);
          debug("Removed: %s", instanceId);
          $ctx.state = 12;
          break;
        case 12:
          $ctx.popTry();
          $ctx.state = 20;
          $ctx.finallyFallThrough = 24;
          break;
        case 19:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 25;
          break;
        case 25:
          debug("Error: %s", e.stack);
          throw e;
          $ctx.state = 20;
          $ctx.finallyFallThrough = 24;
          break;
        case 20:
          $ctx.popTry();
          $ctx.state = 29;
          break;
        case 29:
          debug("Unlocking.");
          if (keepLockAlive) {
            keepLockAlive.end();
          }
          $ctx.state = 18;
          break;
        case 18:
          $ctx.state = 14;
          return this._persistence.exitLock(lockInfo.id);
        case 14:
          $ctx.maybeThrow();
          $ctx.state = 16;
          break;
        case 34:
          remove(instanceId);
          $ctx.state = 24;
          break;
        case 24:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 37:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 43;
          break;
        case 43:
          debug("Error: %s", e.stack);
          throw new errors.WorkflowError(("Cannot stop instance of workflow '" + workflowName + "' with id: '" + instanceId + "' because of an internal error:\n" + e.stack));
          $ctx.state = -2;
          break;
        case 16:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__13, this);
}));
WorkflowHost.prototype.stopDeprecatedVersions = async($traceurRuntime.initGeneratorFunction(function $__14(workflowName) {
  var count,
      currentVersion,
      oldVersionHeaders,
      $__5,
      $__6,
      $__7,
      $__3,
      $__2,
      header,
      $__8;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          this._verify();
          debug("Stopping outdated versions of workflow '%s'.", workflowName);
          count = 0;
          currentVersion = this._registry.getCurrentVersion(workflowName);
          $ctx.state = 38;
          break;
        case 38:
          $ctx.state = (currentVersion) ? 1 : 32;
          break;
        case 1:
          $ctx.state = 2;
          return this._getRunningInstanceHeadersForOtherVersion(workflowName, currentVersion);
        case 2:
          oldVersionHeaders = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = (oldVersionHeaders.length) ? 29 : 21;
          break;
        case 29:
          debug("There is %d old version running. Stopping them.", oldVersionHeaders.length);
          $__5 = true;
          $__6 = false;
          $__7 = undefined;
          $ctx.state = 30;
          break;
        case 30:
          $ctx.pushTry(16, 17);
          $ctx.state = 19;
          break;
        case 19:
          $__3 = void 0, $__2 = (oldVersionHeaders)[$traceurRuntime.toProperty(Symbol.iterator)]();
          $ctx.state = 15;
          break;
        case 15:
          $ctx.state = (!($__5 = ($__3 = $__2.next()).done)) ? 11 : 13;
          break;
        case 8:
          $__5 = true;
          $ctx.state = 15;
          break;
        case 11:
          header = $__3.value;
          $ctx.state = 12;
          break;
        case 12:
          debug("Stopping workflow '%s' of version '%s' with id: '%s'.", header.workflowName, header.workflowVersion, header.instanceId);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return this.stop(workflowName, header.instanceId);
        case 6:
          $ctx.maybeThrow();
          $ctx.state = 8;
          break;
        case 13:
          $ctx.popTry();
          $ctx.state = 17;
          $ctx.finallyFallThrough = 21;
          break;
        case 16:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          $__8 = $ctx.storedException;
          $ctx.state = 22;
          break;
        case 22:
          $__6 = true;
          $__7 = $__8;
          $ctx.state = 17;
          $ctx.finallyFallThrough = 21;
          break;
        case 17:
          $ctx.popTry();
          $ctx.state = 28;
          break;
        case 28:
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
          $ctx.state = 26;
          break;
        case 32:
          debug("There is no workflow registered by name '%s'.", workflowName);
          $ctx.state = 21;
          break;
        case 21:
          $ctx.returnValue = count;
          $ctx.state = -2;
          break;
        case 26:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__14, this);
}));
WorkflowHost.prototype.invokeMethod = async($traceurRuntime.initGeneratorFunction(function $__15(workflowName, methodName, args) {
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
      $__16,
      $__17,
      $__18,
      $__19,
      $__20,
      $__21,
      $__22,
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
                  name: r.info.execContext.rootActivity.name,
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
          $__16 = _.isNull;
          $__17 = $__16.call(_, instanceId);
          $ctx.state = 13;
          break;
        case 13:
          $ctx.state = ($__17) ? 5 : 9;
          break;
        case 5:
          $__18 = self._checkIfInstanceRunning;
          $__19 = result.id;
          $__20 = $__18.call(self, workflowName, $__19);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__20;
        case 2:
          $__21 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $__22 = $__21;
          $ctx.state = 8;
          break;
        case 9:
          $__22 = $__17;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__22) ? 16 : 15;
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
          debug("Found a creatable workflow (name: '%s', version: '%s'), invoking a create method on that.", creatable.execContext.rootActivity.name, creatable.version);
          $ctx.state = 61;
          break;
        case 61:
          $ctx.pushTry(51, null);
          $ctx.state = 54;
          break;
        case 54:
          $ctx.state = 44;
          return (self._createInstanceAndInvokeMethod(creatable.execContext, creatable.version, methodName, args));
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
          throw new errors.MethodNotFoundError("Cannot create or continue workflow '" + workflowName + "' by calling method '" + methodName + "'.");
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__15, this);
}));
WorkflowHost.prototype._createInstanceAndInvokeMethod = async($traceurRuntime.initGeneratorFunction(function $__23(execContext, workflowVersion, methodName, args) {
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
          workflowName = execContext.rootActivity.name;
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
          return (insta.create(execContext, workflowVersion, methodName, args, lockInfo));
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
          return (insta$__9.create(execContext, workflowVersion, methodName, args, lockInfo));
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
  }, $__23, this);
}));
WorkflowHost.prototype._throwIfRecoverable = function(error, workflowName, methodName) {
  if (error instanceof errors.MethodIsNotAccessibleError) {
    debug("Method '%s' of workflow '%s' is not accessible at the current state, bacause it might be stepped on another instance to another state tha is exists at current in this host. Client should retry.", methodName, workflowName);
    throw error;
  }
};
WorkflowHost.prototype._invokeMethodOnRunningInstance = async($traceurRuntime.initGeneratorFunction(function $__24(instanceId, workflowName, methodName, args) {
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
          this.onInvoke(insta, methodName, args, result, true, null);
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
          this.onInvoke(insta, methodName, args, result, false, null);
          this.onEnd(insta, result, false, null);
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
          this.onInvoke(insta, methodName, args, undefined, false, e);
          this.onEnd(insta, undefined, false, e);
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
          endWithError = async($traceurRuntime.initGeneratorFunction(function $__25(e) {
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
                    self.onInvoke(insta$__11, methodName, args, undefined, false, e);
                    self.onEnd(insta$__11, undefined, false, e);
                    $ctx.state = -2;
                    break;
                  default:
                    return $ctx.end();
                }
            }, $__25, this);
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
              self.onInvoke(insta$__11, methodName, args, result$__12, true, null);
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
          this.onInvoke(insta$__11, methodName, args, result$__12, true, null);
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
          this.onInvoke(insta$__11, methodName, args, result$__12, false, null);
          this.onEnd(insta$__11, result$__12, false, null);
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
  }, $__24, this);
}));
WorkflowHost.prototype._enterLockForCreatedInstance = async($traceurRuntime.initGeneratorFunction(function $__25(insta, lockInfo) {
  var li,
      $__26,
      $__27,
      $__28,
      $__29,
      $__30,
      $__31;
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
          $__26 = this._persistence;
          $__27 = $__26.isRunning;
          $__28 = insta.workflowName;
          $__29 = insta.id;
          $__30 = $__27.call($__26, $__28, $__29);
          $ctx.state = 10;
          break;
        case 10:
          $ctx.state = 6;
          return $__30;
        case 6:
          $__31 = $ctx.sent;
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = ($__31) ? 11 : 12;
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
  }, $__25, this);
}));
WorkflowHost.prototype._getInLockTimeout = function() {
  return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
};
WorkflowHost.prototype._verifyAndRestoreInstanceState = async($traceurRuntime.initGeneratorFunction(function $__32(instanceId, workflowName, methodName, args) {
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
  }, $__32, this);
}));
WorkflowHost.prototype._restoreInstanceState = async($traceurRuntime.initGeneratorFunction(function $__33(instanceId, workflowName, workflowVersion, actualTimestamp) {
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
            insta.setWorkflow(wfDesc.execContext, workflowVersion, instanceId);
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
  }, $__33, this);
}));
WorkflowHost.prototype._checkIfInstanceRunning = async($traceurRuntime.initGeneratorFunction(function $__34(workflowName, instanceId) {
  var $__35,
      $__36,
      $__37,
      $__38;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (this._persistence) ? 5 : 8;
          break;
        case 5:
          $__35 = this._persistence;
          $__36 = $__35.isRunning;
          $__37 = $__36.call($__35, workflowName, instanceId);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__37;
        case 2:
          $__38 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.returnValue = $__38;
          $ctx.state = -2;
          break;
        case 8:
          $ctx.returnValue = this._knownRunningInstances.exists(workflowName, instanceId);
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__34, this);
}));
WorkflowHost.prototype._getRunningInstanceHeadersForOtherVersion = async($traceurRuntime.initGeneratorFunction(function $__39(workflowName, version) {
  var $__40,
      $__41,
      $__42,
      $__43;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (this._persistence) ? 5 : 8;
          break;
        case 5:
          $__40 = this._persistence;
          $__41 = $__40.getRunningInstanceHeadersForOtherVersion;
          $__42 = $__41.call($__40, workflowName, version);
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return $__42;
        case 2:
          $__43 = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.returnValue = $__43;
          $ctx.state = -2;
          break;
        case 8:
          $ctx.returnValue = this._knownRunningInstances.getRunningInstanceHeadersForOtherVersion(workflowName, version);
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__39, this);
}));
WorkflowHost.prototype.addTracker = function(tracker) {
  this._verify();
  if (!_.isObject(tracker)) {
    throw new TypeError("Argument is not an object.");
  }
  this._trackers.push(tracker);
  this._knownRunningInstances.addTracker(tracker);
};
WorkflowHost.prototype._continueWokeUpInstance = async($traceurRuntime.initGeneratorFunction(function $__44(wakeupable) {
  var result,
      e;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (this._shutdown) ? 3 : 2;
          break;
        case 3:
          wakeupable.result.resolve();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = -2;
          break;
        case 2:
          $ctx.state = (!this._persistence) ? 8 : 7;
          break;
        case 8:
          wakeupable.result.reject(new errors.WorkflowError("Handling Delays in host is not supported without persistence."));
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = -2;
          break;
        case 7:
          assert(_.isPlainObject(wakeupable));
          assert(_.isString(wakeupable.instanceId));
          assert(_.isString(wakeupable.workflowName));
          assert(_.isPlainObject(wakeupable.activeDelay));
          assert(_.isString(wakeupable.activeDelay.methodName));
          assert(_.isDate(wakeupable.activeDelay.delayTo));
          assert(_.isFunction(wakeupable.result.resolve));
          assert(_.isFunction(wakeupable.result.reject));
          $ctx.state = 34;
          break;
        case 34:
          $ctx.pushTry(26, null);
          $ctx.state = 29;
          break;
        case 29:
          debug("Invoking DelayTo instanceId: %s, workflowName:%s, methodName: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
          $ctx.state = 16;
          break;
        case 16:
          $ctx.state = 12;
          return this._invokeMethodOnRunningInstance(wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, [wakeupable.instanceId, wakeupable.activeDelay.delayTo]);
        case 12:
          result = $ctx.sent;
          $ctx.state = 14;
          break;
        case 14:
          debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s invoked.", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
          wakeupable.result.resolve();
          $ctx.state = 18;
          break;
        case 18:
          $ctx.popTry();
          $ctx.state = -2;
          break;
        case 26:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          e = $ctx.storedException;
          $ctx.state = 23;
          break;
        case 23:
          $ctx.state = (e instanceof errors.MethodIsNotAccessibleError || e instanceof errors.WorkflowNotFoundError) ? 21 : 20;
          break;
        case 21:
          debug("DelayTo's method is not accessible since it got selected for continuation.");
          wakeupable.result.resolve();
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = -2;
          break;
        case 20:
          debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s error: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, e.stack);
          wakeupable.result.reject(e);
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__44, this);
}));
WorkflowHost.prototype._createWFInstance = function() {
  var self = this;
  var insta = new WorkflowInstance(this);
  insta.on(enums.events.workflowEvent, function(args) {
    self.onWorkflowEvent(args);
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

//# sourceMappingURL=workflowHost.js.map
