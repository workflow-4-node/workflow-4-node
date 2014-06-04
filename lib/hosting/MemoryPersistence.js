var Map = require("backpack-node").collections.Map;
var Bag = require("backpack-node").collections.Bag;
var Guid = require("guid");
require('date-utils');

function Names(name1, name2)
{
    this.name1 = name1;
    this.name2 = name2;
}

Names.prototype.getMapKey = function()
{
    return this.name1 + this.name2;
}

Names.prototype.equals = function(other)
{
    return this.name1 === other.name1 && this.name2 === other.name2;
}

function MemoryPersistence()
{
    this._instanceData = new Map();
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
    self._instanceData.set(state.instanceId, state);
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

MemoryPersistence.prototype.getRunningInstanceIdHeader = function (instanceId, methodName)
{
    var state = this.loadState(instanceId);
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
    if (result === null) throw new Error("Running instance id path for id '" + instanceId + " and method '" + methodName + "' not found.");
    return result;
}

MemoryPersistence.prototype.loadState = function (instanceId)
{
    var state = this._instanceData.get(instanceId);
    if (!state) throw new Error("Instance data of '" + instanceId + "' is not found.");
    return state;
}

module.exports = MemoryPersistence;