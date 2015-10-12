"use strict";
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
describe("serializing", function() {
  var doTest = async($traceurRuntime.initGeneratorFunction(function $__8(hostOptions) {
    var now,
        rex,
        host,
        err,
        aDate,
        aMap,
        aSet,
        aResult,
        aRegExp,
        aProp,
        wf,
        arrayResult,
        objResult;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            now = new Date();
            rex = /abc/gi;
            host = new WorkflowHost(hostOptions);
            err = null;
            host.on("error", function(e) {
              err = e;
            });
            aDate = null;
            aMap = null;
            aSet = null;
            aResult = null;
            aRegExp = null;
            aProp = null;
            wf = {"@workflow": {
                name: "serializerWF",
                aDate: null,
                aMap: null,
                aSet: null,
                aResult: null,
                aRegExp: null,
                "`aCode": function() {
                  return "Hello!";
                },
                args: {"@block": {
                    p: "= this.$parent",
                    args: [function() {
                      assert(this.p.name === "serializerWF");
                    }, {"@method": {
                        methodName: "start",
                        canCreateInstance: true,
                        instanceIdPath: "[0]"
                      }}, {"@assign": {
                        to: "aDate",
                        value: now
                      }}, {"@assign": {
                        to: "aMap",
                        value: function() {
                          var map = new Map();
                          map.set(1, "1");
                          map.set(2, "2");
                          return map;
                        }
                      }}, {"@assign": {
                        to: "aSet",
                        value: function() {
                          var set = new Set();
                          set.add(1);
                          set.add(2);
                          return set;
                        }
                      }}, {"@assign": {
                        to: "aRegExp",
                        value: rex
                      }}, {"@method": {
                        methodName: "getArr",
                        instanceIdPath: "[0]",
                        result: ["= this.aDate", "= this.aMap", "= this.aSet", "= this.aRegExp", "= this.aCode.code", "= this.p.name"]
                      }}, {"@method": {
                        methodName: "getObj",
                        instanceIdPath: "[0]",
                        result: {
                          aDate: "= this.aDate",
                          aMap: "= this.aMap",
                          aSet: "= this.aSet",
                          aRegExp: "= this.aRegExp",
                          code: "= this.aCode.code",
                          name: "= this.p.name"
                        }
                      }}, {"@assign": {
                        to: "aResult",
                        value: {"@func": {code: "= this.aCode.code"}}
                      }}, function() {
                      aDate = this.aDate;
                      aMap = this.aMap;
                      aSet = this.aSet;
                      aResult = this.aResult;
                      aRegExp = this.aRegExp;
                      aProp = this.p.name;
                    }]
                  }}
              }};
            $ctx.state = 30;
            break;
          case 30:
            $ctx.pushTry(null, 22);
            $ctx.state = 24;
            break;
          case 24:
            host.registerWorkflow(wf);
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = 2;
            return host.invokeMethod("serializerWF", "start", "0");
          case 2:
            $ctx.maybeThrow();
            $ctx.state = 4;
            break;
          case 4:
            host.shutdown();
            host = new WorkflowHost(hostOptions);
            host.registerWorkflow(wf);
            host.on("error", function(e) {
              err = e;
            });
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 6;
            return host.invokeMethod("serializerWF", "getArr", "0");
          case 6:
            arrayResult = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            assert(_.isArray(arrayResult));
            assert(arrayResult.length === 6);
            $ctx.state = 18;
            break;
          case 18:
            $ctx.state = 10;
            return host.invokeMethod("serializerWF", "getObj", "0");
          case 10:
            objResult = $ctx.sent;
            $ctx.state = 12;
            break;
          case 12:
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
            if (err) {
              throw err;
            }
            $ctx.state = 22;
            $ctx.finallyFallThrough = -2;
            break;
          case 22:
            $ctx.popTry();
            $ctx.state = 28;
            break;
          case 28:
            host.shutdown();
            $ctx.state = 26;
            break;
          case 26:
            $ctx.state = $ctx.finallyFallThrough;
            break;
          default:
            return $ctx.end();
        }
    }, $__8, this);
  }));
  it("should serialize Date, code, Map, Set, RegExp without a serializer", function(done) {
    doTest({
      persistence: new MemoryPersistence(),
      lazyPersistence: true,
      serializer: null,
      alwaysLoadState: false
    }).nodeify(done);
  });
  it("should serialize Date, code, Map, Set, RegExp with a serializer", function(done) {
    doTest({
      persistence: new MemoryPersistence(),
      lazyPersistence: true,
      serializer: new Serializer(),
      alwaysLoadState: false
    }).nodeify(done);
  });
});

//# sourceMappingURL=serializing.js.map
