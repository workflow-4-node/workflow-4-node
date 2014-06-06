var Map = require("backpack-node").collections.Map;
var StrMap = require("backpack-node").collections.StrMap;
var Bag = require("backpack-node").collections.Bag;
var Guid = require("guid");
require('date-utils');
var Names = require("./names");

function MemoryPersistence()
{
    this._instanceData = new StrMap();
    this._paths = new Bag();
    this._locksById = new Map();
    this._locksByName = new Map();
}

MemoryPersistence.prototype.enterLock = function (lockName, inLockTimeoutMs)
{
    var now = new Date();
    var cLock = this._locksByName.get(lockName);
    if (cLock === undefined || now.compareTo(cLock.heldTo) === -1)
    {
        var lockInfo = {
            id: Guid.create(),
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
    var key = new Names(workflowName, methodName);
    this._paths.forEachValueIn(key, function(path)
    {
        result.push(path);
    });
    return result;
}

MemoryPersistence.prototype.persistState = function (state)
{
    var self = this;
    var key = state.workflowName + state.instanceId.toString();
    var oldState = this._instanceData.get(key);
    if (oldState)
    {
        oldState.idleMethods.forEach(function(m)
        {
            self._paths.remove(new Names(oldState.workflowName, m.methodName));
        });
        this._instanceData.remove(key);
    }
    self._instanceData.set(key, state);
    state.idleMethods.forEach(function(m)
    {
        self._paths.add(
            new Names(state.workflowName, m.methodName),
            {
                value: m.instanceIdPath,
                instanceId: state.instanceId
            });
    });
}

MemoryPersistence.prototype.getRunningInstanceIdHeader = function (workflowName, instanceId, methodName)
{
    var state = this.loadState(workflowName, instanceId);
    var result = null;
    state.idleMethods.forEach(function(m)
    {
        if (m.methodName === methodName)
        {
            result = {
                instanceIdPath: m.instanceIdPath,
                timestamp: state.timestamp,
                version: state.version
            };
            return false;
        }
    })
    if (result === null) throw new Error("Running instance id path for workflow '" + workflowName + "' by id '" + instanceId + " and method '" + methodName + "' not found.");
    return result;
}

MemoryPersistence.prototype.loadState = function (workflowName, instanceId)
{
    var state = this._instanceData.get(workflowName + instanceId.toString());
    if (!state) throw new Error("Instance data of workflow '" + workflowName + "' by id '" + instanceId + "' is not found.");
    return state;
}

MemoryPersistence.prototype.removeState = function (workflowName, instanceId)
{
    var state = this.loadState(workflowName, instanceId);
    state.idleMethods.forEach(function(m)
    {
        self._paths.remove(new Names(state.workflowName, m.methodName));
    });
    this._instanceData.remove(workflowName + instanceId.toString());
}

module.exports = MemoryPersistence;