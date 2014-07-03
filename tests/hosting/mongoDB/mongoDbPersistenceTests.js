var MongoDDPersistence = require("../../../").hosting.mongoDB.MongoDDPersistence;
var hostingTestCommon = require("../hostingTestCommon");

var persistence = new MongoDDPersistence({
    connection: "mongodb://localhost/workflow"
});

module.exports = {
    basicHostTestWMongoDbPersistence: function (test)
    {
        hostingTestCommon.doBasicHostTest(test, persistence);
    }
}
