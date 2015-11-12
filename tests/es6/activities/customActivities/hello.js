"use strict";
let wf4node = require("../../../../");
let util = require("util");
let Activity = wf4node.activities.Activity;
let Composite = wf4node.activities.Composite;

let _ = require("lodash");

function Hello() {
    Composite.call(this);

    this.to = null;
}

util.inherits(Hello, Composite);

Hello.prototype.createImplementation = function() {
    return {
        "@block": {
            to: "= this.$parent.to",
            args: function() {
                return `Hello ${this.to}!`;
            }
        }
    };
};

module.exports = Hello;
