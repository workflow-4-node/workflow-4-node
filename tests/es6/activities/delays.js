"use strict";

/* global describe,it */

let wf4node = require("../../../");
let Func = wf4node.activities.Func;
let ConsoleTracker = wf4node.activities.ConsoleTracker;
let ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
let assert = require("better-assert");
let Bluebird = require("bluebird");
let _ = require("lodash");
let async = wf4node.common.asyncHelpers.async;
require("date-utils");

describe("delays", function () {
    describe("DelayTo", function () {
        it("should wait for 200ms", function (done) {
            let engine = new ActivityExecutionEngine({
                "@delay": {
                    ms: 200
                }
            });

            async(function*() {
                let now = new Date();
                yield engine.invoke();
                let d = new Date() - now;
                assert(d > 200 && d < 400);
            })().nodeify(done);
        });
    });

    describe("Repeat", function () {
        it("should repeat its args", function (done) {
            let i = 0;
            let engine = new ActivityExecutionEngine({
                "@repeat": {
                    intervalType: "secondly",
                    intervalValue: 0.2,
                    args: [
                        function () {
                            if (++i < 4) {
                                return i;
                            }
                            throw new Error("OK");
                        }
                    ]
                }
            });

            async(function*() {
                let now = new Date();
                try {
                    yield engine.invoke();
                    assert(false);
                }
                catch (e) {
                    if (e.message === "OK") {
                        let d = new Date() - now;
                        console.log(d);
                        assert(d > 400 && d < 1000);
                        assert(i === 4);
                    }
                    else {
                        throw e;
                    }
                }
            })().nodeify(done);
        });
    });
});