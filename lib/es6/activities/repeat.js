"use strict";
let Activity = require("./activity");
let Composite = require("./composite");
let util = require("util");
let _ = require("lodash");
require("date-utils");

function Repeat() {
    Composite.call(this);

    this.start = null;
    this.intervalType = null;
    this.intervalValue = null;
    this.nextPropName = "next";
}

Repeat.intervalTypes = {
    secondly: "secondly",
    minutely: "minutely",
    hourly: "hourly",
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly",
    yearly: "yearly"
};

util.inherits(Repeat, Composite);

Repeat.prototype.createImplementation = function (execContext) {
    let tmpl = {
        "@block": {
            start: "= this.$parent.start || new Date()",
            intervalType: `= this.$parent.intervalType || '${Repeat.intervalTypes.daily}'`,
            intervalValue: "= this.$parent.intervalValue || 1",
            "`pArgs": "= this.$parent.args",
            "_next_": null,
            args: [
                {
                    "@assign": {
                        to: "_next_",
                        value: "= this.start"
                    }
                },
                {
                    while: {
                        condition: true,
                        args: [
                            {
                                "@delayTo": {
                                    to: "= this._next_"
                                }
                            },
                            {
                                "@block": ["= this.pArgs"]
                            },
                            {
                                "@assign": {
                                    to: "_next_",
                                    value: function () {
                                        let next = this._next_;
                                        let value = this.intervalValue;
                                        switch (this.intervalType) {
                                            case "secondly":
                                                return next.add({ seconds: value });
                                            case "minutely":
                                                return next.add({ minutes: value });
                                            case "hourly":
                                                return next.add({ hours: value });
                                            case "weekly":
                                                return next.add({ weeks: value });
                                            case "monthly":
                                                return next.add({ months: value });
                                            case "yearly":
                                                return next.add({ years : value });
                                            default:
                                                return next.add({ days: value });
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };

    if (this.nextPropName !== "next") {
        tmpl = JSON.stringify(tmpl);
        tmpl = tmpl.replace(/_next_/g, this.nextPropName);
        tmpl = JSON.parse(tmpl);
    }

    return tmpl;
};

module.exports = Repeat;