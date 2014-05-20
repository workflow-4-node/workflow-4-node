var Workflow = require("../activities/workflow");
var _ = require("underscore-node");

function WorkflowRegistry()
{
    this._workflows = {};
}

WorkflowRegistry.prototype.register = function(workflow)
{
    if (workflow instanceof Workflow)
    {
        if (!_(workflow.name).isString()) throw new TypeError("Workflow name is not a string.");
        var name = workflow.name.trim();
        if (!name) throw new TypeError("Workflow name is empty.");
        if (!_(workflow.version).isNumber()) throw new TypeError("Workflow version is not a number.");
        var version = workflow.version;

        var key = this._makeKey(name, key);
        if (this._workflows[key]) throw new Error("Workflow '" + key + "' already registered.");
        this._workflows[key] = workflow;
    }
    else
    {
        throw  new TypeError("Workflow instance argument expected.");
    }
}

WorkflowRegistry.prototype._makeKey = function(name, version)
{
    return name + "@" version;
}

WorkflowRegistry.prototype._splitKey = function (key)
{
    var pos = key.lastIndexOf("@");
    return { name: key.substr(0, pos), version: key.substr(pos + 1) };
}

module.exports = WorkflowRegistry;
