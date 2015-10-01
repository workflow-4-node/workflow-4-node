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
            if (i++ === 3) {
              throw new Error("OK");
            }
            return i;
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
                  assert(d > 400 && d < 500);
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
//# sourceMappingURL=data:application/json;base64,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dXJjZVJvb3QiOiJ0ZXN0cy9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qIGdsb2JhbCBkZXNjcmliZSxpdCAqL1xyXG5cclxubGV0IHdmNG5vZGUgPSByZXF1aXJlKFwiLi4vLi4vLi4vXCIpO1xyXG5sZXQgRnVuYyA9IHdmNG5vZGUuYWN0aXZpdGllcy5GdW5jO1xyXG5sZXQgQ29uc29sZVRyYWNrZXIgPSB3ZjRub2RlLmFjdGl2aXRpZXMuQ29uc29sZVRyYWNrZXI7XHJcbmxldCBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSA9IHdmNG5vZGUuYWN0aXZpdGllcy5BY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZTtcclxubGV0IGFzc2VydCA9IHJlcXVpcmUoXCJiZXR0ZXItYXNzZXJ0XCIpO1xyXG5sZXQgQmx1ZWJpcmQgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XHJcbmxldCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcclxubGV0IGFzeW5jID0gd2Y0bm9kZS5jb21tb24uYXN5bmNIZWxwZXJzLmFzeW5jO1xyXG5yZXF1aXJlKFwiZGF0ZS11dGlsc1wiKTtcclxuXHJcbmRlc2NyaWJlKFwiZGVsYXlzXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGRlc2NyaWJlKFwiRGVsYXlUb1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaXQoXCJzaG91bGQgd2FpdCBmb3IgMjAwbXNcIiwgZnVuY3Rpb24gKGRvbmUpIHtcclxuICAgICAgICAgICAgbGV0IGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XHJcbiAgICAgICAgICAgICAgICBcIkBkZWxheVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbXM6IDIwMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFzeW5jKGZ1bmN0aW9uKigpIHtcclxuICAgICAgICAgICAgICAgIGxldCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgeWllbGQgZW5naW5lLmludm9rZSgpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZSgpIC0gbm93O1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGQgPiAyMDAgJiYgZCA8IDQwMCk7XHJcbiAgICAgICAgICAgIH0pKCkubm9kZWlmeShkb25lKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKFwiUmVwZWF0XCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpdChcInNob3VsZCByZXBlYXQgaXRzIGFyZ3NcIiwgZnVuY3Rpb24gKGRvbmUpIHtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBsZXQgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHtcclxuICAgICAgICAgICAgICAgIFwiQHJlcGVhdFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWxUeXBlOiBcInNlY29uZGx5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWxWYWx1ZTogMC4yLFxyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkrKyA9PT0gMykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9LXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgYXN5bmMoZnVuY3Rpb24qKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vdyA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIGVuZ2luZS5pbnZva2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS5tZXNzYWdlID09PSBcIk9LXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZSgpIC0gbm93O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZCA+IDQwMCAmJiBkIDwgNTAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGkgPT09IDQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCkubm9kZWlmeShkb25lKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTsiXX0=
