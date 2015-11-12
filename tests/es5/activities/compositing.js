"use strict";
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var ConsoleTracker = wf4node.activities.ConsoleTracker;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("assert");
var Bluebird = require("bluebird");
var _ = require("lodash");
var async = wf4node.common.asyncHelpers.async;
var path = require("path");
describe("compositing", function() {
  it("should take arguments with same name as in outer scope", function(done) {
    var engine = new ActivityExecutionEngine({
      "@require": path.join(__dirname, "customActivities", "hello"),
      "@block": {
        to: "unbornchikken",
        args: {"@hello": {to: "= this.to"}}
      }
    });
    async($traceurRuntime.initGeneratorFunction(function $__4() {
      var result;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $ctx.state = 2;
              return engine.invoke();
            case 2:
              result = $ctx.sent;
              $ctx.state = 4;
              break;
            case 4:
              assert.equal(result, "Hello unbornchikken!");
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, $__4, this);
    }))().nodeify(done);
  });
});

//# sourceMappingURL=compositing.js.map
