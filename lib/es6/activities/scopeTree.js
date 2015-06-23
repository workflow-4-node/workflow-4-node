"use strict";

let ScopeNode = require("./scopeNode");
let guids = require("../common/guids");
let StrMap = require("backpack-node").collections.StrMap;
let StrSet = require("backpack-node").collections.StrSet;
let _ = require("lodash");
let specStrings = require("../common/specStrings");
let errors = require("../common/errors");
let is = require("../common/is");
let scope = require("./scope");
let fast = require("fast.js");

function ScopeTree(initialScope, getActivityByIdFunc) {
    this._initialNode = new ScopeNode(guids.ids.initialScope, initialScope);
    this._nodes = new StrMap();
    this._nodes.add(this._initialNode.id, this._initialNode);
    this._getActivityById = getActivityByIdFunc;
}

/* SERIALIZATION */
ScopeTree.prototype.getState = function (getPromotions) {
    let self = this;
    let state = [];
    let promotedProperties = getPromotions ? new StrMap() : null;

    self._nodes.forEachValue(
        function (node) {
            if (node.id === guids.ids.initialScope) {
                return;
            }

            let item = {
                id: node.id,
                parentId: node.parent ? node.parent.id : null,
                parts: []
            };

            let activity = self._getActivityById(node.id);

            node.forEachProperty(
                function (propertyName, propertyValue) {
                    if (!activity.nonSerializedProperties.exists(propertyName)) {
                        if (_.isArray(propertyValue)) {
                            let iPart = {
                                name: propertyName,
                                value: []
                            };
                            item.parts.push(iPart);
                            propertyValue.forEach(function (pv) {
                                if (is.activity(pv)) {
                                    iPart.value.push(specStrings.hosting.createActivityInstancePart(pv.id));
                                }
                                else {
                                    iPart.value.push(pv);
                                }
                            });
                        }
                        else if (is.activity(propertyValue)) {
                            item.parts.push(
                                {
                                    name: propertyName,
                                    value: specStrings.hosting.createActivityInstancePart(propertyValue.id)
                                });
                        }
                        else if (_.isFunction(propertyValue) && !activity.hasOwnProperty(propertyName) &&
                            _.isFunction(activity[propertyName])) {
                            item.parts.push(specStrings.hosting.createActivityPropertyPart(propertyName));
                        }
                        else if (_.isObject(propertyValue) && propertyValue === activity[propertyName]) {
                            item.parts.push(specStrings.hosting.createActivityPropertyPart(propertyName));
                        }
                        else {
                            item.parts.push({
                                name: propertyName,
                                value: propertyValue
                            });
                        }
                    }
                });
            state.push(item);

            // Promotions:
            if (promotedProperties && activity.promotedProperties) {
                activity.promotedProperties.forEach(
                    function (promotedPropName) {
                        let pv = node.getPropertyValue(promotedPropName, true);
                        if (is.defined(pv) && !(is.activity(pv))) {
                            let promotedEntry = promotedProperties.get(promotedPropName);
                            // If an Activity Id greater than other, then we can sure that other below or after in the tree.
                            if (is.undefined(promotedEntry) || node.id > promotedEntry.level) {
                                promotedProperties.add(promotedPropName, { level: node.id, value: pv });
                            }
                        }
                    });
            }
        });

    let actualPromotions = null;
    if (promotedProperties) {
        actualPromotions = {};
        if (promotedProperties.count) {
            promotedProperties.forEach(
                function (kvp) {
                    actualPromotions[kvp.key] = kvp.value.value;
                });
        }
    }

    return {
        state: state,
        promotedProperties: actualPromotions
    };
};

