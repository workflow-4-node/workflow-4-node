var Expression = require("../").activities.Expression;
var Func = require("../").activities.Func;
var Block = require("../").activities.Block;
var ActivityMarkup = require("../").activities.ActivityMarkup;
var ActivityExecutionEngine = require("../").activities.ActivityExecutionEngine;
var _ = require("lodash");
var ConsoleTracker = require("../").activities.ConsoleTracker;
var WorkflowHost = require("../").hosting.WorkflowHost;
var InstanceIdParser = require("../").hosting.InstanceIdParser;
var MemoryPersistence = require("../").hosting.MemoryPersistence;
var hostingTestCommon = require("./hosting/hostingTestCommon");

module.exports = {
    test: function(test)
    {
        var MongoDDPersistence = require("../").hosting.mongoDB.MongoDDPersistence;
        var persistence = new MongoDDPersistence({
            connection: "mongodb://localhost/workflow"
        });
        hostingTestCommon.doCalculatorTest(test, persistence);
    }
}
