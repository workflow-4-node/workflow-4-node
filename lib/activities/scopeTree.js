var ScopeNode = require("./scopeNode");
var guids = require("../common/guids");
var StrMap = require("backpack-node").collections.StrMap;
var StrSet = require("backpack-node").collections.StrSet;
var _ = require("lodash");
var specStrings = require("../common/specStrings");
var errors = require("../common/errors");
var is = require("../common/is");
var scope = require("./scope");
var fast = require("fast.js");

function ScopeTree(initialScope, getActivityById)
{
    this._initialNode = new ScopeNode(guids.ids.initialScope, initialScope);
    this._nodes = new StrMap();
    this._nodes.add(this._initialNode.id, this._initialNode);
    this._currentNode = this._initialNode;
    this._getActivityById = getActivityById;
    this._activity = null;
    this.currentScope = scope.create(this);
}

Object.defineProperties(
    ScopeTree.prototype,
    {
        isOnInitial: {
            get: function ()
            {
                return this._currentNode === this._initialNode;
            }
        }
    }
);

/* SERIALIZATION */
ScopeTree.prototype.getState = function (getPromotions)
{
    var self = this;

    if (!self.isOnInitial) throw new Error("Cannot generate JSON state of state tree if it's not on initial state.");

    var state = [];
    var promotedProperties = getPromotions ? new StrMap() : null;

    self._nodes.forEachValue(
        function (node)
        {
            if (node.id === guids.ids.initialScope) return;

            var item = {
                id: node.id,
                parentId: node.parent ? node.parent.id : null,
                parts: []
            };

            var activity = self._getActivityById(node.id);

            node.forEachProperty(
                function (propertyName, propertyValue)
                {
                    if (!activity.nonSerializedProperties.exists(propertyName))
                    {
                        if (_.isArray(propertyValue))
                        {
                            var iPart = {
                                name: propertyName,
                                value: []
                            };
                            item.parts.push(iPart);
                            propertyValue.forEach(function (pv)
                            {
                                if (is.activity(pv))
                                {
                                    iPart.value.push(specStrings.hosting.createActivityInstancePart(pv.id));
                                }
                                else
                                {
                                    iPart.value.push(pv);
                                }
                            });
                        }
                        else if (is.activity(propertyValue))
                        {
                            item.parts.push(
                                {
                                    name: propertyName,
                                    value: specStrings.hosting.createActivityInstancePart(propertyValue.id)
                                });
                        }
                        else if (_.isFunction(propertyValue) && !activity.hasOwnProperty(propertyName) &&
                            _.isFunction(activity[propertyName]))
                        {
                            item.parts.push(specStrings.hosting.createActivityPropertyPart(propertyName));
                        }
                        else if (_.isObject(propertyValue) && propertyValue === activity[propertyName])
                        {
                            item.parts.push(specStrings.hosting.createActivityPropertyPart(propertyName));
                        }
                        else
                        {
                            item.parts.push({
                                name: propertyName,
                                value: propertyValue
                            });
                        }
                    }
                });
            state.push(item);

            // Promotions:
            if (promotedProperties && activity.promotedProperties)
            {
                activity.promotedProperties.forEach(
                    function (promotedPropName)
                    {
                        var pv = node.getPropertyValue(promotedPropName, true);
                        if (is.defined(pv) && !(is.activity(pv)))
                        {
                            var promotedEntry = promotedProperties.get(promotedPropName);
                            // If an Activity Id greater than other, then we can sure that other below or after in the tree.
                            if (is.undefined(promotedEntry) || node.id > promotedEntry.level)
                            {
                                promotedProperties.add(promotedPropName, { level: node.id, value: pv });
                            }
                        }
                    });
            }
        });

    var actualPromotions = null;
    if (promotedProperties)
    {
        var actualPromotions = {};
        if (promotedProperties.count)
        {
            promotedProperties.forEach(
                function (kvp)
                {
                    actualPromotions[kvp.key] = kvp.value.value;
                });
        }
    }

    return {
        state: state,
        promotedProperties: actualPromotions
    };
}

ScopeTree.prototype.setState = function (json)
{
    var self = this;

    if (!self.isOnInitial) throw new Error("Cannot restore state of state tree if it's not in initial state.");

    if (!_.isArray(json)) throw new TypeError("Array argument expected.");

    if (self._nodes.count != 1)
    {
        // There are hidden idle state:
        self._nodes.forEachKey(
            function (key)
            {
                if (key === guids.ids.initialScope) return;
                self._nodes.remove(key);
            });

        self._initialNode.clearChildren();
    }

    var e = fast.try(function()
    {
        json.forEach(
            function (item)
            {
                var scopePart = {};
                var activity = self._getActivityById(item.id);
                item.parts.forEach(
                    function (part)
                    {
                        var activityProperty = specStrings.hosting.getActivityPropertyName(part);
                        if (activityProperty)
                        {
                            if (_.isUndefined(scopePart[activityProperty] = activity[activityProperty]))
                                throw new Error("Activity has no property '" + part + "'.");
                        }
                        else
                        {
                            var activityId = specStrings.hosting.getActivityId(part.value);
                            if (activityId)
                            {
                                scopePart[part.name] = self._getActivityById(activityId);
                            }
                            else if (_.isArray(part.value))
                            {
                                var scopePartValue = [];
                                scopePart[part.name] = scopePartValue;
                                part.value.forEach(function(pv)
                                {
                                    activityId = specStrings.hosting.getActivityId(pv);
                                    if (activityId)
                                    {
                                        scopePartValue.push(self._getActivityById(activityId));
                                    }
                                    else
                                    {
                                        scopePartValue.push(pv);
                                    }
                                });
                            }
                            else
                            {
                                scopePart[part.name] = part.value;
                            }
                        }
                    });
                var node = new ScopeNode(item.id, scopePart);
                self._nodes.add(item.id, node);
            });

        json.forEach(
            function (item)
            {
                self._nodes.get(item.id).parent = self._nodes.get(item.parentId);
            });
    });

    if (e instanceof Error) throw new errors.WorkflowError("Cannot restore state tree, because data is corrupt. Inner error: " + e.stack);
}
/* SERIALIZATION */

