//require("./activities");
//require("./hosting");

var Expression = require("../").activities.Expression;
var Func = require("../").activities.Func;
var Block = require("../").activities.Block;
var activityMarkup = require("../").activities.activityMarkup;
var ActivityExecutionEngine = require("../").activities.ActivityExecutionEngine;
var _ = require("lodash");
var ConsoleTracker = require("../").activities.ConsoleTracker;
var WorkflowHost = require("../").hosting.WorkflowHost;
var InstanceIdParser = require("../").hosting.InstanceIdParser;
var Promise = require("bluebird");

describe("Parallel", function()
{
    it("should work as expected", function (done)
    {
        var activity = activityMarkup.parse(
            {
                parallel: {
                    var1: "",
                    args: [
                        {
                            func: {
                                code: function ()
                                {
                                    return this.var1 += "a";
                                }
                            }
                        },
                        {
                            func: {
                                code: 'function() { return this.var1 += "b"; }'
                            }
                        },
                        {
                            func: {
                                code: function ()
                                {
                                    return Promise.delay(100).then(function() { return 42; });
                                }
                            }
                        },
                        {
                            func: {
                                code: function ()
                                {
                                    return new Promise(function(resolve, reject)
                                    {
                                        setImmediate(function()
                                        {
                                            resolve(0);
                                        })
                                    });
                                }
                            }
                        }
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(activity);
        engine.addTracker(new ConsoleTracker());

        engine.invoke().then(
            function (result)
            {
                assert.equal(result.length, 4);
                assert.equal(result[0], "a");
                assert.equal(result[1], "ab");
                assert.equal(result[2], 42);
                assert.equal(result[3], 0);
            }).nodeify(done);
    });
});