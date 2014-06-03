var Q = require("q");

var asyncHelpers = {
    aggressiveRetry: function(promise, until, timeout, timeoutError)
    {
        timeoutError = timeoutError || function() { return new Error("Retry timeout."); };
        var startTime = new Date().getTime();
        var waitTime = 0;
        var waitCount = 0;
        var enter = function ()
        {
            return promise.then(function(result)
            {
                if (!until(result))
                {
                    // Lock has taken elsewhere.
                    if (new Date().getTime() - startTime > timeout) throw timeoutError();
                    var defer = Q.defer();
                    setTimeout(
                        function()
                        {
                            enter().then(
                                function (r)
                                {
                                    defer.resolve(r);
                                },
                                function (e)
                                {
                                    defer.reject(e);
                                });
                        },
                        waitTime);
                    waitTime += ++waitCount * 250;
                    return defer.promise;
                }
                else
                {
                    return result;
                }
            })
        }
        return enter();
    },

    doInTime: function(promise, timeout, timeoutError)
    {
        timeoutError = timeoutError || function() { return new Error("Work timeout."); };
        var startTime = new Date().getTime();
        var done = false;
        var timeouted = false;
        var defer = Q.defer();

        var toId = setTimeout(
            function()
            {
                if (!done)
                {
                    timeouted = true;
                    defer.reject(timeoutError());
                }
            },
            timeout);

        promise.then(
            function (result)
            {
                if (!timeouted) defer.resolve(result);
            },
            function (e)
            {
                if (!timeouted) defer.reject(e);
            }).finally(function()
            {
                done = true;
                clearTimeout(toId);
            });

        return defer.promise;
    }
}

module.exports = asyncHelpers;