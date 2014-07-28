var Promise = require("bluebird");
var is = require("./is");

var asyncHelpers = {
    aggressiveRetry: Promise.coroutine(function* (asyncFunc, until, timeout, timeoutError)
    {
        timeoutError = timeoutError || function() { return new Error("Retry timeout."); };
        var startTime = new Date().getTime();
        var waitTime = 0;
        var waitCount = 0;
        var result = yield asyncFunc();
        while(!until(result))
        {
            if (new Date().getTime() - startTime > timeout) throw timeoutError();
            if (waitTime) yield Promise.delay(waitTime);
            waitTime += ++waitCount * 250;
            result = yield asyncFunc();
        }
        return result;
    }),

    doInLocked: function(promise, renew, renewTimeout)
    {
        return new Promise(function(resolve,reject)
        {
            var startTime = new Date().getTime();
            var done = false;
            var toId;
            var doRenew = function ()
            {
                toId = setTimeout(
                    function ()
                    {
                        if (!done)
                        {
                            renew.then(
                                function()
                                {
                                    if (!done) doRenew();
                                },
                                function(e)
                                {
                                    // TODO: Log e
                                    if (!done) doRenew();
                                })
                        }
                    },
                    renewTimeout);
            };

            promise.then(
                function (result)
                {
                    resolve(result);
                },
                function (e)
                {
                    reject(e);
                }).finally(function()
                {
                    done = true;
                    if (is.defined(toId)) clearTimeout(toId);
                });
        });
    }
}

module.exports = asyncHelpers;