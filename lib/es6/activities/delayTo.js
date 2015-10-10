"use strict";

let Activity = require("./activity");
let Composite = require("./composite");
let util = require("util");
let _ = require("lodash");
let specStrings = require("../common/specStrings");
let errors = require("../common/errors");
let assert = require("assert");
let Bluebird = require("bluebird");

function DelayTo() {
    Composite.call(this);

    this.to = null;
    this._inHost = false;
}

util.inherits(DelayTo, Composite);

DelayTo.prototype.createImplementation = function (execContext) {
    assert(!!execContext);
    let methodName = specStrings.hosting.createDelayToMethodName(this.getInstanceId(execContext));
    return {
        "@block": {
            inHost: "= this.$parent._inHost",
            delayTo: "= this.$parent.to",
            args: {
                "@if": {
                    condition: "= this.inHost",
                    then: {
                        "@block": {
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
                    },
                    else: function() {
                        if (this.delayTo && _.isDate(this.delayTo)) {
                            let ms = this.delayTo - new Date();
                            if (ms < 0) {
                                ms = 0;
                            }
                            if (ms) {
                                return Bluebird.delay(ms);
                            }
                        }
                    }
                }
            }
        }
    };
};

DelayTo.prototype.run = function(callContext, args) {
    this._inHost = !!callContext.executionContext.engine.instance;
    Composite.prototype.run.call(this, callContext, args);
};

module.exports = DelayTo;