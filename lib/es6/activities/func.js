"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let errors = require("../common/errors");
let guids = require('../common/guids');

function Func() {
    Activity.call(this);
    this.code = null;
    this.codeProperties.add('code');
}

util.inherits(Func, Activity);

Func.prototype.run = function (callContext, args) {
    if (!_.isFunction(this.get("code"))) {
        callContext.fail(new errors.ValidationError("Func activity's property 'code' is not a function."));
        return;
    }

    callContext.schedule(args, "_argsGot");
};

Func.prototype._argsGot = function (callContext, reason, result) {
    let self = this;
    if (reason === Activity.states.complete) {
        try {
            let fResult = self.get("code").apply(self, result || []);
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
        catch(e) {
            callContext.fail(e);
        }
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = Func;