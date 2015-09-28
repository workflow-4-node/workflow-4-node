"use strict";

/* global describe,it */

let wf4node = require("../../../");
let Func = wf4node.activities.Func;
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
});