var Activity = require("./activity");
var util = require("util");
var fast = require("fast.js");

function Expression() {
    Activity.call(this);
    this.expr = null;
    this.nonSerializedProperties.add("_f");
}

util.inherits(Expression, Activity);

Expression.prototype.run = function (callContext, args) {
    var self = this;
    var expr = self.get("expr");
    if (expr) {
        var e = fast.try(function () {
            var f = self.get("_f");
            if (!f) {
                f = self.set("_f", new Function("return (" + expr + ")"));
            }
            callContext.complete(f.call(self));
        });

        if (e instanceof Error) callContext.fail(e);
    }
    else {
        callContext.complete(null);
    }
}

module.exports = Expression;
