function TreeNode()
{
    this._parent = null;
    this._children = [];
}

TreeItem.prototype.parent = function()
{
    return this._parent;
}

TreeItem.prototype.childrenCount = function()
{
    return this._children.length;
}

TreeItem.prototype.forEachChildren = function(f)
{
    this._children.forEach(f);
}

TreeItem.prototype.forEachToRoot = function(f)
{
    var current = this;
    do
    {
        f.call(this, current);
        current = current._parent;
    }
    while (current);

}

TreeItem.prototype.addChild = function (childTreeItem)
{
    if (!(childTreeItem instanceof TreeItem)) throw new TypeError("TreeNode argument expected.");
    if (childTreeItem._parent) throw new Error("Item has been already aded to a tree.");
    childTreeItem._parent = this;
    this._children.push(childTreeItem);
}

TreeItem.prototype.removeChild = function (childTreeItem)
{
    if (!(childTreeItem instanceof TreeItem)) throw new TypeError("TreeNode argument expected.");
    if (childTreeItem._parent != this) throw new Error("Item is not a current node's child.");
    childTreeItem._parent = null;
    this._children.splice(this._children.indexOf(childTreeItem), 1);
}

module.exports = TreeItem;
