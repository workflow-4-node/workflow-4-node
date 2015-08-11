"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let errors = require("../common/errors");
let guids = require('../common/guids');

function Call() {
    Activity.call(this);
    this.methodName = null;
}

util.inherits(Call, Activity);

Call.prototype.run = function (callContext, args) {
    if (!_.isString(this.methodName)) {
        callContext.fail(new errors.ValidationError("Call activity's property 'methodName' is not a string."));
        return;
    }
    if (!_.isFunction(this[this.methodName])) {
        callContext.fail(new errors.ValidationError("Call activity's property '" + this.methodName + "' is not a function."));
        return;
    }

    callContext.schedule(args, "_argsGot");
};

Call.prototype._argsGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        try {
            let fResult = this[this.methodName].apply(this, (result || []).concat(_));
            if (_.isObject(fResult) && _.isFunction(fResult.then)) {
                fResult.then(
                    function (v) {
                        callContext.complete(v);
                    },
                    function (err) {
                        callContext.fail(err);
                    });
            }
            else {
                callContext.complete(fResult);
            }
        }
        catch (e) {
            callContext.fail(e);
        }
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = Call;