function TrackingParticipant(impl)
{
    this._impl = impl;
}

TrackingParticipant.prototype.activityStateChanged = function (activity, reason, result)
{
    if (typeof this._impl.activityStateChanged == "function")
    {
        this._impl.activityStateChanged.call(this._impl, activity, reason, result);
    }
}

module.exports = TrackingParticipant;
