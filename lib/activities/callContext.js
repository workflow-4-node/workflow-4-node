var is = require("../common/is");

function CallContext(executionContext, activityOrActivityId, scope)
{
    this._executionContext = executionContext;
    this._activity = activityOrActivityId ? this._asActivity(activityOrActivityId) : null;
    this._scope = scope ? scope : null;
}

Object.defineProperties(
    CallContext.prototype,
    {
        _activityId: {
            get: function ()
            {
                return this._activity ? this._activity.id : null;
            }
        },
        _parentActivityId: {
            get: function()
            {
                if (!this._activity) return null;
                var state = this._executionContext.getState(this._activityId);
                return state.parentActivityId;
            }
        },
        _scopeTree: {
            get: function ()
            {
                return this._executionContext._scopeTree;
            }
        },
        activity: {
            get: function()
            {
                return this._activity;
            }
        },
        executionContext: {
            get: function()
            {
                return this._executionContext;
            }
        },
        scope: {
            get: function()
            {
                return this._scope || (this._scope = this._scopeTree.find(this._activityId));
            }
        }
    }
);

CallContext.prototype.next = function(childActivityOrActivityId)
{
    var child = this._asActivity(childActivityOrActivityId);
    return new CallContext(
        this._executionContext,
        child,
        this._scopeTree.next(this._activityId, child.id, child.createScopePart()));
}

CallContext.prototype.back = function(keepScope)
{
    var parentId = this._parentActivityId;
    if (parentId)
    {
        return new CallContext(
            this._executionContext,
            parentId,
            this._scopeTree.back(this._activityId, keepScope));
    }
    else
    {
        return null;
    }
}

CallContext.prototype._asActivity = function(activityOrActivityId)
{
    return is.activity(activityOrActivityId) ? activityOrActivityId : this._executionContext._getKnownActivity(activityOrActivityId)
}

module.exports = CallContext;
