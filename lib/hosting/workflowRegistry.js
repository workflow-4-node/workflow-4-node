var Workflow = require("../activities/workflow");
var _ = require("lodash");
var specStrings = require("../common/specStrings");
var BeginMethod = require("../activities/beginMethod");

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

        var entry = this._workflows[name];
        if (entry)
        {
            var desc = entry[version];
            if (desc)
            {
                throw new Error("Workflow " + name + " " + version + " already registered.");
            }
            else
            {
                entry[version] = this._createDesc(workflow, name, version);
            }
        }
        else
        {
            entry = {};
            entry[version] = this._createDesc(workflow, name, version);
            this._workflows[name] = entry;
        }
    }
    else
    {
        throw  new TypeError("Workflow instance argument expected.");
    }
}

WorkflowRegistry.prototype.getDesc = function(name, version)
{
    var entry = this._workflows[name];
    if (entry)
    {
        if (version !== undefined)
        {
            var desc = entry[version];
            if (desc) return desc;
            throw new Error("Workflow " + name + " " + version + " has not been registered.");
        }
        else
        {
            // Get top version
            var maxV = -10000000;
            var desc = null;
            for (var cv in entry) if (cv > maxV) desc = entry[maxV = cv];
            if (desc) return desc;
            throw new Error("Workflow " + name + " has not been registered.");
        }
    }

}

WorkflowRegistry.prototype._createDesc = function (workflow, name, version)
{
    return {
        workflow: workflow,
        name: name,
        version: version,
        createInstanceMethods: this._collectCreateInstanceMethods(workflow)
    }
}

WorkflowRegistry.prototype._collectCreateInstanceMethods = function (workflow)
{
    var self = this;
    var result = {};
    workflow.forEachChild(function(child)
    {
        if (child instanceof BeginMethod && child.canCreateInstance)
        {
            var methodName = _(child.methodName).isString() ? child.methodName.trim() : null;
            if (methodName) result[methodName] = true;
        }
    });
    return result;
}

module.exports = WorkflowRegistry;
