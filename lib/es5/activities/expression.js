"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var errors = require("../common/errors");
function Expression(expr) {
  Activity.call(this);
  this.expr = expr || null;
  this.nonSerializedProperties.add("_f");
}
util.inherits(Expression, Activity);
Expression.prototype.run = function(callContext, args) {
  var self = this;
  var expr = self.expr;
  if (expr) {
    try {
      var f = self._f;
      if (!f) {
        f = self._f = new Function("_", "return (" + expr + ")");
      }
      var result = f.call(self, _);
      if (result === callContext.activity) {
        var parent = this.$parent;
        if (!parent) {
          callContext.fail(new errors.ActivityRuntimeError("Exception can't reference itself."));
          return;
        }
        result = f.call(parent, _);
      }
      callContext.complete(result);
    } catch (e) {
      callContext.fail(e);
    }
  } else {
    callContext.complete(null);
  }
};
module.exports = Expression;

//# sourceMappingURL=expression.js.map
