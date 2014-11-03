function ActivityStateTracker(impl) {
    this._impl = impl;
}

ActivityStateTracker.prototype.activityStateChanged = function (activity, reason, result) {
    if (typeof this._impl.activityStateChanged === "function" && this.activityStateFilter(activity, reason)) {
        this._impl.activityStateChanged.call(this._impl, activity, reason, result);
    }
}

ActivityStateTracker.prototype.activityStateFilter = function (activity, reason) {
    if (typeof this._impl.activityStateFilter === "function") {
        return this._impl.activityStateFilter(activity, reason);
    }
    else {
        return true;
    }
}

module.exports = ActivityStateTracker;
