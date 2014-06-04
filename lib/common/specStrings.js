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
            if (_.isString(str) && str.indexOf(":") == guids.markers.valueCollectedBookmark.length)
            {
                var guid = str.substr(0, guids.markers.valueCollectedBookmark.length);
                return guid === guids.markers.valueToCollect ||
                    guid === guids.markers.collectingCompletedBookmark ||
                    guid === guids.markers.valueCollectedBookmark;
            }
            return false;
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
        },
        createActivityMethod: function (methodName)
        {
            return guids.markers.activityMethod + ":" + methodName;
        },
        getActivityMethodName: function (fieldName)
        {
            if (_.isString(str) && str.indexOf(guids.markers.activityMethod) === 0)
            {
                return str.substr(guids.markers.activityMethod.length + 1);
            }
            return null;
        }
    }
}

module.exports = specStrings;
