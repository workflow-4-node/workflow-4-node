"use strict";
var Activity = require("./activity");
var util = require("util");
var errors = require("../common/errors");
function ResumeBookmark() {
  Activity.call(this);
  this.bookmarkName = "";
  this.reason = Activity.states.complete;
  this.mustExists = true;
}
ResumeBookmark.validReasons = [Activity.states.complete, Activity.states.fail, Activity.states.cancel];
util.inherits(ResumeBookmark, Activity);
ResumeBookmark.prototype.run = function(callContext, args) {
  var bookmarkName = this.bookmarkName;
  var reason = this.reason;
  if (!bookmarkName) {
    callContext.fail(new errors.ValidationError("Bookmark name expected."));
  }
  if (ResumeBookmark.validReasons.indexOf(reason) === -1) {
    callContext.fail(new errors.ValidationError("Reason value '" + reason + "' is not valid."));
  }
  var result = false;
  if (this.mustExists) {
    callContext.resumeBookmark(bookmarkName, reason, args);
    result = true;
  } else {
    if (callContext.executionContext.isBookmarkExists(bookmarkName)) {
      callContext.resumeBookmark(bookmarkName, reason, args);
      result = true;
    }
  }
  callContext.complete(result);
};
module.exports = ResumeBookmark;

//# sourceMappingURL=resumeBookmark.js.map
