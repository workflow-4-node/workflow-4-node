"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var is = require("../common/is");
var Block = require("./block");
var WithBody = require("./withBody");
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
              $__1 = (this.args)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
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
    this._todo = _.isArray(result) ? result : [result];
    callContext.activity._doStep.call(this, callContext);
  } else {
    callContext.end(reason, result);
  }
};
ForEach.prototype._doStep = function(callContext, lastResult) {
  var varName = this.varName;
  var todo = this._todo;
  if (todo && todo.length) {
    if (this.parallel) {
      var bodies = this._bodies;
      var pack = [];
      var idx = 0;
      while (todo.length && idx < bodies.length) {
        var item = todo[0];
        todo.splice(0, 1);
        var variables = {};
        variables[varName] = item;
        pack.push({
          variables: variables,
          activity: bodies[idx++]
        });
      }
      callContext.schedule(pack, "_bodyFinished");
    } else {
      var item$__8 = todo[0];
      todo.splice(0, 1);
      var variables$__9 = {};
      variables$__9[varName] = item$__8;
      callContext.schedule({
        activity: this._body,
        variables: variables$__9
      }, "_bodyFinished");
    }
  } else {
    callContext.complete(lastResult);
  }
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
