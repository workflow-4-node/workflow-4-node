"use strict";

var _ = require("lodash");

var genRegex = /^function[\s]*\*/;

module.exports = {
    activity: function activity(obj) {
        return obj && obj instanceof require("../activities/activity");
    },
    template: function template(obj) {
        return obj && obj instanceof require("../activities/template");
    }
};
//# sourceMappingURL=is.js.map
