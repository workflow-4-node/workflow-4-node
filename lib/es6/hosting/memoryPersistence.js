"use strict";

let uuid = require('node-uuid');
require('date-utils');
let specStrings = require("../common/specStrings");
let InstIdPaths = require("./instIdPaths");
let is = require("../common/is");
let _ = require("lodash");

function MemoryPersistence(log) {
    this._instanceData = new Map();
    this._locksById = new Map();
    this._locksByName = new Map();
    this._log = log === true;
}

MemoryPersistence.prototype.enterLock = function (lockName, inLockTimeoutMs) {
    if (this._log) {
        console.log("enterLock(" + lockName + ", " + inLockTimeoutMs + ");\n");
    }

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
    if (this._log) {
        console.log("renewLock(" + lockId + ", " + inLockTimeoutMs + ");\n");
    }

    let cLock = this._getLockById(lockId);
    cLock.heldTo = new Date().addMilliseconds(inLockTimeoutMs);
};

MemoryPersistence.prototype.exitLock = function (lockId) {
    if (this._log) {
        console.log("exitLock(" + lockId + ");\n");
    }

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
    if (this._log) {
        console.log("isRunning(" + workflowName + ", " + instanceId + ");\n");
    }

    return this._instanceData.has(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

MemoryPersistence.prototype.persistState = function (state) {
    if (this._log) {
        console.log("persistState(" + state.workflowName + ", " + state.instanceId + ");\n");
    }

    this._instanceData.set(specStrings.hosting.doubleKeys(state.workflowName, state.instanceId), state);
};

MemoryPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId) {
    if (this._log) {
        console.log("getRunningInstanceIdHeader(" + workflowName + ", " + instanceId + ");\n");
    }

    let state = this._loadState(workflowName, instanceId);
    return {
        updatedOn: state.updatedOn,
        workflowVersion: state.workflowVersion
    };
};

MemoryPersistence.prototype.loadState = function (workflowName, instanceId) {
    if (this._log) {
        console.log("loadState(" + workflowName + ", " + instanceId + ");\n");
    }

    return this._loadState(workflowName, instanceId);
};

MemoryPersistence.prototype.removeState = function (workflowName, instanceId) {
    if (this._log) {
        console.log("removeState(" + workflowName + ", " + instanceId + ");\n");
    }

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
    if (this._log) {
        console.log("loadPromotedProperties(" + workflowName + ", " + instanceId + ");\n");
    }

    let state = this._instanceData.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    return state ? state.promotedProperties : null;
};

module.exports = MemoryPersistence;