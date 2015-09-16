"use strict";
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("better-assert");
var Bluebird = require("bluebird");
var _ = require("lodash");
var async = wf4node.common.asyncHelpers.async;
describe("exceptions", function() {
  describe("Throw", function() {
    it("should throw errors", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {args: [{"@throw": {error: function() {
                return new TypeError("foo");
              }}}]}});
      async($traceurRuntime.initGeneratorFunction(function $__4() {
        var e;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.pushTry(9, null);
                $ctx.state = 12;
                break;
              case 12:
                $ctx.state = 2;
                return engine.invoke();
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              case 4:
                $ctx.popTry();
                $ctx.state = 14;
                break;
              case 9:
                $ctx.popTry();
                $ctx.maybeUncatchable();
                e = $ctx.storedException;
                $ctx.state = 7;
                break;
              case 7:
                assert(e instanceof TypeError);
                assert(e.message === "foo");
                $ctx.state = 8;
                break;
              case 8:
                $ctx.state = -2;
                break;
              case 14:
                assert(false);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))().nodeify(done);
    });
    it("should throw strings as errors", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {args: [{"@throw": {error: "foo"}}]}});
      async($traceurRuntime.initGeneratorFunction(function $__4() {
        var e;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.pushTry(9, null);
                $ctx.state = 12;
                break;
              case 12:
                $ctx.state = 2;
                return engine.invoke();
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              case 4:
                $ctx.popTry();
                $ctx.state = 14;
                break;
              case 9:
                $ctx.popTry();
                $ctx.maybeUncatchable();
                e = $ctx.storedException;
                $ctx.state = 7;
                break;
              case 7:
                assert(e instanceof Error);
                assert(e.message === "foo");
                $ctx.state = 8;
                break;
              case 8:
                $ctx.state = -2;
                break;
              case 14:
                assert(false);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))().nodeify(done);
    });
  });
  describe("Try", function() {
    it("should catch code errors", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {
          r: null,
          f: null,
          tr: null,
          args: [{"@try": {
              "@to": "tr",
              args: [function() {
                throw new Error("foo");
              }],
              catch: [{"@assign": {
                  to: "r",
                  value: "= this.e"
                }}, 55],
              finally: {"@assign": {
                  to: "f",
                  value: "OK"
                }}
            }}, "= {r: this.r, f: this.f, tr: this.tr }"]
        }});
      async($traceurRuntime.initGeneratorFunction(function $__4() {
        var status;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = 2;
                return engine.invoke();
              case 2:
                status = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                assert(_.isPlainObject(status));
                assert(status.r instanceof Error);
                assert(status.r.message === "foo");
                assert(status.tr === 55);
                assert(status.f === "OK");
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))().nodeify(done);
    });
    it("should catch Throw errors", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {
          r: null,
          f: null,
          tr: null,
          OK: "OK",
          args: [{"@try": {
              "@to": "tr",
              args: [{"@throw": {error: "foo"}}],
              catch: [{"@assign": {
                  to: "r",
                  value: "= this.e"
                }}, 55],
              finally: [{"@assign": {
                  to: "f",
                  value: "= this.OK"
                }}]
            }}, "= {r: this.r, f: this.f, tr: this.tr }"]
        }});
      async($traceurRuntime.initGeneratorFunction(function $__4() {
        var status;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = 2;
                return engine.invoke();
              case 2:
                status = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                assert(_.isPlainObject(status));
                assert(status.r instanceof Error);
                assert(status.r.message === "foo");
                assert(status.tr === 55);
                assert(status.f === "OK");
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))().nodeify(done);
    });
    it("should throw errors when there is finally only", function(done) {
      var x = null;
      var engine = new ActivityExecutionEngine({"@block": {args: [{"@try": {
              args: [{"@throw": {error: "foo"}}],
              finally: function() {
                x = "OK";
              }
            }}]}});
      async($traceurRuntime.initGeneratorFunction(function $__4() {
        var e;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.pushTry(9, null);
                $ctx.state = 12;
                break;
              case 12:
                $ctx.state = 2;
                return engine.invoke();
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              case 4:
                $ctx.popTry();
                $ctx.state = 14;
                break;
              case 9:
                $ctx.popTry();
                $ctx.maybeUncatchable();
                e = $ctx.storedException;
                $ctx.state = 7;
                break;
              case 7:
                assert(e instanceof Error);
                assert(e.message === "foo");
                assert(x === "OK");
                $ctx.state = 8;
                break;
              case 8:
                $ctx.state = -2;
                break;
              case 14:
                assert(false);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))().nodeify(done);
    });
    it("should rethrow current error", function(done) {
      var ge = null;
      var gf = null;
      var engine = new ActivityExecutionEngine({"@block": {args: [{"@try": {
              args: [{"@throw": {error: "foo"}}],
              catch: [function() {
                ge = this.e;
              }, {"@throw": {}}],
              finally: function() {
                gf = "OK";
              }
            }}]}});
      async($traceurRuntime.initGeneratorFunction(function $__4() {
        var e;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.pushTry(9, null);
                $ctx.state = 12;
                break;
              case 12:
                $ctx.state = 2;
                return engine.invoke();
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              case 4:
                $ctx.popTry();
                $ctx.state = 14;
                break;
              case 9:
                $ctx.popTry();
                $ctx.maybeUncatchable();
                e = $ctx.storedException;
                $ctx.state = 7;
                break;
              case 7:
                assert(e instanceof Error);
                assert(e.message === "foo");
                assert(ge === e);
                assert(gf === "OK");
                $ctx.state = 8;
                break;
              case 8:
                $ctx.state = -2;
                break;
              case 14:
                assert(false);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))().nodeify(done);
    });
    it("should rethrow a new error", function(done) {
      var ge = null;
      var gf = null;
      var engine = new ActivityExecutionEngine({"@block": {args: [{"@try": {
              args: [{"@throw": {error: "foo"}}],
              catch: [function() {
                ge = this.e;
              }, {"@throw": {error: "= this.e.message + 'pupu'"}}],
              finally: function() {
                gf = "OK";
              }
            }}]}});
      async($traceurRuntime.initGeneratorFunction(function $__4() {
        var e;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.pushTry(9, null);
                $ctx.state = 12;
                break;
              case 12:
                $ctx.state = 2;
                return engine.invoke();
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              case 4:
                $ctx.popTry();
                $ctx.state = 14;
                break;
              case 9:
                $ctx.popTry();
                $ctx.maybeUncatchable();
                e = $ctx.storedException;
                $ctx.state = 7;
                break;
              case 7:
                assert(e instanceof Error);
                assert(e.message === "foopupu");
                assert(ge instanceof Error);
                assert(ge.message === "foo");
                assert(gf === "OK");
                $ctx.state = 8;
                break;
              case 8:
                $ctx.state = -2;
                break;
              case 14:
                assert(false);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))().nodeify(done);
    });
    it("should catch a rethrown error in a custom varname", function(done) {
      var ge = null;
      var gf = null;
      var engine = new ActivityExecutionEngine({"@block": {args: [{"@try": {
              varName: "err",
              args: {"@try": {
                  args: [{"@throw": {error: "foo"}}],
                  catch: [function() {
                    ge = this.e;
                  }, {"@throw": {error: "= this.e.message + 'pupu'"}}],
                  finally: function() {
                    gf = "OK";
                  }
                }},
              catch: ["= this.err"]
            }}]}});
      async($traceurRuntime.initGeneratorFunction(function $__4() {
        var e;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.state = 2;
                return engine.invoke();
              case 2:
                e = $ctx.sent;
                $ctx.state = 4;
                break;
              case 4:
                assert(e instanceof Error);
                assert(e.message === "foopupu");
                assert(ge instanceof Error);
                assert(ge.message === "foo");
                assert(gf === "OK");
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__4, this);
      }))().nodeify(done);
    });
  });
});
//# sourceMappingURL=data:application/json;base64,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czYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qIGdsb2JhbCBkZXNjcmliZSxpdCAqL1xyXG5cclxubGV0IHdmNG5vZGUgPSByZXF1aXJlKFwiLi4vLi4vLi4vXCIpO1xyXG5sZXQgRnVuYyA9IHdmNG5vZGUuYWN0aXZpdGllcy5GdW5jO1xyXG5sZXQgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUgPSB3ZjRub2RlLmFjdGl2aXRpZXMuQWN0aXZpdHlFeGVjdXRpb25FbmdpbmU7XHJcbmxldCBhc3NlcnQgPSByZXF1aXJlKFwiYmV0dGVyLWFzc2VydFwiKTtcclxubGV0IEJsdWViaXJkID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xyXG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XHJcbmxldCBhc3luYyA9IHdmNG5vZGUuY29tbW9uLmFzeW5jSGVscGVycy5hc3luYztcclxuXHJcbmRlc2NyaWJlKFwiZXhjZXB0aW9uc1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBkZXNjcmliZShcIlRocm93XCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpdChcInNob3VsZCB0aHJvdyBlcnJvcnNcIiwgZnVuY3Rpb24gKGRvbmUpIHtcclxuICAgICAgICAgICAgbGV0IGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XHJcbiAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0aHJvd1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJmb29cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFzeW5jKGZ1bmN0aW9uKigpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgZW5naW5lLmludm9rZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZSBpbnN0YW5jZW9mIFR5cGVFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUubWVzc2FnZSA9PT0gXCJmb29cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlKTtcclxuICAgICAgICAgICAgfSkoKS5ub2RlaWZ5KGRvbmUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcInNob3VsZCB0aHJvdyBzdHJpbmdzIGFzIGVycm9yc1wiLCBmdW5jdGlvbiAoZG9uZSkge1xyXG4gICAgICAgICAgICBsZXQgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHtcclxuICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRocm93XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCJmb29cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFzeW5jKGZ1bmN0aW9uKigpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgZW5naW5lLmludm9rZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZSBpbnN0YW5jZW9mIEVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZS5tZXNzYWdlID09PSBcImZvb1wiKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xyXG4gICAgICAgICAgICB9KSgpLm5vZGVpZnkoZG9uZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZShcIlRyeVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaXQoXCJzaG91bGQgY2F0Y2ggY29kZSBlcnJvcnNcIiwgZnVuY3Rpb24gKGRvbmUpIHtcclxuICAgICAgICAgICAgbGV0IGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XHJcbiAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBmOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdHJ5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0b1wiOiBcInRyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJmb29cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIj0gdGhpcy5lXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgNTVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHk6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcImZcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIk9LXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCI9IHtyOiB0aGlzLnIsIGY6IHRoaXMuZiwgdHI6IHRoaXMudHIgfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFzeW5jKGZ1bmN0aW9uKigpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdGF0dXMgPSB5aWVsZCBlbmdpbmUuaW52b2tlKCk7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoXy5pc1BsYWluT2JqZWN0KHN0YXR1cykpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHN0YXR1cy5yIGluc3RhbmNlb2YgRXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHN0YXR1cy5yLm1lc3NhZ2UgPT09IFwiZm9vXCIpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHN0YXR1cy50ciA9PT0gNTUpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHN0YXR1cy5mID09PSBcIk9LXCIpO1xyXG4gICAgICAgICAgICB9KSgpLm5vZGVpZnkoZG9uZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwic2hvdWxkIGNhdGNoIFRocm93IGVycm9yc1wiLCBmdW5jdGlvbiAoZG9uZSkge1xyXG4gICAgICAgICAgICBsZXQgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHtcclxuICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICByOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGY6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgdHI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgT0s6IFwiT0tcIixcclxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRyeVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJ0clwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdGhyb3dcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBcImZvb1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIj0gdGhpcy5lXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgNTVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHk6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJmXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiPSB0aGlzLk9LXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCI9IHtyOiB0aGlzLnIsIGY6IHRoaXMuZiwgdHI6IHRoaXMudHIgfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFzeW5jKGZ1bmN0aW9uKigpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdGF0dXMgPSB5aWVsZCBlbmdpbmUuaW52b2tlKCk7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoXy5pc1BsYWluT2JqZWN0KHN0YXR1cykpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHN0YXR1cy5yIGluc3RhbmNlb2YgRXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHN0YXR1cy5yLm1lc3NhZ2UgPT09IFwiZm9vXCIpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHN0YXR1cy50ciA9PT0gNTUpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHN0YXR1cy5mID09PSBcIk9LXCIpO1xyXG4gICAgICAgICAgICB9KSgpLm5vZGVpZnkoZG9uZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwic2hvdWxkIHRocm93IGVycm9ycyB3aGVuIHRoZXJlIGlzIGZpbmFsbHkgb25seVwiLCBmdW5jdGlvbiAoZG9uZSkge1xyXG4gICAgICAgICAgICBsZXQgeCA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoe1xyXG4gICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdHJ5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRocm93XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCJmb29cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCA9IFwiT0tcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgYXN5bmMoZnVuY3Rpb24qKCkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICB5aWVsZCBlbmdpbmUuaW52b2tlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChlIGluc3RhbmNlb2YgRXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChlLm1lc3NhZ2UgPT09IFwiZm9vXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydCh4ID09PSBcIk9LXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSk7XHJcbiAgICAgICAgICAgIH0pKCkubm9kZWlmeShkb25lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoXCJzaG91bGQgcmV0aHJvdyBjdXJyZW50IGVycm9yXCIsIGZ1bmN0aW9uIChkb25lKSB7XHJcbiAgICAgICAgICAgIGxldCBnZSA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBnZiA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoe1xyXG4gICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdHJ5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRocm93XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCJmb29cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZSA9IHRoaXMuZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdGhyb3dcIjoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxseTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdmID0gXCJPS1wiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhc3luYyhmdW5jdGlvbiooKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIGVuZ2luZS5pbnZva2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUgaW5zdGFuY2VvZiBFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUubWVzc2FnZSA9PT0gXCJmb29cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGdlID09PSBlKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZ2YgPT09IFwiT0tcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlKTtcclxuICAgICAgICAgICAgfSkoKS5ub2RlaWZ5KGRvbmUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcInNob3VsZCByZXRocm93IGEgbmV3IGVycm9yXCIsIGZ1bmN0aW9uIChkb25lKSB7XHJcbiAgICAgICAgICAgIGxldCBnZSA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBnZiA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoe1xyXG4gICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdHJ5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRocm93XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCJmb29cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlID0gdGhpcy5lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0aHJvd1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IFwiPSB0aGlzLmUubWVzc2FnZSArICdwdXB1J1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZiA9IFwiT0tcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgYXN5bmMoZnVuY3Rpb24qKCkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICB5aWVsZCBlbmdpbmUuaW52b2tlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChlIGluc3RhbmNlb2YgRXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChlLm1lc3NhZ2UgPT09IFwiZm9vcHVwdVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZ2UgaW5zdGFuY2VvZiBFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGdlLm1lc3NhZ2UgPT09IFwiZm9vXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChnZiA9PT0gXCJPS1wiKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xyXG4gICAgICAgICAgICB9KSgpLm5vZGVpZnkoZG9uZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwic2hvdWxkIGNhdGNoIGEgcmV0aHJvd24gZXJyb3IgaW4gYSBjdXN0b20gdmFybmFtZVwiLCBmdW5jdGlvbiAoZG9uZSkge1xyXG4gICAgICAgICAgICBsZXQgZ2UgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgZ2YgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHtcclxuICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRyeVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyTmFtZTogXCJlcnJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRyeVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0aHJvd1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCJmb29cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlID0gdGhpcy5lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0aHJvd1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCI9IHRoaXMuZS5tZXNzYWdlICsgJ3B1cHUnXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZiA9IFwiT0tcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2g6IFsgXCI9IHRoaXMuZXJyXCIgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGFzeW5jKGZ1bmN0aW9uKigpIHtcclxuICAgICAgICAgICAgICAgIGxldCBlID0geWllbGQgZW5naW5lLmludm9rZSgpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGUgaW5zdGFuY2VvZiBFcnJvcik7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoZS5tZXNzYWdlID09PSBcImZvb3B1cHVcIik7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoZ2UgaW5zdGFuY2VvZiBFcnJvcik7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoZ2UubWVzc2FnZSA9PT0gXCJmb29cIik7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoZ2YgPT09IFwiT0tcIik7XHJcbiAgICAgICAgICAgIH0pKCkubm9kZWlmeShkb25lKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTsiXX0=
