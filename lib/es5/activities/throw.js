"use strict";
var Activity = require("./activity");
var util = require("util");
var errors = require("../common/errors");
var _ = require("lodash");
function Throw() {
  Activity.call(this);
  this.error = null;
}
util.inherits(Throw, Activity);
Throw.prototype.run = function(callContext, args) {
  if (!this.error) {
    if (!_.isUndefined(this.Try_ReThrow)) {
      this.Try_ReThrow = true;
    }
    callContext.complete();
  } else {
    callContext.schedule(this.error, "_errorGot");
  }
};
Throw.prototype._errorGot = function(callContext, reason, result) {
  if (reason !== Activity.states.complete) {
    callContext.end(reason, result);
    return;
  }
  var e;
  if (_.isString(result)) {
    e = new Error(result);
  } else if (result instanceof Error) {
    e = result;
  } else {
    callContext.complete();
    return;
  }
  if (!_.isUndefined(this.Try_ReThrow)) {
    this.Try_ReThrow = e;
    callContext.complete();
  } else {
    callContext.fail(e);
  }
};
module.exports = Throw;

//# sourceMappingURL=throw.js.map
