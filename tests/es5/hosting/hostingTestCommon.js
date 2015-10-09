"use strict";
var wf4node = require("../../../");
var activityMarkup = wf4node.activities.activityMarkup;
var WorkflowHost = wf4node.hosting.WorkflowHost;
var ConsoleTracker = wf4node.activities.ConsoleTracker;
var _ = require("lodash");
var asyncHelpers = wf4node.common.asyncHelpers;
var Bluebird = require("bluebird");
var async = asyncHelpers.async;
var assert = require("assert");
require("date-utils");
var errors = wf4node.common.errors;
module.exports = {
  doBasicHostTest: async($traceurRuntime.initGeneratorFunction(function $__5(hostOptions) {
    var workflow,
        error,
        host,
        result,
        promotedProperties;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            hostOptions = _.extend({enablePromotions: true}, hostOptions);
            workflow = {"@workflow": {
                name: "wf",
                "!v": null,
                "!x": 0,
                args: [{"@beginMethod": {
                    methodName: "foo",
                    canCreateInstance: true,
                    instanceIdPath: "[0]",
                    "@to": "v"
                  }}, {"@endMethod": {
                    methodName: "foo",
                    result: "= this.v[0] * this.v[0]",
                    "@to": "v"
                  }}, {"@assign": {
                    value: 666,
                    to: "x"
                  }}, {"@method": {
                    methodName: "bar",
                    instanceIdPath: "[0]",
                    result: "= this.v * 2"
                  }}, "some string for wf result but not for the method result"]
              }};
            error = null;
            host = new WorkflowHost(hostOptions);
            host.once("error", function(e) {
              error = e;
            });
            $ctx.state = 31;
            break;
          case 31:
            $ctx.pushTry(null, 23);
            $ctx.state = 25;
            break;
          case 25:
            host.registerWorkflow(workflow);
            $ctx.state = 17;
            break;
          case 17:
            $ctx.state = 2;
            return (host.invokeMethod("wf", "foo", [5]));
          case 2:
            result = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            assert.equal(result, 25);
            $ctx.state = 19;
            break;
          case 19:
            $ctx.state = (hostOptions && hostOptions.persistence) ? 5 : 10;
            break;
          case 5:
            $ctx.state = 6;
            return host.persistence.loadPromotedProperties("wf", 5);
          case 6:
            promotedProperties = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            assert.ok(promotedProperties);
            assert.equal(promotedProperties.v, 25);
            assert.equal(promotedProperties.x, 666);
            assert.equal(_.keys(promotedProperties).length, 2);
            $ctx.state = 10;
            break;
          case 10:
            $ctx.state = 13;
            return (host.invokeMethod("wf", "bar", [5]));
          case 13:
            result = $ctx.sent;
            $ctx.state = 15;
            break;
          case 15:
            assert.equal(result, 50);
            $ctx.state = 23;
            $ctx.finallyFallThrough = 21;
            break;
          case 23:
            $ctx.popTry();
            $ctx.state = 29;
            break;
          case 29:
            host.shutdown();
            $ctx.state = 27;
            break;
          case 21:
            assert.deepEqual(error, null);
            $ctx.state = -2;
            break;
          case 27:
            $ctx.state = $ctx.finallyFallThrough;
            break;
          default:
            return $ctx.end();
        }
    }, $__5, this);
  })),
  doCalculatorTest: async($traceurRuntime.initGeneratorFunction(function $__6(hostOptions) {
    var workflow,
        error,
        host,
        arg,
        result;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            workflow = {"@workflow": {
                name: "calculator",
                running: true,
                inputArgs: null,
                currentValue: 0,
                args: [{"@while": {
                    condition: "= this.running",
                    args: {"@pick": [{"@block": {
                          displayName: "Add block",
                          args: [{"@method": {
                              displayName: "Add method",
                              methodName: "add",
                              instanceIdPath: "[0].id",
                              canCreateInstance: true,
                              "@to": "inputArgs"
                            }}, {"@assign": {
                              value: "= this.currentValue + this.inputArgs[0].value",
                              to: "currentValue"
                            }}]
                        }}, {"@block": {
                          displayName: "Subtract block",
                          args: [{"@method": {
                              displayName: "Subtract method",
                              methodName: "subtract",
                              instanceIdPath: "[0].id",
                              canCreateInstance: true,
                              "@to": "inputArgs"
                            }}, {"@assign": {
                              value: "= this.currentValue - this.inputArgs[0].value",
                              to: "currentValue"
                            }}]
                        }}, {"@block": {
                          displayName: "Multiply block",
                          args: [{"@method": {
                              displayName: "Multiply method",
                              methodName: "multiply",
                              instanceIdPath: "[0].id",
                              canCreateInstance: true,
                              "@to": "inputArgs"
                            }}, {"@assign": {
                              value: "= this.currentValue * this.inputArgs[0].value",
                              to: "currentValue"
                            }}]
                        }}, {"@block": {
                          displayName: "Divide block",
                          args: [{"@method": {
                              displayName: "Divide method",
                              methodName: "divide",
                              instanceIdPath: "[0].id",
                              canCreateInstance: true,
                              "@to": "inputArgs"
                            }}, {"@assign": {
                              value: "= this.currentValue / this.inputArgs[0].value",
                              to: "currentValue"
                            }}]
                        }}, {"@method": {
                          displayName: "Equals method",
                          methodName: "equals",
                          instanceIdPath: "[0].id",
                          canCreateInstance: true,
                          result: "= this.currentValue"
                        }}, {"@block": {
                          displayName: "Reset block",
                          args: [{"@method": {
                              displayName: "Reset method",
                              methodName: "reset",
                              instanceIdPath: "[0].id"
                            }}, {"@assign": {
                              value: false,
                              to: "running"
                            }}]
                        }}]}
                  }}]
              }};
            error = null;
            host = new WorkflowHost(hostOptions);
            host.once("error", function(e) {
              error = e;
            });
            $ctx.state = 74;
            break;
          case 74:
            $ctx.pushTry(null, 66);
            $ctx.state = 68;
            break;
          case 68:
            host.registerWorkflow(workflow);
            arg = {id: Math.floor((Math.random() * 1000000000) + 1)};
            $ctx.state = 50;
            break;
          case 50:
            $ctx.state = 2;
            return (host.invokeMethod("calculator", "equals", [arg]));
          case 2:
            result = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            assert.equal(result, 0);
            arg.value = 55;
            $ctx.state = 52;
            break;
          case 52:
            $ctx.state = 6;
            return (host.invokeMethod("calculator", "add", [arg]));
          case 6:
            $ctx.maybeThrow();
            $ctx.state = 8;
            break;
          case 8:
            if (hostOptions && hostOptions.persistence) {
              host.shutdown();
              host = new WorkflowHost(hostOptions);
              host.once("error", function(e) {
                error = e;
              });
              host.registerWorkflow(workflow);
            }
            $ctx.state = 54;
            break;
          case 54:
            $ctx.state = 10;
            return (host.invokeMethod("calculator", "equals", [arg]));
          case 10:
            result = $ctx.sent;
            $ctx.state = 12;
            break;
          case 12:
            assert.equal(result, 55);
            arg.value = 5;
            $ctx.state = 56;
            break;
          case 56:
            $ctx.state = 14;
            return (host.invokeMethod("calculator", "divide", [arg]));
          case 14:
            $ctx.maybeThrow();
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 18;
            return (host.invokeMethod("calculator", "equals", [arg]));
          case 18:
            result = $ctx.sent;
            $ctx.state = 20;
            break;
          case 20:
            assert.equal(result, 11);
            arg.value = 1;
            $ctx.state = 58;
            break;
          case 58:
            $ctx.state = 22;
            return (host.invokeMethod("calculator", "subtract", [arg]));
          case 22:
            $ctx.maybeThrow();
            $ctx.state = 24;
            break;
          case 24:
            $ctx.state = 26;
            return (host.invokeMethod("calculator", "equals", [arg]));
          case 26:
            result = $ctx.sent;
            $ctx.state = 28;
            break;
          case 28:
            assert.equal(result, 10);
            arg.value = 100;
            $ctx.state = 60;
            break;
          case 60:
            $ctx.state = 30;
            return (host.invokeMethod("calculator", "multiply", [arg]));
          case 30:
            $ctx.maybeThrow();
            $ctx.state = 32;
            break;
          case 32:
            $ctx.state = 34;
            return (host.invokeMethod("calculator", "equals", [arg]));
          case 34:
            result = $ctx.sent;
            $ctx.state = 36;
            break;
          case 36:
            assert.equal(result, 1000);
            delete arg.value;
            $ctx.state = 62;
            break;
          case 62:
            $ctx.state = 38;
            return (host.invokeMethod("calculator", "reset", [arg]));
          case 38:
            $ctx.maybeThrow();
            $ctx.state = 40;
            break;
          case 40:
            $ctx.state = 42;
            return (host.invokeMethod("calculator", "equals", [arg]));
          case 42:
            result = $ctx.sent;
            $ctx.state = 44;
            break;
          case 44:
            assert.equal(result, 0);
            delete arg.value;
            $ctx.state = 64;
            break;
          case 64:
            $ctx.state = 46;
            return (host.invokeMethod("calculator", "reset", [arg]));
          case 46:
            $ctx.maybeThrow();
            $ctx.state = 66;
            $ctx.finallyFallThrough = 48;
            break;
          case 66:
            $ctx.popTry();
            $ctx.state = 72;
            break;
          case 72:
            host.shutdown();
            $ctx.state = 70;
            break;
          case 48:
            assert.deepEqual(error, null);
            $ctx.state = -2;
            break;
          case 70:
            $ctx.state = $ctx.finallyFallThrough;
            break;
          default:
            return $ctx.end();
        }
    }, $__6, this);
  })),
  doDelayTest: async($traceurRuntime.initGeneratorFunction(function $__7(hostOptions) {
    var i,
        workflow,
        error,
        host,
        id,
        result,
        promotedProperties,
        e;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            hostOptions = _.extend({
              enablePromotions: true,
              wakeUpOptions: {interval: 500}
            }, hostOptions);
            i = 0;
            workflow = {"@workflow": {
                name: "wf",
                done: false,
                "!i": 0,
                args: {"@while": {
                    condition: "= !this.done",
                    args: {"@pick": [{"@method": {
                          canCreateInstance: true,
                          methodName: "start",
                          instanceIdPath: "[0]"
                        }}, {"@block": [{"@method": {
                            methodName: "stop",
                            instanceIdPath: "[0]"
                          }}, {"@assign": {
                            to: "done",
                            value: true
                          }}]}, {"@block": [{"@delay": {ms: 100}}, {"@assign": {
                            to: "i",
                            value: "= this.i + 1"
                          }}, function() {
                          i = this.i;
                        }]}]}
                  }}
              }};
            error = null;
            host = new WorkflowHost(hostOptions);
            host.once("error", function(e) {
              error = e;
            });
            $ctx.state = 70;
            break;
          case 70:
            $ctx.pushTry(null, 62);
            $ctx.state = 64;
            break;
          case 64:
            host.registerWorkflow(workflow);
            id = "1";
            $ctx.state = 50;
            break;
          case 50:
            $ctx.state = 2;
            return (host.invokeMethod("wf", "start", id));
          case 2:
            result = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            assert(!result);
            $ctx.state = 52;
            break;
          case 52:
            $ctx.state = 6;
            return (host.invokeMethod("wf", "start", id));
          case 6:
            result = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            assert(!result);
            $ctx.state = 54;
            break;
          case 54:
            $ctx.pushTry(15, null);
            $ctx.state = 18;
            break;
          case 18:
            $ctx.state = 10;
            return (host.invokeMethod("wf", "pupu", id));
          case 10:
            $ctx.maybeThrow();
            $ctx.state = 12;
            break;
          case 12:
            assert(false, "That should throw!");
            $ctx.state = 14;
            break;
          case 14:
            $ctx.popTry();
            $ctx.state = 20;
            break;
          case 15:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            e = $ctx.storedException;
            $ctx.state = 21;
            break;
          case 21:
            if (!(e instanceof errors.MethodIsNotAccessibleError)) {
              throw e;
            }
            $ctx.state = 20;
            break;
          case 20:
            $ctx.state = 25;
            return (host.invokeMethod("wf", "start", id));
          case 25:
            result = $ctx.sent;
            $ctx.state = 27;
            break;
          case 27:
            assert(!result);
            $ctx.state = 56;
            break;
          case 56:
            $ctx.state = 29;
            return Bluebird.delay(1000);
          case 29:
            $ctx.maybeThrow();
            $ctx.state = 31;
            break;
          case 31:
            $ctx.state = (hostOptions && hostOptions.persistence) ? 32 : 38;
            break;
          case 32:
            $ctx.state = 33;
            return host.persistence.loadPromotedProperties("wf", id);
          case 33:
            promotedProperties = $ctx.sent;
            $ctx.state = 35;
            break;
          case 35:
            assert(promotedProperties);
            assert(promotedProperties.i > 0);
            assert.equal(_.keys(promotedProperties).length, 1);
            $ctx.state = 37;
            break;
          case 38:
            assert(i > 0);
            $ctx.state = 37;
            break;
          case 37:
            $ctx.state = 42;
            return (host.invokeMethod("wf", "start", id));
          case 42:
            result = $ctx.sent;
            $ctx.state = 44;
            break;
          case 44:
            assert(!result);
            $ctx.state = 58;
            break;
          case 58:
            $ctx.state = 46;
            return (host.invokeMethod("wf", "stop", id));
          case 46:
            result = $ctx.sent;
            $ctx.state = 48;
            break;
          case 48:
            assert(!result);
            $ctx.state = 62;
            $ctx.finallyFallThrough = 60;
            break;
          case 62:
            $ctx.popTry();
            $ctx.state = 68;
            break;
          case 68:
            host.shutdown();
            $ctx.state = 66;
            break;
          case 60:
            assert.deepEqual(error, null);
            $ctx.state = -2;
            break;
          case 66:
            $ctx.state = $ctx.finallyFallThrough;
            break;
          default:
            return $ctx.end();
        }
    }, $__7, this);
  })),
  doStopOutdatedVersionsTest: async($traceurRuntime.initGeneratorFunction(function $__8(hostOptions) {
    var trace,
        def,
        workflow0,
        workflow1,
        error,
        host,
        id,
        result,
        promotedProperties,
        e;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = (!hostOptions.persistence) ? 1 : 2;
            break;
          case 1:
            $ctx.state = -2;
            break;
          case 2:
            hostOptions = _.extend({
              enablePromotions: true,
              wakeUpOptions: {interval: 1000}
            }, hostOptions);
            trace = [];
            def = {"@workflow": {
                name: "wf",
                "!i": 0,
                args: [function() {
                  this.i++;
                }, {"@method": {
                    canCreateInstance: true,
                    methodName: "start",
                    instanceIdPath: "[0]"
                  }}, {"@func": {
                    args: {"@instanceData": {}},
                    code: function(data) {
                      trace.push(data);
                    }
                  }}, {"@delay": {ms: 100000}}, {"@func": {
                    args: {"@instanceData": {}},
                    code: function(data) {
                      trace.push(data);
                    }
                  }}, function() {
                  this.i++;
                }, {"@throw": {error: "Huh."}}]
              }};
            workflow0 = activityMarkup.parse(def);
            def["@workflow"].version = 1;
            workflow1 = activityMarkup.parse(def);
            error = null;
            host = new WorkflowHost(hostOptions);
            host.once("error", function(e) {
              error = e;
            });
            $ctx.state = 102;
            break;
          case 102:
            $ctx.pushTry(null, 94);
            $ctx.state = 96;
            break;
          case 96:
            host.registerWorkflow(workflow0);
            id = "1";
            $ctx.state = 82;
            break;
          case 82:
            $ctx.state = 5;
            return (host.invokeMethod("wf", "start", id));
          case 5:
            result = $ctx.sent;
            $ctx.state = 7;
            break;
          case 7:
            assert(!result);
            $ctx.state = 84;
            break;
          case 84:
            $ctx.pushTry(14, null);
            $ctx.state = 17;
            break;
          case 17:
            $ctx.state = 9;
            return (host.invokeMethod("wf", "start", id));
          case 9:
            result = $ctx.sent;
            $ctx.state = 11;
            break;
          case 11:
            assert(false);
            $ctx.state = 13;
            break;
          case 13:
            $ctx.popTry();
            $ctx.state = 19;
            break;
          case 14:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            e = $ctx.storedException;
            $ctx.state = 20;
            break;
          case 20:
            assert(e.message.indexOf("bookmark doesn't exist") > 0);
            error = null;
            $ctx.state = 19;
            break;
          case 19:
            $ctx.state = 24;
            return Bluebird.delay(100);
          case 24:
            $ctx.maybeThrow();
            $ctx.state = 26;
            break;
          case 26:
            $ctx.state = 28;
            return host.persistence.loadPromotedProperties("wf", id);
          case 28:
            promotedProperties = $ctx.sent;
            $ctx.state = 30;
            break;
          case 30:
            assert(promotedProperties);
            assert(promotedProperties.i === 1);
            assert.equal(_.keys(promotedProperties).length, 1);
            host.shutdown();
            host = new WorkflowHost(hostOptions);
            host.once("error", function(e) {
              error = e;
            });
            host.registerWorkflow(workflow1);
            $ctx.state = 86;
            break;
          case 86:
            $ctx.pushTry(37, null);
            $ctx.state = 40;
            break;
          case 40:
            $ctx.state = 32;
            return (host.invokeMethod("wf", "start", id));
          case 32:
            result = $ctx.sent;
            $ctx.state = 34;
            break;
          case 34:
            assert(false);
            $ctx.state = 36;
            break;
          case 36:
            $ctx.popTry();
            $ctx.state = 42;
            break;
          case 37:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            e = $ctx.storedException;
            $ctx.state = 43;
            break;
          case 43:
            assert(e.message.indexOf("has not been registered") > 0);
            error = null;
            $ctx.state = 42;
            break;
          case 42:
            $ctx.state = 47;
            return host.stopDeprecatedVersions("wf");
          case 47:
            $ctx.maybeThrow();
            $ctx.state = 49;
            break;
          case 49:
            $ctx.state = 51;
            return host.persistence.loadPromotedProperties("wf", id);
          case 51:
            promotedProperties = $ctx.sent;
            $ctx.state = 53;
            break;
          case 53:
            assert(promotedProperties === null);
            $ctx.state = 88;
            break;
          case 88:
            $ctx.state = 55;
            return (host.invokeMethod("wf", "start", id));
          case 55:
            result = $ctx.sent;
            $ctx.state = 57;
            break;
          case 57:
            assert(!result);
            $ctx.state = 90;
            break;
          case 90:
            $ctx.pushTry(64, null);
            $ctx.state = 67;
            break;
          case 67:
            $ctx.state = 59;
            return (host.invokeMethod("wf", "start", id));
          case 59:
            result = $ctx.sent;
            $ctx.state = 61;
            break;
          case 61:
            assert(false);
            $ctx.state = 63;
            break;
          case 63:
            $ctx.popTry();
            $ctx.state = 69;
            break;
          case 64:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            e = $ctx.storedException;
            $ctx.state = 70;
            break;
          case 70:
            assert(e.message.indexOf("bookmark doesn't exist") > 0);
            error = null;
            $ctx.state = 69;
            break;
          case 69:
            $ctx.state = 74;
            return Bluebird.delay(100);
          case 74:
            $ctx.maybeThrow();
            $ctx.state = 76;
            break;
          case 76:
            $ctx.state = 78;
            return host.persistence.loadPromotedProperties("wf", id);
          case 78:
            promotedProperties = $ctx.sent;
            $ctx.state = 80;
            break;
          case 80:
            assert(promotedProperties);
            assert(promotedProperties.i === 1);
            assert.equal(_.keys(promotedProperties).length, 1);
            assert(trace.length === 2);
            assert(trace[0].workflowName === "wf");
            assert(_.isString(trace[0].workflowVersion));
            assert(trace[0].workflowVersion.length > 0);
            assert(trace[0].instanceId === id);
            assert(trace[1].workflowName === "wf");
            assert(_.isString(trace[1].workflowVersion));
            assert(trace[1].workflowVersion.length > 0);
            assert(trace[1].instanceId === id);
            assert(trace[0].workflowVersion !== trace[1].workflowVersion);
            $ctx.state = 94;
            $ctx.finallyFallThrough = 92;
            break;
          case 94:
            $ctx.popTry();
            $ctx.state = 100;
            break;
          case 100:
            host.shutdown();
            $ctx.state = 98;
            break;
          case 92:
            assert.deepEqual(error, null);
            $ctx.state = -2;
            break;
          case 98:
            $ctx.state = $ctx.finallyFallThrough;
            break;
          default:
            return $ctx.end();
        }
    }, $__8, this);
  }))
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvc3RpbmdUZXN0Q29tbW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBRUEsQUFBSSxFQUFBLENBQUEsT0FBTSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsV0FBVSxDQUFDLENBQUM7QUFDbEMsQUFBSSxFQUFBLENBQUEsY0FBYSxFQUFJLENBQUEsT0FBTSxXQUFXLGVBQWUsQ0FBQztBQUN0RCxBQUFJLEVBQUEsQ0FBQSxZQUFXLEVBQUksQ0FBQSxPQUFNLFFBQVEsYUFBYSxDQUFDO0FBQy9DLEFBQUksRUFBQSxDQUFBLGNBQWEsRUFBSSxDQUFBLE9BQU0sV0FBVyxlQUFlLENBQUM7QUFDdEQsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsWUFBVyxFQUFJLENBQUEsT0FBTSxPQUFPLGFBQWEsQ0FBQztBQUM5QyxBQUFJLEVBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQztBQUNsQyxBQUFJLEVBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxZQUFXLE1BQU0sQ0FBQztBQUM5QixBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQztBQUM5QixNQUFNLEFBQUMsQ0FBQyxZQUFXLENBQUMsQ0FBQztBQUNyQixBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLE9BQU8sT0FBTyxDQUFDO0FBRWxDLEtBQUssUUFBUSxFQUFJO0FBQ2IsZ0JBQWMsQ0FBRyxDQUFBLEtBQUksQUFBQyxDQWYxQixlQUFjLHNCQUFzQixBQUFDLENBZVYsY0FBVyxXQUFVOzs7Ozs7QUFmaEQsU0FBTyxDQUFQLGVBQWMsd0JBQXdCLEFBQWQsQ0FBeEIsU0FBUyxJQUFHLENBQUc7QUFDVCxZQUFPLElBQUc7OztBQWVSLHNCQUFVLEVBQUksQ0FBQSxDQUFBLE9B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LElBQUcsSUFBSSxBQUFDLEVBQUMsQ0FBQTs7QUFDbUIsSUFDL0IsT0FBNkIsS0FBRyxDQUFDLENBQUM7RUE4a0JsQyxDQWhsQm1ELENBZ2xCbEQ7QUFBQSxBQUNMLENBQUM7QUFDRCIsImZpbGUiOiJob3N0aW5nL2hvc3RpbmdUZXN0Q29tbW9uLmpzIiwic291cmNlUm9vdCI6InRlc3RzL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5sZXQgd2Y0bm9kZSA9IHJlcXVpcmUoXCIuLi8uLi8uLi9cIik7XG5sZXQgYWN0aXZpdHlNYXJrdXAgPSB3ZjRub2RlLmFjdGl2aXRpZXMuYWN0aXZpdHlNYXJrdXA7XG5sZXQgV29ya2Zsb3dIb3N0ID0gd2Y0bm9kZS5ob3N0aW5nLldvcmtmbG93SG9zdDtcbmxldCBDb25zb2xlVHJhY2tlciA9IHdmNG5vZGUuYWN0aXZpdGllcy5Db25zb2xlVHJhY2tlcjtcbmxldCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbmxldCBhc3luY0hlbHBlcnMgPSB3ZjRub2RlLmNvbW1vbi5hc3luY0hlbHBlcnM7XG5sZXQgQmx1ZWJpcmQgPSByZXF1aXJlKFwiYmx1ZWJpcmRcIik7XG5sZXQgYXN5bmMgPSBhc3luY0hlbHBlcnMuYXN5bmM7XG5sZXQgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKTtcbnJlcXVpcmUoXCJkYXRlLXV0aWxzXCIpO1xubGV0IGVycm9ycyA9IHdmNG5vZGUuY29tbW9uLmVycm9ycztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZG9CYXNpY0hvc3RUZXN0OiBhc3luYyhmdW5jdGlvbiogKGhvc3RPcHRpb25zKSB7XG4gICAgICAgIGhvc3RPcHRpb25zID0gXy5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZW5hYmxlUHJvbW90aW9uczogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhvc3RPcHRpb25zKTtcblxuICAgICAgICBsZXQgd29ya2Zsb3cgPSB7XG4gICAgICAgICAgICBcIkB3b3JrZmxvd1wiOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJ3ZlwiLFxuICAgICAgICAgICAgICAgIFwiIXZcIjogbnVsbCxcbiAgICAgICAgICAgICAgICBcIiF4XCI6IDAsXG4gICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBiZWdpbk1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJmb29cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0b1wiOiBcInZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBlbmRNZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwiZm9vXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBcIj0gdGhpcy52WzBdICogdGhpcy52WzBdXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJ2XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogNjY2LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcInhcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwiYmFyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBcIj0gdGhpcy52ICogMlwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwic29tZSBzdHJpbmcgZm9yIHdmIHJlc3VsdCBidXQgbm90IGZvciB0aGUgbWV0aG9kIHJlc3VsdFwiXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgIGxldCBob3N0ID0gbmV3IFdvcmtmbG93SG9zdChob3N0T3B0aW9ucyk7XG4gICAgICAgIGhvc3Qub25jZShcImVycm9yXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlcnJvciA9IGU7XG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy9ob3N0LmFkZFRyYWNrZXIobmV3IENvbnNvbGVUcmFja2VyKCkpO1xuXG4gICAgICAgICAgICBob3N0LnJlZ2lzdGVyV29ya2Zsb3cod29ya2Zsb3cpO1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwiZm9vXCIsIFs1XSkpO1xuXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCAyNSk7XG5cbiAgICAgICAgICAgIC8vIFZlcmlmeSBwcm9tb3RlZFByb3BlcnRpZXM6XG4gICAgICAgICAgICBpZiAoaG9zdE9wdGlvbnMgJiYgaG9zdE9wdGlvbnMucGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJvbW90ZWRQcm9wZXJ0aWVzID0geWllbGQgaG9zdC5wZXJzaXN0ZW5jZS5sb2FkUHJvbW90ZWRQcm9wZXJ0aWVzKFwid2ZcIiwgNSk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0Lm9rKHByb21vdGVkUHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHByb21vdGVkUHJvcGVydGllcy52LCAyNSk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHByb21vdGVkUHJvcGVydGllcy54LCA2NjYpO1xuICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChfLmtleXMocHJvbW90ZWRQcm9wZXJ0aWVzKS5sZW5ndGgsIDIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcImJhclwiLCBbNV0pKTtcblxuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgNTApO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgaG9zdC5zaHV0ZG93bigpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0LmRlZXBFcXVhbChlcnJvciwgbnVsbCk7XG4gICAgfSksXG5cbiAgICBkb0NhbGN1bGF0b3JUZXN0OiBhc3luYyhmdW5jdGlvbiogKGhvc3RPcHRpb25zKSB7XG4gICAgICAgIGxldCB3b3JrZmxvdyA9IHtcbiAgICAgICAgICAgIFwiQHdvcmtmbG93XCI6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcImNhbGN1bGF0b3JcIixcbiAgICAgICAgICAgICAgICBydW5uaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgIGlucHV0QXJnczogbnVsbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkB3aGlsZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZGl0aW9uOiBcIj0gdGhpcy5ydW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBwaWNrXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkFkZCBibG9ja1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiQWRkIG1ldGhvZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcImFkZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuQ3JlYXRlSW5zdGFuY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRvXCI6IFwiaW5wdXRBcmdzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIj0gdGhpcy5jdXJyZW50VmFsdWUgKyB0aGlzLmlucHV0QXJnc1swXS52YWx1ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJjdXJyZW50VmFsdWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJTdWJ0cmFjdCBibG9ja1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiU3VidHJhY3QgbWV0aG9kXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwic3VidHJhY3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdLmlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0b1wiOiBcImlucHV0QXJnc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuY3VycmVudFZhbHVlIC0gdGhpcy5pbnB1dEFyZ3NbMF0udmFsdWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiY3VycmVudFZhbHVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiTXVsdGlwbHkgYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIk11bHRpcGx5IG1ldGhvZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcIm11bHRpcGx5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBcIlswXS5pZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJpbnB1dEFyZ3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiPSB0aGlzLmN1cnJlbnRWYWx1ZSAqIHRoaXMuaW5wdXRBcmdzWzBdLnZhbHVlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcImN1cnJlbnRWYWx1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkRpdmlkZSBibG9ja1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiRGl2aWRlIG1ldGhvZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcImRpdmlkZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuQ3JlYXRlSW5zdGFuY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRvXCI6IFwiaW5wdXRBcmdzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIj0gdGhpcy5jdXJyZW50VmFsdWUgLyB0aGlzLmlucHV0QXJnc1swXS52YWx1ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJjdXJyZW50VmFsdWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiRXF1YWxzIG1ldGhvZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcImVxdWFsc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuQ3JlYXRlSW5zdGFuY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogXCI9IHRoaXMuY3VycmVudFZhbHVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiUmVzZXQgYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIlJlc2V0IG1ldGhvZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcInJlc2V0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBcIlswXS5pZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcInJ1bm5pbmdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICBsZXQgaG9zdCA9IG5ldyBXb3JrZmxvd0hvc3QoaG9zdE9wdGlvbnMpO1xuICAgICAgICBob3N0Lm9uY2UoXCJlcnJvclwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaG9zdC5yZWdpc3RlcldvcmtmbG93KHdvcmtmbG93KTtcbiAgICAgICAgICAgIC8vaG9zdC5hZGRUcmFja2VyKG5ldyBDb25zb2xlVHJhY2tlcigpKTtcblxuICAgICAgICAgICAgbGV0IGFyZyA9IHsgaWQ6IE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDAwKSArIDEpIH07XG5cbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZXF1YWxzXCIsIFthcmddKSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCAwKTtcblxuICAgICAgICAgICAgYXJnLnZhbHVlID0gNTU7XG4gICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiYWRkXCIsIFthcmddKSk7XG5cbiAgICAgICAgICAgIGlmIChob3N0T3B0aW9ucyAmJiBob3N0T3B0aW9ucy5wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgIGhvc3Quc2h1dGRvd24oKTtcbiAgICAgICAgICAgICAgICBob3N0ID0gbmV3IFdvcmtmbG93SG9zdChob3N0T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaG9zdC5vbmNlKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGhvc3QucmVnaXN0ZXJXb3JrZmxvdyh3b3JrZmxvdyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJlcXVhbHNcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIDU1KTtcblxuICAgICAgICAgICAgYXJnLnZhbHVlID0gNTtcbiAgICAgICAgICAgIHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJkaXZpZGVcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJlcXVhbHNcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIDExKTtcblxuICAgICAgICAgICAgYXJnLnZhbHVlID0gMTtcbiAgICAgICAgICAgIHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJzdWJ0cmFjdFwiLCBbYXJnXSkpO1xuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImVxdWFsc1wiLCBbYXJnXSkpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgMTApO1xuXG4gICAgICAgICAgICBhcmcudmFsdWUgPSAxMDA7XG4gICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwibXVsdGlwbHlcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJlcXVhbHNcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIDEwMDApO1xuXG4gICAgICAgICAgICBkZWxldGUgYXJnLnZhbHVlO1xuICAgICAgICAgICAgeWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcInJlc2V0XCIsIFthcmddKSk7XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZXF1YWxzXCIsIFthcmddKSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCAwKTtcblxuICAgICAgICAgICAgZGVsZXRlIGFyZy52YWx1ZTtcbiAgICAgICAgICAgIHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJyZXNldFwiLCBbYXJnXSkpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgaG9zdC5zaHV0ZG93bigpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0LmRlZXBFcXVhbChlcnJvciwgbnVsbCk7XG4gICAgfSksXG5cbiAgICBkb0RlbGF5VGVzdDogYXN5bmMoZnVuY3Rpb24qIChob3N0T3B0aW9ucykge1xuICAgICAgICBob3N0T3B0aW9ucyA9IF8uZXh0ZW5kKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVuYWJsZVByb21vdGlvbnM6IHRydWUsXG4gICAgICAgICAgICAgICAgd2FrZVVwT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbDogNTAwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhvc3RPcHRpb25zKTtcblxuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIGxldCB3b3JrZmxvdyA9IHtcbiAgICAgICAgICAgIFwiQHdvcmtmbG93XCI6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIndmXCIsXG4gICAgICAgICAgICAgICAgZG9uZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCIhaVwiOiAwLFxuICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJAd2hpbGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZGl0aW9uOiBcIj0gIXRoaXMuZG9uZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJnczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHBpY2tcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwic3RhcnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJzdG9wXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJkb25lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBkZWxheVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtczogMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcImlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIj0gdGhpcy5pICsgMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSA9IHRoaXMuaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgbGV0IGhvc3QgPSBuZXcgV29ya2Zsb3dIb3N0KGhvc3RPcHRpb25zKTtcbiAgICAgICAgaG9zdC5vbmNlKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvL2hvc3QuYWRkVHJhY2tlcihuZXcgQ29uc29sZVRyYWNrZXIoKSk7XG4gICAgICAgICAgICBob3N0LnJlZ2lzdGVyV29ya2Zsb3cod29ya2Zsb3cpO1xuXG4gICAgICAgICAgICBsZXQgaWQgPSBcIjFcIjtcblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgc3RhcnQgdGhlIHdvcmtmbG93OlxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgIGFzc2VydCghcmVzdWx0KTtcblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgZG8gbm90aGluZyBwYXJ0aWN1bGFyLCBidXQgc2hvdWxkIHdvcms6XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIENhbGxpbmcgdW5leGlzdGVkIG1ldGhvZCBzaG91bGQgdGhyb3c6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwicHVwdVwiLCBpZCkpO1xuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSwgXCJUaGF0IHNob3VsZCB0aHJvdyFcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBlcnJvcnMuTWV0aG9kSXNOb3RBY2Nlc3NpYmxlRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUaGF0IHNob3VsZCBkbyBub3RoaW5nIHBhcnRpY3VsYXIsIGJ1dCBzaG91bGQgd29yayBhZ2FpbjpcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgIGFzc2VydCghcmVzdWx0KTtcblxuICAgICAgICAgICAgLy8gTGV0J3Mgd2FpdC5cbiAgICAgICAgICAgIHlpZWxkIEJsdWViaXJkLmRlbGF5KDEwMDApO1xuXG4gICAgICAgICAgICAvLyBWZXJpZnkgcHJvbW90ZWRQcm9wZXJ0aWVzOlxuICAgICAgICAgICAgaWYgKGhvc3RPcHRpb25zICYmIGhvc3RPcHRpb25zLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQocHJvbW90ZWRQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQocHJvbW90ZWRQcm9wZXJ0aWVzLmkgPiAwKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoXy5rZXlzKHByb21vdGVkUHJvcGVydGllcykubGVuZ3RoLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFzc2VydChpID4gMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGRvIG5vdGhpbmcgcGFydGljdWxhciwgYnV0IHNob3VsZCB3b3JrIGFnYWluOlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgYXNzZXJ0KCFyZXN1bHQpO1xuXG4gICAgICAgICAgICAvLyBTdG9wOlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdG9wXCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBob3N0LnNodXRkb3duKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQuZGVlcEVxdWFsKGVycm9yLCBudWxsKTtcbiAgICB9KSxcblxuICAgIGRvU3RvcE91dGRhdGVkVmVyc2lvbnNUZXN0OiBhc3luYyhmdW5jdGlvbiogKGhvc3RPcHRpb25zKSB7XG4gICAgICAgIGlmICghaG9zdE9wdGlvbnMucGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgbWV0aG9kIGhhcyBubyBtZWFuaW5nIGlmIHRoZXJlIGlzIG5vIHBlcnNpc3RlbmNlLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaG9zdE9wdGlvbnMgPSBfLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlbmFibGVQcm9tb3Rpb25zOiB0cnVlLFxuICAgICAgICAgICAgICAgIHdha2VVcE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWw6IDEwMDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaG9zdE9wdGlvbnMpO1xuXG4gICAgICAgIGxldCB0cmFjZSA9IFtdO1xuICAgICAgICBsZXQgZGVmID0ge1xuICAgICAgICAgICAgXCJAd29ya2Zsb3dcIjoge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwid2ZcIixcbiAgICAgICAgICAgICAgICBcIiFpXCI6IDAsXG4gICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmkrKztcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcInN0YXJ0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAZnVuY1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBpbnN0YW5jZURhdGFcIjoge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNlLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBkZWxheVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXM6IDEwMDAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBmdW5jXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGluc3RhbmNlRGF0YVwiOiB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2UucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaSsrO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IFwiQHRocm93XCI6IHsgZXJyb3I6IFwiSHVoLlwiIH0gfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHdvcmtmbG93MCA9IGFjdGl2aXR5TWFya3VwLnBhcnNlKGRlZik7XG4gICAgICAgIGRlZltcIkB3b3JrZmxvd1wiXS52ZXJzaW9uID0gMTtcbiAgICAgICAgbGV0IHdvcmtmbG93MSA9IGFjdGl2aXR5TWFya3VwLnBhcnNlKGRlZik7XG5cbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgbGV0IGhvc3QgPSBuZXcgV29ya2Zsb3dIb3N0KGhvc3RPcHRpb25zKTtcbiAgICAgICAgaG9zdC5vbmNlKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBob3N0LnJlZ2lzdGVyV29ya2Zsb3cod29ya2Zsb3cwKTtcblxuICAgICAgICAgICAgbGV0IGlkID0gXCIxXCI7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIHN0YXJ0IHRoZSB3b3JrZmxvdzpcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGZhaWwsIGJlY2F1c2UgY29udHJvbCBmbG93IGhhcyBiZWVuIHN0ZXBwZWQgb3ZlcjpcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGFzc2VydChlLm1lc3NhZ2UuaW5kZXhPZihcImJvb2ttYXJrIGRvZXNuJ3QgZXhpc3RcIikgPiAwKTtcbiAgICAgICAgICAgICAgICBlcnJvciA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExldCdzIHdhaXQuXG4gICAgICAgICAgICB5aWVsZCBCbHVlYmlyZC5kZWxheSgxMDApO1xuXG4gICAgICAgICAgICAvLyBWZXJpZnkgcHJvbW90ZWRQcm9wZXJ0aWVzOlxuICAgICAgICAgICAgbGV0IHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgIGFzc2VydChwcm9tb3RlZFByb3BlcnRpZXMpO1xuICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcy5pID09PSAxKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChfLmtleXMocHJvbW90ZWRQcm9wZXJ0aWVzKS5sZW5ndGgsIDEpO1xuXG4gICAgICAgICAgICAvLyBTdGFydCBhbm90aGVyOlxuICAgICAgICAgICAgaG9zdC5zaHV0ZG93bigpO1xuICAgICAgICAgICAgaG9zdCA9IG5ldyBXb3JrZmxvd0hvc3QoaG9zdE9wdGlvbnMpO1xuICAgICAgICAgICAgaG9zdC5vbmNlKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlcnJvciA9IGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaG9zdC5yZWdpc3RlcldvcmtmbG93KHdvcmtmbG93MSk7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGZhaWwsIGJlY2F1c2UgYW4gb2xkZXIgdmVyc2lvbiBpcyBhbHJlYWR5IHJ1bm5pbmc6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBwZXJzaXN0ZW5jZSBpdCdzIGEgdmVyc2lvbiAwIHdvcmtmbG93LCBidXQgdGhhdCdzIG5vdCByZWdpc3RlcmVkIGluIHRoZSBuZXcgaG9zdCwgc28gaWYgZmFpbHM6XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGUubWVzc2FnZS5pbmRleE9mKFwiaGFzIG5vdCBiZWVuIHJlZ2lzdGVyZWRcIikgPiAwKTtcbiAgICAgICAgICAgICAgICBlcnJvciA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vdywgd2UncmUgc3RvcHBpbmcgYWxsIG9sZCBpbnN0YW5jZXM6XG4gICAgICAgICAgICB5aWVsZCBob3N0LnN0b3BEZXByZWNhdGVkVmVyc2lvbnMoXCJ3ZlwiKTtcblxuICAgICAgICAgICAgLy8gVmVyaWZ5IHByb21vdGVkUHJvcGVydGllczpcbiAgICAgICAgICAgIHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgIGFzc2VydChwcm9tb3RlZFByb3BlcnRpZXMgPT09IG51bGwpO1xuXG4gICAgICAgICAgICAvLyBPaywgbGV0J3Mgc3RhcnQgb3ZlciFcblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgc3RhcnQgdGhlIHdvcmtmbG93OlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgYXNzZXJ0KCFyZXN1bHQpO1xuXG4gICAgICAgICAgICAvLyBUaGF0IHNob3VsZCBmYWlsLCBiZWNhdXNlIGNvbnRyb2wgZmxvdyBoYXMgYmVlbiBzdGVwcGVkIG92ZXI6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZS5tZXNzYWdlLmluZGV4T2YoXCJib29rbWFyayBkb2Vzbid0IGV4aXN0XCIpID4gMCk7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXQncyB3YWl0LlxuICAgICAgICAgICAgeWllbGQgQmx1ZWJpcmQuZGVsYXkoMTAwKTtcblxuICAgICAgICAgICAgLy8gVmVyaWZ5IHByb21vdGVkUHJvcGVydGllczpcbiAgICAgICAgICAgIHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgIGFzc2VydChwcm9tb3RlZFByb3BlcnRpZXMpO1xuICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcy5pID09PSAxKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChfLmtleXMocHJvbW90ZWRQcm9wZXJ0aWVzKS5sZW5ndGgsIDEpO1xuXG4gICAgICAgICAgICBhc3NlcnQodHJhY2UubGVuZ3RoID09PSAyKTtcbiAgICAgICAgICAgIGFzc2VydCh0cmFjZVswXS53b3JrZmxvd05hbWUgPT09IFwid2ZcIik7XG4gICAgICAgICAgICBhc3NlcnQoXy5pc1N0cmluZyh0cmFjZVswXS53b3JrZmxvd1ZlcnNpb24pKTtcbiAgICAgICAgICAgIGFzc2VydCh0cmFjZVswXS53b3JrZmxvd1ZlcnNpb24ubGVuZ3RoID4gMCk7XG4gICAgICAgICAgICBhc3NlcnQodHJhY2VbMF0uaW5zdGFuY2VJZCA9PT0gaWQpO1xuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlWzFdLndvcmtmbG93TmFtZSA9PT0gXCJ3ZlwiKTtcbiAgICAgICAgICAgIGFzc2VydChfLmlzU3RyaW5nKHRyYWNlWzFdLndvcmtmbG93VmVyc2lvbikpO1xuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlWzFdLndvcmtmbG93VmVyc2lvbi5sZW5ndGggPiAwKTtcbiAgICAgICAgICAgIGFzc2VydCh0cmFjZVsxXS5pbnN0YW5jZUlkID09PSBpZCk7XG4gICAgICAgICAgICBhc3NlcnQodHJhY2VbMF0ud29ya2Zsb3dWZXJzaW9uICE9PSB0cmFjZVsxXS53b3JrZmxvd1ZlcnNpb24pO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgaG9zdC5zaHV0ZG93bigpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0LmRlZXBFcXVhbChlcnJvciwgbnVsbCk7XG4gICAgfSlcbn07XG4iXX0=
