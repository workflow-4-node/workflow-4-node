"use strict";

/* global describe,it */

let wf4node = require("../../../");
let InstanceIdParser = wf4node.hosting.InstanceIdParser;
let _ = require("lodash");
let hostingTestCommon = require("./hostingTestCommon");
let MemoryPersistence = wf4node.hosting.MemoryPersistence;
let Serializer = require("backpack-node").system.Serializer;
let WorkflowHost = wf4node.hosting.WorkflowHost;
let asyncHelpers = wf4node.common.asyncHelpers;
let Bluebird = require("bluebird");
let async = asyncHelpers.async;
let util = require("util");
let Activity = wf4node.activities.Activity;
let Block = wf4node.activities.Block;

let assert = require("better-assert");

describe("serializing", function() {
    let doTest = async(function* (hostOptions) {
        let now = new Date();
        let rex = /abc/gi;
        let host = new WorkflowHost(hostOptions);
        let err = null;
        host.on("error", function(e) {
            err = e;
        });

        let aDate = null;
        let aMap = null;
        let aSet = null;
        let aResult = null;
        let aRegExp = null;
        let aProp = null;

        let wf = {
            "@workflow": {
                name: "serializerWF",
                aDate: null,
                aMap: null,
                aSet: null,
                aResult: null,
                aRegExp: null,
                "`aCode": function() {
                    return "Hello!";
                },
                args: {
                    "@block": {
                        p: "= this.$parent",
                        args: [
                            function() {
                                assert(this.p.name === "serializerWF");
                            },
                            {
                                "@method": {
                                    methodName: "start",
                                    canCreateInstance: true,
                                    instanceIdPath: "[0]"
                                }
                            },
                            {
                                "@assign": {
                                    to: "aDate",
                                    value: now
                                }
                            },
                            {
                                "@assign": {
                                    to: "aMap",
                                    value: function () {
                                        let map = new Map();
                                        map.set(1, "1");
                                        map.set(2, "2");
                                        return map;
                                    }
                                }
                            },
                            {
                                "@assign": {
                                    to: "aSet",
                                    value: function () {
                                        let set = new Set();
                                        set.add(1);
                                        set.add(2);
                                        return set;
                                    }
                                }
                            },
                            {
                                "@assign": {
                                    to: "aRegExp",
                                    value: rex
                                }
                            },
                            {
                                "@method": {
                                    methodName: "getArr",
                                    canCreateInstance: true,
                                    instanceIdPath: "[0]",
                                    result: "= [this.aDate, this.aMap, this.aSet, this.aRegExp, this.aCode.code, this.p.name]"
                                }
                            },
                            {
                                "@method": {
                                    methodName: "getObj",
                                    canCreateInstance: true,
                                    instanceIdPath: "[0]",
                                    result: "= { aDate: this.aDate, aMap: this.aMap, aSet: this.aSet, aRegExp: this.aRegExp, code: this.aCode.code, name: this.p.name }"
                                }
                            },
                            {
                                "@assign": {
                                    to: "aResult",
                                    value: {
                                        "@func": {
                                            code: "= this.aCode.code"
                                        }
                                    }
                                }
                            },
                            function () {
                                aDate = this.aDate;
                                aMap = this.aMap;
                                aSet = this.aSet;
                                aResult = this.aResult;
                                aRegExp = this.aRegExp;
                                aProp = this.p.name;
                            }
                        ]
                    }
                }
            }
        };

        try {
            host.registerWorkflow(wf);

            yield host.invokeMethod("serializerWF", "start", "0");
            host.shutdown();

            host = new WorkflowHost(hostOptions);
            host.registerWorkflow(wf);
            host.on("error", function (e) {
                err = e;
            });

            let arrayResult = yield host.invokeMethod("serializerWF", "getArr", "0");
            assert(_.isArray(arrayResult));
            assert(arrayResult.length === 6);

            let objResult = yield host.invokeMethod("serializerWF", "getObj", "0");
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
        }
        finally {
            host.shutdown();
        }
    });

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