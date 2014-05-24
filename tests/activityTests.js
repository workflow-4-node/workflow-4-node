var Expression = require("../activities/expression");
var Func = require("../activities/func");
var Block = require("../activities/block");
var ActivityMarkup = require("../activities/activityMarkup");
var ActivityExecutionEngine = require("../activities/activityExecutionEngine");
var Q = require("q");
var _ = require("underscore-node");
var ConsoleTracker = require("../activities/consoleTracker");

module.exports = {
    basic: {
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
                var d = Q.defer();
                d.resolve(obj.name);
                return d.promise;
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
    },

    bookmarking: {
        parallelTest: function (test)
        {
            var activityMarkup = new ActivityMarkup();
            var activity = activityMarkup.parse(
                {
                    parallel: {
                        var1: "",
                        displayName: "Root",
                        args: [
                            {
                                block: {
                                    displayName: "Wait Block 1",
                                    args: [
                                        {
                                            waitForBookmark: {
                                                displayName: "Wait 1",
                                                bookmarkName: "bm1"
                                            }
                                        },
                                        {
                                            func: {
                                                displayName: "Func 1",
                                                code: function ()
                                                {
                                                    return this.var1 += "a";
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                block: {
                                    displayName: "Wait Block 2",
                                    args: [
                                        {
                                            waitForBookmark: {
                                                displayName: "Wait 2",
                                                bookmarkName: "bm2"
                                            }
                                        },
                                        {
                                            func: {
                                                displayName: "Func 2",
                                                code: function ()
                                                {
                                                    return this.var1 += "b";
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                block: {
                                    displayName: "Resume Block",
                                    args: [
                                        {
                                            resumeBookmark: {
                                                displayName: "Resume 1",
                                                bookmarkName: "bm1"
                                            }
                                        },
                                        {
                                            resumeBookmark: {
                                                displayName: "Resume 2",
                                                bookmarkName: "bm2"
                                            }
                                        },
                                        "bubu"
                                    ]
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
                    try
                    {
                        test.ok(_.isArray(result));
                        test.equals(result.length, 3);
                        test.equals(result[0], "a");
                        test.equals(result[1], "ab");
                        test.equals(result[2], "bubu");
                    }
                    catch (e)
                    {
                        test.ifError(e);
                    }
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
                    block: {
                        var1: 0,
                        args: [
                            {
                                parallel: [
                                    {
                                        pick: [
                                            {
                                                block: [
                                                    {
                                                        waitForBookmark: {
                                                            bookmarkName: "foo"
                                                        }
                                                    },
                                                    {
                                                        func: {
                                                            displayName: "Do Not Do This Func",
                                                            code: function ()
                                                            {
                                                                this.var1 = -1;
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                block: [
                                                    {
                                                        waitForBookmark: {
                                                            bookmarkName: "bm"
                                                        }
                                                    },
                                                    {
                                                        func: {
                                                            displayName: "Do This Func",
                                                            code: function ()
                                                            {
                                                                this.var1 = 1;
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        resumeBookmark: {
                                            bookmarkName: "bm"
                                        }
                                    }
                                ]
                            },
                            {
                                func: {
                                    displayName: "Final Func",
                                    code: function ()
                                    {
                                        return this.var1;
                                    }
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
                    try
                    {
                        test.equals(result, 1);
                    }
                    catch (e)
                    {
                        test.ifError(e);
                    }
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
}