ScopeTree.prototype.setState = function (json) {
    let self = this;

    if (!_.isArray(json)) {
        throw new TypeError("Array argument expected.");
    }

    if (self._nodes.count !== 1) {
        // There are hidden idle state:
        self._nodes.forEachKey(
            function (key) {
                if (key === guids.ids.initialScope) {
                    return;
                }
                self._nodes.remove(key);
            });

        self._initialNode.clearChildren();
    }

    try {
        for (let item of json) {
            let scopePart = {};
            let activity = self._getActivityById(item.id);
            for (let part of item.parts) {
                let activityProperty = specStrings.hosting.getActivityPropertyName(part);
                if (activityProperty) {
                    if (_.isUndefined(scopePart[activityProperty] = activity[activityProperty])) {
                        throw new Error("Activity has no property '" + part + "'.");
                    }
                }
                else {
                    let activityId = specStrings.hosting.getActivityId(part.value);
                    if (activityId) {
                        scopePart[part.name] = self._getActivityById(activityId);
                    }
                    else if (_.isArray(part.value)) {
                        let scopePartValue = [];
                        scopePart[part.name] = scopePartValue;
                        for (let pv of part.value) {
                            activityId = specStrings.hosting.getActivityId(pv);
                            if (activityId) {
                                scopePartValue.push(self._getActivityById(activityId));
                            }
                            else {
                                scopePartValue.push(pv);
                            }
                        }
                    }
                    else {
                        scopePart[part.name] = part.value;
                    }
                }
            }
            let node = new ScopeNode(item.id, scopePart);
            self._nodes.add(item.id, node);
        }

        for (let item of json) {
            self._nodes.get(item.id).parent = self._nodes.get(item.parentId);
        }
    }
    catch (e) {
        throw new errors.WorkflowError("Cannot restore state tree, because data is corrupt. Inner error: " + e.stack);
    }
};
/* SERIALIZATION */

/* PROXY */
ScopeTree.prototype.hasProperty = function (currentNode, name) {
    let found = false;
    currentNode.forEachToRoot(function (node) {
        if (node.isPropertyExists(name)) {
            found = true;
            return false;
        }
    });
    return found;
};

ScopeTree.prototype.getValue = function (currentNode, name) {
    let canReturnPrivate = true;
    let value;
    currentNode.forEachToRoot(function (node) {
        if (is.defined(value = node.getPropertyValue(name, canReturnPrivate))) {
            return false;
        }
        canReturnPrivate = false;
    });
    return value;
};

ScopeTree.prototype.setValue = function (currentNode, name, value) {
    if (this.isOnInitial) {
        throw new Error("Cannot set property of the initial scope.");
    }

    let self = this;
    let canSetPrivate = true;
    let setDone = false;
    currentNode.forEachToRoot(function (node) {
        if (node === self._initialNode) {
            return false;
        }
        if (node.setPropertyValue(name, value, canSetPrivate)) {
            setDone = true;
            return false;
        }
        canSetPrivate = false;
    });

    if (!setDone) {
        currentNode.createPropertyWithValue(name, value);
    }

    return true;
};

ScopeTree.prototype.deleteProperty = function (currentNode, name) {
    let self = this;
    let canDeletePrivate = true;
    let deleteDone = false;
    currentNode.forEachToRoot(function (node) {
        if (node === self._initialNode) {
            return false;
        }
        if (node.deleteProperty(name, canDeletePrivate)) {
            deleteDone = true;
            return false;
        }
        canDeletePrivate = false;
    });

    return deleteDone;
};

ScopeTree.prototype.enumeratePropertyNames = function* (currentNode) {
    let canEnumeratePrivate = true;
    let node = currentNode;
    do
    {
        yield* node.enumeratePropertyNames(canEnumeratePrivate);
        canEnumeratePrivate = false;
        node = node.parent;
    }
    while (node);
};
/* PROXY */

/* WALK */
ScopeTree.prototype.next = function (nodeId, childId, scopePart) {
    let currentNode = this._getNodeByExternalId(nodeId);
    let nextNode = new ScopeNode(childId, scopePart);
    currentNode.addChild(nextNode);
    this._nodes.add(childId, nextNode);
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
        this._nodes.remove(toRemove.id);
    }
    return scope.create(this, currentNode);
};

ScopeTree.prototype.find = function (nodeId) {
    let currentNode = this._getNodeByExternalId(nodeId);
    return scope.create(this, currentNode);
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
        delNode.forEachToRoot(
            function (node) {
                if (node === currentNode) {
                    found = true;
                    return false;
                }
            });
        if (!found) {
            throw new Error("Cannot delete scope, because current active scope is inside in it.");
        }
        delNode.parent.removeChild(delNode);
        self._removeAllNodes(delNode);
    }
};

ScopeTree.prototype._removeAllNodes = function (node) {
    let self = this;

    self._nodes.remove(node.id);
    node.forEachChild(function (c) {
        self._removeAllNodes(c);
    });
};

module.exports = ScopeTree;