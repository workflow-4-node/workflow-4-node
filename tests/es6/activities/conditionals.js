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

describe("conditionals", function () {
    describe("If", function () {
        it("should call then", function (done) {
            let block = activityMarkup.parse({
                "@block": {
                    v: 5,
                    args: [
                        {
                            "@if": {
                                condition: "= this.v == 5",
                                then: {
                                    "@func": {
                                        args: [1],
                                        code: function (a) {
                                            return a + this.v;
                                        }
                                    }
                                },
                                else: {
                                    "@func": {
                                        args: [2],
                                        code: function (a) {
                                            return a + this.v;
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            });

            let engine = new ActivityExecutionEngine(block);
            engine.invoke().then(
                function (result) {
                    assert.equal(result, 1 + 5);
                }).nodeify(done);
        });

        it("should call else", function (done) {
            let block = activityMarkup.parse({
                "@block": {
                    v: 5,
                    r: 0,
                    args: [
                        {
                            "@if": {
                                condition: {
                                    "@func": {
                                        code: function () {
                                            return false;
                                        }
                                    }
                                },
                                then: {
                                    "@func": {
                                        args: [1],
                                        code: function (a) {
                                            this.r = a + this.v;
                                        }
                                    }
                                },
                                else: {
                                    "@func": {
                                        args: [2],
                                        code: function (a) {
                                            this.r = a + this.v;
                                        }
                                    }
                                }
                            }
                        },
                        "= this.r"
                    ]
                }
            });

            let engine = new ActivityExecutionEngine(block);
            engine.invoke().then(
                function (result) {
                    assert.equal(result, 2 + 5);
                }).nodeify(done);
        });

        it("should run blocks", function (done) {
            let block = activityMarkup.parse({
                "@block": {
                    v: 5,
                    s: 1,
                    args: [
                        {
                            "@if": {
                                condition: {
                                    "@func": {
                                        code: function () {
                                            return false;
                                        }
                                    }
                                },
                                then: {
                                    "@func": {
                                        args: [1],
                                        code: function (a) {
                                            this.s = a + this.v;
                                        }
                                    }
                                },
                                else: {
                                    "@block": [
                                        {
                                            "@func": {
                                                args: [2],
                                                code: function (a) {
                                                    let self = this;
                                                    return Bluebird.delay(100).then(function () { self.s = 40 + a; });
                                                }
                                            }
                                        },
                                        function () {
                                            return this.s;
                                        }
                                    ]
                                }
                            }
                        },
                        "= this.s"
                    ]
                }
            });

            let engine = new ActivityExecutionEngine(block);
            engine.invoke().then(
                function (result) {
                    assert.equal(result, 42);
                }).nodeify(done);
        });

        it("then should be a block", function (done) {
            let block = activityMarkup.parse({
                "@block": {
                    v: 5,
                    args: [
                        {
                            "@if": {
                                condition: "= this.v == 5",
                                then: [
                                    5,
                                    function () {
                                        let self = this;
                                        return Bluebird.delay(100)
                                            .then(function () {
                                                self.v = 7;
                                            });
                                    },
                                    "= this.v "
                                ]
                            }
                        }
                    ]
                }
            });

            let engine = new ActivityExecutionEngine(block);
            engine.invoke().then(
                function (result) {
                    assert.equal(7, result);
                }).nodeify(done);
        });

        it("else should be a block", function (done) {
            let block = activityMarkup.parse({
                "@block": {
                    v: 1,
                    args: [
                        {
                            "@if": {
                                condition: "= this.v == 5",
                                then: [1, 2],
                                else: [
                                    5, function () { this.v = 7; }, "= this.v"
                                ]
                            }
                        }
                    ]
                }
            });

            let engine = new ActivityExecutionEngine(block);
            engine.invoke().then(
                function (result) {
                    assert.equal(7, result);
                }).nodeify(done);
        });
    });

    describe("Switch", function () {
        describe("switch w/ case", function () {
            it("should work w/o default", function (done) {
                let engine = new ActivityExecutionEngine({
                    "@switch": {
                        expression: "= 42",
                        args: [
                            {
                                "@case": {
                                    value: 43,
                                    args: function () {
                                        return "55";
                                    }
                                }
                            },
                            {
                                "@case": {
                                    value: 42,
                                    args: function () {
                                        return "hi";
                                    }
                                }
                            },
                            {
                                "@case": {
                                    value: "42",
                                    args: "= 'boo'"
                                }
                            }
                        ]
                    }
                });

                engine.invoke().then(
                    function (result) {
                        assert.deepEqual(result, "hi");
                    }).nodeify(done);
            });

            it("should work w default", function (done) {
                let engine = new ActivityExecutionEngine({
                    "@switch": {
                        expression: "= 43",
                        args: [
                            {
                                "@case": {
                                    value: 43,
                                    args: function () {
                                        return 55;
                                    }
                                }
                            },
                            {
                                "@case": {
                                    value: 42,
                                    args: function () {
                                        return "hi";
                                    }
                                }
                            },
                            {
                                "@default": "= 'boo'"
                            }
                        ]
                    }
                });

                engine.invoke().then(
                    function (result) {
                        assert.deepEqual(result, 55);
                    }).nodeify(done);
            });

            it("should do its default", function (done) {
                let engine = new ActivityExecutionEngine({
                    "@switch": {
                        expression: "= 'klow'",
                        args: [
                            {
                                "@case": {
                                    value: 43,
                                    args: function () {
                                        return 55;
                                    }
                                }
                            },
                            {
                                "@case": {
                                    value: 42,
                                    args: function () {
                                        return "hi";
                                    }
                                }
                            },
                            {
                                "@default": "= 'boo'"
                            }
                        ]
                    }
                });

                engine.invoke().then(
                    function (result) {
                        assert.deepEqual(result, "boo");
                    }).nodeify(done);
            });
        });

        describe("switch w/ when", function () {
            it("should work w/o default", function (done) {
                let engine = new ActivityExecutionEngine({
                    "@switch": {
                        args: [
                            {
                                "@when": {
                                    condition: 0,
                                    args: function () {
                                        return "55";
                                    }
                                }
                            },
                            {
                                "@when": {
                                    condition: function () {
                                        return Bluebird.resolve(42);
                                    },
                                    args: function () {
                                        return "hi";
                                    }
                                }
                            },
                            {
                                "@when": {
                                    condition: "42",
                                    args: "= 'boo'"
                                }
                            }
                        ]
                    }
                });

                engine.invoke().then(
                    function (result) {
                        assert.deepEqual(result, "hi");
                    }).nodeify(done);
            });

            it("should work w default", function (done) {
                let engine = new ActivityExecutionEngine({
                    "@switch": {
                        args: [
                            {
                                "@when": {
                                    condition: 43,
                                    args: function () {
                                        return 55;
                                    }
                                }
                            },
                            {
                                "@when": {
                                    condition: undefined,
                                    args: function () {
                                        return "hi";
                                    }
                                }
                            },
                            {
                                "@default": "= 'boo'"
                            }
                        ]
                    }
                });

                //engine.addTracker(new ConsoleTracker());

                engine.invoke().then(
                    function (result) {
                        assert.deepEqual(result, 55);
                    }).nodeify(done);
            });

            it("should do its default", function (done) {
                let engine = new ActivityExecutionEngine({
                    "@switch": {
                        args: [
                            {
                                "@when": {
                                    condition: "",
                                    args: function () {
                                        return 55;
                                    }
                                }
                            },
                            {
                                "@when": {
                                    condition: null,
                                    args: function () {
                                        return "hi";
                                    }
                                }
                            },
                            {
                                "@default": "= 'boo'"
                            }
                        ]
                    }
                });

                engine.invoke().then(
                    function (result) {
                        assert.deepEqual(result, "boo");
                    }).nodeify(done);
            });
        });
    });
});