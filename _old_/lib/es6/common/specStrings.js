"use strict";

let constants = require("./constants");
let _ = require("lodash");

let guidLength = constants.markers.activityInstance.length;

function makeSpecString(guid, str) {
    return guid + ":" + str;
}

function isSpecString(specString) {
    if (_.isString(specString) && specString.length > guidLength + 1 && specString[guidLength] === ":") {
        let il = constants.identity.length;
        for (let i = 0; i < il; i++) {
            if (constants.identity[i] !== specString[i]) {
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
        createCollectingCompletedBMName: function (activityId) {
            return makSpecForActivity(constants.markers.collectingCompletedBookmark, activityId);
        },
        createValueCollectedBMName: function (activityId) {
            return makSpecForActivity(constants.markers.valueCollectedBookmark, activityId);
        }
    },
    hosting: {
        createBeginMethodBMName: function (methodName) {
            return makeSpecString(constants.markers.beginMethodBookmark, methodName);
        },
        createDelayToMethodName: function (id) {
            return makeSpecString(constants.markers.delayToMethodNamePrefix, id);
        },
        createActivityPropertyPart: function (methodName) {
            return makeSpecString(constants.markers.activityProperty, methodName);
        },
        createActivityInstancePart: function (activityId) {
            return constants.markers.activityInstance + ":" + activityId;
        },
        getActivityPropertyName: function (obj) {
            let parts = splitSpecString(obj);
            if (parts && parts.guid === constants.markers.activityProperty) {
                return parts.str;
            }
            return null;
        },
        getInstanceId: function (obj) {
            let parts = splitSpecString(obj);
            if (parts && parts.guid === constants.markers.activityInstance) {
                return parts.str;
            }
            return null;
        },
        isDelayToMethodName: function (obj) {
            let parts = splitSpecString(obj);
            return parts && parts.guid === constants.markers.delayToMethodNamePrefix;
        },
        doubleKeys: function (key1, key2) {
            return key1 + constants.markers.keySeparator + key2;
        }
    }
}

module.exports = specStrings;
