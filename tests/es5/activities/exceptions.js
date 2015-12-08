"use strict"

/* global describe,it */

;
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("better-assert");
var Bluebird = require("bluebird");
var _ = require("lodash");
var async = wf4node.common.asyncHelpers.async;

describe("exceptions", function () {
    describe("Throw", function () {
        it("should throw errors", function (done) {
            var engine = new ActivityExecutionEngine({
                "@block": {
                    args: [{
                        "@throw": {
                            error: function error() {
                                return new TypeError("foo");
                            }
                        }
                    }]
                }
            });

            async(regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return engine.invoke();

                            case 3:
                                _context.next = 10;
                                break;

                            case 5:
                                _context.prev = 5;
                                _context.t0 = _context["catch"](0);

                                assert(_context.t0 instanceof TypeError);
                                assert(_context.t0.message === "foo");
                                return _context.abrupt("return");

                            case 10:
                                assert(false);

                            case 11:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 5]]);
            }))().nodeify(done);
        });

        it("should throw strings as errors", function (done) {
            var engine = new ActivityExecutionEngine({
                "@block": {
                    args: [{
                        "@throw": {
                            error: "foo"
                        }
                    }]
                }
            });

            async(regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return engine.invoke();

                            case 3:
                                _context2.next = 10;
                                break;

                            case 5:
                                _context2.prev = 5;
                                _context2.t0 = _context2["catch"](0);

                                assert(_context2.t0 instanceof Error);
                                assert(_context2.t0.message === "foo");
                                return _context2.abrupt("return");

                            case 10:
                                assert(false);

                            case 11:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[0, 5]]);
            }))().nodeify(done);
        });
    });

    describe("Try", function () {
        it("should catch code errors", function (done) {
            var engine = new ActivityExecutionEngine({
                "@block": {
                    r: null,
                    f: null,
                    tr: null,
                    args: [{
                        "@try": {
                            "@to": "tr",
                            args: [function () {
                                throw new Error("foo");
                            }],
                            catch: [{
                                "@assign": {
                                    to: "r",
                                    value: "= this.e"
                                }
                            }, 55],
                            finally: {
                                "@assign": {
                                    to: "f",
                                    value: "OK"
                                }
                            }
                        }
                    }, "= {r: this.r, f: this.f, tr: this.tr }"]
                }
            });

            async(regeneratorRuntime.mark(function _callee3() {
                var status;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return engine.invoke();

                            case 2:
                                status = _context3.sent;

                                assert(_.isPlainObject(status));
                                assert(status.r instanceof Error);
                                assert(status.r.message === "foo");
                                assert(status.tr === 55);
                                assert(status.f === "OK");

                            case 8:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }))().nodeify(done);
        });

        it("should catch Throw errors", function (done) {
            var engine = new ActivityExecutionEngine({
                "@block": {
                    r: null,
                    f: null,
                    tr: null,
                    OK: "OK",
                    args: [{
                        "@try": {
                            "@to": "tr",
                            args: [{
                                "@throw": {
                                    error: "foo"
                                }
                            }],
                            catch: [{
                                "@assign": {
                                    to: "r",
                                    value: "= this.e"
                                }
                            }, 55],
                            finally: [{
                                "@assign": {
                                    to: "f",
                                    value: "= this.OK"
                                }
                            }]
                        }
                    }, "= {r: this.r, f: this.f, tr: this.tr }"]
                }
            });

            async(regeneratorRuntime.mark(function _callee4() {
                var status;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return engine.invoke();

                            case 2:
                                status = _context4.sent;

                                assert(_.isPlainObject(status));
                                assert(status.r instanceof Error);
                                assert(status.r.message === "foo");
                                assert(status.tr === 55);
                                assert(status.f === "OK");

                            case 8:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }))().nodeify(done);
        });

        it("should throw errors when there is finally only", function (done) {
            var x = null;
            var engine = new ActivityExecutionEngine({
                "@block": {
                    args: [{
                        "@try": {
                            args: [{
                                "@throw": {
                                    error: "foo"
                                }
                            }],
                            finally: function _finally() {
                                x = "OK";
                            }
                        }
                    }]
                }
            });

            async(regeneratorRuntime.mark(function _callee5() {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.prev = 0;
                                _context5.next = 3;
                                return engine.invoke();

                            case 3:
                                _context5.next = 11;
                                break;

                            case 5:
                                _context5.prev = 5;
                                _context5.t0 = _context5["catch"](0);

                                assert(_context5.t0 instanceof Error);
                                assert(_context5.t0.message === "foo");
                                assert(x === "OK");
                                return _context5.abrupt("return");

                            case 11:
                                assert(false);

                            case 12:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[0, 5]]);
            }))().nodeify(done);
        });

        it("should rethrow current error", function (done) {
            var ge = null;
            var gf = null;
            var engine = new ActivityExecutionEngine({
                "@block": {
                    args: [{
                        "@try": {
                            args: [{
                                "@throw": {
                                    error: "foo"
                                }
                            }],
                            catch: [function () {
                                ge = this.e;
                            }, {
                                "@throw": {}
                            }],
                            finally: function _finally() {
                                gf = "OK";
                            }
                        }
                    }]
                }
            });

            async(regeneratorRuntime.mark(function _callee6() {
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.prev = 0;
                                _context6.next = 3;
                                return engine.invoke();

                            case 3:
                                _context6.next = 12;
                                break;

                            case 5:
                                _context6.prev = 5;
                                _context6.t0 = _context6["catch"](0);

                                assert(_context6.t0 instanceof Error);
                                assert(_context6.t0.message === "foo");
                                assert(ge === _context6.t0);
                                assert(gf === "OK");
                                return _context6.abrupt("return");

                            case 12:
                                assert(false);

                            case 13:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[0, 5]]);
            }))().nodeify(done);
        });

        it("should rethrow a new error", function (done) {
            var ge = null;
            var gf = null;
            var engine = new ActivityExecutionEngine({
                "@block": {
                    args: [{
                        "@try": {
                            args: [{
                                "@throw": {
                                    error: "foo"
                                }
                            }],
                            catch: [function () {
                                ge = this.e;
                            }, {
                                "@throw": {
                                    error: "= this.e.message + 'pupu'"
                                }
                            }],
                            finally: function _finally() {
                                gf = "OK";
                            }
                        }
                    }]
                }
            });

            async(regeneratorRuntime.mark(function _callee7() {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.prev = 0;
                                _context7.next = 3;
                                return engine.invoke();

                            case 3:
                                _context7.next = 13;
                                break;

                            case 5:
                                _context7.prev = 5;
                                _context7.t0 = _context7["catch"](0);

                                assert(_context7.t0 instanceof Error);
                                assert(_context7.t0.message === "foopupu");
                                assert(ge instanceof Error);
                                assert(ge.message === "foo");
                                assert(gf === "OK");
                                return _context7.abrupt("return");

                            case 13:
                                assert(false);

                            case 14:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this, [[0, 5]]);
            }))().nodeify(done);
        });

        it("should catch a rethrown error in a custom varname", function (done) {
            var ge = null;
            var gf = null;
            var engine = new ActivityExecutionEngine({
                "@block": {
                    args: [{
                        "@try": {
                            varName: "err",
                            args: {
                                "@try": {
                                    args: [{
                                        "@throw": {
                                            error: "foo"
                                        }
                                    }],
                                    catch: [function () {
                                        ge = this.e;
                                    }, {
                                        "@throw": {
                                            error: "= this.e.message + 'pupu'"
                                        }
                                    }],
                                    finally: function _finally() {
                                        gf = "OK";
                                    }
                                }
                            },
                            catch: ["= this.err"]
                        }
                    }]
                }
            });

            async(regeneratorRuntime.mark(function _callee8() {
                var e;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return engine.invoke();

                            case 2:
                                e = _context8.sent;

                                assert(e instanceof Error);
                                assert(e.message === "foopupu");
                                assert(ge instanceof Error);
                                assert(ge.message === "foo");
                                assert(gf === "OK");

                            case 8:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }))().nodeify(done);
        });
    });

    describe("behavior", function () {
        it("should cancel other branches", function (done) {
            async(regeneratorRuntime.mark(function _callee9() {
                var x, engine;
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                x = false;
                                engine = new ActivityExecutionEngine({
                                    "@parallel": {
                                        args: [function () {
                                            return Bluebird.delay(200).then(function () {
                                                throw new Error("b+");
                                            });
                                        }, {
                                            "@block": [{
                                                "@delay": {
                                                    ms: 200
                                                }
                                            }, function () {
                                                x = true;
                                            }]
                                        }, {
                                            "@block": [{
                                                "@delay": {
                                                    ms: 100
                                                }
                                            }, {
                                                "@throw": {
                                                    error: "foo"
                                                }
                                            }]
                                        }, {
                                            "@block": [{
                                                "@delay": {
                                                    ms: 50
                                                }
                                            }, {
                                                "@throw": {
                                                    error: "boo"
                                                }
                                            }]
                                        }]
                                    }
                                });
                                _context9.prev = 2;
                                _context9.next = 5;
                                return engine.invoke();

                            case 5:
                                assert(false);
                                _context9.next = 12;
                                break;

                            case 8:
                                _context9.prev = 8;
                                _context9.t0 = _context9["catch"](2);

                                assert(_context9.t0.message === "boo");
                                assert(!x);

                            case 12:
                            case "end":
                                return _context9.stop();
                        }
                    }
                }, _callee9, this, [[2, 8]]);
            }))().nodeify(done);
        });
    });
});
//# sourceMappingURL=exceptions.js.map
