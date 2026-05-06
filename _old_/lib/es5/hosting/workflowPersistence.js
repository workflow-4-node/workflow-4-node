"use strict";

var _ = require("lodash");
var WorkflowInstance = require("./workflowInstance");
var errors = require("../common/errors");
var asyncHelpers = require("../common/asyncHelpers");
var Bluebird = require("bluebird");
var async = asyncHelpers.async;
var assert = require("better-assert");

function WorkflowPersistence(impl) {
    assert(_.isObject(impl));

    this._impl = impl;
}

WorkflowPersistence.prototype.enterLock = function (lockName, enterLockTimeoutMs, inLockTimeoutMs) {
    assert(_.isString(lockName));
    assert(_.isNumber(enterLockTimeoutMs));
    assert(enterLockTimeoutMs >= 1000);
    assert(_.isNumber(inLockTimeoutMs));
    assert(inLockTimeoutMs >= 1000);

    var self = this;
    return asyncHelpers.aggressiveRetry(function () {
        return Bluebird.resolve(self._impl.enterLock(lockName, inLockTimeoutMs));
    }, function (lockInfo) {
        return !!lockInfo;
    }, enterLockTimeoutMs, function () {
        return new errors.TimeoutError("Entering lock '" + lockName + "' has timed out.");
    });
};

WorkflowPersistence.prototype.renewLock = function (lockId, inLockTimeoutMs) {
    assert(!!lockId);
    assert(inLockTimeoutMs > 0);

    return Bluebird.resolve(this._impl.renewLock(lockId, inLockTimeoutMs));
};

WorkflowPersistence.prototype.exitLock = function (lockId) {
    assert(!!lockId);

    return Bluebird.resolve(this._impl.exitLock(lockId));
};

WorkflowPersistence.prototype.isRunning = function (workflowName, instanceId) {
    assert(_.isString(workflowName));
    assert(!!instanceId);

    return Bluebird.resolve(this._impl.isRunning(workflowName, instanceId));
};

WorkflowPersistence.prototype.persistState = function (instance) {
    assert(instance instanceof WorkflowInstance);

    var data = instance.getStateToPersist();
    return Bluebird.resolve(this._impl.persistState(data));
};

WorkflowPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId) {
    assert(_.isString(workflowName));
    assert(!!instanceId);

    return Bluebird.resolve(this._impl.getRunningInstanceIdHeader(workflowName, instanceId));
};

WorkflowPersistence.prototype.loadState = async(regeneratorRuntime.mark(function _callee(workflowName, instanceId) {
    var state;
    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    assert(_.isString(workflowName));
                    assert(!!instanceId);

                    // Without: idleMethods, promotedProperties
                    _context.next = 4;
                    return Bluebird.resolve(this._impl.loadState(workflowName, instanceId));

                case 4:
                    state = _context.sent;

                    if (state) {
                        _context.next = 7;
                        break;
                    }

                    throw new Error("Instance state of workflow '" + workflowName + "' by id '" + instanceId + "' is not found.");

                case 7:
                    return _context.abrupt("return", state);

                case 8:
                case "end":
                    return _context.stop();
            }
        }
    }, _callee, this);
}));

WorkflowPersistence.prototype.removeState = function (workflowName, instanceId, succeeded, error) {
    assert(_.isString(workflowName));
    assert(!!instanceId);
    assert(_.isBoolean(succeeded));

    return Bluebird.resolve(this._impl.removeState(workflowName, instanceId, succeeded, error));
};

WorkflowPersistence.prototype.loadPromotedProperties = function (workflowName, instanceId) {
    assert(_.isString(workflowName));
    assert(!!instanceId);

    return Bluebird.resolve(this._impl.loadPromotedProperties(workflowName, instanceId));
};

WorkflowPersistence.prototype.getNextWakeupables = function (count) {
    assert(count > 0);

    return Bluebird.resolve(this._impl.getNextWakeupables(count));
};

WorkflowPersistence.prototype.getRunningInstanceHeadersForOtherVersion = function (workflowName, version) {
    assert(_.isString(workflowName));
    assert(_.isString(version));

    return Bluebird.resolve(this._impl.getRunningInstanceHeadersForOtherVersion(workflowName, version));
};

module.exports = WorkflowPersistence;
//# sourceMappingURL=workflowPersistence.js.map
