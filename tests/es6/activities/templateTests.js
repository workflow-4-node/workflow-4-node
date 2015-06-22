var wf4node = require("../../../");
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var _ = require("lodash");
var assert = require("assert");

describe("Template", function () {
    it("should parse object correctly", function (done) {

        var engine = new ActivityExecutionEngine({
            template: {
                declare: {
                    a: "foo",
                    b: [
                        "zoo",
                        {
                            c: {
                                "@func": {
                                    code: function () {
                                        return 6;
                                    }
                                }
                            }
                        },
                        "# 42"
                    ]
                }
            }
        });

        engine.invoke().then(function (result) {

            assert.ok(_.isPlainObject(result));
            assert.equal(result.a, "foo");
            assert.ok(_.isArray(result.b));
            assert.equal(result.b.length, 3);
            assert.equal(result.b[0], "zoo");
            assert.ok(_.isPlainObject(result.b[1]));
            assert.equal(result.b[1].c, 6);
            assert.equal(result.b[2], 42);
        }).nodeify(done);
    });

    it("should work when specialized", function (done) {

        var engine = new ActivityExecutionEngine({
            block: [
                {
                    a: "foo",
                    b: [
                        "zoo",
                        {
                            c: {
                                "@func": {
                                    code: function () {
                                        return 6;
                                    }
                                }
                            }
                        },
                        "# 42"
                    ]
                }
            ]
        });

        engine.invoke().then(function (result) {
            assert.ok(_.isPlainObject(result));
            assert.equal(result.a, "foo");
            assert.ok(_.isArray(result.b));
            assert.equal(result.b.length, 3);
            assert.equal(result.b[0], "zoo");
            assert.ok(_.isPlainObject(result.b[1]));
            assert.equal(result.b[1].c, 6);
            assert.equal(result.b[2], 42);
        }).nodeify(done);
    });
});