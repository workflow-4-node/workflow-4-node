"use strict";
var util = require("util");
var _ = require("lodash");
var is = require("../common/is");
var assert = require("assert");
function ScopeNode(instanceId, scopePart, userId) {
  assert(instanceId);
  assert(scopePart);
  this.instanceId = instanceId;
  this.userId = userId;
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
  scopePart: {get: function() {
      return this._scopePart;
    }},
  parent: {
    get: function() {
      return this._parent;
    },
    set: function(value) {
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
ScopeNode.prototype.walkToRoot = $traceurRuntime.initGeneratorFunction(function $__10(noWalk) {
  var current;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          current = this;
          $ctx.state = 12;
          break;
        case 12:
          $ctx.state = (current) ? 1 : -2;
          break;
        case 1:
          $ctx.state = 2;
          return current;
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = (noWalk) ? -2 : 6;
          break;
        case 6:
          current = current._parent;
          $ctx.state = 12;
          break;
        default:
          return $ctx.end();
      }
  }, $__10, this);
});
ScopeNode.prototype.children = $traceurRuntime.initGeneratorFunction(function $__11() {
  var $__5,
      $__6,
      $__7,
      $__3,
      $__2,
      child,
      $__8;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__5 = true;
          $__6 = false;
          $__7 = undefined;
          $ctx.state = 24;
          break;
        case 24:
          $ctx.pushTry(10, 11);
          $ctx.state = 13;
          break;
        case 13:
          $__3 = void 0, $__2 = (this._children.values())[Symbol.iterator]();
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = (!($__5 = ($__3 = $__2.next()).done)) ? 5 : 7;
          break;
        case 4:
          $__5 = true;
          $ctx.state = 9;
          break;
        case 5:
          child = $__3.value;
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return child;
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 7:
          $ctx.popTry();
          $ctx.state = 11;
          $ctx.finallyFallThrough = -2;
          break;
        case 10:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          $__8 = $ctx.storedException;
          $ctx.state = 16;
          break;
        case 16:
          $__6 = true;
          $__7 = $__8;
          $ctx.state = 11;
          $ctx.finallyFallThrough = -2;
          break;
        case 11:
          $ctx.popTry();
          $ctx.state = 22;
          break;
        case 22:
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
          $ctx.state = 20;
          break;
        case 20:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__11, this);
});
ScopeNode.prototype.addChild = function(childItem) {
  if (!(childItem instanceof ScopeNode)) {
    throw new TypeError("Node argument expected.");
  }
  if (childItem._parent) {
    throw new Error("Item has been already ha a parent node.");
  }
  childItem._parent = this;
  this._children.set(childItem.instanceId, childItem);
};
ScopeNode.prototype.removeChild = function(childItem) {
  if (!(childItem instanceof ScopeNode)) {
    throw new TypeError("Node argument expected.");
  }
  if (childItem._parent !== this) {
    throw new Error("Item is not a current node's child.");
  }
  childItem._parent = null;
  this._children.delete(childItem.instanceId);
};
ScopeNode.prototype.clearChildren = function() {
  this._children.clear();
};
ScopeNode.prototype.isPropertyExists = function(name) {
  return !_.isUndefined(this._scopePart[name]);
};
ScopeNode.prototype.getPropertyValue = function(name, canReturnPrivate) {
  if (canReturnPrivate) {
    return this._scopePart[name];
  } else if (!this._isPrivate(name)) {
    return this._scopePart[name];
  }
};
ScopeNode.prototype.setPropertyValue = function(name, value, canSetPrivate) {
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
ScopeNode.prototype.createPropertyWithValue = function(name, value) {
  if (!this.isPropertyExists(name)) {
    this._keys.push(name);
  }
  this._scopePart[name] = value;
};
ScopeNode.prototype.deleteProperty = function(name, canDeletePrivate) {
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
ScopeNode.prototype.enumeratePropertyNames = $traceurRuntime.initGeneratorFunction(function $__12(canEnumeratePrivate) {
  var i,
      i$__9,
      key;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = (canEnumeratePrivate) ? 6 : 16;
          break;
        case 6:
          i = 0;
          $ctx.state = 7;
          break;
        case 7:
          $ctx.state = (i < this._keys.length) ? 1 : -2;
          break;
        case 4:
          i++;
          $ctx.state = 7;
          break;
        case 1:
          $ctx.state = 2;
          return this._keys[i];
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 16:
          i$__9 = 0;
          $ctx.state = 17;
          break;
        case 17:
          $ctx.state = (i$__9 < this._keys.length) ? 13 : -2;
          break;
        case 11:
          i$__9++;
          $ctx.state = 17;
          break;
        case 13:
          key = this._keys[i$__9];
          $ctx.state = 14;
          break;
        case 14:
          $ctx.state = (!this._isPrivate(key)) ? 8 : 11;
          break;
        case 8:
          $ctx.state = 9;
          return key;
        case 9:
          $ctx.maybeThrow();
          $ctx.state = 11;
          break;
        default:
          return $ctx.end();
      }
  }, $__12, this);
});
ScopeNode.prototype.properties = $traceurRuntime.initGeneratorFunction(function $__13() {
  var self,
      $__5,
      $__6,
      $__7,
      $__3,
      $__2,
      fn,
      $__8;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          self = this;
          $__5 = true;
          $__6 = false;
          $__7 = undefined;
          $ctx.state = 24;
          break;
        case 24:
          $ctx.pushTry(10, 11);
          $ctx.state = 13;
          break;
        case 13:
          $__3 = void 0, $__2 = (self._keys)[Symbol.iterator]();
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = (!($__5 = ($__3 = $__2.next()).done)) ? 5 : 7;
          break;
        case 4:
          $__5 = true;
          $ctx.state = 9;
          break;
        case 5:
          fn = $__3.value;
          $ctx.state = 6;
          break;
        case 6:
          $ctx.state = 2;
          return {
            name: fn,
            value: self._scopePart[fn]
          };
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 7:
          $ctx.popTry();
          $ctx.state = 11;
          $ctx.finallyFallThrough = -2;
          break;
        case 10:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          $__8 = $ctx.storedException;
          $ctx.state = 16;
          break;
        case 16:
          $__6 = true;
          $__7 = $__8;
          $ctx.state = 11;
          $ctx.finallyFallThrough = -2;
          break;
        case 11:
          $ctx.popTry();
          $ctx.state = 22;
          break;
        case 22:
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
          $ctx.state = 20;
          break;
        case 20:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__13, this);
});
ScopeNode.prototype._isPrivate = function(key) {
  return key[0] === "_";
};
module.exports = ScopeNode;

//# sourceMappingURL=scopeNode.js.map
