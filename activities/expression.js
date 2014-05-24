var Activity = require("./activity");
var util = require("util");

function Expression()
{
    Activity.call(this);
    this.expr = null;
}

util.inherits(Expression, Activity);

Expression.prototype.run = function (context, args)
{
    if (this.expr)
    {
        try
        {
            var f = new Function("return (" + this.expr + ")");
            this.complete(f.call(this));
        }
        catch (e)
        {
            this.fail(e);
        }
    }
    else
    {
        this.complete(null);
    }
}

module.exports = Expression;