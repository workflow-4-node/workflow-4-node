var wf4node = require("../../../../");
var MongoDDPersistence = wf4node.hosting.mongoDB.MongoDDPersistence;
var hostingTestCommon = require("../hostingTestCommon");
var Serializer = require("backpack-node").system.Serializer;

var connStr = process.env.TEST_MONGODB_CONN;
var persistence = connStr ? new MongoDDPersistence({connection: connStr}) : null;

if (persistence) {
    describe("WorkflowHost", function () {
        describe("With MongoDBPersistence", function () {
            it("should run basic hosting example in non-lazy mode", function (done) {
                var hostOptions = {
                    persistence: persistence,
                    lazyPersistence: false,
                    serializer: null,
                    alwaysLoadState: true
                };
                hostingTestCommon.doBasicHostTest(hostOptions).nodeify(done);
            });

            it("should run basic hosting example in lazy mode", function (done) {
                var hostOptions = {
                    persistence: persistence,
                    lazyPersistence: true,
                    serializer: null,
                    alwaysLoadState: true
                };
                hostingTestCommon.doBasicHostTest(hostOptions).nodeify(done);
            });

            it("should run correlated calculator example in non-lazy mode", function (done) {
                var hostOptions = {
                    persistence: persistence,
                    lazyPersistence: false,
                    serializer: null,
                    alwaysLoadState: true
                };
                hostingTestCommon.doCalculatorTest(hostOptions).nodeify(done);
            });

            it("should run correlated calculator example in lazy mode", function (done) {
                var hostOptions = {
                    persistence: persistence,
                    lazyPersistence: true,
                    serializer: null,
                    alwaysLoadState: true
                };
                hostingTestCommon.doCalculatorTest(hostOptions).nodeify(done);
            });

            it("should run correlated calculator example with a serializer", function (done) {
                var hostOptions = {
                    persistence: persistence,
                    lazyPersistence: true,
                    serializer: new Serializer(),
                    alwaysLoadState: true
                };
                hostingTestCommon.doCalculatorTest(hostOptions).nodeify(done);
            });
        });
    });
}