"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let Guid = require("guid");

function ForEach() {
    Activity.call(this);

    this.from = null;
    this.varName = "item";

    this.nonScopedProperties.add("_doStep");
}

util.inherits(ForEach, Activity);

ForEach.prototype.run = function (callContext, args) {
    const varName = this.get("varName");
    let from = this.get("from");
    if (!_.isNull(from)) {
        this.set(varName, null);
        callContext.schedule(from, "_fromGot");
    }
    else {
        callContext.complete();
    }
};

ForEach.prototype._fromGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete && !_.isUndefined(result)) {
        let todo = _.isArray(result) ? result : [ result ];
        this.set("_todo", result);
        callContext.activity._doStep.call(this, callContext);
    }
    else {
        callContext.to(reason, result);
    }
};

ForEach.prototype._doStep = function (callContext, lastResult) {
    const varName = this.get("varName");
    let todo = this.get("_todo");
    if (todo && todo.length) {
        let item = todo[0];
        todo.splice(0, 1);
        this.set(varName, item);
        callContext.schedule(this.get("body"), "_bodyFinished");
    }
    else {
        callContext.complete(lastResult);
    }
};

ForEach.prototype._bodyFinished = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        callContext.activity._doStep.call(this, callContext, result);
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = ForEach;