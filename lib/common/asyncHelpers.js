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

    doInLocked: function(task, finalization, renew, renewTimeout)
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
                                    console.error("Cannot renew lock timeout:\n" + e.stack);
                                    if (!done) doRenew();
                                })
                        }
                    },
                    renewTimeout);
            };

            var clearRenew = function ()
            {
                done = true;
                if (is.defined(toId)) clearTimeout(toId);
            };

            task().then(
                function (result)
                {
                    resolve(result);
                    finalization();
//                    setTimeout(function()
//                    {
//                        finalization();
//                    }, 0);
                },
                function (e)
                {
                    clearRenew();
                    reject(e);
                });
        });
    }
}

module.exports = asyncHelpers;