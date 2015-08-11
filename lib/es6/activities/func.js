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
    callContext.schedule(args, "_argsGot");
};

Func.prototype._argsGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        this._args = result;
        callContext.schedule(this.code, "_codeGot");
    }
    else {
        callContext.end(reason, result);
    }
};

Func.prototype._codeGot = function (callContext, reason, result) {
    let code = result;
    if (reason === Activity.states.complete) {
        if (!_.isFunction(code)) {
            callContext.fail(new errors.ValidationError("Func activity's property 'code' is not a function."));
            return;
        }

        try {
            let fResult = code.apply(this, (this._args || []).concat(_));
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
        callContext.end(reason, this._args);
    }
};

module.exports = Func;