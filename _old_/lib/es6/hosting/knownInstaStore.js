"use strict";

let specStrings = require("../common/specStrings");
let InstIdPaths = require("./instIdPaths");
let _ = require("lodash");
let debug = require("debug")("wf4node:KnownInstaStore");
let enums = require("../common/enums");

function KnownInstaStore() {
    this._instances = new Map();
}

KnownInstaStore.prototype.add = function (workflowName, insta) {
    this._instances.set(specStrings.hosting.doubleKeys(workflowName, insta.id), insta);
};

KnownInstaStore.prototype.get = function (workflowName, instanceId) {
    return this._instances.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

KnownInstaStore.prototype.exists = function (workflowName, instanceId) {
    return this._instances.has(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

KnownInstaStore.prototype.remove = function (workflowName, instanceId) {
    this._instances.delete(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

KnownInstaStore.prototype.getNextWakeupables = function (count) {
    let now = new Date();
    let result = [];
    for (let insta of this._instances.values()) {
        if (insta.execState === enums.activityStates.idle && insta.activeDelays) {
            for (let ad of insta.activeDelays) {
                if (ad.delayTo <= now) {
                    result.push({
                        instanceId: insta.id,
                        workflowName: insta.workflowName,
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

KnownInstaStore.prototype.getRunningInstanceHeadersForOtherVersion = function(workflowName, version) {
    let result = [];
    for (let insta of this._instances.values()) {
        if (insta.workflowName === workflowName && insta.version !== version) {
            result.push({
                workflowName: insta.workflowName,
                workflowVersion: insta.workflowVersion,
                instanceId: insta.id
            });
        }
    }
    return result;
};

KnownInstaStore.prototype.addTracker = function(tracker) {
    for (let insta of this._instances.values()) {
        insta.addTracker(tracker);
    }
};

module.exports = KnownInstaStore;
