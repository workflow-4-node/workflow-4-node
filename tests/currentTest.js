var Func = require("../activities/func");
var Block = require("../activities/block");
var Expression = require("../activities/expression");
var ActivityMarkup = require("../activities/activityMarkup");
var ActivityExecutionEngine = require("../activities/activityExecutionEngine");
var Q = require("q");
var _ = require("underscore-node");
var ConsoleTracker = require("../activities/consoleTracker");
var WorkflowHost = require("../hosting/workflowHost");
var InstanceIdParser = require("../hosting/instanceIdParser");

module.exports = {

    hostTest: function (test)
    {
        var workflow = new ActivityMarkup().parse(
            {
                workflow: {
                    name: "wf",
                    v: null,
                    args: [
                        {
                            assign: {
                                value: {
                                    beginMethod: {
                                        methodName: "foo",
                                        canCreateInstance: true,
                                        instanceIdPath: "[0]"
                                    }
                                },
                                to: "v"
                            }
                        },
                        {
                            assign: {
                                value: {
                                    endMethod: {
                                        methodName: "foo",
                                        result: "{this.v[0] * this.v[0]}"
                                    }
                                },
                                to: "v"
                            }
                        },
                        {
                            beginMethod: {
                                methodName: "bar",
                                instanceIdPath: "[0]"
                            }
                        },
                        {
                            endMethod: {
                                methodName: "bar",
                                result: "{this.v}"
                            }
                        },
                        "some string for wf result but not for the method result"
                    ]
                }
            });

        var host = new WorkflowHost();
        host.registerWorkflow(workflow);
        host.invokeMethod("wf", "foo", [5]).then(
            function (result)
            {
                try
                {
                    test.equals(result, 25);
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
