"use strict";

let WorkflowRegistry = require("./workflowRegistry");
let _ = require("lodash");
let Activity = require("../activities/activity");
let Workflow = require("../activities/workflow");
let WorkflowPersistence = require("./workflowPersistence");
let WorkflowInstance = require("./workflowInstance");
let InstanceIdParser = require("./instanceIdParser");
let enums = require("../common/enums");
let Bluebird = require("bluebird");
let KnownInstaStore = require("./knownInstaStore");
let specStrings = require("../common/specStrings");
let errors = require("../common/errors");
let Serializer = require("backpack-node").system.Serializer;
let is = require("../common/is");
let KeepLockAlive = require("./keepLockAlive");
let asyncHelpers = require("../common/asyncHelpers");
let async = asyncHelpers.async;
let WakeUp = require("./wakeUp");
let assert = require("assert");
let debug = require("debug")("wf4node:WorkflowHost");
let EventEmitter = require("events").EventEmitter;
let util = require("util");

function WorkflowHost(options) {
    EventEmitter.call(this);

    this._options = _.extend(
        {
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
        },
        options);

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

WorkflowHost.prototype.onWorkflowEvent = function (args) {
    this.emit(WorkflowHost.events.workflowEvent, args);
};

WorkflowHost.prototype.onWarn = function (error) {
    this.emit(WorkflowHost.events.warn, error);
};

WorkflowHost.prototype.onStart = function (instance, methodName, args) {
    this.emit(WorkflowHost.events.start, {
        instance: instance,
        methodName: methodName,
        args: args
    });
};

WorkflowHost.prototype.onInvoke = function (instance, methodName, args, result, idle, error) {
    this.emit(WorkflowHost.events.invoke, {
        instance: instance,
        methodName: methodName,
        args: args,
        idle: idle,
        error: error
    });
};

WorkflowHost.prototype.onEnd = function (instance, result, cancelled, error) {
    this.emit(WorkflowHost.events.end, {
        instance: instance,
        result: result,
        cancelled: cancelled,
        error: error
    });
};

Object.defineProperties(
    WorkflowHost.prototype, {
        options: {
            get: function () {
                return this._options;
            }
        },
        isInitialized: {
            get: function () {
                return this._isInitialized;
            }
        },
        instanceIdParser: {
            get: function () {
                return this._instanceIdParser;
            }
        },
        persistence: {
            get: function () {
                return this._persistence;
            }
        },
        _inLockTimeout: {
            get: function () {
                return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
            }
        }
    });

WorkflowHost.prototype.registerDeprecatedWorkflow = function (workflow) {
    this.registerWorkflow(workflow, true);
};

WorkflowHost.prototype.registerWorkflow = function (workflow, deprecated) {
    this._verify();
    let desc = this._registry.register(workflow, deprecated);
    debug("Workflow registered. name: %s, version: %s", desc.name, desc.version);
};

WorkflowHost.prototype._initialize = function () {
    let self = this;
    if (!this._isInitialized) {
        if (this._options.wakeUpOptions && this._options.wakeUpOptions.interval > 0) {
            this._wakeUp = new WakeUp(this._knownRunningInstances, this._persistence, this._options.wakeUpOptions);
            this._wakeUp.on("continue", function (i) { self._continueWokeUpInstance(i); });
            this._wakeUp.on("error", function (e) { self.onWarn(e); });
            this._wakeUp.start();
        }

        this._isInitialized = true;
    }
};

WorkflowHost.prototype.stop = async(function*(workflowName, instanceId) {
    let self = this;
    let remove = function (instanceId) {
        let knownInsta = self._knownRunningInstances.get(workflowName, instanceId);
        if (knownInsta) {
            debug("Removing instance: %s", instanceId);
            self._deleteWFInstance(knownInsta);
            self.onEnd(knownInsta, undefined, true);
        }
    };

    debug("Stopping workflow '%s' with id: '%s'.", workflowName, instanceId);

    try {
        if (this._persistence) {
            let lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
            let lockInfo;
            debug("Locking instance: %s", instanceId);
            lockInfo = yield (this._persistence.enterLock(lockName, this.options.enterLockTimeout, this._inLockTimeout));
            let keepLockAlive = null;
            try {
                debug("Locked: %j", lockInfo);
                keepLockAlive = new KeepLockAlive(this._persistence, lockInfo, this._inLockTimeout, this.options.lockRenewalTimeout);

                // Do stuff:
                yield this._persistence.removeState(workflowName, instanceId, false, "STOPPED.");
                remove(instanceId);

                debug("Removed: %s", instanceId);
            }
            catch (e) {
                debug("Error: %s", e.stack);
                throw e;
            }
            finally {
                // Unlock:
                debug("Unlocking.");
                if (keepLockAlive) {
                    keepLockAlive.end();
                }
                yield this._persistence.exitLock(lockInfo.id);
            }
        }
        else {
            remove(instanceId);
        }
    }
    catch (e) {
        debug("Error: %s", e.stack);
        throw new errors.WorkflowError(`Cannot stop instance of workflow '${workflowName}' with id: '${instanceId}' because of an internal error:\n${e.stack}`);
    }
});

WorkflowHost.prototype.stopDeprecatedVersions = async(function* (workflowName) {
    this._verify();
    debug("Stopping outdated versions of workflow '%s'.", workflowName);



    let count = 0;
    let currentVersion = this._registry.getCurrentVersion(workflowName);
    if (currentVersion) {
        let oldVersionHeaders = yield this._getRunningInstanceHeadersForOtherVersion(workflowName, currentVersion);
        if (oldVersionHeaders.length) {
            debug("There is %d old version running. Stopping them.", oldVersionHeaders.length);
            for (let header of oldVersionHeaders) {
                debug("Stopping workflow '%s' of version '%s' with id: '%s'.", header.workflowName, header.workflowVersion, header.instanceId);
                yield this.stop(workflowName, header.instanceId);
            }
        }
    }
    else {
        debug("There is no workflow registered by name '%s'.", workflowName);
    }
    return count;
});

WorkflowHost.prototype.invokeMethod = async(function* (workflowName, methodName, args) {
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

    let self = this;

    self._initialize();

    let instanceId = null;
    let creatable = null;

    let results = [];
    for (let info of self._registry.methodInfos(workflowName, methodName)) {
        let tryId = self._instanceIdParser.parse(info.instanceIdPath, args);
        if (!_.isUndefined(tryId)) {
            results.push(
                {
                    info: info,
                    id: tryId
                });
        }
    }
    if (process.env.NODE_ENV !== "production") {
        debug("Possible methods: %j",
            _(results)
                .map(function (r) {
                    return {
                        workflow: {
                            name: r.info.workflow.name,
                            version: r.info.version
                        },
                        id: r.id
                    };
                })
                .toArray());
    }

    for (let i = 0; i < results.length; i++) {
        let result = results[i];
        // That finds the latest version:
        if (result.info.canCreateInstance && !result.info.deprecated) {
            creatable = result.info;
        }
        // That finds a running instance with the id:
        if (_.isNull(instanceId) && (yield self._checkIfInstanceRunning(workflowName, result.id))) {
            instanceId = result.id;
            break;
        }
    }

    if (instanceId) {
        debug("Found a continuable instance id: %s. Invoking method on that.", instanceId);
        try {
            let ir = yield (self._invokeMethodOnRunningInstance(instanceId, workflowName, methodName, args));
            debug("Invoke completed, result: %j", ir);
            return ir;
        }
        catch (e) {
            debug("Invoke failed: %s", e.stack);
            throw e;
        }
    }
    else if (creatable) {
        debug("Found a creatable workflow (name: '%s', version: '%s'), invoking a create method on that.", creatable.workflow.name, creatable.version);
        try {
            let cr = yield (self._createInstanceAndInvokeMethod(creatable.workflow, creatable.version, methodName, args));
            debug("Create completed, result: %j", cr);
            return cr;
        }
        catch (e) {
            debug("Create failed: %s", e.stack);
            throw e;
        }
    }
    else {
        debug("No continuable workflows have been found.");
        throw new errors.WorkflowError("Cannot create or continue workflow '" + workflowName + "' by calling method '" + methodName + "'.");
    }
});

WorkflowHost.prototype._createInstanceAndInvokeMethod = async(function* (workflow, workflowVersion, methodName, args) {
    let workflowName = workflow.name;

    let lockInfo = null;

    if (!this._persistence) {
        let insta = this._createWFInstance();
        let result = yield (insta.create(workflow, workflowVersion, methodName, args, lockInfo));
        this._knownRunningInstances.add(workflowName, insta);
        this.onStart(insta, methodName, args);
        return result;
    }
    else {
        lockInfo = {
            id: null,
            name: null,
            heldTo: null
        };
        // When lock will held, then we should keep it alive:
        let keepLockAlive = new KeepLockAlive(this._persistence, lockInfo, this._inLockTimeout, this.options.lockRenewalTimeout);
        try {
            let insta = this._createWFInstance();
            let result = yield (insta.create(workflow, workflowVersion, methodName, args, lockInfo));

            if (insta.execState === enums.activityStates.idle) {
                this._knownRunningInstances.add(workflowName, insta);

                // Persist and unlock:
                let err = null;
                try {
                    yield this._persistence.persistState(insta);
                    this.onStart(insta, methodName, args);
                }
                catch (e) {
                    debug("Cannot persist instance of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
                    this._knownRunningInstances.remove(workflowName, insta.id);
                    err = e;
                }
                try {
                    yield this._persistence.exitLock(lockInfo.id);
                }
                catch (e) {
                    debug("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
                    this.onWarn(e);
                }
                if (err) {
                    throw err;
                }

                return result;
            }
            else {
                return result;
            }
        }
        finally {
            keepLockAlive.end();
        }
    }
});

WorkflowHost.prototype._throwIfRecoverable = function (error, workflowName, methodName) {
    if (error instanceof errors.MethodIsNotAccessibleError) {
        debug("Method '%s' of workflow '%s' is not accessible at the current state, bacause it might be stepped on another instance to another state tha is exists at current in this host. Client should retry.", methodName, workflowName);
        throw error;
    }
};

WorkflowHost.prototype._invokeMethodOnRunningInstance = async(function* (instanceId, workflowName, methodName, args) {
    let self = this;

    if (!self._persistence) {
        let insta = yield (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
        try {
            let result = yield (insta.callMethod(methodName, args));
            if (insta.execState === enums.activityStates.idle) {
                this.onInvoke(insta, methodName, args, result, true, null);
                return result;
            }
            else if (insta.execState === enums.activityStates.complete) {
                self._deleteWFInstance(insta);
                this.onInvoke(insta, methodName, args, result, false, null);
                this.onEnd(insta, result, false, null);
                return result;
            }
            else {
                throw new errors.WorkflowError("Instance '" + insta.id + "' is in an invalid state '" + insta.execState + "' after invocation of the method '" + methodName + "'.");
            }
        }
        catch (e) {
            this._throwIfRecoverable(e, workflowName, methodName);
            self._deleteWFInstance(insta);
            this.onInvoke(insta, methodName, args, undefined, false, e);
            this.onEnd(insta, undefined, false, e);
            throw e;
        }
    }
    else {
        // Lock it:
        let lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
        let lockInfo;
        let keepLockAlive = null;
        try {
            debug("Locking instance.");
            lockInfo = yield (self._persistence.enterLock(lockName, self.options.enterLockTimeout, self._inLockTimeout));
            debug("Locked: %j", lockInfo);

            // When lock will held, then we should keep it alive:
            keepLockAlive = new KeepLockAlive(self._persistence, lockInfo, self._inLockTimeout, self.options.lockRenewalTimeout);

            // LOCKED
            let insta = yield (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
            let endWithError = async(function*(e) {
                self._deleteWFInstance(insta);
                try {
                    yield (self._persistence.removeState(workflowName, insta.id, false, e));
                }
                catch (removeE) {
                    debug("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + removeE.stack);
                    self.onWarn(removeE);
                }
                self.onInvoke(insta, methodName, args, undefined, false, e);
                self.onEnd(insta, undefined, false, e);
            });
            try {
                let persistAndUnlock = function () {
                    return self._persistence.persistState(insta)
                        .finally(function () {
                            debug("Unlocking: %j", lockInfo);
                            return self._persistence.exitLock(lockInfo.id)
                                .then(function () {
                                    debug("Unlocked.");
                                },
                                function (e) {
                                    debug("Cannot exit lock for workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
                                    self.onWarn(e);
                                })
                                .finally(function () {
                                    keepLockAlive.end();
                                });
                        });
                };
                let result = yield (insta.callMethod(methodName, args));
                if (insta.execState === enums.activityStates.idle) {
                    // Persist and unlock:
                    if (self.options.lazyPersistence) {
                        setImmediate(function () {
                            persistAndUnlock()
                                .then(function () {
                                    self.onInvoke(insta, methodName, args, result, true, null);
                                },
                                function(e) {
                                    endWithError(e);
                                });
                        });
                    }
                    else {
                        yield persistAndUnlock();
                        this.onInvoke(insta, methodName, args, result, true, null);
                    }

                    return result;
                }
                else if (insta.execState === enums.activityStates.complete) {
                    self._deleteWFInstance(insta);
                    this.onInvoke(insta, methodName, args, result, false, null);
                    this.onEnd(insta, result, false, null);
                    try {
                        try {
                            yield self._persistence.removeState(workflowName, insta.id, true);
                        }
                        catch (e) {
                            debug("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
                            this.onWarn(e);
                        }

                        try {
                            yield self._persistence.exitLock(lockInfo.id);
                        }
                        catch (e) {
                            debug("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
                            this.onWarn(e);
                        }
                    }
                    finally {
                        keepLockAlive.end();
                    }
                    return result;
                }
                else {
                    throw new errors.WorkflowError("Instance '" + insta.id + "' is in an invalid state '" + insta.execState + "' after invocation of the method '" + methodName + "'.");
                }
            }
            catch (e) {
                this._throwIfRecoverable(e, workflowName, methodName);
                yield endWithError(e);
                throw e;
            }
        }
        catch (e) {
            if (keepLockAlive) {
                keepLockAlive.end();
            }
            if (lockInfo) {
                try {
                    yield self._persistence.exitLock(lockInfo.id);
                }
                catch (exitE) {
                    debug("Cannot exit lock '" + lockInfo.id + "':\n" + exitE.stack);
                    this.onWarn(exitE);
                }
            }
            if (e instanceof errors.TimeoutError) {
                let msg = "Cannot call method of workflow '" + workflowName + "', because '" + methodName + "' is locked.";
                debug(msg);
                throw new errors.MethodIsNotAccessibleError(msg);
            }
            throw e;
        }
    }
});

WorkflowHost.prototype._enterLockForCreatedInstance = async(function* (insta, lockInfo) {
    let li = yield (this._persistence.enterLock(specStrings.hosting.doubleKeys(insta.workflowName, insta.id), this.options.enterLockTimeout, this._getInLockTimeout()));
    if (yield (this._persistence.isRunning(insta.workflowName, insta.id))) {
        throw new errors.WorkflowError("Cannot create instance of workflow '" + insta.workflowName + "' by id '" + insta.id + "' because it's already exists.");
    }
    lockInfo.id = li.id;
    lockInfo.name = li.name;
    lockInfo.heldTo = li.heldTo;
});

WorkflowHost.prototype._getInLockTimeout = function () {
    return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
};

WorkflowHost.prototype._verifyAndRestoreInstanceState = async(function* (instanceId, workflowName, methodName, args) {
    let self = this;
    let insta = null;
    if (self._persistence) {
        let header = yield (self._persistence.getRunningInstanceIdHeader(workflowName, instanceId));
        if (header) {
            insta = yield (self._restoreInstanceState(instanceId, workflowName, header.workflowVersion, header.updatedOn));
        }
    }
    else {
        insta = self._knownRunningInstances.get(workflowName, instanceId);
    }
    if (!insta) {
        throw new errors.WorkflowNotFoundError(`Worflow (name: '${workflowName}', id: '${instanceId}') has been deleted since the lock has been taken.`);
    }

    return insta;
});

WorkflowHost.prototype._restoreInstanceState = async(function* (instanceId, workflowName, workflowVersion, actualTimestamp) {
    let self = this;

    if (!self._persistence) {
        throw new Error("Cannot restore instance from persistence, because host has no persistence registered.");
    }

    let insta = self._knownRunningInstances.get(workflowName, instanceId);
    if (_.isUndefined(insta)) {
        let wfDesc = self._registry.getDesc(workflowName, workflowVersion);
        insta = self._createWFInstance();
        insta.setWorkflow(wfDesc.workflow, workflowVersion, instanceId);
    }

    if (insta.updatedOn === null || insta.updatedOn.getTime() !== actualTimestamp.getTime() || self.options.alwaysLoadState) {
        let state = yield (self._persistence.loadState(workflowName, instanceId));
        insta.restoreState(state);
        return insta;
    }
    else {
        return insta;
    }
});

WorkflowHost.prototype._checkIfInstanceRunning = async(function* (workflowName, instanceId) {
    if (this._persistence) {
        return (yield this._persistence.isRunning(workflowName, instanceId));
    }
    return this._knownRunningInstances.exists(workflowName, instanceId);
});

WorkflowHost.prototype._getRunningInstanceHeadersForOtherVersion = async(function* (workflowName, version) {
    if (this._persistence) {
        return (yield this._persistence.getRunningInstanceHeadersForOtherVersion(workflowName, version));
    }
    return this._knownRunningInstances.getRunningInstanceHeadersForOtherVersion(workflowName, version);
});

WorkflowHost.prototype.addTracker = function (tracker) {
    this._verify();

    if (!_.isObject(tracker)) {
        throw new TypeError("Argument is not an object.");
    }
    this._trackers.push(tracker);
    this._knownRunningInstances.addTracker(tracker);
};

/* Wake Up*/

WorkflowHost.prototype._continueWokeUpInstance = async(function*(wakeupable) {
    if (this._shutdown) {
        wakeupable.result.resolve();
        return;
    }
    if (!this._persistence) {
        wakeupable.result.reject(new errors.WorkflowError("Handling Delays in host is not supported without persistence."));
        return;
    }

    assert(_.isPlainObject(wakeupable));
    assert(_.isString(wakeupable.instanceId));
    assert(_.isString(wakeupable.workflowName));
    assert(_.isPlainObject(wakeupable.activeDelay));
    assert(_.isString(wakeupable.activeDelay.methodName));
    assert(_.isDate(wakeupable.activeDelay.delayTo));
    assert(_.isFunction(wakeupable.result.resolve));
    assert(_.isFunction(wakeupable.result.reject));

    try {
        //instanceId, workflowName, methodName, args
        debug("Invoking DelayTo instanceId: %s, workflowName:%s, methodName: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
        let result = yield this._invokeMethodOnRunningInstance(wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, [wakeupable.instanceId, wakeupable.activeDelay.delayTo]);
        debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s invoked.", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
        wakeupable.result.resolve();
    }
    catch (e) {
        if (e instanceof errors.MethodIsNotAccessibleError || e instanceof errors.WorkflowNotFoundError) {
            debug("DelayTo's method is not accessible since it got selected for continuation.");
            wakeupable.result.resolve();
            return;
        }
        debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s error: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, e.stack);
        wakeupable.result.reject(e);
    }
});

WorkflowHost.prototype._createWFInstance = function () {
    let self = this;
    let insta = new WorkflowInstance(this);
    insta.on(
        enums.events.workflowEvent,
        function (args) {
            self.onWorkflowEvent(args);
        });
    return insta;
};

WorkflowHost.prototype._deleteWFInstance = function (insta) {
    insta.removeAllListeners();
    this._knownRunningInstances.remove(insta.workflowName, insta.id);
};

/* Shutdown */

WorkflowHost.prototype._verify = function () {
    if (this._shutdown) {
        throw new errors.WorkflowError("Workflow host has been shut down.");
    }
};

WorkflowHost.prototype.shutdown = function () {
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
