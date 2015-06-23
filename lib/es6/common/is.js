var _ = require("lodash");
var guids = require("./guids");

module.exports = {
    undefined: function (x) {
        return typeof x === "undefined";
    },

    defined: function (x) {
        return typeof x !== "undefined";
    },

    generator: function (fn) {
        return fn && fn.constructor && fn.constructor.name === "GeneratorFunction";
    },

    activity: function (obj) {
        return _.isObject(obj) && obj[guids.types.activity];
    },

    composite: function (obj) {
        return _.isObject(obj) && obj[guids.types.composite];
    },

    template: function (obj) {
        return _.isObject(obj) && obj[guids.types.template];
    }
};
