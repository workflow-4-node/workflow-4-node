"use strict";

let _ = require("lodash");
let WorkflowInstance = require("./workflowInstance");
let errors = require("../common/errors");
let asyncHelpers = require("../common/asyncHelpers");
let Promise = require("bluebird");
let async = asyncHelpers.async;

function WorkflowPersistence(impl) {
    if (!_.isObject(impl)) {
        throw new TypeError("Object argument expected.");
    }

    this._impl = impl;
}

WorkflowPersistence.prototype.enterLock = function (lockName, enterLockTimeoutMs, inLockTimeoutMs) {
    if (!_.isString(lockName)) {
        throw new TypeError("Argument 'lockName' is not a string.");
    }
    if (!_.isNumber(enterLockTimeoutMs)) {
        throw new TypeError("Argument 'enterLockTimeoutMs' is not a number.");
    }
    if (enterLockTimeoutMs < 1000) {
        throw new Error("Argument 'enterLockTimeoutMs' have to be above 1000ms.");
    }
    if (!_.isNumber(inLockTimeoutMs)) {
        throw new TypeError("Argument 'inLockTimeoutMs' is not a number.");
    }
    if (inLockTimeoutMs < 1000) {
        throw new Error("Argument 'inLockTimeoutMs' have to be above 1000ms.");
    }

    let self = this;
    return asyncHelpers.aggressiveRetry(
        function () {
            return Promise.resolve(self._impl.enterLock(lockName, inLockTimeoutMs))
        },
        function (lockInfo) {
            return lockInfo !== null;
        },
        enterLockTimeoutMs,
        function () {
            return new errors.WorkflowError("Entering lock '" + lockName + "' has timed out.");
        }
    );
};

WorkflowPersistence.prototype.renewLock = function (lockId, inLockTimeoutMs) {
    return Promise.resolve(this._impl.renewLock(lockId, inLockTimeoutMs));
};

WorkflowPersistence.prototype.exitLock = function (lockId) {
    return Promise.resolve(this._impl.exitLock(lockId));
};

WorkflowPersistence.prototype.isRunning = function (workflowName, instanceId) {
    this._verifyArg(workflowName, "workflowName");

    return Promise.resolve(this._impl.isRunning(workflowName, instanceId));
};

WorkflowPersistence.prototype.persistState = function (instance) {
    if (!(instance instanceof WorkflowInstance)) {
        throw new TypeError("WorkflowInstance argument expected.");
    }

    let data = instance.getStateToPersist();
    return Promise.resolve(this._impl.persistState(data));
};

WorkflowPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId) {
    this._verifyArg(workflowName, "workflowName");
    this._verifyArg(instanceId, "instanceId");

    return Promise.resolve(this._impl.getRunningInstanceIdHeader(workflowName, instanceId));
};

WorkflowPersistence.prototype.loadState = async(function* (workflowName, instanceId) {
    this._verifyArg(workflowName, "workflowName");

    // Without: idleMethods, promotedProperties
    let state = yield (Promise.resolve(this._impl.loadState(workflowName, instanceId)));
    if (!state) {
        throw new Error("Instance state of workflow '" + workflowName + "' by id '" + instanceId + "' is not found.");
    }
    return state;
});

WorkflowPersistence.prototype.removeState = function (workflowName, instanceId, succeeded, error) {
    this._verifyArg(workflowName, "workflowName");

    return Promise.resolve(this._impl.removeState(workflowName, instanceId, succeeded, error));
};

WorkflowPersistence.prototype.loadPromotedProperties = async(
    function* (workflowName, instanceId) {
        this._verifyArg(workflowName, "workflowName");

        // Without: idleMethods, promotedProperties
        return yield (Promise.resolve(this._impl.loadPromotedProperties(workflowName, instanceId)));
    });

WorkflowPersistence.prototype._verifyArg = function (argValue, argName) {
    if (!_(argValue).isString()) {
        throw new TypeError("Argument '" + argName + "' is not a string.");
    }
};

module.exports = WorkflowPersistence;
