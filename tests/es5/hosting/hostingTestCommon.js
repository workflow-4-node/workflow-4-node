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
            assert(!hostOptions.persistence);
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

//# sourceMappingURL=hostingTestCommon.js.map
