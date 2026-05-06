"use strict";
let Activity = require("./activity");
let Composite = require("./composite");
let util = require("util");
let _ = require("lodash");
require("date-utils");

function Delay() {
    Composite.call(this);

    this.ms = null;
}

util.inherits(Delay, Composite);

Delay.prototype.createImplementation = function (execContext) {
    return {
        "@delayTo": {
            to: "= new Date().addMilliseconds(this.$parent.ms || 0)"
        }
    };
};

module.exports = Delay;