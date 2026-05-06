var Activity = require("./activity");
var util = require("util");
var Declarator = require("./declarator");
var errors = require("../common/errors");

function Parallel() {
    Declarator.call(this);
}

util.inherits(Parallel, Declarator);

Parallel.prototype.varsDeclared = function (callContext, args) {
    if (args && args.length) {
        callContext.schedule(args, "_argsGot");
    }
    else {
        callContext.complete([]);
    }
}

Parallel.prototype._argsGot = function (callContext, reason, result) {
    callContext.end(reason, result);
}

module.exports = Parallel;