"use strict";
let _ = require("lodash");
let assert = require("better-assert");

function SimpleProxy(backend) {
    assert(_.isObject(backend));

    Object.defineProperty(this, "_backend", {
        enumerable: false,
        value: backend
    });
    this.update();
}

Object.defineProperties(SimpleProxy.prototype, {
    _skipKeys: {
        enumerable: false,
        writable: false,
        value: new Set(["getKeys", "getValue", "setValue"])
    },
    _backendKeys: {
        enumerable: false,
        writable: false,
        value: []
    },
    update: {
        enumerable: false,
        writable: false,
        value: function() {
            let self = this;
            let pkeys = new Set(this._backendKeys);
            this._backendKeys.length = 0;
            let bkeys = this._backend.getKeys(this);
            for (let newKey of bkeys) {
                if (!this._skipKeys.has(newKey)) {
                    this._backendKeys.push(newKey);
                    if (!pkeys.has(newKey)) {
                        Object.defineProperty(
                            self,
                            newKey,
                            {
                                enumerable: true,
                                get: function () {
                                    return self._backend.getValue(self, newKey);
                                },
                                set: function (value) {
                                    self._backend.setValue(self, newKey, value);
                                }
                            }
                        );
                    }
                    else {
                        pkeys.delete(newKey);
                    }
                }
            }
            for (let oldKey of pkeys) {
                delete this[oldKey];
            }
        }
    }
});

module.exports = SimpleProxy;