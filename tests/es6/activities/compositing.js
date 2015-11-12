"use strict";
/* global describe,it */
let wf4node = require("../../../");
let Func = wf4node.activities.Func;
let ConsoleTracker = wf4node.activities.ConsoleTracker;
let ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
let assert = require("assert");
let Bluebird = require("bluebird");
let _ = require("lodash");
let async = wf4node.common.asyncHelpers.async;
let path = require("path");

describe("compositing", function () {
    it("should take arguments with same name as in outer scope", function (done) {
        let engine = new ActivityExecutionEngine({
            "@require": path.join(__dirname, "customActivities", "hello"),
            "@block": {
                to: "unbornchikken",
                args: {
                    "@hello": {
                        to: "= this.to"
                    }
                }
            }
        });

        async(function*() {
            let result = yield engine.invoke();
            assert.equal(result, "Hello unbornchikken!");
        })().nodeify(done);
    });
});