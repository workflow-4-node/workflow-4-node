"use strict"

/* global describe,it */

;
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var activityMarkup = wf4node.activities.activityMarkup;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("assert");
var Bluebird = require("bluebird");
var _ = require("lodash");
var errors = wf4node.common.errors;

describe("Func", function () {
    it("should run with a synchronous code", function (done) {
        var fop = new Func();
        fop.code = function (obj) {
            return obj.name;
        };

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Gabor" }).then(function (result) {
            assert.equal(result, "Gabor");
        }).nodeify(done);
    });

    it("should run when created from markup", function (done) {
        var fop = activityMarkup.parse({
            "@func": {
                code: function code(obj) {
                    return obj.name;
                }
            }
        });

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Gabor" }).then(function (result) {
            assert.equal(result, "Gabor");
        }).nodeify(done);
    });

    it("should run twice", function (done) {
        var fop = activityMarkup.parse({
            "@func": {
                code: function code(obj) {
                    return obj.name;
                }
            }
        });

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Gabor" }).then(function (result) {
            assert.equal(result, "Gabor");
            return engine.invoke({ name: "Pisti" }).then(function (result2) {
                assert.equal(result2, "Pisti");
            });
        }).nodeify(done);
    });

    it("should run when code is asynchronous", function (done) {
        var fop = new Func();
        fop.code = function (obj) {
            return Bluebird.resolve(obj.name);
        };

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Mezo" }).then(function (result) {
            assert.equal(result, "Mezo");
        }).nodeify(done);
    });

    it("should run asynchronously when code is a generator", function (done) {
        var fop = Func.async(regeneratorRuntime.mark(function _callee(a) {
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return Bluebird.delay(100);

                        case 2:
                            return _context.abrupt("return", a.name);

                        case 3:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Mezo" }).then(function (result) {
            assert.equal(result, "Mezo");
        }).nodeify(done);
    });

    it("should not accept activities as arguments", function (done) {
        var expected = { name: "Gabor" };
        var fop = new Func();
        fop.code = function (obj) {
            return obj.name;
        };
        var fopin = new Func();
        fopin.code = function () {
            return expected;
        };

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke(fopin).then(function (result) {
            assert(false);
        }, function (e) {
            assert(e instanceof errors.ActivityRuntimeError);
        }).nodeify(done);
    });

    it("should work as an agument", function (done) {
        var expected = { name: "Gabor" };

        var fop = activityMarkup.parse({
            "@func": {
                args: {
                    "@func": {
                        code: function code() {
                            return expected;
                        }
                    }
                },
                code: function code(obj) {
                    return obj.name;
                }
            }
        });

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke().then(function (result) {
            assert.equal(result, expected.name);
        }).nodeify(done);
    });

    it("should include lodash as last argument", function (done) {
        var expected = { name: "GaborMezo" };

        var fop = activityMarkup.parse({
            "@func": {
                args: {
                    "@func": {
                        code: function code() {
                            return expected;
                        }
                    }
                },
                code: function code(obj, __) {
                    return __.camelCase(obj.name);
                }
            }
        });

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke().then(function (result) {
            assert.equal(result, _.camelCase(expected.name));
        }).nodeify(done);
    });

    describe("calling other methods", function () {
        it("should run when created from markup", function (done) {
            var markup = activityMarkup.parse({
                "@block": {
                    id: "block",
                    "code": {
                        _: function _(obj) {
                            return obj.name;
                        }
                    },
                    args: {
                        "@func": {
                            code: "= this.block.code",
                            args: { name: "Gabor" }
                        }
                    }
                }
            });

            var engine = new ActivityExecutionEngine(markup);

            engine.invoke().then(function (result) {
                assert.equal(result, "Gabor");
            }).nodeify(done);
        });

        it("should run when code is asynchronous", function (done) {
            var markup = activityMarkup.parse({
                "@block": {
                    id: "block",
                    "code": {
                        _: function _(obj) {
                            return Bluebird.delay(10).then(function () {
                                return obj.name;
                            });
                        }
                    },
                    args: {
                        "@func": {
                            code: "= this.block.code",
                            args: { name: "Gabor" }
                        }
                    }
                }
            });

            var engine = new ActivityExecutionEngine(markup);

            engine.invoke().then(function (result) {
                assert.equal(result, "Gabor");
            }).nodeify(done);
        });

        it("should include lodash as last argument", function (done) {
            var markup = activityMarkup.parse({
                "@block": {
                    id: "block",
                    "code": {
                        _: function _(obj, __) {
                            return Bluebird.delay(10).then(function () {
                                return __.camelCase(obj.name);
                            });
                        }
                    },
                    args: {
                        "@func": {
                            code: "= this.block.code",
                            args: { name: "GaborMezo" }
                        }
                    }
                }
            });

            var engine = new ActivityExecutionEngine(markup);

            engine.invoke().then(function (result) {
                assert.equal(result, _.camelCase("GaborMezo"));
            }).nodeify(done);
        });

        it("should fail with error", function (done) {
            var markup = activityMarkup.parse({
                "@block": [function () {
                    throw new Error("Boo.");
                }]
            });

            var engine = new ActivityExecutionEngine(markup);

            engine.invoke().then(function (result) {
                assert(false);
            }, function (e) {
                assert(/Boo/.test(e.message));
            }).nodeify(done);
        });
    });
});
//# sourceMappingURL=func.js.map
