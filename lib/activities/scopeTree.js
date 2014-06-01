var ScopeNode = require("./scopeNode");
var guids = require("./../common/guids");
var StrMap = require("backpack-node").collections.StrMap;
var StrSet = require("backpack-node").collections.StrSet;

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
    if (!this.isOnInitial) throw new Error("Cannot generate JSON state of state tree if it's not in initial state.");

    return {
        nodes: this._nodes
    };
}

ScopeTree.prototype.fromJSON = function(json)
{
    if (!this.isOnInitial) throw new Error("Cannot restore state of state tree if it's not in initial state.");

    if (_.isObject(json)) throw new TypeError("Object argument expected.");
    if (!(json.nodes instanceof StrMap)) throw new TypeError("Argument object's nodes property value is not an StrMap instance.");

    this._nodes = json.nodes;

    // TODO: Verify nodes
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