"use strict";

let wf4node = require("../../../");
let activityMarkup = wf4node.activities.activityMarkup;
let WorkflowHost = wf4node.hosting.WorkflowHost;
let ConsoleTracker = wf4node.activities.ConsoleTracker;
let _ = require("lodash");
let asyncHelpers = wf4node.common.asyncHelpers;
let Bluebird = require("bluebird");
let async = Bluebird.coroutine;
let assert = require("assert");
require("date-utils");
let errors = wf4node.common.errors;

module.exports = {
    doBasicHostTest: async(function* (hostOptions) {
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
                                result: "= this.v[0] * this.v[0]",
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
                                result: "= this.v * 2"
                            }
                        },
                        "some string for wf result but not for the method result"
                    ]
                }
            });

        let error = null;
        let host = new WorkflowHost(hostOptions);
        host.once("error", function(e) {
            error = e;
        });
        try {
            //host.addTracker(new ConsoleTracker());

            host.registerWorkflow(workflow);
            let result = yield (host.invokeMethod("wf", "foo", [5]));

            assert.equal(result, 25);

            // Verify promotedProperties:
            if (hostOptions && hostOptions.persistence) {
                let promotedProperties = yield host.persistence.loadPromotedProperties("wf", 5);
                assert.ok(promotedProperties);
                assert.equal(promotedProperties.v, 25);
                assert.equal(promotedProperties.x, 666);
                assert.equal(_.keys(promotedProperties).length, 2);
            }

            result = yield (host.invokeMethod("wf", "bar", [5]));

            assert.equal(result, 50);
        }
        finally {
            host.shutdown();
        }

        assert.deepEqual(error, null);
    }),

    doCalculatorTest: async(function* (hostOptions) {
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
                                condition: "= this.running",
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
                                                            value: "= this.currentValue + this.inputArgs[0].value",
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
                                                            value: "= this.currentValue - this.inputArgs[0].value",
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
                                                            value: "= this.currentValue * this.inputArgs[0].value",
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
                                                            value: "= this.currentValue / this.inputArgs[0].value",
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
                                                result: "= this.currentValue"
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

        let error = null;
        let host = new WorkflowHost(hostOptions);
        host.once("error", function(e) {
            error = e;
        });

        try {
            host.registerWorkflow(workflow);
            //host.addTracker(new ConsoleTracker());

            let arg = { id: Math.floor((Math.random() * 1000000000) + 1) };

            let result = yield (host.invokeMethod("calculator", "equals", [arg]));
            assert.equal(result, 0);

            arg.value = 55;
            yield (host.invokeMethod("calculator", "add", [arg]));

            if (hostOptions && hostOptions.persistence) {
                host.shutdown();
                host = new WorkflowHost(hostOptions);
                host.once("error", function(e) {
                    error = e;
                });
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
        }
        finally {
            host.shutdown();
        }

        assert.deepEqual(error, null);
    }),

    doDelayTest: async(function* (hostOptions) {
        hostOptions = _.extend(
            {
                enablePromotions: true,
                wakeUpOptions: {
                    interval: 100
                }
            },
            hostOptions);

        var i = 0;
        let workflow = activityMarkup.parse(
            {
                "@workflow": {
                    name: "wf",
                    done: false,
                    "!i": 0,
                    args: {
                        "@while": {
                            condition: "= !this.done",
                            args: {
                                "@pick": [
                                    {
                                        "@method": {
                                            canCreateInstance: true,
                                            methodName: "start",
                                            instanceIdPath: "[0]"
                                        }
                                    },
                                    {
                                        "@block": [
                                            {
                                                "@method": {
                                                    methodName: "stop",
                                                    instanceIdPath: "[0]"
                                                }
                                            },
                                            {
                                                "@assign": {
                                                    to: "done",
                                                    value: true
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "@block": [
                                            {
                                                "@delay": {
                                                    ms: 100
                                                }
                                            },
                                            {
                                                "@assign": {
                                                    to: "i",
                                                    value: "= this.i + 1"
                                                }
                                            },
                                            function() {
                                                i = this.i;
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            });

        let error = null;
        let host = new WorkflowHost(hostOptions);
        host.once("error", function(e) {
            error = e;
        });
        try {
            //host.addTracker(new ConsoleTracker());
            host.registerWorkflow(workflow);

            let id = "1";

            // That should start the workflow:
            let result = yield (host.invokeMethod("wf", "start", id));
            assert(!result);

            // That should do nothing particular, but should work:
            result = yield (host.invokeMethod("wf", "start", id));
            assert(!result);

            // Calling unexisted method should throw:
            try {
                yield (host.invokeMethod("wf", "pupu", id));
                assert(false, "That should throw!");
            }
            catch(e) {
                if (!(e instanceof errors.MethodIsNotAccessibleError)) {
                    throw e;
                }
            }

            // That should do nothing particular, but should work again:
            result = yield (host.invokeMethod("wf", "start", id));
            assert(!result);

            // Let's wait.
            yield Bluebird.delay(250);

            // Verify promotedProperties:
            if (hostOptions && hostOptions.persistence) {
                let promotedProperties = yield host.persistence.loadPromotedProperties("wf", id);
                assert(promotedProperties);
                assert(promotedProperties.i > 0);
                assert.equal(_.keys(promotedProperties).length, 1);
            }
            else {
                assert(i > 0);
            }

            // That should do nothing particular, but should work again:
            result = yield (host.invokeMethod("wf", "start", id));
            assert(!result);

            // Stop:
            result = yield (host.invokeMethod("wf", "stop", id));
            assert(!result);
        }
        finally {
            host.shutdown();
        }

        assert.deepEqual(error, null);
    })
};
