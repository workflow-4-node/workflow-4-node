/*jshint -W054 */

"use strict";

let guids = require("../common/guids");
let errors = require("../common/errors");
let enums = require("../common/enums");
let _ = require("lodash");
let specStrings = require("../common/specStrings");
let util = require("util");
let StrSet = require("backpack-node").collections.StrSet;
let is = require("../common/is");
let CallContext = require("./callContext");
let uuid = require('node-uuid');
let async = require("../common/asyncHelpers").async;

function Activity() {
    this[guids.types.activity] = true;
    this._runtimeId = uuid.v4();
    this.instanceId = null;
    this.args = null;
    this.displayName = null;
    this.id = null;
    this._structureInitialized = false;
    this._scopeKeys = null;
    this["@require"] = null;

    // Properties not serialized:
    this.nonSerializedProperties = new StrSet();

    // Properties are not going to copied in the scope:
    this.nonScopedProperties = new StrSet();
    this.nonScopedProperties.add(guids.types.activity);
    this.nonScopedProperties.add("nonScopedProperties");
    this.nonScopedProperties.add("nonSerializedProperties");
    this.nonScopedProperties.add("_runtimeId");
    this.nonScopedProperties.add("activity");
    this.nonScopedProperties.add("id");
    this.nonScopedProperties.add("instanceId");
    this.nonScopedProperties.add("args");
    this.nonScopedProperties.add("__typeTag");
    this.nonScopedProperties.add("displayName");
    this.nonScopedProperties.add("complete");
    this.nonScopedProperties.add("cancel");
    this.nonScopedProperties.add("idle");
    this.nonScopedProperties.add("fail");
    this.nonScopedProperties.add("end");
    this.nonScopedProperties.add("schedule");
    this.nonScopedProperties.add("createBookmark");
    this.nonScopedProperties.add("resumeBookmark");
    this.nonScopedProperties.add("resultCollected");
    this.nonScopedProperties.add("codeProperties");
    this.nonScopedProperties.add("initializeStructure");
    this.nonScopedProperties.add("_initializeStructure");
    this.nonScopedProperties.add("_structureInitialized");
    this.nonScopedProperties.add("clone");
    this.nonScopedProperties.add("_scopeKeys");
    this.nonScopedProperties.add("_createScopePartImpl");
    this.nonScopedProperties.add("@require");
    this.nonScopedProperties.add("initializeExec");
    this.nonScopedProperties.add("unInitializeExec");

    this.codeProperties = new StrSet();
}

Object.defineProperties(Activity.prototype, {
    _scopeKeys: {
        value: null,
        writable: true,
        enumerable: false
    },
    _createScopePartImpl: {
        value: null,
        writable: true,
        enumerable: false
    }
});

Activity.prototype.toString = function () {
    return (this.displayName ? (this.displayName + " ") : "") + "(" + this.constructor.name + ":" + this.instanceId + ")";
};

/* forEach */
Activity.prototype.forEach = function (f) {
    let visited = {};
    return this._doForEach(f, visited, null);
};

Activity.prototype.forEachChild = function (f) {
    let visited = {};
    return this._doForEach(f, visited, this);
};

Activity.prototype.forEachImmediateChild = function (f, execContext) {
    let self = this;

    for (let fieldName in self) {
        let fieldValue = self[fieldName];
        if (fieldValue) {
            if (_.isArray(fieldValue)) {
                for (let obj of fieldValue) {
                    if (obj instanceof Activity) {
                        f(obj);
                    }
                }
            }
            else if (fieldValue instanceof Activity) {
                f(fieldValue);
            }
        }
    }
};

Activity.prototype._doForEach = function (f, visited, except) {
    let self = this;
    if (is.undefined(visited[self._runtimeId])) {
        visited[self._runtimeId] = true;

        if (self !== except) {
            f(self);
        }

        for (let fieldName in self) {
            let fieldValue = self[fieldName];
            if (fieldValue) {
                if (_.isArray(fieldValue)) {
                    for (let obj of fieldValue) {
                        if (obj instanceof Activity) {
                            obj._doForEach(f, visited, except);
                        }
                    }
                }
                else if (fieldValue instanceof Activity) {
                    fieldValue._doForEach(f, visited, except);
                }
            }
        }
    }
};
/* forEach */

