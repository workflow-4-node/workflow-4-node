"use strict";

/* global describe,it */

let wf4node = require("../../../");
let Expression = wf4node.activities.Expression;
let Func = wf4node.activities.Func;
let Block = wf4node.activities.Block;
let activityMarkup = wf4node.activities.activityMarkup;
let ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
let _ = require("lodash");
let ConsoleTracker = wf4node.activities.ConsoleTracker;
let WorkflowHost = wf4node.hosting.WorkflowHost;
let InstanceIdParser = wf4node.hosting.InstanceIdParser;
let Bluebird = require("bluebird");

let assert = require("assert");

describe("Func", function () {
    it("should run with a synchronous code", function (done) {
        let fop = new Func();
        fop.code = function (obj) {
            return obj.name;
        };

        let engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Gabor" }).then(
            function (result) {
                assert.equal(result, "Gabor");
            }).nodeify(done);
    });

    it("should run when created from markup", function (done) {
        let fop = activityMarkup.parse(
            {
                "@func": {
                    code: function (obj) {
                        return obj.name;
                    }
                }
            });

        let engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Gabor" }).then(
            function (result) {
                assert.equal(result, "Gabor");
            }).nodeify(done);
    });

    it("should run when code is asynchronous", function (done) {
        let fop = new Func();
        fop.code = function (obj) {
            return Bluebird.resolve(obj.name);
        };

        let engine = new ActivityExecutionEngine(fop);

        engine.invoke({ name: "Mezo" }).then(
            function (result) {
                assert.equal(result, "Mezo");
            }).nodeify(done);
    });

    it("should accept external parameters those are functions also", function (done) {
        let expected = { name: "Gabor" };
        let fop = new Func();
        fop.code = function (obj) {
            return obj.name;
        };
        let fopin = new Func();
        fopin.code = function () {
            return expected;
        };

        let engine = new ActivityExecutionEngine(fop);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke(fopin).then(
            function (result) {
                assert.equal(result, expected.name);
            }).nodeify(done);
    });

    it("should work as an agument", function (done) {
        let expected = { name: "Gabor" };

        let fop = activityMarkup.parse(
            {
                "@func": {
                    args: {
                        "@func": {
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

        let engine = new ActivityExecutionEngine(fop);

        engine.invoke().then(
            function (result) {
                assert.equal(result, expected.name);
            }).nodeify(done);
    });
});

describe("Block", function () {
    it("should handle variables well", function (done) {
        let block = new Block();
        block.let1 = 1;
        block.let2 = 2;
        block.let3 = 3;

        let f1 = new Func();
        f1.code = function () {
            return this.set("let3", this.get("let3") + this.get("let1") * 2);
        };

        let f2 = new Func();
        f2.code = function () {
            return this.set("let3", this.get("let3") + this.get("let2") * 3);
        };

        let f3 = new Func();
        f3.code = function () {
            return this.get("let3") * 4;
        };

        let engine = new ActivityExecutionEngine(block);

        engine.invoke(f1, f2, f3).then(
            function (result) {
                let x1 = 1;
                let x2 = 2;
                let x3 = 3;
                x3 += x1 * 2;
                x3 += x2 * 3;
                let r = x3 * 4;
                assert.equal(result, r);
            }).nodeify(done);
    });

    it("can be generated from markup", function (done) {
        let block = activityMarkup.parse(
            {
                "@block": {
                    let1: 1,
                    let2: {
                        "@func": {
                            code: function () {
                                return 2;
                            }
                        }
                    },
                    let3: 3,
                    args: [
                        {
                            "@func": {
                                code: function bubu() {
                                    return this.set("let3", this.get("let3") + this.get("let1") * 2);
                                }
                            }
                        },
                        {
                            "@func": {
                                code: function kittyfuck() {
                                    return this.set("let3", this.get("let3") + this.get("let2") * 3);
                                }
                            }
                        },
                        {
                            "@func": {
                                code: function () {
                                    return this.get("let3") * 4;
                                }
                            }
                        }
                    ]
                }
            });

        let engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result) {
                let x1 = 1;
                let x2 = 2;
                let x3 = 3;
                x3 += x1 * 2;
                x3 += x2 * 3;
                let r = x3 * 4;
                assert.equal(result, r);
            }).nodeify(done);
    });

    it("can be generated from markup string", function (done) {
        let markup = {
            "@block": {
                let1: 1,
                let2: 2,
                let3: 3,
                args: [
                    {
                        "@func": {
                            code: function bubu() {
                                return this.set("let3", this.get("let3") + this.get("let1") * 2);
                            }
                        }
                    },
                    {
                        "@func": {
                            code: function kittyfuck() {
                                return this.set("let3", this.get("let3") + this.get("let2") * 3);
                            }
                        }
                    },
                    {
                        "@func": {
                            code: function () {
                                return this.get("let3") * 4;
                            }
                        }
                    }
                ]
            }
        };

        let markupString = activityMarkup.stringify(markup);
        assert.ok(_.isString(markupString));
        let block = activityMarkup.parse(markupString);

        let engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result) {
                let x1 = 1;
                let x2 = 2;
                let x3 = 3;
                x3 += x1 * 2;
                x3 += x2 * 3;
                let r = x3 * 4;
                assert.equal(result, r);
            }).nodeify(done);
    });
});

