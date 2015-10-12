"use strict";
var Activity = require("./activity");
var util = require("util");
var errors = require("../common/errors");
function Cancel() {
  Activity.call(this);
  this.force = false;
}
util.inherits(Cancel, Activity);
Cancel.prototype.run = function(callContext, args) {
  if (this.force) {
    callContext.fail(new errors.Cancelled());
  } else {
    callContext.cancel();
  }
};
module.exports = Cancel;

//# sourceMappingURL=cancel.js.map
