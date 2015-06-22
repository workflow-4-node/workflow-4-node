var Workflow = require("../activities/workflow");
var _ = require("lodash");
var BeginMethod = require("../activities/beginMethod");
var EndMethod = require("../activities/endMethod");
var is = require("../common/is");
var StrMap = require("backpack-node").collections.StrMap;

function WorkflowRegistry() {
    this._workflows = new StrMap();
}

WorkflowRegistry.prototype.register = function (workflow) {
    if (workflow instanceof Workflow) {
        if (!_(workflow.name).isString()) throw new TypeError("Workflow name is not a string.");
        var name = workflow.name.trim();
        if (!name) throw new TypeError("Workflow name is empty.");
        if (!_(workflow.version).isNumber()) throw new TypeError("Workflow version is not a number.");
        var version = workflow.version.toString();

        var entry = this._workflows.get(name);
        if (entry) {
            var desc = entry.get(version);
            if (desc) {
                throw new Error("Workflow " + name + " " + version + " already registered.");
            }
            else {
                entry.add(version, this._createDesc(workflow, name, workflow.version));
            }
        }
        else {
            entry = new StrMap();
            entry.add(version, this._createDesc(workflow, name, workflow.version));
            this._workflows.add(name, entry);
        }
    }
    else {
        throw  new TypeError("Workflow instance argument expected.");
    }
}

WorkflowRegistry.prototype.getDesc = function (name, version) {
    var entry = this._workflows.get(name);
    if (entry) {
        if (is.defined(version)) {
            version = version.toString();
            var desc = entry.get(version);
            if (desc) return desc;
            throw new Error("Workflow " + name + " " + version + " has not been registered.");
        }
        else {
            // Get top version
            var maxV = -10000000;
            var desc = null;
            entry.forEachValue(function (d) {
                if (d.version > maxV) desc = d;
            });
            if (desc) return desc;
            throw new Error("Workflow " + name + " has not been registered.");
        }
    }

}

WorkflowRegistry.prototype._createDesc = function (workflow, name, version) {
    return {
        workflow: workflow,
        name: name,
        version: version,
        methods: this._collectMethodInfos(workflow)
    }
}

WorkflowRegistry.prototype._collectMethodInfos = function (workflow) {
    var self = this;
    var infos = new StrMap();
    workflow.forEachChild(function (child) {
        var isBM = child instanceof BeginMethod;
        var isEM = child instanceof EndMethod;
        if (isBM || isEM) {
            var methodName = _(child.methodName).isString() ? child.methodName.trim() : null;
            var instanceIdPath = _(child.instanceIdPath).isString() ? child.instanceIdPath.trim() : null;
            if (methodName) {
                var info = infos.get(methodName);
                if (!info) {
                    info = {
                        workflow: workflow,
                        canCreateInstance: false,
                        instanceIdPath: null
                    };
                    infos.add(methodName, info);
                }
                if (isBM && child.canCreateInstance) info.canCreateInstance = true;
                if (instanceIdPath) {
                    if (info.instanceIdPath) {
                        if (info.instanceIdPath !== instanceIdPath) throw new Error("Method '" + methodName + "' in workflow '" + workflow.name + "' has multiple different instanceIdPath value which is not supported.");
                    }
                    else {
                        info.instanceIdPath = instanceIdPath;
                    }
                }
            }
        }
    });
    var result = new StrMap();
    infos.forEach(function (kvp) {
        if (kvp.value.instanceIdPath) result.add(kvp.key, kvp.value);
    });
    return result;
}

WorkflowRegistry.prototype.forEachMethodInfo = function (workflowName, methodName, f) {
    var entry = this._workflows.get(workflowName);
    if (entry) {
        entry.forEachValue(function (desc) {
            var info = desc.methods.get(methodName);
            if (info) f(info);
        });
    }
}

module.exports = WorkflowRegistry;
