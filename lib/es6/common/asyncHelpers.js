var Promise = require("bluebird");
var is = require("./is");

var async = Promise.coroutine;

var asyncHelpers = {
    async: async,

    aggressiveRetry: async(function* (asyncFunc, until, timeout, timeoutError) {
        timeoutError = timeoutError || function () {
            return new Error("Retry timeout.");
        };
        var startTime = new Date().getTime();
        var waitTime = 0;
        var waitCount = 0;
        var result = yield asyncFunc();
        while (!until(result)) {
            if (new Date().getTime() - startTime > timeout) throw timeoutError();
            yield Promise.delay(waitTime);
            waitTime = Math.min(++waitCount * 250, 3000);
            result = yield asyncFunc();
        }
        return result;
    })
}

module.exports = asyncHelpers;