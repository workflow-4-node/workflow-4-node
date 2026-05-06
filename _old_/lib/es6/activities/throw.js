"use strict";

let Activity = require("./activity");
let util = require("util");
let errors = require("../common/errors");
let _ = require("lodash");

function Throw() {
    Activity.call(this);

    this.error = null;
}

util.inherits(Throw, Activity);

Throw.prototype.run = function (callContext, args) {
    if (!this.error) {
        if (!_.isUndefined(this.Try_ReThrow)) {
            this.Try_ReThrow = true;
        }
        callContext.complete();
    }
    else {
        callContext.schedule(this.error, "_errorGot");
    }
};

Throw.prototype._errorGot = function(callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    let e;
    if (_.isString(result)) {
        e = new Error(result);
    }
    else if (result instanceof Error) {
        e = result;
    }
    else {
        callContext.complete();
        return;
    }

    if (!_.isUndefined(this.Try_ReThrow)) {
        this.Try_ReThrow = e;
        callContext.complete();
    }
    else {
        callContext.fail(e);
    }
};

module.exports = Throw;