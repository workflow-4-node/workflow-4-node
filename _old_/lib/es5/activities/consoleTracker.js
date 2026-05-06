"use strict";

var _ = require("lodash");
var util = require("util");
var Activity = require("./activity");

function ConsoleTracker() {}

ConsoleTracker.prototype.activityStateChanged = function (args) {
    var activity = args.scope.$activity;
    var reason = args.reason;
    var result = args.result;
    var name = activity.toString();
    if (result instanceof Error) {
        result = result.message;
    } else {
        if (_.isObject(result)) result = util.inspect(result);
        if (_.isString(result) && result.length > 100) result = result.substr(0, 100);
    }
    if (result) result = ", result: " + result;else result = "";
    var method = reason === Activity.states.fail ? "error" : "log";
    console[method]("Activity '" + name + "' state changed - reason: " + reason + result);
};

module.exports = ConsoleTracker;
//# sourceMappingURL=consoleTracker.js.map
