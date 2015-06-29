"use strict";

let wf4node = require("../../../");
let activityMarkup = wf4node.activities.activityMarkup;
let WorkflowHost = wf4node.hosting.WorkflowHost;
let ConsoleTracker = wf4node.activities.ConsoleTracker;
let _ = require("lodash");
let asyncHelpers = wf4node.common.asyncHelpers;
let Promise = require("bluebird");
let assert = require("assert");

module.exports = {
    doBasicHostTest: Promise.coroutine(
        function* (hostOptions) {
            hostOptions = _.extend(
                {
                    enablePromotions: true
                },
                hostOptions);

            let workflow = activityMarkup.parse(
                {
                    "@workflow": {
                        name: "wf",
                        "!v": null,
                        "!x": 0,
                        args: [
                            {
                                "@beginMethod": {
                                    methodName: "foo",
                                    canCreateInstance: true,
                                    instanceIdPath: "[0]",
                                    "@to": "v"
                                }
                            },
                            {
                                "@endMethod": {
                                    methodName: "foo",
                                    result: "# this.get('v')[0] * this.get('v')[0]",
                                    "@to": "v"
                                }
                            },
                            {
                                "@assign": {
                                    value: 666,
                                    to: "x"
                                }
                            },
                            {
                                "@method": {
                                    methodName: "bar",
                                    instanceIdPath: "[0]",
                                    result: "# this.get('v') * 2"
                                }
                            },
                            "some string for wf result but not for the method result"
                        ]
                    }
                });

            let host = new WorkflowHost(hostOptions);
            //host.addTracker(new ConsoleTracker());

            host.registerWorkflow(workflow);
            let result = yield (host.invokeMethod("wf", "foo", [5]));

            assert.equal(result, 25);

            // Verify promotedProperties:
            if (hostOptions && hostOptions.persistence) {
                let promotedProperties = yield (Promise.resolve(hostOptions.persistence.loadPromotedProperties("wf", 5)));
                assert.ok(promotedProperties);
                assert.equal(promotedProperties.v, 25);
                assert.equal(promotedProperties.x, 666);
                assert.equal(_.keys(promotedProperties).length, 2);
            }

            result = yield (host.invokeMethod("wf", "bar", [5]));

            assert.equal(result, 50);
        }),

    doCalculatorTest: Promise.coroutine(
        function* (hostOptions) {
            let workflow = activityMarkup.parse(
                {
                    "@workflow": {
                        name: "calculator",
                        running: true,
                        inputArgs: null,
                        currentValue: 0,
                        args: [
                            {
                                "@while": {
                                    condition: "# this.get('running')",
                                    args: {
                                        "@pick": [
                                            {
                                                "@block": {
                                                    displayName: "Add block",
                                                    args: [
                                                        {
                                                            "@method": {
                                                                displayName: "Add method",
                                                                methodName: "add",
                                                                instanceIdPath: "[0].id",
                                                                canCreateInstance: true,
                                                                "@to": "inputArgs"
                                                            }
                                                        },
                                                        {
                                                            "@assign": {
                                                                value: "# this.get('currentValue') + this.get('inputArgs')[0].value",
                                                                to: "currentValue"
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                "@block": {
                                                    displayName: "Subtract block",
                                                    args: [
                                                        {
                                                            "@method": {
                                                                displayName: "Subtract method",
                                                                methodName: "subtract",
                                                                instanceIdPath: "[0].id",
                                                                canCreateInstance: true,
                                                                "@to": "inputArgs"
                                                            }
                                                        },
                                                        {
                                                            "@assign": {
                                                                value: "# this.get('currentValue') - this.get('inputArgs')[0].value",
                                                                to: "currentValue"
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                "@block": {
                                                    displayName: "Multiply block",
                                                    args: [
                                                        {
                                                            "@method": {
                                                                displayName: "Multiply method",
                                                                methodName: "multiply",
                                                                instanceIdPath: "[0].id",
                                                                canCreateInstance: true,
                                                                "@to": "inputArgs"
                                                            }
                                                        },
                                                        {
                                                            "@assign": {
                                                                value: "# this.get('currentValue') * this.get('inputArgs')[0].value",
                                                                to: "currentValue"
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                "@block": {
                                                    displayName: "Divide block",
                                                    args: [
                                                        {
                                                            "@method": {
                                                                displayName: "Divide method",
                                                                methodName: "divide",
                                                                instanceIdPath: "[0].id",
                                                                canCreateInstance: true,
                                                                "@to": "inputArgs"
                                                            }
                                                        },
                                                        {
                                                            "@assign": {
                                                                value: "# this.get('currentValue') / this.get('inputArgs')[0].value",
                                                                to: "currentValue"
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                "@method": {
                                                    displayName: "Equals method",
                                                    methodName: "equals",
                                                    instanceIdPath: "[0].id",
                                                    canCreateInstance: true,
                                                    result: "# this.get('currentValue')"
                                                }
                                            },
                                            {
                                                "@block": {
                                                    displayName: "Reset block",
                                                    args: [
                                                        {
                                                            "@method": {
                                                                displayName: "Reset method",
                                                                methodName: "reset",
                                                                instanceIdPath: "[0].id"
                                                            }
                                                        },
                                                        {
                                                            "@assign": {
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

            let host = new WorkflowHost(hostOptions);

            host.registerWorkflow(workflow);
            //host.addTracker(new ConsoleTracker());

            let arg = { id: Math.floor((Math.random() * 1000000000) + 1) };

            let result = yield (host.invokeMethod("calculator", "equals", [arg]));
            assert.equal(result, 0);

            arg.value = 55;
            yield (host.invokeMethod("calculator", "add", [arg]));

            if (hostOptions && hostOptions.persistence) {
                let host = new WorkflowHost(hostOptions);
                host.registerWorkflow(workflow);
            }

            result = yield (host.invokeMethod("calculator", "equals", [arg]));
            assert.equal(result, 55);

            arg.value = 5;
            yield (host.invokeMethod("calculator", "divide", [arg]));
            result = yield (host.invokeMethod("calculator", "equals", [arg]));
            assert.equal(result, 11);

            arg.value = 1;
            yield (host.invokeMethod("calculator", "subtract", [arg]));
            result = yield (host.invokeMethod("calculator", "equals", [arg]));
            assert.equal(result, 10);

            arg.value = 100;
            yield (host.invokeMethod("calculator", "multiply", [arg]));
            result = yield (host.invokeMethod("calculator", "equals", [arg]));
            assert.equal(result, 1000);

            delete arg.value;
            yield (host.invokeMethod("calculator", "reset", [arg]));
            result = yield (host.invokeMethod("calculator", "equals", [arg]));
            assert.equal(result, 0);

            delete arg.value;
            yield (host.invokeMethod("calculator", "reset", [arg]));
        })
};
