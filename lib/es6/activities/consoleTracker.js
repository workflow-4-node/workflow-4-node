"use strict";

let _ = require("lodash");
let util = require("util");
let Activity = require("./activity");

function ConsoleTracker() {
}

ConsoleTracker.prototype.activityStateChanged = function (activity, reason, result) {
    let name = activity.toString();
    if (result instanceof Error) {
        result = result.message;
    }
    else {
        if (_.isObject(result)) result = util.inspect(result);
        if (_.isString(result) && result.length > 100) result = result.substr(0, 100);
    }
    if (result) result = ", result: " + result; else result = "";
    let method = reason === Activity.states.fail? "error" : "log";
    console[method]("Activity '" + name + "' state changed - reason: " + reason + result);
};

module.exports = ConsoleTracker;
