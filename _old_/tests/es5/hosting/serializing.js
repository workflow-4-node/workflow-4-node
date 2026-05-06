"use strict"

/* global describe,it */

;
var wf4node = require("../../../");
var InstanceIdParser = wf4node.hosting.InstanceIdParser;
var _ = require("lodash");
var hostingTestCommon = require("./hostingTestCommon");
var MemoryPersistence = wf4node.hosting.MemoryPersistence;
var Serializer = require("backpack-node").system.Serializer;
var WorkflowHost = wf4node.hosting.WorkflowHost;
var asyncHelpers = wf4node.common.asyncHelpers;
var Bluebird = require("bluebird");
var async = asyncHelpers.async;
var util = require("util");
var Activity = wf4node.activities.Activity;
var Block = wf4node.activities.Block;

var assert = require("better-assert");

describe("serializing", function () {
    var doTest = async(regeneratorRuntime.mark(function _callee(hostOptions) {
        var now, rex, host, err, aDate, aMap, aSet, aResult, aRegExp, aProp, wf, arrayResult, objResult;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        now = new Date();
                        rex = /abc/gi;
                        host = new WorkflowHost(hostOptions);
                        err = null;

                        host.on("error", function (e) {
                            err = e;
                        });

                        aDate = null;
                        aMap = null;
                        aSet = null;
                        aResult = null;
                        aRegExp = null;
                        aProp = null;
                        wf = {
                            "@workflow": {
                                name: "serializerWF",
                                aDate: null,
                                aMap: null,
                                aSet: null,
                                aResult: null,
                                aRegExp: null,
                                "`aCode": function aCode() {
                                    return "Hello!";
                                },
                                args: {
                                    "@block": {
                                        p: "= this.$parent",
                                        args: [function () {
                                            assert(this.p.name === "serializerWF");
                                        }, {
                                            "@method": {
                                                methodName: "start",
                                                canCreateInstance: true,
                                                instanceIdPath: "[0]"
                                            }
                                        }, {
                                            "@assign": {
                                                to: "aDate",
                                                value: now
                                            }
                                        }, {
                                            "@assign": {
                                                to: "aMap",
                                                value: function value() {
                                                    var map = new Map();
                                                    map.set(1, "1");
                                                    map.set(2, "2");
                                                    return map;
                                                }
                                            }
                                        }, {
                                            "@assign": {
                                                to: "aSet",
                                                value: function value() {
                                                    var set = new Set();
                                                    set.add(1);
                                                    set.add(2);
                                                    return set;
                                                }
                                            }
                                        }, {
                                            "@assign": {
                                                to: "aRegExp",
                                                value: rex
                                            }
                                        }, {
                                            "@method": {
                                                methodName: "getArr",
                                                instanceIdPath: "[0]",
                                                //result: "= [this.aDate, this.aMap, this.aSet, this.aRegExp, this.aCode.code, this.p.name]"
                                                result: ["= this.aDate", "= this.aMap", "= this.aSet", "= this.aRegExp", "= this.aCode.code", "= this.p.name"]
                                            }
                                        }, {
                                            "@method": {
                                                methodName: "getObj",
                                                instanceIdPath: "[0]",
                                                //result: "= { aDate: this.aDate, aMap: this.aMap, aSet: this.aSet, aRegExp: this.aRegExp, code: this.aCode.code, name: this.p.name }"
                                                result: {
                                                    aDate: "= this.aDate",
                                                    aMap: "= this.aMap",
                                                    aSet: "= this.aSet",
                                                    aRegExp: "= this.aRegExp",
                                                    code: "= this.aCode.code",
                                                    name: "= this.p.name"
                                                }
                                            }
                                        }, {
                                            "@assign": {
                                                to: "aResult",
                                                value: {
                                                    "@func": {
                                                        code: "= this.aCode.code"
                                                    }
                                                }
                                            }
                                        }, function () {
                                            aDate = this.aDate;
                                            aMap = this.aMap;
                                            aSet = this.aSet;
                                            aResult = this.aResult;
                                            aRegExp = this.aRegExp;
                                            aProp = this.p.name;
                                        }]
                                    }
                                }
                            }
                        };
                        _context.prev = 12;

                        host.registerWorkflow(wf);

                        _context.next = 16;
                        return host.invokeMethod("serializerWF", "start", "0");

                    case 16:
                        host.shutdown();

                        host = new WorkflowHost(hostOptions);
                        host.registerWorkflow(wf);
                        host.on("error", function (e) {
                            err = e;
                        });

                        _context.next = 22;
                        return host.invokeMethod("serializerWF", "getArr", "0");

                    case 22:
                        arrayResult = _context.sent;

                        assert(_.isArray(arrayResult));
                        assert(arrayResult.length === 6);

                        _context.next = 27;
                        return host.invokeMethod("serializerWF", "getObj", "0");

                    case 27:
                        objResult = _context.sent;

                        assert(_.isPlainObject(objResult));
                        assert(_.keys(objResult).length === 6);

                        assert(_.isDate(aDate));
                        assert(aDate.getTime() === now.getTime());

                        assert(_.isDate(arrayResult[0]));
                        assert(arrayResult[0].getTime() === now.getTime());

                        assert(aMap instanceof Map);
                        assert(aMap.get(1) === "1");
                        assert(aMap.get(2) === "2");
                        assert(aMap.size === 2);

                        assert(arrayResult[1] instanceof Map);
                        assert(arrayResult[1].get(1) === "1");
                        assert(arrayResult[1].get(2) === "2");
                        assert(arrayResult[1].size === 2);

                        assert(objResult.aMap instanceof Map);
                        assert(objResult.aMap.get(1) === "1");
                        assert(objResult.aMap.get(2) === "2");
                        assert(objResult.aMap.size === 2);

                        assert(aSet instanceof Set);
                        assert(aSet.has(1));
                        assert(aSet.has(2));
                        assert(aSet.size === 2);

                        assert(arrayResult[2] instanceof Set);
                        assert(arrayResult[2].has(1));
                        assert(arrayResult[2].has(2));
                        assert(arrayResult[2].size === 2);

                        assert(objResult.aSet instanceof Set);
                        assert(objResult.aSet.has(1));
                        assert(objResult.aSet.has(2));
                        assert(objResult.aSet.size === 2);

                        assert(aRegExp instanceof RegExp);
                        assert(aRegExp.pattern === rex.pattern);
                        assert(aRegExp.flags === rex.flags);

                        assert(arrayResult[3] instanceof RegExp);
                        assert(arrayResult[3].pattern === rex.pattern);
                        assert(arrayResult[3].flags === rex.flags);

                        assert(objResult.aRegExp instanceof RegExp);
                        assert(objResult.aRegExp.pattern === rex.pattern);
                        assert(objResult.aRegExp.flags === rex.flags);

                        assert(aResult === "Hello!");

                        assert(aProp === "serializerWF");

                        assert(_.isFunction(arrayResult[4]));
                        assert(arrayResult[4]() === "Hello!");

                        assert(_.isFunction(objResult.code));
                        assert(objResult.code() === "Hello!");

                        assert(arrayResult[5] === "serializerWF");

                        assert(objResult.name === "serializerWF");

                        if (!err) {
                            _context.next = 77;
                            break;
                        }

                        throw err;

                    case 77:
                        _context.prev = 77;

                        host.shutdown();
                        return _context.finish(77);

                    case 80:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[12,, 77, 80]]);
    }));

    it("should serialize Date, code, Map, Set, RegExp without a serializer", function (done) {
        doTest({
            persistence: new MemoryPersistence(),
            lazyPersistence: true,
            serializer: null,
            alwaysLoadState: false
        }).nodeify(done);
    });

    it("should serialize Date, code, Map, Set, RegExp with a serializer", function (done) {
        doTest({
            persistence: new MemoryPersistence(),
            lazyPersistence: true,
            serializer: new Serializer(),
            alwaysLoadState: false
        }).nodeify(done);
    });
});
//# sourceMappingURL=serializing.js.map
