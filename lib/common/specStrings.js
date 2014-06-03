var guids = require("./guids");
var _ = require("underscore-node");

var specStrings = {
    activities: {
        asValueToCollect: function(activityOrId)
        {
            return specStrings.activities._specForActivity(guids.markers.valueToCollect, activityOrId);
        },

        createCollectingCompletedBMName: function(activityOrId)
        {
            return specStrings.activities._specForActivity(guids.markers.collectingCompletedBookmark, activityOrId);
        },

        createValueCollectedBMName: function(activityOrId)
        {
            return specStrings.activities._specForActivity(guids.markers.valueCollectedBookmark, activityOrId);
        },

        getActivityIdFromSpecString: function(str)
        {
            return str.substr(guids.markers.valueCollectedBookmark.length + 1);
        },

        isActivitySpecString: function(str)
        {
            return _.isString(str) && str.indexOf(":") == guids.markers.valueCollectedBookmark.length;
        },

        _specForActivity: function(prefix, activityOrId)
        {
            var id = _.isString(activityOrId) ? activityOrId : activityOrId.id;
            return prefix + ":" + id;
        }
    },
    hosting: {
        createBeginMethodBMName: function(methodName)
        {
            return methodName + "@" + guids.markers.beginMethodBookmark;
        },
        createCWFLockName: function(workflowName)
        {
            return guids.markers.createWorkflowLock + "_" + workflowName;
        }
    }
}

module.exports = specStrings;
