var activityMarkup = require("../../").activities.activityMarkup;
var ActivityExecutionEngine = require("../../").activities.ActivityExecutionEngine;

var assert = require("assert");

describe("activityMarkup", function () {
    it("should load custom activity type from string", function (done) {
        var activity = activityMarkup.parse({
            block: {
                "@require": "tests/activities/customActivities/adder",
                a: 10,
                b: 20,
                c: 30,
                args: [
                    {
                        adder: ["#this.a", "#this.b", "#this.c"]
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
            block: {
                "@require": [ "tests/activities/customActivities/adder" ],
                a: 1,
                b: 2,
                c: 3,
                args: [
                    {
                        adder: ["#this.a", "#this.b", "#this.c"]
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