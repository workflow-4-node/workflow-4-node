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
            workflow = activityMarkup.parse({"@workflow": {
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
              }});
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
            workflow = activityMarkup.parse({"@workflow": {
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
              }});
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
            workflow = activityMarkup.parse({"@workflow": {
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
              }});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvc3RpbmdUZXN0Q29tbW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBRUEsQUFBSSxFQUFBLENBQUEsT0FBTSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsV0FBVSxDQUFDLENBQUM7QUFDbEMsQUFBSSxFQUFBLENBQUEsY0FBYSxFQUFJLENBQUEsT0FBTSxXQUFXLGVBQWUsQ0FBQztBQUN0RCxBQUFJLEVBQUEsQ0FBQSxZQUFXLEVBQUksQ0FBQSxPQUFNLFFBQVEsYUFBYSxDQUFDO0FBQy9DLEFBQUksRUFBQSxDQUFBLGNBQWEsRUFBSSxDQUFBLE9BQU0sV0FBVyxlQUFlLENBQUM7QUFDdEQsQUFBSSxFQUFBLENBQUEsQ0FBQSxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUM7QUFDekIsQUFBSSxFQUFBLENBQUEsWUFBVyxFQUFJLENBQUEsT0FBTSxPQUFPLGFBQWEsQ0FBQztBQUM5QyxBQUFJLEVBQUEsQ0FBQSxRQUFPLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxVQUFTLENBQUMsQ0FBQztBQUNsQyxBQUFJLEVBQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxRQUFPLFVBQVUsQ0FBQztBQUM5QixBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQztBQUM5QixNQUFNLEFBQUMsQ0FBQyxZQUFXLENBQUMsQ0FBQztBQUNyQixBQUFJLEVBQUEsQ0FBQSxNQUFLLEVBQUksQ0FBQSxPQUFNLE9BQU8sT0FBTyxDQUFDO0FBRWxDLEtBQUssUUFBUSxFQUFJO0FBQ2IsZ0JBQWMsQ0FBRyxDQUFBLEtBQUksQUFBQyxDQWYxQixlQUFjLHNCQUFzQixBQUFDLENBZVYsY0FBVyxXQUFVOzs7Ozs7QUFmaEQsU0FBTyxDQUFQLGVBQWMsd0JBQXdCLEFBQWQsQ0FBeEIsU0FBUyxJQUFHLENBQUc7QUFDVCxZQUFPLElBQUc7OztBQWVSLHNCQUFVLEVBQUksQ0FBQSxDQUFBLE9B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QSxDQUFDLENBQUM7QUFDdEMsaUJBQUssQUFBQyxDQUFDLEtBQUksQ0FBRSxDQUFBLENBQUMsV0FBVyxJQUFNLEdBQUMsQ0FBQyxDQUFDOztBQTlsQjlDLGVBQUcsbUJBQW1CLE1BQW9CLENBQUE7OztBQUExQyxlQUFHLE9BQU8sQUFBQyxFQUFDLENBQUM7Ozs7QUFpbUJELGVBQUcsU0FBUyxBQUFDLEVBQUMsQ0FBQzs7OztBQUduQixpQkFBSyxVQUFVLEFBQUMsQ0FBQyxLQUFJLENBQUcsS0FBRyxDQUFDLENBQUM7Ozs7QUFubUJmLGVBQUcsTUFBTSxFQUFJLENBQUEsSUFBRyxtQkFBbUIsQ0FBQztBQUNwQyxpQkFBSzs7QUFGM0IsaUJBQU8sQ0FBQSxJQUFHLElBQUksQUFBQyxFQUFDLENBQUE7O0FBQ21CLElBQy9CLFFBQTZCLEtBQUcsQ0FBQyxDQUFDO0VBbW1CbEMsQ0FybUJtRCxDQXFtQmxEO0FBQUEsQUFDTCxDQUFDO0FBQ0QiLCJmaWxlIjoiaG9zdGluZy9ob3N0aW5nVGVzdENvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiJ0ZXN0cy9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubGV0IHdmNG5vZGUgPSByZXF1aXJlKFwiLi4vLi4vLi4vXCIpO1xubGV0IGFjdGl2aXR5TWFya3VwID0gd2Y0bm9kZS5hY3Rpdml0aWVzLmFjdGl2aXR5TWFya3VwO1xubGV0IFdvcmtmbG93SG9zdCA9IHdmNG5vZGUuaG9zdGluZy5Xb3JrZmxvd0hvc3Q7XG5sZXQgQ29uc29sZVRyYWNrZXIgPSB3ZjRub2RlLmFjdGl2aXRpZXMuQ29uc29sZVRyYWNrZXI7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgYXN5bmNIZWxwZXJzID0gd2Y0bm9kZS5jb21tb24uYXN5bmNIZWxwZXJzO1xubGV0IEJsdWViaXJkID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xubGV0IGFzeW5jID0gQmx1ZWJpcmQuY29yb3V0aW5lO1xubGV0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XG5yZXF1aXJlKFwiZGF0ZS11dGlsc1wiKTtcbmxldCBlcnJvcnMgPSB3ZjRub2RlLmNvbW1vbi5lcnJvcnM7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRvQmFzaWNIb3N0VGVzdDogYXN5bmMoZnVuY3Rpb24qIChob3N0T3B0aW9ucykge1xuICAgICAgICBob3N0T3B0aW9ucyA9IF8uZXh0ZW5kKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVuYWJsZVByb21vdGlvbnM6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBob3N0T3B0aW9ucyk7XG5cbiAgICAgICAgbGV0IHdvcmtmbG93ID0gYWN0aXZpdHlNYXJrdXAucGFyc2UoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJAd29ya2Zsb3dcIjoge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIndmXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiIXZcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgXCIheFwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmVnaW5NZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcImZvb1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRvXCI6IFwidlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBlbmRNZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcImZvb1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IFwiPSB0aGlzLnZbMF0gKiB0aGlzLnZbMF1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJ2XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiA2NjYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcInhcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJiYXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogXCI9IHRoaXMudiAqIDJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNvbWUgc3RyaW5nIGZvciB3ZiByZXN1bHQgYnV0IG5vdCBmb3IgdGhlIG1ldGhvZCByZXN1bHRcIlxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgbGV0IGhvc3QgPSBuZXcgV29ya2Zsb3dIb3N0KGhvc3RPcHRpb25zKTtcbiAgICAgICAgaG9zdC5vbmNlKFwiZXJyb3JcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvL2hvc3QuYWRkVHJhY2tlcihuZXcgQ29uc29sZVRyYWNrZXIoKSk7XG5cbiAgICAgICAgICAgIGhvc3QucmVnaXN0ZXJXb3JrZmxvdyh3b3JrZmxvdyk7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJmb29cIiwgWzVdKSk7XG5cbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIDI1KTtcblxuICAgICAgICAgICAgLy8gVmVyaWZ5IHByb21vdGVkUHJvcGVydGllczpcbiAgICAgICAgICAgIGlmIChob3N0T3B0aW9ucyAmJiBob3N0T3B0aW9ucy5wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgIGxldCBwcm9tb3RlZFByb3BlcnRpZXMgPSB5aWVsZCBob3N0LnBlcnNpc3RlbmNlLmxvYWRQcm9tb3RlZFByb3BlcnRpZXMoXCJ3ZlwiLCA1KTtcbiAgICAgICAgICAgICAgICBhc3NlcnQub2socHJvbW90ZWRQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocHJvbW90ZWRQcm9wZXJ0aWVzLnYsIDI1KTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocHJvbW90ZWRQcm9wZXJ0aWVzLngsIDY2Nik7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKF8ua2V5cyhwcm9tb3RlZFByb3BlcnRpZXMpLmxlbmd0aCwgMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwiYmFyXCIsIFs1XSkpO1xuXG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCA1MCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBob3N0LnNodXRkb3duKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQuZGVlcEVxdWFsKGVycm9yLCBudWxsKTtcbiAgICB9KSxcblxuICAgIGRvQ2FsY3VsYXRvclRlc3Q6IGFzeW5jKGZ1bmN0aW9uKiAoaG9zdE9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHdvcmtmbG93ID0gYWN0aXZpdHlNYXJrdXAucGFyc2UoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJAd29ya2Zsb3dcIjoge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcImNhbGN1bGF0b3JcIixcbiAgICAgICAgICAgICAgICAgICAgcnVubmluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRBcmdzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB3aGlsZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogXCI9IHRoaXMucnVubmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBwaWNrXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkFkZCBibG9ja1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkFkZCBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwiYWRkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJpbnB1dEFyZ3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuY3VycmVudFZhbHVlICsgdGhpcy5pbnB1dEFyZ3NbMF0udmFsdWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcImN1cnJlbnRWYWx1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiU3VidHJhY3QgYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQG1ldGhvZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJTdWJ0cmFjdCBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwic3VidHJhY3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBcIlswXS5pZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuQ3JlYXRlSW5zdGFuY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkB0b1wiOiBcImlucHV0QXJnc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIj0gdGhpcy5jdXJyZW50VmFsdWUgLSB0aGlzLmlucHV0QXJnc1swXS52YWx1ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiY3VycmVudFZhbHVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBibG9ja1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJNdWx0aXBseSBibG9ja1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIk11bHRpcGx5IG1ldGhvZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJtdWx0aXBseVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VJZFBhdGg6IFwiWzBdLmlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRvXCI6IFwiaW5wdXRBcmdzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBhc3NpZ25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiPSB0aGlzLmN1cnJlbnRWYWx1ZSAqIHRoaXMuaW5wdXRBcmdzWzBdLnZhbHVlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJjdXJyZW50VmFsdWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkRpdmlkZSBibG9ja1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkRpdmlkZSBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwiZGl2aWRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJpbnB1dEFyZ3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCI9IHRoaXMuY3VycmVudFZhbHVlIC8gdGhpcy5pbnB1dEFyZ3NbMF0udmFsdWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBcImN1cnJlbnRWYWx1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAbWV0aG9kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIkVxdWFscyBtZXRob2RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwiZXF1YWxzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBcIj0gdGhpcy5jdXJyZW50VmFsdWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIlJlc2V0IGJsb2NrXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiUmVzZXQgbWV0aG9kXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiBcInJlc2V0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF0uaWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJydW5uaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgIGxldCBob3N0ID0gbmV3IFdvcmtmbG93SG9zdChob3N0T3B0aW9ucyk7XG4gICAgICAgIGhvc3Qub25jZShcImVycm9yXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlcnJvciA9IGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBob3N0LnJlZ2lzdGVyV29ya2Zsb3cod29ya2Zsb3cpO1xuICAgICAgICAgICAgLy9ob3N0LmFkZFRyYWNrZXIobmV3IENvbnNvbGVUcmFja2VyKCkpO1xuXG4gICAgICAgICAgICBsZXQgYXJnID0geyBpZDogTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwMDApICsgMSkgfTtcblxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJlcXVhbHNcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIDApO1xuXG4gICAgICAgICAgICBhcmcudmFsdWUgPSA1NTtcbiAgICAgICAgICAgIHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJhZGRcIiwgW2FyZ10pKTtcblxuICAgICAgICAgICAgaWYgKGhvc3RPcHRpb25zICYmIGhvc3RPcHRpb25zLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgaG9zdC5zaHV0ZG93bigpO1xuICAgICAgICAgICAgICAgIGhvc3QgPSBuZXcgV29ya2Zsb3dIb3N0KGhvc3RPcHRpb25zKTtcbiAgICAgICAgICAgICAgICBob3N0Lm9uY2UoXCJlcnJvclwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciA9IGU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaG9zdC5yZWdpc3RlcldvcmtmbG93KHdvcmtmbG93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImVxdWFsc1wiLCBbYXJnXSkpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgNTUpO1xuXG4gICAgICAgICAgICBhcmcudmFsdWUgPSA1O1xuICAgICAgICAgICAgeWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImRpdmlkZVwiLCBbYXJnXSkpO1xuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImVxdWFsc1wiLCBbYXJnXSkpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgMTEpO1xuXG4gICAgICAgICAgICBhcmcudmFsdWUgPSAxO1xuICAgICAgICAgICAgeWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcInN1YnRyYWN0XCIsIFthcmddKSk7XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwiZXF1YWxzXCIsIFthcmddKSk7XG4gICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCAxMCk7XG5cbiAgICAgICAgICAgIGFyZy52YWx1ZSA9IDEwMDtcbiAgICAgICAgICAgIHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJtdWx0aXBseVwiLCBbYXJnXSkpO1xuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcImVxdWFsc1wiLCBbYXJnXSkpO1xuICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgMTAwMCk7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBhcmcudmFsdWU7XG4gICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJjYWxjdWxhdG9yXCIsIFwicmVzZXRcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcImNhbGN1bGF0b3JcIiwgXCJlcXVhbHNcIiwgW2FyZ10pKTtcbiAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIDApO1xuXG4gICAgICAgICAgICBkZWxldGUgYXJnLnZhbHVlO1xuICAgICAgICAgICAgeWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwiY2FsY3VsYXRvclwiLCBcInJlc2V0XCIsIFthcmddKSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBob3N0LnNodXRkb3duKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQuZGVlcEVxdWFsKGVycm9yLCBudWxsKTtcbiAgICB9KSxcblxuICAgIGRvRGVsYXlUZXN0OiBhc3luYyhmdW5jdGlvbiogKGhvc3RPcHRpb25zKSB7XG4gICAgICAgIGhvc3RPcHRpb25zID0gXy5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZW5hYmxlUHJvbW90aW9uczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB3YWtlVXBPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsOiAxMDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaG9zdE9wdGlvbnMpO1xuXG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgbGV0IHdvcmtmbG93ID0gYWN0aXZpdHlNYXJrdXAucGFyc2UoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJAd29ya2Zsb3dcIjoge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIndmXCIsXG4gICAgICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBcIiFpXCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQHdoaWxlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25kaXRpb246IFwiPSAhdGhpcy5kb25lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBwaWNrXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5DcmVhdGVJbnN0YW5jZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogXCJzdGFydFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYmxvY2tcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwic3RvcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlSWRQYXRoOiBcIlswXVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGFzc2lnblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86IFwiZG9uZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGJsb2NrXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAZGVsYXlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zOiAxMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAYXNzaWduXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogXCJpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiPSB0aGlzLmkgKyAxXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSA9IHRoaXMuaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgIGxldCBob3N0ID0gbmV3IFdvcmtmbG93SG9zdChob3N0T3B0aW9ucyk7XG4gICAgICAgIGhvc3Qub25jZShcImVycm9yXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlcnJvciA9IGU7XG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy9ob3N0LmFkZFRyYWNrZXIobmV3IENvbnNvbGVUcmFja2VyKCkpO1xuICAgICAgICAgICAgaG9zdC5yZWdpc3RlcldvcmtmbG93KHdvcmtmbG93KTtcblxuICAgICAgICAgICAgbGV0IGlkID0gXCIxXCI7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIHN0YXJ0IHRoZSB3b3JrZmxvdzpcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGRvIG5vdGhpbmcgcGFydGljdWxhciwgYnV0IHNob3VsZCB3b3JrOlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgYXNzZXJ0KCFyZXN1bHQpO1xuXG4gICAgICAgICAgICAvLyBDYWxsaW5nIHVuZXhpc3RlZCBtZXRob2Qgc2hvdWxkIHRocm93OlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInB1cHVcIiwgaWQpKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UsIFwiVGhhdCBzaG91bGQgdGhyb3chXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgZXJyb3JzLk1ldGhvZElzTm90QWNjZXNzaWJsZUVycm9yKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgZG8gbm90aGluZyBwYXJ0aWN1bGFyLCBidXQgc2hvdWxkIHdvcmsgYWdhaW46XG4gICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIExldCdzIHdhaXQuXG4gICAgICAgICAgICB5aWVsZCBCbHVlYmlyZC5kZWxheSg0MDApO1xuXG4gICAgICAgICAgICAvLyBWZXJpZnkgcHJvbW90ZWRQcm9wZXJ0aWVzOlxuICAgICAgICAgICAgaWYgKGhvc3RPcHRpb25zICYmIGhvc3RPcHRpb25zLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQocHJvbW90ZWRQcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQocHJvbW90ZWRQcm9wZXJ0aWVzLmkgPiAwKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoXy5rZXlzKHByb21vdGVkUHJvcGVydGllcykubGVuZ3RoLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFzc2VydChpID4gMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGRvIG5vdGhpbmcgcGFydGljdWxhciwgYnV0IHNob3VsZCB3b3JrIGFnYWluOlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdGFydFwiLCBpZCkpO1xuICAgICAgICAgICAgYXNzZXJ0KCFyZXN1bHQpO1xuXG4gICAgICAgICAgICAvLyBTdG9wOlxuICAgICAgICAgICAgcmVzdWx0ID0geWllbGQgKGhvc3QuaW52b2tlTWV0aG9kKFwid2ZcIiwgXCJzdG9wXCIsIGlkKSk7XG4gICAgICAgICAgICBhc3NlcnQoIXJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBob3N0LnNodXRkb3duKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhc3NlcnQuZGVlcEVxdWFsKGVycm9yLCBudWxsKTtcbiAgICB9KSxcblxuICAgIGRvU3RvcE91dGRhdGVkVmVyc2lvbnNUZXN0OiBhc3luYyhmdW5jdGlvbiogKGhvc3RPcHRpb25zKSB7XG4gICAgICAgIGhvc3RPcHRpb25zID0gXy5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZW5hYmxlUHJvbW90aW9uczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB3YWtlVXBPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsOiAxMDAwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhvc3RPcHRpb25zKTtcblxuICAgICAgICBsZXQgdHJhY2UgPSBbXTtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgZGVmID0ge1xuICAgICAgICAgICAgXCJAd29ya2Zsb3dcIjoge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwid2ZcIixcbiAgICAgICAgICAgICAgICBcIiFpXCI6IDAsXG4gICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBtZXRob2RcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbkNyZWF0ZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6IFwic3RhcnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUlkUGF0aDogXCJbMF1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkBmdW5jXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQGluc3RhbmNlRGF0YVwiOiB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFjZS5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAZGVsYXlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zOiAxMDAwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJAZnVuY1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkBpbnN0YW5jZURhdGFcIjoge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2UucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgXCJAdGhyb3dcIjogeyBlcnJvcjogXCJIdWguXCIgfSB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBsZXQgd29ya2Zsb3cwID0gYWN0aXZpdHlNYXJrdXAucGFyc2UoZGVmKTtcbiAgICAgICAgZGVmW1wiQHdvcmtmbG93XCJdLnZlcnNpb24gPSAxO1xuICAgICAgICBsZXQgd29ya2Zsb3cxID0gYWN0aXZpdHlNYXJrdXAucGFyc2UoZGVmKTtcblxuICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICBsZXQgaG9zdCA9IG5ldyBXb3JrZmxvd0hvc3QoaG9zdE9wdGlvbnMpO1xuICAgICAgICBob3N0Lm9uY2UoXCJlcnJvclwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhvc3QucmVnaXN0ZXJXb3JrZmxvdyh3b3JrZmxvdzApO1xuXG4gICAgICAgICAgICBsZXQgaWQgPSBcIjFcIjtcblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgc3RhcnQgdGhlIHdvcmtmbG93OlxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgIGFzc2VydCghcmVzdWx0KTtcblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgZmFpbCwgYmVjYXVzZSBjb250cm9sIGZsb3cgaGFzIGJlZW4gc3RlcHBlZCBvdmVyOlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZS5tZXNzYWdlLmluZGV4T2YoXCJib29rbWFyayBkb2Vzbid0IGV4aXN0XCIpID4gMCk7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXQncyB3YWl0LlxuICAgICAgICAgICAgeWllbGQgQmx1ZWJpcmQuZGVsYXkoMTAwKTtcblxuICAgICAgICAgICAgLy8gVmVyaWZ5IHByb21vdGVkUHJvcGVydGllczpcbiAgICAgICAgICAgIGlmIChob3N0T3B0aW9ucyAmJiBob3N0T3B0aW9ucy5wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgIGxldCBwcm9tb3RlZFByb3BlcnRpZXMgPSB5aWVsZCBob3N0LnBlcnNpc3RlbmNlLmxvYWRQcm9tb3RlZFByb3BlcnRpZXMoXCJ3ZlwiLCBpZCk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcy5pID09PSAxKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoXy5rZXlzKHByb21vdGVkUHJvcGVydGllcykubGVuZ3RoLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFzc2VydChpID09PSAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhvc3RPcHRpb25zLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU3RhcnQgYW5vdGhlcjpcbiAgICAgICAgICAgICAgICBob3N0LnNodXRkb3duKCk7XG4gICAgICAgICAgICAgICAgaG9zdCA9IG5ldyBXb3JrZmxvd0hvc3QoaG9zdE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGhvc3Qub25jZShcImVycm9yXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yID0gZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaG9zdC5yZWdpc3RlcldvcmtmbG93KHdvcmtmbG93MSk7XG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIGZhaWwsIGJlY2F1c2UgYW4gb2xkZXIgdmVyc2lvbiBpcyBhbHJlYWR5IHJ1bm5pbmc6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaG9zdE9wdGlvbnMucGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gcGVyc2lzdGVuY2UgaXQncyBhIHZlcnNpb24gMCB3b3JrZmxvdywgYnV0IHRoYXQncyBub3QgcmVnaXN0ZXJlZCBpbiB0aGUgbmV3IGhvc3QsIHNvIGlmIGZhaWxzOlxuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoZS5tZXNzYWdlLmluZGV4T2YoXCJoYXMgbm90IGJlZW4gcmVnaXN0ZXJlZFwiKSA+IDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSB3b3JrZmxvdyB2ZXJzaW9uIDAgYW5kIDEgcmVnaXN0ZXJlZCwgYW5kIHRyeSB0byBzdGFydCB0aGUgYWxyZWFkeSBzdGFydGVkIGluc3RhbmNlIDEsIHNvIGl0IHNob3VsZCBmYWlsIHdpdGggQk0gZG9lc24ndCBleGlzdHM6XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChlLm1lc3NhZ2UuaW5kZXhPZihcImJvb2ttYXJrIGRvZXNuJ3QgZXhpc3RcIikgPiAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOb3csIHdlJ3JlIHN0b3BwaW5nIGFsbCBvbGQgaW5zdGFuY2VzOlxuICAgICAgICAgICAgeWllbGQgaG9zdC5zdG9wT3V0ZGF0ZWRWZXJzaW9ucyhcIndmXCIpO1xuXG4gICAgICAgICAgICAvLyBWZXJpZnkgcHJvbW90ZWRQcm9wZXJ0aWVzOlxuICAgICAgICAgICAgaWYgKGhvc3RPcHRpb25zICYmIGhvc3RPcHRpb25zLnBlcnNpc3RlbmNlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb21vdGVkUHJvcGVydGllcyA9IHlpZWxkIGhvc3QucGVyc2lzdGVuY2UubG9hZFByb21vdGVkUHJvcGVydGllcyhcIndmXCIsIGlkKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQocHJvbW90ZWRQcm9wZXJ0aWVzID09PSBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFzc2VydChpID09PSAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gT2ssIGxldCdzIHN0YXJ0IG92ZXIhXG5cbiAgICAgICAgICAgIC8vIFRoYXQgc2hvdWxkIHN0YXJ0IHRoZSB3b3JrZmxvdzpcbiAgICAgICAgICAgIHJlc3VsdCA9IHlpZWxkIChob3N0Lmludm9rZU1ldGhvZChcIndmXCIsIFwic3RhcnRcIiwgaWQpKTtcbiAgICAgICAgICAgIGFzc2VydCghcmVzdWx0KTtcblxuICAgICAgICAgICAgLy8gVGhhdCBzaG91bGQgZmFpbCwgYmVjYXVzZSBjb250cm9sIGZsb3cgaGFzIGJlZW4gc3RlcHBlZCBvdmVyOlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB5aWVsZCAoaG9zdC5pbnZva2VNZXRob2QoXCJ3ZlwiLCBcInN0YXJ0XCIsIGlkKSk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZS5tZXNzYWdlLmluZGV4T2YoXCJib29rbWFyayBkb2Vzbid0IGV4aXN0XCIpID4gMCk7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXQncyB3YWl0LlxuICAgICAgICAgICAgeWllbGQgQmx1ZWJpcmQuZGVsYXkoMTAwKTtcblxuICAgICAgICAgICAgLy8gVmVyaWZ5IHByb21vdGVkUHJvcGVydGllczpcbiAgICAgICAgICAgIGlmIChob3N0T3B0aW9ucyAmJiBob3N0T3B0aW9ucy5wZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgICAgIGxldCBwcm9tb3RlZFByb3BlcnRpZXMgPSB5aWVsZCBob3N0LnBlcnNpc3RlbmNlLmxvYWRQcm9tb3RlZFByb3BlcnRpZXMoXCJ3ZlwiLCBpZCk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHByb21vdGVkUHJvcGVydGllcy5pID09PSAxKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoXy5rZXlzKHByb21vdGVkUHJvcGVydGllcykubGVuZ3RoLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFzc2VydChpID09PSAyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlLmxlbmd0aCA9PT0gMik7XG4gICAgICAgICAgICBhc3NlcnQodHJhY2VbMF0ud29ya2Zsb3dOYW1lID09PSBcIndmXCIpO1xuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlWzBdLndvcmtmbG93VmVyc2lvbiA9PT0gMCk7XG4gICAgICAgICAgICBhc3NlcnQodHJhY2VbMF0uaW5zdGFuY2VJZCA9PT0gaWQpO1xuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlWzFdLndvcmtmbG93TmFtZSA9PT0gXCJ3ZlwiKTtcbiAgICAgICAgICAgIGFzc2VydCh0cmFjZVsxXS53b3JrZmxvd1ZlcnNpb24gPT09IDEpO1xuICAgICAgICAgICAgYXNzZXJ0KHRyYWNlWzFdLmluc3RhbmNlSWQgPT09IGlkKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGhvc3Quc2h1dGRvd24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydC5kZWVwRXF1YWwoZXJyb3IsIG51bGwpO1xuICAgIH0pXG59O1xuIl19
