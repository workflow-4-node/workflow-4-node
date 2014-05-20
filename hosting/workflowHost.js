var WorkflowRegistry = require("./workflowRegistry");
var _ = require("underscore-node");

function WorkflowHost()
{
    this._registry = new WorkflowRegistry();
}

module.exports = WorkflowHost;
