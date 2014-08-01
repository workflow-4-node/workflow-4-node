var StrMap = require("backpack-node").collections.StrMap;
var Guid = require("guid");
require('date-utils');
var specStrings = require("../common/specStrings");
var InstIdPaths = require("./instIdPaths");
var is = require("../common/is");
var fast = require("fast.js");

function MemoryPersistence(log)
{
    this._instanceData = new StrMap();
    this._paths = new InstIdPaths();
    this._locksById = new StrMap();
    this._locksByName = new StrMap();
    this._log = log === true;
}

MemoryPersistence.prototype.enterLock = function (lockName, inLockTimeoutMs)
{
    if (this._log) console.log("enterLock(" + lockName + ", " + inLockTimeoutMs + ");\n");

    var now = new Date();
    var cLock = this._locksByName.get(lockName);
    if (is.undefined(cLock) || cLock.heldTo.compareTo(now) === -1)
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
    if (this._log) console.log("renewLock(" + lockId + ", " + inLockTimeoutMs + ");\n");

    var cLock = this._getLockById(lockId);
    cLock.heldTo = new Date().addMilliseconds(inLockTimeoutMs);
}

MemoryPersistence.prototype.exitLock = function (lockId)
{
    if (this._log) console.log("exitLock(" + lockId + ");\n");

    var cLock = this._getLockById(lockId);
    this._locksByName.remove(cLock.name);
    this._locksById.remove(cLock.id);
}

MemoryPersistence.prototype._getLockById = function (lockId)
{
    var cLock = this._locksById.get(lockId);
    var now = new Date();
    if (!cLock || now.compareTo(cLock.heldTo) > 0) throw new Error("Lock by id '" + lockId + "' doesn't exists.");
    return cLock;
}

MemoryPersistence.prototype.getRunningInstanceIdPaths = function (workflowName, methodName)
{
    if (this._log) console.log("getRunningInstanceIdPaths(" + workflowName + ", " + methodName + ");\n");

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
    if (this._log) console.log("isRunning(" + workflowName + ", " + instanceId + ");\n");

    return this._instanceData.containsKey(specStrings.hosting.doubleKeys(workflowName, instanceId));
}

MemoryPersistence.prototype.persistState = function (state)
{
    if (this._log) console.log("persistState(" + state.workflowName + ", " + state.instanceId + ");\n");

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
    if (this._log) console.log("getRunningInstanceIdHeader(" + workflowName + ", " + instanceId + ", " + methodName + ");\n");

    var state = this._loadState(workflowName, instanceId);
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
    if (this._log) console.log("loadState(" + workflowName + ", " + instanceId + ");\n");

    return this._loadState(workflowName, instanceId);
}

MemoryPersistence.prototype.removeState = function (workflowName, instanceId)
{
    if (this._log) console.log("removeState(" + workflowName + ", " + instanceId + ");\n");

    var self = this;
    var state = this._loadState(workflowName, instanceId);
    state.idleMethods.forEach(
        function (m)
        {
            self._paths.remove(state.workflowName, m.methodName, m.instanceIdPath);
        });
    this._instanceData.remove(specStrings.hosting.doubleKeys(workflowName, instanceId));
}

MemoryPersistence.prototype._loadState = function (workflowName, instanceId)
{
    var state = this._instanceData.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    if (!state) throw new Error("Instance data of workflow '" + workflowName + "' by id '" + instanceId + "' is not found.");
    return state;
}

MemoryPersistence.prototype.loadPromotedProperties = function (workflowName, instanceId)
{
    if (this._log) console.log("loadPromotedProperties(" + workflowName + ", " + instanceId + ");\n");

    var state = this._instanceData.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
    return state ? state.promotedProperties : null;
}

module.exports = MemoryPersistence;