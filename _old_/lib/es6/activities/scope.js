"use strict";

let _ = require("lodash");

let scopeFactory = {
    create: function(scopeTree, node) {
        let Proxy;
        try {
            Proxy = require("node-proxy");
        }
        catch(e) {
            _.noop(e);
        }
        if (Proxy) {
            // node-proxy is successfully compiled and loadded
            return Proxy.create({
                has: function (name) {
                    return scopeTree.hasProperty(node, name);
                },

                get: function (target, name) {
                    if (name === "$keys") {
                        return scopeTree.enumeratePropertyNames(node);
                    }
                    else if (name === "delete") {
                        return this.delete;
                    }
                    else if (name === "update") {
                        return _.noop;
                    }
                    return scopeTree.getValue(node, name);
                },

                set: function (target, name, value) {
                    if (name === "$keys" || name === "delete" || name === "update") {
                        throw new TypeError(`${name} is read only.`);
                    }
                    scopeTree.setValue(node, name, value);
                    return value;
                },

                delete: function (name) {
                    return scopeTree.deleteProperty(node, name);
                },

                enumerate: function (target) {
                    return scopeTree.enumeratePropertyNames(node);
                }
            });
        }
        else {
            // node-proxy is unavailable, we should emulate a proxy:
            let SimpleProxy = require("../common/simpleProxy");

            let getKeys = function() {
                let keys = [];
                let has = new Set();
                for (let key of scopeTree.enumeratePropertyNames(node)) {
                    if (!has.has(key)) {
                        keys.push(key);
                        has.add(key);
                    }
                }
                return keys;
            };

            return new SimpleProxy({
                getKeys: function (proxy) {
                    return getKeys();
                },
                getValue: function (proxy, name) {
                    return scopeTree.getValue(node, name);
                },
                setValue: function (proxy, name, value) {
                    scopeTree.setValue(node, name, value);
                    return value;
                },
                delete: function (proxy, name) {
                    scopeTree.deleteProperty(node, name);
                }
            });
        }
    }
};

module.exports = scopeFactory;