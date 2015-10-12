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
            host.once(WorkflowHost.events.warn, function(e) {
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
            host.once(WorkflowHost.events.warn, function(e) {
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
        pError,
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
            host.once(WorkflowHost.events.warn, function(e) {
              error = e;
            });
            $ctx.state = 77;
            break;
          case 77:
            $ctx.pushTry(63, 64);
            $ctx.state = 66;
            break;
          case 66:
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
            if (!(e instanceof errors.MethodNotFoundError)) {
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
            if (error) {
              pError = error;
              error = null;
              throw pError;
            }
            $ctx.state = 58;
            break;
          case 58:
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
            $ctx.state = 60;
            break;
          case 60:
            $ctx.state = 46;
            return (host.invokeMethod("wf", "stop", id));
          case 46:
            result = $ctx.sent;
            $ctx.state = 48;
            break;
          case 48:
            assert(!result);
            $ctx.state = 62;
            break;
          case 62:
            $ctx.popTry();
            $ctx.state = 64;
            $ctx.finallyFallThrough = 68;
            break;
          case 63:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            e = $ctx.storedException;
            $ctx.state = 69;
            break;
          case 69:
            if (!/is not supported without persistence/.test(e.message)) {
              throw e;
            }
            $ctx.state = 64;
            $ctx.finallyFallThrough = 68;
            break;
          case 64:
            $ctx.popTry();
            $ctx.state = 75;
            break;
          case 75:
            host.shutdown();
            $ctx.state = 73;
            break;
          case 68:
            assert.deepEqual(error, null);
            $ctx.state = -2;
            break;
          case 73:
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
            host.once(WorkflowHost.events.warn, function(e) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvc3RpbmdUZXN0Q29tbW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBRUEsQUFBSSxFQUFBLENBQUEsT0FBTSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsV0FBVSxDQUFDLENBQUM7QUFDbEMsQUFBSSxFQUFBLENBQUEsY0FBYSxFQUFJLENBQUEsT0FBTSxXQUFXLGVBQWUsQ0FBQztBQUN0RCxBQUFJLEVBQUEsQ0FBQSxZQUFXLEVBQUksQ0FBQSxPQUFNLFFBQVEsYUFBYSxDQUFDO0FBQy9DLEFBQUksRUFBQSxDQUFBLGNBQWEsRUFBSSxDQUFBLE9BQU0sV0FBVyxlQUFlLENBQUM7QUFDdEQsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsWUFBVyxFQUFJLENBQUEsT0FBTSxPQUFPLGFBQWEsQ0FBQztBQUM5QyxBQUFJLEVBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQztBQUNsQyxBQUFJLEVBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxZQUFXLE1BQU0sQ0FBQztBQUM5QixBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQztBQUM5QixNQUFNLEFBQUMsQ0FBQyxZQUFXLENBQUMsQ0FBQztBQUNyQixBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLE9BQU8sT0FBTyxDQUFDO0FBRWxDLEtBQUssUUFBUSxFQUFJO0FBQ2IsZ0JBQWMsQ0FBRyxDQUFBLEtBQUksQUFBQyxDQWYxQixlQUFjLHNCQUFzQixBQUFDLENBZVYsY0FBVyxXQUFVOzs7Ozs7QUFmaEQsU0FBTyxDQUFQLGVBQWMsd0JBQXdCLEFBQWQsQ0FBeEIsU0FBUyxJQUFHLENBQUc7QUFDVCxZQUFPLElBQUc7OztBQWVSLHNCQUFVLEVBQUksQ0FBQSxDQUFBLE9B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QUM7QUFDM0MsaUJBQUssQUFBQyxDQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsV0FBVyxJQUFNLEdBQUMsQ0FBQyxDQUFDO0FBQ2xDLGlCQUFLLEFBQUMsQ0FBQyxLQUFJLENBQUUsQ0FBQSxDQUFDLGdCQUFnQixJQUFNLENBQUEsS0FBSSxDQUFFLENBQUEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQXBsQnpFLGVBQUcsbUJBQW1CLEtBQW9CLENBQUE7OztBQUExQyxlQUFHLE9BQU8sQUFBQyxFQUFDLENBQUM7Ozs7QUF1bEJELGVBQUcsU0FBUyxBQUFDLEVBQUMsQ0FBQzs7OztBQUduQixpQkFBSyxVQUFVLEFBQUMsQ0FBQyxLQUFJLENBQUcsS0FBRyxDQUFDLENBQUM7Ozs7QUF6bEJmLGVBQUcsTUFBTSxFQUFJLENBQUEsSUFBRyxtQkFBbUIsQ0FBQztBQUNwQyxpQkFBSzs7QUFGM0IsaUJBQU8sQ0FBQSxJQUFHLElBQUksQUFBQyxFQUFDLENBQUE7O0FBQ21CLElBQy9CLE9BQTZCLEtBQUcsQ0FBQyxDQUFDO0VBeWxCbEMsQ0EzbEJtRCxDQTJsQmxEO0FBQUEsQUFDTCxDQUFDO0FBQ0QiLCJmaWxlIjoiaG9zdGluZy9ob3N0aW5nVGVzdENvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiJ0ZXN0cy9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubGV0IHdmNG5vZGUgPSByZXF1aXJlKFwiLi4vLi4vLi4vXCIpO1xubGV0IGFjdGl2aXR5TWFya3VwID0gd2Y0bm9kZS5hY3Rpdml0aWVzLmFjdGl2aXR5TWFya3VwO1xubGV0IFdvcmtmbG93SG9zdCA9IHdmNG5vZGUuaG9zdGluZy5Xb3JrZmxvd0hvc3Q7XG5sZXQgQ29uc29sZVRyYWNrZXIgPSB3ZjRub2RlLmFjdGl2aXRpZXMuQ29uc29sZVRyYWNrZXI7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgYXN5bmNIZWxwZXJzID0gd2Y0bm9kZS5jb21tb24uYXN5bmNIZWxwZXJzO1xubGV0IEJsdWViaXJkID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xubGV0IGFzeW5jID0gYXN5bmNIZWxwZXJzLmFzeW5jO1xubGV0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG5yZXF1aXJlKFwiZGF0ZS11dGlsc1wiKTtcbmxldCBlcnJvcnMgPSB3ZjRub2RlLmNvbW1vbi5lcnJvcnM7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRvQmFzaWNIb3N0VGVzdDogYXN5bmMoZnVuY3Rpb24qIChob3N0T3B0aW9ucykge1xuICAgICAgICBob3N0T3B0aW9ucyA9IF8uZXh0ZW5kKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVuYWJsZVByb21vdGlvbnM6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBob3N0T3B0aW9ucyk7XG5cbiAgICAgICAgbGV0IHdvcmtmbG93ID0ge1xuICAgICAgICAgICAgXCJAd29ya2Zsb3dcIjoge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwid2ZcIixcbiAgICAgICAgICAgICAgICBcIiF2XCI6IG51bGwsXG4gICAgICAgICAgICAgICAgXCIheFwiOiAwLFxuICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmVnaW5NZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwiZm9vXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuQ3JlYXRlSW5zdGFuY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJ2XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAZW5kTWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcImZvb1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogXCI9IHRoaXMudlswXSAqIHRoaXMudlswXVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRvXCI6IFwidlwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDY2NixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJ4XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcImJhclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBcIlswXVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogXCI9IHRoaXMudiAqIDJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcInNvbWUgc3RyaW5nIGZvciB3ZiByZXN1bHQgYnV0IG5vdCBmb3IgdGhlIG1ldGhvZCByZXN1bHRcIlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICBsZXQgaG9zdCA9IG5ldyBXb3JrZmxvd0hvc3QoaG9zdE9wdGlvbnMpO1xuICAgICAgICBob3N0Lm9uY2UoV29ya2Zsb3dIb3N0LmV2ZW50cy53YXJuLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vaG9zdC5hZGRUcmFja2VyKG5ldyBDb25zb2xlVHJhY2tlcigpKTtcblxuICAgICAgICAgICAgaG9zdC5yZWdpc3RlcldvcmtmbG93KHdvcmtmbG93KTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcImZvb1wiLCBbNV0pKTtcblxuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgMjUpO1xuXG4gICAgICAgICAgICAvLyBWZXJpZnkgcHJvbW90ZWRQcm9wZXJ0aWVzOlxuICAgICAgICAgICAgaWYgKGhvc3RPcHRpb25zICYmIGhvc3RPcHRpb25zLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIDUpO1xuICAgICAgICAgICAgICAgIGFzc2VydC5vayhwcm9tb3RlZFByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChwcm9tb3RlZFByb3BlcnRpZXMudiwgMjUpO1xuICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChwcm9tb3RlZFByb3BlcnRpZXMueCwgNjY2KTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoXy5rZXlzKHByb21vdGVkUHJvcGVydGllcykubGVuZ3RoLCAyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJiYXJcIiwgWzVdKSk7XG5cbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIDUwKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGhvc3Quc2h1dGRvd24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5kZWVwRXF1YWwoZXJyb3IsIG51bGwpO1xuICAgIH0pLFxuXG4gICAgZG9DYWxjdWxhdG9yVGVzdDogYXN5bmMoZnVuY3Rpb24qIChob3N0T3B0aW9ucykge1xuICAgICAgICBsZXQgd29ya2Zsb3cgPSB7XG4gICAgICAgICAgICBcIkB3b3JrZmxvd1wiOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJjYWxjdWxhdG9yXCIsXG4gICAgICAgICAgICAgICAgcnVubmluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbnB1dEFyZ3M6IG51bGwsXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlOiAwLFxuICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAd2hpbGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogXCI9IHRoaXMucnVubmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAcGlja1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJBZGQgYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkFkZCBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJhZGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdLmlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0b1wiOiBcImlucHV0QXJnc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuY3VycmVudFZhbHVlICsgdGhpcy5pbnB1dEFyZ3NbMF0udmFsdWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiY3VycmVudFZhbHVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiU3VidHJhY3QgYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIlN1YnRyYWN0IG1ldGhvZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcInN1YnRyYWN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBcIlswXS5pZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJpbnB1dEFyZ3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiPSB0aGlzLmN1cnJlbnRWYWx1ZSAtIHRoaXMuaW5wdXRBcmdzWzBdLnZhbHVlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcImN1cnJlbnRWYWx1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIk11bHRpcGx5IGJsb2NrXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJNdWx0aXBseSBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJtdWx0aXBseVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuQ3JlYXRlSW5zdGFuY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRvXCI6IFwiaW5wdXRBcmdzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIj0gdGhpcy5jdXJyZW50VmFsdWUgKiB0aGlzLmlucHV0QXJnc1swXS52YWx1ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJjdXJyZW50VmFsdWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJEaXZpZGUgYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkRpdmlkZSBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJkaXZpZGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdLmlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0b1wiOiBcImlucHV0QXJnc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuY3VycmVudFZhbHVlIC8gdGhpcy5pbnB1dEFyZ3NbMF0udmFsdWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiY3VycmVudFZhbHVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkVxdWFscyBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJlcXVhbHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdLmlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IFwiPSB0aGlzLmN1cnJlbnRWYWx1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIlJlc2V0IGJsb2NrXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJSZXNldCBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJyZXNldFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJydW5uaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgbGV0IGhvc3QgPSBuZXcgV29ya2Zsb3dIb3N0KGhvc3RPcHRpb25zKTtcbiAgICAgICAgaG9zdC5vbmNlKFdvcmtmbG93SG9zdC5ldmVudHMud2FybiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhvc3QucmVnaXN0ZXJXb3JrZmxvdyh3b3JrZmxvdyk7XG4gICAgICAgICAgICAvL2hvc3QuYWRkVHJhY2tlcihuZXcgQ29uc29sZVRyYWNrZXIoKSk7XG5cbiAgICAgICAgICAgIGxldCBhcmcgPSB7IGlkOiBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwMCkgKyAxKSB9O1xuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImVxdWFsc1wiLCBbYXJnXSkpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgMCk7XG5cbiAgICAgICAgICAgIGFyZy52YWx1ZSA9IDU1O1xuICAgICAgICAgICAgeWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImFkZFwiLCBbYXJnXSkpO1xuXG4gICAgICAgICAgICBpZiAoaG9zdE9wdGlvbnMgJiYgaG9zdE9wdGlvbnMucGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICBob3N0LnNodXRkb3duKCk7XG4gICAgICAgICAgICAgICAgaG9zdCA9IG5ldyBXb3JrZmxvd0hvc3QoaG9zdE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGhvc3Qub25jZShcImVycm9yXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBob3N0LnJlZ2lzdGVyV29ya2Zsb3cod29ya2Zsb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZXF1YWxzXCIsIFthcmddKSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCA1NSk7XG5cbiAgICAgICAgICAgIGFyZy52YWx1ZSA9IDU7XG4gICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZGl2aWRlXCIsIFthcmddKSk7XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZXF1YWxzXCIsIFthcmddKSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCAxMSk7XG5cbiAgICAgICAgICAgIGFyZy52YWx1ZSA9IDE7XG4gICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwic3VidHJhY3RcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJlcXVhbHNcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIDEwKTtcblxuICAgICAgICAgICAgYXJnLnZhbHVlID0gMTAwO1xuICAgICAgICAgICAgeWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcIm11bHRpcGx5XCIsIFthcmddKSk7XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZXF1YWxzXCIsIFthcmddKSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCAxMDAwKTtcblxuICAgICAgICAgICAgZGVsZXRlIGFyZy52YWx1ZTtcbiAgICAgICAgICAgIHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJyZXNldFwiLCBbYXJnXSkpO1xuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImVxdWFsc1wiLCBbYXJnXSkpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgMCk7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBhcmcudmFsdWU7XG4gICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwicmVzZXRcIiwgW2FyZ10pKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGhvc3Quc2h1dGRvd24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5kZWVwRXF1YWwoZXJyb3IsIG51bGwpO1xuICAgIH0pLFxuXG4gICAgZG9EZWxheVRlc3Q6IGFzeW5jKGZ1bmN0aW9uKiAoaG9zdE9wdGlvbnMpIHtcbiAgICAgICAgaG9zdE9wdGlvbnMgPSBfLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlbmFibGVQcm9tb3Rpb25zOiB0cnVlLFxuICAgICAgICAgICAgICAgIHdha2VVcE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWw6IDUwMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBob3N0T3B0aW9ucyk7XG5cbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICBsZXQgd29ya2Zsb3cgPSB7XG4gICAgICAgICAgICBcIkB3b3JrZmxvd1wiOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJ3ZlwiLFxuICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwiIWlcIjogMCxcbiAgICAgICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQHdoaWxlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogXCI9ICF0aGlzLmRvbmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBwaWNrXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcInN0YXJ0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwic3RvcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiZG9uZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAZGVsYXlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXM6IDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuaSArIDFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgPSB0aGlzLmk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgIGxldCBob3N0ID0gbmV3IFdvcmtmbG93SG9zdChob3N0T3B0aW9ucyk7XG4gICAgICAgIGhvc3Qub25jZShXb3JrZmxvd0hvc3QuZXZlbnRzLndhcm4sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlcnJvciA9IGU7XG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy9ob3N0LmFkZFRyYWNrZXIobmV3IENvbnNvbGVUcmFja2VyKCkpO1xuICAgICAgICAgICAgaG9zdC5yZWdpc3RlcldvcmtmbG93KHdvcmtmbG93KTtcblxuICAgICAgICAgICAgbGV0IGlkID0gXCIxXCI7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIHN0YXJ0IHRoZSB3b3JrZmxvdzpcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGRvIG5vdGhpbmcgcGFydGljdWxhciwgYnV0IHNob3VsZCB3b3JrOlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgYXNzZXJ0KCFyZXN1bHQpO1xuXG4gICAgICAgICAgICAvLyBDYWxsaW5nIHVuZXhpc3RlZCBtZXRob2Qgc2hvdWxkIHRocm93OlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInB1cHVcIiwgaWQpKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiVGhhdCBzaG91bGQgdGhyb3chXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgZXJyb3JzLk1ldGhvZE5vdEZvdW5kRXJyb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUaGF0IHNob3VsZCBkbyBub3RoaW5nIHBhcnRpY3VsYXIsIGJ1dCBzaG91bGQgd29yayBhZ2FpbjpcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgIGFzc2VydCghcmVzdWx0KTtcblxuICAgICAgICAgICAgLy8gTGV0J3Mgd2FpdC5cbiAgICAgICAgICAgIHlpZWxkIEJsdWViaXJkLmRlbGF5KDEwMDApO1xuXG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBsZXQgcEVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRocm93IHBFcnJvcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVmVyaWZ5IHByb21vdGVkUHJvcGVydGllczpcbiAgICAgICAgICAgIGlmIChob3N0T3B0aW9ucyAmJiBob3N0T3B0aW9ucy5wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgIGxldCBwcm9tb3RlZFByb3BlcnRpZXMgPSB5aWVsZCBob3N0LnBlcnNpc3RlbmNlLmxvYWRQcm9tb3RlZFByb3BlcnRpZXMoXCJ3ZlwiLCBpZCk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcy5pID4gMCk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKF8ua2V5cyhwcm9tb3RlZFByb3BlcnRpZXMpLmxlbmd0aCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQoaSA+IDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUaGF0IHNob3VsZCBkbyBub3RoaW5nIHBhcnRpY3VsYXIsIGJ1dCBzaG91bGQgd29yayBhZ2FpbjpcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgIGFzc2VydCghcmVzdWx0KTtcblxuICAgICAgICAgICAgLy8gU3RvcDpcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RvcFwiLCBpZCkpO1xuICAgICAgICAgICAgYXNzZXJ0KCFyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIS9pcyBub3Qgc3VwcG9ydGVkIHdpdGhvdXQgcGVyc2lzdGVuY2UvLnRlc3QoZS5tZXNzYWdlKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBob3N0LnNodXRkb3duKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQuZGVlcEVxdWFsKGVycm9yLCBudWxsKTtcbiAgICB9KSxcblxuICAgIGRvU3RvcE91dGRhdGVkVmVyc2lvbnNUZXN0OiBhc3luYyhmdW5jdGlvbiogKGhvc3RPcHRpb25zKSB7XG4gICAgICAgIGlmICghaG9zdE9wdGlvbnMucGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgbWV0aG9kIGhhcyBubyBtZWFuaW5nIGlmIHRoZXJlIGlzIG5vIHBlcnNpc3RlbmNlLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaG9zdE9wdGlvbnMgPSBfLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlbmFibGVQcm9tb3Rpb25zOiB0cnVlLFxuICAgICAgICAgICAgICAgIHdha2VVcE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWw6IDEwMDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaG9zdE9wdGlvbnMpO1xuXG4gICAgICAgIGxldCB0cmFjZSA9IFtdO1xuICAgICAgICBsZXQgZGVmID0ge1xuICAgICAgICAgICAgXCJAd29ya2Zsb3dcIjoge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwid2ZcIixcbiAgICAgICAgICAgICAgICBcIiFpXCI6IDAsXG4gICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmkrKztcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcInN0YXJ0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAZnVuY1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBpbnN0YW5jZURhdGFcIjoge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNlLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBkZWxheVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXM6IDEwMDAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBmdW5jXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGluc3RhbmNlRGF0YVwiOiB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2UucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaSsrO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IFwiQHRocm93XCI6IHsgZXJyb3I6IFwiSHVoLlwiIH0gfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHdvcmtmbG93MCA9IGFjdGl2aXR5TWFya3VwLnBhcnNlKGRlZik7XG4gICAgICAgIGRlZltcIkB3b3JrZmxvd1wiXS52ZXJzaW9uID0gMTtcbiAgICAgICAgbGV0IHdvcmtmbG93MSA9IGFjdGl2aXR5TWFya3VwLnBhcnNlKGRlZik7XG5cbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgbGV0IGhvc3QgPSBuZXcgV29ya2Zsb3dIb3N0KGhvc3RPcHRpb25zKTtcbiAgICAgICAgaG9zdC5vbmNlKFdvcmtmbG93SG9zdC5ldmVudHMud2FybiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBob3N0LnJlZ2lzdGVyV29ya2Zsb3cod29ya2Zsb3cwKTtcblxuICAgICAgICAgICAgbGV0IGlkID0gXCIxXCI7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIHN0YXJ0IHRoZSB3b3JrZmxvdzpcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGZhaWwsIGJlY2F1c2UgY29udHJvbCBmbG93IGhhcyBiZWVuIHN0ZXBwZWQgb3ZlcjpcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGFzc2VydChlLm1lc3NhZ2UuaW5kZXhPZihcImJvb2ttYXJrIGRvZXNuJ3QgZXhpc3RcIikgPiAwKTtcbiAgICAgICAgICAgICAgICBlcnJvciA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExldCdzIHdhaXQuXG4gICAgICAgICAgICB5aWVsZCBCbHVlYmlyZC5kZWxheSgxMDApO1xuXG4gICAgICAgICAgICAvLyBWZXJpZnkgcHJvbW90ZWRQcm9wZXJ0aWVzOlxuICAgICAgICAgICAgbGV0IHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgIGFzc2VydChwcm9tb3RlZFByb3BlcnRpZXMpO1xuICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcy5pID09PSAxKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChfLmtleXMocHJvbW90ZWRQcm9wZXJ0aWVzKS5sZW5ndGgsIDEpO1xuXG4gICAgICAgICAgICAvLyBTdGFydCBhbm90aGVyOlxuICAgICAgICAgICAgaG9zdC5zaHV0ZG93bigpO1xuICAgICAgICAgICAgaG9zdCA9IG5ldyBXb3JrZmxvd0hvc3QoaG9zdE9wdGlvbnMpO1xuICAgICAgICAgICAgaG9zdC5vbmNlKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlcnJvciA9IGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaG9zdC5yZWdpc3RlcldvcmtmbG93KHdvcmtmbG93MSk7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGZhaWwsIGJlY2F1c2UgYW4gb2xkZXIgdmVyc2lvbiBpcyBhbHJlYWR5IHJ1bm5pbmc6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBwZXJzaXN0ZW5jZSBpdCdzIGEgdmVyc2lvbiAwIHdvcmtmbG93LCBidXQgdGhhdCdzIG5vdCByZWdpc3RlcmVkIGluIHRoZSBuZXcgaG9zdCwgc28gaWYgZmFpbHM6XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGUubWVzc2FnZS5pbmRleE9mKFwiaGFzIG5vdCBiZWVuIHJlZ2lzdGVyZWRcIikgPiAwKTtcbiAgICAgICAgICAgICAgICBlcnJvciA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vdywgd2UncmUgc3RvcHBpbmcgYWxsIG9sZCBpbnN0YW5jZXM6XG4gICAgICAgICAgICB5aWVsZCBob3N0LnN0b3BEZXByZWNhdGVkVmVyc2lvbnMoXCJ3ZlwiKTtcblxuICAgICAgICAgICAgLy8gVmVyaWZ5IHByb21vdGVkUHJvcGVydGllczpcbiAgICAgICAgICAgIHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgIGFzc2VydChwcm9tb3RlZFByb3BlcnRpZXMgPT09IG51bGwpO1xuXG4gICAgICAgICAgICAvLyBPaywgbGV0J3Mgc3RhcnQgb3ZlciFcblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgc3RhcnQgdGhlIHdvcmtmbG93OlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgYXNzZXJ0KCFyZXN1bHQpO1xuXG4gICAgICAgICAgICAvLyBUaGF0IHNob3VsZCBmYWlsLCBiZWNhdXNlIGNvbnRyb2wgZmxvdyBoYXMgYmVlbiBzdGVwcGVkIG92ZXI6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZS5tZXNzYWdlLmluZGV4T2YoXCJib29rbWFyayBkb2Vzbid0IGV4aXN0XCIpID4gMCk7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXQncyB3YWl0LlxuICAgICAgICAgICAgeWllbGQgQmx1ZWJpcmQuZGVsYXkoMTAwKTtcblxuICAgICAgICAgICAgLy8gVmVyaWZ5IHByb21vdGVkUHJvcGVydGllczpcbiAgICAgICAgICAgIHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgIGFzc2VydChwcm9tb3RlZFByb3BlcnRpZXMpO1xuICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcy5pID09PSAxKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChfLmtleXMocHJvbW90ZWRQcm9wZXJ0aWVzKS5sZW5ndGgsIDEpO1xuXG4gICAgICAgICAgICBhc3NlcnQodHJhY2UubGVuZ3RoID09PSAyKTtcbiAgICAgICAgICAgIGFzc2VydCh0cmFjZVswXS53b3JrZmxvd05hbWUgPT09IFwid2ZcIik7XG4gICAgICAgICAgICBhc3NlcnQoXy5pc1N0cmluZyh0cmFjZVswXS53b3JrZmxvd1ZlcnNpb24pKTtcbiAgICAgICAgICAgIGFzc2VydCh0cmFjZVswXS53b3JrZmxvd1ZlcnNpb24ubGVuZ3RoID4gMCk7XG4gICAgICAgICAgICBhc3NlcnQodHJhY2VbMF0uaW5zdGFuY2VJZCA9PT0gaWQpO1xuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlWzFdLndvcmtmbG93TmFtZSA9PT0gXCJ3ZlwiKTtcbiAgICAgICAgICAgIGFzc2VydChfLmlzU3RyaW5nKHRyYWNlWzFdLndvcmtmbG93VmVyc2lvbikpO1xuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlWzFdLndvcmtmbG93VmVyc2lvbi5sZW5ndGggPiAwKTtcbiAgICAgICAgICAgIGFzc2VydCh0cmFjZVsxXS5pbnN0YW5jZUlkID09PSBpZCk7XG4gICAgICAgICAgICBhc3NlcnQodHJhY2VbMF0ud29ya2Zsb3dWZXJzaW9uICE9PSB0cmFjZVsxXS53b3JrZmxvd1ZlcnNpb24pO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgaG9zdC5zaHV0ZG93bigpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0LmRlZXBFcXVhbChlcnJvciwgbnVsbCk7XG4gICAgfSlcbn07XG4iXX0=
