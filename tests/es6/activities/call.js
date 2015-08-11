"use strict";

/* global describe,it */

let wf4node = require("../../../");
let activityMarkup = wf4node.activities.activityMarkup;
let ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
let assert = require("assert");
let Bluebird = require("bluebird");
let _ = require("lodash");

describe("Call", function () {
    it("should run when created from markup", function (done) {
        let markup = activityMarkup.parse(
            {
                "@block": {
                    "code": {
                        _: function (obj) {
                            return obj.name;
                        }
                    },
                    args: {
                        "@call": {
                            methodName: "code",
                            args: { name: "Gabor" }
                        }
                    }
                }
            });

        let engine = new ActivityExecutionEngine(markup);

        engine.invoke().then(
            function (result) {
                assert.equal(result, "Gabor");
            }).nodeify(done);
    });

    it("should run when code is asynchronous", function (done) {
        let markup = activityMarkup.parse(
            {
                "@block": {
                    "code": {
                        _: function (obj) {
                            return Bluebird.delay(10).then(function () { return obj.name; });
                        }
                    },
                    args: {
                        "@call": {
                            methodName: "code",
                            args: { name: "Gabor" }
                        }
                    }
                }
            });

        let engine = new ActivityExecutionEngine(markup);

        engine.invoke().then(
            function (result) {
                assert.equal(result, "Gabor");
            }).nodeify(done);
    });

    it("should include lodash as last argument", function (done) {
        let markup = activityMarkup.parse(
            {
                "@block": {
                    "code": {
                        _: function (obj, __) {
                            return Bluebird.delay(10).then(function () { return __.camelCase(obj.name); });
                        }
                    },
                    args: {
                        "@call": {
                            methodName: "code",
                            args: { name: "GaborMezo" }
                        }
                    }
                }
            });

        let engine = new ActivityExecutionEngine(markup);

        engine.invoke().then(
            function (result) {
                assert.equal(result, _.camelCase("GaborMezo"));
            }).nodeify(done);
    });
});