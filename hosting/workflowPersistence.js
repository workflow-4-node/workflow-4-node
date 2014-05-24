var _ = require("underscore-node");
var Q = require("q");

function WorkflowPersistence(impl)
{
    if (!_(impl).isObject()) throw new TypeError("Object argument expected.");

    this._impl = impl;
}

WorkflowPersistence.prototype.getRunningInstanceIdPaths = function (workflowName, methodName)
{
    var result = this._impl.getRunningInstanceIdPaths(workflowName, methodName);
    if (Q.isPromise(result)) return result;
    var d = Q.defer();
    d.resolve(result);
    return d.promise;
}

module.exports = WorkflowPersistence;
