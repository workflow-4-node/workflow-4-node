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

describe("Func", function () {
    it("should run with a synchronous code", function (done) {
        var fop = new Func();
        fop.code = function (obj) {
            return obj.name;
        };

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({name: "Gabor"}).then(
            function (result) {
                assert.equal(result, "Gabor");
            }).nodeify(done);
    });

    it("should run when created from markup", function (done) {
        var fop = activityMarkup.parse(
            {
                func: {
                    code: function (obj) {
                        return obj.name;
                    }
                }
            });

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({name: "Gabor"}).then(
            function (result) {
                assert.equal(result, "Gabor");
            }).nodeify(done);
    });

    it("should run when code is asynchronous", function (done) {
        var fop = new Func();
        fop.code = function (obj) {
            return Promise.resolve(obj.name);
        };

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke({name: "Mezo"}).then(
            function (result) {
                assert.equal(result, "Mezo");
            }).nodeify(done);
    });

    it("should accept external parameters those are functions also", function (done) {
        var expected = {name: "Gabor"};
        var fop = new Func();
        fop.code = function (obj) {
            return obj.name;
        };
        var fopin = new Func();
        fopin.code = function () {
            return expected;
        };

        var engine = new ActivityExecutionEngine(fop);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke(fopin).then(
            function (result) {
                assert.equal(result, expected.name);
            }).nodeify(done);
    });

    it("should work as an agument", function (done) {
        var expected = {name: "Gabor"};

        var fop = activityMarkup.parse(
            {
                func: {
                    args: {
                        func: {
                            code: function () {
                                return expected;
                            }
                        }
                    },
                    code: function (obj) {
                        return obj.name;
                    }
                }
            });

        var engine = new ActivityExecutionEngine(fop);

        engine.invoke().then(
            function (result) {
                assert.equal(result, expected.name);
            }).nodeify(done);
    });
});

