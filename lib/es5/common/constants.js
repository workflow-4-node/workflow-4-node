"use strict";

var _ = require("lodash");

var maxLen = "collectingCompletedBookmark".length;
var identity = "-:\|$WF4N$|/:-";

function make(name) {
    var inner = _.snakeCase(name).toUpperCase();
    if (inner.length > maxLen) {
        inner = inner.substr(0, maxLen);
    } else while (inner.length < maxLen) {
        inner += "_";
    }
    return identity + inner;
}

var constants = {
    identity: identity,
    markers: {
        valueCollectedBookmark: make("mValueCollectedBookmark"),
        collectingCompletedBookmark: make("mCollectingCompletedBookmark"),
        beginMethodBookmark: make("mBeginMethodBookmark"),
        activityProperty: make("mActivityProperty"),
        activityInstance: make("mActivityInstance"),
        keySeparator: make("mKeySeparator"),
        nope: make("mNope"),
        delayToMethodNamePrefix: make("mDelayToMethodNamePrefix"),
        $parent: make("mParent")
    },
    ids: {
        initialScope: make("mInitialScope")
    },
    types: {
        error: make("mError"),
        schedulingState: make("mSchedulingState"),
        date: make("mDate"),
        set: make("mSet"),
        map: make("mMap"),
        rex: make("mRex"),
        object: make("mObject")
    }
};

module.exports = constants;
//# sourceMappingURL=constants.js.map
