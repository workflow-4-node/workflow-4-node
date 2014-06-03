var Map = require("backpack-node").collections.Map;
var Bag = require("backpack-node").collections.Bag;
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
    this._locks = new Map();
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

MemoryPersistence.prototype.enterLock = function (lockName, inLockTimeoutMs)
{
    var now = new Date();
    var cLock = this._locks.get(lockName);
    if (cLock === undefined || now.compareTo(cLock.heldTo) === -1)
    {
        var lockInfo = {
            id: lockName,
            name: lockName,
            heldTo: new Date().addMilliseconds(inLockTimeoutMs)
        };

        this._locks.set(lockName, lockInfo);

        return lockInfo;
    }
    return null;
}

MemoryPersistence.prototype.renameLock = function (lockId, lockName)
{
    if (lockId === lockName) return;
    var cLock = this._locks.get(lockId);
    if (cLock)
    {
        this._locks.remove(lockId);
        cLock.id = lockName;
        cLock.name = lockName;
        this._locks.add(cLock.id, cLock);
    }
}

MemoryPersistence.prototype.exitLock = function (lockId)
{
    this._locks.remove(lockId);
}

MemoryPersistence.prototype.persistState = function (data)
{
    var self = this;
    var wfName = data.workflow.name.trim();
    self._instanceData.set(data.instanceId, data);
    data.idleMethods.forEach(function(m)
    {
        self._paths.add(new Names(wfName, m.methodName), { value: m.instanceIdPath, instanceId: data.instanceId });
    });
}

module.exports = MemoryPersistence;