"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");

function For() {
    Activity.call(this);

    this.from = null;
    this.to = null;
    this.step = 1;
    this.body = null;
    this.varName = "i";

    this.nonScopedProperties.add("_doStep");
}

util.inherits(For, Activity);

For.prototype.run = function (callContext, args) {
    const varName = this.get("varName");
    let from = this.get("from");
    let to = this.get("to");
    let step = this.get("step");
    if (!_.isNull(from) && !_.isNull(to) && !_.isNull(step)) {
        this.set(varName, null);
        callContext.schedule([from, to, step], "_valuesGot");
    }
    else {
        callContext.complete();
    }
};

For.prototype._valuesGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        this.set("_from", result[0]);
        this.set("_to", result[1]);
        this.set("_step", result[2]);
        callContext.activity._doStep.call(this, callContext);
    }
    else {
        callContext.to(reason, result);
    }
};

For.prototype._doStep = function (callContext, lastResult) {
    const varName = this.get("varName");
    let from = this.get("_from");
    let to = this.get("_to");
    let step = this.get("_step");
    if (!_.isNumber(from)) {
        callContext.fail(new TypeError(`"For activity's from value '${from}' is not a number.`));
        return;
    }
    if (!_.isNumber(to)) {
        callContext.fail(new TypeError(`"For activity's to value '${to}' is not a number.`));
        return;
    }
    if (!_.isNumber(step)) {
        callContext.fail(new TypeError(`"For activity's from value '${step}' is not a number.`));
        return;
    }
    let current;
    if (_.isNull(this.get(varName))) {
        current = this.set(varName, from);
    }
    else {
        current = this.set(varName, this.get(varName) + step);
    }
    if (step >= 0 && current >= to) {
        callContext.complete(lastResult);
    }
    else if (step < 0 && current <= to) {
        callContext.complete(lastResult);
    }
    else {
        callContext.schedule(this.get("body"), "_bodyFinished");
    }
};

For.prototype._bodyFinished = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        callContext.activity._doStep.call(this, callContext, result);
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = For;