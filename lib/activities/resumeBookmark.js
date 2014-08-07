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
    if (!this.bookmarkName) callContext.fail(new errors.ValidationError("Bookmark name expected."));
    if (ResumeBookmark.validReasons.indexOf(this.reason) === -1) callContext.fail(new errors.ValidationError("Reason value '" + this.reason + "' is not valid."));

    var result = false;
    if (this.mustExists)
    {
        callContext.resumeBookmark(this.bookmarkName, this.reason, args);
        result = true;
    }
    else
    {
        if (callContext.executionContext.isBookmarkExists(this.bookmarkName))
        {
            callContext.resumeBookmark(this.bookmarkName, this.reason, args);
            result = true;
        }
    }

    callContext.complete(result);
}

module.exports = ResumeBookmark;
