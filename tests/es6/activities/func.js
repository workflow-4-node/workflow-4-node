"use strict";

/* global describe,it */

let wf4node = require("../../../");
let Func = wf4node.activities.Func;
let activityMarkup = wf4node.activities.activityMarkup;
let ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
let assert = require("assert");
let Bluebird = require("bluebird");

describe("Func", function () {
    it("should run with a synchronous code", function (done) {
        let fop = new Func();
        fop.code = function (obj) {
            return obj.name;
        };

        let engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Gabor" }).then(
            function (result) {
                assert.equal(result, "Gabor");
            }).nodeify(done);
    });

    it("should run when created from markup", function (done) {
        let fop = activityMarkup.parse(
            {
                "@func": {
                    code: function (obj) {
                        return obj.name;
                    }
                }
            });

        let engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Gabor" }).then(
            function (result) {
                assert.equal(result, "Gabor");
            }).nodeify(done);
    });

    it("should run when code is asynchronous", function (done) {
        let fop = new Func();
        fop.code = function (obj) {
            return Bluebird.resolve(obj.name);
        };

        let engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Mezo" }).then(
            function (result) {
                assert.equal(result, "Mezo");
            }).nodeify(done);
    });

    it("should accept external parameters those are functions also", function (done) {
        let expected = { name: "Gabor" };
        let fop = new Func();
        fop.code = function (obj) {
            return obj.name;
        };
        let fopin = new Func();
        fopin.code = function () {
            return expected;
        };

        let engine = new ActivityExecutionEngine(fop);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke(fopin).then(
            function (result) {
                assert.equal(result, expected.name);
            }).nodeify(done);
    });

    it("should work as an agument", function (done) {
        let expected = { name: "Gabor" };

        let fop = activityMarkup.parse(
            {
                "@func": {
                    args: {
                        "@func": {
                            code: function () {
                                return expected;
                            }
                        }
                    },
                    code: function (obj) {
                        return obj.name;
                    }
                }
            });

        let engine = new ActivityExecutionEngine(fop);

        engine.invoke().then(
            function (result) {
                assert.equal(result, expected.name);
            }).nodeify(done);
    });
});
