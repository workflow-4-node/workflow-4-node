"use strict";

let Workflow = require("../activities/workflow");
let _ = require("lodash");
let BeginMethod = require("../activities/beginMethod");
let EndMethod = require("../activities/endMethod");
let is = require("../common/is");
let ActivityExecutionContext = require("../activities/activityExecutionContext");
let activityMarkup = require("../activities/activityMarkup");
let Serializer = require("backpack-node").system.Serializer;
let crypto = require("crypto");
let assert = require("better-assert");

function WorkflowRegistry(serializer) {
    this._workflows = new Map();
    this._serializer = serializer || new Serializer();
}

WorkflowRegistry.prototype.register = function (workflow, deprecated) {
    if (_.isPlainObject(workflow)) {
        workflow = activityMarkup.parse(workflow);
    }
    if (workflow instanceof Workflow) {
        if (!_(workflow.name).isString()) {
            throw new TypeError("Workflow name is not a string.");
        }
        let name = workflow.name.trim();
        if (!name) {
            throw new TypeError("Workflow name is empty.");
        }
        let execContext = new ActivityExecutionContext();
        execContext.initialize(workflow);
        let version = this._computeVersion(execContext);
        let entry = this._workflows.get(name);
        let desc;
        if (entry) {
            desc = entry.get(version);
            if (desc) {
                throw new Error("Workflow " + name + " (" + version + ") already registered.");
            }
            else {
                if (!deprecated) {
                    for (desc of entry.values()) {
                        if (!desc.deprecated) {
                            throw new Error("Workflow " + name + " (" + version + ") has an already registered undeprecated version.");
                        }
                    }
                }
                desc = this._createDesc(execContext, name, version, deprecated);
                entry.set(version, desc);
            }
        }
        else {
            entry = new Map();
            desc = this._createDesc(execContext, name, version, deprecated);
            entry.set(version, desc);
            this._workflows.set(name, entry);
        }
        return desc;
    }
    else {
        throw new TypeError("Workflow instance argument expected.");
    }
};

WorkflowRegistry.prototype.getDesc = function (name, version) {
    let entry = this._workflows.get(name);
    if (entry) {
        if (!_.isUndefined(version)) {
            let desc = entry.get(version);
            if (desc) {
                return desc;
            }
            throw new Error("Workflow " + name + " of version " + version + " has not been registered.");
        }
        else {
            // Get undeprecated
            let desc = null;
            for (let d of entry.values()) {
                if (!d.deprecated) {
                    desc = d;
                    break;
                }
            }
            if (desc) {
                return desc;
            }
            throw new Error("Workflow " + name + " hasn't got an undeprecated version registered.");
        }
    }
};

WorkflowRegistry.prototype.getCurrentVersion = function (workflowName) {
    let result = [];
    let entry = this._workflows.get(workflowName);
    if (entry) {
        let desc = null;
        for (let d of entry.values()) {
            if (!d.deprecated) {
                desc = d;
                break;
            }
        }
        if (desc) {
            return desc.version;
        }
    }
    return null;
};

WorkflowRegistry.prototype._createDesc = function (execContext, name, version, deprecated) {
    return {
        execContext: execContext,
        name: name,
        version: version,
        methods: this._collectMethodInfos(execContext, version),
        deprecated: deprecated
    };
};

WorkflowRegistry.prototype._collectMethodInfos = function (execContext, version) {
    let self = this;
    let infos = new Map();
    let workflow = execContext.rootActivity;
    for (let child of workflow.children(execContext)) {
        let isBM = child instanceof BeginMethod;
        let isEM = child instanceof EndMethod;
        if (isBM || isEM) {
            let methodName = _.isString(child.methodName) ? child.methodName.trim() : null;
            let instanceIdPath = _.isString(child.instanceIdPath) ? child.instanceIdPath.trim() : null;
            if (methodName) {
                let info = infos.get(methodName);
                if (!info) {
                    info = {
                        execContext: execContext,
                        version: version,
                        canCreateInstance: false,
                        instanceIdPath: null
                    };
                    infos.set(methodName, info);
                }
                if (isBM && child.canCreateInstance) {
                    info.canCreateInstance = true;
                }
                if (instanceIdPath) {
                    if (info.instanceIdPath) {
                        if (info.instanceIdPath !== instanceIdPath) {
                            throw new Error("Method '" + methodName + "' in workflow '" + workflow.name + "' has multiple different instanceIdPath value which is not supported.");
                        }
                    }
                    else {
                        info.instanceIdPath = instanceIdPath;
                    }
                }
            }
        }
    }
    let result = new Map();
    for (let kvp of infos.entries()) {
        if (kvp[1].instanceIdPath) {
            result.set(kvp[0], kvp[1]);
        }
    }
    return result;
};

WorkflowRegistry.prototype.methodInfos = function* (workflowName, methodName) {
    let entry = this._workflows.get(workflowName);
    if (entry) {
        for (let desc of entry.values()) {
            let info = desc.methods.get(methodName);
            if (info) {
                yield info;
            }
        }
    }
};

WorkflowRegistry.prototype._computeVersion = function(execContext) {
    let self = this;
    let workflow = execContext.rootActivity;
    let sha = crypto.createHash("sha256");
    function add(value) {
        if (!_.isNull(value)) {
            value = self._serializer.stringify(value);
            sha.update(value);
        }
    }
    for (let activity of workflow.all(execContext)) {
        let alias = activityMarkup.getAlias(activity);
        assert(alias);
        add(alias);
        for (let key in activity) {
            if (activity.hasOwnProperty(key) &&
                !activity.nonScopedProperties.has(key) &&
                !activity.nonSerializedProperties.has(key)) {
                let value = activity[key];
                if (!is.activity(value)) {
                    if (_.isArray(value)) {
                        for (let item of value) {
                            if (!is.activity(item)) {
                                add(value);
                            }
                        }
                    }
                    else {
                        add(value);
                    }
                }
            }
        }
    }
    return sha.digest("hex");
};

module.exports = WorkflowRegistry;
