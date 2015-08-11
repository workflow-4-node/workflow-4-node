"use strict";

let uuid = require('node-uuid');
require('date-utils');
let specStrings = require("../common/specStrings");
let InstIdPaths = require("./instIdPaths");
let is = require("../common/is");
let _ = require("lodash");
let debug = require("debug")("wf4node:MemoryPersistence");

function MemoryPersistence() {
    this._instanceData = new Map();
    this._locksById = new Map();
    this._locksByName = new Map();
}

MemoryPersistence.prototype.enterLock = function (lockName, inLockTimeoutMs) {
    debug("enterLock(%s, %d)", lockName, inLockTimeoutMs);

    let now = new Date();
    let cLock = this._locksByName.get(lockName);
    if (_.isUndefined(cLock) || cLock.heldTo.compareTo(now) === -1) {
        let lockInfo = {
            id: uuid.v4(),
            name: lockName,
            heldTo: new Date().addMilliseconds(inLockTimeoutMs)
        };

        this._locksById.set(lockInfo.id, lockInfo);
        this._locksByName.set(lockInfo.name, lockInfo);

        return lockInfo;
    }
    return null;
};

MemoryPersistence.prototype.renewLock = function (lockId, inLockTimeoutMs) {
    debug("renewLock(%s, %d)", lockId, inLockTimeoutMs);

    let cLock = this._getLockById(lockId);
    cLock.heldTo = new Date().addMilliseconds(inLockTimeoutMs);
};

MemoryPersistence.prototype.exitLock = function (lockId) {
    debug("exitLock(%s)", lockId);

    let cLock = this._getLockById(lockId);
    this._locksByName.delete(cLock.name);
    this._locksById.delete(cLock.id);
};

MemoryPersistence.prototype._getLockById = function (lockId) {
    let cLock = this._locksById.get(lockId);
    let now = new Date();
    if (!cLock || now.compareTo(cLock.heldTo) > 0) {
        throw new Error("Lock by id '" + lockId + "' doesn't exists.");
    }
    return cLock;
};

MemoryPersistence.prototype.isRunning = function (workflowName, instanceId) {
    debug("isRunning(%s, %s)", workflowName, instanceId);

    return this._instanceData.has(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

MemoryPersistence.prototype.persistState = function (state) {
    debug("persistState(%j)", state);

    this._instanceData.set(specStrings.hosting.doubleKeys(state.workflowName, state.instanceId), state);
};

MemoryPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId) {
    debug("getRunningInstanceIdHeader(%s, %s)", workflowName, instanceId);

    let state = this._loadState(workflowName, instanceId);
    return {
        updatedOn: state.updatedOn,
        workflowVersion: state.workflowVersion
    };
};

MemoryPersistence.prototype.loadState = function (workflowName, instanceId) {
    debug("loadState(%s, %s)", workflowName, instanceId);

    return this._loadState(workflowName, instanceId);
};

MemoryPersistence.prototype.removeState = function (workflowName, instanceId) {
    debug("removeState(%s, %s)", workflowName, instanceId);

    this._instanceData.delete(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

MemoryPersistence.prototype._loadState = function (workflowName, instanceId) {
    let state = this._instanceData.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    if (!state) {
        throw new Error("Instance data of workflow '" + workflowName + "' by id '" + instanceId + "' is not found.");
    }
    return state;
};

MemoryPersistence.prototype.loadPromotedProperties = function (workflowName, instanceId) {
    debug("loadPromotedProperties(%s, %s)", workflowName, instanceId);

    let state = this._instanceData.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    return state ? state.promotedProperties : null;
};

module.exports = MemoryPersistence;