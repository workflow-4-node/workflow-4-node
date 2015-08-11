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

function WorkflowHost(options) {
    EventEmitter.call(this);

    this._registry = new WorkflowRegistry();
    this._trackers = [];
    this._isInitialized = false;
    this._instanceIdParser = new InstanceIdParser();
    this._persistence = null;
    this._options = _.extend(
        {
            enterLockTimeout: 10000,
            lockRenewalTimeout: 5000,
            alwaysLoadState: false,
            lazyPersistence: true,
            persistence: null,
            serializer: null,
            enablePromotions: false,
            wakeUpInterval: 5000
        },
        options);

    if (this._options.persistence !== null) {
        this._persistence = new WorkflowPersistence(this._options.persistence);
    }
    this._knownRunningInstances = new KnownInstaStore();
    this._wakeUp = null;
    this._shutdown = false;
}

utils.inherits(WorkflowHost, EventEmitter);

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

        _inLockTimeout: {
            get: function () {
                return this.options.lockRenewalTimeout + Math.max(this.options.lockRenewalTimeout * 0.4, 3000);
            }
        }
    });

WorkflowHost.prototype.registerWorkflow = function (workflow) {
    this._verify();
    this._registry.register(workflow);
    this.emit("registered", { name: workflow.name, version: workflow.version });
};

WorkflowHost.prototype.registerActivity = function (activity, name, version) {
    this._verify();
    if (!(activity instanceof Activity)) {
        throw new TypeError("Activity argument expected.");
    }
    let wf = new Workflow();
    wf.name = name;
    wf.version = version;
    wf.args = [activity];
    this._registry.register(wf);
};

WorkflowHost.prototype._initialize = function () {
    let self = this;
    if (!this._isInitialized) {
        if (this._options.wakeUpInterval > 0) {
            this._wakeUp = new WakeUp(this._knownRunningInstances, this._persistence, { interval: this._options.wakeUpInterval });
            this._wakeUp.on("continue", function (i) { self._continueWokeUpInstance(i); });
            this._wakeUp.start();
        }

        this._isInitialized = true;
    }
};

WorkflowHost.prototype.invokeMethod = async(function* (workflowName, methodName, args) {
    this._verify();

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
    let creatableWorkflow = null;

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

    for (let i = 0; i < results.length; i++) {
        let result = results[i];
        if (result.info.canCreateInstance && (!creatableWorkflow || creatableWorkflow.version < result.info.workflow)) {
            creatableWorkflow = result.info.workflow;
        }
        if (!instanceId && (yield self._checkIfInstanceRunning(workflowName, result.id))) {
            instanceId = result.id;
            break;
        }
    }

    if (instanceId) {
        return yield (self._invokeMethodOnRunningInstance(instanceId, workflowName, methodName, args));
    }
    else if (creatableWorkflow) {
        return yield (self._createInstanceAndInvokeMethod(creatableWorkflow, workflowName, methodName, args));
    }
    else {
        throw new errors.WorkflowError("Cannot create or continue workflow '" + workflowName + "' by calling method '" + methodName + "'.");
    }
});

