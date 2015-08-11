"use strict";

let Activity = require("./activity");
let Composite = require("./composite");
let util = require("util");
let _ = require("lodash");
let specStrings = require("../common/specStrings");
let errors = require("../common/errors");
let assert = require("assert");

function DelayTo() {
    Composite.call(this);

    this.to = null;
}

util.inherits(DelayTo, Composite);

DelayTo.prototype.createImplementation = function (execContext) {
    assert(!!execContext);
    let methodName = specStrings.hosting.createDelayToMethodName(this.getInstanceId(execContext));
    return {
        "@block": {
            delayTo: "= this.$parent.to",
            args: [
                {
                    "@if": {
                        condition: "= _.isDate(this.delayTo)",
                        then: {
                            "@method": {
                                methodName: methodName,
                                instanceIdPath: "[0]"
                            }
                        }
                    }
                }
            ]
        }
    };
};

module.exports = DelayTo;