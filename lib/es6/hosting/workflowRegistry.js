"use strict";

let Workflow = require("../activities/workflow");
let _ = require("lodash");
let BeginMethod = require("../activities/beginMethod");
let EndMethod = require("../activities/endMethod");
let is = require("../common/is");
let ActivityExecutionContext = require("../activities/activityExecutionContext");
let activityMarkup = require("../activities/activityMarkup");

function WorkflowRegistry() {
    this._workflows = new Map();
}

WorkflowRegistry.prototype.register = function (workflow) {
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
        if (!_(workflow.version).isNumber()) {
            throw new TypeError("Workflow version is not a number.");
        }
        let version = workflow.version;

        let entry = this._workflows.get(name);
        if (entry) {
            let desc = entry.get(version);
            if (desc) {
                throw new Error("Workflow " + name + " " + version + " already registered.");
            }
            else {
                entry.set(version, this._createDesc(workflow, name, workflow.version));
            }
        }
        else {
            entry = new Map();
            entry.set(version, this._createDesc(workflow, name, workflow.version));
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
            // Get top version
            let maxV = -10000000;
            let desc = null;
            for (let d of entry.values()) {
                if (d.version > maxV) {
                    desc = d;
                    break;
                }
            }
            if (desc) {
                return desc;
            }
            throw new Error("Workflow " + name + " has not been registered.");
        }
    }
};

WorkflowRegistry.prototype.getTopVersion = function (workflowName) {
    let result = [];
    let entry = this._workflows.get(workflowName);
    if (entry) {
        for (let version of entry.keys()) {
            result.push(version);
        }
    }
    if (result.length === 0) {
        return null;
    }
    result.sort();
    return result[result.length - 1];
};

WorkflowRegistry.prototype._createDesc = function (workflow, name, version) {
    return {
        workflow: workflow,
        name: name,
        version: version,
        methods: this._collectMethodInfos(workflow)
    };
};

WorkflowRegistry.prototype._collectMethodInfos = function (workflow) {
    let self = this;
    let infos = new Map();
    let execContext = new ActivityExecutionContext();
    execContext.initialize(workflow);
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

module.exports = WorkflowRegistry;
