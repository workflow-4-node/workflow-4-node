"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let Guid = require("guid");

function ForEach() {
    Activity.call(this);

    this.from = null;
    this.varName = "item";
    this.parallel = false;

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
    let body = this.get("body");
    if (todo && todo.length && body instanceof Activity) {
        if (this.get("parallel")) {
            let f = function*() {
                for (let item of todo) {
                    let variables = {};
                    variables[varName] = item;
                    yield {
                        activity: body,
                        variables: variables
                    };
                }
            };
            callContext.schedule(f, "_bodyFinished");
        }
        else {
            let item = todo[0];
            todo.splice(0, 1);
            this.set(varName, item);
            callContext.schedule(body, "_bodyFinished");
        }
    }
    else {
        callContext.complete(lastResult || body);
    }
};

ForEach.prototype._bodyFinished = function (callContext, reason, result) {
    if (reason === Activity.states.complete && !this.get("parallel")) {
        callContext.activity._doStep.call(this, callContext, result);
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = ForEach;