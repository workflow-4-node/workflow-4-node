"use strict";

let Proxy = require("node-proxy");

module.exports.create = function (scopeTree, node, noWalk) {
    // Cannot use proxy because of current v8 proxy issues
    /*var obj = {
        has: function (name) {
            return scopeTree.hasProperty(node, name, noWalk);
        },

        get: function (name) {
            return scopeTree.getValue(node, name, noWalk);
        },

        set: function (name, value) {
            scopeTree.setValue(node, name, value, noWalk);
            return value;
        },

        inc: function(name) {
            return obj.set(name, obj.get(name) + 1);
        },

        dec: function(name) {
            return obj.set(name, obj.get(name) - 1);
        },

        postfixInc: function(name) {
            var v = obj.get(name);
            obj.set(name, v + 1);
            return v;
        },

        postfixDec: function(name) {
            var v = obj.get(name);
            obj.set(name, v - 1);
            return v;
        },

        add: function(name, value) {
            return obj.set(name, obj.get(name) + value);
        },

        subtract: function(name, value) {
            return obj.set(name, obj.get(name) - value);
        },

        delete: function (name) {
            return scopeTree.deleteProperty(node, name);
        }
    };

    return obj;*/

    var base = {
        has: function (name) {
            return scopeTree.hasProperty(node, name);
        },

        get: function (target, name) {
            if (name === "get") {
                return function (n) {
                    return base.get(null, n);
                };
            }
            if (name === "set") {
                return function (n, v) {
                    return base.set(null, n, v);
                };
            }
            if (name === "delete") {
                return function (n) {
                    return base.delete(n);
                };
            }
            if (name === "inc") {
                return function (n) {
                    return base.set(null, n, base.get(null, n) + 1);
                };
            }
            if (name === "dec") {
                return function (n) {
                    return base.set(null, n, base.get(null, n) - 1);
                };
            }
            if (name === "add") {
                return function (n, v) {
                    return base.set(null, n, base.get(null, n) + v);
                };
            }
            if (name === "postfixInc") {
                return function (n) {
                    let v = base.get(null, n);
                    base.set(null, n, v + 1);
                    return v;
                };
            }
            return scopeTree.getValue(node, name);
        },

        set: function (target, name, value) {
            scopeTree.setValue(node, name, value);
            return value;
        },

        delete: function (name) {
            return scopeTree.deleteProperty(node, name);
        },

        enumerate: function (target) {
            return scopeTree.enumeratePropertyNames(node);
        }
    };

    return Proxy.create(base);
};