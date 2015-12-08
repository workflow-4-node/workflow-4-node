"use strict";

var Workflow = require("../activities/workflow");
var _ = require("lodash");
var BeginMethod = require("../activities/beginMethod");
var EndMethod = require("../activities/endMethod");
var is = require("../common/is");
var ActivityExecutionContext = require("../activities/activityExecutionContext");
var activityMarkup = require("../activities/activityMarkup");
var Serializer = require("backpack-node").system.Serializer;
var crypto = require("crypto");
var assert = require("better-assert");

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
        var name = workflow.name.trim();
        if (!name) {
            throw new TypeError("Workflow name is empty.");
        }
        var execContext = new ActivityExecutionContext();
        execContext.initialize(workflow);
        var version = this._computeVersion(execContext);
        var entry = this._workflows.get(name);
        var desc = undefined;
        if (entry) {
            desc = entry.get(version);
            if (desc) {
                throw new Error("Workflow " + name + " (" + version + ") already registered.");
            } else {
                if (!deprecated) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = entry.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            desc = _step.value;

                            if (!desc.deprecated) {
                                throw new Error("Workflow " + name + " (" + version + ") has an already registered undeprecated version.");
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }
                desc = this._createDesc(execContext, name, version, deprecated);
                entry.set(version, desc);
            }
        } else {
            entry = new Map();
            desc = this._createDesc(execContext, name, version, deprecated);
            entry.set(version, desc);
            this._workflows.set(name, entry);
        }
        return desc;
    } else {
        throw new TypeError("Workflow instance argument expected.");
    }
};

WorkflowRegistry.prototype.getDesc = function (name, version) {
    var entry = this._workflows.get(name);
    if (entry) {
        if (!_.isUndefined(version)) {
            var desc = entry.get(version);
            if (desc) {
                return desc;
            }
            throw new Error("Workflow " + name + " of version " + version + " has not been registered.");
        } else {
            // Get undeprecated
            var desc = null;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = entry.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var d = _step2.value;

                    if (!d.deprecated) {
                        desc = d;
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
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
    var result = [];
    var entry = this._workflows.get(workflowName);
    if (entry) {
        var desc = null;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = entry.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var d = _step3.value;

                if (!d.deprecated) {
                    desc = d;
                    break;
                }
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
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
    var self = this;
    var infos = new Map();
    var workflow = execContext.rootActivity;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = workflow.children(execContext)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var child = _step4.value;

            var isBM = child instanceof BeginMethod;
            var isEM = child instanceof EndMethod;
            if (isBM || isEM) {
                var methodName = _.isString(child.methodName) ? child.methodName.trim() : null;
                var instanceIdPath = _.isString(child.instanceIdPath) ? child.instanceIdPath.trim() : null;
                if (methodName) {
                    var info = infos.get(methodName);
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
                        } else {
                            info.instanceIdPath = instanceIdPath;
                        }
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    var result = new Map();
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = infos.entries()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var kvp = _step5.value;

            if (kvp[1].instanceIdPath) {
                result.set(kvp[0], kvp[1]);
            }
        }
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }

    return result;
};

WorkflowRegistry.prototype.methodInfos = regeneratorRuntime.mark(function _callee(workflowName, methodName) {
    var entry, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, desc, info;

    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    entry = this._workflows.get(workflowName);

                    if (!entry) {
                        _context.next = 30;
                        break;
                    }

                    _iteratorNormalCompletion6 = true;
                    _didIteratorError6 = false;
                    _iteratorError6 = undefined;
                    _context.prev = 5;
                    _iterator6 = entry.values()[Symbol.iterator]();

                case 7:
                    if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                        _context.next = 16;
                        break;
                    }

                    desc = _step6.value;
                    info = desc.methods.get(methodName);

                    if (!info) {
                        _context.next = 13;
                        break;
                    }

                    _context.next = 13;
                    return info;

                case 13:
                    _iteratorNormalCompletion6 = true;
                    _context.next = 7;
                    break;

                case 16:
                    _context.next = 22;
                    break;

                case 18:
                    _context.prev = 18;
                    _context.t0 = _context["catch"](5);
                    _didIteratorError6 = true;
                    _iteratorError6 = _context.t0;

                case 22:
                    _context.prev = 22;
                    _context.prev = 23;

                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }

                case 25:
                    _context.prev = 25;

                    if (!_didIteratorError6) {
                        _context.next = 28;
                        break;
                    }

                    throw _iteratorError6;

                case 28:
                    return _context.finish(25);

                case 29:
                    return _context.finish(22);

                case 30:
                case "end":
                    return _context.stop();
            }
        }
    }, _callee, this, [[5, 18, 22, 30], [23,, 25, 29]]);
});

WorkflowRegistry.prototype._computeVersion = function (execContext) {
    var self = this;
    var workflow = execContext.rootActivity;
    var sha = crypto.createHash("sha256");
    function add(value) {
        if (!_.isNull(value)) {
            value = self._serializer.stringify(value);
            sha.update(value);
        }
    }
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
        for (var _iterator7 = workflow.all(execContext)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var activity = _step7.value;

            var alias = activityMarkup.getAlias(activity);
            assert(alias);
            add(alias);
            for (var key in activity) {
                if (activity.hasOwnProperty(key) && !activity.nonScopedProperties.has(key) && !activity.nonSerializedProperties.has(key)) {
                    var value = activity[key];
                    if (!is.activity(value)) {
                        if (_.isArray(value)) {
                            var _iteratorNormalCompletion8 = true;
                            var _didIteratorError8 = false;
                            var _iteratorError8 = undefined;

                            try {
                                for (var _iterator8 = value[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                    var item = _step8.value;

                                    if (!is.activity(item)) {
                                        add(value);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError8 = true;
                                _iteratorError8 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                        _iterator8.return();
                                    }
                                } finally {
                                    if (_didIteratorError8) {
                                        throw _iteratorError8;
                                    }
                                }
                            }
                        } else {
                            add(value);
                        }
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
            }
        } finally {
            if (_didIteratorError7) {
                throw _iteratorError7;
            }
        }
    }

    return sha.digest("hex");
};

module.exports = WorkflowRegistry;
//# sourceMappingURL=workflowRegistry.js.map
