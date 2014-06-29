var MongoDDPersistence = require("../../../").hosting.mongoDB.MongoDDPersistence;
var hostingTestCommon = require("../hostingTestCommon");

module.exports = {
    basicHostTestWMongoDbPersistence: function (test)
    {
        var options = {
            connection: "mongodb://localhost/workflow"
        };
        hostingTestCommon.doBasicHostTest(test, new MongoDDPersistence(options));
    }
}
