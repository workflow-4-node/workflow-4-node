"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
function Obj() {
  Activity.call(this);
}
util.inherits(Obj, Activity);
Obj.prototype.run = function(callContext, args) {
  callContext.schedule(args, "_argsGot");
};
Obj.prototype._argsGot = function(callContext, reason, result) {
  if (reason !== Activity.states.complete) {
    callContext.end(reason, result);
    return;
  }
  var obj;
  if (result.length > 1) {
    obj = {};
    obj[result[0]] = result[1];
  }
  callContext.complete(obj);
};
module.exports = Obj;

//# sourceMappingURL=obj.js.map
