"use strict";

let specStrings = require("../common/specStrings");
let InstIdPaths = require("./instIdPaths");

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

module.exports = KnownInstaStore;
