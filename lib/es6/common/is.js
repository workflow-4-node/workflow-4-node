var _ = require("lodash");

module.exports = {
    generator: function (fn) {
        return fn && fn.constructor && fn.constructor.name === "GeneratorFunction";
    },
    activity(obj) {
        return obj && obj instanceof require("../activities/activity");
    },
    template(obj) {
        return obj && obj instanceof require("../activities/template");
    }
};
