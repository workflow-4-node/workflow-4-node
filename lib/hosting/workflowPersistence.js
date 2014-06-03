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
    return this._asPromise(this._impl.enterLock(lockName, inLockTimeoutMs));
}

WorkflowPersistence.prototype.renameLock = function (lockId, lockName)
{
    return this._asPromise(this._impl.renameLock(lockId, lockName));
}

WorkflowPersistence.prototype.exitLock = function (lockId)
{
    return this._asPromise(this._impl.exitLock(lockId));
}

WorkflowPersistence.prototype.getRunningInstanceIdPaths = function (workflowName, methodName)
{
    if (!_(workflowName).isString()) throw new TypeError("Argument 'workflowName' is not a string.");
    if (!_(methodName).isString()) throw new TypeError("Argument 'methodName' is not a string.");

    return this._asPromise(this._impl.getRunningInstanceIdPaths(workflowName, methodName));
}

WorkflowPersistence.prototype.persistState = function (instance)
{
    if (!(instance instanceof WorkflowInstance)) throw new TypeError("WorkflowInstance argument expected.");

    var data = instance.getPersistData();
    return this._asPromise(this._impl.persistState(data));
}

WorkflowPersistence.prototype._asPromise = function (result)
{
    if (Q.isPromise(result)) return result;
    var d = Q.defer();
    d.resolve(result);
    return d.promise;
}

module.exports = WorkflowPersistence;
