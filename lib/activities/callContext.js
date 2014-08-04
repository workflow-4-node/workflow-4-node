var is = require("../common/is");

function CallContext(executionContext, activityOrActivityId)
{
    this._executionContext = executionContext;
    this._activiy = is.activity(activityOrActivityId) ? activityOrActivityId : executionContext._getActivityById(activityOrActivityId);
}

Object.defineProperties(
    CallContext.prototype,
    {
        _activityId: {
            get: function ()
            {
                return this._activity.id;
            }
        },
        _scopeTree: {
            get: function ()
            {
                return this._executionContext._scopeTree;
            }
        }
    }
);
