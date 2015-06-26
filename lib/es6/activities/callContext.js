"use strict";

let is = require("../common/is");
let _ = require("lodash");

function CallContext(executionContext, activityOrActivityId, scope) {
    this._executionContext = executionContext;
    this._activity = activityOrActivityId ? this._asActivity(activityOrActivityId) : null;
    this._scope = scope ? scope : null;
    this._executionState = null;
    this._scopePart = null;
}

Object.defineProperties(
    CallContext.prototype,
    {
        activityInstanceId: {
            get: function () {
                return this._activity ? this._activity.instanceId : null;
            }
        },
        _parentActivityId: {
            get: function () {
                if (!this._activity) {
                    return null;
                }
                let state = this._executionContext.getState(this.activityInstanceId);
                return state.parentActivityId;
            }
        },
        _scopeTree: {
            get: function () {
                return this._executionContext._scopeTree;
            }
        },
        activity: {
            get: function () {
                return this._activity;
            }
        },
        executionContext: {
            get: function () {
                return this._executionContext;
            }
        },
        executionState: {
            get: function () {
                return this._executionState || (this._activity ? (this._executionState = this._executionContext.getState(this._activity.instanceId)) : null);
            }
        },
        scope: {
            get: function () {
                return this._scope || (this._scope = this._scopeTree.find(this.activityInstanceId));
            }
        }
    }
);

CallContext.prototype.next = function (childActivityOrActivityId, variables) {
    let child = this._asActivity(childActivityOrActivityId);
    let part = child.createScopePart();
    if (_.isObject(variables)) {
        _.extend(part, variables);
    }
    return new CallContext(
        this._executionContext,
        child,
        this._scopeTree.next(this.activityInstanceId, child.instanceId, part, child.id));
};

CallContext.prototype.back = function (keepScope) {
    let parentId = this._parentActivityId;
    if (parentId) {
        return new CallContext(
            this._executionContext,
            parentId,
            this._scopeTree.back(this.activityInstanceId, keepScope));
    }
    else {
        return null;
    }
};

CallContext.prototype._asActivity = function (activityOrActivityId) {
    return is.activity(activityOrActivityId) ? activityOrActivityId : this._executionContext._getKnownActivity(activityOrActivityId);
};

/* Callbacks */

CallContext.prototype.complete = function (result) {
    this.activity.complete(this, result);
};

CallContext.prototype.cancel = function () {
    this.activity.cancel(this);
};

CallContext.prototype.idle = function () {
    this.activity.idle(this);
};

CallContext.prototype.fail = function (e) {
    this.activity.fail(this, e);
};

CallContext.prototype.end = function (reason, result) {
    this.activity.end(this, reason, result);
};

CallContext.prototype.schedule = function (obj, endcallback) {
    this.activity.schedule(this, obj, endcallback);
};

CallContext.prototype.createBookmark = function (name, callback) {
    return this._executionContext.createBookmark(this.activityInstanceId, name, callback);
};

CallContext.prototype.resumeBookmark = function (name, reason, result) {
    this._executionContext.resumeBookmarkInternal(this, name, reason, result);
};

module.exports = CallContext;
