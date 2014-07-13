var StrMap = require("backpack-node").collections.StrMap;
var Guid = require("guid");
require('date-utils');
var specStrings = require("../common/specStrings");
var InstIdPaths = require("./instIdPaths");

function MemoryPersistence()
{
    this._instanceData = new StrMap();
    this._paths = new InstIdPaths();
    this._locksById = new StrMap();
    this._locksByName = new StrMap();
}

MemoryPersistence.prototype.enterLock = function (lockName, inLockTimeoutMs)
{
    var now = new Date();
    var cLock = this._locksByName.get(lockName);
    if (cLock === undefined || now.compareTo(cLock.heldTo) === -1)
    {
        var lockInfo = {
            id: Guid.create().toString(),
            name: lockName,
            heldTo: new Date().addMilliseconds(inLockTimeoutMs)
        };

        this._locksById.set(lockInfo.id, lockInfo);
        this._locksByName.set(lockInfo.name, lockInfo);

        return lockInfo;
    }
    return null;
}

MemoryPersistence.prototype.renewLock = function (lockId, inLockTimeoutMs)
{
    var cLock = this._getLockById(lockId);
    cLock.heldTo = new Date().addMilliseconds(inLockTimeoutMs);
}

MemoryPersistence.prototype.renameLock = function (lockId, lockName)
{
    var cLock = this._getLockById(lockId);
    if (cLock.name !== lockName)
    {
        if (this._locksByName.containsKey(lockName)) throw new Error("Lock '" + lockName + "' already held.");
        this._locksByName.remove(cLock.name);
        cLock.name = lockName;
        this._locksByName.add(cLock.name, cLock);
    }
}

MemoryPersistence.prototype.exitLock = function (lockId)
{
    var cLock = this._getLockById(lockId);
    this._locksByName.remove(cLock.name);
    this._locksById.remove(cLock.id);
}

MemoryPersistence.prototype._getLockById = function (lockId)
{
    var cLock = this._locksById.get(lockId);
    var now = new Date();
    if (!cLock || now.compareTo(cLock.heldTo) > -1) throw new Error("Lock by id '" + lockId + "' doesn't exists.");
    return cLock;
}

MemoryPersistence.prototype.getRunningInstanceIdPaths = function (workflowName, methodName)
{
    var result = [];
    this._paths.forEach(
        workflowName, methodName,
        function (p)
        {
            result.push(p);
        });
    return result;
}

MemoryPersistence.prototype.isRunning = function (workflowName, instanceId)
{
    return this._instanceData.containsKey(specStrings.hosting.doubleKeys(workflowName, instanceId));
}

MemoryPersistence.prototype.persistState = function (state)
{
    var self = this;
    var key = specStrings.hosting.doubleKeys(state.workflowName, state.instanceId);
    var oldState = this._instanceData.get(key);
    if (oldState)
    {
        oldState.idleMethods.forEach(
            function (m)
            {
                self._paths.remove(oldState.workflowName, m.methodName, m.instanceIdPath);
            });
        this._instanceData.remove(key);
    }
    self._instanceData.set(key, state);
    state.idleMethods.forEach(
        function (m)
        {
            self._paths.add(state.workflowName, m.methodName, m.instanceIdPath);
        });
}

MemoryPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId, methodName)
{
    var state = this.loadState(workflowName, instanceId);
    var result = null;
    state.idleMethods.forEach(
        function (m)
        {
            if (m.methodName === methodName)
            {
                result = {
                    instanceIdPath: m.instanceIdPath,
                    updatedOn: state.updatedOn,
                    workflowVersion: state.workflowVersion
                };
                return false;
            }
        })
    if (result === null) throw new Error("Running instance id path for workflow '" + workflowName + "' by id '" + instanceId + " and method '" + methodName + "' not found.");
    return result;
}

MemoryPersistence.prototype.loadState = function (workflowName, instanceId)
{
    var state = this._instanceData.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    if (!state) throw new Error("Instance data of workflow '" + workflowName + "' by id '" + instanceId + "' is not found.");
    return state;
}

MemoryPersistence.prototype.removeState = function (workflowName, instanceId)
{
    var state = this.loadState(workflowName, instanceId);
    state.idleMethods.forEach(
        function (m)
        {
            self._paths.remove(state.workflowName, m.methodName, m.instanceIdPath);
        });
    this._instanceData.remove(specStrings.hosting.doubleKeys(workflowName, instanceId));
}

MemoryPersistence.prototype.loadPromotedProperties = function (workflowName, instanceId)
{
    var state = this._instanceData.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    return state ? state.promotedProperties : null;
}

module.exports = MemoryPersistence;