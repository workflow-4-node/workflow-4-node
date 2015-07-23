"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let guids = require("../common/guids");
let WithBody = require("./withBody");

function Case() {
    WithBody.call(this);

    this.value = null;
}

util.inherits(Case, WithBody);

Case.prototype.run = function (callContext, args) {
    callContext.schedule(this.value, "_valueGot");
};

Case.prototype._valueGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (this.expression === result) {
            WithBody.prototype.run.call(this, callContext);
        }
        else {
            callContext.complete(guids.markers.nope);
        }
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = Case;