"use strict";
var _ = require("lodash");
var genRegex = /^function[\s]*\*/;
module.exports = {
  activity: function(obj) {
    return obj && obj instanceof require("../activities/activity");
  },
  template: function(obj) {
    return obj && obj instanceof require("../activities/template");
  }
};

//# sourceMappingURL=is.js.map