describe("Parallel", function () {
    it("should work as expected with sync activities", function (done) {
        let activity = activityMarkup.parse(
            {
                "@parallel": {
                    let1: "",
                    args: [
                        {
                            "@func": {
                                code: function () {
                                    return this.add("let1", "a");
                                }
                            }
                        },
                        {
                            "@func": {
                                code: 'function() { return this.add("let1", "b"); }'
                            }
                        }
                    ]
                }
            });

        let engine = new ActivityExecutionEngine(activity);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke().then(
            function (result) {
                assert.equal(result.length, 2);
                assert.equal(result[0], "a");
                assert.equal(result[1], "ab");
            }).nodeify(done);
    });

    it("should work as expected with async activities", function (done) {
        let activity = activityMarkup.parse(
            {
                "@parallel": {
                    let1: "",
                    args: [
                        {
                            "@func": {
                                code: function () {
                                    return this.add("let1", "a");
                                }
                            }
                        },
                        {
                            "@func": {
                                code: 'function() { return this.add("let1", "b"); }'
                            }
                        },
                        {
                            "@func": {
                                code: function () {
                                    return Bluebird.delay(100).then(function () {
                                        return 42;
                                    });
                                }
                            }
                        },
                        {
                            "@func": {
                                code: function () {
                                    return new Bluebird(function (resolve, reject) {
                                        setImmediate(function () {
                                            resolve(0);
                                        });
                                    });
                                }
                            }
                        }
                    ]
                }
            });

        let engine = new ActivityExecutionEngine(activity);
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
        let activity = activityMarkup.parse(
            {
                "@pick": {
                    let1: "",
                    args: [
                        {
                            "@func": {
                                code: function () {
                                    return this.add("let1", "a");
                                }
                            }
                        },
                        {
                            "@func": {
                                code: 'function() { return this.add("let1", "b"); }'
                            }
                        }
                    ]
                }
            });

        let engine = new ActivityExecutionEngine(activity);

        engine.invoke().then(
            function (result) {
                assert.equal(result, "a");
            }).nodeify(done);
    });

    it("should work as expected with async activities", function (done) {
        let activity = activityMarkup.parse(
            {
                "@pick": [
                    {
                        "@func": {
                            code: function () {
                                return Bluebird.delay(100).then(function () {
                                    return 42;
                                });
                            }
                        }
                    },
                    {
                        "@func": {
                            code: function () {
                                return new Bluebird(function (resolve, reject) {
                                    setImmediate(function () {
                                        resolve(0);
                                    });
                                });
                            }
                        }
                    }
                ]
            });

        let engine = new ActivityExecutionEngine(activity);

        engine.invoke().then(
            function (result) {
                assert.equal(result, 0);
            }).nodeify(done);
    });
});

