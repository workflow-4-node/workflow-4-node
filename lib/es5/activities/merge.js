"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
function Merge() {
  Activity.call(this);
  this.isTrue = true;
  this.isFalse = false;
}
util.inherits(Merge, Activity);
Merge.prototype.run = function(callContext, args) {
  callContext.schedule(args, "_argsGot");
};
Merge.prototype._argsGot = function(callContext, reason, result) {
  if (reason !== Activity.states.complete) {
    callContext.end(reason, result);
    return;
  }
  var merged;
  var mergedIsObj = false;
  var mergedIsArray = false;
  var $__10 = true;
  var $__11 = false;
  var $__12 = undefined;
  try {
    for (var $__8 = void 0,
        $__7 = (result)[Symbol.iterator](); !($__10 = ($__8 = $__7.next()).done); $__10 = true) {
      var item = $__8.value;
      {
        var isObj = _.isPlainObject(item);
        var isArray = _.isArray(item);
        if (isObj || isArray) {
          if (!merged) {
            merged = isObj ? _.cloneDeep(item) : item.slice(0);
            mergedIsObj = isObj;
            mergedIsArray = isArray;
          } else if (isObj) {
            if (!mergedIsObj) {
              callContext.fail(new Error("Object cannot merged with an array."));
              return;
            }
            _.extend(merged, item);
          } else {
            if (!mergedIsArray) {
              callContext.fail(new Error("Array cannot merged with an object."));
              return;
            }
            var $__3 = true;
            var $__4 = false;
            var $__5 = undefined;
            try {
              for (var $__1 = void 0,
                  $__0 = (item)[Symbol.iterator](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
                var sub = $__1.value;
                {
                  merged.push(sub);
                }
              }
            } catch ($__6) {
              $__4 = true;
              $__5 = $__6;
            } finally {
              try {
                if (!$__3 && $__0.return != null) {
                  $__0.return();
                }
              } finally {
                if ($__4) {
                  throw $__5;
                }
              }
            }
          }
        } else {
          callContext.fail(new Error("Only objects and arrays could be merged."));
          return;
        }
      }
    }
  } catch ($__13) {
    $__11 = true;
    $__12 = $__13;
  } finally {
    try {
      if (!$__10 && $__7.return != null) {
        $__7.return();
      }
    } finally {
      if ($__11) {
        throw $__12;
      }
    }
  }
  callContext.complete(merged);
};
module.exports = Merge;

//# sourceMappingURL=merge.js.map
