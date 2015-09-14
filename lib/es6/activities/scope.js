"use strict";

let SimpleProxy = require("../common/SimpleProxy");

let scopeFactory = {
    create: function(scopeTree, node, noWalk) {
        function getKeys() {
            let keys = [];
            let has = new Set();
            for (let key of scopeTree.enumeratePropertyNames(node, noWalk)) {
                if (!has.has(key)) {
                    keys.push(key);
                    has.add(key);
                }
            }
            return keys;
        }
        return new SimpleProxy({
            getKeys: function(proxy) {
                return getKeys();
            },
            getValue: function(proxy, name) {
                if (name === "$keys") {
                    return getKeys();
                }
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
};

module.exports = scopeFactory;

/*let Proxy = require("node-proxy");

module.exports.create = function (scopeTree, node, noWalk) {
    return Proxy.create({
        has: function (name) {
            return scopeTree.hasProperty(node, name, noWalk);
        },

        get: function (target, name) {
            if (name === "$keys") {
                return scopeTree.enumeratePropertyNames(node, noWalk);
            }
            return scopeTree.getValue(node, name, noWalk);
        },

        set: function (target, name, value) {
            scopeTree.setValue(node, name, value, noWalk);
            return value;
        },

        delete: function (name) {
            return scopeTree.deleteProperty(node, name, noWalk);
        },

        enumerate: function (target) {
            return scopeTree.enumeratePropertyNames(node, noWalk);
        }
    });
};*/