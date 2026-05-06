"use strict"

/* global describe,it */

;
var wf4node = require("../../../");
var Expression = wf4node.activities.Expression;
var Func = wf4node.activities.Func;
var Block = wf4node.activities.Block;
var activityMarkup = wf4node.activities.activityMarkup;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var _ = require("lodash");
var ConsoleTracker = wf4node.activities.ConsoleTracker;
var WorkflowHost = wf4node.hosting.WorkflowHost;
var InstanceIdParser = wf4node.hosting.InstanceIdParser;
var assert = require("assert");

describe("bookmarking", function () {
    it("should handle parallel activities", function (done) {
        var activity = activityMarkup.parse({
            "@parallel": {
                var1: "",
                displayName: "Root",
                args: [{
                    "@block": {
                        displayName: "Wait Block 1",
                        args: [{
                            "@waitForBookmark": {
                                displayName: "Wait 1",
                                bookmarkName: "bm1"
                            }
                        }, {
                            "@func": {
                                displayName: "Func 1",
                                code: function code() {
                                    return this.var1 += "a";
                                }
                            }
                        }]
                    }
                }, {
                    "@block": {
                        displayName: "Wait Block 2",
                        args: [{
                            "@waitForBookmark": {
                                displayName: "Wait 2",
                                bookmarkName: "bm2"
                            }
                        }, {
                            "@func": {
                                displayName: "Func 2",
                                code: function code() {
                                    return this.var1 += "b";
                                }
                            }
                        }]
                    }
                }, {
                    "@block": {
                        displayName: "Resume Block",
                        args: [{
                            "@resumeBookmark": {
                                displayName: "Resume 1",
                                bookmarkName: "bm1"
                            }
                        }, {
                            "@resumeBookmark": {
                                displayName: "Resume 2",
                                bookmarkName: "bm2"
                            }
                        }, "bubu"]
                    }
                }]
            }
        });

        var engine = new ActivityExecutionEngine(activity);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke().then(function (result) {
            try {
                assert.ok(_.isArray(result));
                assert.equal(result.length, 3);
                assert.equal(result[0], "a");
                assert.equal(result[1], "ab");
                assert.equal(result[2], "bubu");
            } catch (e) {
                assert.ifError(e);
            }
        }).nodeify(done);
    });

    it("should handle of picking activities", function (done) {
        var activity = activityMarkup.parse({
            "@block": {
                var1: 0,
                args: [{
                    "@parallel": [{
                        "@pick": [{
                            "@block": [{
                                "@waitForBookmark": {
                                    bookmarkName: "foo"
                                }
                            }, {
                                "@func": {
                                    displayName: "Do Not Do This Func",
                                    code: function code() {
                                        this.var1 = -1;
                                    }
                                }
                            }]
                        }, {
                            "@block": [{
                                "@waitForBookmark": {
                                    bookmarkName: "bm"
                                }
                            }, {
                                "@func": {
                                    displayName: "Do This Func",
                                    code: function code() {
                                        this.var1 = 1;
                                    }
                                }
                            }]
                        }]
                    }, {
                        "@resumeBookmark": {
                            bookmarkName: "bm"
                        }
                    }]
                }, {
                    "@func": {
                        displayName: "Final Func",
                        code: function code() {
                            return this.var1;
                        }
                    }
                }]
            }
        });

        var engine = new ActivityExecutionEngine(activity);
        //engine.addTracker(new ConsoleTracker());

        engine.invoke().then(function (result) {
            try {
                assert.equal(result, 1);
            } catch (e) {
                assert.ifError(e);
            }
        }).nodeify(done);
    });
});
//# sourceMappingURL=bookmarking.js.map
