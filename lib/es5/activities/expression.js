"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
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
      callContext.complete(f.call(self, _));
    } catch (e) {
      callContext.fail(e);
    }
  } else {
    callContext.complete(null);
  }
};
module.exports = Expression;

//# sourceMappingURL=expression.js.map
