var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var errors = require("../common/errors");
var fast = require("fast.js");

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
    if (reason === Activity.states.complete)
    {
        var e = fast.try(function()
        {
            var fResult = self.code.apply(self, result || []);
            if (_.isObject(fResult) && _.isFunction(fResult["then"]))
            {
                fResult.then(
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
        });

        if (e instanceof Error) self.fail(e);
    }
    else
    {
        this.end(reason, result);
    }
}

module.exports = Func;