var Activity = require("./activity");
var util = require("util");
var fast = require("fast.js");

function Expression()
{
    Activity.call(this);
    this.expr = null;
    this.nonSerializedProperties.add("_f");
}

util.inherits(Expression, Activity);

Expression.prototype.run = function (callContext, args)
{
    var self = this;
    if (self.expr)
    {
        var e = fast.try(function()
        {
            var f = self._f;
            if (!f)
            {
                self._f = new Function("return (" + self.expr + ")");
                f = self._f;
            }
            self.complete(callContext, f.call(self));
        });

        if (e instanceof Error) self.fail(callContext, e);
    }
    else
    {
        self.complete(callContext, null);
    }
}

module.exports = Expression;
