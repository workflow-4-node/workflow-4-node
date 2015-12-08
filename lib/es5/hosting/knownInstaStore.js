"use strict";

var specStrings = require("../common/specStrings");
var InstIdPaths = require("./instIdPaths");
var _ = require("lodash");
var debug = require("debug")("wf4node:KnownInstaStore");
var enums = require("../common/enums");

function KnownInstaStore() {
    this._instances = new Map();
}

KnownInstaStore.prototype.add = function (workflowName, insta) {
    this._instances.set(specStrings.hosting.doubleKeys(workflowName, insta.id), insta);
};

KnownInstaStore.prototype.get = function (workflowName, instanceId) {
    return this._instances.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

KnownInstaStore.prototype.exists = function (workflowName, instanceId) {
    return this._instances.has(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

KnownInstaStore.prototype.remove = function (workflowName, instanceId) {
    this._instances.delete(specStrings.hosting.doubleKeys(workflowName, instanceId));
};

KnownInstaStore.prototype.getNextWakeupables = function (count) {
    var now = new Date();
    var result = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = this._instances.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var insta = _step.value;

            if (insta.execState === enums.activityStates.idle && insta.activeDelays) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = insta.activeDelays[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var ad = _step2.value;

                        if (ad.delayTo <= now) {
                            result.push({
                                instanceId: insta.id,
                                workflowName: insta.workflowName,
                                activeDelay: {
                                    methodName: ad.methodName,
                                    delayTo: ad.delayTo
                                }
                            });
                        }
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

    result.sort(function (i1, i2) {
        if (i1.updatedOn < i2.updatedOn) {
            return -1;
        } else if (i1.updatedOn > i2.updatedOn) {
            return 1;
        } else if (i1.activeDelay.delayTo < i2.activeDelay.delayTo) {
            return -1;
        } else if (i1.activeDelay.delayTo > i2.activeDelay.delayTo) {
            return 1;
        }
        return 0;
    });
    return _.take(result, count);
};

KnownInstaStore.prototype.getRunningInstanceHeadersForOtherVersion = function (workflowName, version) {
    var result = [];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = this._instances.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var insta = _step3.value;

            if (insta.workflowName === workflowName && insta.version !== version) {
                result.push({
                    workflowName: insta.workflowName,
                    workflowVersion: insta.workflowVersion,
                    instanceId: insta.id
                });
            }
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return result;
};

KnownInstaStore.prototype.addTracker = function (tracker) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = this._instances.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var insta = _step4.value;

            insta.addTracker(tracker);
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }
};

module.exports = KnownInstaStore;
//# sourceMappingURL=knownInstaStore.js.map
