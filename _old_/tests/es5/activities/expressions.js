"use strict"

/* global describe,it */

;
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var activityMarkup = wf4node.activities.activityMarkup;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("assert");
var Bluebird = require("bluebird");
var Block = wf4node.activities.Block;
var _ = require("lodash");
var Expression = wf4node.activities.Expression;

describe("expressions", function () {
    describe("Expression", function () {
        it("should multiply two numbers", function (done) {
            var expr = new Expression();
            expr.expr = "this.v * this.v";
            var block = new Block();
            block.v = 2;
            block.args = [expr];

            var engine = new ActivityExecutionEngine(block);

            engine.invoke().then(function (result) {
                assert.equal(result, 4);
            }).nodeify(done);
        });

        it("should works from markup", function (done) {
            var block = activityMarkup.parse({
                "@block": {
                    v: 2,
                    args: ["= this.v * this.v"]
                }
            });

            var engine = new ActivityExecutionEngine(block);

            engine.invoke().then(function (result) {
                assert.equal(result, 4);
            }).nodeify(done);
        });

        it("should access parent", function (done) {
            var block = activityMarkup.parse({
                "@block": {
                    v: 2,
                    args: [{
                        "@func": {
                            args: ["= this.v", "= this.$parent.v  "],
                            code: function code(a, b) {
                                return a + b;
                            }
                        }
                    }]
                }
            });

            var engine = new ActivityExecutionEngine(block);

            engine.invoke().then(function (result) {
                assert.equal(result, 4);
            }).nodeify(done);
        });

        it("should evaluate lodash", function (done) {
            var block = activityMarkup.parse({
                "@block": {
                    id: "me",
                    v: 2.11,
                    args: [{
                        "@func": {
                            args: ["= this.v", "= this.$parent.v  ", "= _.round(this.me.v)"],
                            code: function code(a, b, c) {
                                return a + b + c;
                            }
                        }
                    }]
                }
            });

            var engine = new ActivityExecutionEngine(block);

            engine.invoke().then(function (result) {
                assert.equal(result, 2.11 + 2.11 + 2);
            }).nodeify(done);
        });
    });
});
//# sourceMappingURL=expressions.js.map
