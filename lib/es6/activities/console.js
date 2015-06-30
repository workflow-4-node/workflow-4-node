"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");

function Console() {
    Activity.call(this);

    this.level = "log";
}

util.inherits(Console, Activity);

Console.prototype.run = function (callContext, args) {
    callContext.schedule(args, "_argsGot");
};

Console.prototype._argsGot = function(callContext, reason, result) {
    let f = console.log;
    switch (this.get("level")) {
        case "error":
            f = console.error;
            break;
        case "warn":
            f = console.warn;
            break;
        case "info":
            f = console.info;
            break;
    }
    f.apply(console, result);
    callContext.complete();
};

module.exports = Console;