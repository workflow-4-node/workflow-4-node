/* jshint -W054*/
"use strict";

let Activity = require("./activity");
let util = require("util");

function Expression() {
    Activity.call(this);
    this.expr = null;
    this.nonSerializedProperties.add("_f");
}

util.inherits(Expression, Activity);

Expression.prototype.run = function (callContext, args) {
    let self = this;
    let expr = self.get("expr");
    if (expr) {
        try {
            let f = self.get("_f");
            if (!f) {
                f = self.set("_f", new Function("return (" + expr + ")"));
            }
            callContext.complete(f.call(self));
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
