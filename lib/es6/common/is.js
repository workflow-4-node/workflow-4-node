"use strict";

let _ = require("lodash");

let genRegex = /^function[\s]*\*/;

module.exports = {
    activity(obj) {
        return obj && obj instanceof require("../activities/activity");
    },
    template(obj) {
        return obj && obj instanceof require("../activities/template");
    }
};
