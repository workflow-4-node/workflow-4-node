"use strict";

let Activity = require("./activity");
let util = require("util");
let Declarator = require("./declarator");
let errors = require("../common/errors");

function Pick() {
    Declarator.call(this);
}

util.inherits(Pick, Declarator);

Pick.prototype.varsDeclared = function (callContext, args) {
    if (args && args.length) {
        this.__collectPick = true;
        callContext.schedule(args, "_argsGot");
    }
    else {
        callContext.complete();
    }
};

Pick.prototype._argsGot = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = Pick;