describe("Block", function () {
    it("should handle variables well", function (done) {
        var block = new Block();
        block.var1 = 1;
        block.var2 = 2;
        block.var3 = 3;

        var f1 = new Func();
        f1.code = function () {
            return this.set("var3", this.get("var3") + this.get("var1") * 2);
        }

        var f2 = new Func();
        f2.code = function () {
            return this.set("var3", this.get("var3") + this.get("var2") * 3);
        }

        var f3 = new Func();
        f3.code = function () {
            return this.get("var3") * 4;
        }

        var engine = new ActivityExecutionEngine(block);

        engine.invoke(f1, f2, f3).then(
            function (result) {
                var x1 = 1;
                var x2 = 2;
                var x3 = 3;
                x3 += x1 * 2;
                x3 += x2 * 3;
                var r = x3 * 4;
                assert.equal(result, r);
            }).nodeify(done);
    });

    it("can be generated from markup", function (done) {
        var block = activityMarkup.parse(
            {
                block: {
                    var1: 1,
                    var2: {
                        func: {
                            code: function () {
                                return 2;
                            }
                        }
                    },
                    var3: 3,
                    args: [
                        {
                            func: {
                                code: function bubu() {
                                    return this.set("var3", this.get("var3") + this.get("var1") * 2);
                                }
                            }
                        },
                        {
                            func: {
                                code: function kittyfuck() {
                                    return this.set("var3", this.get("var3") + this.get("var2") * 3);
                                }
                            }
                        },
                        {
                            func: {
                                code: function () {
                                    return this.get("var3") * 4;
                                }
                            }
                        }
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result) {
                var x1 = 1;
                var x2 = 2;
                var x3 = 3;
                x3 += x1 * 2;
                x3 += x2 * 3;
                var r = x3 * 4;
                assert.equal(result, r);
            }).nodeify(done);
    });

    it("can be generated from markup string", function (done) {
        var markup = {
            block: {
                var1: 1,
                var2: 2,
                var3: 3,
                args: [
                    {
                        func: {
                            code: function bubu() {
                                return this.set("var3", this.get("var3") + this.get("var1") * 2);
                            }
                        }
                    },
                    {
                        func: {
                            code: function kittyfuck() {
                                return this.set("var3", this.get("var3") + this.get("var2") * 3);
                            }
                        }
                    },
                    {
                        func: {
                            code: function () {
                                return this.get("var3") * 4;
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
            function (result) {
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

describe("Parallel", function () {
    it("should work as expected with sync activities", function (done) {
        var activity = activityMarkup.parse(
            {
                parallel: {
                    var1: "",
                    args: [
                        {
                            func: {
                                code: function () {
                                    return this.add("var1", "a");
                                }
                            }
                        },
                        {
                            func: {
                                code: 'function() { return this.add("var1", "b"); }'
                            }
                        }
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(activity);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke().then(
            function (result) {
                assert.equal(result.length, 2);
                assert.equal(result[0], "a");
                assert.equal(result[1], "ab");
            }).nodeify(done);
    });

    it("should work as expected with async activities", function (done) {
        var activity = activityMarkup.parse(
            {
                parallel: {
                    var1: "",
                    args: [
                        {
                            func: {
                                code: function () {
                                    return this.add("var1", "a");
                                }
                            }
                        },
                        {
                            func: {
                                code: 'function() { return this.add("var1", "b"); }'
                            }
                        },
                        {
                            func: {
                                code: function () {
                                    return Promise.delay(100).then(function () {
                                        return 42;
                                    });
                                }
                            }
                        },
                        {
                            func: {
                                code: function () {
                                    return new Promise(function (resolve, reject) {
                                        setImmediate(function () {
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
        //engine.addTracker(new ConsoleTracker());

        engine.invoke().then(
            function (result) {
                assert.equal(result.length, 4);
                assert.equal(result[0], "a");
                assert.equal(result[1], "ab");
                assert.equal(result[2], 42);
                assert.equal(result[3], 0);
            }).nodeify(done);
    });
});

describe("Pick", function () {
    it("should work as expected with sync activities", function (done) {
        var activity = activityMarkup.parse(
            {
                pick: {
                    var1: "",
                    args: [
                        {
                            func: {
                                code: function () {
                                    return this.add("var1", "a");
                                }
                            }
                        },
                        {
                            func: {
                                code: 'function() { return this.add("var1", "b"); }'
                            }
                        }
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(activity);

        engine.invoke().then(
            function (result) {
                assert.equal(result, "a");
            }).nodeify(done);
    });

    it("should work as expected with async activities", function (done) {
        var activity = activityMarkup.parse(
            {
                pick: [
                    {
                        func: {
                            code: function () {
                                return Promise.delay(100).then(function () {
                                    return 42;
                                });
                            }
                        }
                    },
                    {
                        func: {
                            code: function () {
                                return new Promise(function (resolve, reject) {
                                    setImmediate(function () {
                                        resolve(0);
                                    })
                                });
                            }
                        }
                    }
                ]
            });

        var engine = new ActivityExecutionEngine(activity);

        engine.invoke().then(
            function (result) {
                assert.equal(result, 0);
            }).nodeify(done);
    });
});

describe("Expression", function () {
    it("should multiply two numbers", function (done) {
        var expr = new Expression();
        expr.expr = "this.get('v') * this.get('v')";
        var block = new Block();
        block.v = 2;
        block.args = [expr];

        var engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result) {
                assert.equal(result, 4);
            }).nodeify(done);
    });

    it("should works from markup", function (done) {
        var block = activityMarkup.parse(
            {
                block: {
                    v: 2,
                    args: [
                        "# this.get('v') * this.get('v')"
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result) {
                assert.equal(result, 4);
            }).nodeify(done);
    });
});

describe("While", function () {
    it("should run a basic cycle", function (done) {
        var block = activityMarkup.parse(
            {
                block: {
                    i: 10,
                    j: 0,
                    z: 0,
                    args: [
                        {
                            while: {
                                condition: "# this.get('j') < this.get('i')",
                                body: "# this.postfixInc('j')",
                                "@to": "z"
                            }
                        },
                        "# { j: this.get('j'), z: this.get('z') }"
                    ]
                }
            });

        var engine = new ActivityExecutionEngine(block);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke().then(
            function (result) {
                assert.ok(_.isObject(result));
                assert.equal(result.j, 10);
                assert.equal(result.z, 9);
            }).nodeify(done);
    });
});

describe("If", function () {
    it("should call then body", function (done) {
        var block = activityMarkup.parse({
            block: {
                v: 5,
                args: [
                    {
                        if: {
                            condition: "# this.get('v') == 5",
                            thenBody: {
                                func: {
                                    args: [1],
                                    code: function (a) {
                                        return a + this.get('v');
                                    }
                                }
                            },
                            elseBody: {
                                func: {
                                    args: [2],
                                    code: function (a) {
                                        return a + this.get('v');
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        });

        var engine = new ActivityExecutionEngine(block);
        engine.invoke().then(
            function (result) {
                assert.equal(1 + 5, result);
            }).nodeify(done);
    });

    it("should call else body", function (done) {
        var block = activityMarkup.parse({
            block: {
                v: 5,
                r: 0,
                args: [
                    {
                        if: {
                            condition: {
                                func: {
                                    code: function() { return false; }
                                }
                            },
                            thenBody: {
                                func: {
                                    args: [1],
                                    code: function (a) {
                                        this.set("r", a + this.get("v"));
                                    }
                                }
                            },
                            elseBody: {
                                func: {
                                    args: [2],
                                    code: function (a) {
                                        this.set("r", a + this.get("v"));
                                    }
                                }
                            }
                        }
                    },
                    "# this.get('r')"
                ]
            }
        });

        var engine = new ActivityExecutionEngine(block);
        engine.invoke().then(
            function (result) {
                assert.equal(2 + 5, result);
            }).nodeify(done);
    });
});
