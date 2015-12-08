"use strict";

var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");

function Merge() {
    Activity.call(this);

    this.isTrue = true;
    this.isFalse = false;
}

util.inherits(Merge, Activity);

Merge.prototype.run = function (callContext, args) {
    callContext.schedule(args, "_argsGot");
};

Merge.prototype._argsGot = function (callContext, reason, result) {
    if (reason !== Activity.states.complete) {
        callContext.end(reason, result);
        return;
    }

    var merged = undefined;
    var mergedIsObj = false;
    var mergedIsArray = false;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = result[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            var isObj = _.isPlainObject(item);
            var isArray = _.isArray(item);
            if (isObj || isArray) {
                if (!merged) {
                    merged = isObj ? _.cloneDeep(item) : item.slice(0);
                    mergedIsObj = isObj;
                    mergedIsArray = isArray;
                } else if (isObj) {
                    if (!mergedIsObj) {
                        callContext.fail(new Error("Object cannot merged with an array."));
                        return;
                    }
                    _.extend(merged, item);
                } else {
                    if (!mergedIsArray) {
                        callContext.fail(new Error("Array cannot merged with an object."));
                        return;
                    }
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = item[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var sub = _step2.value;

                            merged.push(sub);
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                }
            } else {
                callContext.fail(new Error("Only objects and arrays could be merged."));
                return;
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

    callContext.complete(merged);
};

module.exports = Merge;
//# sourceMappingURL=merge.js.map
