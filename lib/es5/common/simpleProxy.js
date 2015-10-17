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
    get: function() {
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
    value: function(mode) {
      var self = this;
      if (mode === SimpleProxy.updateMode.init) {
        var $__4 = true;
        var $__5 = false;
        var $__6 = undefined;
        try {
          var $__29 = this,
              $__30 = function() {
                var newKey = $__2.value;
                {
                  if (_.isUndefined($__29[newKey])) {
                    $__29._backendKeys.push(newKey);
                    Object.defineProperty(self, newKey, {
                      enumerable: true,
                      configurable: true,
                      get: function() {
                        return self._backend.getValue(self, newKey);
                      },
                      set: function(value) {
                        self._backend.setValue(self, newKey, value);
                      }
                    });
                  }
                }
              };
          for (var $__2 = void 0,
              $__1 = (this._backend.getKeys(this))[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
            $__30();
          }
        } catch ($__7) {
          $__5 = true;
          $__6 = $__7;
        } finally {
          try {
            if (!$__4 && $__1.return != null) {
              $__1.return();
            }
          } finally {
            if ($__5) {
              throw $__6;
            }
          }
        }
      } else if (mode === SimpleProxy.updateMode.oneWay) {
        var currBackendKeys = new Set(this._backend.getKeys(this));
        var $__31 = this,
            $__32 = function(key) {
              if (!currBackendKeys.has(key)) {
                $__31._backend.setValue(self, key, $__31[key]);
                Object.defineProperty(self, key, {
                  enumerable: true,
                  configurable: true,
                  get: function() {
                    return self._backend.getValue(self, key);
                  },
                  set: function(value) {
                    self._backend.setValue(self, key, value);
                  }
                });
                $__31._backendKeys.push(key);
              } else {
                currBackendKeys.delete(key);
              }
            };
        for (var key in this) {
          $__32(key);
        }
        var $__11 = true;
        var $__12 = false;
        var $__13 = undefined;
        try {
          for (var $__9 = void 0,
              $__8 = (currBackendKeys)[Symbol.iterator](); !($__11 = ($__9 = $__8.next()).done); $__11 = true) {
            var oldKey = $__9.value;
            {
              delete this[oldKey];
            }
          }
        } catch ($__14) {
          $__12 = true;
          $__13 = $__14;
        } finally {
          try {
            if (!$__11 && $__8.return != null) {
              $__8.return();
            }
          } finally {
            if ($__12) {
              throw $__13;
            }
          }
        }
      } else {
        var prevBackendKeys = new Set(this._backendKeys);
        var currBackendKeys$__33 = new Set(this._backend.getKeys(this));
        var backedKeys = new Set();
        var $__35 = this,
            $__36 = function(key) {
              if (!prevBackendKeys.has(key) && !currBackendKeys$__33.has(key)) {
                $__35._backend.setValue(self, key, $__35[key]);
                Object.defineProperty(self, key, {
                  enumerable: true,
                  configurable: true,
                  get: function() {
                    return self._backend.getValue(self, key);
                  },
                  set: function(value) {
                    self._backend.setValue(self, key, value);
                  }
                });
                backedKeys.add(key);
              }
            };
        for (var key$__34 in this) {
          $__36(key$__34);
        }
        this._backendKeys.length = 0;
        var $__18 = true;
        var $__19 = false;
        var $__20 = undefined;
        try {
          var $__37 = this,
              $__38 = function() {
                var newKey = $__16.value;
                {
                  if (!$__37._skipKeys.has(newKey)) {
                    $__37._backendKeys.push(newKey);
                    if (!prevBackendKeys.has(newKey) && !backedKeys.has(newKey)) {
                      Object.defineProperty(self, newKey, {
                        enumerable: true,
                        configurable: true,
                        get: function() {
                          return self._backend.getValue(self, newKey);
                        },
                        set: function(value) {
                          self._backend.setValue(self, newKey, value);
                        }
                      });
                    } else {
                      prevBackendKeys.delete(newKey);
                    }
                  }
                }
              };
          for (var $__16 = void 0,
              $__15 = (currBackendKeys$__33)[Symbol.iterator](); !($__18 = ($__16 = $__15.next()).done); $__18 = true) {
            $__38();
          }
        } catch ($__21) {
          $__19 = true;
          $__20 = $__21;
        } finally {
          try {
            if (!$__18 && $__15.return != null) {
              $__15.return();
            }
          } finally {
            if ($__19) {
              throw $__20;
            }
          }
        }
        var $__25 = true;
        var $__26 = false;
        var $__27 = undefined;
        try {
          for (var $__23 = void 0,
              $__22 = (prevBackendKeys)[Symbol.iterator](); !($__25 = ($__23 = $__22.next()).done); $__25 = true) {
            var oldKey$__39 = $__23.value;
            {
              delete this[oldKey$__39];
            }
          }
        } catch ($__28) {
          $__26 = true;
          $__27 = $__28;
        } finally {
          try {
            if (!$__25 && $__22.return != null) {
              $__22.return();
            }
          } finally {
            if ($__26) {
              throw $__27;
            }
          }
        }
      }
    }
  },
  delete: {
    enumerable: false,
    writable: false,
    value: function(key) {
      delete this[key];
      this._backend.delete(this, key);
    }
  }
});
module.exports = SimpleProxy;

//# sourceMappingURL=simpleProxy.js.map
