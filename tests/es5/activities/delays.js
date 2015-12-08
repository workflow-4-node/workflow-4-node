"use strict"

/* global describe,it */

;
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var ConsoleTracker = wf4node.activities.ConsoleTracker;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("better-assert");
var Bluebird = require("bluebird");
var _ = require("lodash");
var async = wf4node.common.asyncHelpers.async;
require("date-utils");

describe("delays", function () {
    describe("DelayTo", function () {
        it("should wait for 200ms", function (done) {
            var engine = new ActivityExecutionEngine({
                "@delay": {
                    ms: 200
                }
            });

            async(regeneratorRuntime.mark(function _callee() {
                var now, d;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                now = new Date();
                                _context.next = 3;
                                return engine.invoke();

                            case 3:
                                d = new Date() - now;

                                assert(d > 200 && d < 400);

                            case 5:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }))().nodeify(done);
        });
    });

    describe("Repeat", function () {
        it("should repeat its args", function (done) {
            var i = 0;
            var engine = new ActivityExecutionEngine({
                "@repeat": {
                    intervalType: "secondly",
                    intervalValue: 0.2,
                    args: [function () {
                        if (++i < 4) {
                            return i;
                        }
                        throw new Error("OK");
                    }]
                }
            });

            async(regeneratorRuntime.mark(function _callee2() {
                var now, d;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                now = new Date();
                                _context2.prev = 1;
                                _context2.next = 4;
                                return engine.invoke();

                            case 4:
                                assert(false);
                                _context2.next = 16;
                                break;

                            case 7:
                                _context2.prev = 7;
                                _context2.t0 = _context2["catch"](1);

                                if (!(_context2.t0.message === "OK")) {
                                    _context2.next = 15;
                                    break;
                                }

                                d = new Date() - now;

                                assert(d > 400 && d < 1000);
                                assert(i === 4);
                                _context2.next = 16;
                                break;

                            case 15:
                                throw _context2.t0;

                            case 16:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[1, 7]]);
            }))().nodeify(done);
        });
    });
});
//# sourceMappingURL=delays.js.map
