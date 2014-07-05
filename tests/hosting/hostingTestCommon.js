var ActivityMarkup = require("../../").activities.ActivityMarkup;
var WorkflowHost = require("../../").hosting.WorkflowHost;
var _ = require("lodash");
var asyncHelpers = require("../../lib/common/asyncHelpers");
var async = asyncHelpers.async;
var await = asyncHelpers.await;
var Promise = require("bluebird");

module.exports = {
    doBasicHostTest: async(
        function (test, persistence)
        {
            try
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

                var host = new WorkflowHost(
                    {
                        alwaysLoadState: true,
                        persistence: persistence
                    });

                host.registerWorkflow(workflow);
                var result = await(host.invokeMethod("wf", "foo", [5]));

                test.equals(result, 25);

                // Verify promotedProperties:
                if (persistence)
                {
                    var promotedProperties = await(persistence.loadPromotedProperties("wf", 5));
                    test.ok(promotedProperties);
                    test.equals(promotedProperties.v, 25);
                    test.equals(promotedProperties.x, 666);
                    test.equals(_.keys(promotedProperties).length, 2);
                }

                result = await(host.invokeMethod("wf", "bar", [5]));

                test.equals(result, 50);
            }
            catch (e)
            {
                test.ifError(e);
            }
            finally
            {
                test.done();
            }
        }),

    doCalculatorTest: async(
        function (test, persistence)
        {
            try
            {
                var workflow = new ActivityMarkup().parse(
                {
                    workflow: {
                        name: "calculator",
                        running: true,
                        inputArgs: 0,
                        currentValue: 0,
                        args: [
                            {
                                while: {
                                    condition: "{ this.running }",
                                    body: {
                                        pick: [
                                            {
                                                block: [
                                                    {
                                                        method: {
                                                            displayName: "Add method",
                                                            methodName: "add",
                                                            instanceIdPath: "[0].id",
                                                            canCreateInstance: true,
                                                            "@to": "inputArgs"
                                                        }
                                                    },
                                                    {
                                                        assign: {
                                                            value: "{ this.currentValue + this.inputArgs[0].value }",
                                                            to: "currentValue"
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                block: [
                                                    {
                                                        method: {
                                                            displayName: "Subtract method",
                                                            methodName: "subtract",
                                                            instanceIdPath: "[0].id",
                                                            canCreateInstance: true,
                                                            "@to": "inputArgs"
                                                        }
                                                    },
                                                    {
                                                        assign: {
                                                            value: "{ this.currentValue - this.inputArgs[0].value }",
                                                            to: "currentValue"
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                block: [
                                                    {
                                                        method: {
                                                            displayName: "Multiply method",
                                                            methodName: "multiply",
                                                            instanceIdPath: "[0].id",
                                                            canCreateInstance: true,
                                                            "@to": "inputArgs"
                                                        }
                                                    },
                                                    {
                                                        assign: {
                                                            value: "{ this.currentValue * this.inputArgs[0].value }",
                                                            to: "currentValue"
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                block: [
                                                    {
                                                        method: {
                                                            displayName: "Divide method",
                                                            methodName: "divide",
                                                            instanceIdPath: "[0].id",
                                                            canCreateInstance: true,
                                                            "@to": "inputArgs"
                                                        }
                                                    },
                                                    {
                                                        assign: {
                                                            value: "{ this.currentValue / this.inputArgs[0].value }",
                                                            to: "currentValue"
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                method: {
                                                    displayName: "Equals method",
                                                    methodName: "equals",
                                                    instanceIdPath: "[0].id",
                                                    canCreateInstance: true,
                                                    result: "{ this.currentValue }"
                                                }
                                            },
                                            {
                                                block: [
                                                    {
                                                        method: {
                                                            displayName: "Reset method",
                                                            methodName: "reset",
                                                            instanceIdPath: "[0].id"
                                                        },
                                                        assign: {
                                                            value: false,
                                                            to: "running"
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                });
            }
            catch (e)
            {
                test.ifError(e);
            }
            finally
            {
                test.done();
            }
        })
};
