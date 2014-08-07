var Activity = require("./activity");
var util = require("util");
var errors = require("../common/errors");

function ResumeBookmark()
{
    Activity.call(this);
    this.bookmarkName = "";
    this.reason = Activity.states.complete;
    this.mustExists = true;
}

ResumeBookmark.validReasons = [ Activity.states.complete, Activity.states.fail, Activity.states.cancel ];

util.inherits(ResumeBookmark, Activity);

ResumeBookmark.prototype.run = function (callContext, args)
{
    if (!this.bookmarkName) this.fail(callContext, new errors.ValidationError("Bookmark name expected."));
    if (ResumeBookmark.validReasons.indexOf(this.reason) === -1) this.fail(callContext, new errors.ValidationError("Reason value '" + this.reason + "' is not valid."));

    var result = false;
    if (this.mustExists)
    {
        this.resumeBookmark(callContext, this.bookmarkName, this.reason, args);
        result = true;
    }
    else
    {
        if (callContext.isBookmarkExists(this.bookmarkName))
        {
            this.resumeBookmark(callContext, this.bookmarkName, this.reason, args);
            result = true;
        }
    }

    this.complete(callContext, result);
}

module.exports = ResumeBookmark;
