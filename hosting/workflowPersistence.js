var _ = require("underscore-node");
var Q = require("q");

function WorkflowPersistence(impl)
{
    if (!_(impl).isObject()) throw new TypeError("Object argument expected.");

    this.impl = impl;
}

WorkflowPersistence.prototype.getRunningInstanceIdPaths = function (workflowName, methodName)
{
    var result = impl.getRunningInstanceIdPaths(workflowName, methodName);
    if (Q.isPromise(result)) return result;
    return Q.defer().resolve(result).promise;
}

module.exports = WorkflowPersistence;
