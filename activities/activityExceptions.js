var util = require("util");

function ActivityStateExceptionError(message)
{
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
}

util.inherits(ActivityStateExceptionError, Error);

function Cancelled()
{
    ActivityStateExceptionError.call(this, "Activity execution has been cancelled.");
}

util.inherits(Cancelled, ActivityStateExceptionError);

function Idle()
{
    ActivityStateExceptionError.call(this, "Activity is idle.");
}

util.inherits(Idle, ActivityStateExceptionError);

function AggregateError(errors)
{
    ActivityStateExceptionError.call(this, "Many errors occurred.");
    this.errors = errors;
}

util.inherits(AggregateError, ActivityStateExceptionError);

function ActivityMarkupError(message)
{
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
}

util.inherits(ActivityMarkupError, Error);

function ActivityRuntimeError(message)
{
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
}

util.inherits(ActivityRuntimeError, Error);

function ValidationError(message)
{
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
}

util.inherits(ValidationError, Error);

module.exports.ActivityStateExceptionError = ActivityStateExceptionError;
module.exports.ActivityExceptionError = ActivityStateExceptionError;
module.exports.Cancelled = Cancelled;
module.exports.Idle = Idle;
module.exports.AggregateError = AggregateError;
module.exports.ActivityMarkupError = ActivityMarkupError;
module.exports.ActivityRuntimeError = ActivityRuntimeError;
module.exports.ValidationError = ValidationError;
