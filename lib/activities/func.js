var Activity = require("./activity");
var util = require("util");
var Q = require("q");
var errors = require("../common/errors");

function Func()
{
    Activity.call(this);
    this.code = null;
}

util.inherits(Func, Activity);

Func.prototype.run = function (context, args)
{
    if (typeof this.code != "function")
    {
        this.fail(new errors.ValidationError("Func activity's property 'code' is not a function."));
        return;
    }

    this.schedule(args, "_argsGot");
}

Func.prototype._argsGot = function(context, reason, result)
{
    var self = this;
    if (reason == Activity.states.complete)
    {
        try
        {
            var fResult = this.code.apply(this, result || []);
            if (Q.isPromise(fResult))
            {
                fResult.done(
                    function (v)
                    {
                        self.complete(v);
                    },
                    function (e)
                    {
                        self.fail(v);
                    });
            }
            else
            {
                self.complete(fResult);
            }
        }
        catch (e)
        {
            self.fail(e);
        }
    }
    else
    {
        this.end(reason, result);
    }
}

module.exports = Func;