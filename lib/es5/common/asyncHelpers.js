"use strict";
var Promise = require("bluebird");
var is = require("./is");
var async = Promise.coroutine;
var asyncHelpers = {
  async: async,
  aggressiveRetry: async($traceurRuntime.initGeneratorFunction(function $__0(asyncFunc, until, timeout, timeoutError) {
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
            return Promise.delay(waitTime);
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
    }, $__0, this);
  }))
};
module.exports = asyncHelpers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzeW5jSGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLEFBQUksRUFBQSxDQUFBLE9BQU0sRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLFVBQVMsQ0FBQyxDQUFDO0FBQ2pDLEFBQUksRUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO0FBRXhCLEFBQUksRUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLE9BQU0sVUFBVSxDQUFDO0FBRTdCLEFBQUksRUFBQSxDQUFBLFlBQVcsRUFBSTtBQUNmLE1BQUksQ0FBRyxNQUFJO0FBRVgsZ0JBQWMsQ0FBRyxDQUFBLEtBQUksQUFBQyxDQVIxQixlQUFjLHNCQUFzQixBQUFDLENBUVYsY0FBVyxTQUFRLENBQUcsQ0FBQSxLQUFJLENBQUcsQ0FBQSxPQUFNLENBQUcsQ0FBQSxZQUFXOzs7OztBQVI1RSxTQUFPLENBQVAsZUFBYyx3QkFBd0IsQUFBZCxDQUF4QixTQUFTLElBQUcsQ0FBRztBQUNULFlBQU8sSUFBRzs7O0FBUVIsdUJBQVcsRUFBSSxDQUFBLFlBQVcsR0FBSyxVQUFVLEFBQUQsQ0FBRztBQUN2QyxtQkFBTyxJQUFJLE1BQUksQUFBQyxDQUFDLGdCQUFlLENBQUMsQ0FBQztZQUN0QyxDQUFDO3NCQUNlLENBQUEsR0FBSSxLQUFHLEFBQUMsRUFBQyxRQUFRLEFBQUMsRUFBQztxQkFDcEIsRUFBQTtzQkFDQyxFQUFBOzs7OztBQWR4QixpQkFlMkIsQ0FBQSxTQUFRLEFBQUMsRUFBQyxDQWZkOzttQkFBdkIsQ0FBQSxJQUFHLEtBQUs7Ozs7QUFBUixlQUFHLE1BQU0sRUFBSSxDQUFBLENBZ0JFLENBQUMsS0FBSSxBQUFDLENBQUMsTUFBSyxDQUFDLENBaEJHLFVBQXdDLENBQUM7QUFDaEUsaUJBQUk7O0FBZ0JBLGVBQUksR0FBSSxLQUFHLEFBQUMsRUFBQyxRQUFRLEFBQUMsRUFBQyxDQUFBLENBQUksVUFBUSxDQUFBLENBQUksUUFBTTtBQUFHLGtCQUFNLENBQUEsWUFBVyxBQUFDLEVBQUMsQ0FBQztBQUFBOzs7O0FBakJoRixpQkFrQmtCLENBQUEsT0FBTSxNQUFNLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FsQmpCOztBQUF2QixlQUFHLFdBQVcsQUFBQyxFQUFDLENBQUE7Ozs7QUFtQkosbUJBQU8sRUFBSSxDQUFBLElBQUcsSUFBSSxBQUFDLENBQUMsRUFBRSxTQUFRLENBQUEsQ0FBSSxJQUFFLENBQUcsS0FBRyxDQUFDLENBQUM7Ozs7O0FBbkJ4RCxpQkFvQjJCLENBQUEsU0FBUSxBQUFDLEVBQUMsQ0FwQmQ7O0FBb0JYLGlCQUFLLEVBcEJqQixDQUFBLElBQUcsS0FBSyxBQW9CNkIsQ0FBQTs7OztBQXBCckMsZUFBRyxZQUFZLEVBc0JBLE9BQUssQUF0QmUsQ0FBQTs7OztBQUFuQyxpQkFBTyxDQUFBLElBQUcsSUFBSSxBQUFDLEVBQUMsQ0FBQTs7QUFDbUIsSUFDL0IsT0FBNkIsS0FBRyxDQUFDLENBQUM7RUFxQmxDLENBdkJtRCxDQXVCbEQ7QUFBQSxBQUNMLENBQUE7QUFFQSxLQUFLLFFBQVEsRUFBSSxhQUFXLENBQUM7QUFBQSIsImZpbGUiOiJjb21tb24vYXN5bmNIZWxwZXJzLmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUHJvbWlzZSA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcclxudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XHJcblxyXG52YXIgYXN5bmMgPSBQcm9taXNlLmNvcm91dGluZTtcclxuXHJcbnZhciBhc3luY0hlbHBlcnMgPSB7XHJcbiAgICBhc3luYzogYXN5bmMsXHJcblxyXG4gICAgYWdncmVzc2l2ZVJldHJ5OiBhc3luYyhmdW5jdGlvbiogKGFzeW5jRnVuYywgdW50aWwsIHRpbWVvdXQsIHRpbWVvdXRFcnJvcikge1xyXG4gICAgICAgIHRpbWVvdXRFcnJvciA9IHRpbWVvdXRFcnJvciB8fCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRXJyb3IoXCJSZXRyeSB0aW1lb3V0LlwiKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICB2YXIgd2FpdFRpbWUgPSAwO1xyXG4gICAgICAgIHZhciB3YWl0Q291bnQgPSAwO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB5aWVsZCBhc3luY0Z1bmMoKTtcclxuICAgICAgICB3aGlsZSAoIXVudGlsKHJlc3VsdCkpIHtcclxuICAgICAgICAgICAgaWYgKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lID4gdGltZW91dCkgdGhyb3cgdGltZW91dEVycm9yKCk7XHJcbiAgICAgICAgICAgIHlpZWxkIFByb21pc2UuZGVsYXkod2FpdFRpbWUpO1xyXG4gICAgICAgICAgICB3YWl0VGltZSA9IE1hdGgubWluKCsrd2FpdENvdW50ICogMjUwLCAzMDAwKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgYXN5bmNGdW5jKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9KVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jSGVscGVyczsiXX0=