/* PROXY */
ScopeTree.prototype.hasProperty = function (name)
{
    if (name === "activity") return true;

    var found = false;
    this._currentNode.forEachToRoot(function(node)
    {
        if (node.isPropertyExists(name))
        {
            found = true;
            return false;
        }
    });
    return found;
}

ScopeTree.prototype.getValue = function (name)
{
    if (name === "activity") return this._activity;

    var canReturnPrivate = true;
    var value;
    this._currentNode.forEachToRoot(function(node)
    {
        if (is.defined(value = node.getPropertyValue(name, canReturnPrivate))) return false;
        canReturnPrivate = false;
    });
    return value;
}

ScopeTree.prototype.setValue = function (name, value)
{
    if (name === "activity") return false;

    if (this.isOnInitial) throw new Error("Cannot set property of the initial scope.");

    var self = this;
    var canSetPrivate = true;
    var setDone = false;
    this._currentNode.forEachToRoot(function(node)
    {
        if (node === self._initialNode) return false;
        if (node.setPropertyValue(name, value, canSetPrivate))
        {
            setDone = true;
            return false;
        }
        canSetPrivate = false;
    });

    if (!setDone) this._currentNode.createPropertyWithValue(name, value);

    return true;
}

ScopeTree.prototype.deleteProperty = function(name)
{
    if (name === "activity") return false;

    if (this.isOnInitial) throw new Error("Cannot delete property of the initial scope.");

    var self = this;
    var canDeletePrivate = true;
    var deleteDone = false;
    this._currentNode.forEachToRoot(function(node)
    {
        if (node === self._initialNode) return false;
        if (node.deleteProperty(name, canDeletePrivate))
        {
            deleteDone = true;
            return false;
        }
        canDeletePrivate = false;
    });

    return deleteDone;
}

ScopeTree.prototype.enumeratePropertyNames = function* ()
{
    var canEnumeratePrivate = true;
    var node = this._currentNode;
    do
    {
        yield* node.enumeratePropertyNames(canEnumeratePrivate);
        canEnumeratePrivate = false;
        node = node.parent;
    }
    while (node);
}
/* PROXY */

/* WALK */
ScopeTree.prototype.next = function (id, scopePart)
{
    this._activity = null;

    var nextNode = new ScopeNode(id, scopePart);
    this._currentNode.addChild(nextNode);
    this._currentNode = nextNode;
    this._nodes.add(id, nextNode);

    this._updateActivityField();
}

ScopeTree.prototype.back = function (keepItem)
{
    this._activity = null;

    if (this._currentNode === this._initialNode) throw new Error("Cannot go back because current scope is the initial scope.");

    var toRemove = this._currentNode;
    var goTo = toRemove.parent;
    this._currentNode = goTo;
    if (!keepItem)
    {
        goTo.removeChild(toRemove);
        this._nodes.remove(toRemove.id);
    }

    this._updateActivityField();
}

ScopeTree.prototype.goTo = function (id)
{
    this._activity = null;

    //if (!this.isOnInitial) throw new Error("Cannot go to id '" + id + "' because current scope is not the initial.");

    var toNode = this._nodes.get(id);
    if (is.undefined(toNode)) throw new Error("Node by id '" + id + "' not found.");
    if (toNode === this._initialNode) throw new Error("Cannot go to id '" + id + "' because that is the initial.");
    this._currentNode = toNode;

    this._updateActivityField();
}
/* WALK */

ScopeTree.prototype.deleteScopePart = function (id)
{
    var self = this;
    var delNode = self._nodes.get(id);
    if (delNode)
    {
        if (delNode === self._initialNode) throw new Error("Cannot delete the initial scope.");
        var found = false;
        delNode.forEachToRoot(
            function (node)
            {
                if (node === self._currentNode)
                {
                    found = true;
                    return false;
                }
            });
        if (!found) throw new Error("Cannot delete scope, because current active scope is inside in it.");
        delNode.parent.removeChild(delNode);
        self._removeAllNodes(delNode);
    }
}

ScopeTree.prototype._removeAllNodes = function(node)
{
    var self = this;

    self._nodes.remove(node.id);
    node.forEachChild(function(c)
    {
        self._removeAllNodes(c);
    });
}

ScopeTree.prototype._updateActivityField = function ()
{
    if (!this.isOnInitial) this._activity = this._getActivityById(this._currentNode.id);
}

module.exports = ScopeTree;