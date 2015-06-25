"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let Guid = require("guid");
var is = require("../common/is");

function ForEach() {
    Activity.call(this);

    this.items = null;
    this.varName = "item";
    this.parallel = false;

    this.nonSerializedProperties.add("_bodies");
}

util.inherits(ForEach, Activity);

ForEach.prototype.initializeStructure = function() {
    if (this.parallel && is.undefined(this._bodies) && this.body instanceof Activity) {
        let numCPUs = require("os").cpus().length;
        this._bodies = [];
        for (let i = 0; i < Math.min(process.env.UV_THREADPOOL_SIZE || 100000, numCPUs); i++) {
            this._bodies.push(this.body.clone());
        }
    }
};

ForEach.prototype.run = function (callContext, args) {
    const varName = this.get("varName");
    let items = this.get("items");
    if (!_.isNull(items)) {
        this.set(varName, null);
        callContext.schedule(items, "_itemsGot");
    }
    else {
        callContext.complete();
    }
};

ForEach.prototype._itemsGot = function (callContext, reason, result) {
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
            let bodies = this.get("_bodies");
            let pack = [];
            let idx = 0;
            while (todo.length && idx < bodies.length) {
                let item = todo[0];
                todo.splice(0, 1);
                let variables = {};
                variables[varName] = item;
                pack.push({
                    variables: variables,
                    activity: bodies[idx++]
                });
            }
            callContext.schedule(pack, "_bodyFinished");
        }
        else {
            let item = todo[0];
            todo.splice(0, 1);
            let variables = {};
            variables[varName] = item;
            callContext.schedule({ activity: body, variables: variables }, "_bodyFinished");
        }
    }
    else {
        callContext.complete(lastResult || body);
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