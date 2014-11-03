var guids = require("./guids");
var _ = require("lodash");

var guidLength = guids.markers.activityInstance.length;

var makeSpecString = function (guid, str) {
    return guid + ":" + str;
}

var isSpecString = function (specString) {
    if (_.isString(specString) && specString.length > guidLength + 1 && specString[guidLength] === ":") {
        var il = guids.identity.length;
        for (var i = 0; i < il; i++) {
            if (guids.identity[i] !== specString[i]) return false;
        }
        return true;
    }
    return false;
}

var getGuid = function (specString) {
    if (!isSpecString(specString)) return null;
    return specString.substr(0, guidLength);
}

var getString = function (specString) {
    if (!isSpecString(specString)) return null;
    return specString.substr(guidLength + 1);
}

var splitSpecString = function (specString) {
    if (!isSpecString(specString)) return null;
    return {
        guid: specString.substr(0, guidLength),
        str: specString.substr(guidLength + 1)
    };
}

var makSpecForActivity = function (guid, activityOrId) {
    var id = _.isString(activityOrId) ? activityOrId : activityOrId.id;
    return makeSpecString(guid, id);
}

var specStrings = {
    is: isSpecString,
    getGuid: getGuid,
    getString: getString,
    split: splitSpecString,
    activities: {
        asValueToCollect: function (activityOrId) {
            return makSpecForActivity(guids.markers.valueToCollect, activityOrId);
        },

        createCollectingCompletedBMName: function (activityOrId) {
            return makSpecForActivity(guids.markers.collectingCompletedBookmark, activityOrId);
        },

        createValueCollectedBMName: function (activityOrId) {
            return makSpecForActivity(guids.markers.valueCollectedBookmark, activityOrId);
        }
    },
    hosting: {

        createBeginMethodBMName: function (methodName) {
            return makeSpecString(guids.markers.beginMethodBookmark, methodName);
        },

        createActivityPropertyPart: function (methodName) {
            return makeSpecString(guids.markers.activityProperty, methodName);
        },

        getActivityPropertyName: function (obj) {
            var parts = splitSpecString(obj);
            if (parts && parts.guid === guids.markers.activityProperty) {
                return parts.str;
            }
            return null;
        },

        createActivityInstancePart: function (activityId) {
            return guids.markers.activityInstance + ":" + activityId;
        },

        getActivityId: function (obj) {
            var parts = splitSpecString(obj);
            if (parts && parts.guid === guids.markers.activityInstance) {
                return parts.str;
            }
            return null;
        },

        doubleKeys: function (key1, key2) {
            return key1 + guids.markers.keySeparator + key2;
        }
    }
}

module.exports = specStrings;
