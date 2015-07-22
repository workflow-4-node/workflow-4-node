"use strict";

let specStrings = require("../common/specStrings");
let is = require("../common/is");

function InstIdPaths() {
    this._map = new Map();
}

InstIdPaths.prototype.add = function (workflowName, methodName, instanceIdPath) {
    let key = specStrings.hosting.doubleKeys(workflowName, methodName);
    let inner = this._map.get(key);
    if (!inner) {
        inner = new Map();
        this._map.set(key, inner);
    }
    let count = inner.get(instanceIdPath) || 0;
    inner.set(instanceIdPath, count + 1);
};

InstIdPaths.prototype.remove = function (workflowName, methodName, instanceIdPath) {
    let key = specStrings.hosting.doubleKeys(workflowName, methodName);
    let inner = this._map.get(key);
    if (inner) {
        let count = inner.get(instanceIdPath);
        if (is.defined(count)) {
            if (count === 1) {
                this._map.delete(key);
            }
            else {
                inner.set(instanceIdPath, count - 1);
            }
        }
    }
    return false;
};

InstIdPaths.prototype.items = function* (workflowName, methodName) {
    let key = specStrings.hosting.doubleKeys(workflowName, methodName);
    let inner = this._map.get(key);
    if (inner) {
        for (let ik of inner.keys()) {
            yield ik;
        }
    }
};

module.exports = InstIdPaths;
