var util = require("util");
var _ = require("lodash");
var StrMap = require("backpack-node").collections.StrMap;
var is = require("../common/is");
var fast = require("fast.js");

function ScopeNode(id, scopePart) {
    this.id = id;
    this._parent = null;
    this._children = new StrMap();
    this._scopePart = scopePart;
    this._keys = [];
    for (var key in scopePart) this._keys.push(key);
}

Object.defineProperties(ScopeNode.prototype, {
    _keys: {
        value: null,
        writable: true,
        enumerable: false
    },
    parent: {
        get: function () {
            return this._parent;
        },
        set: function (value) {
            if (value !== null && !(value instanceof ScopeNode)) throw new TypeError("Node argument expected.");
            if (this._parent !== null) throw new Error("Parent already defined.");
            value.addChild(this);
        }
    }
});

ScopeNode.prototype.forEachToRoot = function (f) {
    var current = this;
    while (current) {
        if (f.call(this, current) === false) return;
        current = current._parent;
    }
}

ScopeNode.prototype.forEachChild = function (f) {
    this._children.forEachValue(f);
}

ScopeNode.prototype.addChild = function (childItem) {
    if (!(childItem instanceof ScopeNode)) throw new TypeError("Node argument expected.");
    if (childItem._parent) throw new Error("Item has been already ha a parent node.");
    childItem._parent = this;
    this._children.add(childItem.id, childItem);
}

ScopeNode.prototype.removeChild = function (childItem) {
    if (!(childItem instanceof ScopeNode)) throw new TypeError("Node argument expected.");
    if (childItem._parent !== this) throw new Error("Item is not a current node's child.");
    childItem._parent = null;
    this._children.remove(childItem.id);
}

ScopeNode.prototype.clearChildren = function () {
    this._children.clear();
}

ScopeNode.prototype.isPropertyExists = function (name) {
    return is.defined(this._scopePart[name]);
}

ScopeNode.prototype.getPropertyValue = function (name, canReturnPrivate) {
    if (canReturnPrivate) {
        return this._scopePart[name];
    }
    else if (!this._isPrivate(name)) {
        return this._scopePart[name];
    }
}

ScopeNode.prototype.setPropertyValue = function (name, value, canSetPrivate) {
    if (this._isPrivate(name)) {
        if (canSetPrivate) {
            if (!is.defined(this._scopePart[name])) this._keys.push(name);
            this._scopePart[name] = value;
            return true;
        }
    }
    else if (is.defined(this._scopePart[name])) {
        this._scopePart[name] = value;
        return true;
    }
    return false;
}

ScopeNode.prototype.createPropertyWithValue = function (name, value) {
    if (!is.defined(this._scopePart[name])) this._keys.push(name);
    this._scopePart[name] = value;
}

ScopeNode.prototype.deleteProperty = function (name, canDeletePrivate) {
    if (is.defined(this._scopePart[name])) {
        if (this._isPrivate(name)) {
            if (canDeletePrivate) {
                this._keys.splice(fast.indexOf(this._keys, name), 1);
                delete this._scopePart[name];
                return true;
            }
        }
        else {
            this._keys.splice(fast.indexOf(this._keys, name), 1);
            delete this._scopePart[name];
            return true;
        }
    }
    return false;
}

ScopeNode.prototype.enumeratePropertyNames = function* (canEnumeratePrivate) {
    if (canEnumeratePrivate) {
        for (var i = 0; i < this._keys.length; i++) {
            yield this._keys[i];
        }
    }
    else {
        for (var i = 0; i < this._keys.length; i++) {
            var key = this._keys[i];
            if (!this._isPrivate(key)) yield key;
        }
    }
}

ScopeNode.prototype.forEachProperty = function (f) {
    var self = this;
    fast.forEach(self._keys, function (fn) {
        f(fn, self._scopePart[fn]);
    });
}

ScopeNode.prototype._isPrivate = function (key) {
    return key[0] === "_";
}

module.exports = ScopeNode;