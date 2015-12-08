"use strict";

var _ = require("lodash");
var assert = require("better-assert");

function SimpleProxy(backend) {
    assert(_.isObject(backend));
    var self = this;

    Object.defineProperty(this, "_backend", {
        enumerable: false,
        value: backend
    });
    Object.defineProperty(this, "_backendKeys", {
        enumerable: false,
        writable: false,
        value: []
    });
    Object.defineProperty(this, "$keys", {
        enumerable: false,
        get: function get() {
            return backend.getKeys(self);
        }
    });
    this.update(SimpleProxy.updateMode.init);
}

SimpleProxy.updateMode = {
    twoWay: 0,
    oneWay: 1,
    init: 2
};

Object.defineProperties(SimpleProxy.prototype, {
    _skipKeys: {
        enumerable: false,
        writable: false,
        value: new Set(["getKeys", "getValue", "setValue"])
    },
    update: {
        enumerable: false,
        writable: false,
        value: function value(mode) {
            var _this = this;

            var self = this;
            if (mode === SimpleProxy.updateMode.init) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    var _loop = function _loop() {
                        var newKey = _step.value;

                        if (_.isUndefined(_this[newKey])) {
                            // This makes the list as unique
                            _this._backendKeys.push(newKey);
                            Object.defineProperty(self, newKey, {
                                enumerable: true,
                                configurable: true,
                                get: function get() {
                                    return self._backend.getValue(self, newKey);
                                },
                                set: function set(value) {
                                    self._backend.setValue(self, newKey, value);
                                }
                            });
                        }
                    };

                    for (var _iterator = this._backend.getKeys(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        _loop();
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
            } else if (mode === SimpleProxy.updateMode.oneWay) {
                var currBackendKeys = new Set(this._backend.getKeys(this));

                var _loop2 = function _loop2(key) {
                    if (!currBackendKeys.has(key)) {
                        // new key on proxy, and not defined on backend:
                        _this._backend.setValue(self, key, _this[key]);
                        Object.defineProperty(self, key, {
                            enumerable: true,
                            configurable: true,
                            get: function get() {
                                return self._backend.getValue(self, key);
                            },
                            set: function set(value) {
                                self._backend.setValue(self, key, value);
                            }
                        });
                        _this._backendKeys.push(key);
                    } else {
                        currBackendKeys.delete(key);
                    }
                };

                for (var key in this) {
                    _loop2(key);
                }
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = currBackendKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var oldKey = _step2.value;

                        delete this[oldKey];
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            } else {
                var prevBackendKeys = new Set(this._backendKeys);
                var currBackendKeys = new Set(this._backend.getKeys(this));
                var backedKeys = new Set();

                var _loop3 = function _loop3(key) {
                    if (!prevBackendKeys.has(key) && !currBackendKeys.has(key)) {
                        // new key on proxy, and not defined on backend:
                        _this._backend.setValue(self, key, _this[key]);
                        Object.defineProperty(self, key, {
                            enumerable: true,
                            configurable: true,
                            get: function get() {
                                return self._backend.getValue(self, key);
                            },
                            set: function set(value) {
                                self._backend.setValue(self, key, value);
                            }
                        });
                        backedKeys.add(key);
                    }
                };

                for (var key in this) {
                    _loop3(key);
                }

                this._backendKeys.length = 0;
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    var _loop4 = function _loop4() {
                        var newKey = _step3.value;

                        if (!_this._skipKeys.has(newKey)) {
                            _this._backendKeys.push(newKey);
                            if (!prevBackendKeys.has(newKey) && !backedKeys.has(newKey)) {
                                Object.defineProperty(self, newKey, {
                                    enumerable: true,
                                    configurable: true,
                                    get: function get() {
                                        return self._backend.getValue(self, newKey);
                                    },
                                    set: function set(value) {
                                        self._backend.setValue(self, newKey, value);
                                    }
                                });
                            } else {
                                prevBackendKeys.delete(newKey);
                            }
                        }
                    };

                    for (var _iterator3 = currBackendKeys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        _loop4();
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = prevBackendKeys[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var oldKey = _step4.value;

                        delete this[oldKey];
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }
            }
        }
    },
    delete: {
        enumerable: false,
        writable: false,
        value: function value(key) {
            delete this[key];
            this._backend.delete(this, key);
        }
    }
});

module.exports = SimpleProxy;
//# sourceMappingURL=simpleProxy.js.map
