"use strict";
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var activityMarkup = wf4node.activities.activityMarkup;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("assert");
var Bluebird = require("bluebird");
var Block = wf4node.activities.Block;
var _ = require("lodash");
describe("declarators", function() {
  describe("Block", function() {
    it("should handle variables well", function(done) {
      var block = new Block();
      block.let1 = 1;
      block.let2 = 2;
      block.let3 = 3;
      var f1 = new Func();
      f1.code = function() {
        return (this.let3 = (this.let3 + this.let1 * 2));
      };
      var f2 = new Func();
      f2.code = function() {
        return (this.let3 = (this.let3 + this.let2 * 3));
      };
      var f3 = new Func();
      f3.code = function() {
        return this.let3 * 4;
      };
      block.args = [f1, f2, f3];
      var engine = new ActivityExecutionEngine(block);
      engine.invoke().then(function(result) {
        var x1 = 1;
        var x2 = 2;
        var x3 = 3;
        x3 += x1 * 2;
        x3 += x2 * 3;
        var r = x3 * 4;
        assert.equal(result, r);
      }).nodeify(done);
    });
    it("can be generated from markup", function(done) {
      var block = activityMarkup.parse({"@block": {
          let1: 1,
          let2: {"@func": {code: function() {
                return 2;
              }}},
          let3: 3,
          args: [{"@func": {code: function bubu() {
                return this.let3 += this.let1 * 2;
              }}}, {"@func": {code: function kittyfuck() {
                return this.let3 += this.let2 * 3;
              }}}, {"@func": {code: function() {
                return this.let3 * 4;
              }}}]
        }});
      var engine = new ActivityExecutionEngine(block);
      engine.invoke().then(function(result) {
        var x1 = 1;
        var x2 = 2;
        var x3 = 3;
        x3 += x1 * 2;
        x3 += x2 * 3;
        var r = x3 * 4;
        assert.equal(result, r);
      }).nodeify(done);
    });
    it("can be generated from markup string", function(done) {
      var markup = {"@block": {
          let1: 1,
          let2: 2,
          let3: 3,
          args: [{"@func": {code: function bubu() {
                return (this.let3 = this.let3 + this.let1 * 2);
              }}}, {"@func": {code: function kittyfuck() {
                return (this.let3 = this.let3 + this.let2 * 3);
              }}}, {"@func": {code: function() {
                return this.let3 * 4;
              }}}]
        }};
      var markupString = activityMarkup.stringify(markup);
      assert.ok(_.isString(markupString));
      var block = activityMarkup.parse(markupString);
      var engine = new ActivityExecutionEngine(block);
      engine.invoke().then(function(result) {
        var x1 = 1;
        var x2 = 2;
        var x3 = 3;
        x3 += x1 * 2;
        x3 += x2 * 3;
        var r = x3 * 4;
        assert.equal(result, r);
      }).nodeify(done);
    });
  });
  describe("Parallel", function() {
    it("should work as expected with sync activities", function(done) {
      var activity = activityMarkup.parse({"@parallel": {
          let1: "",
          args: [{"@func": {code: function() {
                return this.let1 += "a";
              }}}, {"@func": {code: 'function() { return this.let1 += "b"; }'}}]
        }});
      var engine = new ActivityExecutionEngine(activity);
      engine.invoke().then(function(result) {
        assert.equal(result.length, 2);
        assert.equal(result[0], "a");
        assert.equal(result[1], "ab");
      }).nodeify(done);
    });
    it("should work as expected with async activities", function(done) {
      var activity = activityMarkup.parse({"@parallel": {
          let1: "",
          args: [{"@func": {code: function() {
                return this.let1 += "a";
              }}}, {"@func": {code: 'function() { return this.let1 += "b"; }'}}, {"@func": {code: function() {
                return Bluebird.delay(100).then(function() {
                  return 42;
                });
              }}}, {"@func": {code: function() {
                return new Bluebird(function(resolve, reject) {
                  setImmediate(function() {
                    resolve(0);
                  });
                });
              }}}]
        }});
      var engine = new ActivityExecutionEngine(activity);
      engine.invoke().then(function(result) {
        assert.equal(result.length, 4);
        assert.equal(result[0], "a");
        assert.equal(result[1], "ab");
        assert.equal(result[2], 42);
        assert.equal(result[3], 0);
      }).nodeify(done);
    });
  });
  describe("Pick", function() {
    it("should work as expected with sync activities", function(done) {
      var activity = activityMarkup.parse({"@pick": {
          let1: "",
          args: [{"@func": {code: function() {
                return this.let1 += "a";
              }}}, {"@func": {code: 'function() { return this.let1 += "b"; }'}}]
        }});
      var engine = new ActivityExecutionEngine(activity);
      engine.invoke().then(function(result) {
        assert.equal(result, "a");
      }).nodeify(done);
    });
    it("should work as expected with async activities", function(done) {
      var activity = activityMarkup.parse({"@pick": [{"@func": {code: function() {
              return Bluebird.delay(100).then(function() {
                return 42;
              });
            }}}, {"@func": {code: function() {
              return new Bluebird(function(resolve, reject) {
                setImmediate(function() {
                  resolve(0);
                });
              });
            }}}]});
      var engine = new ActivityExecutionEngine(activity);
      engine.invoke().then(function(result) {
        assert.equal(result, 0);
      }).nodeify(done);
    });
  });
});

//# sourceMappingURL=declarators.js.map
