"use strict";

var EventEmitter = require("events").EventEmitter;
var Bluebird = require("bluebird");
var async = require("../common").asyncHelpers.async;
var debug = require("debug")("wf4node:WakeUp");
var util = require("util");

function WakeUp(knownInstaStore, persistence, options) {
    EventEmitter.call(this);

    this.knownInstaStore = knownInstaStore;
    this.persistence = persistence;
    this.options = options || {};
    this._working = false;
    this._timeout = null;
    this._batchSize = this.options.batchSize || 10;
}

util.inherits(WakeUp, EventEmitter);

WakeUp.prototype.start = function () {
    var _this = this;

    if (!this._timeout) {
        (function () {
            debug("Start.");
            var self = _this;
            _this._timeout = setTimeout(function () {
                self._step();
            }, _this.options.interval || 5000);
        })();
    }
};

WakeUp.prototype.stop = function () {
    if (this._timeout) {
        debug("Stop.");
        clearTimeout(this._timeout);
        this._timeout = null;
    }
};

WakeUp.prototype._step = async(regeneratorRuntime.mark(function _callee3() {
    var _this2 = this;

    var self, wakeupables;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    self = this;
                    _context3.prev = 1;

                    if (!this._working) {
                        _context3.next = 5;
                        break;
                    }

                    debug("Skipping current step because work in progress.");
                    return _context3.abrupt("return");

                case 5:
                    debug("Starting next step.");
                    this._working = true;
                    _context3.prev = 7;
                    _context3.next = 10;
                    return this._getNextWakeupables();

                case 10:
                    wakeupables = _context3.sent;

                    if (!(wakeupables && wakeupables.length)) {
                        _context3.next = 15;
                        break;
                    }

                    return _context3.delegateYield(regeneratorRuntime.mark(function _callee2() {
                        var tasks, count, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step, results, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, result;

                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        debug("%d selected to wake up.", wakeupables.length);
                                        tasks = [];
                                        count = 0;
                                        _iteratorNormalCompletion = true;
                                        _didIteratorError = false;
                                        _iteratorError = undefined;
                                        _context2.prev = 6;

                                        _loop = function _loop() {
                                            var wakeupable = _step.value;

                                            tasks.push(async(regeneratorRuntime.mark(function _callee() {
                                                var promise;
                                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                                    while (1) {
                                                        switch (_context.prev = _context.next) {
                                                            case 0:
                                                                if (!(count >= self._batchSize)) {
                                                                    _context.next = 2;
                                                                    break;
                                                                }

                                                                return _context.abrupt("return");

                                                            case 2:
                                                                debug("Waking up workflow %s, id: %s", wakeupable.workflowName, wakeupable.instanceId);
                                                                wakeupable.result = {};
                                                                promise = new Bluebird(function (resolve, reject) {
                                                                    wakeupable.result.resolve = resolve;
                                                                    wakeupable.result.reject = reject;
                                                                });

                                                                self.emit("continue", wakeupable);
                                                                _context.prev = 6;
                                                                _context.next = 9;
                                                                return promise;

                                                            case 9:
                                                                count++;
                                                                debug("Processing delay completed.");
                                                                _context.next = 17;
                                                                break;

                                                            case 13:
                                                                _context.prev = 13;
                                                                _context.t0 = _context["catch"](6);

                                                                debug("Processing delay error: %s", _context.t0.stack);
                                                                self.emit("error", _context.t0);

                                                            case 17:
                                                            case "end":
                                                                return _context.stop();
                                                        }
                                                    }
                                                }, _callee, this, [[6, 13]]);
                                            }))());
                                        };

                                        for (_iterator = wakeupables[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                            _loop();
                                        }

                                        _context2.next = 15;
                                        break;

                                    case 11:
                                        _context2.prev = 11;
                                        _context2.t0 = _context2["catch"](6);
                                        _didIteratorError = true;
                                        _iteratorError = _context2.t0;

                                    case 15:
                                        _context2.prev = 15;
                                        _context2.prev = 16;

                                        if (!_iteratorNormalCompletion && _iterator.return) {
                                            _iterator.return();
                                        }

                                    case 18:
                                        _context2.prev = 18;

                                        if (!_didIteratorError) {
                                            _context2.next = 21;
                                            break;
                                        }

                                        throw _iteratorError;

                                    case 21:
                                        return _context2.finish(18);

                                    case 22:
                                        return _context2.finish(15);

                                    case 23:
                                        _context2.next = 25;
                                        return Bluebird.settle(tasks);

                                    case 25:
                                        results = _context2.sent;
                                        _iteratorNormalCompletion2 = true;
                                        _didIteratorError2 = false;
                                        _iteratorError2 = undefined;
                                        _context2.prev = 29;
                                        _iterator2 = results[Symbol.iterator]();

                                    case 31:
                                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                            _context2.next = 38;
                                            break;
                                        }

                                        result = _step2.value;

                                        if (!result.isRejected()) {
                                            _context2.next = 35;
                                            break;
                                        }

                                        throw result.reason();

                                    case 35:
                                        _iteratorNormalCompletion2 = true;
                                        _context2.next = 31;
                                        break;

                                    case 38:
                                        _context2.next = 44;
                                        break;

                                    case 40:
                                        _context2.prev = 40;
                                        _context2.t1 = _context2["catch"](29);
                                        _didIteratorError2 = true;
                                        _iteratorError2 = _context2.t1;

                                    case 44:
                                        _context2.prev = 44;
                                        _context2.prev = 45;

                                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                            _iterator2.return();
                                        }

                                    case 47:
                                        _context2.prev = 47;

                                        if (!_didIteratorError2) {
                                            _context2.next = 50;
                                            break;
                                        }

                                        throw _iteratorError2;

                                    case 50:
                                        return _context2.finish(47);

                                    case 51:
                                        return _context2.finish(44);

                                    case 52:
                                    case "end":
                                        return _context2.stop();
                                }
                            }
                        }, _callee2, _this2, [[6, 11, 15, 23], [16,, 18, 22], [29, 40, 44, 52], [45,, 47, 51]]);
                    })(), "t0", 13);

                case 13:
                    _context3.next = 16;
                    break;

                case 15:
                    debug("There is no instance to wake up.");

                case 16:
                    _context3.next = 21;
                    break;

                case 18:
                    _context3.prev = 18;
                    _context3.t1 = _context3["catch"](7);

                    this.emit("error", _context3.t1);

                case 21:
                    _context3.prev = 21;

                    debug("Next step completed.");
                    this._working = false;
                    return _context3.finish(21);

                case 25:
                    _context3.prev = 25;

                    if (this._timeout) {
                        this._timeout = setTimeout(function () {
                            self._step();
                        }, this.options.interval || 5000);
                    }
                    return _context3.finish(25);

                case 28:
                case "end":
                    return _context3.stop();
            }
        }
    }, _callee3, this, [[1,, 25, 28], [7, 18, 21, 25]]);
}));

WakeUp.prototype._getNextWakeupables = async(regeneratorRuntime.mark(function _callee4() {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    if (!this.persistence) {
                        _context4.next = 6;
                        break;
                    }

                    _context4.next = 3;
                    return this.persistence.getNextWakeupables(this._batchSize * 1.5);

                case 3:
                    return _context4.abrupt("return", _context4.sent);

                case 6:
                    return _context4.abrupt("return", this.knownInstaStore.getNextWakeupables(this._batchSize * 1.5));

                case 7:
                case "end":
                    return _context4.stop();
            }
        }
    }, _callee4, this);
}));

module.exports = WakeUp;
//# sourceMappingURL=wakeUp.js.map
