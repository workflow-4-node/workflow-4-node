"use strict";

var Bluebird = require("bluebird");
var is = require("./is");

var async = Bluebird.coroutine;

var asyncHelpers = {
    async: async,

    aggressiveRetry: async(regeneratorRuntime.mark(function _callee(asyncFunc, until, timeout, timeoutError) {
        var startTime, waitTime, waitCount, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        timeoutError = timeoutError || function () {
                            return new Error("Retry timeout.");
                        };
                        startTime = new Date().getTime();
                        waitTime = 0;
                        waitCount = 0;
                        _context.next = 6;
                        return asyncFunc();

                    case 6:
                        result = _context.sent;

                    case 7:
                        if (until(result)) {
                            _context.next = 18;
                            break;
                        }

                        if (!(new Date().getTime() - startTime > timeout)) {
                            _context.next = 10;
                            break;
                        }

                        throw timeoutError();

                    case 10:
                        _context.next = 12;
                        return Bluebird.delay(waitTime);

                    case 12:
                        waitTime = Math.min(++waitCount * 250, 3000);
                        _context.next = 15;
                        return asyncFunc();

                    case 15:
                        result = _context.sent;
                        _context.next = 7;
                        break;

                    case 18:
                        return _context.abrupt("return", result);

                    case 19:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }))
};

module.exports = asyncHelpers;
//# sourceMappingURL=asyncHelpers.js.map
