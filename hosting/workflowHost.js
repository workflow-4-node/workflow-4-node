var WorkflowRegistry = require("./workflowRegistry");
var _ = require("underscore-node");
var Activity = require("../activities/activity");
var Workflow = require("../activities/workflow");
var WorkflowPersistence = require("./workflowPersistence");
var MemoryPersistence = require("./memoryPersistence");
var WorkflowInstance = require("./workflowInstance");
var InstanceIdParser = require("./instanceIdParser");
var enums = require("../common/enums");

function WorkflowHost()
{
    this._registry = new WorkflowRegistry();
    this.commandTimeout = 10000;
    this._trackers = [];
    this._isInitialized = false;
    this.instanceIdParser = new InstanceIdParser();
    this._knownRunningInstances = {};
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
                    if (self.instanceIdParser.parse(path.value, args) == path.id)
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
    var self = this;
    
    var wfDesc = self._registry.getDesc(workflowName);
    if (!wfDesc.createInstanceMethods[methodName]) throw Error("Workflow '" + workflowName + "' cannot be created by invoking method '" + methodName + "'.");

    var insta = new WorkflowInstance(this);
    return insta.create(wfDesc.workflow, methodName, args).then(
        function(result)
        {
            if (insta.execState == enums.ActivityStates.idle)
            {
                self.persistence.persistState(insta).then(
                    function ()
                    {
                        self._knownRunningInstances[insta.id] = insta;
                        return result;
                    });
            }
            else
            {
                return result;
            }
        });
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
