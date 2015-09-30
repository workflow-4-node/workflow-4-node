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
  describe("behavior", function() {
    it("should cancel other branches", function(done) {
      async($traceurRuntime.initGeneratorFunction(function $__4() {
        var x,
            engine,
            e;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                x = false;
                engine = new ActivityExecutionEngine({"@parallel": {args: [function() {
                      return Bluebird.delay(200).then(function() {
                        throw new Error("b+");
                      });
                    }, {"@block": [{"@delay": {ms: 200}}, function() {
                        x = true;
                      }]}, {"@block": [{"@delay": {ms: 100}}, {"@throw": {error: "foo"}}]}, {"@block": [{"@delay": {ms: 50}}, {"@throw": {error: "boo"}}]}]}});
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
                assert(e.message === "boo");
                assert(!x);
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
//# sourceMappingURL=data:application/json;base64,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QTRaSSxxQkFBSyxBQUFDLENBQUMsS0FBSSxDQUFDLENBQUM7Ozs7QUE1WmpDLG1CQUFHLE9BQU8sQUFBQyxFQUFDLENBQUM7Ozs7QUFDQyxtQkFBRyxPQUFPLEFBQUMsRUFBQyxDQUFDO0FBQ2IsbUJBQUcsaUJBQWlCLEFBQUMsRUFBQyxDQUFDO0FBQ3ZCLGtCQUFvQixDQUFBLElBQUcsZ0JBQWdCLENBQUM7Ozs7QUE0WmxDLHFCQUFLLEFBQUMsQ0FBQyxDQUFBLFFBQVEsSUFBTSxNQUFJLENBQUMsQ0FBQztBQUMzQixxQkFBSyxBQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQzs7OztBQWhhOUIscUJBQU8sQ0FBQSxJQUFHLElBQUksQUFBQyxFQUFDLENBQUE7O0FBQ21CLFFBQy9CLE9BQTZCLEtBQUcsQ0FBQyxDQUFDO01BZ2ExQixDQWxhMkMsQ0FrYTFDLEFBQUMsRUFBQyxRQUFRLEFBQUMsQ0FBQyxJQUFHLENBQUMsQ0FBQztJQUN0QixDQUFDLENBQUM7RUFDTixDQUFDLENBQUM7QUFDTixDQUFDLENBQUM7QUFBQSIsImZpbGUiOiJhY3Rpdml0aWVzL2V4Y2VwdGlvbnMuanMiLCJzb3VyY2VSb290IjoidGVzdHMvZXM2Iiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKiBnbG9iYWwgZGVzY3JpYmUsaXQgKi9cclxuXHJcbmxldCB3ZjRub2RlID0gcmVxdWlyZShcIi4uLy4uLy4uL1wiKTtcclxubGV0IEZ1bmMgPSB3ZjRub2RlLmFjdGl2aXRpZXMuRnVuYztcclxubGV0IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lID0gd2Y0bm9kZS5hY3Rpdml0aWVzLkFjdGl2aXR5RXhlY3V0aW9uRW5naW5lO1xyXG5sZXQgYXNzZXJ0ID0gcmVxdWlyZShcImJldHRlci1hc3NlcnRcIik7XHJcbmxldCBCbHVlYmlyZCA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcclxubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xyXG5sZXQgYXN5bmMgPSB3ZjRub2RlLmNvbW1vbi5hc3luY0hlbHBlcnMuYXN5bmM7XHJcblxyXG5kZXNjcmliZShcImV4Y2VwdGlvbnNcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgZGVzY3JpYmUoXCJUaHJvd1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaXQoXCJzaG91bGQgdGhyb3cgZXJyb3JzXCIsIGZ1bmN0aW9uIChkb25lKSB7XHJcbiAgICAgICAgICAgIGxldCBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoe1xyXG4gICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdGhyb3dcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiZm9vXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhc3luYyhmdW5jdGlvbiooKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIGVuZ2luZS5pbnZva2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUgaW5zdGFuY2VvZiBUeXBlRXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChlLm1lc3NhZ2UgPT09IFwiZm9vXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSk7XHJcbiAgICAgICAgICAgIH0pKCkubm9kZWlmeShkb25lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoXCJzaG91bGQgdGhyb3cgc3RyaW5ncyBhcyBlcnJvcnNcIiwgZnVuY3Rpb24gKGRvbmUpIHtcclxuICAgICAgICAgICAgbGV0IGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XHJcbiAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0aHJvd1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IFwiZm9vXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhc3luYyhmdW5jdGlvbiooKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIGVuZ2luZS5pbnZva2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUgaW5zdGFuY2VvZiBFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUubWVzc2FnZSA9PT0gXCJmb29cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlKTtcclxuICAgICAgICAgICAgfSkoKS5ub2RlaWZ5KGRvbmUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoXCJUcnlcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGl0KFwic2hvdWxkIGNhdGNoIGNvZGUgZXJyb3JzXCIsIGZ1bmN0aW9uIChkb25lKSB7XHJcbiAgICAgICAgICAgIGxldCBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoe1xyXG4gICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgZjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICB0cjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRyeVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJ0clwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZm9vXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcInJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDU1XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJmXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJPS1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiPSB7cjogdGhpcy5yLCBmOiB0aGlzLmYsIHRyOiB0aGlzLnRyIH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhc3luYyhmdW5jdGlvbiooKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RhdHVzID0geWllbGQgZW5naW5lLmludm9rZSgpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KF8uaXNQbGFpbk9iamVjdChzdGF0dXMpKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChzdGF0dXMuciBpbnN0YW5jZW9mIEVycm9yKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChzdGF0dXMuci5tZXNzYWdlID09PSBcImZvb1wiKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChzdGF0dXMudHIgPT09IDU1KTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChzdGF0dXMuZiA9PT0gXCJPS1wiKTtcclxuICAgICAgICAgICAgfSkoKS5ub2RlaWZ5KGRvbmUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcInNob3VsZCBjYXRjaCBUaHJvdyBlcnJvcnNcIiwgZnVuY3Rpb24gKGRvbmUpIHtcclxuICAgICAgICAgICAgbGV0IGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XHJcbiAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBmOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIE9LOiBcIk9LXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYXJnczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0cnlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRvXCI6IFwidHJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRocm93XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCJmb29cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcInJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDU1XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5OiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIj0gdGhpcy5PS1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiPSB7cjogdGhpcy5yLCBmOiB0aGlzLmYsIHRyOiB0aGlzLnRyIH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhc3luYyhmdW5jdGlvbiooKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RhdHVzID0geWllbGQgZW5naW5lLmludm9rZSgpO1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KF8uaXNQbGFpbk9iamVjdChzdGF0dXMpKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChzdGF0dXMuciBpbnN0YW5jZW9mIEVycm9yKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChzdGF0dXMuci5tZXNzYWdlID09PSBcImZvb1wiKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChzdGF0dXMudHIgPT09IDU1KTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChzdGF0dXMuZiA9PT0gXCJPS1wiKTtcclxuICAgICAgICAgICAgfSkoKS5ub2RlaWZ5KGRvbmUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcInNob3VsZCB0aHJvdyBlcnJvcnMgd2hlbiB0aGVyZSBpcyBmaW5hbGx5IG9ubHlcIiwgZnVuY3Rpb24gKGRvbmUpIHtcclxuICAgICAgICAgICAgbGV0IHggPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHtcclxuICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRyeVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0aHJvd1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IFwiZm9vXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxseTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ID0gXCJPS1wiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhc3luYyhmdW5jdGlvbiooKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIGVuZ2luZS5pbnZva2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUgaW5zdGFuY2VvZiBFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUubWVzc2FnZSA9PT0gXCJmb29cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KHggPT09IFwiT0tcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlKTtcclxuICAgICAgICAgICAgfSkoKS5ub2RlaWZ5KGRvbmUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcInNob3VsZCByZXRocm93IGN1cnJlbnQgZXJyb3JcIiwgZnVuY3Rpb24gKGRvbmUpIHtcclxuICAgICAgICAgICAgbGV0IGdlID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IGdmID0gbnVsbDtcclxuICAgICAgICAgICAgbGV0IGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XHJcbiAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0cnlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdGhyb3dcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBcImZvb1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlID0gdGhpcy5lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0aHJvd1wiOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdmID0gXCJPS1wiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhc3luYyhmdW5jdGlvbiooKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIGVuZ2luZS5pbnZva2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUgaW5zdGFuY2VvZiBFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUubWVzc2FnZSA9PT0gXCJmb29cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGdlID09PSBlKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZ2YgPT09IFwiT0tcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlKTtcclxuICAgICAgICAgICAgfSkoKS5ub2RlaWZ5KGRvbmUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcInNob3VsZCByZXRocm93IGEgbmV3IGVycm9yXCIsIGZ1bmN0aW9uIChkb25lKSB7XHJcbiAgICAgICAgICAgIGxldCBnZSA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBnZiA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoe1xyXG4gICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdHJ5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRocm93XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCJmb29cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZSA9IHRoaXMuZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdGhyb3dcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBcIj0gdGhpcy5lLm1lc3NhZ2UgKyAncHVwdSdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdmID0gXCJPS1wiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBhc3luYyhmdW5jdGlvbiooKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIGVuZ2luZS5pbnZva2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUgaW5zdGFuY2VvZiBFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUubWVzc2FnZSA9PT0gXCJmb29wdXB1XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChnZSBpbnN0YW5jZW9mIEVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZ2UubWVzc2FnZSA9PT0gXCJmb29cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGdmID09PSBcIk9LXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSk7XHJcbiAgICAgICAgICAgIH0pKCkubm9kZWlmeShkb25lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoXCJzaG91bGQgY2F0Y2ggYSByZXRocm93biBlcnJvciBpbiBhIGN1c3RvbSB2YXJuYW1lXCIsIGZ1bmN0aW9uIChkb25lKSB7XHJcbiAgICAgICAgICAgIGxldCBnZSA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBnZiA9IG51bGw7XHJcbiAgICAgICAgICAgIGxldCBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoe1xyXG4gICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdHJ5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXJOYW1lOiBcImVyclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdHJ5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRocm93XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBcImZvb1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2g6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlID0gdGhpcy5lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0aHJvd1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCI9IHRoaXMuZS5tZXNzYWdlICsgJ3B1cHUnXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2YgPSBcIk9LXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoOiBbXCI9IHRoaXMuZXJyXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgYXN5bmMoZnVuY3Rpb24qKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGUgPSB5aWVsZCBlbmdpbmUuaW52b2tlKCk7XHJcbiAgICAgICAgICAgICAgICBhc3NlcnQoZSBpbnN0YW5jZW9mIEVycm9yKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChlLm1lc3NhZ2UgPT09IFwiZm9vcHVwdVwiKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChnZSBpbnN0YW5jZW9mIEVycm9yKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChnZS5tZXNzYWdlID09PSBcImZvb1wiKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChnZiA9PT0gXCJPS1wiKTtcclxuICAgICAgICAgICAgfSkoKS5ub2RlaWZ5KGRvbmUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoXCJiZWhhdmlvclwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaXQoXCJzaG91bGQgY2FuY2VsIG90aGVyIGJyYW5jaGVzXCIsIGZ1bmN0aW9uIChkb25lKSB7XHJcbiAgICAgICAgICAgIGFzeW5jKGZ1bmN0aW9uKigpIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBsZXQgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHtcclxuICAgICAgICAgICAgICAgICAgICBcIkBwYXJhbGxlbFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBCbHVlYmlyZC5kZWxheSgyMDApLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImIrXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGRlbGF5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtczogMjAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGRlbGF5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtczogMTAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRocm93XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogXCJmb29cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGRlbGF5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtczogNTBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdGhyb3dcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBcImJvb1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIGVuZ2luZS5pbnZva2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZS5tZXNzYWdlID09PSBcImJvb1wiKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoIXgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSgpLm5vZGVpZnkoZG9uZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7Il19
