"use strict"
/*global describe,it*/
;
var wf4node = require("../../../");
var SimpleProxy = wf4node.common.SimpleProxy;

var assert = require("better-assert");
var _ = require("lodash");

describe("SimpleProxy", function () {
    it("should work", function () {
        var backend = {
            name: "Gabor",
            getKeys: function getKeys(proxy) {
                return _.keys(this);
            },
            getValue: function getValue(proxy, name) {
                var v = this[name];
                if (_.isUndefined(v)) {
                    throw new Error(name + " doesn't exists.");
                }
                return v;
            },
            setValue: function setValue(proxy, name, value) {
                return this[name] = value;
            }
        };
        var obj = new SimpleProxy(backend);

        obj.foo = "bar";

        assert(obj.foo === "bar");
        assert(obj.name === "Gabor");
        try {
            var x = obj.punci;
            assert(false);
        } catch (e) {
            _.noop(e);
        }
        try {
            obj.punci = 5;
            assert(false);
        } catch (e) {
            _.noop(e);
        }
        obj.name = 33;
        assert(obj.name === 33);
        assert(backend.name === 33);
        backend.punci = "je";
        assert(backend.punci === "je");
        obj.update();
        assert(obj.punci === "je");

        var keys = _.keys(obj).sort();
        assert(keys.length === 3);
        assert(keys[0] === "foo");
        assert(obj[keys[0]] === "bar");
        assert(keys[1] === "name");
        assert(obj[keys[1]] === 33);
        assert(keys[2] === "punci");
        assert(obj[keys[2]] === "je");

        delete backend.punci;
        assert(backend.punci === undefined);
        try {
            assert(obj.punci === undefined);
            assert(false);
        } catch (e) {
            _.noop(e);
        }

        obj.update();
        assert(obj.punci === undefined);

        keys.length = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        keys.sort();
        assert(keys.length === 2);
        assert(keys[0] === "foo");
        assert(obj[keys[0]] === "bar");
        assert(keys[1] === "name");
        assert(obj[keys[1]] === 33);
    });

    it("should accept new props on update", function () {
        var backend = {
            name: "Gabor",
            getKeys: function getKeys(proxy) {
                return _.keys(this);
            },
            getValue: function getValue(proxy, name) {
                var v = this[name];
                if (_.isUndefined(v)) {
                    throw new Error(name + " doesn't exists.");
                }
                return v;
            },
            setValue: function setValue(proxy, name, value) {
                return this[name] = value;
            }
        };
        var obj = new SimpleProxy(backend);

        assert(backend.name === "Gabor");
        assert(obj.name === "Gabor");

        obj.klow = "mudz";

        assert(obj.klow === "mudz");
        try {
            assert(backend.klow === "mudz");
            assert(false);
        } catch (e) {
            _.noop(e);
        }
        obj.update();
        assert(obj.klow === "mudz");
        assert(backend.klow === "mudz");

        // Ensure that the value originates itself from the backend:
        backend.klow = "foo";
        assert(obj.klow === "foo");
        assert(backend.klow === "foo");
    });
});
//# sourceMappingURL=simpleProxy.js.map
