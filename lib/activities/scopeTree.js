var ScopeNode = require("./scopeNode");
var guids = require("../common/guids");
var StrMap = require("backpack-node").collections.StrMap;
var StrSet = require("backpack-node").collections.StrSet;
var _ = require("underscore-node");
var specStrings = require("../common/specStrings");
var errors = require("../common/errors");

function ScopeTree(initialScope, getActivityById)
{
    this._initialNode = new ScopeNode(guids.ids.initialScope, initialScope);
    this._nodes = new StrMap();
    this._nodes.add(this._initialNode.id, this._initialNode);
    this._currentNode = this._initialNode;
    this.currentScope = {};
    this._currentNode.addAllFields(this.currentScope);
    this._currentFields = null;
    this._refreshCurrentFields();
    this._getActivityById = getActivityById;
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
)

/* SERIALIZATION */
ScopeTree.prototype.asJSON = function()
{
    var self = this;

    if (!self.isOnInitial) throw new Error("Cannot generate JSON state of state tree if it's not on initial state.");

    var result = [];
    self._nodes.forEachValue(function(node)
    {
        if (node.id === guids.ids.initialScope) return;

        var item = {
            id: node.id,
            parentId: node.parent ? node.parent.id : null,
            parts: []
        };

        var activity = self._getActivityById(node.id);
        node.forEachPart(function(part)
        {
            if (_.isFunction(part.value) &&
                !activity.hasOwnProperty(part.name) &&
                _.isFunction(activity[part.name]))
            {
                item.parts.push(specStrings.hosting.createActivityMethod(part.name));
            }
            else
            {
                item.parts.push(part);
            }
        });

        result.push(item);
    });
    return result;
}

ScopeTree.prototype.fromJSON = function(json)
{
    var self = this;

    if (!self.isOnInitial) throw new Error("Cannot restore state of state tree if it's not in initial state.");

    if (!_.isArray(json)) throw new TypeError("Array argument expected.");

    if (self._nodes.count != 1)
    {
        // There are hidden idle state:
        self._nodes.forEachKey(function(key)
        {
            if (key === guids.ids.initialScope) return;
            self._nodes.remove(key);
        });

        self._initialNode.clearChildren();
    }

    try
    {
        json.forEach(
            function (item)
            {
                var scopePart = {};
                var activity = self._getActivityById(item.id);
                item.parts.forEach(function (part)
                {
                    var activityMethod = specStrings.hosting.getActivityMethodName(part);
                    if (activityMethod)
                    {
                        if (!_.isFunction(scopePart[part.name] = activity[activityMethod]))
                            throw new Error("Activity has no function '" + part.name + "'.");
                    }
                    else
                    {
                        scopePart[part.name] = part.value;
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
    }
    catch (e)
    {
        throw new errors.WorkflowError("Cannot restore state tree, because data is corrupt. Inner error: " + e.message);
    }
}
/* SERIALIZATION */

ScopeTree.prototype.next = function (id, scopePart)
{
    delete this.currentScope["activity"];

    this._leaveCurrentScope();
    this._currentNode.removeAllPrivateFields(this.currentScope);
    var nextNode = new ScopeNode(id, scopePart);
    nextNode.addAllFields(this.currentScope);
    this._currentNode.addChild(nextNode);
    this._currentNode = nextNode;
    this._nodes.add(id, nextNode);
    this._refreshCurrentFields();
    this._updateActivityField();
}

ScopeTree.prototype.back = function (keepItem)
{
    delete this.currentScope["activity"];

    var self = this;

    if (self._currentNode === self._initialNode) throw new Error("Cannot go back.");

    if (keepItem) self._leaveCurrentScope();

    var toRemove = self._currentNode;
    toRemove.removeAllFields(self.currentScope);
    var goTo = toRemove.parent;
    var first = true;
    goTo.forEachToRoot(
        function (node)
        {
            node.addFieldsOf(self.currentScope, toRemove, first);
            if (first) first = false;
        });
    self._currentNode = goTo;
    if (!keepItem)
    {
        goTo.removeChild(toRemove);
        self._nodes.remove(toRemove.id);
    }
    this._refreshCurrentFields();
    this._updateActivityField();
}

ScopeTree.prototype.goTo = function (id)
{
    delete this.currentScope["activity"];

    var self = this;

    if (!self.isOnInitial) throw new Error("Cannot go to id '" + id + "' because current scope is not the initial.");

    var toNode = self._nodes.get(id);
    if (toNode === undefined) throw new Error("Node by id '" + id + "' not found.");
    if (toNode === self._initialNode) throw new Error("Cannot go to id '" + id + "' because that is the initial.");
    toNode.addAllFields(self.currentScope);
    var parent = toNode.parent;
    parent.forEachToRoot(
        function (node)
        {
            node.addNonExistingAndNonPrivateFields(self.currentScope);
        });
    self._currentNode = toNode;

    this._refreshCurrentFields();
    this._updateActivityField();
}

ScopeTree.prototype._leaveCurrentScope = function ()
{
    // We have to add current node's part all fields that new since it created:
    for (var fn in this.currentScope)
    {
        if (this.currentScope.hasOwnProperty(fn))
        {
            if (!this._currentFields.exists(fn))
            {
                this._currentNode.addField(fn, this.currentScope[fn]);
            }
            else
            {
                this._currentNode.updateField(fn, this.currentScope[fn]);
            }
        }
    }
}

ScopeTree.prototype._refreshCurrentFields = function ()
{
    if (this._currentFields === null)
    {
        this._currentFields = new StrSet();
    }
    else
    {
        this._currentFields.clear();
    }
    for (var fn in this.currentScope)
    {
        if (this.currentScope.hasOwnProperty(fn))
        {
            this._currentFields.add(fn);
        }
    }
}

ScopeTree.prototype._updateActivityField = function ()
{
    if (!this.isOnInitial) this.currentScope["activity"] = this._getActivityById(this._currentNode.id);
}

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
                if (node == self._currentNode)
                {
                    found = true;
                    return false;
                }
            });
        if (!found) throw new Error("Cannot delete scope, because current active cope is inside in it.");
        delNode.parent.removeChild(delNode);
        self._nodes.remove(id);
    }
}

module.exports = ScopeTree;