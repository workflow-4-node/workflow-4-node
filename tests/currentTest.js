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
var MemoryPersistence = require("../../").hosting.MemoryPersistence;

function doHostTest(test, usePersistence)
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
                            result: "{this.v * 2}"
                        }
                    },
                    "some string for wf result but not for the method result"
                ]
            }
        });

    var host = new WorkflowHost();
    if (usePersistence) host.persistence = new MemoryPersistence();
    host.registerWorkflow(workflow);
    host.invokeMethod("wf", "foo", [5]).then(
        function (result)
        {
            try
            {
                test.equals(result, 25);
                return host.invokeMethod("wf", "bar", [5]).then(
                    function (result)
                    {
                        test.equals(result, 50);
                    });
            }
            catch (e)
            {
                test.ifError(e);
            }
        }).fail(function (e)
        {
            test.ifError(e);
        }).finally(
        function ()
        {
            test.done();
        });
}

module.exports = {
    hostTestWOPersistence: function (test)
    {
        doHostTest(test, false);
    },

    hostTestWPersistence: function (test)
    {
        doHostTest(test, true);
    }
}
