"use strict"

/* global describe,it */

;
var wf4node = require("../../../");
var InstanceIdParser = wf4node.hosting.InstanceIdParser;
var _ = require("lodash");
var hostingTestCommon = require("./hostingTestCommon");
var MemoryPersistence = wf4node.hosting.MemoryPersistence;
var Serializer = require("backpack-node").system.Serializer;

var assert = require("assert");

describe("InstanceIdParser", function () {
    describe("parse()", function () {
        it("should understand common paths", function () {
            var p = new InstanceIdParser();
            assert.equal(p.parse("this", 1), 1);
            assert.equal(p.parse("[0]", [1]), 1);
            assert.equal(p.parse("[0]", [4, 5]), 4);
            assert.equal(p.parse("[1].id", [{ id: 1 }, { id: 2 }]), 2);
            assert.equal(p.parse("id[0].a", { id: [{ a: "foo" }] }), "foo");
        });
    });
});

describe("WorkflowHost", function () {
    this.timeout(60000);

    function getInfo(options) {
        return "persistence: " + (options.persistence ? "on" : "off") + ", lazy: " + (options.lazyPersistence ? "yes" : "no") + ", serializer: " + (options.serializer ? "yes" : "no") + ", alwaysLoad: " + (options.alwaysLoadState ? "yes" : "no");
    }

    function testBasic(options) {
        it("should run by: " + getInfo(options), function (done) {
            hostingTestCommon.doBasicHostTest(options).nodeify(done);
        });
    }

    function testCalc(options) {
        it("should run by: " + getInfo(options), function (done) {
            hostingTestCommon.doCalculatorTest(options).nodeify(done);
        });
    }

    function testDelayTo(options) {
        it("should run by: " + getInfo(options), function (done) {
            hostingTestCommon.doDelayTest(options).nodeify(done);
        });
    }

    function testStopOutdatedVersions(options) {
        it("should run by: " + getInfo(options), function (done) {
            hostingTestCommon.doStopOutdatedVersionsTest(options).nodeify(done);
        });
    }

    var allOptions = [{
        persistence: null,
        lazyPersistence: false,
        serializer: null,
        alwaysLoadState: false
    }, {
        persistence: new MemoryPersistence(),
        lazyPersistence: false,
        serializer: null,
        alwaysLoadState: false
    }, {
        persistence: new MemoryPersistence(),
        lazyPersistence: true,
        serializer: null,
        alwaysLoadState: false
    }, {
        persistence: new MemoryPersistence(),
        lazyPersistence: false,
        serializer: new Serializer(),
        alwaysLoadState: false
    }, {
        persistence: new MemoryPersistence(),
        lazyPersistence: true,
        serializer: new Serializer(),
        alwaysLoadState: false
    }, {
        persistence: new MemoryPersistence(),
        lazyPersistence: false,
        serializer: new Serializer(),
        alwaysLoadState: true
    }, {
        persistence: new MemoryPersistence(),
        lazyPersistence: true,
        serializer: new Serializer(),
        alwaysLoadState: true
    }];

    describe("Without Persistence and With Memory Persistence", function () {
        describe("Basic Example", function () {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = allOptions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var opt = _step.value;

                    if (opt.persistence) {
                        opt.persistence.clear();
                    }
                    testBasic(opt);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        });

        describe("Calculator Example", function () {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = allOptions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var opt = _step2.value;

                    if (opt.persistence) {
                        opt.persistence.clear();
                    }
                    testCalc(opt);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        });

        describe("DelayTo Example", function () {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = allOptions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var opt = _step3.value;

                    if (opt.persistence) {
                        opt.persistence.clear();
                    }
                    testDelayTo(opt);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        });

        describe("StopOutdatedVersions Example", function () {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = allOptions[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var opt = _step4.value;

                    if (opt.persistence) {
                        opt.persistence.clear();
                    }
                    testStopOutdatedVersions(opt);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        });
    });
});
//# sourceMappingURL=coreHostingTests.js.map
