"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");

function Merge() {
    Activity.call(this);

    this.isTrue = true;
    this.isFalse = false;
}

util.inherits(Merge, Activity);

Merge.prototype.run = function (callContext, args) {
    callContext.schedule(args, "_argsGot");
};

Merge.prototype._argsGot = function (callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    let merged;
    let mergedIsObj = false;
    let mergedIsArray = false;
    for (let item of result) {
        let isObj = _.isPlainObject(item);
        let isArray = _.isArray(item);
        if (isObj || isArray) {
            if (!merged) {
                merged = isObj ? _.cloneDeep(item) : item.slice(0);
                mergedIsObj = isObj;
                mergedIsArray = isArray;
            }
            else if (isObj) {
                if (!mergedIsObj) {
                    callContext.fail(new Error("Object cannot merged with an array."));
                    return;
                }
                _.extend(merged, item);
            }
            else {
                if (!mergedIsArray) {
                    callContext.fail(new Error("Array cannot merged with an object."));
                    return;
                }
                for (let sub of item) {
                    merged.push(sub);
                }
            }
        }
        else {
            callContext.fail(new Error("Only objects and arrays could be merged."));
            return;
        }
    }
    callContext.complete(merged);
};

module.exports = Merge;