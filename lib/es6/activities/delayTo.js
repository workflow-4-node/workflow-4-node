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
            v: null,
            done: false,
            args: [
                {
                    "@if": {
                        condition: "= _.isDate(this.delayTo)",
                        then: [
                            {
                                "@while": {
                                    condition: "= !this.done",
                                    args: [
                                        {
                                            "@beginMethod": {
                                                methodName: methodName,
                                                instanceIdPath: "[0]",
                                                "@to": "v"
                                            }
                                        },
                                        {
                                            "@if": {
                                                condition: "= this.v[1].getTime() === this.delayTo.getTime()",
                                                then: {
                                                    "@assign": {
                                                        to: "done",
                                                        value: true
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            "@endMethod": {
                                                methodName: methodName
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };
};

module.exports = DelayTo;