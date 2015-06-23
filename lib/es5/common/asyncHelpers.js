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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzeW5jSGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLEFBQUksRUFBQSxDQUFBLE9BQU0sRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLFVBQVMsQ0FBQyxDQUFDO0FBQ2pDLEFBQUksRUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLE1BQUssQ0FBQyxDQUFDO0FBRXhCLEFBQUksRUFBQSxDQUFBLEtBQUksRUFBSSxDQUFBLE9BQU0sVUFBVSxDQUFDO0FBRTdCLEFBQUksRUFBQSxDQUFBLFlBQVcsRUFBSTtBQUNmLE1BQUksQ0FBRyxNQUFJO0FBRVgsZ0JBQWMsQ0FBRyxDQUFBLEtBQUksQUFBQyxDQVIxQixlQUFjLHNCQUFzQixBQUFDLENBUVYsY0FBVyxTQUFRLENBQUcsQ0FBQSxLQUFJLENBQUcsQ0FBQSxPQUFNLENBQUcsQ0FBQSxZQUFXOzs7OztBQVI1RSxTQUFPLENBQVAsZUFBYyx3QkFBd0IsQUFBZCxDQUF4QixTQUFTLElBQUcsQ0FBRztBQUNULFlBQU8sSUFBRzs7O0FBUVIsdUJBQVcsRUFBSSxDQUFBLFlBQVcsR0FBSyxVQUFVLEFBQUQsQ0FBRztBQUN2QyxtQkFBTyxJQUFJLE1BQUksQUFBQyxDQUFDLGdCQUFlLENBQUMsQ0FBQztZQUN0QyxDQUFDO3NCQUNlLENBQUEsR0FBSSxLQUFHLEFBQUMsRUFBQyxRQUFRLEFBQUMsRUFBQztxQkFDcEIsRUFBQTtzQkFDQyxFQUFBOzs7OztBQWR4QixpQkFlMkIsQ0FBQSxTQUFRLEFBQUMsRUFBQyxDQWZkOzttQkFBdkIsQ0FBQSxJQUFHLEtBQUs7Ozs7QUFBUixlQUFHLE1BQU0sRUFBSSxDQUFBLENBZ0JFLENBQUMsS0FBSSxBQUFDLENBQUMsTUFBSyxDQUFDLENBaEJHLFVBQXdDLENBQUM7QUFDaEUsaUJBQUk7O0FBZ0JBLGVBQUksR0FBSSxLQUFHLEFBQUMsRUFBQyxRQUFRLEFBQUMsRUFBQyxDQUFBLENBQUksVUFBUSxDQUFBLENBQUksUUFBTTtBQUFHLGtCQUFNLENBQUEsWUFBVyxBQUFDLEVBQUMsQ0FBQztBQUFBOzs7O0FBakJoRixpQkFrQmtCLENBQUEsT0FBTSxNQUFNLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FsQmpCOztBQUF2QixlQUFHLFdBQVcsQUFBQyxFQUFDLENBQUE7Ozs7QUFtQkosbUJBQU8sRUFBSSxDQUFBLElBQUcsSUFBSSxBQUFDLENBQUMsRUFBRSxTQUFRLENBQUEsQ0FBSSxJQUFFLENBQUcsS0FBRyxDQUFDLENBQUM7Ozs7O0FBbkJ4RCxpQkFvQjJCLENBQUEsU0FBUSxBQUFDLEVBQUMsQ0FwQmQ7O0FBb0JYLGlCQUFLLEVBcEJqQixDQUFBLElBQUcsS0FBSyxBQW9CNkIsQ0FBQTs7OztBQXBCckMsZUFBRyxZQUFZLEVBc0JBLE9BQUssQUF0QmUsQ0FBQTs7OztBQUFuQyxpQkFBTyxDQUFBLElBQUcsSUFBSSxBQUFDLEVBQUMsQ0FBQTs7QUFDbUIsSUFDL0IsT0FBNkIsS0FBRyxDQUFDLENBQUM7RUFxQmxDLENBdkJtRCxDQXVCbEQ7QUFBQSxBQUNMLENBQUE7QUFFQSxLQUFLLFFBQVEsRUFBSSxhQUFXLENBQUM7QUFBQSIsImZpbGUiOiJjb21tb24vYXN5bmNIZWxwZXJzLmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUHJvbWlzZSA9IHJlcXVpcmUoXCJibHVlYmlyZFwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xuXG52YXIgYXN5bmMgPSBQcm9taXNlLmNvcm91dGluZTtcblxudmFyIGFzeW5jSGVscGVycyA9IHtcbiAgICBhc3luYzogYXN5bmMsXG5cbiAgICBhZ2dyZXNzaXZlUmV0cnk6IGFzeW5jKGZ1bmN0aW9uKiAoYXN5bmNGdW5jLCB1bnRpbCwgdGltZW91dCwgdGltZW91dEVycm9yKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvciA9IHRpbWVvdXRFcnJvciB8fCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKFwiUmV0cnkgdGltZW91dC5cIik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgdmFyIHdhaXRUaW1lID0gMDtcbiAgICAgICAgdmFyIHdhaXRDb3VudCA9IDA7XG4gICAgICAgIHZhciByZXN1bHQgPSB5aWVsZCBhc3luY0Z1bmMoKTtcbiAgICAgICAgd2hpbGUgKCF1bnRpbChyZXN1bHQpKSB7XG4gICAgICAgICAgICBpZiAobmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydFRpbWUgPiB0aW1lb3V0KSB0aHJvdyB0aW1lb3V0RXJyb3IoKTtcbiAgICAgICAgICAgIHlpZWxkIFByb21pc2UuZGVsYXkod2FpdFRpbWUpO1xuICAgICAgICAgICAgd2FpdFRpbWUgPSBNYXRoLm1pbigrK3dhaXRDb3VudCAqIDI1MCwgMzAwMCk7XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCBhc3luY0Z1bmMoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pXG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXN5bmNIZWxwZXJzOyJdfQ==
