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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzeW5jSGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLEFBQUksRUFBQSxDQUFBLFFBQU8sRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLFVBQVMsQ0FBQyxDQUFDO0FBQ2xDLEFBQUksRUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO0FBRXhCLEFBQUksRUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLFFBQU8sVUFBVSxDQUFDO0FBRTlCLEFBQUksRUFBQSxDQUFBLFlBQVcsRUFBSTtBQUNmLE1BQUksQ0FBRyxNQUFJO0FBRVgsZ0JBQWMsQ0FBRyxDQUFBLEtBQUksQUFBQyxDQVIxQixlQUFjLHNCQUFzQixBQUFDLENBUVYsY0FBVyxTQUFRLENBQUcsQ0FBQSxLQUFJLENBQUcsQ0FBQSxPQUFNLENBQUcsQ0FBQSxZQUFXOzs7OztBQVI1RSxTQUFPLENBQVAsZUFBYyx3QkFBd0IsQUFBZCxDQUF4QixTQUFTLElBQUcsQ0FBRztBQUNULFlBQU8sSUFBRzs7O0FBUVIsdUJBQVcsRUFBSSxDQUFBLFlBQVcsR0FBSyxVQUFVLEFBQUQsQ0FBRztBQUN2QyxtQkFBTyxJQUFJLE1BQUksQUFBQyxDQUFDLGdCQUFlLENBQUMsQ0FBQztZQUN0QyxDQUFDO3NCQUNlLENBQUEsR0FBSSxLQUFHLEFBQUMsRUFBQyxRQUFRLEFBQUMsRUFBQztxQkFDcEIsRUFBQTtzQkFDQyxFQUFBOzs7OztpQkFDRyxDQUFBLFNBQVEsQUFBQyxFQUFDOzttQkFmckMsQ0FBQSxJQUFHLEtBQUs7Ozs7QUFBUixlQUFHLE1BQU0sRUFBSSxDQUFBLENBZ0JFLENBQUMsS0FBSSxBQUFDLENBQUMsTUFBSyxDQUFDLENBaEJHLFVBQXdDLENBQUM7QUFDaEUsaUJBQUk7O0FBZ0JBLGVBQUksR0FBSSxLQUFHLEFBQUMsRUFBQyxRQUFRLEFBQUMsRUFBQyxDQUFBLENBQUksVUFBUSxDQUFBLENBQUksUUFBTTtBQUFHLGtCQUFNLENBQUEsWUFBVyxBQUFDLEVBQUMsQ0FBQztBQUFBOzs7O2lCQUM5RCxDQUFBLFFBQU8sTUFBTSxBQUFDLENBQUMsUUFBTyxDQUFDOztBQWxCekMsZUFBRyxXQUFXLEFBQUMsRUFBQyxDQUFBOzs7O0FBbUJKLG1CQUFPLEVBQUksQ0FBQSxJQUFHLElBQUksQUFBQyxDQUFDLEVBQUUsU0FBUSxDQUFBLENBQUksSUFBRSxDQUFHLEtBQUcsQ0FBQyxDQUFDOzs7OztpQkFDN0IsQ0FBQSxTQUFRLEFBQUMsRUFBQzs7QUFBekIsaUJBQUssRUFwQmpCLENBQUEsSUFBRyxLQUFLLEFBb0I2QixDQUFBOzs7O0FBcEJyQyxlQUFHLFlBQVksRUFzQkEsT0FBSyxBQXRCZSxDQUFBOzs7O0FBQW5DLGlCQUFPLENBQUEsSUFBRyxJQUFJLEFBQUMsRUFBQyxDQUFBOztBQUNtQixJQUMvQixPQUE2QixLQUFHLENBQUMsQ0FBQztFQXFCbEMsQ0F2Qm1ELENBdUJsRDtBQUFBLEFBQ0wsQ0FBQTtBQUVBLEtBQUssUUFBUSxFQUFJLGFBQVcsQ0FBQztBQUFBIiwiZmlsZSI6ImNvbW1vbi9hc3luY0hlbHBlcnMuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbInZhciBCbHVlYmlyZCA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xuXG52YXIgYXN5bmMgPSBCbHVlYmlyZC5jb3JvdXRpbmU7XG5cbnZhciBhc3luY0hlbHBlcnMgPSB7XG4gICAgYXN5bmM6IGFzeW5jLFxuXG4gICAgYWdncmVzc2l2ZVJldHJ5OiBhc3luYyhmdW5jdGlvbiogKGFzeW5jRnVuYywgdW50aWwsIHRpbWVvdXQsIHRpbWVvdXRFcnJvcikge1xuICAgICAgICB0aW1lb3V0RXJyb3IgPSB0aW1lb3V0RXJyb3IgfHwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihcIlJldHJ5IHRpbWVvdXQuXCIpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIHZhciB3YWl0VGltZSA9IDA7XG4gICAgICAgIHZhciB3YWl0Q291bnQgPSAwO1xuICAgICAgICB2YXIgcmVzdWx0ID0geWllbGQgYXN5bmNGdW5jKCk7XG4gICAgICAgIHdoaWxlICghdW50aWwocmVzdWx0KSkge1xuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lID4gdGltZW91dCkgdGhyb3cgdGltZW91dEVycm9yKCk7XG4gICAgICAgICAgICB5aWVsZCBCbHVlYmlyZC5kZWxheSh3YWl0VGltZSk7XG4gICAgICAgICAgICB3YWl0VGltZSA9IE1hdGgubWluKCsrd2FpdENvdW50ICogMjUwLCAzMDAwKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIGFzeW5jRnVuYygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3luY0hlbHBlcnM7Il19
