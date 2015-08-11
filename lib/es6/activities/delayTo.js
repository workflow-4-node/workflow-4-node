"use strict";

let Activity = require("./activity");
let Composite = require("./composite");
let util = require("util");
let _ = require("lodash");
let specStrings = require("../common/specStrings");
let errors = require("../common/errors");

function DelayTo() {
    Composite.call(this);

    this.to = null;
}

util.inherits(DelayTo, Composite);

DelayTo.prototype.createImplementation = function() {
    return {
        "@if": {
            condition: "= _.isDate(this.to)",
            args: {
                "@method": {
                    methodName: {
                        "@call": {
                            methodName: "createMethodName"
                        }
                    },
                    instanceIdPath: "[0]"
                }
            }
        }
    };
};

DelayTo.prototype.createMethodName = function() {
    return specStrings.hosting.createDelayToMethodName(this.to);
};

module.exports = DelayTo;