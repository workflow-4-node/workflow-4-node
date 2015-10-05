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
        let version = this._computeVersion(execContext, workflow);
        let entry = this._workflows.get(name);
        if (entry) {
            let desc = entry.get(version);
            if (desc) {
                throw new Error("Workflow " + name + " (" + version + ") already registered.");
            }
            else {
                if (!deprecated) {
                    for (desc of entry.values()) {
                        if (!desc.deprecated) {
                            throw new Error("Workflow " + name + " (" + version + ") has an already registered undeprectaed version.");
                        }
                    }
                }
                entry.set(version, this._createDesc(execContext, workflow, name, workflow.version, deprecated));
            }
        }
        else {
            entry = new Map();
            entry.set(version, this._createDesc(execContext, workflow, name, workflow.version, deprecated));
            this._workflows.set(name, entry);
        }
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
            return desc;
        }
    }
    return null;
};

WorkflowRegistry.prototype._createDesc = function (execContext, workflow, name, version, deprecated) {
    return {
        workflow: workflow,
        name: name,
        version: version,
        methods: this._collectMethodInfos(execContext, workflow),
        deprecated: deprecated
    };
};

WorkflowRegistry.prototype._collectMethodInfos = function (execContext, workflow) {
    let self = this;
    let infos = new Map();
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
                        workflow: workflow,
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

WorkflowRegistry.prototype._computeVersion = function(execContext, workflow) {
    let self = this;
    let sha = crypto.createHash("sha256");
    function add(value) {
        if (!_.isNull(value)) {
            value = self._serializer.stringify(value);
            sha.update(value);
        }
    }
    for (let child of workflow.all(execContext)) {
        let alias = activityMarkup.getAlias(child);
        assert(alias);
        add(alias);
        for (let key in child) {
            if (child.hasOwnProperty(key)) {
                let value = child[key];
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
    return sha.digest("base64");
};

module.exports = WorkflowRegistry;
