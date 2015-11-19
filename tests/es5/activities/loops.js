"use strict";
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var activityMarkup = wf4node.activities.activityMarkup;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("assert");
var Bluebird = require("bluebird");
var Block = wf4node.activities.Block;
var _ = require("lodash");
var errors = wf4node.common.errors;
describe("Loops", function() {
  describe("While", function() {
    it("should run a basic cycle", function(done) {
      var block = activityMarkup.parse({"@block": {
          i: 10,
          j: 0,
          z: 0,
          args: [{"@while": {
              condition: "= this.j < this.i",
              args: "= this.j++",
              "@to": "z"
            }}, "= { j: this.j, z: this.z }"]
        }});
      var engine = new ActivityExecutionEngine(block);
      engine.invoke().then(function(result) {
        assert.ok(_.isObject(result));
        assert.equal(result.j, 10);
        assert.equal(result.z, 9);
      }).nodeify(done);
    });
  });
  describe("For", function() {
    it("should work between range 0 and 10 by step 1", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {
          seq: "",
          args: [{"@for": {
              from: 0,
              to: {"@func": {code: function() {
                    return Bluebird.delay(100).then(function() {
                      return 10;
                    });
                  }}},
              args: "= this.seq = this.seq + this.i"
            }}, "= this.seq"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isString(result));
        assert.equal(result, "0123456789");
      }).nodeify(done);
    });
    it("should work between range 10 downto 4 by step -2", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {
          seq: "",
          r: null,
          args: [{"@for": {
              from: 10,
              to: {"@func": {code: function() {
                    return Bluebird.delay(100).then(function() {
                      return 4;
                    });
                  }}},
              step: -2,
              varName: "klow",
              args: "= this.seq += this.klow",
              "@to": "r"
            }}, "= { v: this.seq, r: this.r }"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isObject(result));
        assert.equal(result.v, "1086");
        assert.equal(result.r, "1086");
      }).nodeify(done);
    });
  });
  describe("ForEach", function() {
    it("should work non parallel", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {
          seq: {"@func": {code: function() {
                return [1, 2, 3, 4, 5, 6];
              }}},
          result: "",
          args: [{"@forEach": {
              items: "= this.seq",
              args: "= this.result += this.item"
            }}, "= this.result"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isString(result));
        assert.equal(result, "123456");
      }).nodeify(done);
    });
    it("should work parallel non scheduled", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {
          seq: {"@func": {code: function() {
                return [1, 2, 3, 4, 5, 6];
              }}},
          result: "",
          args: [{"@forEach": {
              parallel: true,
              varName: "klow",
              items: "= this.seq",
              args: "= this.result += this.klow"
            }}, "= this.result"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isString(result));
        assert.equal(result, "123456");
      }).nodeify(done);
    });
    it("should work parallel scheduled", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {
          seq: "function () { return [1, 2, 3, 4, 5, 6]; }",
          result: [],
          args: [{"@forEach": {
              parallel: true,
              varName: "klow",
              items: "= this.seq",
              args: function() {
                var self = this;
                return Bluebird.delay(Math.random() * 100).then(function() {
                  self.result.push(self.klow);
                });
              }
            }}, "= this.result"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isArray(result));
        assert.equal(result.length, 6);
        assert.equal(_(result).sum(), 6 + 5 + 4 + 3 + 2 + 1);
      }).nodeify(done);
    });
    it("should work with generators non-parallel", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {
          result: [],
          stuff: {val: -1},
          args: [{"@forEach": {
              items: {"@func": {
                  args: "= this.stuff",
                  code: $traceurRuntime.initGeneratorFunction(function $__4(stuff) {
                    return $traceurRuntime.createGeneratorInstance(function($ctx) {
                      while (true)
                        switch ($ctx.state) {
                          case 0:
                            $ctx.state = 2;
                            return -1 * stuff.val;
                          case 2:
                            $ctx.maybeThrow();
                            $ctx.state = 4;
                            break;
                          case 4:
                            $ctx.state = 6;
                            return 2;
                          case 6:
                            $ctx.maybeThrow();
                            $ctx.state = 8;
                            break;
                          case 8:
                            $ctx.state = 10;
                            return 3;
                          case 10:
                            $ctx.maybeThrow();
                            $ctx.state = 12;
                            break;
                          case 12:
                            $ctx.state = 14;
                            return stuff.val;
                          case 14:
                            $ctx.maybeThrow();
                            $ctx.state = -2;
                            break;
                          default:
                            return $ctx.end();
                        }
                    }, $__4, this);
                  })
                }},
              args: function() {
                if (this.stuff.val === -1) {
                  this.stuff.val = 4;
                }
                this.result.push(this.item);
              }
            }}, "= this.result"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isArray(result));
        assert.equal(result.length, 4);
        assert.equal(result[0], 1);
        assert.equal(result[1], 2);
        assert.equal(result[2], 3);
        assert.equal(result[3], 4);
      }).nodeify(done);
    });
    it("should throw with generators", function(done) {
      var engine = new ActivityExecutionEngine({"@block": {
          result: [],
          stuff: {val: -1},
          args: [{"@forEach": {
              parallel: true,
              items: {"@func": {
                  args: "= this.stuff",
                  code: $traceurRuntime.initGeneratorFunction(function $__4(stuff) {
                    return $traceurRuntime.createGeneratorInstance(function($ctx) {
                      while (true)
                        switch ($ctx.state) {
                          case 0:
                            $ctx.state = 2;
                            return -1 * stuff.val;
                          case 2:
                            $ctx.maybeThrow();
                            $ctx.state = 4;
                            break;
                          case 4:
                            $ctx.state = 6;
                            return 2;
                          case 6:
                            $ctx.maybeThrow();
                            $ctx.state = 8;
                            break;
                          case 8:
                            $ctx.state = 10;
                            return 3;
                          case 10:
                            $ctx.maybeThrow();
                            $ctx.state = 12;
                            break;
                          case 12:
                            $ctx.state = 14;
                            return stuff.val;
                          case 14:
                            $ctx.maybeThrow();
                            $ctx.state = -2;
                            break;
                          default:
                            return $ctx.end();
                        }
                    }, $__4, this);
                  })
                }},
              args: function() {
                if (this.stuff.val === -1) {
                  this.stuff.val = 4;
                }
                this.result.push(this.item);
              }
            }}, "= this.result"]
        }});
      engine.invoke().then(function() {
        assert(false);
      }, function(e) {
        assert(e instanceof errors.ActivityRuntimeError);
        assert(/not supported/.test(e.message));
      }).nodeify(done);
    });
  });
});

//# sourceMappingURL=loops.js.map
