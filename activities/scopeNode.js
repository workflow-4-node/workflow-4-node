var TreeNode = require("./treeNode");
var util = require("util");
var _ = require("underscore-node");

function ScopeNode(id, scopePart)
{
    TreeNode.call(this);

    this.id = id;
    this._scopePart = {}
}

util.inherits(ScopeNode, TreeNode);

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

module.exports = ScopeNode;