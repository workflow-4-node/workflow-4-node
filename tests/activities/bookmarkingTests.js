var Expression = require("../../").activities.Expression;
var Func = require("../../").activities.Func;
var Block = require("../../").activities.Block;
var activityMarkup = require("../../").activities.activityMarkup;
var ActivityExecutionEngine = require("../../").activities.ActivityExecutionEngine;
var _ = require("lodash");
var ConsoleTracker = require("../../").activities.ConsoleTracker;
var WorkflowHost = require("../../").hosting.WorkflowHost;
var InstanceIdParser = require("../../").hosting.InstanceIdParser;

var assert = require("assert");

describe("ActivityExecutionEngine", function () {
    describe("Bookmarking", function () {
        it("should handle parallel activities", function (done) {
            var activity = activityMarkup.parse(
                {
                    parallel: {
                        var1: "",
                        displayName: "Root",
                        args: [
                            {
                                block: {
                                    displayName: "Wait Block 1",
                                    args: [
                                        {
                                            waitForBookmark: {
                                                displayName: "Wait 1",
                                                bookmarkName: "bm1"
                                            }
                                        },
                                        {
                                            func: {
                                                displayName: "Func 1",
                                                code: function () {
                                                    return this.var1 += "a";
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                block: {
                                    displayName: "Wait Block 2",
                                    args: [
                                        {
                                            waitForBookmark: {
                                                displayName: "Wait 2",
                                                bookmarkName: "bm2"
                                            }
                                        },
                                        {
                                            func: {
                                                displayName: "Func 2",
                                                code: function () {
                                                    return this.var1 += "b";
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                block: {
                                    displayName: "Resume Block",
                                    args: [
                                        {
                                            resumeBookmark: {
                                                displayName: "Resume 1",
                                                bookmarkName: "bm1"
                                            }
                                        },
                                        {
                                            resumeBookmark: {
                                                displayName: "Resume 2",
                                                bookmarkName: "bm2"
                                            }
                                        },
                                        "bubu"
                                    ]
                                }
                            }
                        ]
                    }
                });

            var engine = new ActivityExecutionEngine(activity);
            //engine.addTracker(new ConsoleTracker());

            engine.invoke().then(
                function (result) {
                    try {
                        assert.ok(_.isArray(result));
                        assert.equal(result.length, 3);
                        assert.equal(result[0], "a");
                        assert.equal(result[1], "ab");
                        assert.equal(result[2], "bubu");
                    }
                    catch (e) {
                        assert.ifError(e);
                    }
                }).nodeify(done);
        });

        it("should handle of picking activities", function (done) {
            var activity = activityMarkup.parse(
                {
                    block: {
                        var1: 0,
                        args: [
                            {
                                parallel: [
                                    {
                                        pick: [
                                            {
                                                block: [
                                                    {
                                                        waitForBookmark: {
                                                            bookmarkName: "foo"
                                                        }
                                                    },
                                                    {
                                                        func: {
                                                            displayName: "Do Not Do This Func",
                                                            code: function () {
                                                                this.var1 = -1;
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                block: [
                                                    {
                                                        waitForBookmark: {
                                                            bookmarkName: "bm"
                                                        }
                                                    },
                                                    {
                                                        func: {
                                                            displayName: "Do This Func",
                                                            code: function () {
                                                                this.var1 = 1;
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        resumeBookmark: {
                                            bookmarkName: "bm"
                                        }
                                    }
                                ]
                            },
                            {
                                func: {
                                    displayName: "Final Func",
                                    code: function () {
                                        return this.var1;
                                    }
                                }
                            }
                        ]
                    }
                });

            var engine = new ActivityExecutionEngine(activity);
            //engine.addTracker(new ConsoleTracker());

            engine.invoke().then(
                function (result) {
                    try {
                        assert.equal(result, 1);
                    }
                    catch (e) {
                        assert.ifError(e);
                    }
                }).nodeify(done);
        });
    });
});