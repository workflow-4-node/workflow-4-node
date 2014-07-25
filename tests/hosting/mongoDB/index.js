var MongoDDPersistence = require("../../../").hosting.mongoDB.MongoDDPersistence;
var hostingTestCommon = require("../hostingTestCommon");

var connStr = process.env.TEST_MONGODB_CONN;

describe("WorkflowHost", function()
{
    describe("With MongoDBPersistence", function()
    {
        it("should run basic hosting example", function(done)
        {
            var persistence = connStr ? new MongoDDPersistence({ connection: connStr }) : null;
            if (persistence) hostingTestCommon.doBasicHostTest(persistence).nodeify(done); else done();
        });

        it("should run correlated calculator example", function(done)
        {
            var persistence = connStr ? new MongoDDPersistence({ connection: connStr }) : null;
            if (persistence) hostingTestCommon.doCalculatorTest(persistence).nodeify(done); else done();
        });
    });
});