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
    this._trackers = [];
    this._isInitialized = false;
}

Object.defineProperties(
    WorkflowHost.prototype, {
        isInitialized: {
            get: function ()
            {
                return this._isInitialized;
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
                if (this.isInitialized) throw new Error("Cannot set persistence after the host is initialized.");
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

WorkflowHost.prototype._initialize = function()
{
    if (!this._isInitialized)
    {
        // Do init here ...
        this._isInitialized = true;
    }
}

WorkflowHost.prototype.invokeMethod = function (workflowName, methodName, args)
{
    if (!_(workflowName).isString()) throw new TypeError("Argument 'workflowName' is not a string.");
    workflowName = workflowName.trim();
    if (!_(methodName).isString()) throw new TypeError("Argument 'methodName' is not a string.");
    methodName = methodName.trim();

    var self = this;

    self._initialize();

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
                return self._invokeMethodOnRunningInstance(runningInstanceId, workflowName, methodName, args);
            }
            else
            {
                return self._createInstanceAndInvokeMethod(workflowName, methodName, args);
            }
        });
}

WorkflowHost.prototype._createInstanceAndInvokeMethod = function(workflowName, methodName, args)
{
    var wfDesc = this._registry.getDesc(workflowName);
    if (!wfDesc.createInstanceMethods[methodName]) throw Error("Workflow '" + workflowName + "' cannot be created by invoking method '" + methodName + "'.");

    // Create an engine
    // Add trackers
    // Run WF
    // If idle: save state
    // Save engine
}

WorkflowHost.prototype._invokeMethodOnRunningInstance = function(runningInstanceId, workflowName, methodName, args)
{
    // Engine reuse should be implemented, we can replace state of an instance if it continues
    // Or, if it hasn't changed, state can be as is.
}

WorkflowHost.prototype.addTracker = function (tracker)
{
    if (!_(tracker).isObject()) throw new TypeError("Argument is not an object.");
    this._trackers.push(tracker);
    // TODO: add tracker to all instances
}

module.exports = WorkflowHost;
