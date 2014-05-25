function MemoryPersistence()
{
}

MemoryPersistence.prototype.getRunningInstanceIdPaths = function (workflowName, methodName)
{
    return [];
}

MemoryPersistence.prototype.persistState = function (instanceId, timestamp, state, promotions)
{
}

module.exports = MemoryPersistence;