var Activity = require("./activity");
var util = require("util");

function WaitForBookmark()
{
    Activity.call(this);
    this.bookmarkName = "";
}

util.inherits(WaitForBookmark, Activity);

WaitForBookmark.prototype.run = function (context, args)
{
    if (!this.bookmarkName)
    {
        this.fail(new Error("WaitForBookmark activity's property 'bookmarkName' is not a non-empty string."));
        return;
    }

    this.createBookmark(this.bookmarkName, "_bmReached");
    this.idle();
}

WaitForBookmark.prototype._bmReached = function(context, reason, result)
{
    this.end(reason, result);
}

module.exports = WaitForBookmark;
