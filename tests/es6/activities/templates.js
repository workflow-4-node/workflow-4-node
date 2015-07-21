"use strict";

/* global describe,it */

let wf4node = require("../../../");
let ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
let _ = require("lodash");
let assert = require("assert");

describe("templates", function () {
    it("should parse object correctly", function (done) {

        let engine = new ActivityExecutionEngine({
            "@template": {
                declare: {
                    a: "foo",
                    b: [
                        "zoo",
                        {
                            c: {
                                "@func": {
                                    code: function () {
                                        return 6;
                                    }
                                }
                            }
                        },
                        "# 42"
                    ]
                }
            }
        });

        engine.invoke().then(function (result) {

            assert.ok(_.isPlainObject(result));
            assert.equal(result.a, "foo");
            assert.ok(_.isArray(result.b));
            assert.equal(result.b.length, 3);
            assert.equal(result.b[0], "zoo");
            assert.ok(_.isPlainObject(result.b[1]));
            assert.equal(result.b[1].c, 6);
            assert.equal(result.b[2], 42);
        }).nodeify(done);
    });

    it("should work when specialized", function (done) {

        let engine = new ActivityExecutionEngine({
            "@block": [
                {
                    a: "foo",
                    b: [
                        "zoo",
                        {
                            c: {
                                "@func": {
                                    code: function () {
                                        return 6;
                                    }
                                }
                            }
                        },
                        "# 42"
                    ]
                }
            ]
        });

        engine.invoke().then(function (result) {
            assert.ok(_.isPlainObject(result));
            assert.equal(result.a, "foo");
            assert.ok(_.isArray(result.b));
            assert.equal(result.b.length, 3);
            assert.equal(result.b[0], "zoo");
            assert.ok(_.isPlainObject(result.b[1]));
            assert.equal(result.b[1].c, 6);
            assert.equal(result.b[2], 42);
        }).nodeify(done);
    });

    it("should work on arrays", function (done) {
        let engine = new ActivityExecutionEngine({
            "@block": {
                rule: {
                    value: 22
                },
                args: [
                    {
                        "@block": {
                            a: [
                                {
                                    $project: {
                                        $literal: "# this.get('rule').value"
                                    }
                                }
                            ],
                            args: [
                                "= a"
                            ]
                        }
                    }
                ]
            }
        });

        engine.invoke().then(function (result) {
            assert.ok(_.isArray(result));
            assert.ok(_.isPlainObject(result[0].$project));
            assert.equal(result[0].$project.$literal, 22);
        }).nodeify(done);
    });
});