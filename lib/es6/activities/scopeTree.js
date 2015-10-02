"use strict";

let ScopeNode = require("./scopeNode");
let guids = require("../common/guids");
let _ = require("lodash");
let specStrings = require("../common/specStrings");
let errors = require("../common/errors");
let is = require("../common/is");
let scope = require("./scope");
let Expression = require("./expression");
let scopeSerializer = require("./scopeSerializer");

function ScopeTree(initialScope, getActivityByIdFunc) {
    this._initialNode = new ScopeNode(guids.ids.initialScope, initialScope);
    this._nodes = new Map();
    this._nodes.set(this._initialNode.instanceId, this._initialNode);
    this._getActivityById = getActivityByIdFunc;
}

/* SERIALIZATION */
ScopeTree.prototype.getExecutionState = function (execContext, enablePromotions, serializer) {
    return scopeSerializer.serialize(execContext, this._getActivityById, enablePromotions, this._nodes.values(), serializer);
};

ScopeTree.prototype.setState = function (json, serializer) {
    if (!_.isArray(json)) {
        throw new TypeError("Array argument expected.");
    }

    if (this._nodes.count !== 1) {
        let prev = this._nodes;
        this._nodes = new Map();
        this._nodes.set(guids.ids.initialScope, prev.get(guids.ids.initialScope));
        this._initialNode.clearChildren();
    }

    try {
        // Create nodes:
        for (let node of scopeSerializer.deserializeNodes(this._getActivityById, json, serializer)) {
            this._nodes.set(node.instanceId, node);
        }
        // Setup Tree:
        for (let item of json) {
            this._nodes.get(item.instanceId).parent = this._nodes.get(item.parentId);
        }
    }
    catch (e) {
        throw new errors.WorkflowError("Cannot restore state tree, because data is corrupt. Inner error: " + e.stack);
    }
};
/* SERIALIZATION */

/* PROXY */

ScopeTree.prototype._getRealParent = function (currentNode) {
    let parent = currentNode.parent;
    if (this._getActivityById(currentNode.instanceId) instanceof Expression) {
        parent = parent.parent;
    }
    return parent;
};

ScopeTree.prototype.hasProperty = function (currentNode, name, noWalk) {
    if (name === "$parent") {
        let parent = this._getRealParent(currentNode);
        if (parent && parent !== this._initialNode) {
            return !!parent;
        }
    }

    if (name === "$activity") {
        return true;
    }

    let found = false;
    for (let node of currentNode.walkToRoot(noWalk)) {
        if (node.isPropertyExists(name)) {
            found = true;
            break;
        }
        if (node.userId === name) {
            found = true;
            break;
        }
    }
    return found;
};

ScopeTree.prototype.getValue = function (currentNode, name, noWalk) {
    let self = this;

    if (name === "$parent") {
        let parent = this._getRealParent(currentNode);
        if (parent && parent !== this._initialNode) {
            let parentScope = scope.create(this, parent, true);
            parentScope.__marker = guids.markers.$parent;
            return parentScope;
        }
        else {
            return undefined;
        }
    }

    if (name === "$activity") {
        return self._getActivityById(currentNode.instanceId);
    }

    let canReturnPrivate = true;
    let value;
    for (let node of currentNode.walkToRoot(noWalk)) {
        if (!_.isUndefined(value = node.getPropertyValue(name, canReturnPrivate))) {
            break;
        }
        if (node.userId === name) {
            value = scope.create(self, node, true);
            break;
        }
        canReturnPrivate = false;
    }
    return value;
};

ScopeTree.prototype.setValue = function (currentNode, name, value, noWalk) {
    if (this.isOnInitial) {
        throw new Error("Cannot set property of the initial scope.");
    }

    let self = this;
    let canSetPrivate = true;
    let setDone = false;
    for (let node of currentNode.walkToRoot(noWalk)) {
        if (node === self._initialNode) {
            break;
        }
        if (node.setPropertyValue(name, value, canSetPrivate)) {
            setDone = true;
            break;
        }
        canSetPrivate = false;
    }

    if (!setDone) {
        currentNode.createPropertyWithValue(name, value);
    }

    return true;
};

ScopeTree.prototype.deleteProperty = function (currentNode, name, noWalk) {
    let self = this;
    let canDeletePrivate = true;
    let deleteDone = false;
    for (let node of currentNode.walkToRoot(noWalk)) {
        if (node === self._initialNode) {
            break;
        }
        if (node.deleteProperty(name, canDeletePrivate)) {
            deleteDone = true;
            break;
        }
        canDeletePrivate = false;
    }

    return deleteDone;
};

ScopeTree.prototype.enumeratePropertyNames = function* (currentNode, noWalk) {
    let canEnumeratePrivate = true;
    let node = currentNode;
    do
    {
        yield "$parent";
        yield "$activity";
        if (node.userId) {
            yield node.userId;
        }
        yield* node.enumeratePropertyNames(canEnumeratePrivate);
        canEnumeratePrivate = false;

        if (noWalk) {
            break;
        }

        node = node.parent;
    }
    while (node);
};
/* PROXY */

/* WALK */
ScopeTree.prototype.next = function (nodeInstanceId, childInstanceId, scopePart, childUserId) {
    let currentNode = this._getNodeByExternalId(nodeInstanceId);
    let nextNode = new ScopeNode(childInstanceId, scopePart, childUserId);
    currentNode.addChild(nextNode);
    this._nodes.set(childInstanceId, nextNode);
    return scope.create(this, nextNode);
};

ScopeTree.prototype.back = function (nodeId, keepItem) {
    let currentNode = this._getNodeByExternalId(nodeId);
    if (currentNode === this._initialNode) {
        throw new Error("Cannot go back because current scope is the initial scope.");
    }
    let toRemove = currentNode;
    let goTo = toRemove.parent;
    currentNode = goTo;
    if (!keepItem) {
        goTo.removeChild(toRemove);
        this._nodes.delete(toRemove.instanceId);
    }
    return scope.create(this, currentNode);
};

ScopeTree.prototype.find = function (nodeId) {
    let currentNode = this._getNodeByExternalId(nodeId);
    return scope.create(this, currentNode);
};

ScopeTree.prototype.findPart = function (nodeId) {
    let currentNode = this._getNodeByExternalId(nodeId);
    if (currentNode !== this._initialNode) {
        return currentNode.scopePart;
    }
    return null;
};
/* WALK */

ScopeTree.prototype._getNodeByExternalId = function (id) {
    if (id === null) {
        return this._initialNode;
    }
    let node = this._nodes.get(id);
    if (!node) {
        throw new Error("Scope node for activity id '" + id + "' is not found.");
    }
    return node;
};

ScopeTree.prototype.deleteScopePart = function (currentNodeId, id) {
    let self = this;
    let currentNode = this._getNodeByExternalId(currentNodeId);
    let delNode = self._nodes.get(id);
    if (delNode) {
        if (delNode === self._initialNode) {
            throw new Error("Cannot delete the initial scope.");
        }
        let found = false;
        for (let node of delNode.walkToRoot()) {
            if (node === currentNode) {
                found = true;
                break;
            }
        }
        if (!found) {
            throw new Error("Cannot delete scope, because current active scope is inside in it.");
        }
        delNode.parent.removeChild(delNode);
        self._removeAllNodes(delNode);
    }
};

ScopeTree.prototype._removeAllNodes = function (node) {
    let self = this;

    self._nodes.delete(node.instanceId);
    for (let c of node.children()) {
        self._removeAllNodes(c);
    }
};

module.exports = ScopeTree;