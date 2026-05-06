"use strict";

let uuid = require('uuid');
require('date-utils');
let specStrings = require("../common/specStrings");
let InstIdPaths = require("./instIdPaths");
let is = require("../common/is");
let _ = require("lodash");
let debug = require("debug")("wf4node:MemoryPersistence");
let errors = require("../common/errors");

function MemoryPersistence() {
    this._instanceData = new Map();
    this._locksById = new Map();
    this._locksByName = new Map();
}

MemoryPersistence.prototype.clear = function () {
    this._instanceData.clear();
    this._locksById.clear();
    this._locksByName.clear();
};

MemoryPersistence.prototype.enterLock = function (lockName, inLockTimeoutMs) {
    debug("enterLock(%s, %d)", lockName, inLockTimeoutMs);

    let now = new Date();
    debug("Searching for lock by name %s", lockName);
    let cLock = this._locksByName.get(lockName);
    debug("Lock info: %j", cLock);
    if (!cLock || cLock.heldTo.getTime() < now.getTime()) {
        let lockInfo = {
            id: uuid.v4(),
            name: lockName,
            heldTo: now.addMilliseconds(inLockTimeoutMs)
        };

        this._locksById.set(lockInfo.id, lockInfo);
        this._locksByName.set(lockInfo.name, lockInfo);

        debug("LOCKED: %s", lockInfo.name);

        return lockInfo;
    }
    debug("It is already held.");
    return null;
};

MemoryPersistence.prototype.renewLock = function (lockId, inLockTimeoutMs) {
    debug("renewLock(%s, %d)", lockId, inLockTimeoutMs);

    let cLock = this._getLockById(lockId);
    cLock.heldTo = new Date().addMilliseconds(inLockTimeoutMs);
    debug("Lock %s extended to %s", lockId, cLock.heldTo);
};

MemoryPersistence.prototype.exitLock = function (lockId) {
    debug("exitLock(%s)", lockId);

    let cLock = this._getLockById(lockId);
    this._locksById.delete(cLock.id);
    this._locksByName.delete(cLock.name);

    debug("UNLOCKED: %s", cLock.name);
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

    state = _.clone(state);
    state.state = JSON.stringify(state.state);

    this._instanceData.set(specStrings.hosting.doubleKeys(state.workflowName, state.instanceId), state);
};

MemoryPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId) {
    debug("getRunningInstanceIdHeader(%s, %s)", workflowName, instanceId);

    let state = this._instanceData.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    if (!state) {
        return null;
    }
    return {
        updatedOn: state.updatedOn,
        workflowName: state.workflowName,
        workflowVersion: state.workflowVersion,
        instanceId: state.instanceId
    };
};

MemoryPersistence.prototype.loadState = function (workflowName, instanceId) {
    debug("loadState(%s, %s)", workflowName, instanceId);

    let state = this._loadState(workflowName, instanceId);
    state = _.clone(state);
    state.state = JSON.parse(state.state);
    return state;
};

MemoryPersistence.prototype.removeState = function (workflowName, instanceId) {
    debug("removeState(%s, %s)", workflowName, instanceId);

    this._instanceData.delete(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

MemoryPersistence.prototype._loadState = function (workflowName, instanceId) {
    let state = this._instanceData.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    if (!state) {
        throw new errors.WorkflowNotFoundError("Instance data of workflow '" + workflowName + "' by id '" + instanceId + "' is not found.");
    }
    return state;
};

MemoryPersistence.prototype.loadPromotedProperties = function (workflowName, instanceId) {
    debug("loadPromotedProperties(%s, %s)", workflowName, instanceId);

    let state = this._instanceData.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    return state ? state.promotedProperties : null;
};

MemoryPersistence.prototype.getNextWakeupables = function (count) {
    debug("getNextWakeupables(%d)", count);

    let now = new Date();
    let result = [];
    for (let data of this._instanceData.values()) {
        if (data.activeDelays) {
            for (let ad of data.activeDelays) {
                if (ad.delayTo <= now) {
                    result.push({
                        instanceId: data.instanceId,
                        workflowName: data.workflowName,
                        updatedOn: data.updatedOn,
                        activeDelay: {
                            methodName: ad.methodName,
                            delayTo: ad.delayTo
                        }
                    });
                }
            }
        }
    }
    result.sort(function (i1, i2) {
        if (i1.updatedOn < i2.updatedOn) {
            return -1;
        }
        else if (i1.updatedOn > i2.updatedOn) {
            return 1;
        }
        else if (i1.activeDelay.delayTo < i2.activeDelay.delayTo) {
            return -1;
        }
        else if (i1.activeDelay.delayTo > i2.activeDelay.delayTo) {
            return 1;
        }
        return 0;
    });
    return _.take(result, count);
};

MemoryPersistence.prototype.getRunningInstanceHeadersForOtherVersion = function (workflowName, version) {
    let result = [];
    for (let data of this._instanceData.values()) {
        if (data.workflowName === workflowName && data.version !== version) {
            result.push({
                workflowName: data.workflowName,
                workflowVersion: data.workflowVersion,
                instanceId: data.instanceId
            });
        }
    }
    return result;
};

module.exports = MemoryPersistence;