"use strict";

var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var Case = require("./case");
var When = require("./when");
var Default = require("./default");
var errors = require("../common/errors");
var constants = require("../common/constants");

function Switch() {
    Activity.call(this);

    this.expression = null;
}

util.inherits(Switch, Activity);

Switch.prototype.run = function (callContext, args) {
    if (args && args.length) {
        var parts = {
            cases: [],
            whens: [],
            default: null
        };
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var arg = _step.value;

                if (arg instanceof Case) {
                    parts.cases.push(arg);
                } else if (arg instanceof When) {
                    parts.whens.push(arg);
                } else if (arg instanceof Default) {
                    if (parts.default === null) {
                        parts.default = arg;
                    } else {
                        throw new errors.ActivityRuntimeError("Multiple default for a switch is not allowed.");
                    }
                }
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

        if (parts.cases.length || parts.whens.length || parts.default) {
            this._parts = parts;
            if (parts.cases.length) {
                this._doCase = true;
                callContext.schedule(this.expression, "_expressionGot");
            } else {
                this._doCase = false;
                callContext.activity._step.call(this, callContext);
            }
            return;
        }
    }
    callContext.complete();
};

Switch.prototype._expressionGot = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        this.expression = result;
        callContext.activity._step.call(this, callContext);
    } else {
        callContext.end(reason, result);
    }
};

Switch.prototype._step = function (callContext) {
    var parts = this._parts;
    var doCase = this._doCase;
    if (doCase && parts.cases.length) {
        var next = parts.cases[0];
        parts.cases.splice(0, 1);
        callContext.schedule(next, "_partCompleted");
    } else if (!doCase && parts.whens.length) {
        var next = parts.whens[0];
        parts.whens.splice(0, 1);
        callContext.schedule(next, "_partCompleted");
    } else if (parts.default) {
        callContext.schedule(parts.default, "_partCompleted");
    } else {
        callContext.complete();
    }
};

Switch.prototype._partCompleted = function (callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (result === constants.markers.nope) {
            callContext.activity._step.call(this, callContext);
        } else {
            callContext.complete(result);
        }
    } else {
        callContext.end(reason, result);
    }
};

module.exports = Switch;
//# sourceMappingURL=switch.js.map
