var Promise = require("bluebird");
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var asyncHelpers = {
    async: async,
    await: await,
    aggressiveRetry: async(function(promise, until, timeout, timeoutError)
    {
        timeoutError = timeoutError || function() { return new Error("Retry timeout."); };
        var startTime = new Date().getTime();
        var waitTime = 0;
        var waitCount = 0;
        var result = await(promise);
        while(!until(result))
        {
            if (new Date().getTime() - startTime > timeout) throw timeoutError();
            await(Promise.delay(waitTime));
            waitTime += ++waitCount * 250;
            result = await(promise);
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
                    if (toId !== undefined) clearTimeout(toId);
                });
        });
    }
}

module.exports = asyncHelpers;