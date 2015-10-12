"use strict";
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("better-assert");
var Bluebird = require("bluebird");
var _ = require("lodash");
var async = wf4node.common.asyncHelpers.async;
describe("cancellation", function() {
  describe("Cancel", function() {
    it("when force is set then it should cancel other branches", function(done) {
      async($traceurRuntime.initGeneratorFunction(function $__5() {
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
                      }]}, {"@block": [{"@delay": {ms: 100}}, {"@throw": {error: "foo"}}]}, {"@block": [{"@delay": {ms: 50}}, {"@cancel": {force: true}}]}]}});
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
                assert(e instanceof wf4node.common.errors.Cancelled);
                assert(!x);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__5, this);
      }))().nodeify(done);
    });
    it("when not force it should run other branches before terminating", function(done) {
      async($traceurRuntime.initGeneratorFunction(function $__5() {
        var x,
            y,
            engine,
            e;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                x = 0;
                y = 0;
                engine = new ActivityExecutionEngine({"@block": {args: [{"@parallel": [function() {
                        x++;
                      }, {"@cancel": {}}]}, function() {
                      y++;
                    }]}});
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
                assert(e instanceof wf4node.common.errors.Cancelled);
                assert(x === 1);
                assert(!y);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__5, this);
      }))().nodeify(done);
    });
  });
  describe("CancellationScope", function() {
    it("when force is set then it should cancel other branches, and it should handled in scope", function(done) {
      async($traceurRuntime.initGeneratorFunction(function $__5() {
        var x,
            y,
            engine;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                x = false;
                y = false;
                engine = new ActivityExecutionEngine({"@cancellationScope": {
                    args: {"@parallel": {args: [function() {
                          return Bluebird.delay(200).then(function() {
                            throw new Error("b+");
                          });
                        }, {"@block": [{"@delay": {ms: 200}}, function() {
                            x = true;
                          }]}, {"@block": [{"@delay": {ms: 100}}, {"@throw": {error: "foo"}}]}, {"@block": [{"@delay": {ms: 50}}, {"@cancel": {force: true}}]}]}},
                    cancelled: [function() {
                      y = true;
                    }]
                  }});
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
                assert(!x);
                assert(y);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__5, this);
      }))().nodeify(done);
    });
    it("when not force it should run other branches before terminating", function(done) {
      async($traceurRuntime.initGeneratorFunction(function $__5() {
        var x,
            y,
            z,
            engine;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                x = 0;
                y = 0;
                z = false;
                engine = new ActivityExecutionEngine({"@cancellationScope": {
                    args: {"@block": {args: [{"@parallel": [function() {
                            x++;
                          }, {"@cancel": {}}]}, function() {
                          y++;
                        }]}},
                    cancelled: function() {
                      z = true;
                    }
                  }});
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
                assert(x === 1);
                assert(!y);
                assert(z);
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__5, this);
      }))().nodeify(done);
    });
  });
});

//# sourceMappingURL=cancellation.js.map
