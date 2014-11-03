var InstanceIdParser = require("../../").hosting.InstanceIdParser;
var _ = require("lodash");
var hostingTestCommon = require("./hostingTestCommon");
var MemoryPersistence = require("../../").hosting.MemoryPersistence;
var Serializer = require("backpack-node").system.Serializer;

var assert = require("assert");

describe("InstanceIdParser", function () {
    describe("#parse()", function () {
        it("should understand common paths", function () {
            var p = new InstanceIdParser();
            assert.equal(p.parse("this", 1), 1);
            assert.equal(p.parse("[0]", [1]), 1);
            assert.equal(p.parse("[0]", [4, 5]), 4);
            assert.equal(p.parse("[1].id", [{id: 1}, {id: 2}]), 2);
            assert.equal(p.parse("id[0].a", {id: [{a: "foo"}]}), "foo");
        });
    });
});

describe("WorkflowHost", function () {
    describe("Without persistence", function () {
        it("should run basic hosting example", function (done) {
            hostingTestCommon.doBasicHostTest().nodeify(done);
        });

        it("should run correlated calculator example", function (done) {
            hostingTestCommon.doCalculatorTest().nodeify(done);
        });
    });

    describe("With MemoryPersistence", function () {
        this.timeout(5000);

        it("should run basic hosting example in non-lazy mode", function (done) {
            var hostOptions = {
                persistence: new MemoryPersistence(),
                lazyPersistence: false,
                serializer: null,
                alwaysLoadState: true
            };
            hostingTestCommon.doBasicHostTest(hostOptions).nodeify(done);
        });

        it("should run basic hosting example in lazy mode", function (done) {
            var hostOptions = {
                persistence: new MemoryPersistence(),
                lazyPersistence: true,
                serializer: null,
                alwaysLoadState: true
            };
            hostingTestCommon.doBasicHostTest(hostOptions).nodeify(done);
        });

        it("should run correlated calculator example in non-lazy mode", function (done) {
            var hostOptions = {
                persistence: new MemoryPersistence(),
                lazyPersistence: false,
                serializer: null,
                alwaysLoadState: true
            };
            hostingTestCommon.doCalculatorTest(hostOptions).nodeify(done);
        });

        it("should run correlated calculator example in lazy mode", function (done) {
            var hostOptions = {
                persistence: new MemoryPersistence(),
                lazyPersistence: true,
                serializer: null,
                alwaysLoadState: true
            };
            hostingTestCommon.doCalculatorTest(hostOptions).nodeify(done);
        });

        it("should run correlated calculator example if state is serialized", function (done) {
            var hostOptions = {
                persistence: new MemoryPersistence(),
                lazyPersistence: false,
                serializer: new Serializer(),
                alwaysLoadState: true
            };
            hostingTestCommon.doCalculatorTest(hostOptions).nodeify(done);
        });
    });
});
