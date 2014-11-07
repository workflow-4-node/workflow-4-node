var _ = require("lodash");
var guids = require("./guids");

module.exports = {
    undefined: function (x) {
        return typeof x === "undefined";
    },

    defined: function (x) {
        return typeof x !== "undefined";
    },

    activity: function (obj) {
        return _.isObject(obj) && obj[guids.types.activity];
    },

    composite: function (obj) {
        return _.isObject(obj) && obj[guids.types.composite];
    },

    template: function (obj) {
        return _.isObject(obj) && obj[guids.types.template];
    },

    func: function (obj) {
        return _.isObject(obj) && obj[guids.types.func];
    }
};