describe("Expression", function () {
    it("should multiply two numbers", function (done) {
        let expr = new Expression();
        expr.expr = "this.get('v') * this.get('v')";
        let block = new Block();
        block.v = 2;
        block.args = [expr];

        let engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result) {
                assert.equal(result, 4);
            }).nodeify(done);
    });

    it("should works from markup", function (done) {
        let block = activityMarkup.parse(
            {
                "@block": {
                    v: 2,
                    args: [
                        "# this.get('v') * this.get('v')"
                    ]
                }
            });

        let engine = new ActivityExecutionEngine(block);

        engine.invoke().then(
            function (result) {
                assert.equal(result, 4);
            }).nodeify(done);
    });
});

describe("If", function () {
    it("should call then", function (done) {
        let block = activityMarkup.parse({
            "@block": {
                v: 5,
                args: [
                    {
                        "@if": {
                            condition: "# this.get('v') == 5",
                            then: {
                                "@func": {
                                    args: [1],
                                    code: function (a) {
                                        return a + this.get('v');
                                    }
                                }
                            },
                            else: {
                                "@func": {
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

        let engine = new ActivityExecutionEngine(block);
        engine.invoke().then(
            function (result) {
                assert.equal(1 + 5, result);
            }).nodeify(done);
    });

    it("should call else", function (done) {
        let block = activityMarkup.parse({
            "@block": {
                v: 5,
                r: 0,
                args: [
                    {
                        "@if": {
                            condition: {
                                "@func": {
                                    code: function () {
                                        return false;
                                    }
                                }
                            },
                            then: {
                                "@func": {
                                    args: [1],
                                    code: function (a) {
                                        this.set("r", a + this.get("v"));
                                    }
                                }
                            },
                            else: {
                                "@func": {
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

        let engine = new ActivityExecutionEngine(block);
        engine.invoke().then(
            function (result) {
                assert.equal(2 + 5, result);
            }).nodeify(done);
    });
});

describe('Logic Operators', function () {
    describe('Truthy', function () {
        it('should work', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    t1: {
                        "@truthy": {
                            value: 'a'
                        }
                    },
                    t2: {
                        "@truthy": {
                            value: null
                        }
                    },
                    t3: {
                        "@truthy": {
                            value: true,
                            is: 'is',
                            isNot: 'isNot'
                        }
                    },
                    t4: {
                        "@truthy": {
                            value: null,
                            is: 'is',
                            isNot: {
                                "@func": {
                                    code: function () {
                                        return 'isNot';
                                    }
                                }
                            }
                        }
                    },
                    args: [
                        ['# this.get("t1")', '# this.get("t2")', '# this.get("t3")', '# this.get("t4")']
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert.ok(_.isArray(result));
                    assert.equal(result[0], true);
                    assert.equal(result[1], false);
                    assert.equal(result[2], 'is');
                    assert.equal(result[3], 'isNot');
                }).nodeify(done);
        });
    });

    describe('Falsy', function () {
        it('should work', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    t1: {
                        "@falsy": {
                            value: 'a'
                        }
                    },
                    t2: {
                        "@falsy": {
                            value: null
                        }
                    },
                    t3: {
                        "@falsy": {
                            value: true,
                            is: 'is',
                            isNot: 'isNot'
                        }
                    },
                    t4: {
                        "@falsy": {
                            value: null,
                            is: '# "is"',
                            isNot: {
                                "@func": {
                                    code: function () {
                                        return 'isNot';
                                    }
                                }
                            }
                        }
                    },
                    args: [
                        ['# this.get("t1")', '# this.get("t2")', '# this.get("t3")', '# this.get("t4")']
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert.ok(_.isArray(result));
                    assert.equal(result[0], false);
                    assert.equal(result[1], true);
                    assert.equal(result[2], 'isNot');
                    assert.equal(result[3], 'is');
                }).nodeify(done);
        });
    });

    describe('Equals', function () {
        it('should work', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    a: {
                        "@equals": {
                            value: function () {
                                return 42;
                            },
                            to: '# 40 + 2 ',
                            is: function () {
                                return '42';
                            },
                            isNot: 'aba'
                        }
                    },
                    b: {
                        "@equals": {
                            value: function () {
                                return 42;
                            },
                            to: '# 40 + 1 ',
                            is: function () {
                                return '42';
                            },
                            isNot: 'aba'
                        }
                    },
                    args: {
                        a: '# this.get("a")',
                        b: '# this.get("b")'
                    }
                }
            });

            engine.invoke().then(
                function (result) {
                    assert.ok(_.isPlainObject(result));
                    assert.equal(result.a, '42');
                    assert.equal(result.b, 'aba');
                }).nodeify(done);
        });
    });

    describe('NotEquals', function () {
        it('should work', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    a: {
                        "@notEquals": {
                            value: function () {
                                return 42;
                            },
                            to: '# 40 + 2 ',
                            is: function () {
                                return '42';
                            },
                            isNot: 'aba'
                        }
                    },
                    b: {
                        "@notEquals": {
                            value: function () {
                                return 42;
                            },
                            to: '# 40 + 1 ',
                            is: function () {
                                return '42';
                            },
                            isNot: 'aba'
                        }
                    },
                    args: {
                        a: '# this.get("a")',
                        b: '# this.get("b")'
                    }
                }
            });

            engine.invoke().then(
                function (result) {
                    assert.ok(_.isPlainObject(result));
                    assert.equal(result.a, 'aba');
                    assert.equal(result.b, '42');
                }).nodeify(done);
        });
    });

    describe('Not, And, Or', function () {
        it('should work', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    a: {
                        "@and": [
                            true,
                            'bubu',
                            {
                                "@or": [
                                    '# true',
                                    false
                                ]
                            },
                            {
                                "@not": [
                                    {
                                        "@and": [
                                            true,
                                            function () {
                                                return null;
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    b: {
                        "@and": {
                            args: [
                                {
                                    "@or": [
                                        '# true',
                                        false
                                    ]
                                },
                                {
                                    "@not": [
                                        {
                                            "@and": [
                                                true,
                                                '# [ 42 ]'
                                            ]
                                        }
                                    ]
                                }
                            ],
                            isFalse: function () {
                                return Bluebird.delay(100).then(function () {
                                    return 42;
                                });
                            }
                        }
                    },
                    args: {
                        a: '# this.get("a")',
                        b: '# this.get("b")'
                    }
                }
            });

            engine.invoke().then(
                function (result) {
                    assert.ok(_.isPlainObject(result));
                    assert.equal(result.a, true);
                    assert.equal(result.b, 42);
                }).nodeify(done);
        });
    });
});

describe("Loops", function () {
    describe("While", function () {
        it("should run a basic cycle", function (done) {
            let block = activityMarkup.parse(
                {
                    "@block": {
                        i: 10,
                        j: 0,
                        z: 0,
                        args: [
                            {
                                "@while": {
                                    condition: "# this.get('j') < this.get('i')",
                                    args: "# this.postfixInc('j')",
                                    "@to": "z"
                                }
                            },
                            "# { j: this.get('j'), z: this.get('z') }"
                        ]
                    }
                });

            let engine = new ActivityExecutionEngine(block);
            //engine.addTracker(new ConsoleTracker());

            engine.invoke().then(
                function (result) {
                    assert.ok(_.isObject(result));
                    assert.equal(result.j, 10);
                    assert.equal(result.z, 9);
                }).nodeify(done);
        });
    });

    describe('For', function () {
        it('should work between range 0 and 10 by step 1', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    seq: "",
                    args: [
                        {
                            "@for": {
                                from: 0,
                                to: {
                                    "@func": {
                                        code: function () {
                                            return Bluebird.delay(100).then(function () { return 10; });
                                        }
                                    }
                                },
                                args: "# this.set('seq', this.get('seq') + this.get('i'))"
                            }
                        },
                        "# this.get('seq')"
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert(_.isString(result));
                    assert.equal(result, "0123456789");
                }).nodeify(done);
        });

        it('should work between range 10 downto 4 by step -2', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    seq: "",
                    r: null,
                    args: [
                        {
                            "@for": {
                                from: 10,
                                to: {
                                    "@func": {
                                        code: function () {
                                            return Bluebird.delay(100).then(function () { return 4; });
                                        }
                                    }
                                },
                                step: -2,
                                varName: "klow",
                                args: "# this.set('seq', this.get('seq') + this.get('klow'))",
                                "@to": "r"
                            }
                        },
                        "# { v: this.get('seq'), r: this.get('r') }"
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert(_.isObject(result));
                    assert.equal(result.v, "1086");
                    assert.equal(result.r, "1086");
                }).nodeify(done);
        });
    });

    describe('ForEach', function () {
        it('should work non parallel', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    seq: {
                        "@func": {
                            code: function () {
                                return [1, 2, 3, 4, 5, 6];
                            }
                        }
                    },
                    result: "",
                    args: [
                        {
                            "@forEach": {
                                items: "# this.get('seq')",
                                args: "# this.set('result', this.get('result') + this.get('item'))"
                            }
                        },
                        "# this.get('result')"
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert(_.isString(result));
                    assert.equal(result, "123456");
                }).nodeify(done);
        });

        it('should work parallel non scheduled', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    seq: {
                        "@func": {
                            code: function () {
                                return [1, 2, 3, 4, 5, 6];
                            }
                        }
                    },
                    result: "",
                    args: [
                        {
                            "@forEach": {
                                parallel: true,
                                varName: "klow",
                                items: "# this.get('seq')",
                                args: "# this.set('result', this.get('result') + this.get('klow'))"
                            }
                        },
                        "# this.get('result')"
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert(_.isString(result));
                    assert.equal(result, "123456");
                }).nodeify(done);
        });

        it('should work parallel scheduled', function (done) {
            let engine = new ActivityExecutionEngine({
                "@block": {
                    seq: "function () { return [1, 2, 3, 4, 5, 6]; }",
                    result: [],
                    args: [
                        {
                            "@forEach": {
                                parallel: true,
                                varName: "klow",
                                items: "# this.get('seq')",
                                args: function () {
                                    let self = this;
                                    return Bluebird.delay(Math.random() * 100)
                                        .then(function () {
                                            self.get("result").push(self.get("klow"));
                                        });
                                }
                            }
                        },
                        "# this.get('result')"
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert(_.isArray(result));
                    assert.equal(result.length, 6);
                    assert.equal(_(result).sum(), 6 + 5 + 4 + 3 + 2 + 1);
                }).nodeify(done);
        });
    });
});

describe("Merge", function () {
    it("should merge arrays", function (done) {
        let engine = new ActivityExecutionEngine({
            "@merge": [
                [1, 2, 3],
                "# [4, 5, 6]"
            ]
        });

        engine.invoke().then(
            function (result) {
                assert(_.isArray(result));
                assert.equal(result.length, 6);
                assert.equal(_(result).sum(), 6 + 5 + 4 + 3 + 2 + 1);
            }).nodeify(done);
    });

    it("should merge objects", function (done) {
        let engine = new ActivityExecutionEngine({
            "@merge": [
                { a: function () { return 2; } },
                "# {b: 2}",
                { c: "function() { return 42; }" }
            ]
        });

        engine.invoke().then(
            function (result) {
                assert(_.isObject(result));
                assert.equal(_.keys(result).length, 3);
                assert.equal(result.a, 2);
                assert.equal(result.b, 2);
                assert.equal(result.c, 42);
            }).nodeify(done);
    });
});

describe("switch", function () {
    describe("switch w/ case", function () {
        it("should work w/o default", function (done) {
            let engine = new ActivityExecutionEngine({
                "@switch": {
                    expression: "# 42",
                    args: [
                        {
                            "@case": {
                                value: 43,
                                args: function () {
                                    return "55";
                                }
                            }
                        },
                        {
                            "@case": {
                                value: 42,
                                args: function () {
                                    return "hi";
                                }
                            }
                        },
                        {
                            "@case": {
                                value: "42",
                                args: "# 'boo'"
                            }
                        }
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert.deepEqual(result, "hi");
                }).nodeify(done);
        });

        it("should work w default", function (done) {
            let engine = new ActivityExecutionEngine({
                "@switch": {
                    expression: "# 43",
                    args: [
                        {
                            "@case": {
                                value: 43,
                                args: function () {
                                    return 55;
                                }
                            }
                        },
                        {
                            "@case": {
                                value: 42,
                                args: function () {
                                    return "hi";
                                }
                            }
                        },
                        {
                            "@default": "# 'boo'"
                        }
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert.deepEqual(result, 55);
                }).nodeify(done);
        });

        it("should do its default", function (done) {
            let engine = new ActivityExecutionEngine({
                "@switch": {
                    expression: "# 'klow'",
                    args: [
                        {
                            "@case": {
                                value: 43,
                                args: function () {
                                    return 55;
                                }
                            }
                        },
                        {
                            "@case": {
                                value: 42,
                                args: function () {
                                    return "hi";
                                }
                            }
                        },
                        {
                            "@default": "# 'boo'"
                        }
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert.deepEqual(result, "boo");
                }).nodeify(done);
        });
    });

    describe("switch w/ when", function () {
        it("should work w/o default", function (done) {
            let engine = new ActivityExecutionEngine({
                "@switch": {
                    args: [
                        {
                            "@when": {
                                condition: 0,
                                args: function () {
                                    return "55";
                                }
                            }
                        },
                        {
                            "@when": {
                                condition: function() {
                                    return Bluebird.resolve(42);
                                },
                                args: function () {
                                    return "hi";
                                }
                            }
                        },
                        {
                            "@when": {
                                condition: "42",
                                args: "# 'boo'"
                            }
                        }
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert.deepEqual(result, "hi");
                }).nodeify(done);
        });

        it("should work w default", function (done) {
            let engine = new ActivityExecutionEngine({
                "@switch": {
                    args: [
                        {
                            "@when": {
                                condition: 43,
                                args: function () {
                                    return 55;
                                }
                            }
                        },
                        {
                            "@when": {
                                condition: undefined,
                                args: function () {
                                    return "hi";
                                }
                            }
                        },
                        {
                            "@default": "# 'boo'"
                        }
                    ]
                }
            });

            //engine.addTracker(new ConsoleTracker());

            engine.invoke().then(
                function (result) {
                    assert.deepEqual(result, 55);
                }).nodeify(done);
        });

        it("should do its default", function (done) {
            let engine = new ActivityExecutionEngine({
                "@switch": {
                    args: [
                        {
                            "@when": {
                                condition: "",
                                args: function () {
                                    return 55;
                                }
                            }
                        },
                        {
                            "@when": {
                                condition: null,
                                args: function () {
                                    return "hi";
                                }
                            }
                        },
                        {
                            "@default": "# 'boo'"
                        }
                    ]
                }
            });

            engine.invoke().then(
                function (result) {
                    assert.deepEqual(result, "boo");
                }).nodeify(done);
        });
    });
});