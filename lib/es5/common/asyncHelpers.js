"use strict";
var Bluebird = require("bluebird");
var is = require("./is");
var async = Bluebird.coroutine;
var asyncHelpers = {
  async: async,
  aggressiveRetry: async($traceurRuntime.initGeneratorFunction(function $__1(asyncFunc, until, timeout, timeoutError) {
    var startTime,
        waitTime,
        waitCount,
        result;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            timeoutError = timeoutError || function() {
              return new Error("Retry timeout.");
            };
            startTime = new Date().getTime();
            waitTime = 0;
            waitCount = 0;
            $ctx.state = 21;
            break;
          case 21:
            $ctx.state = 2;
            return asyncFunc();
          case 2:
            result = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = (!until(result)) ? 13 : 17;
            break;
          case 13:
            if (new Date().getTime() - startTime > timeout)
              throw timeoutError();
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = 6;
            return Bluebird.delay(waitTime);
          case 6:
            $ctx.maybeThrow();
            $ctx.state = 8;
            break;
          case 8:
            waitTime = Math.min(++waitCount * 250, 3000);
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 10;
            return asyncFunc();
          case 10:
            result = $ctx.sent;
            $ctx.state = 4;
            break;
          case 17:
            $ctx.returnValue = result;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__1, this);
  }))
};
module.exports = asyncHelpers;

//# sourceMappingURL=asyncHelpers.js.map
