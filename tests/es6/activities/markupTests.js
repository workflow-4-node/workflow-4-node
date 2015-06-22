var wf4node = require("../../../");
var activityMarkup = wf4node.activities.activityMarkup;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var path = require("path");

var assert = require("assert");

describe("activityMarkup", function () {
    it("should load custom activity type from string", function (done) {
        var activity = activityMarkup.parse({
            block: {
                "@require": path.join(__dirname, "/customActivities/adder"),
                a: 10,
                b: 20,
                c: 30,
                args: [
                    {
                        adder: ["#this.get('a')", "#this.get('b')", "#this.get('c')"]
                    }
                ]
            }
        });

        var engine = new ActivityExecutionEngine(activity);

        engine.invoke()
            .then(
            function (result) {
                assert.equal(result, 10 + 20 + 30);
            }).nodeify(done);
    });

    it("should load custom activity type from array", function (done) {
        var activity = activityMarkup.parse({
            "@require": [ path.join(__dirname, "/customActivities/adder") ],
            block: {
                a: 1,
                b: 2,
                c: 3,
                args: [
                    {
                        adder: ["#this.get('a')", "#this.get('b')", "#this.get('c')"]
                    }
                ]
            }
        });

        var engine = new ActivityExecutionEngine(activity);

        engine.invoke()
            .then(
            function (result) {
                assert.equal(result, 1 + 2 + 3);
            }).nodeify(done);
    });
});