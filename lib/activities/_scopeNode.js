var util = require("util");
var _ = require("lodash");
var StrMap = require("backpack-node").collections.StrMap;
var is = require("../common/is");
var fast = require("fast.js");

function ScopeNode(id, scopePart)
{
    this.id = id;
    this._scopePart = scopePart;
    this._parent = null;
    this._children = new StrMap();
}

Object.defineProperties(ScopeNode.prototype, {
    _keys: {
        value: null,
        writable: true,
        enumerable: false
    }
})

ScopeNode.prototype._getKeys = function()
{
    if (!this._keys)
    {
        var keys = [];
        for (var k in this._scopePart) keys.push(k);
        this._keys = keys;
    }
    return this._keys;
}

ScopeNode.prototype._clearKeys = function()
{
    this._keys = null;
}

Object.defineProperties(
    ScopeNode.prototype,
    {
        parent: {
            get: function ()
            {
                return this._parent;
            },
            set: function(value)
            {
                if (value !== null && !(value instanceof ScopeNode)) throw new TypeError("Node argument expected.");
                if (this._parent !== null) throw new Error("Parent already defined.");
                value.addChild(this);
            }
        }
    }
)

ScopeNode.prototype._getMapKey = function()
{
    return this.id;
}

ScopeNode.prototype.forEachToRoot = function (f)
{
    var current = this;
    while (current)
    {
        if (f.call(this, current) === false) return;
        current = current._parent;
    }
}

ScopeNode.prototype.forEachChild = function(f)
{
    this._children.forEachValue(f);
}

ScopeNode.prototype.addChild = function (childItem)
{
    if (!(childItem instanceof ScopeNode)) throw new TypeError("Node argument expected.");
    if (childItem._parent) throw new Error("Item has been already ha a parent node.");
    childItem._parent = this;
    this._children.add(childItem.id, childItem);
}

ScopeNode.prototype.removeChild = function (childItem)
{
    if (!(childItem instanceof ScopeNode)) throw new TypeError("Node argument expected.");
    if (childItem._parent !== this) throw new Error("Item is not a current node's child.");
    childItem._parent = null;
    this._children.remove(childItem.id);
}

ScopeNode.prototype.clearChildren = function()
{
    this._children.clear();
}

ScopeNode.prototype.addField = function (name, value)
{
    this._scopePart[name] = value;
    this._clearKeys();
}

ScopeNode.prototype.updateField = function (name, value)
{
    if (is.defined(this._scopePart[name])) this._scopePart[name] = value;
}

ScopeNode.prototype.addAllFields = function (to)
{
    _(to).extend(this._scopePart);
    this._clearKeys();
}

ScopeNode.prototype.removeAllFields = function (from)
{
    fast.forEach(this._getKeys(), function(fn)
    {
        delete from[fn];
    });
}

ScopeNode.prototype.removeAllPrivateFields = function (from)
{
    fast.forEach(this._getKeys(), function(fn)
    {
        if (fn[0] === "_") delete from[fn];
    });
    
}

ScopeNode.prototype.addFieldsOf = function (to, otherNode, addPrivates)
{
    var self = this;
    fast.forEach(this._getKeys(), function(fn)
    {
        if (fn[0] === "_")
        {
            if (addPrivates) to[fn] = self._scopePart[fn];
        }
        else
        {
            if (is.defined(otherNode._scopePart[fn]))
            {
                to[fn] = self._scopePart[fn];
            }
        }
    });
}

ScopeNode.prototype.addNonExistingAndNonPrivateFields = function (to)
{
    var self = this;
    fast.forEach(self._getKeys(), function(fn)
    {
        if (fn[0] !== "_" && is.undefined(to[fn]))
        {
            to[fn] = self._scopePart[fn];
        }
    });
}

ScopeNode.prototype.forEachProperty = function (f)
{
    var self = this;
    fast.forEach(self._getKeys(), function(fn)
    {
        f({name: fn, value: self._scopePart[fn]});
    });
}

ScopeNode.prototype.getFieldValue = function(name)
{
    return this._scopePart[name];
}

ScopeNode.prototype.isFieldExists = function(name)
{
    return is.defined(this._scopePart[name]);
}

module.exports = ScopeNode;