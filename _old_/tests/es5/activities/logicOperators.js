"use strict"

/* global describe,it */

;
var wf4node = require("../../../");
var Func = wf4node.activities.Func;
var activityMarkup = wf4node.activities.activityMarkup;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var assert = require("assert");
var Bluebird = require("bluebird");
var Block = wf4node.activities.Block;
var _ = require("lodash");

describe("Logic Operators", function () {
    describe("Truthy", function () {
        it("should work", function (done) {
            var engine = new ActivityExecutionEngine({
                "@block": {
                    t1: {
                        "@truthy": {
                            value: "a"
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
                            is: "is",
                            isNot: "isNot"
                        }
                    },
                    t4: {
                        "@truthy": {
                            value: null,
                            is: "is",
                            isNot: {
                                "@func": {
                                    code: function code() {
                                        return "isNot";
                                    }
                                }
                            }
                        }
                    },
                    args: [["= this.t1", "= this.t2", "= this.t3", "= this.t4"]]
                }
            });

            engine.invoke().then(function (result) {
                assert.ok(_.isArray(result));
                assert.equal(result[0], true);
                assert.equal(result[1], false);
                assert.equal(result[2], "is");
                assert.equal(result[3], "isNot");
            }).nodeify(done);
        });
    });

    describe("Falsy", function () {
        it("should work", function (done) {
            var engine = new ActivityExecutionEngine({
                "@block": {
                    t1: {
                        "@falsy": {
                            value: "a"
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
                            is: "is",
                            isNot: "isNot"
                        }
                    },
                    t4: {
                        "@falsy": {
                            value: null,
                            is: "= 'is'",
                            isNot: {
                                "@func": {
                                    code: function code() {
                                        return "isNot";
                                    }
                                }
                            }
                        }
                    },
                    args: [["= this.t1", "= this.t2", "= this.t3", "= this.t4"]]
                }
            });

            engine.invoke().then(function (result) {
                assert.ok(_.isArray(result));
                assert.equal(result[0], false);
                assert.equal(result[1], true);
                assert.equal(result[2], "isNot");
                assert.equal(result[3], "is");
            }).nodeify(done);
        });
    });

    describe("Equals", function () {
        it("should work", function (done) {
            var engine = new ActivityExecutionEngine({
                "@block": {
                    a: {
                        "@equals": {
                            value: function value() {
                                return 42;
                            },
                            to: "= 40 + 2 ",
                            is: function is() {
                                return "42";
                            },
                            isNot: "aba"
                        }
                    },
                    b: {
                        "@equals": {
                            value: function value() {
                                return 42;
                            },
                            to: "= 40 + 1 ",
                            is: function is() {
                                return "42";
                            },
                            isNot: "aba"
                        }
                    },
                    args: {
                        a: "= this.a",
                        b: "= this.b"
                    }
                }
            });

            engine.invoke().then(function (result) {
                assert.ok(_.isPlainObject(result));
                assert.equal(result.a, "42");
                assert.equal(result.b, "aba");
            }).nodeify(done);
        });
    });

    describe("NotEquals", function () {
        it("should work", function (done) {
            var engine = new ActivityExecutionEngine({
                "@block": {
                    a: {
                        "@notEquals": {
                            value: function value() {
                                return 42;
                            },
                            to: "= 40 + 2 ",
                            is: function is() {
                                return "42";
                            },
                            isNot: "aba"
                        }
                    },
                    b: {
                        "@notEquals": {
                            value: function value() {
                                return 42;
                            },
                            to: "= 40 + 1 ",
                            is: function is() {
                                return "42";
                            },
                            isNot: "aba"
                        }
                    },
                    args: {
                        a: "= this.a",
                        b: "= this.b"
                    }
                }
            });

            engine.invoke().then(function (result) {
                assert.ok(_.isPlainObject(result));
                assert.equal(result.a, "aba");
                assert.equal(result.b, "42");
            }).nodeify(done);
        });
    });

    describe("Not, And, Or", function () {
        it("should work", function (done) {
            var engine = new ActivityExecutionEngine({
                "@block": {
                    a: {
                        "@and": [true, "bubu", {
                            "@or": ["= true", false]
                        }, {
                            "@not": [{
                                "@and": [true, function () {
                                    return null;
                                }]
                            }]
                        }]
                    },
                    b: {
                        "@and": {
                            args: [{
                                "@or": ["= true", false]
                            }, {
                                "@not": [{
                                    "@and": [true, "= [ 42 ]"]
                                }]
                            }],
                            isFalse: function isFalse() {
                                return Bluebird.delay(100).then(function () {
                                    return 42;
                                });
                            }
                        }
                    },
                    args: {
                        a: "= this.a",
                        b: "= this.b"
                    }
                }
            });

            engine.invoke().then(function (result) {
                assert.ok(_.isPlainObject(result));
                assert.equal(result.a, true);
                assert.equal(result.b, 42);
            }).nodeify(done);
        });
    });
});
//# sourceMappingURL=logicOperators.js.map
