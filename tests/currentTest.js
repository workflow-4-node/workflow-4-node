var Func = require("../activities/func");
var Block = require("../activities/block");
var ActivityMarkup = require("../activities/activityMarkup");
var WorkflowEngine = require("../activities/workflowEngine");
var Q = require("q");
var _ = require("underscore-node");
var ConsoleTracker = require("../activities/consoleTracker");

module.exports = {
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

        var engine = new WorkflowEngine(activity);
        engine.addTracker(new ConsoleTracker());

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
