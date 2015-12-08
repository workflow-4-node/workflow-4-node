"use strict";

var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");

function Or() {
    Activity.call(this);

    this.isTrue = true;
    this.isFalse = false;
}

util.inherits(Or, Activity);

Or.prototype.run = function (callContext, args) {
    callContext.schedule(args, "_argsGot");
};

Or.prototype._argsGot = function (callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    var isTrue = false;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = result[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var v = _step.value;

            isTrue = (v ? true : false) || isTrue;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    if (isTrue) {
        callContext.schedule(this.isTrue, "_done");
    } else {
        callContext.schedule(this.isFalse, "_done");
    }
};

Or.prototype._done = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = Or;
//# sourceMappingURL=or.js.map
