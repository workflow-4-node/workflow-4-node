"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let WithBody = require("./withBody");

function Default() {
    WithBody.call(this);
}

util.inherits(Default, WithBody);

module.exports = Default;