"use strict";

var util = require("util");
var _ = require("lodash");
var is = require("../common/is");
var assert = require("assert");

function ScopeNode(instanceId, scopePart, userId, activity) {
    assert(instanceId);
    assert(scopePart);
    this.instanceId = instanceId;
    this.userId = userId;
    this.activity = activity || null;
    this._parent = null;
    this._children = new Map();
    this._scopePart = scopePart;
    this._keys = [];
    for (var key in scopePart) {
        this._keys.push(key);
    }
}

Object.defineProperties(ScopeNode.prototype, {
    _keys: {
        value: null,
        writable: true,
        enumerable: false
    },
    scopePart: {
        get: function get() {
            return this._scopePart;
        }
    },
    parent: {
        get: function get() {
            return this._parent;
        },
        set: function set(value) {
            if (value !== null && !(value instanceof ScopeNode)) {
                throw new TypeError("Node argument expected.");
            }
            if (this._parent !== null) {
                throw new Error("Parent already defined.");
            }
            value.addChild(this);
        }
    }
});

ScopeNode.prototype.walkToRoot = regeneratorRuntime.mark(function _callee() {
    var current;
    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    current = this;

                case 1:
                    if (!current) {
                        _context.next = 7;
                        break;
                    }

                    _context.next = 4;
                    return current;

                case 4:
                    current = current._parent;
                    _context.next = 1;
                    break;

                case 7:
                case "end":
                    return _context.stop();
            }
        }
    }, _callee, this);
});

ScopeNode.prototype.children = regeneratorRuntime.mark(function _callee2() {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, child;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context2.prev = 3;
                    _iterator = this._children.values()[Symbol.iterator]();

                case 5:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context2.next = 12;
                        break;
                    }

                    child = _step.value;
                    _context2.next = 9;
                    return child;

                case 9:
                    _iteratorNormalCompletion = true;
                    _context2.next = 5;
                    break;

                case 12:
                    _context2.next = 18;
                    break;

                case 14:
                    _context2.prev = 14;
                    _context2.t0 = _context2["catch"](3);
                    _didIteratorError = true;
                    _iteratorError = _context2.t0;

                case 18:
                    _context2.prev = 18;
                    _context2.prev = 19;

                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }

                case 21:
                    _context2.prev = 21;

                    if (!_didIteratorError) {
                        _context2.next = 24;
                        break;
                    }

                    throw _iteratorError;

                case 24:
                    return _context2.finish(21);

                case 25:
                    return _context2.finish(18);

                case 26:
                case "end":
                    return _context2.stop();
            }
        }
    }, _callee2, this, [[3, 14, 18, 26], [19,, 21, 25]]);
});

ScopeNode.prototype.addChild = function (childItem) {
    if (!(childItem instanceof ScopeNode)) {
        throw new TypeError("Node argument expected.");
    }
    if (childItem._parent) {
        throw new Error("Item has been already ha a parent node.");
    }
    childItem._parent = this;
    this._children.set(childItem.instanceId, childItem);
};

ScopeNode.prototype.removeChild = function (childItem) {
    if (!(childItem instanceof ScopeNode)) {
        throw new TypeError("Node argument expected.");
    }
    if (childItem._parent !== this) {
        throw new Error("Item is not a current node's child.");
    }
    childItem._parent = null;
    this._children.delete(childItem.instanceId);
};

ScopeNode.prototype.clearChildren = function () {
    this._children.clear();
};

ScopeNode.prototype.isPropertyExists = function (name) {
    return !_.isUndefined(this._scopePart[name]);
};

ScopeNode.prototype.getPropertyValue = function (name, canReturnPrivate) {
    if (canReturnPrivate) {
        return this._scopePart[name];
    } else if (!this._isPrivate(name)) {
        return this._scopePart[name];
    }
};

ScopeNode.prototype.setPropertyValue = function (name, value, canSetPrivate) {
    if (this._isPrivate(name)) {
        if (canSetPrivate) {
            if (!this.isPropertyExists(name)) {
                this._keys.push(name);
            }
            this._scopePart[name] = value;
            return true;
        }
    } else if (!_.isUndefined(this._scopePart[name])) {
        this._scopePart[name] = value;
        return true;
    }
    return false;
};

ScopeNode.prototype.createPropertyWithValue = function (name, value) {
    if (!this.isPropertyExists(name)) {
        this._keys.push(name);
    }
    this._scopePart[name] = value;
};

ScopeNode.prototype.deleteProperty = function (name, canDeletePrivate) {
    if (!_.isUndefined(this._scopePart[name])) {
        if (this._isPrivate(name)) {
            if (canDeletePrivate) {
                this._keys.splice(_.indexOf(this._keys, name), 1);
                delete this._scopePart[name];
                return true;
            }
        } else {
            this._keys.splice(_.indexOf(this._keys, name), 1);
            delete this._scopePart[name];
            return true;
        }
    }
    return false;
};

ScopeNode.prototype.enumeratePropertyNames = regeneratorRuntime.mark(function _callee3(canEnumeratePrivate) {
    var i, key;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    if (!canEnumeratePrivate) {
                        _context3.next = 10;
                        break;
                    }

                    i = 0;

                case 2:
                    if (!(i < this._keys.length)) {
                        _context3.next = 8;
                        break;
                    }

                    _context3.next = 5;
                    return this._keys[i];

                case 5:
                    i++;
                    _context3.next = 2;
                    break;

                case 8:
                    _context3.next = 19;
                    break;

                case 10:
                    i = 0;

                case 11:
                    if (!(i < this._keys.length)) {
                        _context3.next = 19;
                        break;
                    }

                    key = this._keys[i];

                    if (this._isPrivate(key)) {
                        _context3.next = 16;
                        break;
                    }

                    _context3.next = 16;
                    return key;

                case 16:
                    i++;
                    _context3.next = 11;
                    break;

                case 19:
                case "end":
                    return _context3.stop();
            }
        }
    }, _callee3, this);
});

ScopeNode.prototype.properties = regeneratorRuntime.mark(function _callee4() {
    var self, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, fn;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    self = this;
                    _iteratorNormalCompletion2 = true;
                    _didIteratorError2 = false;
                    _iteratorError2 = undefined;
                    _context4.prev = 4;
                    _iterator2 = self._keys[Symbol.iterator]();

                case 6:
                    if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                        _context4.next = 13;
                        break;
                    }

                    fn = _step2.value;
                    _context4.next = 10;
                    return { name: fn, value: self._scopePart[fn] };

                case 10:
                    _iteratorNormalCompletion2 = true;
                    _context4.next = 6;
                    break;

                case 13:
                    _context4.next = 19;
                    break;

                case 15:
                    _context4.prev = 15;
                    _context4.t0 = _context4["catch"](4);
                    _didIteratorError2 = true;
                    _iteratorError2 = _context4.t0;

                case 19:
                    _context4.prev = 19;
                    _context4.prev = 20;

                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }

                case 22:
                    _context4.prev = 22;

                    if (!_didIteratorError2) {
                        _context4.next = 25;
                        break;
                    }

                    throw _iteratorError2;

                case 25:
                    return _context4.finish(22);

                case 26:
                    return _context4.finish(19);

                case 27:
                case "end":
                    return _context4.stop();
            }
        }
    }, _callee4, this, [[4, 15, 19, 27], [20,, 22, 26]]);
});

ScopeNode.prototype._isPrivate = function (key) {
    return key[0] === "_";
};

module.exports = ScopeNode;
//# sourceMappingURL=scopeNode.js.map
