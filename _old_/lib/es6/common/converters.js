"use strict";
let assert = require("better-assert");
let _ = require("lodash");

module.exports = {
    mapToArray: function (map) {
        if (!map) {
            return null;
        }
        assert(map instanceof Map);
        let json = [];
        for (let kvp of map.entries()) {
            json.push(kvp);
        }
        return json;
    },
    arrayToMap: function (json) {
        if (!json) {
            return null;
        }
        assert(_.isArray(json));
        let map = new Map();
        for (let kvp of json) {
            map.set(kvp[0], kvp[1]);
        }
        return map;
    },
    setToArray: function (set) {
        if (!set) {
            return null;
        }
        assert(set instanceof Set);
        let json = [];
        for (let val of set.values()) {
            json.push(val);
        }
        return json;
    },
    arrayToSet: function (json) {
        if (!json) {
            return null;
        }
        assert(_.isArray(json));
        let set = new Set();
        for (let val of json) {
            set.add(val);
        }
        return set;
    }
};