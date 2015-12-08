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
    doBasicHostTest: async(regeneratorRuntime.mark(function _callee(hostOptions) {
        var workflow, error, host, result, promotedProperties;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        hostOptions = _.extend({
                            enablePromotions: true
                        }, hostOptions);

                        workflow = {
                            "@workflow": {
                                name: "wf",
                                "!v": null,
                                "!x": 0,
                                args: [{
                                    "@beginMethod": {
                                        methodName: "foo",
                                        canCreateInstance: true,
                                        instanceIdPath: "[0]",
                                        "@to": "v"
                                    }
                                }, {
                                    "@endMethod": {
                                        methodName: "foo",
                                        result: "= this.v[0] * this.v[0]",
                                        "@to": "v"
                                    }
                                }, {
                                    "@assign": {
                                        value: 666,
                                        to: "x"
                                    }
                                }, {
                                    "@method": {
                                        methodName: "bar",
                                        instanceIdPath: "[0]",
                                        result: "= this.v * 2"
                                    }
                                }, "some string for wf result but not for the method result"]
                            }
                        };
                        error = null;
                        host = new WorkflowHost(hostOptions);

                        host.once(WorkflowHost.events.warn, function (e) {
                            error = e;
                        });
                        _context.prev = 5;

                        //host.addTracker(new ConsoleTracker());

                        host.registerWorkflow(workflow);
                        _context.next = 9;
                        return host.invokeMethod("wf", "foo", [5]);

                    case 9:
                        result = _context.sent;

                        assert.equal(result, 25);

                        // Verify promotedProperties:
                        if (!(hostOptions && hostOptions.persistence)) {
                            _context.next = 19;
                            break;
                        }

                        _context.next = 14;
                        return host.persistence.loadPromotedProperties("wf", 5);

                    case 14:
                        promotedProperties = _context.sent;

                        assert.ok(promotedProperties);
                        assert.equal(promotedProperties.v, 25);
                        assert.equal(promotedProperties.x, 666);
                        assert.equal(_.keys(promotedProperties).length, 2);

                    case 19:
                        _context.next = 21;
                        return host.invokeMethod("wf", "bar", [5]);

                    case 21:
                        result = _context.sent;

                        assert.equal(result, 50);

                    case 23:
                        _context.prev = 23;

                        host.shutdown();
                        return _context.finish(23);

                    case 26:

                        assert.deepEqual(error, null);

                    case 27:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[5,, 23, 26]]);
    })),

    doCalculatorTest: async(regeneratorRuntime.mark(function _callee2(hostOptions) {
        var workflow, error, host, arg, _result;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        workflow = {
                            "@workflow": {
                                name: "calculator",
                                running: true,
                                inputArgs: null,
                                currentValue: 0,
                                args: [{
                                    "@while": {
                                        condition: "= this.running",
                                        args: {
                                            "@pick": [{
                                                "@block": {
                                                    displayName: "Add block",
                                                    args: [{
                                                        "@method": {
                                                            displayName: "Add method",
                                                            methodName: "add",
                                                            instanceIdPath: "[0].id",
                                                            canCreateInstance: true,
                                                            "@to": "inputArgs"
                                                        }
                                                    }, {
                                                        "@assign": {
                                                            value: "= this.currentValue + this.inputArgs[0].value",
                                                            to: "currentValue"
                                                        }
                                                    }]
                                                }
                                            }, {
                                                "@block": {
                                                    displayName: "Subtract block",
                                                    args: [{
                                                        "@method": {
                                                            displayName: "Subtract method",
                                                            methodName: "subtract",
                                                            instanceIdPath: "[0].id",
                                                            canCreateInstance: true,
                                                            "@to": "inputArgs"
                                                        }
                                                    }, {
                                                        "@assign": {
                                                            value: "= this.currentValue - this.inputArgs[0].value",
                                                            to: "currentValue"
                                                        }
                                                    }]
                                                }
                                            }, {
                                                "@block": {
                                                    displayName: "Multiply block",
                                                    args: [{
                                                        "@method": {
                                                            displayName: "Multiply method",
                                                            methodName: "multiply",
                                                            instanceIdPath: "[0].id",
                                                            canCreateInstance: true,
                                                            "@to": "inputArgs"
                                                        }
                                                    }, {
                                                        "@assign": {
                                                            value: "= this.currentValue * this.inputArgs[0].value",
                                                            to: "currentValue"
                                                        }
                                                    }]
                                                }
                                            }, {
                                                "@block": {
                                                    displayName: "Divide block",
                                                    args: [{
                                                        "@method": {
                                                            displayName: "Divide method",
                                                            methodName: "divide",
                                                            instanceIdPath: "[0].id",
                                                            canCreateInstance: true,
                                                            "@to": "inputArgs"
                                                        }
                                                    }, {
                                                        "@assign": {
                                                            value: "= this.currentValue / this.inputArgs[0].value",
                                                            to: "currentValue"
                                                        }
                                                    }]
                                                }
                                            }, {
                                                "@method": {
                                                    displayName: "Equals method",
                                                    methodName: "equals",
                                                    instanceIdPath: "[0].id",
                                                    canCreateInstance: true,
                                                    result: "= this.currentValue"
                                                }
                                            }, {
                                                "@block": {
                                                    displayName: "Reset block",
                                                    args: [{
                                                        "@method": {
                                                            displayName: "Reset method",
                                                            methodName: "reset",
                                                            instanceIdPath: "[0].id"
                                                        }
                                                    }, {
                                                        "@assign": {
                                                            value: false,
                                                            to: "running"
                                                        }
                                                    }]
                                                }
                                            }]
                                        }
                                    }
                                }]
                            }
                        };
                        error = null;
                        host = new WorkflowHost(hostOptions);

                        host.once(WorkflowHost.events.warn, function (e) {
                            error = e;
                        });

                        _context2.prev = 4;

                        host.registerWorkflow(workflow);
                        //host.addTracker(new ConsoleTracker());

                        arg = { id: Math.floor(Math.random() * 1000000000 + 1) };
                        _context2.next = 9;
                        return host.invokeMethod("calculator", "equals", [arg]);

                    case 9:
                        _result = _context2.sent;

                        assert.equal(_result, 0);

                        arg.value = 55;
                        _context2.next = 14;
                        return host.invokeMethod("calculator", "add", [arg]);

                    case 14:

                        if (hostOptions && hostOptions.persistence) {
                            host.shutdown();
                            host = new WorkflowHost(hostOptions);
                            host.once("error", function (e) {
                                error = e;
                            });
                            host.registerWorkflow(workflow);
                        }

                        _context2.next = 17;
                        return host.invokeMethod("calculator", "equals", [arg]);

                    case 17:
                        _result = _context2.sent;

                        assert.equal(_result, 55);

                        arg.value = 5;
                        _context2.next = 22;
                        return host.invokeMethod("calculator", "divide", [arg]);

                    case 22:
                        _context2.next = 24;
                        return host.invokeMethod("calculator", "equals", [arg]);

                    case 24:
                        _result = _context2.sent;

                        assert.equal(_result, 11);

                        arg.value = 1;
                        _context2.next = 29;
                        return host.invokeMethod("calculator", "subtract", [arg]);

                    case 29:
                        _context2.next = 31;
                        return host.invokeMethod("calculator", "equals", [arg]);

                    case 31:
                        _result = _context2.sent;

                        assert.equal(_result, 10);

                        arg.value = 100;
                        _context2.next = 36;
                        return host.invokeMethod("calculator", "multiply", [arg]);

                    case 36:
                        _context2.next = 38;
                        return host.invokeMethod("calculator", "equals", [arg]);

                    case 38:
                        _result = _context2.sent;

                        assert.equal(_result, 1000);

                        delete arg.value;
                        _context2.next = 43;
                        return host.invokeMethod("calculator", "reset", [arg]);

                    case 43:
                        _context2.next = 45;
                        return host.invokeMethod("calculator", "equals", [arg]);

                    case 45:
                        _result = _context2.sent;

                        assert.equal(_result, 0);

                        delete arg.value;
                        _context2.next = 50;
                        return host.invokeMethod("calculator", "reset", [arg]);

                    case 50:
                        _context2.prev = 50;

                        host.shutdown();
                        return _context2.finish(50);

                    case 53:

                        assert.deepEqual(error, null);

                    case 54:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[4,, 50, 53]]);
    })),

    doDelayTest: async(regeneratorRuntime.mark(function _callee3(hostOptions) {
        var i, workflow, error, host, id, _result2, pError, _promotedProperties;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        hostOptions = _.extend({
                            enablePromotions: true,
                            wakeUpOptions: {
                                interval: 500
                            }
                        }, hostOptions);

                        i = 0;
                        workflow = {
                            "@workflow": {
                                name: "wf",
                                done: false,
                                "!i": 0,
                                args: {
                                    "@while": {
                                        condition: "= !this.done",
                                        args: {
                                            "@pick": [{
                                                "@method": {
                                                    canCreateInstance: true,
                                                    methodName: "start",
                                                    instanceIdPath: "[0]"
                                                }
                                            }, {
                                                "@block": [{
                                                    "@method": {
                                                        methodName: "stop",
                                                        instanceIdPath: "[0]"
                                                    }
                                                }, {
                                                    "@assign": {
                                                        to: "done",
                                                        value: true
                                                    }
                                                }]
                                            }, {
                                                "@block": [{
                                                    "@delay": {
                                                        ms: 100
                                                    }
                                                }, {
                                                    "@assign": {
                                                        to: "i",
                                                        value: "= this.i + 1"
                                                    }
                                                }, function () {
                                                    i = this.i;
                                                }]
                                            }]
                                        }
                                    }
                                }
                            }
                        };
                        error = null;
                        host = new WorkflowHost(hostOptions);

                        host.once(WorkflowHost.events.warn, function (e) {
                            error = e;
                        });
                        _context3.prev = 6;

                        //host.addTracker(new ConsoleTracker());
                        host.registerWorkflow(workflow);

                        id = "1";

                        // That should start the workflow:
                        _context3.next = 11;
                        return host.invokeMethod("wf", "start", id);

                    case 11:
                        _result2 = _context3.sent;

                        assert(!_result2);

                        // That should do nothing particular, but should work:
                        _context3.next = 15;
                        return host.invokeMethod("wf", "start", id);

                    case 15:
                        _result2 = _context3.sent;

                        assert(!_result2);

                        // Calling unexisted method should throw:
                        _context3.prev = 17;
                        _context3.next = 20;
                        return host.invokeMethod("wf", "pupu", id);

                    case 20:
                        assert(false, "That should throw!");
                        _context3.next = 27;
                        break;

                    case 23:
                        _context3.prev = 23;
                        _context3.t0 = _context3["catch"](17);

                        if (_context3.t0 instanceof errors.MethodNotFoundError) {
                            _context3.next = 27;
                            break;
                        }

                        throw _context3.t0;

                    case 27:
                        _context3.next = 29;
                        return host.invokeMethod("wf", "start", id);

                    case 29:
                        _result2 = _context3.sent;

                        assert(!_result2);

                        // Let's wait.
                        _context3.next = 33;
                        return Bluebird.delay(1000);

                    case 33:
                        if (!error) {
                            _context3.next = 37;
                            break;
                        }

                        pError = error;

                        error = null;
                        throw pError;

                    case 37:
                        if (!(hostOptions && hostOptions.persistence)) {
                            _context3.next = 46;
                            break;
                        }

                        _context3.next = 40;
                        return host.persistence.loadPromotedProperties("wf", id);

                    case 40:
                        _promotedProperties = _context3.sent;

                        assert(_promotedProperties);
                        assert(_promotedProperties.i > 0);
                        assert.equal(_.keys(_promotedProperties).length, 1);
                        _context3.next = 47;
                        break;

                    case 46:
                        assert(i > 0);

                    case 47:
                        _context3.next = 49;
                        return host.invokeMethod("wf", "start", id);

                    case 49:
                        _result2 = _context3.sent;

                        assert(!_result2);

                        // Stop:
                        _context3.next = 53;
                        return host.invokeMethod("wf", "stop", id);

                    case 53:
                        _result2 = _context3.sent;

                        assert(!_result2);
                        _context3.next = 62;
                        break;

                    case 57:
                        _context3.prev = 57;
                        _context3.t1 = _context3["catch"](6);

                        if (/is not supported without persistence/.test(_context3.t1.message)) {
                            _context3.next = 61;
                            break;
                        }

                        throw _context3.t1;

                    case 61:
                        assert(!hostOptions.persistence);

                    case 62:
                        _context3.prev = 62;

                        host.shutdown();
                        return _context3.finish(62);

                    case 65:

                        assert.deepEqual(error, null);

                    case 66:
                    case "end":
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[6, 57, 62, 65], [17, 23]]);
    })),

    doStopOutdatedVersionsTest: async(regeneratorRuntime.mark(function _callee4(hostOptions) {
        var trace, def, workflow0, workflow1, error, host, _id, _result3, _promotedProperties2;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (hostOptions.persistence) {
                            _context4.next = 2;
                            break;
                        }

                        return _context4.abrupt("return");

                    case 2:

                        hostOptions = _.extend({
                            enablePromotions: true,
                            wakeUpOptions: {
                                interval: 1000
                            }
                        }, hostOptions);

                        trace = [];
                        def = {
                            "@workflow": {
                                name: "wf",
                                "!i": 0,
                                args: [function () {
                                    this.i++;
                                }, {
                                    "@method": {
                                        canCreateInstance: true,
                                        methodName: "start",
                                        instanceIdPath: "[0]"
                                    }
                                }, {
                                    "@func": {
                                        args: {
                                            "@instanceData": {}
                                        },
                                        code: function code(data) {
                                            trace.push(data);
                                        }
                                    }
                                }, {
                                    "@delay": {
                                        ms: 100000
                                    }
                                }, {
                                    "@func": {
                                        args: {
                                            "@instanceData": {}
                                        },
                                        code: function code(data) {
                                            trace.push(data);
                                        }
                                    }
                                }, function () {
                                    this.i++;
                                }, { "@throw": { error: "Huh." } }]
                            }
                        };
                        workflow0 = activityMarkup.parse(def);

                        def["@workflow"].version = 1;
                        workflow1 = activityMarkup.parse(def);
                        error = null;
                        host = new WorkflowHost(hostOptions);

                        host.once(WorkflowHost.events.warn, function (e) {
                            error = e;
                        });
                        _context4.prev = 11;

                        host.registerWorkflow(workflow0);

                        _id = "1";

                        // That should start the workflow:
                        _context4.next = 16;
                        return host.invokeMethod("wf", "start", _id);

                    case 16:
                        _result3 = _context4.sent;

                        assert(!_result3);

                        // That should fail, because control flow has been stepped over:
                        _context4.prev = 18;
                        _context4.next = 21;
                        return host.invokeMethod("wf", "start", _id);

                    case 21:
                        _result3 = _context4.sent;

                        assert(false);
                        _context4.next = 29;
                        break;

                    case 25:
                        _context4.prev = 25;
                        _context4.t0 = _context4["catch"](18);

                        assert(_context4.t0.message.indexOf("bookmark doesn't exist") > 0);
                        error = null;

                    case 29:
                        _context4.next = 31;
                        return Bluebird.delay(100);

                    case 31:
                        _context4.next = 33;
                        return host.persistence.loadPromotedProperties("wf", _id);

                    case 33:
                        _promotedProperties2 = _context4.sent;

                        assert(_promotedProperties2);
                        assert(_promotedProperties2.i === 1);
                        assert.equal(_.keys(_promotedProperties2).length, 1);

                        // Start another:
                        host.shutdown();
                        host = new WorkflowHost(hostOptions);
                        host.once("error", function (e) {
                            error = e;
                        });

                        host.registerWorkflow(workflow1);

                        // That should fail, because an older version is already running:
                        _context4.prev = 41;
                        _context4.next = 44;
                        return host.invokeMethod("wf", "start", _id);

                    case 44:
                        _result3 = _context4.sent;

                        assert(false);
                        _context4.next = 52;
                        break;

                    case 48:
                        _context4.prev = 48;
                        _context4.t1 = _context4["catch"](41);

                        // In persistence it's a version 0 workflow, but that's not registered in the new host, so if fails:
                        assert(_context4.t1.message.indexOf("has not been registered") > 0);
                        error = null;

                    case 52:
                        _context4.next = 54;
                        return host.stopDeprecatedVersions("wf");

                    case 54:
                        _context4.next = 56;
                        return host.persistence.loadPromotedProperties("wf", _id);

                    case 56:
                        _promotedProperties2 = _context4.sent;

                        assert(_promotedProperties2 === null);

                        // Ok, let's start over!

                        // That should start the workflow:
                        _context4.next = 60;
                        return host.invokeMethod("wf", "start", _id);

                    case 60:
                        _result3 = _context4.sent;

                        assert(!_result3);

                        // That should fail, because control flow has been stepped over:
                        _context4.prev = 62;
                        _context4.next = 65;
                        return host.invokeMethod("wf", "start", _id);

                    case 65:
                        _result3 = _context4.sent;

                        assert(false);
                        _context4.next = 73;
                        break;

                    case 69:
                        _context4.prev = 69;
                        _context4.t2 = _context4["catch"](62);

                        assert(_context4.t2.message.indexOf("bookmark doesn't exist") > 0);
                        error = null;

                    case 73:
                        _context4.next = 75;
                        return Bluebird.delay(100);

                    case 75:
                        _context4.next = 77;
                        return host.persistence.loadPromotedProperties("wf", _id);

                    case 77:
                        _promotedProperties2 = _context4.sent;

                        assert(_promotedProperties2);
                        assert(_promotedProperties2.i === 1);
                        assert.equal(_.keys(_promotedProperties2).length, 1);

                        assert(trace.length === 2);
                        assert(trace[0].workflowName === "wf");
                        assert(_.isString(trace[0].workflowVersion));
                        assert(trace[0].workflowVersion.length > 0);
                        assert(trace[0].instanceId === _id);
                        assert(trace[1].workflowName === "wf");
                        assert(_.isString(trace[1].workflowVersion));
                        assert(trace[1].workflowVersion.length > 0);
                        assert(trace[1].instanceId === _id);
                        assert(trace[0].workflowVersion !== trace[1].workflowVersion);

                    case 91:
                        _context4.prev = 91;

                        host.shutdown();
                        return _context4.finish(91);

                    case 94:

                        assert.deepEqual(error, null);

                    case 95:
                    case "end":
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[11,, 91, 94], [18, 25], [41, 48], [62, 69]]);
    }))
};
//# sourceMappingURL=hostingTestCommon.js.map
