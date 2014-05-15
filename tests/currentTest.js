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
        var var1 = "";
        var activityMarkup = new ActivityMarkup();
        var activity = activityMarkup.parse(
            {
                parallel: {
                    diplayName: "Root",
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
                                                var1 += "a";
                                            }
                                        }
                                    }
                                ]}
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
                                                var1 += "b";
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
                                    }
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
                test.equals(var1, "ab");

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
