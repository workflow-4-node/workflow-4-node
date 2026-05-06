"use strict";

/* global describe,it */

let wf4node = require("../../../");
let Func = wf4node.activities.Func;
let activityMarkup = wf4node.activities.activityMarkup;
let ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
let assert = require("assert");
let Bluebird = require("bluebird");
let Block = wf4node.activities.Block;
let _ = require("lodash");
let Expression = wf4node.activities.Expression;

describe("expressions", function () {
    describe("Expression", function () {
        it("should multiply two numbers", function (done) {
            let expr = new Expression();
            expr.expr = "this.v * this.v";
            let block = new Block();
            block.v = 2;
            block.args = [expr];

            let engine = new ActivityExecutionEngine(block);

            engine.invoke().then(
                function (result) {
                    assert.equal(result, 4);
                }).nodeify(done);
        });

        it("should works from markup", function (done) {
            let block = activityMarkup.parse(
                {
                    "@block": {
                        v: 2,
                        args: [
                            "= this.v * this.v"
                        ]
                    }
                });

            let engine = new ActivityExecutionEngine(block);

            engine.invoke().then(
                function (result) {
                    assert.equal(result, 4);
                }).nodeify(done);
        });

        it("should access parent", function (done) {
            let block = activityMarkup.parse(
                {
                    "@block": {
                        v: 2,
                        args: [
                            {
                                "@func": {
                                    args: [ "= this.v", "= this.$parent.v  " ],
                                    code: function(a, b) {
                                        return a + b;
                                    }
                                }
                            }
                        ]
                    }
                });

            let engine = new ActivityExecutionEngine(block);

            engine.invoke().then(
                function (result) {
                    assert.equal(result, 4);
                }).nodeify(done);
        });

        it("should evaluate lodash", function (done) {
            let block = activityMarkup.parse(
                {
                    "@block": {
                        id: "me",
                        v: 2.11,
                        args: [
                            {
                                "@func": {
                                    args: [ "= this.v", "= this.$parent.v  ", "= _.round(this.me.v)" ],
                                    code: function(a, b, c) {
                                        return a + b + c;
                                    }
                                }
                            }
                        ]
                    }
                });

            let engine = new ActivityExecutionEngine(block);

            engine.invoke().then(
                function (result) {
                    assert.equal(result, 2.11 + 2.11 + 2);
                }).nodeify(done);
        });
    });
});