"use strict";
var wf4node = require("../../../");
var activityMarkup = wf4node.activities.activityMarkup;
var WorkflowHost = wf4node.hosting.WorkflowHost;
var ConsoleTracker = wf4node.activities.ConsoleTracker;
var _ = require("lodash");
var asyncHelpers = wf4node.common.asyncHelpers;
var Bluebird = require("bluebird");
var async = Bluebird.coroutine;
var assert = require("assert");
require("date-utils");
var errors = wf4node.common.errors;
module.exports = {
  doBasicHostTest: async($traceurRuntime.initGeneratorFunction(function $__7(hostOptions) {
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
    }, $__7, this);
  })),
  doCalculatorTest: async($traceurRuntime.initGeneratorFunction(function $__8(hostOptions) {
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
    }, $__8, this);
  })),
  doDelayTest: async($traceurRuntime.initGeneratorFunction(function $__9(hostOptions) {
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
              wakeUpOptions: {interval: 100}
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
            return Bluebird.delay(400);
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
    }, $__9, this);
  })),
  doStopOutdatedVersionsTest: async($traceurRuntime.initGeneratorFunction(function $__10(hostOptions) {
    var trace,
        i,
        def,
        workflow0,
        workflow1,
        error,
        host,
        id,
        result,
        promotedProperties,
        promotedProperties$__5,
        promotedProperties$__6,
        e;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            hostOptions = _.extend({
              enablePromotions: true,
              wakeUpOptions: {interval: 1000}
            }, hostOptions);
            trace = [];
            i = 0;
            def = {"@workflow": {
                name: "wf",
                "!i": 0,
                args: [function() {
                  this.i++;
                  i++;
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
                  i++;
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
            $ctx.state = 112;
            break;
          case 112:
            $ctx.pushTry(null, 104);
            $ctx.state = 106;
            break;
          case 106:
            host.registerWorkflow(workflow0);
            id = "1";
            $ctx.state = 94;
            break;
          case 94:
            $ctx.state = 2;
            return (host.invokeMethod("wf", "start", id));
          case 2:
            result = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            assert(!result);
            $ctx.state = 96;
            break;
          case 96:
            $ctx.pushTry(11, null);
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = 6;
            return (host.invokeMethod("wf", "start", id));
          case 6:
            result = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            assert(false);
            $ctx.state = 10;
            break;
          case 10:
            $ctx.popTry();
            $ctx.state = 16;
            break;
          case 11:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            e = $ctx.storedException;
            $ctx.state = 17;
            break;
          case 17:
            assert(e.message.indexOf("bookmark doesn't exist") > 0);
            error = null;
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 21;
            return Bluebird.delay(100);
          case 21:
            $ctx.maybeThrow();
            $ctx.state = 23;
            break;
          case 23:
            $ctx.state = (hostOptions && hostOptions.persistence) ? 24 : 30;
            break;
          case 24:
            $ctx.state = 25;
            return host.persistence.loadPromotedProperties("wf", id);
          case 25:
            promotedProperties = $ctx.sent;
            $ctx.state = 27;
            break;
          case 27:
            assert(promotedProperties);
            assert(promotedProperties.i === 1);
            assert.equal(_.keys(promotedProperties).length, 1);
            $ctx.state = 29;
            break;
          case 30:
            assert(i === 1);
            $ctx.state = 29;
            break;
          case 29:
            if (hostOptions.persistence) {
              host.shutdown();
              host = new WorkflowHost(hostOptions);
              host.once("error", function(e) {
                error = e;
              });
            }
            host.registerWorkflow(workflow1);
            $ctx.state = 98;
            break;
          case 98:
            $ctx.pushTry(39, null);
            $ctx.state = 42;
            break;
          case 42:
            $ctx.state = 34;
            return (host.invokeMethod("wf", "start", id));
          case 34:
            result = $ctx.sent;
            $ctx.state = 36;
            break;
          case 36:
            assert(false);
            $ctx.state = 38;
            break;
          case 38:
            $ctx.popTry();
            $ctx.state = 44;
            break;
          case 39:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            e = $ctx.storedException;
            $ctx.state = 45;
            break;
          case 45:
            if (hostOptions.persistence) {
              assert(e.message.indexOf("has not been registered") > 0);
            } else {
              assert(e.message.indexOf("bookmark doesn't exist") > 0);
            }
            error = null;
            $ctx.state = 44;
            break;
          case 44:
            $ctx.state = 49;
            return host.stopOutdatedVersions("wf");
          case 49:
            $ctx.maybeThrow();
            $ctx.state = 51;
            break;
          case 51:
            $ctx.state = (hostOptions && hostOptions.persistence) ? 52 : 58;
            break;
          case 52:
            $ctx.state = 53;
            return host.persistence.loadPromotedProperties("wf", id);
          case 53:
            promotedProperties$__5 = $ctx.sent;
            $ctx.state = 55;
            break;
          case 55:
            assert(promotedProperties$__5 === null);
            $ctx.state = 57;
            break;
          case 58:
            assert(i === 1);
            $ctx.state = 57;
            break;
          case 57:
            $ctx.state = 62;
            return (host.invokeMethod("wf", "start", id));
          case 62:
            result = $ctx.sent;
            $ctx.state = 64;
            break;
          case 64:
            assert(!result);
            $ctx.state = 100;
            break;
          case 100:
            $ctx.pushTry(71, null);
            $ctx.state = 74;
            break;
          case 74:
            $ctx.state = 66;
            return (host.invokeMethod("wf", "start", id));
          case 66:
            result = $ctx.sent;
            $ctx.state = 68;
            break;
          case 68:
            assert(false);
            $ctx.state = 70;
            break;
          case 70:
            $ctx.popTry();
            $ctx.state = 76;
            break;
          case 71:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            e = $ctx.storedException;
            $ctx.state = 77;
            break;
          case 77:
            assert(e.message.indexOf("bookmark doesn't exist") > 0);
            error = null;
            $ctx.state = 76;
            break;
          case 76:
            $ctx.state = 81;
            return Bluebird.delay(100);
          case 81:
            $ctx.maybeThrow();
            $ctx.state = 83;
            break;
          case 83:
            $ctx.state = (hostOptions && hostOptions.persistence) ? 84 : 90;
            break;
          case 84:
            $ctx.state = 85;
            return host.persistence.loadPromotedProperties("wf", id);
          case 85:
            promotedProperties$__6 = $ctx.sent;
            $ctx.state = 87;
            break;
          case 87:
            assert(promotedProperties$__6);
            assert(promotedProperties$__6.i === 1);
            assert.equal(_.keys(promotedProperties$__6).length, 1);
            $ctx.state = 89;
            break;
          case 90:
            assert(i === 2);
            $ctx.state = 89;
            break;
          case 89:
            assert(trace.length === 2);
            assert(trace[0].workflowName === "wf");
            assert(trace[0].workflowVersion === 0);
            assert(trace[0].instanceId === id);
            assert(trace[1].workflowName === "wf");
            assert(trace[1].workflowVersion === 1);
            assert(trace[1].instanceId === id);
            $ctx.state = 104;
            $ctx.finallyFallThrough = 102;
            break;
          case 104:
            $ctx.popTry();
            $ctx.state = 110;
            break;
          case 110:
            host.shutdown();
            $ctx.state = 108;
            break;
          case 102:
            assert.deepEqual(error, null);
            $ctx.state = -2;
            break;
          case 108:
            $ctx.state = $ctx.finallyFallThrough;
            break;
          default:
            return $ctx.end();
        }
    }, $__10, this);
  }))
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvc3RpbmdUZXN0Q29tbW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBRUEsQUFBSSxFQUFBLENBQUEsT0FBTSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsV0FBVSxDQUFDLENBQUM7QUFDbEMsQUFBSSxFQUFBLENBQUEsY0FBYSxFQUFJLENBQUEsT0FBTSxXQUFXLGVBQWUsQ0FBQztBQUN0RCxBQUFJLEVBQUEsQ0FBQSxZQUFXLEVBQUksQ0FBQSxPQUFNLFFBQVEsYUFBYSxDQUFDO0FBQy9DLEFBQUksRUFBQSxDQUFBLGNBQWEsRUFBSSxDQUFBLE9BQU0sV0FBVyxlQUFlLENBQUM7QUFDdEQsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsWUFBVyxFQUFJLENBQUEsT0FBTSxPQUFPLGFBQWEsQ0FBQztBQUM5QyxBQUFJLEVBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQztBQUNsQyxBQUFJLEVBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxRQUFPLFVBQVUsQ0FBQztBQUM5QixBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQztBQUM5QixNQUFNLEFBQUMsQ0FBQyxZQUFXLENBQUMsQ0FBQztBQUNyQixBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLE9BQU8sT0FBTyxDQUFDO0FBRWxDLEtBQUssUUFBUSxFQUFJO0FBQ2IsZ0JBQWMsQ0FBRyxDQUFBLEtBQUksQUFBQyxDQWYxQixlQUFjLHNCQUFzQixBQUFDLENBZVYsY0FBVyxXQUFVOzs7Ozs7QUFmaEQsU0FBTyxDQUFQLGVBQWMsd0JBQXdCLEFBQWQsQ0FBeEIsU0FBUyxJQUFHLENBQUc7QUFDVCxZQUFPLElBQUc7OztBQWVSLHNCQUFVLEVBQUksQ0FBQSxDQUFBLE9B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bUJBQW1CLE1BQW9CLENBQUE7OztBQUExQyxlQUFHLE9BQU8sQUFBQyxFQUFDLENBQUM7Ozs7QUE4bEJELGVBQUcsU0FBUyxBQUFDLEVBQUMsQ0FBQzs7OztBQUduQixpQkFBSyxVQUFVLEFBQUMsQ0FBQyxLQUFJLENBQUcsS0FBRyxDQUFDLENBQUM7Ozs7QUFobUJmLGVBQUcsTUFBTSxFQUFJLENBQUEsSUFBRyxtQkFBbUIsQ0FBQztBQUNwQyxpQkFBSzs7QUFGM0IsaUJBQU8sQ0FBQSxJQUFHLElBQUksQUFBQyxFQUFDLENBQUE7O0FBQ21CLElBQy9CLFFBQTZCLEtBQUcsQ0FBQyxDQUFDO0VBZ21CbEMsQ0FsbUJtRCxDQWttQmxEO0FBQUEsQUFDTCxDQUFDO0FBQ0QiLCJmaWxlIjoiaG9zdGluZy9ob3N0aW5nVGVzdENvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiJ0ZXN0cy9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubGV0IHdmNG5vZGUgPSByZXF1aXJlKFwiLi4vLi4vLi4vXCIpO1xubGV0IGFjdGl2aXR5TWFya3VwID0gd2Y0bm9kZS5hY3Rpdml0aWVzLmFjdGl2aXR5TWFya3VwO1xubGV0IFdvcmtmbG93SG9zdCA9IHdmNG5vZGUuaG9zdGluZy5Xb3JrZmxvd0hvc3Q7XG5sZXQgQ29uc29sZVRyYWNrZXIgPSB3ZjRub2RlLmFjdGl2aXRpZXMuQ29uc29sZVRyYWNrZXI7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgYXN5bmNIZWxwZXJzID0gd2Y0bm9kZS5jb21tb24uYXN5bmNIZWxwZXJzO1xubGV0IEJsdWViaXJkID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xubGV0IGFzeW5jID0gQmx1ZWJpcmQuY29yb3V0aW5lO1xubGV0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG5yZXF1aXJlKFwiZGF0ZS11dGlsc1wiKTtcbmxldCBlcnJvcnMgPSB3ZjRub2RlLmNvbW1vbi5lcnJvcnM7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRvQmFzaWNIb3N0VGVzdDogYXN5bmMoZnVuY3Rpb24qIChob3N0T3B0aW9ucykge1xuICAgICAgICBob3N0T3B0aW9ucyA9IF8uZXh0ZW5kKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVuYWJsZVByb21vdGlvbnM6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBob3N0T3B0aW9ucyk7XG5cbiAgICAgICAgbGV0IHdvcmtmbG93ID0ge1xuICAgICAgICAgICAgXCJAd29ya2Zsb3dcIjoge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwid2ZcIixcbiAgICAgICAgICAgICAgICBcIiF2XCI6IG51bGwsXG4gICAgICAgICAgICAgICAgXCIheFwiOiAwLFxuICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmVnaW5NZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwiZm9vXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuQ3JlYXRlSW5zdGFuY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJ2XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAZW5kTWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcImZvb1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogXCI9IHRoaXMudlswXSAqIHRoaXMudlswXVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRvXCI6IFwidlwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDY2NixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJ4XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcImJhclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBcIlswXVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogXCI9IHRoaXMudiAqIDJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcInNvbWUgc3RyaW5nIGZvciB3ZiByZXN1bHQgYnV0IG5vdCBmb3IgdGhlIG1ldGhvZCByZXN1bHRcIlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICBsZXQgaG9zdCA9IG5ldyBXb3JrZmxvd0hvc3QoaG9zdE9wdGlvbnMpO1xuICAgICAgICBob3N0Lm9uY2UoXCJlcnJvclwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vaG9zdC5hZGRUcmFja2VyKG5ldyBDb25zb2xlVHJhY2tlcigpKTtcblxuICAgICAgICAgICAgaG9zdC5yZWdpc3RlcldvcmtmbG93KHdvcmtmbG93KTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcImZvb1wiLCBbNV0pKTtcblxuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgMjUpO1xuXG4gICAgICAgICAgICAvLyBWZXJpZnkgcHJvbW90ZWRQcm9wZXJ0aWVzOlxuICAgICAgICAgICAgaWYgKGhvc3RPcHRpb25zICYmIGhvc3RPcHRpb25zLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIDUpO1xuICAgICAgICAgICAgICAgIGFzc2VydC5vayhwcm9tb3RlZFByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChwcm9tb3RlZFByb3BlcnRpZXMudiwgMjUpO1xuICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChwcm9tb3RlZFByb3BlcnRpZXMueCwgNjY2KTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoXy5rZXlzKHByb21vdGVkUHJvcGVydGllcykubGVuZ3RoLCAyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJiYXJcIiwgWzVdKSk7XG5cbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIDUwKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGhvc3Quc2h1dGRvd24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5kZWVwRXF1YWwoZXJyb3IsIG51bGwpO1xuICAgIH0pLFxuXG4gICAgZG9DYWxjdWxhdG9yVGVzdDogYXN5bmMoZnVuY3Rpb24qIChob3N0T3B0aW9ucykge1xuICAgICAgICBsZXQgd29ya2Zsb3cgPSB7XG4gICAgICAgICAgICBcIkB3b3JrZmxvd1wiOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJjYWxjdWxhdG9yXCIsXG4gICAgICAgICAgICAgICAgcnVubmluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbnB1dEFyZ3M6IG51bGwsXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlOiAwLFxuICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAd2hpbGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogXCI9IHRoaXMucnVubmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAcGlja1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJBZGQgYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkFkZCBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJhZGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdLmlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0b1wiOiBcImlucHV0QXJnc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuY3VycmVudFZhbHVlICsgdGhpcy5pbnB1dEFyZ3NbMF0udmFsdWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiY3VycmVudFZhbHVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiU3VidHJhY3QgYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIlN1YnRyYWN0IG1ldGhvZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcInN1YnRyYWN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBcIlswXS5pZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJpbnB1dEFyZ3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiPSB0aGlzLmN1cnJlbnRWYWx1ZSAtIHRoaXMuaW5wdXRBcmdzWzBdLnZhbHVlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcImN1cnJlbnRWYWx1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIk11bHRpcGx5IGJsb2NrXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJNdWx0aXBseSBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJtdWx0aXBseVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuQ3JlYXRlSW5zdGFuY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRvXCI6IFwiaW5wdXRBcmdzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIj0gdGhpcy5jdXJyZW50VmFsdWUgKiB0aGlzLmlucHV0QXJnc1swXS52YWx1ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJjdXJyZW50VmFsdWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJEaXZpZGUgYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkRpdmlkZSBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJkaXZpZGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdLmlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0b1wiOiBcImlucHV0QXJnc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuY3VycmVudFZhbHVlIC8gdGhpcy5pbnB1dEFyZ3NbMF0udmFsdWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiY3VycmVudFZhbHVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkVxdWFscyBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJlcXVhbHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdLmlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IFwiPSB0aGlzLmN1cnJlbnRWYWx1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIlJlc2V0IGJsb2NrXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJSZXNldCBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJyZXNldFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJydW5uaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgbGV0IGhvc3QgPSBuZXcgV29ya2Zsb3dIb3N0KGhvc3RPcHRpb25zKTtcbiAgICAgICAgaG9zdC5vbmNlKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhvc3QucmVnaXN0ZXJXb3JrZmxvdyh3b3JrZmxvdyk7XG4gICAgICAgICAgICAvL2hvc3QuYWRkVHJhY2tlcihuZXcgQ29uc29sZVRyYWNrZXIoKSk7XG5cbiAgICAgICAgICAgIGxldCBhcmcgPSB7IGlkOiBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwMCkgKyAxKSB9O1xuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImVxdWFsc1wiLCBbYXJnXSkpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgMCk7XG5cbiAgICAgICAgICAgIGFyZy52YWx1ZSA9IDU1O1xuICAgICAgICAgICAgeWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImFkZFwiLCBbYXJnXSkpO1xuXG4gICAgICAgICAgICBpZiAoaG9zdE9wdGlvbnMgJiYgaG9zdE9wdGlvbnMucGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICBob3N0LnNodXRkb3duKCk7XG4gICAgICAgICAgICAgICAgaG9zdCA9IG5ldyBXb3JrZmxvd0hvc3QoaG9zdE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGhvc3Qub25jZShcImVycm9yXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBob3N0LnJlZ2lzdGVyV29ya2Zsb3cod29ya2Zsb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZXF1YWxzXCIsIFthcmddKSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCA1NSk7XG5cbiAgICAgICAgICAgIGFyZy52YWx1ZSA9IDU7XG4gICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZGl2aWRlXCIsIFthcmddKSk7XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZXF1YWxzXCIsIFthcmddKSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCAxMSk7XG5cbiAgICAgICAgICAgIGFyZy52YWx1ZSA9IDE7XG4gICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwic3VidHJhY3RcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJlcXVhbHNcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIDEwKTtcblxuICAgICAgICAgICAgYXJnLnZhbHVlID0gMTAwO1xuICAgICAgICAgICAgeWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcIm11bHRpcGx5XCIsIFthcmddKSk7XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZXF1YWxzXCIsIFthcmddKSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCAxMDAwKTtcblxuICAgICAgICAgICAgZGVsZXRlIGFyZy52YWx1ZTtcbiAgICAgICAgICAgIHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJyZXNldFwiLCBbYXJnXSkpO1xuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImVxdWFsc1wiLCBbYXJnXSkpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgMCk7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBhcmcudmFsdWU7XG4gICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwicmVzZXRcIiwgW2FyZ10pKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGhvc3Quc2h1dGRvd24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5kZWVwRXF1YWwoZXJyb3IsIG51bGwpO1xuICAgIH0pLFxuXG4gICAgZG9EZWxheVRlc3Q6IGFzeW5jKGZ1bmN0aW9uKiAoaG9zdE9wdGlvbnMpIHtcbiAgICAgICAgaG9zdE9wdGlvbnMgPSBfLmV4dGVuZChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlbmFibGVQcm9tb3Rpb25zOiB0cnVlLFxuICAgICAgICAgICAgICAgIHdha2VVcE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWw6IDEwMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBob3N0T3B0aW9ucyk7XG5cbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICBsZXQgd29ya2Zsb3cgPSB7XG4gICAgICAgICAgICBcIkB3b3JrZmxvd1wiOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJ3ZlwiLFxuICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwiIWlcIjogMCxcbiAgICAgICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQHdoaWxlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogXCI9ICF0aGlzLmRvbmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBwaWNrXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcInN0YXJ0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwic3RvcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiZG9uZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAZGVsYXlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXM6IDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuaSArIDFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgPSB0aGlzLmk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgIGxldCBob3N0ID0gbmV3IFdvcmtmbG93SG9zdChob3N0T3B0aW9ucyk7XG4gICAgICAgIGhvc3Qub25jZShcImVycm9yXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlcnJvciA9IGU7XG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy9ob3N0LmFkZFRyYWNrZXIobmV3IENvbnNvbGVUcmFja2VyKCkpO1xuICAgICAgICAgICAgaG9zdC5yZWdpc3RlcldvcmtmbG93KHdvcmtmbG93KTtcblxuICAgICAgICAgICAgbGV0IGlkID0gXCIxXCI7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIHN0YXJ0IHRoZSB3b3JrZmxvdzpcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGRvIG5vdGhpbmcgcGFydGljdWxhciwgYnV0IHNob3VsZCB3b3JrOlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgYXNzZXJ0KCFyZXN1bHQpO1xuXG4gICAgICAgICAgICAvLyBDYWxsaW5nIHVuZXhpc3RlZCBtZXRob2Qgc2hvdWxkIHRocm93OlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInB1cHVcIiwgaWQpKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiVGhhdCBzaG91bGQgdGhyb3chXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgZXJyb3JzLk1ldGhvZElzTm90QWNjZXNzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgZG8gbm90aGluZyBwYXJ0aWN1bGFyLCBidXQgc2hvdWxkIHdvcmsgYWdhaW46XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIExldCdzIHdhaXQuXG4gICAgICAgICAgICB5aWVsZCBCbHVlYmlyZC5kZWxheSg0MDApO1xuXG4gICAgICAgICAgICAvLyBWZXJpZnkgcHJvbW90ZWRQcm9wZXJ0aWVzOlxuICAgICAgICAgICAgaWYgKGhvc3RPcHRpb25zICYmIGhvc3RPcHRpb25zLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQocHJvbW90ZWRQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQocHJvbW90ZWRQcm9wZXJ0aWVzLmkgPiAwKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoXy5rZXlzKHByb21vdGVkUHJvcGVydGllcykubGVuZ3RoLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFzc2VydChpID4gMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGRvIG5vdGhpbmcgcGFydGljdWxhciwgYnV0IHNob3VsZCB3b3JrIGFnYWluOlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgYXNzZXJ0KCFyZXN1bHQpO1xuXG4gICAgICAgICAgICAvLyBTdG9wOlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdG9wXCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBob3N0LnNodXRkb3duKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQuZGVlcEVxdWFsKGVycm9yLCBudWxsKTtcbiAgICB9KSxcblxuICAgIGRvU3RvcE91dGRhdGVkVmVyc2lvbnNUZXN0OiBhc3luYyhmdW5jdGlvbiogKGhvc3RPcHRpb25zKSB7XG4gICAgICAgIGhvc3RPcHRpb25zID0gXy5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZW5hYmxlUHJvbW90aW9uczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB3YWtlVXBPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsOiAxMDAwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhvc3RPcHRpb25zKTtcblxuICAgICAgICBsZXQgdHJhY2UgPSBbXTtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgZGVmID0ge1xuICAgICAgICAgICAgXCJAd29ya2Zsb3dcIjoge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwid2ZcIixcbiAgICAgICAgICAgICAgICBcIiFpXCI6IDAsXG4gICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcInN0YXJ0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAZnVuY1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBpbnN0YW5jZURhdGFcIjoge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNlLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBkZWxheVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXM6IDEwMDAwMFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBmdW5jXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGluc3RhbmNlRGF0YVwiOiB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2UucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IFwiQHRocm93XCI6IHsgZXJyb3I6IFwiSHVoLlwiIH0gfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHdvcmtmbG93MCA9IGFjdGl2aXR5TWFya3VwLnBhcnNlKGRlZik7XG4gICAgICAgIGRlZltcIkB3b3JrZmxvd1wiXS52ZXJzaW9uID0gMTtcbiAgICAgICAgbGV0IHdvcmtmbG93MSA9IGFjdGl2aXR5TWFya3VwLnBhcnNlKGRlZik7XG5cbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgbGV0IGhvc3QgPSBuZXcgV29ya2Zsb3dIb3N0KGhvc3RPcHRpb25zKTtcbiAgICAgICAgaG9zdC5vbmNlKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBob3N0LnJlZ2lzdGVyV29ya2Zsb3cod29ya2Zsb3cwKTtcblxuICAgICAgICAgICAgbGV0IGlkID0gXCIxXCI7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIHN0YXJ0IHRoZSB3b3JrZmxvdzpcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGZhaWwsIGJlY2F1c2UgY29udHJvbCBmbG93IGhhcyBiZWVuIHN0ZXBwZWQgb3ZlcjpcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGFzc2VydChlLm1lc3NhZ2UuaW5kZXhPZihcImJvb2ttYXJrIGRvZXNuJ3QgZXhpc3RcIikgPiAwKTtcbiAgICAgICAgICAgICAgICBlcnJvciA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExldCdzIHdhaXQuXG4gICAgICAgICAgICB5aWVsZCBCbHVlYmlyZC5kZWxheSgxMDApO1xuXG4gICAgICAgICAgICAvLyBWZXJpZnkgcHJvbW90ZWRQcm9wZXJ0aWVzOlxuICAgICAgICAgICAgaWYgKGhvc3RPcHRpb25zICYmIGhvc3RPcHRpb25zLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQocHJvbW90ZWRQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQocHJvbW90ZWRQcm9wZXJ0aWVzLmkgPT09IDEpO1xuICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChfLmtleXMocHJvbW90ZWRQcm9wZXJ0aWVzKS5sZW5ndGgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGkgPT09IDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaG9zdE9wdGlvbnMucGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTdGFydCBhbm90aGVyOlxuICAgICAgICAgICAgICAgIGhvc3Quc2h1dGRvd24oKTtcbiAgICAgICAgICAgICAgICBob3N0ID0gbmV3IFdvcmtmbG93SG9zdChob3N0T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaG9zdC5vbmNlKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBob3N0LnJlZ2lzdGVyV29ya2Zsb3cod29ya2Zsb3cxKTtcblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgZmFpbCwgYmVjYXVzZSBhbiBvbGRlciB2ZXJzaW9uIGlzIGFscmVhZHkgcnVubmluZzpcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgICAgIGFzc2VydChmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChob3N0T3B0aW9ucy5wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbiBwZXJzaXN0ZW5jZSBpdCdzIGEgdmVyc2lvbiAwIHdvcmtmbG93LCBidXQgdGhhdCdzIG5vdCByZWdpc3RlcmVkIGluIHRoZSBuZXcgaG9zdCwgc28gaWYgZmFpbHM6XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChlLm1lc3NhZ2UuaW5kZXhPZihcImhhcyBub3QgYmVlbiByZWdpc3RlcmVkXCIpID4gMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHdvcmtmbG93IHZlcnNpb24gMCBhbmQgMSByZWdpc3RlcmVkLCBhbmQgdHJ5IHRvIHN0YXJ0IHRoZSBhbHJlYWR5IHN0YXJ0ZWQgaW5zdGFuY2UgMSwgc28gaXQgc2hvdWxkIGZhaWwgd2l0aCBCTSBkb2Vzbid0IGV4aXN0czpcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KGUubWVzc2FnZS5pbmRleE9mKFwiYm9va21hcmsgZG9lc24ndCBleGlzdFwiKSA+IDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlcnJvciA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vdywgd2UncmUgc3RvcHBpbmcgYWxsIG9sZCBpbnN0YW5jZXM6XG4gICAgICAgICAgICB5aWVsZCBob3N0LnN0b3BPdXRkYXRlZFZlcnNpb25zKFwid2ZcIik7XG5cbiAgICAgICAgICAgIC8vIFZlcmlmeSBwcm9tb3RlZFByb3BlcnRpZXM6XG4gICAgICAgICAgICBpZiAoaG9zdE9wdGlvbnMgJiYgaG9zdE9wdGlvbnMucGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJvbW90ZWRQcm9wZXJ0aWVzID0geWllbGQgaG9zdC5wZXJzaXN0ZW5jZS5sb2FkUHJvbW90ZWRQcm9wZXJ0aWVzKFwid2ZcIiwgaWQpO1xuICAgICAgICAgICAgICAgIGFzc2VydChwcm9tb3RlZFByb3BlcnRpZXMgPT09IG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGkgPT09IDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBPaywgbGV0J3Mgc3RhcnQgb3ZlciFcblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgc3RhcnQgdGhlIHdvcmtmbG93OlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgYXNzZXJ0KCFyZXN1bHQpO1xuXG4gICAgICAgICAgICAvLyBUaGF0IHNob3VsZCBmYWlsLCBiZWNhdXNlIGNvbnRyb2wgZmxvdyBoYXMgYmVlbiBzdGVwcGVkIG92ZXI6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZS5tZXNzYWdlLmluZGV4T2YoXCJib29rbWFyayBkb2Vzbid0IGV4aXN0XCIpID4gMCk7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXQncyB3YWl0LlxuICAgICAgICAgICAgeWllbGQgQmx1ZWJpcmQuZGVsYXkoMTAwKTtcblxuICAgICAgICAgICAgLy8gVmVyaWZ5IHByb21vdGVkUHJvcGVydGllczpcbiAgICAgICAgICAgIGlmIChob3N0T3B0aW9ucyAmJiBob3N0T3B0aW9ucy5wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgIGxldCBwcm9tb3RlZFByb3BlcnRpZXMgPSB5aWVsZCBob3N0LnBlcnNpc3RlbmNlLmxvYWRQcm9tb3RlZFByb3BlcnRpZXMoXCJ3ZlwiLCBpZCk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcy5pID09PSAxKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoXy5rZXlzKHByb21vdGVkUHJvcGVydGllcykubGVuZ3RoLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFzc2VydChpID09PSAyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlLmxlbmd0aCA9PT0gMik7XG4gICAgICAgICAgICBhc3NlcnQodHJhY2VbMF0ud29ya2Zsb3dOYW1lID09PSBcIndmXCIpO1xuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlWzBdLndvcmtmbG93VmVyc2lvbiA9PT0gMCk7XG4gICAgICAgICAgICBhc3NlcnQodHJhY2VbMF0uaW5zdGFuY2VJZCA9PT0gaWQpO1xuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlWzFdLndvcmtmbG93TmFtZSA9PT0gXCJ3ZlwiKTtcbiAgICAgICAgICAgIGFzc2VydCh0cmFjZVsxXS53b3JrZmxvd1ZlcnNpb24gPT09IDEpO1xuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlWzFdLmluc3RhbmNlSWQgPT09IGlkKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGhvc3Quc2h1dGRvd24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5kZWVwRXF1YWwoZXJyb3IsIG51bGwpO1xuICAgIH0pXG59O1xuIl19
