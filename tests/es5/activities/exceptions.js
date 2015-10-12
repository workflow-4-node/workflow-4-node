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

//# sourceMappingURL=exceptions.js.map
