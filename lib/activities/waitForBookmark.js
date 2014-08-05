var Activity = require("./activity");
var util = require("util");

function WaitForBookmark()
{
    Activity.call(this);
    this.bookmarkName = "";
}

util.inherits(WaitForBookmark, Activity);

WaitForBookmark.prototype.run = function (callContext, args)
{
    if (!this.bookmarkName)
    {
        this.fail(callContext, new Error("WaitForBookmark activity's property 'bookmarkName' is not a non-empty string."));
        return;
    }

    this.createBookmark(callContext, this.bookmarkName, "_bmReached");
    this.idle(callContext);
}

WaitForBookmark.prototype._bmReached = function(callContext, reason, result)
{
    this.end(callContext, reason, result);
}

module.exports = WaitForBookmark;
