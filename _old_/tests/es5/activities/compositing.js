"use strict"
/* global describe,it */
;
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var ConsoleTracker = wf4node.activities.ConsoleTracker;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("assert");
var Bluebird = require("bluebird");
var _ = require("lodash");
var async = wf4node.common.asyncHelpers.async;
var path = require("path");

describe("compositing", function () {
    it("should take arguments with same name as in outer scope", function (done) {
        var engine = new ActivityExecutionEngine({
            "@require": path.join(__dirname, "customActivities", "hello"),
            "@block": {
                to: "unbornchikken",
                args: {
                    "@hello": {
                        to: "= this.to"
                    }
                }
            }
        });

        async(regeneratorRuntime.mark(function _callee() {
            var result;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return engine.invoke();

                        case 2:
                            result = _context.sent;

                            assert.equal(result, "Hello unbornchikken!");

                        case 4:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }))().nodeify(done);
    });
});
//# sourceMappingURL=compositing.js.map
