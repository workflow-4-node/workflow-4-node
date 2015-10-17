"use strict";
var _ = require("lodash");
var scopeFactory = {create: function(scopeTree, node, noWalk) {
    var Proxy;
    try {
      Proxy = require("node-proxy");
    } catch (e) {
      _.noop(e);
    }
    if (Proxy) {
      return Proxy.create({
        has: function(name) {
          return scopeTree.hasProperty(node, name, noWalk);
        },
        get: function(target, name) {
          if (name === "$keys") {
            return scopeTree.enumeratePropertyNames(node, noWalk);
          } else if (name === "delete") {
            return this.delete;
          } else if (name === "update") {
            return _.noop;
          }
          return scopeTree.getValue(node, name, noWalk);
        },
        set: function(target, name, value) {
          if (name === "$keys" || name === "delete" || name === "update") {
            throw new TypeError((name + " is read only."));
          }
          scopeTree.setValue(node, name, value, noWalk);
          return value;
        },
        delete: function(name) {
          return scopeTree.deleteProperty(node, name, noWalk);
        },
        enumerate: function(target) {
          return scopeTree.enumeratePropertyNames(node, noWalk);
        }
      });
    } else {
      var SimpleProxy = require("../common/simpleProxy");
      var getKeys = function() {
        var keys = [];
        var has = new Set();
        var $__5 = true;
        var $__6 = false;
        var $__7 = undefined;
        try {
          for (var $__3 = void 0,
              $__2 = (scopeTree.enumeratePropertyNames(node, noWalk))[Symbol.iterator](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
            var key = $__3.value;
            {
              if (!has.has(key)) {
                keys.push(key);
                has.add(key);
              }
            }
          }
        } catch ($__8) {
          $__6 = true;
          $__7 = $__8;
        } finally {
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
        }
        return keys;
      };
      return new SimpleProxy({
        getKeys: function(proxy) {
          return getKeys();
        },
        getValue: function(proxy, name) {
          return scopeTree.getValue(node, name, noWalk);
        },
        setValue: function(proxy, name, value) {
          scopeTree.setValue(node, name, value, noWalk);
          return value;
        },
        delete: function(proxy, name) {
          scopeTree.deleteProperty(node, name, noWalk);
        }
      });
    }
  }};
module.exports = scopeFactory;

//# sourceMappingURL=scope.js.map
