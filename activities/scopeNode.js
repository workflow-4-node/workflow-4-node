var util = require("util");
var _ = require("underscore-node");

function ScopeNode(id, scopePart)
{
    TreeNode.call(this);

    this.id = id;
    this._scopePart = {};
    this._parent = null;
    this._children = {};
}

ScopeNode.prototype.parent = function()
{
    return this._parent;
}

ScopeNode.prototype.forEachToRoot = function(f)
{
    var current = this;
    do
    {
        f.call(this, current);
        current = current._parent;
    }
    while (current);

}

ScopeNode.prototype.addChild = function (childItem)
{
    if (!(childItem instanceof ScopeNode)) throw new TypeError("Node argument expected.");
    if (childItem._parent) throw new Error("Item has been already aded to a .");
    childItem._parent = this;
    this._children[childItem.id] = childItem;
}

ScopeNode.prototype.removeChild = function (childItem)
{
    if (!(childItem instanceof ScopeNode)) throw new TypeError("Node argument expected.");
    if (childItem._parent != this) throw new Error("Item is not a current node's child.");
    childItem._parent = null;
    delete this._children[childItem.id];
}

ScopeNode.prototype.addField = function(name, value)
{
    this._scopePart[name] = value;
}

ScopeNode.prototype.addAllFields = function(to)
{
    _(to).extend(this._scopePart);
}

ScopeNode.prototype.removeAllFields = function (from)
{
    for (var fn in this._scopePart)
    {
        delete from[fn];
    }
}

ScopeNode.prototype.removeAllPrivateFields = function (from)
{
    for (var fn in this._scopePart)
    {
        if (fn[0] === "_") delete from[fn];
    }
}

ScopeNode.prototype.addFieldsOf = function (to, otherNode)
{
    for (var fn in this._scopePart)
    {
        var ov = otherNode._scopePart[fn];
        if (ov != undefined)
        {
            to[fn] = ov;
        }
    }
}

ScopeNode.prototype.addNonExistingAndNonPrivateFields = function(to)
{
    for (var fn in this._scopePart)
    {
        if (fn[0] !== "_" && to[fn] === undefined)
        {
            to[fn] = this._scopePart[fn];
        }
    }
}

module.exports = ScopeNode;