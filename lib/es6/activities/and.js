"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");

function And() {
    Activity.call(this);

    this.isTrue = true;
    this.isFalse = false;
}

util.inherits(And, Activity);

And.prototype.run = function (callContext, args) {
    callContext.schedule(args, "_argsGot");
};

And.prototype._argsGot = function(callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    let isTrue = false;
    if (result.length) {
        isTrue = true;
        for (let v of result) {
            isTrue = (v ? true : false) && isTrue;
        }
    }

    if (isTrue) {
        callContext.schedule(this.get("isTrue"), "_done");
    }
    else {
        callContext.schedule(this.get("isFalse"), "_done");
    }
};

And.prototype._done = function(callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = And;