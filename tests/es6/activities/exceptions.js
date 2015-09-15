"use strict";

/* global describe,it */

let wf4node = require("../../../");
let Func = wf4node.activities.Func;
let ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
let assert = require("better-assert");
let Bluebird = require("bluebird");
let _ = require("lodash");
let async = wf4node.common.asyncHelpers.async;

describe("exceptions", function () {
    describe("Throw", function () {
        it("should throw errors", function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    args: [
                        {
                            "@throw": {
                                error: function () {
                                    return new TypeError("foo");
                                }
                            }
                        }
                    ]
                }
            });

            async(function*() {
                try {
                    yield engine.invoke();
                }
                catch (e) {
                    assert(e instanceof TypeError);
                    assert(e.message === "foo");
                    return;
                }
                assert(false);
            })().nodeify(done);
        });

        it("should throw strings as errors", function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    args: [
                        {
                            "@throw": {
                                error: "foo"
                            }
                        }
                    ]
                }
            });

            async(function*() {
                try {
                    yield engine.invoke();
                }
                catch (e) {
                    assert(e instanceof Error);
                    assert(e.message === "foo");
                    return;
                }
                assert(false);
            })().nodeify(done);
        });
    });

    describe("Try", function () {
        it("should catch code errors", function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    r: null,
                    f: null,
                    tr: null,
                    args: [
                        {
                            "@try": {
                                "@to": "tr",
                                args: [
                                    function () {
                                        throw new Error("foo");
                                    }
                                ],
                                catch: [
                                    {
                                        "@assign": {
                                            to: "r",
                                            value: "= this.e"
                                        }
                                    },
                                    55
                                ],
                                finally: {
                                    "@assign": {
                                        to: "f",
                                        value: "OK"
                                    }
                                }
                            }
                        },
                        "= {r: this.r, f: this.f, tr: this.tr }"
                    ]
                }
            });

            async(function*() {
                let status = yield engine.invoke();
                assert(_.isPlainObject(status));
                assert(status.r instanceof Error);
                assert(status.r.message === "foo");
                assert(status.tr === 55);
                assert(status.f === "OK");
            })().nodeify(done);
        });

        it("should catch Throw errors", function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    r: null,
                    f: null,
                    tr: null,
                    OK: "OK",
                    args: [
                        {
                            "@try": {
                                "@to": "tr",
                                args: [
                                    {
                                        "@throw": {
                                            error: "foo"
                                        }
                                    }
                                ],
                                catch: [
                                    {
                                        "@assign": {
                                            to: "r",
                                            value: "= this.e"
                                        }
                                    },
                                    55
                                ],
                                finally: [
                                    {
                                        "@assign": {
                                            to: "f",
                                            value: "= this.OK"
                                        }
                                    }
                                ]
                            }
                        },
                        "= {r: this.r, f: this.f, tr: this.tr }"
                    ]
                }
            });

            async(function*() {
                let status = yield engine.invoke();
                assert(_.isPlainObject(status));
                assert(status.r instanceof Error);
                assert(status.r.message === "foo");
                assert(status.tr === 55);
                assert(status.f === "OK");
            })().nodeify(done);
        });

        it("should throw errors when there is finally only", function (done) {
            let x = null;
            let engine = new ActivityExecutionEngine({
                "@block": {
                    args: [
                        {
                            "@try": {
                                args: [
                                    {
                                        "@throw": {
                                            error: "foo"
                                        }
                                    }
                                ],
                                finally: function() {
                                    x = "OK";
                                }
                            }
                        }
                    ]
                }
            });

            async(function*() {
                try {
                    yield engine.invoke();
                }
                catch (e) {
                    assert(e instanceof Error);
                    assert(e.message === "foo");
                    assert(x === "OK");
                    return;
                }
                assert(false);
            })().nodeify(done);
        });

        it("should rethrow current error", function (done) {
            let ge = null;
            let gf = null;
            let engine = new ActivityExecutionEngine({
                "@block": {
                    args: [
                        {
                            "@try": {
                                args: [
                                    {
                                        "@throw": {
                                            error: "foo"
                                        }
                                    }
                                ],
                                catch: [
                                    function() {
                                      ge = this.e;
                                    },
                                    {
                                        "@throw": {}
                                    }
                                ],
                                finally: function() {
                                    gf = "OK";
                                }
                            }
                        }
                    ]
                }
            });

            async(function*() {
                try {
                    yield engine.invoke();
                }
                catch (e) {
                    assert(e instanceof Error);
                    assert(e.message === "foo");
                    assert(ge === e);
                    assert(gf === "OK");
                    return;
                }
                assert(false);
            })().nodeify(done);
        });

        it("should rethrow a new error", function (done) {
            let ge = null;
            let gf = null;
            let engine = new ActivityExecutionEngine({
                "@block": {
                    args: [
                        {
                            "@try": {
                                args: [
                                    {
                                        "@throw": {
                                            error: "foo"
                                        }
                                    }
                                ],
                                catch: [
                                    function() {
                                        ge = this.e;
                                    },
                                    {
                                        "@throw": {
                                            error: "= this.e.message + 'pupu'"
                                        }
                                    }
                                ],
                                finally: function() {
                                    gf = "OK";
                                }
                            }
                        }
                    ]
                }
            });

            async(function*() {
                try {
                    yield engine.invoke();
                }
                catch (e) {
                    assert(e instanceof Error);
                    assert(e.message === "foopupu");
                    assert(ge instanceof Error);
                    assert(ge.message === "foo");
                    assert(gf === "OK");
                    return;
                }
                assert(false);
            })().nodeify(done);
        });

        it("should catch a rethrown error in a custom varname", function (done) {
            let ge = null;
            let gf = null;
            let engine = new ActivityExecutionEngine({
                "@block": {
                    args: [
                        {
                            "@try": {
                                varName: "err",
                                args: {
                                    "@try": {
                                        args: [
                                            {
                                                "@throw": {
                                                    error: "foo"
                                                }
                                            }
                                        ],
                                        catch: [
                                            function() {
                                                ge = this.e;
                                            },
                                            {
                                                "@throw": {
                                                    error: "= this.e.message + 'pupu'"
                                                }
                                            }
                                        ],
                                        finally: function() {
                                            gf = "OK";
                                        }
                                    }
                                },
                                catch: [ "= this.err" ]
                            }
                        }
                    ]
                }
            });

            async(function*() {
                let e = yield engine.invoke();
                assert(e instanceof Error);
                assert(e.message === "foopupu");
                assert(ge instanceof Error);
                assert(ge.message === "foo");
                assert(gf === "OK");
            })().nodeify(done);
        });
    });
});