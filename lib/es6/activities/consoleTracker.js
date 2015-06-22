var _ = require("lodash");

function ConsoleTracker() {
}

ConsoleTracker.prototype.activityStateChanged = function (activity, reason, result) {
    var name = activity.toString();
    if (result instanceof Error) {
        result = result.message;
    }
    else {
        if (_.isObject(result)) result = JSON.stringify(result);
        if (_.isString(result) && result.length > 100) result = result.substr(0, 100);
    }
    if (result) result = ", result: " + result; else result = "";
    console.log("Activity '" + name + "' state changed - reason: " + reason + result);
}

module.exports = ConsoleTracker;
