var WorkflowRegistry = require("./workflowRegistry");
var _ = require("underscore-node");
var Activity = require("../activities/activity");
var Workflow = require("../activities/workflow");
var WorkflowPersistence = require("./workflowPersistence");
var MemoryPersistence = require("./memoryPersistence");

function WorkflowHost()
{
    this._registry = new WorkflowRegistry();
    this._persistence = null;
}

Object.defineProperties(WorkflowHost.prototype, {
    isInitialized: {
        get: function()
        {
            return false;
        }
    },

    persistence: {
        get: function () {
            if (!this._persistence) this._persistence = new WorkflowPersistence(new MemoryPersistence());
            return this._persistence;
        },
        set: function (value) {
            if (this.isInitialize) throw new Error("Cannot set persistence after the host is initialized.");
            if (!_(value).isObject()) throw new TypeError("Persistence implementation must be an object.");
            this._persistence = value;
        }
    }
})

WorkflowHost.prototype.registerWorkflow = function(workflow)
{
    this._registry.register(workflow);
}

WorkflowHost.prototype.registerActivity = function(activity, name, version)
{
    if (!(activity instanceof Activity)) throw new TypeError("Activity argument expected.");
    var wf = new Workflow();
    wf.name = name;
    wf.version = version;
    wf.args = [ activity ];
    this._registry.register(wf);
}

WorkflowHost.prototype.invokeMethod = function(workflowName, args)
{

}

WorkflowHost.prototype.invokeMethodOnVersion = function(workflowName, version, args)
{

}

module.exports = WorkflowHost;
