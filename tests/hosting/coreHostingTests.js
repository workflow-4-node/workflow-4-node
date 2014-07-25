var InstanceIdParser = require("../../").hosting.InstanceIdParser;
var _ = require("lodash");
var hostingTestCommon = require("./hostingTestCommon");
var MemoryPersistence = require("../../").hosting.MemoryPersistence;

var assert = require("assert");

describe("InstanceIdParser", function()
{
    describe("#parse()", function()
    {
        it("should understand common paths", function()
        {
            var p = new InstanceIdParser();
            assert.equal(p.parse("this", 1), 1);
            assert.equal(p.parse("[0]", [1]), 1);
            assert.equal(p.parse("[0]", [4,5]), 4);
            assert.equal(p.parse("[1].id", [{ id: 1 }, { id: 2 }]), 2);
            assert.equal(p.parse("id[0].a", { id: [ { a: "foo" } ] }), "foo");
        });
    });
});

describe("WorkflowHost", function()
{
    describe("Without persistence", function()
    {
        it("should run basic hosting example", function(done)
        {
            hostingTestCommon.doBasicHostTest(null).nodeify(done);
        });

        it("should run correlated calculator example", function(done)
        {
            hostingTestCommon.doCalculatorTest(null).nodeify(done);
        });
    });

    describe("With MemoryPersistence", function()
    {
        it("should run basic hosting example", function(done)
        {
            hostingTestCommon.doBasicHostTest(new MemoryPersistence()).nodeify(done);
        });

        it("should run correlated calculator example", function(done)
        {
            hostingTestCommon.doCalculatorTest(new MemoryPersistence()).nodeify(done);
        });
    });
});
