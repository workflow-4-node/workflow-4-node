var ActivityMarkup = require("../../").activities.ActivityMarkup;
var WorkflowHost = require("../../").hosting.WorkflowHost;
var InstanceIdParser = require("../../").hosting.InstanceIdParser;
var MemoryPersistence = require("../../").hosting.MemoryPersistence;
var _ = require("lodash");

function doBasicHostTest(test, usePersistence)
{
    var workflow = new ActivityMarkup().parse(
        {
            workflow: {
                name: "wf",
                "!v": null,
                "!x": 0,
                args: [
                    {
                        beginMethod: {
                            methodName: "foo",
                            canCreateInstance: true,
                            instanceIdPath: "[0]",
                            "@to": "v"
                        }
                    },
                    {
                        endMethod: {
                            methodName: "foo",
                            result: "{this.v[0] * this.v[0]}",
                            "@to": "v"
                        }
                    },
                    {
                        assign: {
                            value: 666,
                            to: "x"
                        }
                    },
                    {
                        method: {
                            methodName: "bar",
                            instanceIdPath: "[0]",
                            result: "{this.v * 2}"
                        }
                    },
                    "some string for wf result but not for the method result"
                ]
            }
        });

    var persistence = usePersistence ? new MemoryPersistence() : null;
    var host = new WorkflowHost(
        {
            alwaysLoadState: true,
            persistence: persistence
        });

    host.registerWorkflow(workflow);
    host.invokeMethod("wf", "foo", [5]).then(
        function (result)
        {
            try
            {
                test.equals(result, 25);

                // Verify promotedProperties:
                if (persistence)
                {
                    var state = persistence.loadState("wf", 5);
                    test.ok(state);
                    test.ok(state.promotedProperties);
                    test.equals(state.promotedProperties.v, 25);
                    test.equals(state.promotedProperties.x, 666);
                    test.equals(_.keys(state.promotedProperties).length, 2);
                }

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
        }).catch(function (e)
        {
            test.ifError(e);
        }).finally(
        function ()
        {
            test.done();
        });
}

module.exports = {
    instanceIdParserTests: function (test)
    {
        try
        {
            var p = new InstanceIdParser();
            test.equals(p.parse("this", 1), 1);
            test.equals(p.parse("[0]", [1]), 1);
            test.equals(p.parse("[0]", [4,5]), 4);
            test.equals(p.parse("[1].id", [{ id: 1 }, { id: 2 }]), 2);
            test.equals(p.parse("id[0].a", { id: [ { a: "foo" } ] }), "foo");
        }
        catch (e)
        {
            test.ifError(e);
        }
        finally
        {
            test.done();
        }
    },

    basicHostTestWOPersistence: function (test)
    {
        doBasicHostTest(test, false);
    },

    basicHostTestWPersistence: function (test)
    {
        doBasicHostTest(test, true);
    }
}
