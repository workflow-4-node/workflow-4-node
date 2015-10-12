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
          throw new errors.MethodNotFoundError("Cannot create or continue workflow '" + workflowName + "' by calling method '" + methodName + "'.");
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__15, this);
}));
WorkflowHost.prototype._createInstanceAndInvokeMethod = async($traceurRuntime.initGeneratorFunction(function $__23(workflow, workflowVersion, methodName, args) {
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
//# sourceMappingURL=data:application/json;base64,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QUN2QjtBQUFBLEFBQ0EsS0FBRyxVQUFVLEVBQUksS0FBRyxDQUFDO0FBQ3JCLEtBQUcsbUJBQW1CLEFBQUMsRUFBQyxDQUFDO0FBQzdCLENBQUM7QUFFRCxLQUFLLFFBQVEsRUFBSSxhQUFXLENBQUM7QUFDN0IiLCJmaWxlIjoiaG9zdGluZy93b3JrZmxvd0hvc3QuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5sZXQgV29ya2Zsb3dSZWdpc3RyeSA9IHJlcXVpcmUoXCIuL3dvcmtmbG93UmVnaXN0cnlcIik7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgQWN0aXZpdHkgPSByZXF1aXJlKFwiLi4vYWN0aXZpdGllcy9hY3Rpdml0eVwiKTtcbmxldCBXb3JrZmxvdyA9IHJlcXVpcmUoXCIuLi9hY3Rpdml0aWVzL3dvcmtmbG93XCIpO1xubGV0IFdvcmtmbG93UGVyc2lzdGVuY2UgPSByZXF1aXJlKFwiLi93b3JrZmxvd1BlcnNpc3RlbmNlXCIpO1xubGV0IFdvcmtmbG93SW5zdGFuY2UgPSByZXF1aXJlKFwiLi93b3JrZmxvd0luc3RhbmNlXCIpO1xubGV0IEluc3RhbmNlSWRQYXJzZXIgPSByZXF1aXJlKFwiLi9pbnN0YW5jZUlkUGFyc2VyXCIpO1xubGV0IGVudW1zID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lbnVtc1wiKTtcbmxldCBCbHVlYmlyZCA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcbmxldCBLbm93bkluc3RhU3RvcmUgPSByZXF1aXJlKFwiLi9rbm93bkluc3RhU3RvcmVcIik7XG5sZXQgc3BlY1N0cmluZ3MgPSByZXF1aXJlKFwiLi4vY29tbW9uL3NwZWNTdHJpbmdzXCIpO1xubGV0IGVycm9ycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZXJyb3JzXCIpO1xubGV0IFNlcmlhbGl6ZXIgPSByZXF1aXJlKFwiYmFja3BhY2stbm9kZVwiKS5zeXN0ZW0uU2VyaWFsaXplcjtcbmxldCBpcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vaXNcIik7XG5sZXQgS2VlcExvY2tBbGl2ZSA9IHJlcXVpcmUoXCIuL2tlZXBMb2NrQWxpdmVcIik7XG5sZXQgYXN5bmNIZWxwZXJzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9hc3luY0hlbHBlcnNcIik7XG5sZXQgYXN5bmMgPSBhc3luY0hlbHBlcnMuYXN5bmM7XG5sZXQgV2FrZVVwID0gcmVxdWlyZShcIi4vd2FrZVVwXCIpO1xubGV0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG5sZXQgZGVidWcgPSByZXF1aXJlKFwiZGVidWdcIikoXCJ3ZjRub2RlOldvcmtmbG93SG9zdFwiKTtcbmxldCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlcjtcbmxldCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5cbmZ1bmN0aW9uIFdvcmtmbG93SG9zdChvcHRpb25zKSB7XG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLl9vcHRpb25zID0gXy5leHRlbmQoXG4gICAgICAgIHtcbiAgICAgICAgICAgIGVudGVyTG9ja1RpbWVvdXQ6IDEwMDAwLFxuICAgICAgICAgICAgbG9ja1JlbmV3YWxUaW1lb3V0OiA1MDAwLFxuICAgICAgICAgICAgYWx3YXlzTG9hZFN0YXRlOiBmYWxzZSxcbiAgICAgICAgICAgIGxhenlQZXJzaXN0ZW5jZTogdHJ1ZSxcbiAgICAgICAgICAgIHBlcnNpc3RlbmNlOiBudWxsLFxuICAgICAgICAgICAgc2VyaWFsaXplcjogbnVsbCxcbiAgICAgICAgICAgIGVuYWJsZVByb21vdGlvbnM6IGZhbHNlLFxuICAgICAgICAgICAgd2FrZVVwT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGludGVydmFsOiA1MDAwLFxuICAgICAgICAgICAgICAgIGJhdGNoU2l6ZTogMTBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9yZWdpc3RyeSA9IG5ldyBXb3JrZmxvd1JlZ2lzdHJ5KHRoaXMuX29wdGlvbnMuc2VyaWFsaXplcik7XG4gICAgdGhpcy5fdHJhY2tlcnMgPSBbXTtcbiAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5faW5zdGFuY2VJZFBhcnNlciA9IG5ldyBJbnN0YW5jZUlkUGFyc2VyKCk7XG4gICAgdGhpcy5fcGVyc2lzdGVuY2UgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMucGVyc2lzdGVuY2UgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fcGVyc2lzdGVuY2UgPSBuZXcgV29ya2Zsb3dQZXJzaXN0ZW5jZSh0aGlzLl9vcHRpb25zLnBlcnNpc3RlbmNlKTtcbiAgICB9XG4gICAgdGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzID0gbmV3IEtub3duSW5zdGFTdG9yZSgpO1xuICAgIHRoaXMuX3dha2VVcCA9IG51bGw7XG4gICAgdGhpcy5fc2h1dGRvd24gPSBmYWxzZTtcbn1cblxudXRpbC5pbmhlcml0cyhXb3JrZmxvd0hvc3QsIEV2ZW50RW1pdHRlcik7XG5cbldvcmtmbG93SG9zdC5ldmVudHMgPSBlbnVtcy53b3JrZmxvd0V2ZW50cztcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5vbldvcmtmbG93RXZlbnQgPSBmdW5jdGlvbiAoYXJncykge1xuICAgIHRoaXMuZW1pdChXb3JrZmxvd0hvc3QuZXZlbnRzLndvcmtmbG93RXZlbnQsIGFyZ3MpO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5vbldhcm4gPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICB0aGlzLmVtaXQoV29ya2Zsb3dIb3N0LmV2ZW50cy53YXJuLCBlcnJvcik7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLm9uU3RhcnQgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICB0aGlzLmVtaXQoV29ya2Zsb3dIb3N0LmV2ZW50cy5zdGFydCwge1xuICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2UsXG4gICAgICAgIG1ldGhvZE5hbWU6IG1ldGhvZE5hbWUsXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICB9KTtcbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUub25JbnZva2UgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIG1ldGhvZE5hbWUsIGFyZ3MsIHJlc3VsdCwgaWRsZSwgZXJyb3IpIHtcbiAgICB0aGlzLmVtaXQoV29ya2Zsb3dIb3N0LmV2ZW50cy5pbnZva2UsIHtcbiAgICAgICAgaW5zdGFuY2U6IGluc3RhbmNlLFxuICAgICAgICBtZXRob2ROYW1lOiBtZXRob2ROYW1lLFxuICAgICAgICBhcmdzOiBhcmdzLFxuICAgICAgICBpZGxlOiBpZGxlLFxuICAgICAgICBlcnJvcjogZXJyb3JcbiAgICB9KTtcbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUub25FbmQgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIHJlc3VsdCwgY2FuY2VsbGVkLCBlcnJvcikge1xuICAgIHRoaXMuZW1pdChXb3JrZmxvd0hvc3QuZXZlbnRzLmVuZCwge1xuICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2UsXG4gICAgICAgIHJlc3VsdDogcmVzdWx0LFxuICAgICAgICBjYW5jZWxsZWQ6IGNhbmNlbGxlZCxcbiAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhcbiAgICBXb3JrZmxvd0hvc3QucHJvdG90eXBlLCB7XG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpc0luaXRpYWxpemVkOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faXNJbml0aWFsaXplZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaW5zdGFuY2VJZFBhcnNlcjoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlSWRQYXJzZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHBlcnNpc3RlbmNlOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcGVyc2lzdGVuY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9pbkxvY2tUaW1lb3V0OiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCArIE1hdGgubWF4KHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKiAwLjQsIDMwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUucmVnaXN0ZXJEZXByZWNhdGVkV29ya2Zsb3cgPSBmdW5jdGlvbiAod29ya2Zsb3cpIHtcbiAgICB0aGlzLnJlZ2lzdGVyV29ya2Zsb3cod29ya2Zsb3csIHRydWUpO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5yZWdpc3RlcldvcmtmbG93ID0gZnVuY3Rpb24gKHdvcmtmbG93LCBkZXByZWNhdGVkKSB7XG4gICAgdGhpcy5fdmVyaWZ5KCk7XG4gICAgbGV0IGRlc2MgPSB0aGlzLl9yZWdpc3RyeS5yZWdpc3Rlcih3b3JrZmxvdywgZGVwcmVjYXRlZCk7XG4gICAgZGVidWcoXCJXb3JrZmxvdyByZWdpc3RlcmVkLiBuYW1lOiAlcywgdmVyc2lvbjogJXNcIiwgZGVzYy5uYW1lLCBkZXNjLnZlcnNpb24pO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5faW5pdGlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCF0aGlzLl9pc0luaXRpYWxpemVkKSB7XG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLndha2VVcE9wdGlvbnMgJiYgdGhpcy5fb3B0aW9ucy53YWtlVXBPcHRpb25zLmludGVydmFsID4gMCkge1xuICAgICAgICAgICAgdGhpcy5fd2FrZVVwID0gbmV3IFdha2VVcCh0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMsIHRoaXMuX3BlcnNpc3RlbmNlLCB0aGlzLl9vcHRpb25zLndha2VVcE9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5fd2FrZVVwLm9uKFwiY29udGludWVcIiwgZnVuY3Rpb24gKGkpIHsgc2VsZi5fY29udGludWVXb2tlVXBJbnN0YW5jZShpKTsgfSk7XG4gICAgICAgICAgICB0aGlzLl93YWtlVXAub24oXCJlcnJvclwiLCBmdW5jdGlvbiAoZSkgeyBzZWxmLm9uV2FybihlKTsgfSk7XG4gICAgICAgICAgICB0aGlzLl93YWtlVXAuc3RhcnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuc3RvcCA9IGFzeW5jKGZ1bmN0aW9uKih3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgbGV0IHJlbW92ZSA9IGZ1bmN0aW9uIChpbnN0YW5jZUlkKSB7XG4gICAgICAgIGxldCBrbm93bkluc3RhID0gc2VsZi5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldCh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgICAgICBpZiAoa25vd25JbnN0YSkge1xuICAgICAgICAgICAgZGVidWcoXCJSZW1vdmluZyBpbnN0YW5jZTogJXNcIiwgaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICBzZWxmLl9kZWxldGVXRkluc3RhbmNlKGtub3duSW5zdGEpO1xuICAgICAgICAgICAgc2VsZi5vbkVuZChrbm93bkluc3RhLCB1bmRlZmluZWQsIHRydWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRlYnVnKFwiU3RvcHBpbmcgd29ya2Zsb3cgJyVzJyB3aXRoIGlkOiAnJXMnLlwiLCB3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHRoaXMuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICBsZXQgbG9ja05hbWUgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmRvdWJsZUtleXMod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgIGxldCBsb2NrSW5mbztcbiAgICAgICAgICAgIGRlYnVnKFwiTG9ja2luZyBpbnN0YW5jZTogJXNcIiwgaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICBsb2NrSW5mbyA9IHlpZWxkICh0aGlzLl9wZXJzaXN0ZW5jZS5lbnRlckxvY2sobG9ja05hbWUsIHRoaXMub3B0aW9ucy5lbnRlckxvY2tUaW1lb3V0LCB0aGlzLl9pbkxvY2tUaW1lb3V0KSk7XG4gICAgICAgICAgICBsZXQga2VlcExvY2tBbGl2ZSA9IG51bGw7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiTG9ja2VkOiAlalwiLCBsb2NrSW5mbyk7XG4gICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZSA9IG5ldyBLZWVwTG9ja0FsaXZlKHRoaXMuX3BlcnNpc3RlbmNlLCBsb2NrSW5mbywgdGhpcy5faW5Mb2NrVGltZW91dCwgdGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCk7XG5cbiAgICAgICAgICAgICAgICAvLyBEbyBzdHVmZjpcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLl9wZXJzaXN0ZW5jZS5yZW1vdmVTdGF0ZSh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQsIGZhbHNlLCBcIlNUT1BQRUQuXCIpO1xuICAgICAgICAgICAgICAgIHJlbW92ZShpbnN0YW5jZUlkKTtcblxuICAgICAgICAgICAgICAgIGRlYnVnKFwiUmVtb3ZlZDogJXNcIiwgaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiRXJyb3I6ICVzXCIsIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAvLyBVbmxvY2s6XG4gICAgICAgICAgICAgICAgZGVidWcoXCJVbmxvY2tpbmcuXCIpO1xuICAgICAgICAgICAgICAgIGlmIChrZWVwTG9ja0FsaXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGtlZXBMb2NrQWxpdmUuZW5kKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlbW92ZShpbnN0YW5jZUlkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBkZWJ1ZyhcIkVycm9yOiAlc1wiLCBlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKGBDYW5ub3Qgc3RvcCBpbnN0YW5jZSBvZiB3b3JrZmxvdyAnJHt3b3JrZmxvd05hbWV9JyB3aXRoIGlkOiAnJHtpbnN0YW5jZUlkfScgYmVjYXVzZSBvZiBhbiBpbnRlcm5hbCBlcnJvcjpcXG4ke2Uuc3RhY2t9YCk7XG4gICAgfVxufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuc3RvcERlcHJlY2F0ZWRWZXJzaW9ucyA9IGFzeW5jKGZ1bmN0aW9uKiAod29ya2Zsb3dOYW1lKSB7XG4gICAgdGhpcy5fdmVyaWZ5KCk7XG4gICAgZGVidWcoXCJTdG9wcGluZyBvdXRkYXRlZCB2ZXJzaW9ucyBvZiB3b3JrZmxvdyAnJXMnLlwiLCB3b3JrZmxvd05hbWUpO1xuXG5cblxuICAgIGxldCBjb3VudCA9IDA7XG4gICAgbGV0IGN1cnJlbnRWZXJzaW9uID0gdGhpcy5fcmVnaXN0cnkuZ2V0Q3VycmVudFZlcnNpb24od29ya2Zsb3dOYW1lKTtcbiAgICBpZiAoY3VycmVudFZlcnNpb24pIHtcbiAgICAgICAgbGV0IG9sZFZlcnNpb25IZWFkZXJzID0geWllbGQgdGhpcy5fZ2V0UnVubmluZ0luc3RhbmNlSGVhZGVyc0Zvck90aGVyVmVyc2lvbih3b3JrZmxvd05hbWUsIGN1cnJlbnRWZXJzaW9uKTtcbiAgICAgICAgaWYgKG9sZFZlcnNpb25IZWFkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgZGVidWcoXCJUaGVyZSBpcyAlZCBvbGQgdmVyc2lvbiBydW5uaW5nLiBTdG9wcGluZyB0aGVtLlwiLCBvbGRWZXJzaW9uSGVhZGVycy5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaGVhZGVyIG9mIG9sZFZlcnNpb25IZWFkZXJzKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCJTdG9wcGluZyB3b3JrZmxvdyAnJXMnIG9mIHZlcnNpb24gJyVzJyB3aXRoIGlkOiAnJXMnLlwiLCBoZWFkZXIud29ya2Zsb3dOYW1lLCBoZWFkZXIud29ya2Zsb3dWZXJzaW9uLCBoZWFkZXIuaW5zdGFuY2VJZCk7XG4gICAgICAgICAgICAgICAgeWllbGQgdGhpcy5zdG9wKHdvcmtmbG93TmFtZSwgaGVhZGVyLmluc3RhbmNlSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkZWJ1ZyhcIlRoZXJlIGlzIG5vIHdvcmtmbG93IHJlZ2lzdGVyZWQgYnkgbmFtZSAnJXMnLlwiLCB3b3JrZmxvd05hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gY291bnQ7XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5pbnZva2VNZXRob2QgPSBhc3luYyhmdW5jdGlvbiogKHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykge1xuICAgIHRoaXMuX3ZlcmlmeSgpO1xuICAgIGRlYnVnKFwiSW52b2tpbmcgbWV0aG9kOiAnJXMnIG9mIHdvcmtmbG93OiAnJXMnIGJ5IGFyZ3VtZW50cyAnJWonXCIsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncyk7XG5cbiAgICBpZiAoIV8od29ya2Zsb3dOYW1lKS5pc1N0cmluZygpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnd29ya2Zsb3dOYW1lJyBpcyBub3QgYSBzdHJpbmcuXCIpO1xuICAgIH1cbiAgICB3b3JrZmxvd05hbWUgPSB3b3JrZmxvd05hbWUudHJpbSgpO1xuICAgIGlmICghXyhtZXRob2ROYW1lKS5pc1N0cmluZygpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnbWV0aG9kTmFtZScgaXMgbm90IGEgc3RyaW5nLlwiKTtcbiAgICB9XG4gICAgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWUudHJpbSgpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGFyZ3MpICYmICFfLmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgYXJncyA9IFthcmdzXTtcbiAgICB9XG5cbiAgICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLl9pbml0aWFsaXplKCk7XG5cbiAgICBsZXQgaW5zdGFuY2VJZCA9IG51bGw7XG4gICAgbGV0IGNyZWF0YWJsZSA9IG51bGw7XG5cbiAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAobGV0IGluZm8gb2Ygc2VsZi5fcmVnaXN0cnkubWV0aG9kSW5mb3Mod29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lKSkge1xuICAgICAgICBsZXQgdHJ5SWQgPSBzZWxmLl9pbnN0YW5jZUlkUGFyc2VyLnBhcnNlKGluZm8uaW5zdGFuY2VJZFBhdGgsIGFyZ3MpO1xuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQodHJ5SWQpKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpbmZvOiBpbmZvLFxuICAgICAgICAgICAgICAgICAgICBpZDogdHJ5SWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICAgIGRlYnVnKFwiUG9zc2libGUgbWV0aG9kczogJWpcIixcbiAgICAgICAgICAgIF8ocmVzdWx0cylcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZmxvdzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHIuaW5mby53b3JrZmxvdy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcnNpb246IHIuaW5mby52ZXJzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHIuaWRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50b0FycmF5KCkpO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcmVzdWx0c1tpXTtcbiAgICAgICAgLy8gVGhhdCBmaW5kcyB0aGUgbGF0ZXN0IHZlcnNpb246XG4gICAgICAgIGlmIChyZXN1bHQuaW5mby5jYW5DcmVhdGVJbnN0YW5jZSAmJiAhcmVzdWx0LmluZm8uZGVwcmVjYXRlZCkge1xuICAgICAgICAgICAgY3JlYXRhYmxlID0gcmVzdWx0LmluZm87XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGhhdCBmaW5kcyBhIHJ1bm5pbmcgaW5zdGFuY2Ugd2l0aCB0aGUgaWQ6XG4gICAgICAgIGlmIChfLmlzTnVsbChpbnN0YW5jZUlkKSAmJiAoeWllbGQgc2VsZi5fY2hlY2tJZkluc3RhbmNlUnVubmluZyh3b3JrZmxvd05hbWUsIHJlc3VsdC5pZCkpKSB7XG4gICAgICAgICAgICBpbnN0YW5jZUlkID0gcmVzdWx0LmlkO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW5zdGFuY2VJZCkge1xuICAgICAgICBkZWJ1ZyhcIkZvdW5kIGEgY29udGludWFibGUgaW5zdGFuY2UgaWQ6ICVzLiBJbnZva2luZyBtZXRob2Qgb24gdGhhdC5cIiwgaW5zdGFuY2VJZCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgaXIgPSB5aWVsZCAoc2VsZi5faW52b2tlTWV0aG9kT25SdW5uaW5nSW5zdGFuY2UoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICBkZWJ1ZyhcIkludm9rZSBjb21wbGV0ZWQsIHJlc3VsdDogJWpcIiwgaXIpO1xuICAgICAgICAgICAgcmV0dXJuIGlyO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkludm9rZSBmYWlsZWQ6ICVzXCIsIGUuc3RhY2spO1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChjcmVhdGFibGUpIHtcbiAgICAgICAgZGVidWcoXCJGb3VuZCBhIGNyZWF0YWJsZSB3b3JrZmxvdyAobmFtZTogJyVzJywgdmVyc2lvbjogJyVzJyksIGludm9raW5nIGEgY3JlYXRlIG1ldGhvZCBvbiB0aGF0LlwiLCBjcmVhdGFibGUud29ya2Zsb3cubmFtZSwgY3JlYXRhYmxlLnZlcnNpb24pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGNyID0geWllbGQgKHNlbGYuX2NyZWF0ZUluc3RhbmNlQW5kSW52b2tlTWV0aG9kKGNyZWF0YWJsZS53b3JrZmxvdywgY3JlYXRhYmxlLnZlcnNpb24sIG1ldGhvZE5hbWUsIGFyZ3MpKTtcbiAgICAgICAgICAgIGRlYnVnKFwiQ3JlYXRlIGNvbXBsZXRlZCwgcmVzdWx0OiAlalwiLCBjcik7XG4gICAgICAgICAgICByZXR1cm4gY3I7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiQ3JlYXRlIGZhaWxlZDogJXNcIiwgZS5zdGFjayk7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkZWJ1ZyhcIk5vIGNvbnRpbnVhYmxlIHdvcmtmbG93cyBoYXZlIGJlZW4gZm91bmQuXCIpO1xuICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLk1ldGhvZE5vdEZvdW5kRXJyb3IoXCJDYW5ub3QgY3JlYXRlIG9yIGNvbnRpbnVlIHdvcmtmbG93ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBieSBjYWxsaW5nIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICB9XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fY3JlYXRlSW5zdGFuY2VBbmRJbnZva2VNZXRob2QgPSBhc3luYyhmdW5jdGlvbiogKHdvcmtmbG93LCB3b3JrZmxvd1ZlcnNpb24sIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICBsZXQgd29ya2Zsb3dOYW1lID0gd29ya2Zsb3cubmFtZTtcblxuICAgIGxldCBsb2NrSW5mbyA9IG51bGw7XG5cbiAgICBpZiAoIXRoaXMuX3BlcnNpc3RlbmNlKSB7XG4gICAgICAgIGxldCBpbnN0YSA9IHRoaXMuX2NyZWF0ZVdGSW5zdGFuY2UoKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChpbnN0YS5jcmVhdGUod29ya2Zsb3csIHdvcmtmbG93VmVyc2lvbiwgbWV0aG9kTmFtZSwgYXJncywgbG9ja0luZm8pKTtcbiAgICAgICAgdGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmFkZCh3b3JrZmxvd05hbWUsIGluc3RhKTtcbiAgICAgICAgdGhpcy5vblN0YXJ0KGluc3RhLCBtZXRob2ROYW1lLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxvY2tJbmZvID0ge1xuICAgICAgICAgICAgaWQ6IG51bGwsXG4gICAgICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICAgICAgaGVsZFRvOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIC8vIFdoZW4gbG9jayB3aWxsIGhlbGQsIHRoZW4gd2Ugc2hvdWxkIGtlZXAgaXQgYWxpdmU6XG4gICAgICAgIGxldCBrZWVwTG9ja0FsaXZlID0gbmV3IEtlZXBMb2NrQWxpdmUodGhpcy5fcGVyc2lzdGVuY2UsIGxvY2tJbmZvLCB0aGlzLl9pbkxvY2tUaW1lb3V0LCB0aGlzLm9wdGlvbnMubG9ja1JlbmV3YWxUaW1lb3V0KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBpbnN0YSA9IHRoaXMuX2NyZWF0ZVdGSW5zdGFuY2UoKTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY3JlYXRlKHdvcmtmbG93LCB3b3JrZmxvd1ZlcnNpb24sIG1ldGhvZE5hbWUsIGFyZ3MsIGxvY2tJbmZvKSk7XG5cbiAgICAgICAgICAgIGlmIChpbnN0YS5leGVjU3RhdGUgPT09IGVudW1zLmFjdGl2aXR5U3RhdGVzLmlkbGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuYWRkKHdvcmtmbG93TmFtZSwgaW5zdGEpO1xuXG4gICAgICAgICAgICAgICAgLy8gUGVyc2lzdCBhbmQgdW5sb2NrOlxuICAgICAgICAgICAgICAgIGxldCBlcnIgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuX3BlcnNpc3RlbmNlLnBlcnNpc3RTdGF0ZShpbnN0YSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25TdGFydChpbnN0YSwgbWV0aG9kTmFtZSwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IHBlcnNpc3QgaW5zdGFuY2Ugb2Ygd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcy5yZW1vdmUod29ya2Zsb3dOYW1lLCBpbnN0YS5pZCk7XG4gICAgICAgICAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJDYW5ub3QgZXhpdCBsb2NrIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uV2FybihlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBrZWVwTG9ja0FsaXZlLmVuZCgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX3Rocm93SWZSZWNvdmVyYWJsZSA9IGZ1bmN0aW9uIChlcnJvciwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgZXJyb3JzLk1ldGhvZElzTm90QWNjZXNzaWJsZUVycm9yKSB7XG4gICAgICAgIGRlYnVnKFwiTWV0aG9kICclcycgb2Ygd29ya2Zsb3cgJyVzJyBpcyBub3QgYWNjZXNzaWJsZSBhdCB0aGUgY3VycmVudCBzdGF0ZSwgYmFjYXVzZSBpdCBtaWdodCBiZSBzdGVwcGVkIG9uIGFub3RoZXIgaW5zdGFuY2UgdG8gYW5vdGhlciBzdGF0ZSB0aGEgaXMgZXhpc3RzIGF0IGN1cnJlbnQgaW4gdGhpcyBob3N0LiBDbGllbnQgc2hvdWxkIHJldHJ5LlwiLCBtZXRob2ROYW1lLCB3b3JrZmxvd05hbWUpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9pbnZva2VNZXRob2RPblJ1bm5pbmdJbnN0YW5jZSA9IGFzeW5jKGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICBsZXQgaW5zdGEgPSB5aWVsZCAoc2VsZi5fdmVyaWZ5QW5kUmVzdG9yZUluc3RhbmNlU3RhdGUoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGluc3RhLmNhbGxNZXRob2QobWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuYWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25JbnZva2UoaW5zdGEsIG1ldGhvZE5hbWUsIGFyZ3MsIHJlc3VsdCwgdHJ1ZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuYWN0aXZpdHlTdGF0ZXMuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9kZWxldGVXRkluc3RhbmNlKGluc3RhKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uSW52b2tlKGluc3RhLCBtZXRob2ROYW1lLCBhcmdzLCByZXN1bHQsIGZhbHNlLCBudWxsKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRW5kKGluc3RhLCByZXN1bHQsIGZhbHNlLCBudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiSW5zdGFuY2UgJ1wiICsgaW5zdGEuaWQgKyBcIicgaXMgaW4gYW4gaW52YWxpZCBzdGF0ZSAnXCIgKyBpbnN0YS5leGVjU3RhdGUgKyBcIicgYWZ0ZXIgaW52b2NhdGlvbiBvZiB0aGUgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLl90aHJvd0lmUmVjb3ZlcmFibGUoZSwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lKTtcbiAgICAgICAgICAgIHNlbGYuX2RlbGV0ZVdGSW5zdGFuY2UoaW5zdGEpO1xuICAgICAgICAgICAgdGhpcy5vbkludm9rZShpbnN0YSwgbWV0aG9kTmFtZSwgYXJncywgdW5kZWZpbmVkLCBmYWxzZSwgZSk7XG4gICAgICAgICAgICB0aGlzLm9uRW5kKGluc3RhLCB1bmRlZmluZWQsIGZhbHNlLCBlKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIExvY2sgaXQ6XG4gICAgICAgIGxldCBsb2NrTmFtZSA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuZG91YmxlS2V5cyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpO1xuICAgICAgICBsZXQgbG9ja0luZm87XG4gICAgICAgIGxldCBrZWVwTG9ja0FsaXZlID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRlYnVnKFwiTG9ja2luZyBpbnN0YW5jZS5cIik7XG4gICAgICAgICAgICBsb2NrSW5mbyA9IHlpZWxkIChzZWxmLl9wZXJzaXN0ZW5jZS5lbnRlckxvY2sobG9ja05hbWUsIHNlbGYub3B0aW9ucy5lbnRlckxvY2tUaW1lb3V0LCBzZWxmLl9pbkxvY2tUaW1lb3V0KSk7XG4gICAgICAgICAgICBkZWJ1ZyhcIkxvY2tlZDogJWpcIiwgbG9ja0luZm8pO1xuXG4gICAgICAgICAgICAvLyBXaGVuIGxvY2sgd2lsbCBoZWxkLCB0aGVuIHdlIHNob3VsZCBrZWVwIGl0IGFsaXZlOlxuICAgICAgICAgICAga2VlcExvY2tBbGl2ZSA9IG5ldyBLZWVwTG9ja0FsaXZlKHNlbGYuX3BlcnNpc3RlbmNlLCBsb2NrSW5mbywgc2VsZi5faW5Mb2NrVGltZW91dCwgc2VsZi5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCk7XG5cbiAgICAgICAgICAgIC8vIExPQ0tFRFxuICAgICAgICAgICAgbGV0IGluc3RhID0geWllbGQgKHNlbGYuX3ZlcmlmeUFuZFJlc3RvcmVJbnN0YW5jZVN0YXRlKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykpO1xuICAgICAgICAgICAgbGV0IGVuZFdpdGhFcnJvciA9IGFzeW5jKGZ1bmN0aW9uKihlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZGVsZXRlV0ZJbnN0YW5jZShpbnN0YSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgKHNlbGYuX3BlcnNpc3RlbmNlLnJlbW92ZVN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGEuaWQsIGZhbHNlLCBlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChyZW1vdmVFKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IHJlbW92ZSBzdGF0ZSBvZiB3b3JrZmxvdyBuYW1lOiAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicgaW5zdGFuY2UgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIic6XFxuXCIgKyByZW1vdmVFLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbldhcm4ocmVtb3ZlRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlbGYub25JbnZva2UoaW5zdGEsIG1ldGhvZE5hbWUsIGFyZ3MsIHVuZGVmaW5lZCwgZmFsc2UsIGUpO1xuICAgICAgICAgICAgICAgIHNlbGYub25FbmQoaW5zdGEsIHVuZGVmaW5lZCwgZmFsc2UsIGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCBwZXJzaXN0QW5kVW5sb2NrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fcGVyc2lzdGVuY2UucGVyc2lzdFN0YXRlKGluc3RhKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiVW5sb2NraW5nOiAlalwiLCBsb2NrSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZyhcIlVubG9ja2VkLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IGV4aXQgbG9jayBmb3Igd29ya2Zsb3cgbmFtZTogJ1wiICsgd29ya2Zsb3dOYW1lICsgXCInIGluc3RhbmNlIGlkICdcIiArIGluc3RhLmlkICsgXCInOlxcblwiICsgZS5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uV2FybihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaW5zdGEuY2FsbE1ldGhvZChtZXRob2ROYW1lLCBhcmdzKSk7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhLmV4ZWNTdGF0ZSA9PT0gZW51bXMuYWN0aXZpdHlTdGF0ZXMuaWRsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBQZXJzaXN0IGFuZCB1bmxvY2s6XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm9wdGlvbnMubGF6eVBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcnNpc3RBbmRVbmxvY2soKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uSW52b2tlKGluc3RhLCBtZXRob2ROYW1lLCBhcmdzLCByZXN1bHQsIHRydWUsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRXaXRoRXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBwZXJzaXN0QW5kVW5sb2NrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uSW52b2tlKGluc3RhLCBtZXRob2ROYW1lLCBhcmdzLCByZXN1bHQsIHRydWUsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5zdGEuZXhlY1N0YXRlID09PSBlbnVtcy5hY3Rpdml0eVN0YXRlcy5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9kZWxldGVXRkluc3RhbmNlKGluc3RhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkludm9rZShpbnN0YSwgbWV0aG9kTmFtZSwgYXJncywgcmVzdWx0LCBmYWxzZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FbmQoaW5zdGEsIHJlc3VsdCwgZmFsc2UsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBzZWxmLl9wZXJzaXN0ZW5jZS5yZW1vdmVTdGF0ZSh3b3JrZmxvd05hbWUsIGluc3RhLmlkLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJDYW5ub3QgcmVtb3ZlIHN0YXRlIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25XYXJuKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoXCJDYW5ub3QgZXhpdCBsb2NrIG9mIHdvcmtmbG93IG5hbWU6ICdcIiArIHdvcmtmbG93TmFtZSArIFwiJyBpbnN0YW5jZSBpZCAnXCIgKyBpbnN0YS5pZCArIFwiJzpcXG5cIiArIGUuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25XYXJuKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiSW5zdGFuY2UgJ1wiICsgaW5zdGEuaWQgKyBcIicgaXMgaW4gYW4gaW52YWxpZCBzdGF0ZSAnXCIgKyBpbnN0YS5leGVjU3RhdGUgKyBcIicgYWZ0ZXIgaW52b2NhdGlvbiBvZiB0aGUgbWV0aG9kICdcIiArIG1ldGhvZE5hbWUgKyBcIicuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGhyb3dJZlJlY292ZXJhYmxlKGUsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSk7XG4gICAgICAgICAgICAgICAgeWllbGQgZW5kV2l0aEVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChrZWVwTG9ja0FsaXZlKSB7XG4gICAgICAgICAgICAgICAga2VlcExvY2tBbGl2ZS5lbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsb2NrSW5mbykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHNlbGYuX3BlcnNpc3RlbmNlLmV4aXRMb2NrKGxvY2tJbmZvLmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGV4aXRFKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKFwiQ2Fubm90IGV4aXQgbG9jayAnXCIgKyBsb2NrSW5mby5pZCArIFwiJzpcXG5cIiArIGV4aXRFLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbldhcm4oZXhpdEUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgZXJyb3JzLlRpbWVvdXRFcnJvcikge1xuICAgICAgICAgICAgICAgIGxldCBtc2cgPSBcIkNhbm5vdCBjYWxsIG1ldGhvZCBvZiB3b3JrZmxvdyAnXCIgKyB3b3JrZmxvd05hbWUgKyBcIicsIGJlY2F1c2UgJ1wiICsgbWV0aG9kTmFtZSArIFwiJyBpcyBsb2NrZWQuXCI7XG4gICAgICAgICAgICAgICAgZGVidWcobXNnKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLk1ldGhvZElzTm90QWNjZXNzaWJsZUVycm9yKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2VudGVyTG9ja0ZvckNyZWF0ZWRJbnN0YW5jZSA9IGFzeW5jKGZ1bmN0aW9uKiAoaW5zdGEsIGxvY2tJbmZvKSB7XG4gICAgbGV0IGxpID0geWllbGQgKHRoaXMuX3BlcnNpc3RlbmNlLmVudGVyTG9jayhzcGVjU3RyaW5ncy5ob3N0aW5nLmRvdWJsZUtleXMoaW5zdGEud29ya2Zsb3dOYW1lLCBpbnN0YS5pZCksIHRoaXMub3B0aW9ucy5lbnRlckxvY2tUaW1lb3V0LCB0aGlzLl9nZXRJbkxvY2tUaW1lb3V0KCkpKTtcbiAgICBpZiAoeWllbGQgKHRoaXMuX3BlcnNpc3RlbmNlLmlzUnVubmluZyhpbnN0YS53b3JrZmxvd05hbWUsIGluc3RhLmlkKSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiQ2Fubm90IGNyZWF0ZSBpbnN0YW5jZSBvZiB3b3JrZmxvdyAnXCIgKyBpbnN0YS53b3JrZmxvd05hbWUgKyBcIicgYnkgaWQgJ1wiICsgaW5zdGEuaWQgKyBcIicgYmVjYXVzZSBpdCdzIGFscmVhZHkgZXhpc3RzLlwiKTtcbiAgICB9XG4gICAgbG9ja0luZm8uaWQgPSBsaS5pZDtcbiAgICBsb2NrSW5mby5uYW1lID0gbGkubmFtZTtcbiAgICBsb2NrSW5mby5oZWxkVG8gPSBsaS5oZWxkVG87XG59KTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fZ2V0SW5Mb2NrVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmxvY2tSZW5ld2FsVGltZW91dCArIE1hdGgubWF4KHRoaXMub3B0aW9ucy5sb2NrUmVuZXdhbFRpbWVvdXQgKiAwLjQsIDMwMDApO1xufTtcblxuV29ya2Zsb3dIb3N0LnByb3RvdHlwZS5fdmVyaWZ5QW5kUmVzdG9yZUluc3RhbmNlU3RhdGUgPSBhc3luYyhmdW5jdGlvbiogKGluc3RhbmNlSWQsIHdvcmtmbG93TmFtZSwgbWV0aG9kTmFtZSwgYXJncykge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBsZXQgaW5zdGEgPSBudWxsO1xuICAgIGlmIChzZWxmLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICBsZXQgaGVhZGVyID0geWllbGQgKHNlbGYuX3BlcnNpc3RlbmNlLmdldFJ1bm5pbmdJbnN0YW5jZUlkSGVhZGVyKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpO1xuICAgICAgICBpZiAoaGVhZGVyKSB7XG4gICAgICAgICAgICBpbnN0YSA9IHlpZWxkIChzZWxmLl9yZXN0b3JlSW5zdGFuY2VTdGF0ZShpbnN0YW5jZUlkLCB3b3JrZmxvd05hbWUsIGhlYWRlci53b3JrZmxvd1ZlcnNpb24sIGhlYWRlci51cGRhdGVkT24pKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaW5zdGEgPSBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuZ2V0KHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XG4gICAgfVxuICAgIGlmICghaW5zdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd05vdEZvdW5kRXJyb3IoYFdvcmZsb3cgKG5hbWU6ICcke3dvcmtmbG93TmFtZX0nLCBpZDogJyR7aW5zdGFuY2VJZH0nKSBoYXMgYmVlbiBkZWxldGVkIHNpbmNlIHRoZSBsb2NrIGhhcyBiZWVuIHRha2VuLmApO1xuICAgIH1cblxuICAgIHJldHVybiBpbnN0YTtcbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9yZXN0b3JlSW5zdGFuY2VTdGF0ZSA9IGFzeW5jKGZ1bmN0aW9uKiAoaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCB3b3JrZmxvd1ZlcnNpb24sIGFjdHVhbFRpbWVzdGFtcCkge1xuICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgIGlmICghc2VsZi5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlc3RvcmUgaW5zdGFuY2UgZnJvbSBwZXJzaXN0ZW5jZSwgYmVjYXVzZSBob3N0IGhhcyBubyBwZXJzaXN0ZW5jZSByZWdpc3RlcmVkLlwiKTtcbiAgICB9XG5cbiAgICBsZXQgaW5zdGEgPSBzZWxmLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuZ2V0KHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCk7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQoaW5zdGEpKSB7XG4gICAgICAgIGxldCB3ZkRlc2MgPSBzZWxmLl9yZWdpc3RyeS5nZXREZXNjKHdvcmtmbG93TmFtZSwgd29ya2Zsb3dWZXJzaW9uKTtcbiAgICAgICAgaW5zdGEgPSBzZWxmLl9jcmVhdGVXRkluc3RhbmNlKCk7XG4gICAgICAgIGluc3RhLnNldFdvcmtmbG93KHdmRGVzYy53b3JrZmxvdywgd29ya2Zsb3dWZXJzaW9uLCBpbnN0YW5jZUlkKTtcbiAgICB9XG5cbiAgICBpZiAoaW5zdGEudXBkYXRlZE9uID09PSBudWxsIHx8IGluc3RhLnVwZGF0ZWRPbi5nZXRUaW1lKCkgIT09IGFjdHVhbFRpbWVzdGFtcC5nZXRUaW1lKCkgfHwgc2VsZi5vcHRpb25zLmFsd2F5c0xvYWRTdGF0ZSkge1xuICAgICAgICBsZXQgc3RhdGUgPSB5aWVsZCAoc2VsZi5fcGVyc2lzdGVuY2UubG9hZFN0YXRlKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkpO1xuICAgICAgICBpbnN0YS5yZXN0b3JlU3RhdGUoc3RhdGUpO1xuICAgICAgICByZXR1cm4gaW5zdGE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gaW5zdGE7XG4gICAgfVxufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2NoZWNrSWZJbnN0YW5jZVJ1bm5pbmcgPSBhc3luYyhmdW5jdGlvbiogKHdvcmtmbG93TmFtZSwgaW5zdGFuY2VJZCkge1xuICAgIGlmICh0aGlzLl9wZXJzaXN0ZW5jZSkge1xuICAgICAgICByZXR1cm4gKHlpZWxkIHRoaXMuX3BlcnNpc3RlbmNlLmlzUnVubmluZyh3b3JrZmxvd05hbWUsIGluc3RhbmNlSWQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2tub3duUnVubmluZ0luc3RhbmNlcy5leGlzdHMod29ya2Zsb3dOYW1lLCBpbnN0YW5jZUlkKTtcbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9nZXRSdW5uaW5nSW5zdGFuY2VIZWFkZXJzRm9yT3RoZXJWZXJzaW9uID0gYXN5bmMoZnVuY3Rpb24qICh3b3JrZmxvd05hbWUsIHZlcnNpb24pIHtcbiAgICBpZiAodGhpcy5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgcmV0dXJuICh5aWVsZCB0aGlzLl9wZXJzaXN0ZW5jZS5nZXRSdW5uaW5nSW5zdGFuY2VIZWFkZXJzRm9yT3RoZXJWZXJzaW9uKHdvcmtmbG93TmFtZSwgdmVyc2lvbikpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzLmdldFJ1bm5pbmdJbnN0YW5jZUhlYWRlcnNGb3JPdGhlclZlcnNpb24od29ya2Zsb3dOYW1lLCB2ZXJzaW9uKTtcbn0pO1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLmFkZFRyYWNrZXIgPSBmdW5jdGlvbiAodHJhY2tlcikge1xuICAgIHRoaXMuX3ZlcmlmeSgpO1xuXG4gICAgaWYgKCFfLmlzT2JqZWN0KHRyYWNrZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0LlwiKTtcbiAgICB9XG4gICAgdGhpcy5fdHJhY2tlcnMucHVzaCh0cmFja2VyKTtcbiAgICB0aGlzLl9rbm93blJ1bm5pbmdJbnN0YW5jZXMuYWRkVHJhY2tlcih0cmFja2VyKTtcbn07XG5cbi8qIFdha2UgVXAqL1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9jb250aW51ZVdva2VVcEluc3RhbmNlID0gYXN5bmMoZnVuY3Rpb24qKHdha2V1cGFibGUpIHtcbiAgICBpZiAodGhpcy5fc2h1dGRvd24pIHtcbiAgICAgICAgd2FrZXVwYWJsZS5yZXN1bHQucmVzb2x2ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy5fcGVyc2lzdGVuY2UpIHtcbiAgICAgICAgd2FrZXVwYWJsZS5yZXN1bHQucmVqZWN0KG5ldyBlcnJvcnMuV29ya2Zsb3dFcnJvcihcIkhhbmRsaW5nIERlbGF5cyBpbiBob3N0IGlzIG5vdCBzdXBwb3J0ZWQgd2l0aG91dCBwZXJzaXN0ZW5jZS5cIikpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXNzZXJ0KF8uaXNQbGFpbk9iamVjdCh3YWtldXBhYmxlKSk7XG4gICAgYXNzZXJ0KF8uaXNTdHJpbmcod2FrZXVwYWJsZS5pbnN0YW5jZUlkKSk7XG4gICAgYXNzZXJ0KF8uaXNTdHJpbmcod2FrZXVwYWJsZS53b3JrZmxvd05hbWUpKTtcbiAgICBhc3NlcnQoXy5pc1BsYWluT2JqZWN0KHdha2V1cGFibGUuYWN0aXZlRGVsYXkpKTtcbiAgICBhc3NlcnQoXy5pc1N0cmluZyh3YWtldXBhYmxlLmFjdGl2ZURlbGF5Lm1ldGhvZE5hbWUpKTtcbiAgICBhc3NlcnQoXy5pc0RhdGUod2FrZXVwYWJsZS5hY3RpdmVEZWxheS5kZWxheVRvKSk7XG4gICAgYXNzZXJ0KF8uaXNGdW5jdGlvbih3YWtldXBhYmxlLnJlc3VsdC5yZXNvbHZlKSk7XG4gICAgYXNzZXJ0KF8uaXNGdW5jdGlvbih3YWtldXBhYmxlLnJlc3VsdC5yZWplY3QpKTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vaW5zdGFuY2VJZCwgd29ya2Zsb3dOYW1lLCBtZXRob2ROYW1lLCBhcmdzXG4gICAgICAgIGRlYnVnKFwiSW52b2tpbmcgRGVsYXlUbyBpbnN0YW5jZUlkOiAlcywgd29ya2Zsb3dOYW1lOiVzLCBtZXRob2ROYW1lOiAlc1wiLCB3YWtldXBhYmxlLmluc3RhbmNlSWQsIHdha2V1cGFibGUud29ya2Zsb3dOYW1lLCB3YWtldXBhYmxlLmFjdGl2ZURlbGF5Lm1ldGhvZE5hbWUpO1xuICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgdGhpcy5faW52b2tlTWV0aG9kT25SdW5uaW5nSW5zdGFuY2Uod2FrZXVwYWJsZS5pbnN0YW5jZUlkLCB3YWtldXBhYmxlLndvcmtmbG93TmFtZSwgd2FrZXVwYWJsZS5hY3RpdmVEZWxheS5tZXRob2ROYW1lLCBbd2FrZXVwYWJsZS5pbnN0YW5jZUlkLCB3YWtldXBhYmxlLmFjdGl2ZURlbGF5LmRlbGF5VG9dKTtcbiAgICAgICAgZGVidWcoXCJEZWxheVRvIGluc3RhbmNlSWQ6ICVzLCB3b3JrZmxvd05hbWU6JXMsIG1ldGhvZE5hbWU6ICVzIGludm9rZWQuXCIsIHdha2V1cGFibGUuaW5zdGFuY2VJZCwgd2FrZXVwYWJsZS53b3JrZmxvd05hbWUsIHdha2V1cGFibGUuYWN0aXZlRGVsYXkubWV0aG9kTmFtZSk7XG4gICAgICAgIHdha2V1cGFibGUucmVzdWx0LnJlc29sdmUoKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IgfHwgZSBpbnN0YW5jZW9mIGVycm9ycy5Xb3JrZmxvd05vdEZvdW5kRXJyb3IpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiRGVsYXlUbydzIG1ldGhvZCBpcyBub3QgYWNjZXNzaWJsZSBzaW5jZSBpdCBnb3Qgc2VsZWN0ZWQgZm9yIGNvbnRpbnVhdGlvbi5cIik7XG4gICAgICAgICAgICB3YWtldXBhYmxlLnJlc3VsdC5yZXNvbHZlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZGVidWcoXCJEZWxheVRvIGluc3RhbmNlSWQ6ICVzLCB3b3JrZmxvd05hbWU6JXMsIG1ldGhvZE5hbWU6ICVzIGVycm9yOiAlc1wiLCB3YWtldXBhYmxlLmluc3RhbmNlSWQsIHdha2V1cGFibGUud29ya2Zsb3dOYW1lLCB3YWtldXBhYmxlLmFjdGl2ZURlbGF5Lm1ldGhvZE5hbWUsIGUuc3RhY2spO1xuICAgICAgICB3YWtldXBhYmxlLnJlc3VsdC5yZWplY3QoZSk7XG4gICAgfVxufSk7XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX2NyZWF0ZVdGSW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCBpbnN0YSA9IG5ldyBXb3JrZmxvd0luc3RhbmNlKHRoaXMpO1xuICAgIGluc3RhLm9uKFxuICAgICAgICBlbnVtcy5ldmVudHMud29ya2Zsb3dFdmVudCxcbiAgICAgICAgZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHNlbGYub25Xb3JrZmxvd0V2ZW50KGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gaW5zdGE7XG59O1xuXG5Xb3JrZmxvd0hvc3QucHJvdG90eXBlLl9kZWxldGVXRkluc3RhbmNlID0gZnVuY3Rpb24gKGluc3RhKSB7XG4gICAgaW5zdGEucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5fa25vd25SdW5uaW5nSW5zdGFuY2VzLnJlbW92ZShpbnN0YS53b3JrZmxvd05hbWUsIGluc3RhLmlkKTtcbn07XG5cbi8qIFNodXRkb3duICovXG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuX3ZlcmlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fc2h1dGRvd24pIHtcbiAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5Xb3JrZmxvd0Vycm9yKFwiV29ya2Zsb3cgaG9zdCBoYXMgYmVlbiBzaHV0IGRvd24uXCIpO1xuICAgIH1cbn07XG5cbldvcmtmbG93SG9zdC5wcm90b3R5cGUuc2h1dGRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX3NodXRkb3duKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3dha2VVcCkge1xuICAgICAgICB0aGlzLl93YWtlVXAuc3RvcCgpO1xuICAgIH1cbiAgICB0aGlzLl9zaHV0ZG93biA9IHRydWU7XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gV29ya2Zsb3dIb3N0O1xuIl19
