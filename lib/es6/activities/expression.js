/* jshint -W054*/
"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let errors = require("../common/errors");

function Expression(expr) {
    Activity.call(this);
    this.expr = expr || null;
    this.nonSerializedProperties.add("_f");
}

util.inherits(Expression, Activity);

Expression.prototype.run = function (callContext, args) {
    let self = this;
    let expr = self.expr;
    if (expr) {
        try {
            let f = self._f;
            if (!f) {
                f = self._f = new Function("_", "return (" + expr + ")");
            }
            let result = f.call(self, _);
            if (result === callContext.activity) {
                let parent = this.$parent;
                if (!parent) {
                    callContext.fail(new errors.ActivityRuntimeError("Exception can't reference itself."));
                    return;
                }
                result = f.call(self.$parent, _);
            }
            callContext.complete(result);
        }
        catch(e) {
            callContext.fail(e);
        }
    }
    else {
        callContext.complete(null);
    }
};

module.exports = Expression;
