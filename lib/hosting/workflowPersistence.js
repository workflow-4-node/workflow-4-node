var _ = require("underscore-node");
var Q = require("q");
var WorkflowInstance = require("./workflowInstance");
var errors = require("../common/errors");
var asyncHelpers = require("./asyncHelpers");

function WorkflowPersistence(impl)
{
    if (!_(impl).isObject()) throw new TypeError("Object argument expected.");

    this._impl = impl;
}

WorkflowPersistence.prototype.enterLock = function(lockName, enterLockTimeoutMs, inLockTimeoutMs)
{
    if (!_(lockName).isString()) throw new TypeError("Argument 'lockName' is not a string.");
    if (!_(enterLockTimeoutMs).isNumber()) throw new TypeError("Argument 'enterLockTimeoutMs' is not a number.");
    if (enterLockTimeoutMs < 1000) throw new Error("Argument 'enterLockTimeoutMs' have to be above 1000ms.");
    if (!_(inLockTimeoutMs).isNumber()) throw new TypeError("Argument 'inLockTimeoutMs' is not a number.");
    if (inLockTimeoutMs < 1000) throw new Error("Argument 'inLockTimeoutMs' have to be above 1000ms.");

    var self = this;
    return asyncHelpers.aggressiveRetry(
        self._enterLock(lockName, inLockTimeoutMs),
        function (lockInfo)
        {
            return lockInfo != null;
        },
        enterLockTimeoutMs,
        function ()
        {
            return new errors.WorkflowError("Entering lock '" + lockName + "' has timed out.");
        }
    );
}

WorkflowPersistence.prototype._enterLock = function (lockName, inLockTimeoutMs)
{
    return Q(this._impl.enterLock(lockName, inLockTimeoutMs));
}

WorkflowPersistence.prototype.renameLock = function (lockId, lockName)
{
    return Q(this._impl.renameLock(lockId, lockName));
}

WorkflowPersistence.prototype.renewLock = function (lockId, inLockTimeoutMs)
{
    return Q(this._impl.renewLock(lockName, inLockTimeoutMs));
}

WorkflowPersistence.prototype.exitLock = function (lockId)
{
    return Q(this._impl.exitLock(lockId));
}

WorkflowPersistence.prototype.getRunningInstanceIdPaths = function (workflowName, methodName)
{
    if (!_(workflowName).isString()) throw new TypeError("Argument 'workflowName' is not a string.");
    if (!_(methodName).isString()) throw new TypeError("Argument 'methodName' is not a string.");

    return Q(this._impl.getRunningInstanceIdPaths(workflowName, methodName));
}

WorkflowPersistence.prototype.persistState = function (instance)
{
    if (!(instance instanceof WorkflowInstance)) throw new TypeError("WorkflowInstance argument expected.");

    var data = instance.getStateToPersist();
    return Q(this._impl.persistState(data));
}

WorkflowPersistence.prototype.getRunningInstanceIdHeader = function (instanceId, methodName)
{
    return Q(this._impl.getRunningInstanceIdHeader(instanceId, methodName));
}

WorkflowPersistence.prototype.loadState = function (instanceId)
{
    // Without: idleMethods, promotions
    return Q(this._impl.loadState(instanceId));
}

module.exports = WorkflowPersistence;
