"use strict";
var wf4node = require("../../../");
var InstanceIdParser = wf4node.hosting.InstanceIdParser;
var _ = require("lodash");
var hostingTestCommon = require("./hostingTestCommon");
var MemoryPersistence = wf4node.hosting.MemoryPersistence;
var Serializer = require("backpack-node").system.Serializer;
var assert = require("assert");
describe("InstanceIdParser", function() {
  describe("parse()", function() {
    it("should understand common paths", function() {
      var p = new InstanceIdParser();
      assert.equal(p.parse("this", 1), 1);
      assert.equal(p.parse("[0]", [1]), 1);
      assert.equal(p.parse("[0]", [4, 5]), 4);
      assert.equal(p.parse("[1].id", [{id: 1}, {id: 2}]), 2);
      assert.equal(p.parse("id[0].a", {id: [{a: "foo"}]}), "foo");
    });
  });
});
describe("WorkflowHost", function() {
  this.timeout(60000);
  function getInfo(options) {
    return ("persistence: " + (options.persistence ? "on" : "off") + ", lazy: " + (options.lazyPersistence ? "yes" : "no") + ", serializer: " + (options.serializer ? "yes" : "no") + ", alwaysLoad: " + (options.alwaysLoadState ? "yes" : "no"));
  }
  function testBasic(options) {
    it("should run by: " + getInfo(options), function(done) {
      hostingTestCommon.doBasicHostTest(options).nodeify(done);
    });
  }
  function testCalc(options) {
    it("should run by: " + getInfo(options), function(done) {
      hostingTestCommon.doCalculatorTest(options).nodeify(done);
    });
  }
  function testDelayTo(options) {
    it("should run by: " + getInfo(options), function(done) {
      hostingTestCommon.doDelayTest(options).nodeify(done);
    });
  }
  function testStopOutdatedVersions(options) {
    it("should run by: " + getInfo(options), function(done) {
      hostingTestCommon.doStopOutdatedVersionsTest(options).nodeify(done);
    });
  }
  var allOptions = [{
    persistence: null,
    lazyPersistence: false,
    serializer: null,
    alwaysLoadState: false
  }, {
    persistence: new MemoryPersistence(),
    lazyPersistence: false,
    serializer: null,
    alwaysLoadState: false
  }, {
    persistence: new MemoryPersistence(),
    lazyPersistence: true,
    serializer: null,
    alwaysLoadState: false
  }, {
    persistence: new MemoryPersistence(),
    lazyPersistence: false,
    serializer: new Serializer(),
    alwaysLoadState: false
  }, {
    persistence: new MemoryPersistence(),
    lazyPersistence: true,
    serializer: new Serializer(),
    alwaysLoadState: false
  }, {
    persistence: new MemoryPersistence(),
    lazyPersistence: false,
    serializer: new Serializer(),
    alwaysLoadState: true
  }, {
    persistence: new MemoryPersistence(),
    lazyPersistence: true,
    serializer: new Serializer(),
    alwaysLoadState: true
  }];
  describe("Without Persistence and With Memory Persistence", function() {
    describe("Basic Example", function() {
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (allOptions)[Symbol.iterator](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var opt = $__3.value;
          {
            if (opt.persistence) {
              opt.persistence.clear();
            }
            testBasic(opt);
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
    });
    describe("Calculator Example", function() {
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (allOptions)[Symbol.iterator](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var opt = $__3.value;
          {
            if (opt.persistence) {
              opt.persistence.clear();
            }
            testCalc(opt);
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
    });
    describe("DelayTo Example", function() {
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (allOptions)[Symbol.iterator](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var opt = $__3.value;
          {
            if (opt.persistence) {
              opt.persistence.clear();
            }
            testDelayTo(opt);
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
    });
    describe("StopOutdatedVersions Example", function() {
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (allOptions)[Symbol.iterator](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var opt = $__3.value;
          {
            if (opt.persistence) {
              opt.persistence.clear();
            }
            testStopOutdatedVersions(opt);
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
    });
  });
});

//# sourceMappingURL=coreHostingTests.js.map
