var ScopeNode = require("./scopeNode");
var guids = require("./guids");

function ScopeTree(initialScope, getActivityById)
{
    this._initialNode = new ScopeNode(guids.ids.initialScope, initialScope);
    this._nodes = {};
    this._nodes[this._initialNode.id] = this._initialNode;
    this._currentNode = this._initialNode;
    this.currentScope = {};
    this._currentNode.addAllFields(this.currentScope);
    this._currentFields = null;
    this._refreshCurrentFields();
    this._getActivityById = getActivityById;
}

ScopeTree.prototype.isOnInitial = function ()
{
    return this._currentNode === this._initialNode;
}

ScopeTree.prototype.next = function (id, scopePart)
{
    delete this.currentScope["activity"];

    this._leaveCurrentScope();
    this._currentNode.removeAllPrivateFields(this.currentScope);
    var nextNode = new ScopeNode(id, scopePart);
    nextNode.addAllFields(this.currentScope);
    this._currentNode.addChild(nextNode);
    this._currentNode = nextNode;
    this._nodes[id] = nextNode;
    this._refreshCurrentFields();
    this._updateActivityField();
}

ScopeTree.prototype.back = function (keepItem)
{
    delete this.currentScope["activity"];

    var self = this;

    if (self._currentNode == self._initialNode) throw new Error("Cannot go back.");

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
        delete self._nodes[toRemove.id];
    }
    this._refreshCurrentFields();
    this._updateActivityField();
}

ScopeTree.prototype.goTo = function (id)
{
    delete this.currentScope["activity"];

    var self = this;

    if (self._currentNode != self._initialNode) throw new Error("Cannot go to id '" + id + "' because current scope is not the initial.");

    var toNode = self._nodes[id];
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
        if (this._currentFields[fn] === undefined)
        {
            this._currentNode.addField(fn, this.currentScope[fn]);
        }
        else
        {
            this._currentNode.updateField(fn, this.currentScope[fn]);
        }
    }
}

ScopeTree.prototype._refreshCurrentFields = function ()
{
    this._currentFields = {};
    for (var fn in this.currentScope)
    {
        this._currentFields[fn] = true;
    }
}

ScopeTree.prototype._updateActivityField = function ()
{
    if (!this.isOnInitial()) this.currentScope["activity"] = this._getActivityById(this._currentNode.id);
}

ScopeTree.prototype.deleteScopePart = function (id)
{
    var self = this;
    var delNode = self._nodes[id];
    if (delNode)
    {
        if (delNode == self._initialNode) throw new Error("Cannot delete the initial scope.");
        var found = false;
        delNode.forEachToRoot(function(node)
        {
            if (node == self._currentNode)
            {
                found = true;
                return false;
            }
        });
        if (!found) throw new Error("Cannot delete scope, because current active cope is inside in it.");
        delNode.parent.removeChild(delNode);
    }
}

module.exports = ScopeTree;