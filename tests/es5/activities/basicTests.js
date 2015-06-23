"use strict";
var wf4node = require("../../../");
var Expression = wf4node.activities.Expression;
var Func = wf4node.activities.Func;
var Block = wf4node.activities.Block;
var activityMarkup = wf4node.activities.activityMarkup;
var ActivityExecutionEngine = wf4node.activities.ActivityExecutionEngine;
var _ = require("lodash");
var ConsoleTracker = wf4node.activities.ConsoleTracker;
var WorkflowHost = wf4node.hosting.WorkflowHost;
var InstanceIdParser = wf4node.hosting.InstanceIdParser;
var Promise = require("bluebird");
var assert = require("assert");
describe("Func", function() {
  it("should run with a synchronous code", function(done) {
    var fop = new Func();
    fop.code = function(obj) {
      return obj.name;
    };
    var engine = new ActivityExecutionEngine(fop);
    engine.invoke({name: "Gabor"}).then(function(result) {
      assert.equal(result, "Gabor");
    }).nodeify(done);
  });
  it("should run when created from markup", function(done) {
    var fop = activityMarkup.parse({func: {code: function(obj) {
          return obj.name;
        }}});
    var engine = new ActivityExecutionEngine(fop);
    engine.invoke({name: "Gabor"}).then(function(result) {
      assert.equal(result, "Gabor");
    }).nodeify(done);
  });
  it("should run when code is asynchronous", function(done) {
    var fop = new Func();
    fop.code = function(obj) {
      return Promise.resolve(obj.name);
    };
    var engine = new ActivityExecutionEngine(fop);
    engine.invoke({name: "Mezo"}).then(function(result) {
      assert.equal(result, "Mezo");
    }).nodeify(done);
  });
  it("should accept external parameters those are functions also", function(done) {
    var expected = {name: "Gabor"};
    var fop = new Func();
    fop.code = function(obj) {
      return obj.name;
    };
    var fopin = new Func();
    fopin.code = function() {
      return expected;
    };
    var engine = new ActivityExecutionEngine(fop);
    engine.invoke(fopin).then(function(result) {
      assert.equal(result, expected.name);
    }).nodeify(done);
  });
  it("should work as an agument", function(done) {
    var expected = {name: "Gabor"};
    var fop = activityMarkup.parse({func: {
        args: {func: {code: function() {
              return expected;
            }}},
        code: function(obj) {
          return obj.name;
        }
      }});
    var engine = new ActivityExecutionEngine(fop);
    engine.invoke().then(function(result) {
      assert.equal(result, expected.name);
    }).nodeify(done);
  });
});
describe("Block", function() {
  it("should handle variables well", function(done) {
    var block = new Block();
    block.var1 = 1;
    block.var2 = 2;
    block.var3 = 3;
    var f1 = new Func();
    f1.code = function() {
      return this.set("var3", this.get("var3") + this.get("var1") * 2);
    };
    var f2 = new Func();
    f2.code = function() {
      return this.set("var3", this.get("var3") + this.get("var2") * 3);
    };
    var f3 = new Func();
    f3.code = function() {
      return this.get("var3") * 4;
    };
    var engine = new ActivityExecutionEngine(block);
    engine.invoke(f1, f2, f3).then(function(result) {
      var x1 = 1;
      var x2 = 2;
      var x3 = 3;
      x3 += x1 * 2;
      x3 += x2 * 3;
      var r = x3 * 4;
      assert.equal(result, r);
    }).nodeify(done);
  });
  it("can be generated from markup", function(done) {
    var block = activityMarkup.parse({block: {
        var1: 1,
        var2: {func: {code: function() {
              return 2;
            }}},
        var3: 3,
        args: [{func: {code: function bubu() {
              return this.set("var3", this.get("var3") + this.get("var1") * 2);
            }}}, {func: {code: function kittyfuck() {
              return this.set("var3", this.get("var3") + this.get("var2") * 3);
            }}}, {func: {code: function() {
              return this.get("var3") * 4;
            }}}]
      }});
    var engine = new ActivityExecutionEngine(block);
    engine.invoke().then(function(result) {
      var x1 = 1;
      var x2 = 2;
      var x3 = 3;
      x3 += x1 * 2;
      x3 += x2 * 3;
      var r = x3 * 4;
      assert.equal(result, r);
    }).nodeify(done);
  });
  it("can be generated from markup string", function(done) {
    var markup = {block: {
        var1: 1,
        var2: 2,
        var3: 3,
        args: [{func: {code: function bubu() {
              return this.set("var3", this.get("var3") + this.get("var1") * 2);
            }}}, {func: {code: function kittyfuck() {
              return this.set("var3", this.get("var3") + this.get("var2") * 3);
            }}}, {func: {code: function() {
              return this.get("var3") * 4;
            }}}]
      }};
    var markupString = activityMarkup.stringify(markup);
    assert.ok(_.isString(markupString));
    var block = activityMarkup.parse(markupString);
    var engine = new ActivityExecutionEngine(block);
    engine.invoke().then(function(result) {
      var x1 = 1;
      var x2 = 2;
      var x3 = 3;
      x3 += x1 * 2;
      x3 += x2 * 3;
      var r = x3 * 4;
      assert.equal(result, r);
    }).nodeify(done);
  });
});
describe("Parallel", function() {
  it("should work as expected with sync activities", function(done) {
    var activity = activityMarkup.parse({parallel: {
        var1: "",
        args: [{func: {code: function() {
              return this.add("var1", "a");
            }}}, {func: {code: 'function() { return this.add("var1", "b"); }'}}]
      }});
    var engine = new ActivityExecutionEngine(activity);
    engine.invoke().then(function(result) {
      assert.equal(result.length, 2);
      assert.equal(result[0], "a");
      assert.equal(result[1], "ab");
    }).nodeify(done);
  });
  it("should work as expected with async activities", function(done) {
    var activity = activityMarkup.parse({parallel: {
        var1: "",
        args: [{func: {code: function() {
              return this.add("var1", "a");
            }}}, {func: {code: 'function() { return this.add("var1", "b"); }'}}, {func: {code: function() {
              return Promise.delay(100).then(function() {
                return 42;
              });
            }}}, {func: {code: function() {
              return new Promise(function(resolve, reject) {
                setImmediate(function() {
                  resolve(0);
                });
              });
            }}}]
      }});
    var engine = new ActivityExecutionEngine(activity);
    engine.invoke().then(function(result) {
      assert.equal(result.length, 4);
      assert.equal(result[0], "a");
      assert.equal(result[1], "ab");
      assert.equal(result[2], 42);
      assert.equal(result[3], 0);
    }).nodeify(done);
  });
});
describe("Pick", function() {
  it("should work as expected with sync activities", function(done) {
    var activity = activityMarkup.parse({pick: {
        var1: "",
        args: [{func: {code: function() {
              return this.add("var1", "a");
            }}}, {func: {code: 'function() { return this.add("var1", "b"); }'}}]
      }});
    var engine = new ActivityExecutionEngine(activity);
    engine.invoke().then(function(result) {
      assert.equal(result, "a");
    }).nodeify(done);
  });
  it("should work as expected with async activities", function(done) {
    var activity = activityMarkup.parse({pick: [{func: {code: function() {
            return Promise.delay(100).then(function() {
              return 42;
            });
          }}}, {func: {code: function() {
            return new Promise(function(resolve, reject) {
              setImmediate(function() {
                resolve(0);
              });
            });
          }}}]});
    var engine = new ActivityExecutionEngine(activity);
    engine.invoke().then(function(result) {
      assert.equal(result, 0);
    }).nodeify(done);
  });
});
describe("Expression", function() {
  it("should multiply two numbers", function(done) {
    var expr = new Expression();
    expr.expr = "this.get('v') * this.get('v')";
    var block = new Block();
    block.v = 2;
    block.args = [expr];
    var engine = new ActivityExecutionEngine(block);
    engine.invoke().then(function(result) {
      assert.equal(result, 4);
    }).nodeify(done);
  });
  it("should works from markup", function(done) {
    var block = activityMarkup.parse({block: {
        v: 2,
        args: ["# this.get('v') * this.get('v')"]
      }});
    var engine = new ActivityExecutionEngine(block);
    engine.invoke().then(function(result) {
      assert.equal(result, 4);
    }).nodeify(done);
  });
});
describe("While", function() {
  it("should run a basic cycle", function(done) {
    var block = activityMarkup.parse({block: {
        i: 10,
        j: 0,
        z: 0,
        args: [{while: {
            condition: "# this.get('j') < this.get('i')",
            body: "# this.postfixInc('j')",
            "@to": "z"
          }}, "# { j: this.get('j'), z: this.get('z') }"]
      }});
    var engine = new ActivityExecutionEngine(block);
    engine.invoke().then(function(result) {
      assert.ok(_.isObject(result));
      assert.equal(result.j, 10);
      assert.equal(result.z, 9);
    }).nodeify(done);
  });
});
describe("If", function() {
  it("should call then body", function(done) {
    var block = activityMarkup.parse({block: {
        v: 5,
        args: [{if: {
            condition: "# this.get('v') == 5",
            thenBody: {func: {
                args: [1],
                code: function(a) {
                  return a + this.get('v');
                }
              }},
            elseBody: {func: {
                args: [2],
                code: function(a) {
                  return a + this.get('v');
                }
              }}
          }}]
      }});
    var engine = new ActivityExecutionEngine(block);
    engine.invoke().then(function(result) {
      assert.equal(1 + 5, result);
    }).nodeify(done);
  });
  it("should call else body", function(done) {
    var block = activityMarkup.parse({block: {
        v: 5,
        r: 0,
        args: [{if: {
            condition: {func: {code: function() {
                  return false;
                }}},
            thenBody: {func: {
                args: [1],
                code: function(a) {
                  this.set("r", a + this.get("v"));
                }
              }},
            elseBody: {func: {
                args: [2],
                code: function(a) {
                  this.set("r", a + this.get("v"));
                }
              }}
          }}, "# this.get('r')"]
      }});
    var engine = new ActivityExecutionEngine(block);
    engine.invoke().then(function(result) {
      assert.equal(2 + 5, result);
    }).nodeify(done);
  });
});
describe('Logic Operators', function() {
  describe('Truthy', function() {
    it('should work', function(done) {
      var engine = new ActivityExecutionEngine({block: {
          t1: {truthy: {value: 'a'}},
          t2: {truthy: {value: null}},
          t3: {truthy: {
              value: true,
              is: 'is',
              isNot: 'isNot'
            }},
          t4: {truthy: {
              value: null,
              is: 'is',
              isNot: {func: {code: function() {
                    return 'isNot';
                  }}}
            }},
          args: [['# this.get("t1")', '# this.get("t2")', '# this.get("t3")', '# this.get("t4")']]
        }});
      engine.invoke().then(function(result) {
        assert.ok(_.isArray(result));
        assert.equal(result[0], true);
        assert.equal(result[1], false);
        assert.equal(result[2], 'is');
        assert.equal(result[3], 'isNot');
      }).nodeify(done);
    });
  });
  describe('Falsy', function() {
    it('should work', function(done) {
      var engine = new ActivityExecutionEngine({block: {
          t1: {falsy: {value: 'a'}},
          t2: {falsy: {value: null}},
          t3: {falsy: {
              value: true,
              is: 'is',
              isNot: 'isNot'
            }},
          t4: {falsy: {
              value: null,
              is: '# "is"',
              isNot: {func: {code: function() {
                    return 'isNot';
                  }}}
            }},
          args: [['# this.get("t1")', '# this.get("t2")', '# this.get("t3")', '# this.get("t4")']]
        }});
      engine.invoke().then(function(result) {
        assert.ok(_.isArray(result));
        assert.equal(result[0], false);
        assert.equal(result[1], true);
        assert.equal(result[2], 'isNot');
        assert.equal(result[3], 'is');
      }).nodeify(done);
    });
  });
  describe('Equals', function() {
    it('should work', function(done) {
      var engine = new ActivityExecutionEngine({block: {
          a: {equals: {
              value: function() {
                return 42;
              },
              to: '# 40 + 2 ',
              is: function() {
                return '42';
              },
              isNot: 'aba'
            }},
          b: {equals: {
              value: function() {
                return 42;
              },
              to: '# 40 + 1 ',
              is: function() {
                return '42';
              },
              isNot: 'aba'
            }},
          args: {
            a: '# this.get("a")',
            b: '# this.get("b")'
          }
        }});
      engine.invoke().then(function(result) {
        assert.ok(_.isPlainObject(result));
        assert.equal(result.a, '42');
        assert.equal(result.b, 'aba');
      }).nodeify(done);
    });
  });
  describe('NotEquals', function() {
    it('should work', function(done) {
      var engine = new ActivityExecutionEngine({block: {
          a: {notEquals: {
              value: function() {
                return 42;
              },
              to: '# 40 + 2 ',
              is: function() {
                return '42';
              },
              isNot: 'aba'
            }},
          b: {notEquals: {
              value: function() {
                return 42;
              },
              to: '# 40 + 1 ',
              is: function() {
                return '42';
              },
              isNot: 'aba'
            }},
          args: {
            a: '# this.get("a")',
            b: '# this.get("b")'
          }
        }});
      engine.invoke().then(function(result) {
        assert.ok(_.isPlainObject(result));
        assert.equal(result.a, 'aba');
        assert.equal(result.b, '42');
      }).nodeify(done);
    });
  });
  describe('Not, And, Or', function() {
    it('should work', function(done) {
      var engine = new ActivityExecutionEngine({block: {
          a: {and: [true, 'bubu', {or: ['# true', false]}, {not: [{and: [true, function() {
                  return null;
                }]}]}]},
          b: {and: {
              args: [{or: ['# true', false]}, {not: [{and: [true, '# [ 42 ]']}]}],
              isFalse: function() {
                return Promise.delay(100).then(function() {
                  return 42;
                });
              }
            }},
          args: {
            a: '# this.get("a")',
            b: '# this.get("b")'
          }
        }});
      engine.invoke().then(function(result) {
        assert.ok(_.isPlainObject(result));
        assert.equal(result.a, true);
        assert.equal(result.b, 42);
      }).nodeify(done);
    });
  });
  describe('For', function() {
    it('should work between range 0 and 10 by step 1', function(done) {
      var engine = new ActivityExecutionEngine({block: {
          seq: "",
          args: [{for: {
              from: 0,
              to: {func: {code: function() {
                    return Promise.delay(100).then(function() {
                      return 10;
                    });
                  }}},
              body: "# this.set('seq', this.get('seq') + this.get('i'))"
            }}, "# this.get('seq')"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isString(result));
        assert.equal(result, "0123456789");
      }).nodeify(done);
    });
    it('should work between range 10 downto 4 by step -2', function(done) {
      var engine = new ActivityExecutionEngine({block: {
          seq: "",
          r: null,
          args: [{for: {
              from: 10,
              to: {func: {code: function() {
                    return Promise.delay(100).then(function() {
                      return 4;
                    });
                  }}},
              step: -2,
              varName: "klow",
              body: "# this.set('seq', this.get('seq') + this.get('klow'))",
              "@to": "r"
            }}, "# { v: this.get('seq'), r: this.get('r') }"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isObject(result));
        assert.equal(result.v, "1086");
        assert.equal(result.r, "1086");
      }).nodeify(done);
    });
  });
  describe('ForEach', function() {
    it('should work non parallel', function(done) {
      var engine = new ActivityExecutionEngine({block: {
          seq: {func: {code: function() {
                return [1, 2, 3, 4, 5, 6];
              }}},
          result: "",
          args: [{forEach: {
              from: "# this.get('seq')",
              body: "# this.set('result', this.get('result') + this.get('item'))"
            }}, "# this.get('result')"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isString(result));
        assert.equal(result, "123456");
      }).nodeify(done);
    });
    it('should work parallel non scheduled', function(done) {
      var engine = new ActivityExecutionEngine({block: {
          seq: {func: {code: function() {
                return [1, 2, 3, 4, 5, 6];
              }}},
          result: "",
          args: [{forEach: {
              parallel: true,
              varName: "klow",
              from: "# this.get('seq')",
              body: "# this.set('result', this.get('result') + this.get('klow'))"
            }}, "# this.get('result')"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isString(result));
        assert.equal(result, "123456");
      }).nodeify(done);
    });
    it('should work parallel scheduled', function(done) {
      var engine = new ActivityExecutionEngine({block: {
          seq: {func: {code: function() {
                return [1, 2, 3, 4, 5, 6];
              }}},
          result: [],
          args: [{forEach: {
              parallel: true,
              varName: "klow",
              from: "# this.get('seq')",
              body: {func: {code: function() {
                    return Promise.delay(100).then(function() {
                      this.get("result").push(this.get("klow"));
                    });
                  }}}
            }}, "# this.get('result')"]
        }});
      engine.invoke().then(function(result) {
        assert(_.isArray(result));
        assert.equal(result, "123456");
      }).nodeify(done);
    });
  });
});
//# sourceMappingURL=data:application/json;base64,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LCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgd2Y0bm9kZSA9IHJlcXVpcmUoXCIuLi8uLi8uLi9cIik7XG52YXIgRXhwcmVzc2lvbiA9IHdmNG5vZGUuYWN0aXZpdGllcy5FeHByZXNzaW9uO1xudmFyIEZ1bmMgPSB3ZjRub2RlLmFjdGl2aXRpZXMuRnVuYztcbnZhciBCbG9jayA9IHdmNG5vZGUuYWN0aXZpdGllcy5CbG9jaztcbnZhciBhY3Rpdml0eU1hcmt1cCA9IHdmNG5vZGUuYWN0aXZpdGllcy5hY3Rpdml0eU1hcmt1cDtcbnZhciBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSA9IHdmNG5vZGUuYWN0aXZpdGllcy5BY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZTtcbnZhciBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbnZhciBDb25zb2xlVHJhY2tlciA9IHdmNG5vZGUuYWN0aXZpdGllcy5Db25zb2xlVHJhY2tlcjtcbnZhciBXb3JrZmxvd0hvc3QgPSB3ZjRub2RlLmhvc3RpbmcuV29ya2Zsb3dIb3N0O1xudmFyIEluc3RhbmNlSWRQYXJzZXIgPSB3ZjRub2RlLmhvc3RpbmcuSW5zdGFuY2VJZFBhcnNlcjtcbnZhciBQcm9taXNlID0gcmVxdWlyZShcImJsdWViaXJkXCIpO1xuXG52YXIgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKTtcblxuZGVzY3JpYmUoXCJGdW5jXCIsIGZ1bmN0aW9uICgpIHtcbiAgICBpdChcInNob3VsZCBydW4gd2l0aCBhIHN5bmNocm9ub3VzIGNvZGVcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdmFyIGZvcCA9IG5ldyBGdW5jKCk7XG4gICAgICAgIGZvcC5jb2RlID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iai5uYW1lO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoZm9wKTtcblxuICAgICAgICBlbmdpbmUuaW52b2tlKHsgbmFtZTogXCJHYWJvclwiIH0pLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgXCJHYWJvclwiKTtcbiAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBydW4gd2hlbiBjcmVhdGVkIGZyb20gbWFya3VwXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHZhciBmb3AgPSBhY3Rpdml0eU1hcmt1cC5wYXJzZShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmoubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoZm9wKTtcblxuICAgICAgICBlbmdpbmUuaW52b2tlKHsgbmFtZTogXCJHYWJvclwiIH0pLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgXCJHYWJvclwiKTtcbiAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBydW4gd2hlbiBjb2RlIGlzIGFzeW5jaHJvbm91c1wiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB2YXIgZm9wID0gbmV3IEZ1bmMoKTtcbiAgICAgICAgZm9wLmNvZGUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9iai5uYW1lKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKGZvcCk7XG5cbiAgICAgICAgZW5naW5lLmludm9rZSh7IG5hbWU6IFwiTWV6b1wiIH0pLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgXCJNZXpvXCIpO1xuICAgICAgICAgICAgfSkubm9kZWlmeShkb25lKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGFjY2VwdCBleHRlcm5hbCBwYXJhbWV0ZXJzIHRob3NlIGFyZSBmdW5jdGlvbnMgYWxzb1wiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB2YXIgZXhwZWN0ZWQgPSB7IG5hbWU6IFwiR2Fib3JcIiB9O1xuICAgICAgICB2YXIgZm9wID0gbmV3IEZ1bmMoKTtcbiAgICAgICAgZm9wLmNvZGUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqLm5hbWU7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBmb3BpbiA9IG5ldyBGdW5jKCk7XG4gICAgICAgIGZvcGluLmNvZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhwZWN0ZWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZShmb3ApO1xuICAgICAgICAvL2VuZ2luZS5hZGRUcmFja2VyKG5ldyBDb25zb2xlVHJhY2tlcigpKTtcblxuICAgICAgICBlbmdpbmUuaW52b2tlKGZvcGluKS50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIGV4cGVjdGVkLm5hbWUpO1xuICAgICAgICAgICAgfSkubm9kZWlmeShkb25lKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHdvcmsgYXMgYW4gYWd1bWVudFwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB2YXIgZXhwZWN0ZWQgPSB7IG5hbWU6IFwiR2Fib3JcIiB9O1xuXG4gICAgICAgIHZhciBmb3AgPSBhY3Rpdml0eU1hcmt1cC5wYXJzZShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBleHBlY3RlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmoubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoZm9wKTtcblxuICAgICAgICBlbmdpbmUuaW52b2tlKCkudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCBleHBlY3RlZC5uYW1lKTtcbiAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoXCJCbG9ja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIHZhcmlhYmxlcyB3ZWxsXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHZhciBibG9jayA9IG5ldyBCbG9jaygpO1xuICAgICAgICBibG9jay52YXIxID0gMTtcbiAgICAgICAgYmxvY2sudmFyMiA9IDI7XG4gICAgICAgIGJsb2NrLnZhcjMgPSAzO1xuXG4gICAgICAgIHZhciBmMSA9IG5ldyBGdW5jKCk7XG4gICAgICAgIGYxLmNvZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXQoXCJ2YXIzXCIsIHRoaXMuZ2V0KFwidmFyM1wiKSArIHRoaXMuZ2V0KFwidmFyMVwiKSAqIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGYyID0gbmV3IEZ1bmMoKTtcbiAgICAgICAgZjIuY29kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldChcInZhcjNcIiwgdGhpcy5nZXQoXCJ2YXIzXCIpICsgdGhpcy5nZXQoXCJ2YXIyXCIpICogMyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZjMgPSBuZXcgRnVuYygpO1xuICAgICAgICBmMy5jb2RlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwidmFyM1wiKSAqIDQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKGJsb2NrKTtcblxuICAgICAgICBlbmdpbmUuaW52b2tlKGYxLCBmMiwgZjMpLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHgxID0gMTtcbiAgICAgICAgICAgICAgICB2YXIgeDIgPSAyO1xuICAgICAgICAgICAgICAgIHZhciB4MyA9IDM7XG4gICAgICAgICAgICAgICAgeDMgKz0geDEgKiAyO1xuICAgICAgICAgICAgICAgIHgzICs9IHgyICogMztcbiAgICAgICAgICAgICAgICB2YXIgciA9IHgzICogNDtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCByKTtcbiAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgfSk7XG5cbiAgICBpdChcImNhbiBiZSBnZW5lcmF0ZWQgZnJvbSBtYXJrdXBcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdmFyIGJsb2NrID0gYWN0aXZpdHlNYXJrdXAucGFyc2UoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmxvY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyMTogMSxcbiAgICAgICAgICAgICAgICAgICAgdmFyMjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB2YXIzOiAzLFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBmdW5jdGlvbiBidWJ1KCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0KFwidmFyM1wiLCB0aGlzLmdldChcInZhcjNcIikgKyB0aGlzLmdldChcInZhcjFcIikgKiAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBmdW5jdGlvbiBraXR0eWZ1Y2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXQoXCJ2YXIzXCIsIHRoaXMuZ2V0KFwidmFyM1wiKSArIHRoaXMuZ2V0KFwidmFyMlwiKSAqIDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldChcInZhcjNcIikgKiA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZShibG9jayk7XG5cbiAgICAgICAgZW5naW5lLmludm9rZSgpLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHgxID0gMTtcbiAgICAgICAgICAgICAgICB2YXIgeDIgPSAyO1xuICAgICAgICAgICAgICAgIHZhciB4MyA9IDM7XG4gICAgICAgICAgICAgICAgeDMgKz0geDEgKiAyO1xuICAgICAgICAgICAgICAgIHgzICs9IHgyICogMztcbiAgICAgICAgICAgICAgICB2YXIgciA9IHgzICogNDtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCByKTtcbiAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgfSk7XG5cbiAgICBpdChcImNhbiBiZSBnZW5lcmF0ZWQgZnJvbSBtYXJrdXAgc3RyaW5nXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHZhciBtYXJrdXAgPSB7XG4gICAgICAgICAgICBibG9jazoge1xuICAgICAgICAgICAgICAgIHZhcjE6IDEsXG4gICAgICAgICAgICAgICAgdmFyMjogMixcbiAgICAgICAgICAgICAgICB2YXIzOiAzLFxuICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uIGJ1YnUoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldChcInZhcjNcIiwgdGhpcy5nZXQoXCJ2YXIzXCIpICsgdGhpcy5nZXQoXCJ2YXIxXCIpICogMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24ga2l0dHlmdWNrKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXQoXCJ2YXIzXCIsIHRoaXMuZ2V0KFwidmFyM1wiKSArIHRoaXMuZ2V0KFwidmFyMlwiKSAqIDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwidmFyM1wiKSAqIDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBtYXJrdXBTdHJpbmcgPSBhY3Rpdml0eU1hcmt1cC5zdHJpbmdpZnkobWFya3VwKTtcbiAgICAgICAgYXNzZXJ0Lm9rKF8uaXNTdHJpbmcobWFya3VwU3RyaW5nKSk7XG4gICAgICAgIHZhciBibG9jayA9IGFjdGl2aXR5TWFya3VwLnBhcnNlKG1hcmt1cFN0cmluZyk7XG5cbiAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZShibG9jayk7XG5cbiAgICAgICAgZW5naW5lLmludm9rZSgpLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHgxID0gMTtcbiAgICAgICAgICAgICAgICB2YXIgeDIgPSAyO1xuICAgICAgICAgICAgICAgIHZhciB4MyA9IDM7XG4gICAgICAgICAgICAgICAgeDMgKz0geDEgKiAyO1xuICAgICAgICAgICAgICAgIHgzICs9IHgyICogMztcbiAgICAgICAgICAgICAgICB2YXIgciA9IHgzICogNDtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCByKTtcbiAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoXCJQYXJhbGxlbFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaXQoXCJzaG91bGQgd29yayBhcyBleHBlY3RlZCB3aXRoIHN5bmMgYWN0aXZpdGllc1wiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB2YXIgYWN0aXZpdHkgPSBhY3Rpdml0eU1hcmt1cC5wYXJzZShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBwYXJhbGxlbDoge1xuICAgICAgICAgICAgICAgICAgICB2YXIxOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoXCJ2YXIxXCIsIFwiYVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiAnZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmFkZChcInZhcjFcIiwgXCJiXCIpOyB9J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoYWN0aXZpdHkpO1xuICAgICAgICAvL2VuZ2luZS5hZGRUcmFja2VyKG5ldyBDb25zb2xlVHJhY2tlcigpKTtcblxuICAgICAgICBlbmdpbmUuaW52b2tlKCkudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0Lmxlbmd0aCwgMik7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdFswXSwgXCJhXCIpO1xuICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHRbMV0sIFwiYWJcIik7XG4gICAgICAgICAgICB9KS5ub2RlaWZ5KGRvbmUpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgd29yayBhcyBleHBlY3RlZCB3aXRoIGFzeW5jIGFjdGl2aXRpZXNcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdmFyIGFjdGl2aXR5ID0gYWN0aXZpdHlNYXJrdXAucGFyc2UoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcGFyYWxsZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyMTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKFwidmFyMVwiLCBcImFcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogJ2Z1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5hZGQoXCJ2YXIxXCIsIFwiYlwiKTsgfSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuZGVsYXkoMTAwKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gNDI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZShhY3Rpdml0eSk7XG4gICAgICAgIC8vZW5naW5lLmFkZFRyYWNrZXIobmV3IENvbnNvbGVUcmFja2VyKCkpO1xuXG4gICAgICAgIGVuZ2luZS5pbnZva2UoKS50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQubGVuZ3RoLCA0KTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0WzBdLCBcImFcIik7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdFsxXSwgXCJhYlwiKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0WzJdLCA0Mik7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdFszXSwgMCk7XG4gICAgICAgICAgICB9KS5ub2RlaWZ5KGRvbmUpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKFwiUGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgaXQoXCJzaG91bGQgd29yayBhcyBleHBlY3RlZCB3aXRoIHN5bmMgYWN0aXZpdGllc1wiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB2YXIgYWN0aXZpdHkgPSBhY3Rpdml0eU1hcmt1cC5wYXJzZShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBwaWNrOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhcjE6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZChcInZhcjFcIiwgXCJhXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6ICdmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuYWRkKFwidmFyMVwiLCBcImJcIik7IH0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZShhY3Rpdml0eSk7XG5cbiAgICAgICAgZW5naW5lLmludm9rZSgpLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgXCJhXCIpO1xuICAgICAgICAgICAgfSkubm9kZWlmeShkb25lKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHdvcmsgYXMgZXhwZWN0ZWQgd2l0aCBhc3luYyBhY3Rpdml0aWVzXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHZhciBhY3Rpdml0eSA9IGFjdGl2aXR5TWFya3VwLnBhcnNlKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHBpY2s6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuZGVsYXkoMTAwKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA0MjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZShhY3Rpdml0eSk7XG5cbiAgICAgICAgZW5naW5lLmludm9rZSgpLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgMCk7XG4gICAgICAgICAgICB9KS5ub2RlaWZ5KGRvbmUpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKFwiRXhwcmVzc2lvblwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaXQoXCJzaG91bGQgbXVsdGlwbHkgdHdvIG51bWJlcnNcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdmFyIGV4cHIgPSBuZXcgRXhwcmVzc2lvbigpO1xuICAgICAgICBleHByLmV4cHIgPSBcInRoaXMuZ2V0KCd2JykgKiB0aGlzLmdldCgndicpXCI7XG4gICAgICAgIHZhciBibG9jayA9IG5ldyBCbG9jaygpO1xuICAgICAgICBibG9jay52ID0gMjtcbiAgICAgICAgYmxvY2suYXJncyA9IFtleHByXTtcblxuICAgICAgICB2YXIgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKGJsb2NrKTtcblxuICAgICAgICBlbmdpbmUuaW52b2tlKCkudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LCA0KTtcbiAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCB3b3JrcyBmcm9tIG1hcmt1cFwiLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICB2YXIgYmxvY2sgPSBhY3Rpdml0eU1hcmt1cC5wYXJzZShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBibG9jazoge1xuICAgICAgICAgICAgICAgICAgICB2OiAyLFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBcIiMgdGhpcy5nZXQoJ3YnKSAqIHRoaXMuZ2V0KCd2JylcIlxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZShibG9jayk7XG5cbiAgICAgICAgZW5naW5lLmludm9rZSgpLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgNCk7XG4gICAgICAgICAgICB9KS5ub2RlaWZ5KGRvbmUpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKFwiV2hpbGVcIiwgZnVuY3Rpb24gKCkge1xuICAgIGl0KFwic2hvdWxkIHJ1biBhIGJhc2ljIGN5Y2xlXCIsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHZhciBibG9jayA9IGFjdGl2aXR5TWFya3VwLnBhcnNlKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJsb2NrOiB7XG4gICAgICAgICAgICAgICAgICAgIGk6IDEwLFxuICAgICAgICAgICAgICAgICAgICBqOiAwLFxuICAgICAgICAgICAgICAgICAgICB6OiAwLFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZGl0aW9uOiBcIiMgdGhpcy5nZXQoJ2onKSA8IHRoaXMuZ2V0KCdpJylcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogXCIjIHRoaXMucG9zdGZpeEluYygnaicpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQHRvXCI6IFwielwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiIyB7IGo6IHRoaXMuZ2V0KCdqJyksIHo6IHRoaXMuZ2V0KCd6JykgfVwiXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB2YXIgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKGJsb2NrKTtcbiAgICAgICAgLy9lbmdpbmUuYWRkVHJhY2tlcihuZXcgQ29uc29sZVRyYWNrZXIoKSk7XG5cbiAgICAgICAgZW5naW5lLmludm9rZSgpLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0Lm9rKF8uaXNPYmplY3QocmVzdWx0KSk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC5qLCAxMCk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC56LCA5KTtcbiAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgfSk7XG59KTtcblxuZGVzY3JpYmUoXCJJZlwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaXQoXCJzaG91bGQgY2FsbCB0aGVuIGJvZHlcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdmFyIGJsb2NrID0gYWN0aXZpdHlNYXJrdXAucGFyc2Uoe1xuICAgICAgICAgICAgYmxvY2s6IHtcbiAgICAgICAgICAgICAgICB2OiA1LFxuICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWY6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25kaXRpb246IFwiIyB0aGlzLmdldCgndicpID09IDVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuQm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhICsgdGhpcy5nZXQoJ3YnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZUJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogWzJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYSArIHRoaXMuZ2V0KCd2Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoYmxvY2spO1xuICAgICAgICBlbmdpbmUuaW52b2tlKCkudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoMSArIDUsIHJlc3VsdCk7XG4gICAgICAgICAgICB9KS5ub2RlaWZ5KGRvbmUpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgY2FsbCBlbHNlIGJvZHlcIiwgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgdmFyIGJsb2NrID0gYWN0aXZpdHlNYXJrdXAucGFyc2Uoe1xuICAgICAgICAgICAgYmxvY2s6IHtcbiAgICAgICAgICAgICAgICB2OiA1LFxuICAgICAgICAgICAgICAgIHI6IDAsXG4gICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmRpdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuQm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KFwiclwiLCBhICsgdGhpcy5nZXQoXCJ2XCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZUJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJnczogWzJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldChcInJcIiwgYSArIHRoaXMuZ2V0KFwidlwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiIyB0aGlzLmdldCgncicpXCJcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoYmxvY2spO1xuICAgICAgICBlbmdpbmUuaW52b2tlKCkudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwoMiArIDUsIHJlc3VsdCk7XG4gICAgICAgICAgICB9KS5ub2RlaWZ5KGRvbmUpO1xuICAgIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdMb2dpYyBPcGVyYXRvcnMnLCBmdW5jdGlvbiAoKSB7XG4gICAgZGVzY3JpYmUoJ1RydXRoeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaXQoJ3Nob3VsZCB3b3JrJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgIHZhciBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoe1xuICAgICAgICAgICAgICAgIGJsb2NrOiB7XG4gICAgICAgICAgICAgICAgICAgIHQxOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnV0aHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ2EnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHQyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnV0aHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0Mzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1dGh5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXM6ICdpcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNOb3Q6ICdpc05vdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdDQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydXRoeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzOiAnaXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTm90OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2lzTm90JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWycjIHRoaXMuZ2V0KFwidDFcIiknLCAnIyB0aGlzLmdldChcInQyXCIpJywgJyMgdGhpcy5nZXQoXCJ0M1wiKScsICcjIHRoaXMuZ2V0KFwidDRcIiknXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVuZ2luZS5pbnZva2UoKS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0Lm9rKF8uaXNBcnJheShyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdFswXSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHRbMV0sIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdFsyXSwgJ2lzJyk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHRbM10sICdpc05vdCcpO1xuICAgICAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ0ZhbHN5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpdCgnc2hvdWxkIHdvcmsnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XG4gICAgICAgICAgICAgICAgYmxvY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgdDE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbHN5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdhJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0Mjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFsc3k6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0Mzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFsc3k6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpczogJ2lzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05vdDogJ2lzTm90J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0NDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFsc3k6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpczogJyMgXCJpc1wiJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05vdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdpc05vdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsnIyB0aGlzLmdldChcInQxXCIpJywgJyMgdGhpcy5nZXQoXCJ0MlwiKScsICcjIHRoaXMuZ2V0KFwidDNcIiknLCAnIyB0aGlzLmdldChcInQ0XCIpJ11cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBlbmdpbmUuaW52b2tlKCkudGhlbihcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5vayhfLmlzQXJyYXkocmVzdWx0KSk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHRbMF0sIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdFsxXSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHRbMl0sICdpc05vdCcpO1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0WzNdLCAnaXMnKTtcbiAgICAgICAgICAgICAgICB9KS5ub2RlaWZ5KGRvbmUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdFcXVhbHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGl0KCdzaG91bGQgd29yaycsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICB2YXIgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHtcbiAgICAgICAgICAgICAgICBibG9jazoge1xuICAgICAgICAgICAgICAgICAgICBhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcXVhbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gNDI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogJyMgNDAgKyAyICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc0Mic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05vdDogJ2FiYSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXF1YWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDQyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86ICcjIDQwICsgMSAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnNDInO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNOb3Q6ICdhYmEnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGE6ICcjIHRoaXMuZ2V0KFwiYVwiKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBiOiAnIyB0aGlzLmdldChcImJcIiknXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZW5naW5lLmludm9rZSgpLnRoZW4oXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQub2soXy5pc1BsYWluT2JqZWN0KHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LmEsICc0MicpO1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LmIsICdhYmEnKTtcbiAgICAgICAgICAgICAgICB9KS5ub2RlaWZ5KGRvbmUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdOb3RFcXVhbHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGl0KCdzaG91bGQgd29yaycsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICB2YXIgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHtcbiAgICAgICAgICAgICAgICBibG9jazoge1xuICAgICAgICAgICAgICAgICAgICBhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3RFcXVhbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gNDI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzogJyMgNDAgKyAyICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc0Mic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc05vdDogJ2FiYSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm90RXF1YWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDQyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG86ICcjIDQwICsgMSAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnNDInO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNOb3Q6ICdhYmEnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGE6ICcjIHRoaXMuZ2V0KFwiYVwiKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBiOiAnIyB0aGlzLmdldChcImJcIiknXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZW5naW5lLmludm9rZSgpLnRoZW4oXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQub2soXy5pc1BsYWluT2JqZWN0KHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LmEsICdhYmEnKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC5iLCAnNDInKTtcbiAgICAgICAgICAgICAgICB9KS5ub2RlaWZ5KGRvbmUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdOb3QsIEFuZCwgT3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGl0KCdzaG91bGQgd29yaycsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICB2YXIgZW5naW5lID0gbmV3IEFjdGl2aXR5RXhlY3V0aW9uRW5naW5lKHtcbiAgICAgICAgICAgICAgICBibG9jazoge1xuICAgICAgICAgICAgICAgICAgICBhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdidWJ1JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIyB0cnVlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyMgdHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIyBbIDQyIF0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmFsc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuZGVsYXkoMTAwKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA0MjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhOiAnIyB0aGlzLmdldChcImFcIiknLFxuICAgICAgICAgICAgICAgICAgICAgICAgYjogJyMgdGhpcy5nZXQoXCJiXCIpJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVuZ2luZS5pbnZva2UoKS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0Lm9rKF8uaXNQbGFpbk9iamVjdChyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC5hLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdC5iLCA0Mik7XG4gICAgICAgICAgICAgICAgfSkubm9kZWlmeShkb25lKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnRm9yJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpdCgnc2hvdWxkIHdvcmsgYmV0d2VlbiByYW5nZSAwIGFuZCAxMCBieSBzdGVwIDEnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XG4gICAgICAgICAgICAgICAgYmxvY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VxOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5kZWxheSgxMDApLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gMTA7IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBcIiMgdGhpcy5zZXQoJ3NlcScsIHRoaXMuZ2V0KCdzZXEnKSArIHRoaXMuZ2V0KCdpJykpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCIjIHRoaXMuZ2V0KCdzZXEnKVwiXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZW5naW5lLmludm9rZSgpLnRoZW4oXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoXy5pc1N0cmluZyhyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgXCIwMTIzNDU2Nzg5XCIpO1xuICAgICAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgd29yayBiZXR3ZWVuIHJhbmdlIDEwIGRvd250byA0IGJ5IHN0ZXAgLTInLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XG4gICAgICAgICAgICAgICAgYmxvY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VxOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICByOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuZGVsYXkoMTAwKS50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQ7IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwOiAtMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyTmFtZTogXCJrbG93XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IFwiIyB0aGlzLnNldCgnc2VxJywgdGhpcy5nZXQoJ3NlcScpICsgdGhpcy5nZXQoJ2tsb3cnKSlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJAdG9cIjogXCJyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCIjIHsgdjogdGhpcy5nZXQoJ3NlcScpLCByOiB0aGlzLmdldCgncicpIH1cIlxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVuZ2luZS5pbnZva2UoKS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KF8uaXNPYmplY3QocmVzdWx0KSk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQudiwgXCIxMDg2XCIpO1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwocmVzdWx0LnIsIFwiMTA4NlwiKTtcbiAgICAgICAgICAgICAgICB9KS5ub2RlaWZ5KGRvbmUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdGb3JFYWNoJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpdCgnc2hvdWxkIHdvcmsgbm9uIHBhcmFsbGVsJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgIHZhciBlbmdpbmUgPSBuZXcgQWN0aXZpdHlFeGVjdXRpb25FbmdpbmUoe1xuICAgICAgICAgICAgICAgIGJsb2NrOiB7XG4gICAgICAgICAgICAgICAgICAgIHNlcToge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsxLCAyLCAzLCA0LCA1LCA2XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvckVhY2g6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogXCIjIHRoaXMuZ2V0KCdzZXEnKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBcIiMgdGhpcy5zZXQoJ3Jlc3VsdCcsIHRoaXMuZ2V0KCdyZXN1bHQnKSArIHRoaXMuZ2V0KCdpdGVtJykpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCIjIHRoaXMuZ2V0KCdyZXN1bHQnKVwiXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZW5naW5lLmludm9rZSgpLnRoZW4oXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoXy5pc1N0cmluZyhyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgXCIxMjM0NTZcIik7XG4gICAgICAgICAgICAgICAgfSkubm9kZWlmeShkb25lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCB3b3JrIHBhcmFsbGVsIG5vbiBzY2hlZHVsZWQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XG4gICAgICAgICAgICAgICAgYmxvY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VxOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzEsIDIsIDMsIDQsIDUsIDZdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yRWFjaDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbGxlbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyTmFtZTogXCJrbG93XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IFwiIyB0aGlzLmdldCgnc2VxJylcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogXCIjIHRoaXMuc2V0KCdyZXN1bHQnLCB0aGlzLmdldCgncmVzdWx0JykgKyB0aGlzLmdldCgna2xvdycpKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiIyB0aGlzLmdldCgncmVzdWx0JylcIlxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVuZ2luZS5pbnZva2UoKS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KF8uaXNTdHJpbmcocmVzdWx0KSk7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbChyZXN1bHQsIFwiMTIzNDU2XCIpO1xuICAgICAgICAgICAgICAgIH0pLm5vZGVpZnkoZG9uZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgd29yayBwYXJhbGxlbCBzY2hlZHVsZWQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgdmFyIGVuZ2luZSA9IG5ldyBBY3Rpdml0eUV4ZWN1dGlvbkVuZ2luZSh7XG4gICAgICAgICAgICAgICAgYmxvY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VxOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzEsIDIsIDMsIDQsIDUsIDZdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBbXSxcbiAgICAgICAgICAgICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvckVhY2g6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYWxsZWw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhck5hbWU6IFwia2xvd1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBcIiMgdGhpcy5nZXQoJ3NlcScpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuZGVsYXkoMTAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXQoXCJyZXN1bHRcIikucHVzaCh0aGlzLmdldChcImtsb3dcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiIyB0aGlzLmdldCgncmVzdWx0JylcIlxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVuZ2luZS5pbnZva2UoKS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KF8uaXNBcnJheShyZXN1bHQpKTtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgXCIxMjM0NTZcIik7XG4gICAgICAgICAgICAgICAgfSkubm9kZWlmeShkb25lKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiJdfQ==
