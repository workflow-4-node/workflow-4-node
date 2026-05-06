"use strict";

let wf4node = require("../../../../");
let util = require("util");
let Activity = wf4node.activities.Activity;
let _ = require("lodash");

function Adder() {
    Activity.call(this);
}

util.inherits(Adder, Activity);

Adder.prototype.run = function(callContext, args) {
    callContext.schedule(args, "_argsGot");
};

Adder.prototype._argsGot = function(callContext, reason, result) {
    if (reason == Activity.states.complete) {
        let sum = 0;
        result.forEach(function (a) {
            if (_.isNumber(a)) {
                sum += a;
            }
            else if (_.isArray(a)) {
                sum += _.sum(a);
            }
        });
        callContext.complete(sum);
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = Adder;
