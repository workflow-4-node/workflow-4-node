var ActivityMarkup = require("../../").activities.ActivityMarkup;
var WorkflowHost = require("../../").hosting.WorkflowHost;
var ConsoleTracker = require("../../").activities.ConsoleTracker;
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
                            inputArgs: null,
                            currentValue: 0,
                            args: [
                                {
                                    while: {
                                        condition: "{ this.running }",
                                        body: {
                                            pick: [
                                                {
                                                    block: {
                                                        displayName: "Add block",
                                                        args: [
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
                                                    }
                                                },
                                                {
                                                    block: {
                                                        displayName: "Subtract block",
                                                        args: [
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
                                                    }
                                                },
                                                {
                                                    block: {
                                                        displayName: "Multiply block",
                                                        args: [
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
                                                    }
                                                },
                                                {
                                                    block: {
                                                        displayName: "Divide block",
                                                        args: [
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
                                                    }
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
                                                    block: {
                                                        displayName: "Reset block",
                                                        args: [
                                                            {
                                                                method: {
                                                                    displayName: "Reset method",
                                                                    methodName: "reset",
                                                                    instanceIdPath: "[0].id"
                                                                }
                                                            },
                                                            {
                                                                assign: {
                                                                    value: false,
                                                                    to: "running"
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    });

                var host = new WorkflowHost(
                    {
                        alwaysLoadState: true,
                        persistence: persistence
                    });

                host.registerWorkflow(workflow);
                //host.addTracker(new ConsoleTracker());

                var arg = { id: Math.floor((Math.random() * 1000000000) + 1) };

                var result = await(host.invokeMethod("calculator", "equals", [ arg ]));
                test.equals(result, 0);

                arg.value = 55;
                await(host.invokeMethod("calculator", "add", [ arg ]));
                result = await(host.invokeMethod("calculator", "equals", [ arg ]));
                test.equals(result, 55);

                arg.value = 5;
                await(host.invokeMethod("calculator", "divide", [ arg ]));
                result = await(host.invokeMethod("calculator", "equals", [ arg ]));
                test.equals(result, 11);

                arg.value = 1;
                await(host.invokeMethod("calculator", "subtract", [ arg ]));
                result = await(host.invokeMethod("calculator", "equals", [ arg ]));
                test.equals(result, 10);

                arg.value = 100;
                await(host.invokeMethod("calculator", "multiply", [ arg ]));
                result = await(host.invokeMethod("calculator", "equals", [ arg ]));
                test.equals(result, 1000);

                delete arg.value;
                await(host.invokeMethod("calculator", "reset", [ arg ]));
                result = await(host.invokeMethod("calculator", "equals", [ arg ]));
                test.equals(result, 0);

                delete arg.value;
                await(host.invokeMethod("calculator", "reset", [ arg ]));
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
