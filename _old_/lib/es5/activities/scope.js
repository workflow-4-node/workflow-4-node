"use strict";

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var _ = require("lodash");

var scopeFactory = {
    create: function create(scopeTree, node) {
        var Proxy = undefined;
        try {
            Proxy = require("node-proxy");
        } catch (e) {
            _.noop(e);
        }
        if (Proxy) {
            // node-proxy is successfully compiled and loadded
            return Proxy.create({
                has: function has(name) {
                    return scopeTree.hasProperty(node, name);
                },

                get: function get(target, name) {
                    if (name === "$keys") {
                        return scopeTree.enumeratePropertyNames(node);
                    } else if (name === "delete") {
                        return this.delete;
                    } else if (name === "update") {
                        return _.noop;
                    }
                    return scopeTree.getValue(node, name);
                },

                set: function set(target, name, value) {
                    if (name === "$keys" || name === "delete" || name === "update") {
                        throw new TypeError(name + " is read only.");
                    }
                    scopeTree.setValue(node, name, value);
                    return value;
                },

                delete: function _delete(name) {
                    return scopeTree.deleteProperty(node, name);
                },

                enumerate: function enumerate(target) {
                    return scopeTree.enumeratePropertyNames(node);
                }
            });
        } else {
            var _ret = (function () {
                // node-proxy is unavailable, we should emulate a proxy:
                var SimpleProxy = require("../common/simpleProxy");

                var _getKeys = function _getKeys() {
                    var keys = [];
                    var has = new Set();
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = scopeTree.enumeratePropertyNames(node)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var key = _step.value;

                            if (!has.has(key)) {
                                keys.push(key);
                                has.add(key);
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    return keys;
                };

                return {
                    v: new SimpleProxy({
                        getKeys: function getKeys(proxy) {
                            return _getKeys();
                        },
                        getValue: function getValue(proxy, name) {
                            return scopeTree.getValue(node, name);
                        },
                        setValue: function setValue(proxy, name, value) {
                            scopeTree.setValue(node, name, value);
                            return value;
                        },
                        delete: function _delete(proxy, name) {
                            scopeTree.deleteProperty(node, name);
                        }
                    })
                };
            })();

            if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
        }
    }
};

module.exports = scopeFactory;
//# sourceMappingURL=scope.js.map
