var ScopeNode = require("./scopeNode");
var InitialScope = require("./initialScope");
var guids = require("./guids");

function ScopeTree()
{
    this._initialNode = new ScopeNode(guids.ids.initialScope, new InitialScope());
    this._nodes = {};
    this._nodes[this._initialNode.id] = this._initialNode;
    this._currentNode = this._initialNode;
    this.currentScope = {};
    this._currentNode.addAllFields(this.currentScope);
    this._currentFields = null;
    this._refreshCurrentFields();
}

ScopeTree.prototype.next = function (id, scopePart)
{
    this._currentNode.removeAllPrivateFields(this.currentScope);
    var nextNode = new ScopeNode(id, scopePart);
    nextNode.addAllFields(this.currentScope);
    this._currentNode.addChild(nextNode);
    this._currentNode = nextNode;
    this._nodes[id] = nextNode;
    this._refreshCurrentFields();
}

ScopeTree.prototype.back = function(keepItem)
{
    var self = this;
    
    if (self._currentNode == self._initialNode) throw new Error("Cannot go back.");

    if (keepItem)
    {
        // We have to add current node's part all fields that new since it created:
        for (var fn in self.currentScope)
        {
            if (self._currentFields[fn] === undefined)
            {
                var fv = self.currentScope[fn];
                self._currentNode.addField(fn, fv);
            }
        }
    }

    var toRemove = self._currentNode;
    toRemove.removeAllFields(self.currentScope);
    var goTo = toRemove.parent();
    goTo.forEachToRoot(function(node)
    {
        node.addFieldsOf(self.currentScope, toRemove);
    });
    self._currentNode = goTo;
    if (!keepItem)
    {
        goTo.removeChild(toRemove);
        delete self._nodes[toRemove.id];
    }
}

ScopeTree.prototype.goTo = function (id)
{
    var self = this;

    if (self._currentNode != self._initialNode) throw new Error("Cannot go to id '" + id + "' because current scope is not the initial.");

    var toNode = self._nodes[id];
    if (toNode === undefined) throw new Error("Node by id '" + id + "' not found.");
    if (toNode === self._initialNode) throw new Error("Cannot go to id '" + id + "' because that is the initial.");
    toNode.addAllFields(self.currentScope);
    var parent = toNode.parent();
    parent.forEachToRoot(function(node)
    {
        node.addNonExistingAndNonPrivateFields(self.currentScope);
    });
    self._currentNode = toNode;

    this._refreshCurrentFields();
}

ScopeTree.prototype._refreshCurrentFields = function()
{
    this._currentFields = {};
    for (var fn in this.currentScope)
    {
        this._currentFields[fn] = true;
    }
}

module.exports = ScopeTree;