"use strict";
let Activity = require("./activity");
let Composite = require("./composite");
let util = require("util");
let _ = require("lodash");
require("date-utils");
let timespan = require("timespan");
let TimeSpan = timespan.TimeSpan;
let debug = require("debug")("wf4node:Repeat");

function Repeat() {
    Composite.call(this);

    this.startOn = null;
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
    let args = this.args;
    this.args = null;
    return {
        "@block": {
            startOn: "= this.$parent.startOn || (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))",
            intervalType: `= this.$parent.intervalType || '${Repeat.intervalTypes.daily}'`,
            intervalValue: "= this.$parent.intervalValue || 1",
            next: null,
            args: [
                {
                    "@assign": {
                        to: "next",
                        value: "= this.startOn"
                    }
                },
                {
                    "@while": {
                        condition: true,
                        args: [
                            function () {
                                debug("Delaying to: %s", this.next);
                            },
                            {
                                "@delayTo": {
                                    to: "= this.next"
                                }
                            },
                            function () {
                                debug("Delayed to: %s. Running arguments.", new Date());
                            },
                            {
                                "@block": args
                            },
                            {
                                "@assign": {
                                    to: "next",
                                    value: function () {
                                        let self = this;
                                        let now = new Date();
                                        let next = this.next;
                                        debug("Calculating next's value from: %s. intervalType: %s, intervalValue: %d", next.getTime(), self.intervalType, self.intervalValue);
                                        let value = self.intervalValue;
                                        switch (self.intervalType) {
                                            case "secondly":
                                                next = next.add({ milliseconds: value * 1000 });
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
                                        debug("New next is: %s", next.getTime());
                                        if (next.getTime() > now.getTime()) {
                                            debug("That's a future value, returning.");
                                            // If this is in the future, then we're done:
                                            return next;
                                        }
                                        else {
                                            debug("That's a past value, calculating future value by adding periods.");
                                            let dSec = (now - next) / 1000.0;
                                            debug("Total distance in seconds: %d", dSec);
                                            let interval;
                                            switch (self.intervalType) {
                                                case "secondly":
                                                    interval = timespan.fromSeconds(self.intervalValue);
                                                    break;
                                                case "minutely":
                                                    interval = timespan.fromMinutes(self.intervalValue);
                                                    break;
                                                case "hourly":
                                                    interval = timespan.fromHours(self.intervalValue);
                                                    break;
                                                case "weekly":
                                                    interval = timespan.fromDays(self.intervalValue * 7);
                                                    break;
                                                default:
                                                    interval = timespan.fromDays(self.intervalValue);
                                                    break;
                                            }
                                            interval = interval.totalSeconds();
                                            debug("Interval in seconds: %d", interval);
                                            let mod = dSec % interval;
                                            debug("Remainder is: %d", mod);
                                            let toAdd = interval - mod;
                                            debug("To add to now is: %d", toAdd);
                                            let result = now.add({ seconds: toAdd });
                                            debug("Result is: %s", result.getTime());
                                            return result;
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
};

module.exports = Repeat;