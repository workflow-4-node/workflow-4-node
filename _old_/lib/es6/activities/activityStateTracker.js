"use strict";

function ActivityStateTracker(impl) {
    this._impl = impl;
}

ActivityStateTracker.prototype.activityStateChanged = function (args) {
    if (typeof this._impl.activityStateChanged === "function" && this.activityStateFilter(args)) {
        this._impl.activityStateChanged.call(this._impl, args);
    }
};

ActivityStateTracker.prototype.activityStateFilter = function (args) {
    if (typeof this._impl.activityStateFilter === "function") {
        return this._impl.activityStateFilter(args);
    }
    else {
        return true;
    }
};

module.exports = ActivityStateTracker;
