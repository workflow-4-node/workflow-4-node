"use strict";

let StrMap = require("backpack-node").collections.StrMap;
let specStrings = require("../common/specStrings");
let InstIdPaths = require("./instIdPaths");

function KnownInstaStore() {
    this._instances = new StrMap();
}

KnownInstaStore.prototype.add = function (workflowName, insta) {
    this._instances.add(specStrings.hosting.doubleKeys(workflowName, insta.id), insta);
};

KnownInstaStore.prototype.get = function (workflowName, instanceId) {
    return this._instances.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

KnownInstaStore.prototype.exists = function (workflowName, instanceId) {
    return this._instances.containsKey(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

KnownInstaStore.prototype.remove = function (workflowName, instanceId) {
    this._instances.remove(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

module.exports = KnownInstaStore;
