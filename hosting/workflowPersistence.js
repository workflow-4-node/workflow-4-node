var _ = require("underscore-node");

function WorkflowPersistence(impl)
{
    if (!_(impl).isObject()) throw new TypeError("Object argument expected.");

    this.impl = impl;
}

module.exports = WorkflowPersistence;
