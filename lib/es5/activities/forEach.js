"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var is = require("../common/is");
var Block = require("./block");
var WithBody = require("./withBody");
var errors = require("../common/errors");
function ForEach() {
  WithBody.call(this);
  this.items = null;
  this.varName = "item";
  this.parallel = false;
  this._bodies = null;
}
util.inherits(ForEach, WithBody);
ForEach.prototype.initializeStructure = function() {
  if (this.parallel) {
    var numCPUs = require("os").cpus().length;
    this._bodies = [];
    if (this.args && this.args.length) {
      for (var i = 0; i < Math.min(process.env.UV_THREADPOOL_SIZE || 100000, numCPUs); i++) {
        var newArgs = [];
        var $__4 = true;
        var $__5 = false;
        var $__6 = undefined;
        try {
          for (var $__2 = void 0,
              $__1 = (this.args)[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
            var arg = $__2.value;
            {
              if (arg instanceof Activity) {
                newArgs.push(arg.clone());
              } else {
                newArgs.push(arg);
              }
            }
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
        var newBody = new Block();
        newBody.args = newArgs;
        this._bodies.push(newBody);
      }
    }
    this.args = null;
  } else {
    WithBody.prototype.initializeStructure.call(this);
  }
};
ForEach.prototype.run = function(callContext, args) {
  var varName = this.varName;
  var items = this.items;
  if (!_.isNull(items)) {
    this[varName] = null;
    callContext.schedule(items, "_itemsGot");
  } else {
    callContext.complete();
  }
};
ForEach.prototype._itemsGot = function(callContext, reason, result) {
  if (reason === Activity.states.complete && !_.isUndefined(result)) {
    if (result && _.isFunction(result.next)) {
      this._iterator = result;
    } else {
      this._remainingItems = _.isArray(result) ? result : [result];
    }
    callContext.activity._doStep.call(this, callContext);
  } else {
    callContext.end(reason, result);
  }
};
ForEach.prototype._doStep = function(callContext, lastResult) {
  var varName = this.varName;
  var remainingItems = this._remainingItems;
  var iterator = this._iterator;
  if (remainingItems && remainingItems.length) {
    if (this.parallel) {
      var bodies = this._bodies;
      var pack = [];
      var idx = 0;
      while (remainingItems.length && idx < bodies.length) {
        var item = remainingItems[0];
        remainingItems.splice(0, 1);
        var variables = {};
        variables[varName] = item;
        pack.push({
          variables: variables,
          activity: bodies[idx++]
        });
      }
      callContext.schedule(pack, "_bodyFinished");
    } else {
      var item$__8 = remainingItems[0];
      remainingItems.splice(0, 1);
      var variables$__9 = {};
      variables$__9[varName] = item$__8;
      callContext.schedule({
        activity: this._body,
        variables: variables$__9
      }, "_bodyFinished");
    }
    return;
  }
  if (iterator) {
    if (this.parallel) {
      callContext.fail(new errors.ActivityRuntimeError("Parallel execution not supported with generators."));
      return;
    } else {
      var next = iterator.next();
      if (!next.done) {
        var variables$__10 = {};
        variables$__10[varName] = next.value;
        callContext.schedule({
          activity: this._body,
          variables: variables$__10
        }, "_bodyFinished");
        return;
      }
    }
  }
  callContext.complete(lastResult);
};
ForEach.prototype._bodyFinished = function(callContext, reason, result) {
  if (reason === Activity.states.complete) {
    callContext.activity._doStep.call(this, callContext, result);
  } else {
    callContext.end(reason, result);
  }
};
module.exports = ForEach;

//# sourceMappingURL=forEach.js.map
