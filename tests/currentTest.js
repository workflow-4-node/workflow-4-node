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
var MemoryPersistence = require("../hosting/memoryPersistence");
var NodeSerializer = require("../common/nodeSerializer");

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

    serializationTests: function(test)
    {
        var ser = new NodeSerializer();
        ser.registerKnownType("workflow-4-node.Func", Func);

        var a = new Func();
        a.code = function() { return "poo" };
        a.pupu = a;

        var s = ser.stringify(a);
        console.log(s);

        var a2 = ser.parse(s);
        //a2.__proto__ = Func.prototype;

        test.done();
    }/*,

    hostTestWOPersistence: function (test)
    {
        doHostTest(test, false);
    },

    hostTestWPersistence: function (test)
    {
        doHostTest(test, true);
    }*/
}
