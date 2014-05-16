function InitialScope()
{
}

InitialScope.prototype.complete = function (result)
{
    if (this.activity) this.activity.complete.call(this.activity, self, result);
}

InitialScope.prototype.cancel = function ()
{
    if (this.activity) this.activity.cancel.call(this.activity, self);
}

InitialScope.prototype.idle = function ()
{
    if (this.activity) this.activity.idle.call(this.activity, self);
}

InitialScope.prototype.fail = function (e)
{
    if (this.activity) this.activity.fail.call(this.activity, self, e);
}

InitialScope.prototype.end = function (reason, result)
{
    if (this.activity) this.activity.end.call(this.activity, self, reason, result);
}

InitialScope.prototype.schedule = function (obj, endcallback)
{
    if (this.activity) this.activity.schedule.call(this.activity, self, obj, endcallback);
}

InitialScope.prototype.unschedule = function ()
{
    if (this.activity) this.activity.unschedule.call(this.activity, self);
}

InitialScope.prototype.createBookmark = function (name, callback)
{
    if (this.activity) self.createBookmark(this.activity.id, name, callback);
}

InitialScope.prototype.resumeBookmark = function (name, reason, result)
{
    self.resumeBookmarkInternal(name, reason, result);
}

InitialScope.prototype.argCollected = function (context, reason, result, bookmarkName)
{
    if (this.activity) this.activity.argCollected.call(this, context, reason, result, bookmarkName);
}

module.exports = InitialScope;