"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let Block = require("./block");

function WithBody() {
    Activity.call(this);

    this._body = null;
}

util.inherits(WithBody, Activity);

WithBody.prototype.initializeStructure = function() {
    this._body = new Block();
    this._body.args = this.args;
    this.args = null;
};

WithBody.prototype.run = function (callContext, args) {
    let _body = args && args.length ? args : this._body;
    if (_body.args && _body.args.length) {
        callContext.schedule(_body, "bodyCompleted");
    }
    else {
        this.bodyCompleted(callContext, Activity.states.complete);
    }
};

WithBody.prototype.bodyCompleted = function(callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = WithBody;