WorkflowHost.prototype._createInstanceAndInvokeMethod = async(
    function* (workflow, workflowName, methodName, args) {
        let self = this;

        let lockInfo = null;

        if (!self._persistence) {
            let insta = new WorkflowInstance(self);
            let result = yield (insta.create(workflow, methodName, args, lockInfo));
            self._knownRunningInstances.add(workflowName, insta);
            return result;
        }
        else {
            lockInfo = {
                id: null,
                name: null,
                heldTo: null
            };
            // When lock will held, then we should keep it alive:
            let keepLockAlive = new KeepLockAlive(self._persistence, lockInfo, self._inLockTimeout, self.options.lockRenewalTimeout);
            try {
                let insta = new WorkflowInstance(self);
                let result = yield (insta.create(workflow, methodName, args, lockInfo));

                if (insta.execState === enums.ActivityStates.idle) {
                    self._knownRunningInstances.add(workflowName, insta);

                    // Persist and unlock:
                    try {
                        yield self._persistence.persistState(insta);
                    }
                    catch (e) {
                        console.log("Cannot persist instance of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
                        self._knownRunningInstances.remove(workflowName, insta.id);
                    }
                    try {
                        yield self._persistence.exitLock(lockInfo.id);
                    }
                    catch (e) {
                        console.log("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
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

WorkflowHost.prototype._invokeMethodOnRunningInstance = async(
    function* (instanceId, workflowName, methodName, args) {
        let self = this;

        if (!self._persistence) {
            let insta = yield (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
            try {
                let result = yield (insta.callMethod(methodName, args));
                if (insta.execState === enums.ActivityStates.idle) {
                    return result;
                }
                else if (insta.execState === enums.ActivityStates.complete) {
                    self._knownRunningInstances.remove(workflowName, insta.id);
                    return result;
                }
                else {
                    throw new errors.WorkflowError("Instance '" + insta.id + "' is in an invalid state '" + insta.execState + "' after invocation of the method '" + methodName + "'.");
                }
            }
            catch (e) {
                self._knownRunningInstances.remove(workflowName, insta.id);
                throw e;
            }
        }
        else {
            // Lock it:
            let lockName = specStrings.hosting.doubleKeys(workflowName, instanceId);
            let lockInfo = yield (self._persistence.enterLock(lockName, self.options.enterLockTimeout, self._inLockTimeout));
            let keepLockAlive = false;
            try {
                // When lock will held, then we should keep it alive:
                keepLockAlive = new KeepLockAlive(self._persistence, lockInfo, self._inLockTimeout, self.options.lockRenewalTimeout);

                // LOCKED
                let insta = yield (self._verifyAndRestoreInstanceState(instanceId, workflowName, methodName, args));
                try {
                    let result = yield (insta.callMethod(methodName, args));
                    if (insta.execState === enums.ActivityStates.idle) {
                        // Persist and unlock:

                        let persistAndUnlock = function () {
                            return self._persistence.persistState(insta)
                                .catch(function (e) {
                                    console.log("Cannot persist instance for workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
                                    self._knownRunningInstances.remove(workflowName, insta.id);
                                })
                                .finally(function () {
                                    return self._persistence.exitLock(lockInfo.id)
                                        .catch(function (e) {
                                            console.log("Cannot exit lock for workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
                                        })
                                        .finally(function () {
                                            keepLockAlive.end();
                                        });
                                });
                        };

                        if (self.options.lazyPersistence) {
                            setImmediate(persistAndUnlock);
                        }
                        else {
                            yield persistAndUnlock();
                        }

                        return result;
                    }
                    else if (insta.execState === enums.ActivityStates.complete) {
                        self._knownRunningInstances.remove(workflowName, insta.id);
                        try {
                            try {
                                yield self._persistence.removeState(workflowName, insta.id, true);
                            }
                            catch (e) {
                                console.log("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
                            }

                            try {
                                yield self._persistence.exitLock(lockInfo.id);
                            }
                            catch (e) {
                                console.log("Cannot exit lock of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + e.stack);
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
                    self._knownRunningInstances.remove(workflowName, insta.id);
                    if (self._persistence) {
                        try {
                            yield (self._persistence.removeState(workflowName, insta.id, false, e));
                        }
                        catch (removeE) {
                            console.log("Cannot remove state of workflow name: '" + workflowName + "' instance id '" + insta.id + "':\n" + removeE.stack);
                        }
                    }
                    throw e;
                }
            }
            catch (e) {
                if (keepLockAlive) {
                    keepLockAlive.end();
                }
                try {
                    yield self._persistence.exitLock(lockInfo.id);
                }
                catch (exitE) {
                    console.log("Cannot exit lock '" + lockInfo.id + "':\n" + exitE.stack);
                }
                throw e;
            }
        }
    });

WorkflowHost.prototype._enterLockForCreatedInstance = async(
    function* (insta, lockInfo) {
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

WorkflowHost.prototype._verifyAndRestoreInstanceState = async(
    function* (instanceId, workflowName, methodName, args) {
        let self = this;
        let insta = null;
        let errorText = function () {
            return "Instance '" + instanceId + "' has been invoked elsewhere since the lock took in the current host.";
        };
        if (self._persistence) {
            try {
                let header = yield (self._persistence.getRunningInstanceIdHeader(workflowName, instanceId));
                insta = yield (self._restoreInstanceState(instanceId, workflowName, header.workflowVersion, header.updatedOn));
            }
            catch (e) {
                if (e instanceof errors.WorkflowError) {
                    throw e;
                }
                throw new errors.WorkflowError(errorText() + "\nInner error:\n" + e.stack.toString());
            }
        }
        else {
            insta = self._knownRunningInstances.get(workflowName, instanceId);
            if (!insta) {
                throw new errors.WorkflowError(errorText() + " Inner error: instance " + instanceId + " is unknown.");
            }
        }

        return insta;
    });

WorkflowHost.prototype._restoreInstanceState = async(
    function* (instanceId, workflowName, workflowVersion, actualTimestamp) {
        let self = this;

        if (!self._persistence) {
            throw new Error("Cannot restore instance from persistence, because host has no persistence registered.");
        }

        let insta = self._knownRunningInstances.get(workflowName, instanceId);
        if (_.isUndefined(insta)) {
            let wfDesc = self._registry.getDesc(workflowName, workflowVersion);
            insta = new WorkflowInstance(this);
            insta.setWorkflow(wfDesc.workflow, instanceId);
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
    if (this._knownRunningInstances.exists(workflowName, instanceId)) {
        return true;
    }
    if (this._persistence) {
        return (yield this._persistence.isRunning(workflowName, instanceId));
    }
    return false;
});

WorkflowHost.prototype.addTracker = function (tracker) {
    this._verify();

    if (!_.isObject(tracker)) {
        throw new TypeError("Argument is not an object.");
    }
    this._trackers.push(tracker);
    // TODO: add tracker to all instances
};

/* Wake Up*/

WorkflowHost.prototype._continueWokeUpInstance = async(function*(wakeupable) {
    assert(_.isPlainObject(wakeupable));
    assert(_.isString(wakeupable.instanceId));
    assert(_.isString(wakeupable.workflowName));
    assert(_.isPlainObject(wakeupable.activeDelay));
    assert(_.isString(wakeupable.activeDelay.methodName));
    assert(_.isString(wakeupable.activeDelay.delayTo));
    assert(_.isFunction(wakeupable.result.resolve));
    assert(_.isFunction(wakeupable.result.reject));

    try {
        //instanceId, workflowName, methodName, args
        debug("Invoking DelayTo instanceId: %s, workflowName:%s, methodName: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
        let result = yield this._invokeMethodOnRunningInstance(wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, [wakeupable.instanceId, wakeupable.activeDelay.delayTo]);
        debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s invoked.", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName);
        wakeupable.result.resolve(result);
    }
    catch (e) {
        debug("DelayTo instanceId: %s, workflowName:%s, methodName: %s error: %s", wakeupable.instanceId, wakeupable.workflowName, wakeupable.activeDelay.methodName, e.stack);
        if (e instanceof errors.TimeoutError) {
            debug("It is locked for processing in an other instance. Try later.");
            wakeupable.result.resolve(result);
        }
        if (e instanceof errors.WorkflowError) {
            debug("It was executed for another state. Try later.")
            wakeupable.result.resolve(result);
        }
        wakeupable.result.reject(e);
    }
});

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
        this._wakeUp = null;
    }

    this._shutdown = true;
};

module.exports = WorkflowHost;
