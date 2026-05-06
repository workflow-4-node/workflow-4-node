"use strict";

let Activity = require("./activity");
let util = require("util");

function WaitForBookmark() {
    Activity.call(this);
    this.bookmarkName = "";
}

util.inherits(WaitForBookmark, Activity);

WaitForBookmark.prototype.run = function (callContext, args) {
    let bookmarkName = this.bookmarkName;

    if (!bookmarkName) {
        callContext.fail(new Error("WaitForBookmark activity's property 'bookmarkName' is not a non-empty string."));
        return;
    }

    callContext.createBookmark(bookmarkName, "_bmReached");
    callContext.idle();
};

WaitForBookmark.prototype._bmReached = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = WaitForBookmark;
