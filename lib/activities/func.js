var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var errors = require("../common/errors");
var fast = require("fast.js");
var guids = require('../common/guids');

function Func() {
    Activity.call(this);
    this.code = null;
    this.codeProperties.add('code');
}

util.inherits(Func, Activity);

Func.prototype.run = function (callContext, args) {
    if (typeof this.get("code") != "function") {
        callContext.fail(new errors.ValidationError("Func activity's property 'code' is not a function."));
        return;
    }

    callContext.schedule(args, "_argsGot");
}

Func.prototype._argsGot = function (callContext, reason, result) {
    var self = this;
    if (reason === Activity.states.complete) {
        var e = fast.try(function () {
            var fResult = self.get("code").apply(self, result || []);
            if (_.isObject(fResult) && _.isFunction(fResult["then"])) {
                fResult.then(
                    function (v) {
                        callContext.complete(v);
                    },
                    function (e) {
                        callContext.fail(v);
                    });
            }
            else {
                callContext.complete(fResult);
            }
        });

        if (e instanceof Error) {
            callContext.fail(e);
        }
    }
    else {
        callContext.end(reason, result);
    }
}

module.exports = Func;