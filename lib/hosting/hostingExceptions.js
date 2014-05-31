var util = require("util");

function WorkflowException(message)
{
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
}

util.inherits(WorkflowException, Error);

module.exports.WorkflowException = WorkflowException;
