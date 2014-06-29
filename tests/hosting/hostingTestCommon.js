var ActivityMarkup = require("../../").activities.ActivityMarkup;
var WorkflowHost = require("../../").hosting.WorkflowHost;
var _ = require("lodash");
var asyncHelpers = require("../../lib/common/asyncHelpers");
var async = asyncHelpers.async;
var await = asyncHelpers.await;
var Promise = require("bluebird");

module.exports = {
    doBasicHostTest: function (test, persistence)
    {
        var doIt = async(function ()
        {
            "use strict";

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
        });

        doIt().catch(
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });

    }
};
