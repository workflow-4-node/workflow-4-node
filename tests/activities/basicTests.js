var Expression = require("../../").activities.Expression;
var Func = require("../../").activities.Func;
var Block = require("../../").activities.Block;
var ActivityMarkup = require("../../").activities.ActivityMarkup;
var ActivityExecutionEngine = require("../../").activities.ActivityExecutionEngine;
var _ = require("lodash");
var ConsoleTracker = require("../../").activities.ConsoleTracker;
var WorkflowHost = require("../../").hosting.WorkflowHost;
var InstanceIdParser = require("../../").hosting.InstanceIdParser;
var Promise = require("bluebird");

module.exports = {
    funcSyncTest: function (test)
    {
        var fop = new Func();
        fop.code = function (obj)
        {
            return obj.name;
        };

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Gabor" }).then(
            function (result)
            {
                test.equals(result, "Gabor");
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    funcSyncFromMarkupTest: function (test)
    {
        var activityMarkup = new ActivityMarkup();
        var fop = activityMarkup.parse(
            {
                func: {
                    code: function (obj)
                    {
                        return obj.name;
                    }
                }
            });

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Gabor" }).then(
            function (result)
            {
                test.equals(result, "Gabor");
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    funcAsyncTest: function (test)
    {
        var fop = new Func();
        fop.code = function (obj)
        {
            return Promise.resolve(obj.name);
        };

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Mezo" }).then(
            function (result)
            {
                test.equals(result, "Mezo");
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    funcEmbeddedTest: function (test)
    {
        var expected = { name: "Gabor" };
        var fop = new Func();
        fop.code = function (obj)
        {
            return obj.name;
        };
        var fopin = new Func();
        fopin.code = function ()
        {
            return expected;
        };

        var engine = new ActivityExecutionEngine(fop);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke(fopin).then(
            function (result)
            {
                test.equals(result, expected.name);
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    funcEmbeddedFromMarkupTest: function (test)
    {
        var activityMarkup = new ActivityMarkup();
        var expected = { name: "Gabor" };

        var fop = activityMarkup.parse(
            {
                func: {
                    args: {
                        func: {
                            code: function ()
                            {
                                return expected;
                            }
                        }
                    },
                    code: function (obj)
                    {
                        return obj.name;
                    }
                }
            });

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke().then(
            function (result)
            {
                test.equals(result, expected.name);
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    blockTest: function (test)
    {
        var block = new Block();
        block.var1 = 1;
        block.var2 = 2;
        block.var3 = 3;

        var f1 = new Func();
        f1.code = function ()
        {
            return this.var3 += this.var1 * 2;
        }

        var f2 = new Func();
        f2.code = function ()
        {
            return this.var3 += this.var2 * 3;
        }

        var f3 = new Func();
        f3.code = function ()
        {
            return this.var3 * 4;
        }

        var engine = new ActivityExecutionEngine(block);

        engine.invoke(f1, f2, f3).then(
            function (result)
            {
                var x1 = 1;
                var x2 = 2;
                var x3 = 3;
                x3 += x1 * 2;
                x3 += x2 * 3;
                var r = x3 * 4;
                test.equals(result, r);
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    blockFromMarkupTest: function (test)
    {
        var activityMarkup = new ActivityMarkup();
        var block = activityMarkup.parse(
            {
                block: {
                    var1: 1,
                    var2: 2,
                    var3: 3,
                    args: [
                        {
                            func: {
                                code: function bubu()
                                {
                                    return this.var3 += this.var1 * 2;
                                }
                            }
                        },
                        {
                            func: {
                                code: function kittyfuck()
                                {
                                    return this.var3 += this.var2 * 3;
                                }
                            }
                        },
                        {
                            func: {
                                code: function ()
                                {
                                    return this.var3 * 4;
                                }
                            }
                        }
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result)
            {
                var x1 = 1;
                var x2 = 2;
                var x3 = 3;
                x3 += x1 * 2;
                x3 += x2 * 3;
                var r = x3 * 4;
                test.equals(result, r);
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    blockFromStringMarkupTest: function (test)
    {
        var activityMarkup = new ActivityMarkup();

        var markup = {
            block: {
                var1: 1,
                var2: 2,
                var3: 3,
                args: [
                    {
                        func: {
                            code: function ()
                            {
                                return this.var3 += this.var1 * 2;
                            }
                        }
                    },
                    {
                        func: {
                            code: function ()
                            {
                                return this.var3 += this.var2 * 3;
                            }
                        }
                    },
                    {
                        func: {
                            code: function ()
                            {
                                return this.var3 * 4;
                            }
                        }
                    }
                ]
            }
        };

        var markupString = activityMarkup.stringify(markup);
        var block = activityMarkup.parse(markupString);

        var engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result)
            {
                var x1 = 1;
                var x2 = 2;
                var x3 = 3;
                x3 += x1 * 2;
                x3 += x2 * 3;
                var r = x3 * 4;
                test.equals(result, r);
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    parallelTest: function (test)
    {
        var activityMarkup = new ActivityMarkup();
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
                        }
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(activity);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke().then(
            function (result)
            {
                test.equals(result.length, 2);
                test.equals(result[0], "a");
                test.equals(result[1], "ab");
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    pickTest: function (test)
    {
        var activityMarkup = new ActivityMarkup();
        var activity = activityMarkup.parse(
            {
                pick: {
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
                        }
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(activity);

        engine.invoke().then(
            function (result)
            {
                test.equals(result, "a");
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    exprTest: function (test)
    {
        var expr = new Expression();
        expr.expr = "this.v * this.v";
        var block = new Block();
        block.v = 2;
        block.args = [ expr ];

        var engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result)
            {
                test.equals(result, 4);
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    },

    exprMarkupTest: function (test)
    {
        var block = new ActivityMarkup().parse(
            {
                block: {
                    v: 2,
                    args: [
                        "{this.v * this.v}"
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result)
            {
                test.equals(result, 4);
            },
            function (e)
            {
                test.ifError(e);
            }).finally(
            function ()
            {
                test.done();
            });
    }
}
