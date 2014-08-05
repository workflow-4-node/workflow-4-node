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

Func.prototype.run = function (callContext, args)
{
    if (typeof this.code != "function")
    {
        this.fail(callContext, new errors.ValidationError("Func activity's property 'code' is not a function."));
        return;
    }

    this.schedule(callContext, args, "_argsGot");
}

Func.prototype._argsGot = function(callContext, reason, result)
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
                        self.complete(callContext, v);
                    },
                    function (e)
                    {
                        self.fail(callContext, v);
                    });
            }
            else
            {
                self.complete(callContext, fResult);
            }
        });

        if (e instanceof Error) self.fail(callContext, e);
    }
    else
    {
        this.end(callContext, reason, result);
    }
}

module.exports = Func;