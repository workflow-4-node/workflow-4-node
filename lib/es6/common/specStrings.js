"use strict";

let guids = require("./guids");
let _ = require("lodash");

let guidLength = guids.markers.activityInstance.length;

function makeSpecString(guid, str) {
    return guid + ":" + str;
}

function isSpecString(specString) {
    if (_.isString(specString) && specString.length > guidLength + 1 && specString[guidLength] === ":") {
        let il = guids.identity.length;
        for (let i = 0; i < il; i++) {
            if (guids.identity[i] !== specString[i]) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function getGuid(specString) {
    if (!isSpecString(specString)) {
        return null;
    }
    return specString.substr(0, guidLength);
}

function getString(specString) {
    if (!isSpecString(specString)) {
        return null;
    }
    return specString.substr(guidLength + 1);
}

function splitSpecString(specString) {
    if (!isSpecString(specString)) {
        return null;
    }
    return {
        guid: specString.substr(0, guidLength),
        str: specString.substr(guidLength + 1)
    };
}

function makSpecForActivity(guid, activityId) {
    if (!_.isString(activityId)) {
        throw new TypeError(`Activity id '${activityId}' is not a string.`);
    }
    return makeSpecString(guid, activityId);
}

let specStrings = {
    is: isSpecString,
    getGuid: getGuid,
    getString: getString,
    split: splitSpecString,
    activities: {
        asValueToCollect: function (activityId) {
            return makSpecForActivity(guids.markers.valueToCollect, activityId);
        },

        createCollectingCompletedBMName: function (activityId) {
            return makSpecForActivity(guids.markers.collectingCompletedBookmark, activityId);
        },

        createValueCollectedBMName: function (activityId) {
            return makSpecForActivity(guids.markers.valueCollectedBookmark, activityId);
        }
    },
    hosting: {

        createBeginMethodBMName: function (methodName) {
            return makeSpecString(guids.markers.beginMethodBookmark, methodName);
        },

        createDelayToMethodName: function (to) {
            return makeSpecString(guids.markers.delayToMethodNamePrefix, to.toString());
        },

        createActivityPropertyPart: function (methodName) {
            return makeSpecString(guids.markers.activityProperty, methodName);
        },

        getActivityPropertyName: function (obj) {
            let parts = splitSpecString(obj);
            if (parts && parts.guid === guids.markers.activityProperty) {
                return parts.str;
            }
            return null;
        },

        createActivityInstancePart: function (activityId) {
            return guids.markers.activityInstance + ":" + activityId;
        },

        getInstanceId: function (obj) {
            let parts = splitSpecString(obj);
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
