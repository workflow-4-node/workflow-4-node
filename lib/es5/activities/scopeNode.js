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
          $__3 = void 0, $__2 = (this._children.values())[$traceurRuntime.toProperty(Symbol.iterator)]();
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
          $__3 = void 0, $__2 = (self._keys)[$traceurRuntime.toProperty(Symbol.iterator)]();
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
//# sourceMappingURL=data:application/json;base64,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UixvQkFBd0I7QUFDdEIsd0JBQXdCO1lBQzFCO0FBQUEsVUFDRjtBQUFBOzs7QUFqQlksYUFBRyxNQUFNLEVBQUksQ0FBQSxJQUFHLG1CQUFtQixDQUFDO0FBQ3BDLGVBQUs7O0FBRjNCLGVBQU8sQ0FBQSxJQUFHLElBQUksQUFBQyxFQUFDLENBQUE7O0FBQ21CLEVBQy9CLFFBQTZCLEtBQUcsQ0FBQyxDQUFDO0FBcUt0QyxDQXZLdUQsQUF1S3ZELENBQUM7QUFFRCxRQUFRLFVBQVUsV0FBVyxFQUFJLFVBQVUsR0FBRSxDQUFHO0FBQzVDLE9BQU8sQ0FBQSxHQUFFLENBQUUsQ0FBQSxDQUFDLElBQU0sSUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFFRCxLQUFLLFFBQVEsRUFBSSxVQUFRLENBQUM7QUFDMUIiLCJmaWxlIjoiYWN0aXZpdGllcy9zY29wZU5vZGUuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcbmxldCBhc3NlcnQgPSByZXF1aXJlKFwiYXNzZXJ0XCIpO1xuXG5mdW5jdGlvbiBTY29wZU5vZGUoaW5zdGFuY2VJZCwgc2NvcGVQYXJ0LCB1c2VySWQpIHtcbiAgICBhc3NlcnQoaW5zdGFuY2VJZCk7XG4gICAgYXNzZXJ0KHNjb3BlUGFydCk7XG4gICAgdGhpcy5pbnN0YW5jZUlkID0gaW5zdGFuY2VJZDtcbiAgICB0aGlzLnVzZXJJZCA9IHVzZXJJZDtcbiAgICB0aGlzLl9wYXJlbnQgPSBudWxsO1xuICAgIHRoaXMuX2NoaWxkcmVuID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3Njb3BlUGFydCA9IHNjb3BlUGFydDtcbiAgICB0aGlzLl9rZXlzID0gW107XG4gICAgZm9yIChsZXQga2V5IGluIHNjb3BlUGFydCkge1xuICAgICAgICB0aGlzLl9rZXlzLnB1c2goa2V5KTtcbiAgICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFNjb3BlTm9kZS5wcm90b3R5cGUsIHtcbiAgICBfa2V5czoge1xuICAgICAgICB2YWx1ZTogbnVsbCxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSxcbiAgICBzY29wZVBhcnQ6IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zY29wZVBhcnQ7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHBhcmVudDoge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIFNjb3BlTm9kZSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTm9kZSBhcmd1bWVudCBleHBlY3RlZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fcGFyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IGFscmVhZHkgZGVmaW5lZC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZS5hZGRDaGlsZCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5TY29wZU5vZGUucHJvdG90eXBlLndhbGtUb1Jvb3QgPSBmdW5jdGlvbiogKG5vV2Fsaykge1xuICAgIGxldCBjdXJyZW50ID0gdGhpcztcbiAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgICB5aWVsZCBjdXJyZW50O1xuICAgICAgICBpZiAobm9XYWxrKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5fcGFyZW50O1xuICAgIH1cbn07XG5cblNjb3BlTm9kZS5wcm90b3R5cGUuY2hpbGRyZW4gPSBmdW5jdGlvbiogKCkge1xuICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuX2NoaWxkcmVuLnZhbHVlcygpKSB7XG4gICAgICAgIHlpZWxkIGNoaWxkO1xuICAgIH1cbn07XG5cblNjb3BlTm9kZS5wcm90b3R5cGUuYWRkQ2hpbGQgPSBmdW5jdGlvbiAoY2hpbGRJdGVtKSB7XG4gICAgaWYgKCEoY2hpbGRJdGVtIGluc3RhbmNlb2YgU2NvcGVOb2RlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTm9kZSBhcmd1bWVudCBleHBlY3RlZC5cIik7XG4gICAgfVxuICAgIGlmIChjaGlsZEl0ZW0uX3BhcmVudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJdGVtIGhhcyBiZWVuIGFscmVhZHkgaGEgYSBwYXJlbnQgbm9kZS5cIik7XG4gICAgfVxuICAgIGNoaWxkSXRlbS5fcGFyZW50ID0gdGhpcztcbiAgICB0aGlzLl9jaGlsZHJlbi5zZXQoY2hpbGRJdGVtLmluc3RhbmNlSWQsIGNoaWxkSXRlbSk7XG59O1xuXG5TY29wZU5vZGUucHJvdG90eXBlLnJlbW92ZUNoaWxkID0gZnVuY3Rpb24gKGNoaWxkSXRlbSkge1xuICAgIGlmICghKGNoaWxkSXRlbSBpbnN0YW5jZW9mIFNjb3BlTm9kZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk5vZGUgYXJndW1lbnQgZXhwZWN0ZWQuXCIpO1xuICAgIH1cbiAgICBpZiAoY2hpbGRJdGVtLl9wYXJlbnQgIT09IHRoaXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSXRlbSBpcyBub3QgYSBjdXJyZW50IG5vZGUncyBjaGlsZC5cIik7XG4gICAgfVxuICAgIGNoaWxkSXRlbS5fcGFyZW50ID0gbnVsbDtcbiAgICB0aGlzLl9jaGlsZHJlbi5kZWxldGUoY2hpbGRJdGVtLmluc3RhbmNlSWQpO1xufTtcblxuU2NvcGVOb2RlLnByb3RvdHlwZS5jbGVhckNoaWxkcmVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2NoaWxkcmVuLmNsZWFyKCk7XG59O1xuXG5TY29wZU5vZGUucHJvdG90eXBlLmlzUHJvcGVydHlFeGlzdHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiAhXy5pc1VuZGVmaW5lZCh0aGlzLl9zY29wZVBhcnRbbmFtZV0pO1xufTtcblxuU2NvcGVOb2RlLnByb3RvdHlwZS5nZXRQcm9wZXJ0eVZhbHVlID0gZnVuY3Rpb24gKG5hbWUsIGNhblJldHVyblByaXZhdGUpIHtcbiAgICBpZiAoY2FuUmV0dXJuUHJpdmF0ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2NvcGVQYXJ0W25hbWVdO1xuICAgIH1cbiAgICBlbHNlIGlmICghdGhpcy5faXNQcml2YXRlKG5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY29wZVBhcnRbbmFtZV07XG4gICAgfVxufTtcblxuU2NvcGVOb2RlLnByb3RvdHlwZS5zZXRQcm9wZXJ0eVZhbHVlID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBjYW5TZXRQcml2YXRlKSB7XG4gICAgaWYgKHRoaXMuX2lzUHJpdmF0ZShuYW1lKSkge1xuICAgICAgICBpZiAoY2FuU2V0UHJpdmF0ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzUHJvcGVydHlFeGlzdHMobmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zY29wZVBhcnRbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCFfLmlzVW5kZWZpbmVkKHRoaXMuX3Njb3BlUGFydFtuYW1lXSkpIHtcbiAgICAgICAgdGhpcy5fc2NvcGVQYXJ0W25hbWVdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5TY29wZU5vZGUucHJvdG90eXBlLmNyZWF0ZVByb3BlcnR5V2l0aFZhbHVlID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKCF0aGlzLmlzUHJvcGVydHlFeGlzdHMobmFtZSkpIHtcbiAgICAgICAgdGhpcy5fa2V5cy5wdXNoKG5hbWUpO1xuICAgIH1cbiAgICB0aGlzLl9zY29wZVBhcnRbbmFtZV0gPSB2YWx1ZTtcbn07XG5cblNjb3BlTm9kZS5wcm90b3R5cGUuZGVsZXRlUHJvcGVydHkgPSBmdW5jdGlvbiAobmFtZSwgY2FuRGVsZXRlUHJpdmF0ZSkge1xuICAgIGlmICghXy5pc1VuZGVmaW5lZCh0aGlzLl9zY29wZVBhcnRbbmFtZV0pKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1ByaXZhdGUobmFtZSkpIHtcbiAgICAgICAgICAgIGlmIChjYW5EZWxldGVQcml2YXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5zcGxpY2UoXy5pbmRleE9mKHRoaXMuX2tleXMsIG5hbWUpLCAxKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fc2NvcGVQYXJ0W25hbWVdO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fa2V5cy5zcGxpY2UoXy5pbmRleE9mKHRoaXMuX2tleXMsIG5hbWUpLCAxKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9zY29wZVBhcnRbbmFtZV07XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5TY29wZU5vZGUucHJvdG90eXBlLmVudW1lcmF0ZVByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiogKGNhbkVudW1lcmF0ZVByaXZhdGUpIHtcbiAgICBpZiAoY2FuRW51bWVyYXRlUHJpdmF0ZSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2tleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHlpZWxkIHRoaXMuX2tleXNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fa2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGtleSA9IHRoaXMuX2tleXNbaV07XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzUHJpdmF0ZShrZXkpKSB7XG4gICAgICAgICAgICAgICAgeWllbGQga2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuU2NvcGVOb2RlLnByb3RvdHlwZS5wcm9wZXJ0aWVzID0gZnVuY3Rpb24qICgpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgZm9yIChsZXQgZm4gb2Ygc2VsZi5fa2V5cykge1xuICAgICAgICB5aWVsZCB7IG5hbWU6IGZuLCB2YWx1ZTogc2VsZi5fc2NvcGVQYXJ0W2ZuXSB9O1xuICAgIH1cbn07XG5cblNjb3BlTm9kZS5wcm90b3R5cGUuX2lzUHJpdmF0ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4ga2V5WzBdID09PSBcIl9cIjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2NvcGVOb2RlO1xuIl19
