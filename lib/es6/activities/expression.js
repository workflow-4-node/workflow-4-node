/* jshint -W054*/
"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");

function Expression() {
    Activity.call(this);
    this.expr = null;
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
            callContext.complete(f.call(self, _));
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
