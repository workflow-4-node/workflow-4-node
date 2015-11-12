"use strict";
var wf4node = require("../../../../");
var util = require("util");
var Activity = wf4node.activities.Activity;
var Composite = wf4node.activities.Composite;
var _ = require("lodash");
function Hello() {
  Composite.call(this);
  this.to = null;
}
util.inherits(Hello, Composite);
Hello.prototype.createImplementation = function() {
  return {"@block": {
      to: "= this.to",
      args: function() {
        return ("Hello " + this.to + "!");
      }
    }};
};
module.exports = Hello;

//# sourceMappingURL=hello.js.map
