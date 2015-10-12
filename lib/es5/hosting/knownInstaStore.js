"use strict";
var specStrings = require("../common/specStrings");
var InstIdPaths = require("./instIdPaths");
var _ = require("lodash");
var debug = require("debug")("wf4node:KnownInstaStore");
var enums = require("../common/enums");
function KnownInstaStore() {
  this._instances = new Map();
}
KnownInstaStore.prototype.add = function(workflowName, insta) {
  this._instances.set(specStrings.hosting.doubleKeys(workflowName, insta.id), insta);
};
KnownInstaStore.prototype.get = function(workflowName, instanceId) {
  return this._instances.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
};
KnownInstaStore.prototype.exists = function(workflowName, instanceId) {
  return this._instances.has(specStrings.hosting.doubleKeys(workflowName, instanceId));
};
KnownInstaStore.prototype.remove = function(workflowName, instanceId) {
  this._instances.delete(specStrings.hosting.doubleKeys(workflowName, instanceId));
};
KnownInstaStore.prototype.getNextWakeupables = function(count) {
  var now = new Date();
  var result = [];
  var $__12 = true;
  var $__13 = false;
  var $__14 = undefined;
  try {
    for (var $__10 = void 0,
        $__9 = (this._instances.values())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__12 = ($__10 = $__9.next()).done); $__12 = true) {
      var insta = $__10.value;
      {
        if (insta.execState === enums.activityStates.idle && insta.activeDelays) {
          var $__5 = true;
          var $__6 = false;
          var $__7 = undefined;
          try {
            for (var $__3 = void 0,
                $__2 = (insta.activeDelays)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
              var ad = $__3.value;
              {
                if (ad.delayTo <= now) {
                  result.push({
                    instanceId: insta.id,
                    workflowName: insta.workflowName,
                    activeDelay: {
                      methodName: ad.methodName,
                      delayTo: ad.delayTo
                    }
                  });
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
        }
      }
    }
  } catch ($__15) {
    $__13 = true;
    $__14 = $__15;
  } finally {
    try {
      if (!$__12 && $__9.return != null) {
        $__9.return();
      }
    } finally {
      if ($__13) {
        throw $__14;
      }
    }
  }
  result.sort(function(i1, i2) {
    if (i1.updatedOn < i2.updatedOn) {
      return -1;
    } else if (i1.updatedOn > i2.updatedOn) {
      return 1;
    } else if (i1.activeDelay.delayTo < i2.activeDelay.delayTo) {
      return -1;
    } else if (i1.activeDelay.delayTo > i2.activeDelay.delayTo) {
      return 1;
    }
    return 0;
  });
  return _.take(result, count);
};
KnownInstaStore.prototype.getRunningInstanceHeadersForOtherVersion = function(workflowName, version) {
  var result = [];
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (this._instances.values())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var insta = $__3.value;
      {
        if (insta.workflowName === workflowName && insta.version !== version) {
          result.push({
            workflowName: insta.workflowName,
            workflowVersion: insta.workflowVersion,
            instanceId: insta.id
          });
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
  return result;
};
KnownInstaStore.prototype.addTracker = function(tracker) {
  var $__5 = true;
  var $__6 = false;
  var $__7 = undefined;
  try {
    for (var $__3 = void 0,
        $__2 = (this._instances.values())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
      var insta = $__3.value;
      {
        insta.addTracker(tracker);
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
};
module.exports = KnownInstaStore;

//# sourceMappingURL=knownInstaStore.js.map
