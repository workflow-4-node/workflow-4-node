"use strict";

/* global describe,it */

let wf4node = require("../../../");
let Func = wf4node.activities.Func;
let ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
let assert = require("better-assert");
let Bluebird = require("bluebird");
let _ = require("lodash");
let async = wf4node.common.asyncHelpers.async;

describe("cancellation", function () {
    describe("Cancel", function () {
        it("when force is set then it should cancel other branches", function (done) {
            async(function*() {
                let x = false;
                let engine = new ActivityExecutionEngine({
                    "@parallel": {
                        args: [
                            function() {
                                return Bluebird.delay(200).then(function() {
                                    throw new Error("b+");
                                });
                            },
                            {
                                "@block": [
                                    {
                                        "@delay": {
                                            ms: 200
                                        }
                                    },
                                    function () {
                                        x = true;
                                    }
                                ]
                            },
                            {
                                "@block": [
                                    {
                                        "@delay": {
                                            ms: 100
                                        }
                                    },
                                    {
                                        "@throw": {
                                            error: "foo"
                                        }
                                    }
                                ]
                            },
                            {
                                "@block": [
                                    {
                                        "@delay": {
                                            ms: 50
                                        }
                                    },
                                    {
                                        "@cancel": {
                                            force: true
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                });

                try {
                    yield engine.invoke();
                    assert(false);
                }
                catch (e) {
                    assert(e instanceof wf4node.common.errors.Cancelled);
                    assert(!x);
                }
            })().nodeify(done);
        });

        it("when not force it should run other branches before terminating", function (done) {
            async(function*() {
                let x = 0;
                let y = 0;
                let engine = new ActivityExecutionEngine({
                    "@block": {
                        args: [
                            {
                                "@parallel": [
                                    function() {
                                        x++;
                                    },
                                    {
                                        "@cancel": {}
                                    }
                                ]
                            },
                            function() {
                                y++;
                            }
                        ]
                    }
                });

                try {
                    yield engine.invoke();
                    assert(false);
                }
                catch (e) {
                    assert(e instanceof wf4node.common.errors.Cancelled);
                    assert(x === 1);
                    assert(!y);
                }
            })().nodeify(done);
        });
    });

    describe("CancellationScope", function () {
        it("when force is set then it should cancel other branches, and it should handled in scope", function (done) {
            async(function*() {
                let x = false;
                let y = false;
                let engine = new ActivityExecutionEngine({
                    "@cancellationScope": {
                        args: {
                            "@parallel": {
                                args: [
                                    function() {
                                        return Bluebird.delay(200).then(function() {
                                            throw new Error("b+");
                                        });
                                    },
                                    {
                                        "@block": [
                                            {
                                                "@delay": {
                                                    ms: 200
                                                }
                                            },
                                            function () {
                                                x = true;
                                            }
                                        ]
                                    },
                                    {
                                        "@block": [
                                            {
                                                "@delay": {
                                                    ms: 100
                                                }
                                            },
                                            {
                                                "@throw": {
                                                    error: "foo"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "@block": [
                                            {
                                                "@delay": {
                                                    ms: 50
                                                }
                                            },
                                            {
                                                "@cancel": {
                                                    force: true
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        cancelled: [
                            function() {
                                y = true;
                            }
                        ]
                    }
                });

                yield engine.invoke();
                assert(!x);
                assert(y);
            })().nodeify(done);
        });

        it("when not force it should run other branches before terminating", function (done) {
            async(function*() {
                let x = 0;
                let y = 0;
                let z = false;
                let engine = new ActivityExecutionEngine({
                    "@cancellationScope": {
                        args: {
                            "@block": {
                                args: [
                                    {
                                        "@parallel": [
                                            function () {
                                                x++;
                                            },
                                            {
                                                "@cancel": {}
                                            }
                                        ]
                                    },
                                    function () {
                                        y++;
                                    }
                                ]
                            }
                        },
                        cancelled: function() {
                            z = true;
                        }
                    }
                });

                yield engine.invoke();
                assert(x === 1);
                assert(!y);
                assert(z);
            })().nodeify(done);
        });
    });
});