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

describe("Loops", function () {
    describe("While", function () {
        it("should run a basic cycle", function (done) {
            let block = activityMarkup.parse(
                {
                    "@block": {
                        i: 10,
                        j: 0,
                        z: 0,
                        args: [
                            {
                                "@while": {
                                    condition: "# this.get('j') < this.get('i')",
                                    args: "# this.postfixInc('j')",
                                    "@to": "z"
                                }
                            },
                            "# { j: this.get('j'), z: this.get('z') }"
                        ]
                    }
                });

            let engine = new ActivityExecutionEngine(block);
            //engine.addTracker(new ConsoleTracker());

            engine.invoke().then(
                function (result) {
                    assert.ok(_.isObject(result));
                    assert.equal(result.j, 10);
                    assert.equal(result.z, 9);
                }).nodeify(done);
        });
    });

    describe('For', function () {
        it('should work between range 0 and 10 by step 1', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    seq: "",
                    args: [
                        {
                            "@for": {
                                from: 0,
                                to: {
                                    "@func": {
                                        code: function () {
                                            return Bluebird.delay(100).then(function () { return 10; });
                                        }
                                    }
                                },
                                args: "# this.set('seq', this.get('seq') + this.get('i'))"
                            }
                        },
                        "# this.get('seq')"
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert(_.isString(result));
                    assert.equal(result, "0123456789");
                }).nodeify(done);
        });

        it('should work between range 10 downto 4 by step -2', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    seq: "",
                    r: null,
                    args: [
                        {
                            "@for": {
                                from: 10,
                                to: {
                                    "@func": {
                                        code: function () {
                                            return Bluebird.delay(100).then(function () { return 4; });
                                        }
                                    }
                                },
                                step: -2,
                                varName: "klow",
                                args: "# this.set('seq', this.get('seq') + this.get('klow'))",
                                "@to": "r"
                            }
                        },
                        "# { v: this.get('seq'), r: this.get('r') }"
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert(_.isObject(result));
                    assert.equal(result.v, "1086");
                    assert.equal(result.r, "1086");
                }).nodeify(done);
        });
    });

    describe('ForEach', function () {
        it('should work non parallel', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    seq: {
                        "@func": {
                            code: function () {
                                return [1, 2, 3, 4, 5, 6];
                            }
                        }
                    },
                    result: "",
                    args: [
                        {
                            "@forEach": {
                                items: "# this.get('seq')",
                                args: "# this.set('result', this.get('result') + this.get('item'))"
                            }
                        },
                        "# this.get('result')"
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert(_.isString(result));
                    assert.equal(result, "123456");
                }).nodeify(done);
        });

        it('should work parallel non scheduled', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    seq: {
                        "@func": {
                            code: function () {
                                return [1, 2, 3, 4, 5, 6];
                            }
                        }
                    },
                    result: "",
                    args: [
                        {
                            "@forEach": {
                                parallel: true,
                                varName: "klow",
                                items: "# this.get('seq')",
                                args: "# this.set('result', this.get('result') + this.get('klow'))"
                            }
                        },
                        "# this.get('result')"
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert(_.isString(result));
                    assert.equal(result, "123456");
                }).nodeify(done);
        });

        it('should work parallel scheduled', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    seq: "function () { return [1, 2, 3, 4, 5, 6]; }",
                    result: [],
                    args: [
                        {
                            "@forEach": {
                                parallel: true,
                                varName: "klow",
                                items: "# this.get('seq')",
                                args: function () {
                                    let self = this;
                                    return Bluebird.delay(Math.random() * 100)
                                        .then(function () {
                                            self.get("result").push(self.get("klow"));
                                        });
                                }
                            }
                        },
                        "# this.get('result')"
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert(_.isArray(result));
                    assert.equal(result.length, 6);
                    assert.equal(_(result).sum(), 6 + 5 + 4 + 3 + 2 + 1);
                }).nodeify(done);
        });
    });
});