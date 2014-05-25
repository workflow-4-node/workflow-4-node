var _ = require("underscore-node");
var Q = require("q");
var WorkflowInstance = require("./workflowInstance");

function WorkflowPersistence(impl)
{
    if (!_(impl).isObject()) throw new TypeError("Object argument expected.");

    this._impl = impl;
}

WorkflowPersistence.prototype.getRunningInstanceIdPaths = function (workflowName, methodName)
{
    if (!_(workflowName).isString()) throw new TypeError("Argument 'workflowName' is not a string.");
    if (!_(methodName).isString()) throw new TypeError("Argument 'methodName' is not a string.");

    var result = this._impl.getRunningInstanceIdPaths(workflowName, methodName);
    if (Q.isPromise(result)) return result;
    var d = Q.defer();
    d.resolve(result);
    return d.promise;
}

WorkflowPersistence.prototype.persistState = function (instance)
{
    if (!(instance instanceof WorkflowInstance)) throw new TypeError("WorkflowInstance argument expected.");

    var data = instance.getPersistData();
    var result = this._impl.persistState(data);
    if (Q.isPromise(result)) return result;
    var d = Q.defer();
    d.resolve(result);
    return d.promise;
}

module.exports = WorkflowPersistence;
