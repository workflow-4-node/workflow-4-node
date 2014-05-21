var WorkflowRegistry = require("./workflowRegistry");
var _ = require("underscore-node");
var Activity = require("../activities/activity");
var Workflow = require("../activities/workflow");
var WorkflowPersistence = require("./workflowPersistence");
var MemoryPersistence = require("./memoryPersistence");

function WorkflowHost(persistence)
{
    this._registry = new WorkflowRegistry();
    this._persistence = persistence ? persistence : null;
    this.commandTimeout = 10000;
}

Object.defineProperties(
    WorkflowHost.prototype, {
        isInitialized: {
            get: function ()
            {
                return false;
            }
        },

        persistence: {
            get: function ()
            {
                if (!this._persistence) this._persistence = new WorkflowPersistence(new MemoryPersistence());
                return this._persistence;
            },
            set: function (value)
            {
                if (this.isInitialize) throw new Error("Cannot set persistence after the host is initialized.");
                this._persistence = new WorkflowPersistence(value);
            }
        }
    });

WorkflowHost.prototype.registerWorkflow = function (workflow)
{
    this._registry.register(workflow);
}

WorkflowHost.prototype.registerActivity = function (activity, name, version)
{
    if (!(activity instanceof Activity)) throw new TypeError("Activity argument expected.");
    var wf = new Workflow();
    wf.name = name;
    wf.version = version;
    wf.args = [ activity ];
    this._registry.register(wf);
}

WorkflowHost.prototype.invokeMethod = function (workflowName, methodName, args)
{
    if (!_(workflowName).isString()) throw new TypeError("Argument 'workflowName' is not a string.");
    workflowName = workflowName.trim();
    if (!_(methodName).isString()) throw new TypeError("Argument 'methodName' is not a string.");
    methodName = methodName.trim();

    var self = this;
    return this.persistence.getRunningInstanceIdPaths(workflowName, methodName).then(
        function(paths)
        {
            var runningInstanceId = null;
            if (paths)
            {
                paths.forEach(function(path)
                {
                    if (new InstanceIdParser(path.value).parse(args) == path.id)
                    {
                        runningInstanceId = path.id;
                        return false;
                    }
                });
            }
            if (runningInstanceId)
            {
                return self.invokeMethodOnRunningInstance(runningInstanceId, workflowName, methodName, args);
            }
            else
            {
                return self.createInstanceAndInvokeMethod(workflowName, methodName, args);
            }
        });
}

WorkflowHost.prototype.createInstanceAndInvokeMethod = function(workflowName, methodName, args)
{
    var wfDesc = this._registry.getDesc(workflowName);
    var entry = wfDesc.createInstanceMethods[methodName];
    if (!entry) throw Error("Workflow '" + workflowName + "' cannot be created by invoking method '" + methodName + "'.");
    var instanceId = null;
    if (entry.instanceIdPath)
    {
        // This means Workflow instance's ID will be determined form args.
        // Otherwise it will be given in the workflow and is gonna be available after idle through getting it from a tracker
        instanceId = new InstanceIdParser(entry.instanceIdPath).parse(args);
    }
    // Create an engine
    // Add trackers
    // Run WF
    // If idle: save state
    // Save engine
}

WorkflowHost.prototype.invokeMethodOnRunningInstance = function(runningInstanceId, workflowName, methodName, args)
{
    // Engine reuse should be implemented, we can replace state of an instance if it continues
    // Or, if it hasn't changed, state can be as is.
}

module.exports = WorkflowHost;
