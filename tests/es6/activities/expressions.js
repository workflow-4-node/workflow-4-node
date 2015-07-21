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

describe("expressions", function() {
    describe("Expression", function () {
        it("should multiply two numbers", function (done) {
            let expr = new Expression();
            expr.expr = "this.get('v') * this.get('v')";
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
                            "# this.get('v') * this.get('v')"
                        ]
                    }
                });

            let engine = new ActivityExecutionEngine(block);

            engine.invoke().then(
                function (result) {
                    assert.equal(result, 4);
                }).nodeify(done);
        });
    });
});