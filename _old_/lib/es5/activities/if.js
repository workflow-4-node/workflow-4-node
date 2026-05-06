"use strict";

var Activity = require("./activity");
var util = require("util");
var Block = require("./block");
var _ = require("lodash");

function If() {
    Activity.call(this);

    this.arrayProperties.add("then");
    this.arrayProperties.add("else");

    this.condition = null;
    this.then = null;
    this.else = null;
}

util.inherits(If, Activity);

If.prototype.initializeStructure = function () {
    if (this.then) {
        var prev = this.then;
        this.then = new Block();
        this.then.args = prev;
    }
    if (this.else) {
        var prev = this.else;
        this.else = new Block();
        this.else.args = prev;
    }
};

If.prototype.run = function (callContext, args) {
    var condition = this.condition;
    if (condition) {
        callContext.schedule(condition, "_conditionGot");
    } else {
        callContext.complete();
    }
};

If.prototype._conditionGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (result) {
            var then = this.then;
            if (then) {
                callContext.schedule(then, "_bodyFinished");
                return;
            }
        } else {
            var _else = this.else;
            if (_else) {
                callContext.schedule(_else, "_bodyFinished");
                return;
            }
        }
        callContext.complete();
    } else {
        callContext.end(reason, result);
    }
};

If.prototype._bodyFinished = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = If;
//# sourceMappingURL=if.js.map
