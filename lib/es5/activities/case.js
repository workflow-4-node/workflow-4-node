"use strict";

var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var constants = require("../common/constants");
var WithBody = require("./withBody");

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
        } else {
            callContext.complete(constants.markers.nope);
        }
    } else {
        callContext.end(reason, result);
    }
};

module.exports = Case;
//# sourceMappingURL=case.js.map
