"use strict";
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var ConsoleTracker = wf4node.activities.ConsoleTracker;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("better-assert");
var Bluebird = require("bluebird");
var _ = require("lodash");
var async = wf4node.common.asyncHelpers.async;
require("date-utils");
describe("delays", function() {
  describe("DelayTo", function() {
    it("should wait for 200ms", function(done) {
      var engine = new ActivityExecutionEngine({"@delay": {ms: 200}});
      async($traceurRuntime.initGeneratorFunction(function $__2() {
        var now,
            d;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                now = new Date();
                $ctx.state = 6;
                break;
              case 6:
                $ctx.state = 2;
                return engine.invoke();
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              case 4:
                d = new Date() - now;
                assert(d > 200 && d < 400);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__2, this);
      }))().nodeify(done);
    });
  });
  describe("Repeat", function() {
    it("should repeat its args", function(done) {
      var i = 0;
      var engine = new ActivityExecutionEngine({"@repeat": {
          intervalType: "secondly",
          intervalValue: 0.2,
          args: [function() {
            if (++i < 4) {
              return i;
            }
            throw new Error("OK");
          }]
        }});
      async($traceurRuntime.initGeneratorFunction(function $__2() {
        var now,
            d,
            e;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                now = new Date();
                $ctx.state = 17;
                break;
              case 17:
                $ctx.pushTry(7, null);
                $ctx.state = 10;
                break;
              case 10:
                $ctx.state = 2;
                return engine.invoke();
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              case 4:
                assert(false);
                $ctx.state = 6;
                break;
              case 6:
                $ctx.popTry();
                $ctx.state = -2;
                break;
              case 7:
                $ctx.popTry();
                $ctx.maybeUncatchable();
                e = $ctx.storedException;
                $ctx.state = 13;
                break;
              case 13:
                if (e.message === "OK") {
                  d = new Date() - now;
                  assert(d > 400 && d < 1000);
                  assert(i === 4);
                } else {
                  throw e;
                }
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__2, this);
      }))().nodeify(done);
    });
  });
});

//# sourceMappingURL=delays.js.map
