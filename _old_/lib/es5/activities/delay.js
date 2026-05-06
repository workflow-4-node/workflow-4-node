"use strict";

var Activity = require("./activity");
var Composite = require("./composite");
var util = require("util");
var _ = require("lodash");
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
//# sourceMappingURL=delay.js.map
