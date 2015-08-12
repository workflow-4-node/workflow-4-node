"use strict";

let _ = require("lodash");
let WorkflowInstance = require("./workflowInstance");
let errors = require("../common/errors");
let asyncHelpers = require("../common/asyncHelpers");
let Bluebird = require("bluebird");
let async = asyncHelpers.async;
let assert = require("better-assert");

function WorkflowPersistence(impl) {
    assert(_.isObject(impl));

    this._impl = impl;
}

WorkflowPersistence.prototype.enterLock = function (lockName, enterLockTimeoutMs, inLockTimeoutMs) {
    assert(_.isString(lockName));
    assert(_.isNumber(enterLockTimeoutMs));
    assert(enterLockTimeoutMs >= 1000);
    assert(_.isNumber(inLockTimeoutMs));
    assert(inLockTimeoutMs >= 1000);

    let self = this;
    return asyncHelpers.aggressiveRetry(
        function () {
            return Bluebird.resolve(self._impl.enterLock(lockName, inLockTimeoutMs));
        },
        function (lockInfo) {
            return lockInfo !== null;
        },
        enterLockTimeoutMs,
        function () {
            return new errors.TimeoutError("Entering lock '" + lockName + "' has timed out.");
        }
    );
};

WorkflowPersistence.prototype.renewLock = function (lockId, inLockTimeoutMs) {
    assert(!!lockId);
    assert(inLockTimeoutMs > 0);

    return Bluebird.resolve(this._impl.renewLock(lockId, inLockTimeoutMs));
};

WorkflowPersistence.prototype.exitLock = function (lockId) {
    assert(!!lockId);

    return Bluebird.resolve(this._impl.exitLock(lockId));
};

WorkflowPersistence.prototype.isRunning = function (workflowName, instanceId) {
    assert(_.isString(workflowName));
    assert(!!instanceId);

    return Bluebird.resolve(this._impl.isRunning(workflowName, instanceId));
};

WorkflowPersistence.prototype.persistState = function (instance) {
    assert(instance instanceof WorkflowInstance);

    let data = instance.getStateToPersist();
    return Bluebird.resolve(this._impl.persistState(data));
};

WorkflowPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId) {
    assert(_.isString(workflowName));
    assert(!!instanceId);

    return Bluebird.resolve(this._impl.getRunningInstanceIdHeader(workflowName, instanceId));
};

WorkflowPersistence.prototype.loadState = async(function* (workflowName, instanceId) {
    assert(_.isString(workflowName));
    assert(!!instanceId);

    // Without: idleMethods, promotedProperties
    let state = yield (Bluebird.resolve(this._impl.loadState(workflowName, instanceId)));
    if (!state) {
        throw new Error("Instance state of workflow '" + workflowName + "' by id '" + instanceId + "' is not found.");
    }
    return state;
});

WorkflowPersistence.prototype.removeState = function (workflowName, instanceId, succeeded, error) {
    assert(_.isString(workflowName));
    assert(!!instanceId);
    assert(_.isBoolean(succeeded));

    return Bluebird.resolve(this._impl.removeState(workflowName, instanceId, succeeded, error));
};

WorkflowPersistence.prototype.loadPromotedProperties = function (workflowName, instanceId) {
    assert(_.isString(workflowName));
    assert(!!instanceId);

    return Bluebird.resolve(this._impl.loadPromotedProperties(workflowName, instanceId));
};

WorkflowPersistence.prototype.getNextWakeupables = function (count) {
    assert(count > 0);

    return Bluebird.resolve(this._impl.getNextWakeupables(count));
};

module.exports = WorkflowPersistence;
