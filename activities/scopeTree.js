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
}

ScopeTree.prototype.next = function (id, scopePart)
{
    this._currentNode.removeAllPrivateFields(this.currentScope);
    var nextNode = new ScopeNode(id, scopePart);
    nextNode.addAllFields(this.currentScope);
    this._currentNode.addChild(nextNode);
    this._currentNode = nextNode;
    this._nodes[id] = nextNode;
}

ScopeTree.prototype.back = function(keepItem)
{
    var self = this;
    
    if (self._currentNode == self._initialNode) throw new Error("Cannot go back.");

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
}

module.exports = ScopeTree;