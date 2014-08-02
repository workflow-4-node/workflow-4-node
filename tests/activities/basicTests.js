var Expression = require("../../").activities.Expression;
var Func = require("../../").activities.Func;
var Block = require("../../").activities.Block;
var activityMarkup = require("../../").activities.activityMarkup;
var ActivityExecutionEngine = require("../../").activities.ActivityExecutionEngine;
var _ = require("lodash");
var ConsoleTracker = require("../../").activities.ConsoleTracker;
var WorkflowHost = require("../../").hosting.WorkflowHost;
var InstanceIdParser = require("../../").hosting.InstanceIdParser;
var Promise = require("bluebird");

var assert = require("assert");

describe("Func", function()
{
    it("should run with a synchronous code", function (done)
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
                assert.equal(result, "Gabor");
            }).nodeify(done);
    });

    it("should run when created from markup", function (done)
    {
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
                assert.equal(result, "Gabor");
            }).nodeify(done);
    });

    it("should run when code is asynchronous", function (done)
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
                assert.equal(result, "Mezo");
            }).nodeify(done);
    });

    it("should accept external parameters those are functions also", function (done)
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
                assert.equal(result, expected.name);
            }).nodeify(done);
    });

    it("should work as an agument", function (done)
    {
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
                assert.equal(result, expected.name);
            }).nodeify(done);
    });
});

describe("Block", function()
{
    it("should handle variables well", function (done)
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
                assert.equal(result, r);
            }).nodeify(done);
    });

    it("can be generated from markup", function (done)
    {
        var block = activityMarkup.parse(
            {
                block: {
                    var1: 1,
                    var2: {
                        func: {
                            code: function()
                            {
                                return 2;
                            }
                        }
                    },
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
                assert.equal(result, r);
            }).nodeify(done);
    });

    it("can be generated from markup string", function (done)
    {
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
        assert.ok(_.isString(markupString));
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
                assert.equal(result, r);
            }).nodeify(done);
    });
});

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
                        }
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(activity);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke().then(
            function (result)
            {
                assert.equal(result.length, 2);
                assert.equal(result[0], "a");
                assert.equal(result[1], "ab");
            }).nodeify(done);
    });
});

describe("Pick", function()
{
    it("should work as expected", function (done)
    {
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
                assert.equal(result, "a");
            }).nodeify(done);
    });
});

describe("Expression", function()
{
    it("should multiply two numbers", function (done)
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
                assert.equal(result, 4);
            }).nodeify(done);
    });

    it("should works from markup", function (done)
    {
        var block = activityMarkup.parse(
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
                assert.equal(result, 4);
            }).nodeify(done);
    });
});

describe("While", function()
{
    it("should run a basic cycle", function (done)
    {
        var block = activityMarkup.parse(
            {
                block: {
                    i: 10,
                    j: 0,
                    z: 0,
                    args: [
                        {
                            while: {
                                condition: "{this.j < this.i}",
                                body: "{this.j++}",
                                "@to": "z"
                            }
                        },
                        "{ { j: this.j, z: this.z } }"
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(block);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke().then(
            function (result)
            {
                assert.ok(_.isObject(result));
                assert.equal(result.j, 10);
                assert.equal(result.z, 9);
            }).nodeify(done);
    });
});
