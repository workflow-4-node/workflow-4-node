"use strict";
var Activity = require("./activity");
var util = require("util");
var errors = require("../common/errors");
var _ = require("lodash");
var Block = require("./block");
function Try() {
  Activity.call(this);
  this.arrayProperties.add("catch");
  this.arrayProperties.add("finally");
  this.nonScopedProperties.add("continueAfterFinally");
  this.varName = "e";
  this._body = null;
  this.catch = null;
  this.finally = null;
}
util.inherits(Try, Activity);
Try.prototype.initializeStructure = function() {
  this._body = new Block();
  this._body.args = this.args;
  this.args = null;
  if (this.catch) {
    var prev = this.catch;
    this.catch = new Block();
    this.catch.args = prev;
  }
  if (this.finally) {
    var prev$__0 = this.finally;
    this.finally = new Block();
    this.finally.args = prev$__0;
  }
};
Try.prototype.run = function(callContext, args) {
  callContext.schedule(this._body, "_bodyFinished");
};
Try.prototype._bodyFinished = function(callContext, reason, result) {
  if (this.catch || this.finally) {
    this._originalResult = result;
    this._originalReason = reason;
    if (reason === Activity.states.fail && !(result instanceof errors.ActivityRuntimeError) && this.catch) {
      this[this.varName] = result;
      this.Try_ReThrow = false;
      callContext.schedule(this.catch, "_catchDone");
      return;
    } else if ((reason === Activity.states.fail || reason === Activity.states.complete) && this.finally) {
      callContext.schedule(this.finally, "_finallyDone");
      return;
    }
  }
  callContext.end(reason, result);
};
Try.prototype._catchDone = function(callContext, reason, result) {
  if (reason !== Activity.states.complete) {
    callContext.end(reason, result);
    return;
  }
  this._catchResult = result;
  if (this.finally) {
    callContext.schedule(this.finally, "_finallyDone");
  } else {
    callContext.activity.continueAfterFinally.call(this, callContext);
  }
};
Try.prototype._finallyDone = function(callContext, reason, result) {
  if (reason !== Activity.states.complete) {
    callContext.end(reason, result);
    return;
  }
  callContext.activity.continueAfterFinally.call(this, callContext);
};
Try.prototype.continueAfterFinally = function(callContext) {
  var reason = this._originalReason;
  var result = this._originalResult;
  if (reason === Activity.states.fail && !_.isUndefined(this.Try_ReThrow)) {
    if (this.Try_ReThrow === true) {
      callContext.fail(result);
    } else if (this.Try_ReThrow instanceof Error) {
      callContext.fail(this.Try_ReThrow);
    } else {
      callContext.complete(this._catchResult);
    }
  } else {
    callContext.end(reason, result);
  }
};
module.exports = Try;

//# sourceMappingURL=try.js.map
