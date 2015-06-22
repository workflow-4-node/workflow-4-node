var Activity = require('./activity');
var util = require('util');
var _ = require('lodash');
var fast = require('fast.js');

function And() {
    Activity.call(this);

    this.isTrue = true;
    this.isFalse = false;
}

util.inherits(And, Activity);

And.prototype.run = function (callContext, args) {
    callContext.schedule(args, '_argsGot');
}

And.prototype._argsGot = function(callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    var isTrue = false;
    if (result.length) {
        isTrue = true;
        fast.forEach(result, function (v) {
            isTrue = (v ? true : false) && isTrue;
        });
    }

    if (isTrue) {
        callContext.schedule(this.get('isTrue'), '_done');
    }
    else {
        callContext.schedule(this.get('isFalse'), '_done');
    }
}

And.prototype._done = function(callContext, reason, result) {
    callContext.end(reason, result);
}

module.exports = And;