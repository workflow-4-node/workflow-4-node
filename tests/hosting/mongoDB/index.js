var MongoDDPersistence = require("../../../").hosting.mongoDB.MongoDDPersistence;
var hostingTestCommon = require("../hostingTestCommon");

var connStr = process.env.TEST_MONGODB_CONN;

describe("WorkflowHost", function()
{
    describe("With MongoDBPersistence", function()
    {
        it("should run basic hosting example in non-lazy mode", function(done)
        {
            var persistence = connStr ? new MongoDDPersistence({ connection: connStr }) : null;
            if (persistence) hostingTestCommon.doBasicHostTest(persistence, false).nodeify(done); else done();
        });

        it("should run basic hosting example in lazy mode", function(done)
        {
            var persistence = connStr ? new MongoDDPersistence({ connection: connStr }) : null;
            if (persistence) hostingTestCommon.doBasicHostTest(persistence, true).nodeify(done); else done();
        });

        it("should run correlated calculator example in non-lazy mode", function(done)
        {
            var persistence = connStr ? new MongoDDPersistence({ connection: connStr }) : null;
            if (persistence) hostingTestCommon.doCalculatorTest(persistence, false).nodeify(done); else done();
        });

        it("should run correlated calculator example in lazy mode", function(done)
        {
            var persistence = connStr ? new MongoDDPersistence({ connection: connStr }) : null;
            if (persistence) hostingTestCommon.doCalculatorTest(persistence, true).nodeify(done); else done();
        });
    });
});