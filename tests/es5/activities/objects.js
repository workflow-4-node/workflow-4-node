"use strict";
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var activityMarkup = wf4node.activities.activityMarkup;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("assert");
var Bluebird = require("bluebird");
var Block = wf4node.activities.Block;
var _ = require("lodash");
describe("objects", function() {
  describe("Merge", function() {
    it("should merge arrays", function(done) {
      var engine = new ActivityExecutionEngine({"@merge": [[1, 2, 3], "= [4, 5, 6]"]});
      engine.invoke().then(function(result) {
        assert(_.isArray(result));
        assert.equal(result.length, 6);
        assert.equal(_(result).sum(), 6 + 5 + 4 + 3 + 2 + 1);
      }).nodeify(done);
    });
    it("should merge objects", function(done) {
      var engine = new ActivityExecutionEngine({"@merge": [{a: "function () { return 2; }"}, "= {b: 2}", {c: "function() { return 42; }"}]});
      engine.invoke().then(function(result) {
        assert(_.isObject(result));
        assert.equal(_.keys(result).length, 3);
        assert.equal(result.a, 2);
        assert.equal(result.b, 2);
        assert.equal(result.c, 42);
      }).nodeify(done);
    });
  });
});

//# sourceMappingURL=objects.js.map
