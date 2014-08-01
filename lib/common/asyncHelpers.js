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
    })
}

module.exports = asyncHelpers;