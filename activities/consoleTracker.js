var _ = require("underscore-node");

function ConsoleTracker()
{
}

ConsoleTracker.prototype.activityStateChanged = function (activity, reason, result)
{
    var name = this.getActivityFriendlyName(activity);
    if (result instanceof Error)
    {
        result = result.message;
    }
    else
    {
        if (_.isObject(result)) result = JSON.stringify(result);
        if (_.isString(result) && result.length > 100) result = result.substr(0, 100);
    }
    if (result) result = ", result: " + result; else result = "";
    console.log("Activity '" + name + "' state changed - reason: " + reason + result);
}

ConsoleTracker.prototype.getActivityFriendlyName = function (activity)
{
    return (activity.displayName ? (activity.displayName + " ") : "") + "(" + activity.constructor.name + ":" + activity.id + ")";
}

module.exports = ConsoleTracker;
