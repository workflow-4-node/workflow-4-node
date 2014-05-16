var Func = require("../activities/func");
var Block = require("../activities/block");
var ActivityMarkup = require("../activities/activityMarkup");
var WorkflowEngine = require("../activities/workflowEngine");
var Q = require("q");
var _ = require("underscore-node");
var ConsoleTracker = require("../activities/consoleTracker");

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

        var engine = new WorkflowEngine(activity);
        engine.addTracker(new ConsoleTracker());

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

//                    var context = engine._context;
//                    test.equals(_(context._activityStates).keys().length, 2);
//                    test.equals(context._scopeExtenders.length, 0);
//                    test.equals(_(context._bookmarks).keys().length, 0);
//                    test.equals(_(context._scopeParts).keys().length, 0);
//                    test.equals(context._resumeBMQueue.isEmpty(), true);
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
