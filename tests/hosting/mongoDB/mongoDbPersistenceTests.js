var MongoDDPersistence = require("../../../").hosting.mongoDB.MongoDDPersistence;
var hostingTestCommon = require("../hostingTestCommon");

module.exports = {
    basicHostTestWMongoDbPersistence: function (test)
    {
        var persistence = new MongoDDPersistence({
            connection: "mongodb://swiiis01/workflow"
        });

        hostingTestCommon.doBasicHostTest(test, persistence);
    },

    calculatorTestWMongoDbPersistence: function(test)
    {
        var persistence = new MongoDDPersistence({
            connection: "mongodb://swiiis01/workflow"
        });

        hostingTestCommon.doCalculatorTest(test, persistence);
    }
}
