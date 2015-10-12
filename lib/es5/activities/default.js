"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var WithBody = require("./withBody");
function Default() {
  WithBody.call(this);
}
util.inherits(Default, WithBody);
module.exports = Default;

//# sourceMappingURL=default.js.map
