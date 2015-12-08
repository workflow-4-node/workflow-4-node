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

describe("cancellation", function () {
    describe("Cancel", function () {
        it("when force is set then it should cancel other branches", function (done) {
            async(regeneratorRuntime.mark(function _callee() {
                var x, engine;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
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
                                                "@cancel": {
                                                    force: true
                                                }
                                            }]
                                        }]
                                    }
                                });
                                _context.prev = 2;
                                _context.next = 5;
                                return engine.invoke();

                            case 5:
                                assert(false);
                                _context.next = 12;
                                break;

                            case 8:
                                _context.prev = 8;
                                _context.t0 = _context["catch"](2);

                                assert(_context.t0 instanceof wf4node.common.errors.Cancelled);
                                assert(!x);

                            case 12:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[2, 8]]);
            }))().nodeify(done);
        });

        it("when not force it should run other branches before terminating", function (done) {
            async(regeneratorRuntime.mark(function _callee2() {
                var x, y, engine;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                x = 0;
                                y = 0;
                                engine = new ActivityExecutionEngine({
                                    "@block": {
                                        args: [{
                                            "@parallel": [function () {
                                                x++;
                                            }, {
                                                "@cancel": {}
                                            }]
                                        }, function () {
                                            y++;
                                        }]
                                    }
                                });
                                _context2.prev = 3;
                                _context2.next = 6;
                                return engine.invoke();

                            case 6:
                                assert(false);
                                _context2.next = 14;
                                break;

                            case 9:
                                _context2.prev = 9;
                                _context2.t0 = _context2["catch"](3);

                                assert(_context2.t0 instanceof wf4node.common.errors.Cancelled);
                                assert(x === 1);
                                assert(!y);

                            case 14:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[3, 9]]);
            }))().nodeify(done);
        });
    });

    describe("CancellationScope", function () {
        it("when force is set then it should cancel other branches, and it should handled in scope", function (done) {
            async(regeneratorRuntime.mark(function _callee3() {
                var x, y, engine;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                x = false;
                                y = false;
                                engine = new ActivityExecutionEngine({
                                    "@cancellationScope": {
                                        args: {
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
                                                        "@cancel": {
                                                            force: true
                                                        }
                                                    }]
                                                }]
                                            }
                                        },
                                        cancelled: [function () {
                                            y = true;
                                        }]
                                    }
                                });
                                _context3.next = 5;
                                return engine.invoke();

                            case 5:
                                assert(!x);
                                assert(y);

                            case 7:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }))().nodeify(done);
        });

        it("when not force it should run other branches before terminating", function (done) {
            async(regeneratorRuntime.mark(function _callee4() {
                var x, y, z, engine;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                x = 0;
                                y = 0;
                                z = false;
                                engine = new ActivityExecutionEngine({
                                    "@cancellationScope": {
                                        args: {
                                            "@block": {
                                                args: [{
                                                    "@parallel": [function () {
                                                        x++;
                                                    }, {
                                                        "@cancel": {}
                                                    }]
                                                }, function () {
                                                    y++;
                                                }]
                                            }
                                        },
                                        cancelled: function cancelled() {
                                            z = true;
                                        }
                                    }
                                });
                                _context4.next = 6;
                                return engine.invoke();

                            case 6:
                                assert(x === 1);
                                assert(!y);
                                assert(z);

                            case 9:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }))().nodeify(done);
        });
    });
});
//# sourceMappingURL=cancellation.js.map
