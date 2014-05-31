var Expression = require("../../").activities.Expression;
var Func = require("../../").activities.Func;
var Block = require("../../").activities.Block;
var ActivityMarkup = require("../../").activities.ActivityMarkup;
var ActivityExecutionEngine = require("../../").activities.ActivityExecutionEngine;
var Q = require("q");
var _ = require("underscore-node");
var ConsoleTracker = require("../../").activities.ConsoleTracker;
var WorkflowHost = require("../../").hosting.WorkflowHost;
var InstanceIdParser = require("../../").hosting.InstanceIdParser;

module.exports = {
    parallelTest: function (test)
    {
        var activityMarkup = new ActivityMarkup();
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
                                            code: function ()
                                            {
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
                                            code: function ()
                                            {
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
            function (result)
            {
                try
                {
                    test.ok(_.isArray(result));
                    test.equals(result.length, 3);
                    test.equals(result[0], "a");
                    test.equals(result[1], "ab");
                    test.equals(result[2], "bubu");
                }
                catch (e)
                {
                    test.ifError(e);
                }
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    pickTest: function (test)
    {
        var activityMarkup = new ActivityMarkup();
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
                                                        code: function ()
                                                        {
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
                                                        code: function ()
                                                        {
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
                                code: function ()
                                {
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
            function (result)
            {
                try
                {
                    test.equals(result, 1);
                }
                catch (e)
                {
                    test.ifError(e);
                }
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    }
}
