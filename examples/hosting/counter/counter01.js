"use strict";

let wf4node = require("../../../");
let WorkflowHost = wf4node.hosting.WorkflowHost;
let MemoryPersistence = wf4node.hosting.MemoryPersistence;
let Bluebird = require("bluebird");
let async = Bluebird.coroutine;
let _ = require("lodash");

async(function* () {

    let wf = {
        "@workflow": {
            name: "counter",
            i: 0,
            args: [
                {
                    // Methods declared by Method activity
                    "@method": {
                        methodName: "start",
                        // When canCreateInstance is true,
                        // calling this method will create a new instance
                        // by the specified ID if that is not running already
                        canCreateInstance: true,
                        // Access path of the instance ID in method's arguments array
                        instanceIdPath: "[0]"
                    }
                },
                {
                    // Pick executes its arguments in parallel,
                    // and if a branch gets completed,
                    // the others gets cancelled.
                    // So, it will execute the loop until,
                    // the "stop" method gets invoked.
                    // After "stop" the branch gets completed,
                    // and the loop gets cancelled,
                    // so the workflow finishes.
                    "@pick": [
                        {
                            "@while": {
                                condition: true,
                                args: [
                                    {
                                        "@console": [
                                            "%s: %d",
                                            {
                                                "@func": {
                                                    args: { "@instanceData": {} },
                                                    code: function(data) {
                                                        return data.instanceId;
                                                    }
                                                }
                                            },
                                            "= ++this.i"
                                        ]
                                    },
                                    {
                                        // Delay is not a simple timeout.
                                        // In case of delay, the instance goes idle and gets persisted,
                                        // and once the time elapses, a free host will
                                        // load and continue the workflow.
                                        "@delay": {
                                            ms: 1000
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "@method": {
                                methodName: "stop",
                                instanceIdPath: "[0]"
                            }
                        }
                    ]
                }
            ]
        }
    };

    let host = new WorkflowHost({
        // To get delays work, we need a persistence provider:
        persistence: new MemoryPersistence(),
        wakeUpOptions: {
            // This is the instance check interval.
            // A period that host uses to check if there are elapsed delays
            // exists in the persistence store. Once the delay timeout elapses,
            // a host will load and continue the appropriate workflow instances.
            // The default is 5000 ms, but for this example we need a little shorter one.
            interval: 500
        }
    });
    try {
        host.registerWorkflow(wf);

        const instanceId = 1;

        // Start:
        yield host.invokeMethod("counter", "start", instanceId);

        // Wait a while:
        yield Bluebird.delay(10000);

        // Stop:
        yield host.invokeMethod("counter", "stop", instanceId);
    }
    finally {
        host.shutdown();
    }

})();