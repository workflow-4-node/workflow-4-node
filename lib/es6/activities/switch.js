"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let Case = require("./case");
let Default = require("./default");
let errors = require("../common/errors");
let guids = require("../common/guids");

function Switch() {
    Activity.call(this);

    this.expression = null;
}

util.inherits(Switch, Activity);

Switch.prototype.run = function (callContext, args) {
    if (args && args.length) {
        let parts = {
            cases: [],
            default: null
        };
        for (let arg of args) {
            if (arg instanceof Case) {
                parts.cases.push(arg);
            }
            else if (arg instanceof Default) {
                if (parts.default === null) {
                    parts.default = arg;
                }
                else {
                    throw new errors.ActivityRuntimeError("Multiple default for a switch is not allowed.");
                }
            }
        }
        if (parts.cases.length || parts.default) {
            this.set("_parts", parts);
            callContext.schedule(this.get("expression"), "_expressionGot");
            return;
        }
    }
    callContext.complete();
};

Switch.prototype._expressionGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        this.set("expression", result);
        callContext.activity._step.call(this, callContext);
    }
    else {
        callContext.end(reason, result);
    }
};

Switch.prototype._step = function (callContext) {
    let parts = this.get("_parts");
    if (parts.cases.length) {
        let next = parts.cases[0];
        parts.cases.splice(0, 1);
        callContext.schedule(next, "_caseCompleted");
    }
    else if (parts.default) {
        callContext.schedule(parts.default, "_caseCompleted");
    }
    else {
        callContext.complete();
    }
};

Switch.prototype._caseCompleted = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (result === guids.markers.nope) {
            callContext.activity._step.call(this, callContext);
        }
        else {
            callContext.complete(result);
        }
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = Switch;