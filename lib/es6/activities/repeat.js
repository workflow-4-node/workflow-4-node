"use strict";
let Activity = require("./activity");
let Composite = require("./composite");
let util = require("util");
let _ = require("lodash");
require("date-utils");
let TimeSpan = require("timespan").TimeSpan;

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
    weekly: "weekly"
};

util.inherits(Repeat, Composite);

Repeat.prototype.createImplementation = function (execContext) {
    let tmpl = {
        "@block": {
            start: "= this.$parent.start || (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay()))",
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
                                        let self = this;
                                        let now = new Date();
                                        let next = this._next_;
                                        let value = self.intervalValue;
                                        switch (self.intervalType) {
                                            case "secondly":
                                                next = next.add({ seconds: value });
                                                break;
                                            case "minutely":
                                                next = next.add({ minutes: value });
                                                break;
                                            case "hourly":
                                                next = next.add({ hours: value });
                                                break;
                                            case "weekly":
                                                next = next.add({ weeks: value });
                                                break;
                                            default:
                                                next = next.add({ days: value });
                                                break;
                                        }
                                        if (next.getTime() > now.getTime()) {
                                            // If this is in the future, then we're done:
                                            return next;
                                        }
                                        else {
                                            let dSec = (now - next) / 1000.0;
                                            let interval;
                                            switch (self.intervalType) {
                                                case "secondly":
                                                    interval = TimeSpan.fromSeconds(self.intervalValue);
                                                    break;
                                                case "minutely":
                                                    interval = TimeSpan.fromMinutes(self.intervalValue);
                                                    break;
                                                case "hourly":
                                                    interval = TimeSpan.fromHours(self.intervalValue);
                                                    break;
                                                case "weekly":
                                                    interval = TimeSpan.fromDays(self.intervalValue * 7);
                                                    break;
                                                default:
                                                    interval = TimeSpan.fromDays(self.intervalValue);
                                                    break;
                                            }
                                            interval = interval.totalSeconds();
                                            let mod = dSec % interval;
                                            let toAdd = interval - mod;
                                            return now.add({ seconds: toAdd });
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
        let str = JSON.stringify(tmpl);
        str = str.replace(/_next_/g, this.nextPropName);
        tmpl = JSON.parse(str);
    }

    return tmpl;
};

module.exports = Repeat;