/* Structure */
Activity.prototype._initializeStructure = function () {
    if (!this._structureInitialized) {
        this.initializeStructure();
        this._structureInitialized = true;
    }
};

Activity.prototype.initializeStructure = _.noop;

Activity.prototype.clone = function () {
    function makeClone(value, canCloneArrays) {
        if (value instanceof Activity) {
            return value.clone();
        }
        else if (value instanceof StrSet) {
            let newSet = new StrSet();
            value.forEach(function (item) {
                newSet.add(item);
            });
            return newSet;
        }
        else if (_.isArray(value)) {
            if (canCloneArrays) {
                let newArray = [];
                for (let item of value) {
                    newArray.push(makeClone(item, false));
                }
                return newArray;
            }
            else {
                throw new Error("Cannot clone activity's nested arrays.");
            }
        }
        else {
            return value;
        }
    }

    let Constructor = this.constructor;
    let newInst = new Constructor();
    for (let key in this) {
        let value = this[key];
        if (newInst[key] !== value) {
            newInst[key] = makeClone(value, true);
        }
    }
    return newInst;
};

/* RUN */
Activity.prototype.start = function (callContext) {
    let self = this;

    if (!(callContext instanceof CallContext)) {
        throw new Error("Argument 'context' is not an instance of ActivityExecutionContext.");
    }

    let args = self.args;
    if (arguments.length > 1) {
        args = [];
        for (let i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
    }

    this._start(callContext, null, args);
};

Activity.prototype._start = function (callContext, variables, args) {
    let self = this;

    let myCallContext = callContext.next(self, variables);
    let state = myCallContext.executionState;
    if (state.isRunning) {
        throw new Error("Activity is already running.");
    }

    // We should allow IO operations to execute:
    setImmediate(
        function () {
            state.reportState(Activity.states.run);
            try {
                self.initializeExec.call(myCallContext.scope);
                self.run.call(myCallContext.scope, myCallContext, args || self.args || []);
            }
            catch (e) {
                self.fail(e);
            }
        });
};

Activity.prototype.initializeExec = _.noop;

Activity.prototype.unInitializeExec = _.noop;

Activity.prototype.run = function (callContext, args) {
    callContext.activity.complete(callContext, args);
};

Activity.prototype.complete = function (callContext, result) {
    this.end(callContext, Activity.states.complete, result);
};

Activity.prototype.cancel = function (callContext) {
    this.end(callContext, Activity.states.cancel);
};

Activity.prototype.idle = function (callContext) {
    this.end(callContext, Activity.states.idle);
};

Activity.prototype.fail = function (callContext, e) {
    this.end(callContext, Activity.states.fail, e);
};

Activity.prototype.end = function (callContext, reason, result) {
    try {
        this.unInitializeExec.call(callContext.scope, reason, result);
    }
    catch (e) {
        let message = `unInitializeExec failed. Reason of ending was '${reason}' and the result is '${result}.`;
        reason = Activity.states.fail;
        result = e;
    }

    let state = callContext.executionState;

    if (state.execState === Activity.states.cancel || state.execState === Activity.states.fail) {
        // It was cancelled or failed:
        return;
    }

    state.execState = reason;

    let inIdle = reason === Activity.states.idle;
    let execContext = callContext.executionContext;
    callContext = callContext.back(inIdle);

    if (callContext) {
        try {
            let bmName = specStrings.activities.createValueCollectedBMName(this);
            if (execContext.isBookmarkExists(bmName)) {
                state.emitState(result);
                execContext.resumeBookmarkInScope(callContext, bmName, reason, result);
                return;
            }
        }
        catch (e) {
            callContext.fail(e);
        }
    }
    else {
        // We're on root, done.
        // If wf in idle, but there are internal bookmark resume request,
        // then instead of emitting done, we have to continue them.
        if (inIdle && execContext.processResumeBookmarkQueue()) {
            // We should not emmit idle event, because there was internal bookmark continutations, so we're done.
            return;
        }
    }

    state.emitState(result);
};

Activity.prototype._defaultEndCallback = function (callContext, reason, result) {
    callContext.end(reason, result);
};

Activity.prototype.schedule = function (callContext, obj, endCallback) {
    let self = this;
    let scope = callContext.scope;
    let execContext = callContext.executionContext;

    if (!endCallback) {
        endCallback = "_defaultEndCallback";
    }

    if (!_.isString(endCallback)) {
        callContext.fail(new TypeError("Provided argument 'endCallback' value is not a string."));
        return;
    }
    let cb = scope.get(endCallback);
    if (!_.isFunction(cb)) {
        callContext.fail(new TypeError(`'${endCallback}' is not a function.`));
        return;
    }

    let bookmarkNames = [];
    try {
        const isGenerator = is.generator(obj);
        if (_.isArray(obj) && obj.length || isGenerator) {
            scope.set("__collectValues", []);
            let activities = [];
            let variables = [];
            let items = isGenerator ? obj() : obj;
            for (let item of items) {
                if (item instanceof Activity) {
                    scope.get("__collectValues").push(specStrings.activities.asValueToCollect(item));
                    activities.push(item);
                    variables.push(null);
                }
                else if (_.isObject(item) && item.activity instanceof Activity) {
                    scope.get("__collectValues").push(specStrings.activities.asValueToCollect(item.activity));
                    activities.push(item.activity);
                    variables.push(_.isObject(item.variables) ? item.variables : null);
                }
                else {
                    scope.get("__collectValues").push(item);
                    variables.push(null);
                }
            }
            if (activities.length) {
                scope.set("__collectPickRound2", false);
                scope.set("__collectErrors", []);
                scope.set("__collectCancelCounts", 0);
                scope.set("__collectIdleCounts", 0);
                scope.set("__collectRemaining", activities.length);
                let endBM = scope.set("__collectEndBookmarkName", specStrings.activities.createCollectingCompletedBMName(self));
                bookmarkNames.push(execContext.createBookmark(self.instanceId, scope.get("__collectEndBookmarkName"), endCallback));
                let len = activities.length;
                for (let i = 0; i < len; i++) {
                    let childActivity = activities[i];
                    let childVariables = variables[i];
                    bookmarkNames.push(execContext.createBookmark(self.instanceId, specStrings.activities.createValueCollectedBMName(childActivity), "resultCollected"));
                    childActivity._start(callContext, childVariables);
                    if (!execContext.isBookmarkExists(endBM)) {
                        // If current activity has been ended (by Pick for ex)
                        break;
                    }
                }
            }
            else {
                let result = scope.get("__collectValues");
                scope.delete("__collectValues");
                scope.get(endCallback).call(scope, callContext, Activity.states.complete, result);
            }
        }
        else if (obj instanceof Activity) {
            bookmarkNames.push(execContext.createBookmark(self.instanceId, specStrings.activities.createValueCollectedBMName(obj), endCallback));
            obj.start(callContext);
        }
        else if (_.isObject(obj) && obj.activity instanceof Activity) {
            bookmarkNames.push(execContext.createBookmark(self.instanceId, specStrings.activities.createValueCollectedBMName(obj.activity), endCallback));
            obj.activity._start(callContext, _.isObject(obj.variables) ? obj.variables : null);
        }
        else {
            scope.get(endCallback).call(scope, callContext, Activity.states.complete, obj);
        }
    }
    catch (e) {
        // Runtime error happened!
        // We cannot do anything futher when already scheduled activities finished,
        // so make their end callbacks as noop:
        execContext.noopCallbacks(bookmarkNames);
        scope.get(endCallback).call(scope, callContext, Activity.states.fail, e);
    }
};

Activity.prototype.resultCollected = function (callContext, reason, result, bookmark) {
    let self = this;
    try {
        let execContext = callContext.executionContext;
        let childId = specStrings.getString(bookmark.name);
        let argMarker = specStrings.activities.asValueToCollect(childId);
        let resultIndex = self.get("__collectValues").indexOf(argMarker);
        let pickCurrent = false;
        if (resultIndex === -1) {
            self.get("__collectErrors").push(new errors.ActivityStateExceptionError("Activity '" + childId + "' is not found in __collectValues."));
        }
        else {
            if (self.get("__collectPick") && (reason !== Activity.states.idle || self.get("__collectPickRound2"))) {
                // We should pick current result, and shut down others:
                let ids = [];
                for (let cv of self.get("__collectValues")) {
                    let id = specStrings.getString(cv);
                    if (id && id !== childId) {
                        ids.push(id);
                        execContext.deleteScopeOfActivity(callContext, id);
                        let ibmName = specStrings.activities.createValueCollectedBMName(id);
                        execContext.deleteBookmark(ibmName);
                    }
                }
                execContext.cancelExecution(ids);
                pickCurrent = true;
            }
            else {
                switch (reason) {
                    case Activity.states.complete:
                        self.get("__collectValues")[resultIndex] = result;
                        break;
                    case Activity.states.cancel:
                        self.inc("__collectCancelCounts");
                        self.get("__collectValues")[resultIndex] = null;
                        break;
                    case Activity.states.idle:
                        self.inc("__collectIdleCounts");
                        break;
                    case Activity.states.fail:
                        result = result || new errors.ActivityStateExceptionError("Unknown error.");
                        self.get("__collectErrors").push(result);
                        self.get("__collectValues")[resultIndex] = null;
                        break;
                    default:
                        self.get("__collectErrors").push(new errors.ActivityStateExceptionError("Bookmark should not be continued with reason '" + reason + "'."));
                        self.get("__collectValues")[resultIndex] = null;
                        break;
                }
            }
        }
        if (self.dec("__collectRemaining") === 0 || pickCurrent) {
            let endBookmarkName = self.get("__collectEndBookmarkName");

            if (!pickCurrent) {
                if (self.get("__collectErrors").length) {
                    reason = Activity.states.fail;
                    let __collectErrors = self.get("__collectErrors");
                    if (__collectErrors.length === 1) {
                        result = __collectErrors[0];
                    }
                    else {
                        result = new errors.AggregateError(__collectErrors);
                    }
                }
                else if (self.get("__collectCancelCounts")) {
                    reason = Activity.states.cancel;
                }
                else if (self.get("__collectIdleCounts")) {
                    reason = Activity.states.idle;
                    self.set("__collectRemaining", 1);
                    self.dec("__collectIdleCounts");
                    if (self.get("__collectPick")) {
                        // We're in pick mode, and all result was idle
                        self.set("__collectPickRound2", true);
                    }
                }
                else {
                    reason = Activity.states.complete;
                    result = self.get("__collectValues");
                }
            }

            if (!self.get("__collectRemaining")) {
                self.delete("__collectValues");
                self.delete("__collectRemaining");
                self.delete("__collectIdleCounts");
                self.delete("__collectEndBookmarkName");
                self.delete("__collectCancelCounts");
                self.delete("__collectErrors");
                self.delete("__collectPick");
                self.delete("__collectPickRound2");
            }

            execContext.resumeBookmarkInScope(callContext, endBookmarkName, reason, result);
        }
    }
    catch (e) {
        callContext.fail(e);
    }
};
/* RUN */

/* SCOPE */
Activity.prototype._getScopeKeys = function () {
    let self = this;
    if (!self._scopeKeys || !self._structureInitialized) {
        self._scopeKeys = [];
        for (let key in self) {
            if (!self.nonScopedProperties.exists(key) && (_.isUndefined(Activity.prototype[key]) || key === "_defaultEndCallback")) {
                self._scopeKeys.push(key);
            }
        }
    }
    return self._scopeKeys;
};

Activity.prototype.createScopePart = function () {
    if (!this._structureInitialized) {
        throw new errors.ActivityRuntimeError("Cannot create activity scope for uninitialized activities.");
    }

    if (this._createScopePartImpl === null) {
        let first = true;
        let src = "return {";
        for (let fieldName of this._getScopeKeys()) {
            if (first) {
                first = false;
            }
            else {
                src += ",\n";
            }
            if (_.isPlainObject(this[fieldName])) {
                src += fieldName + ":_.clone(a." + fieldName + ", true)";
            }
            else if (_.isArray(this[fieldName])) {
                src += fieldName + ":a." + fieldName + ".slice(0)";
            }
            else {
                src += fieldName + ":a." + fieldName;
            }
        }
        src += "}";

        this._createScopePartImpl = new Function("a,_", src);
    }

    return this._createScopePartImpl(this, _);
};
/* SCOPE */

Activity.states = enums.ActivityStates;

module.exports = Activity;
