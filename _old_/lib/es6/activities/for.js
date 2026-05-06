"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let WithBody = require("./withBody");

function For() {
    WithBody.call(this);

    this.from = null;
    this.to = null;
    this.step = 1;
    this.varName = "i";

    this.nonScopedProperties.add("_doStep");
}

util.inherits(For, WithBody);

For.prototype.run = function (callContext, args) {
    const varName = this.varName;
    let from = this.from;
    let to = this.to;
    let step = this.step;
    if (!_.isNull(from) && !_.isNull(to) && !_.isNull(step)) {
        this[varName] = null;
        callContext.schedule([from, to, step], "_valuesGot");
    }
    else {
        callContext.complete();
    }
};

For.prototype._valuesGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        this._from = result[0];
        this._to = result[1];
        this._step = result[2];
        callContext.activity._doStep.call(this, callContext);
    }
    else {
        callContext.to(reason, result);
    }
};

For.prototype._doStep = function (callContext, lastResult) {
    const varName = this.varName;
    let from = this._from;
    let to = this._to;
    let step = this._step;
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
    if (_.isNull(this[varName])) {
        current = this[varName] = from;
    }
    else {
        current = this[varName] = (this[varName] + step);
    }
    if (step >= 0 && current >= to) {
        callContext.complete(lastResult);
    }
    else if (step < 0 && current <= to) {
        callContext.complete(lastResult);
    }
    else {
        WithBody.prototype.run.call(this, callContext);
    }
};

For.prototype.bodyCompleted = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        callContext.activity._doStep.call(this, callContext, result);
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = For;