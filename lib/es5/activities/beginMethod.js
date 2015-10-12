"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var specStrings = require("../common/specStrings");
var errors = require("../common/errors");
function BeginMethod() {
  Activity.call(this);
  this.canCreateInstance = false;
  this.methodName = null;
  this.instanceIdPath = null;
}
util.inherits(BeginMethod, Activity);
BeginMethod.prototype.run = function(callContext, args) {
  var methodName = this.methodName;
  if (_.isString(methodName)) {
    var mn = methodName.trim();
    if (mn) {
      callContext.createBookmark(specStrings.hosting.createBeginMethodBMName(mn), "_methodInvoked");
      callContext.idle();
      return;
    }
  }
  callContext.fail(new errors.ValidationError("BeginMethod activity methodName property's value '" + methodName + "' must be a valid identifier."));
};
BeginMethod.prototype._methodInvoked = function(callContext, reason, result) {
  callContext.end(reason, result);
};
module.exports = BeginMethod;

//# sourceMappingURL=beginMethod.js.map
