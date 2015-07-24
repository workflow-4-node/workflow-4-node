"use strict";

let Proxy = require("node-proxy");

module.exports.create = function (scopeTree, node, noWalk) {
    return Proxy.create({
        has: function (name) {
            return scopeTree.hasProperty(node, name, noWalk);
        },

        get: function (target, name) {
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
};