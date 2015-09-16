"use strict";
let guids = require("../common/guids");
let specStrings = require("../common/specStrings");
let _ = require("lodash");
let is = require("../common/is");
let ScopeNode = require("./scopeNode");
let errors = require("../common/errors");

let arrayHandler = {
    serialize: function (activity, execContext, getActivityById, propName, propValue, result) {
        if (_.isArray(propValue)) {
            let stuff = [];
            for (let pv of propValue) {
                if (is.activity(pv)) {
                    stuff.push(specStrings.hosting.createActivityInstancePart(pv.getInstanceId(execContext)));
                }
                else {
                    stuff.push(pv);
                }
            }
            result.name = propName;
            result.value = stuff;
            return true;
        }
        return false;
    },
    deserialize: function (activity, getActivityById, part, result) {
        if (_.isArray(part.value)) {
            let scopePartValue = [];
            for (let pv of part.value) {
                let activityId = specStrings.hosting.getInstanceId(pv);
                if (activityId) {
                    scopePartValue.push(getActivityById(activityId));
                }
                else {
                    scopePartValue.push(pv);
                }
            }
            result.value = scopePartValue;
            return true;
        }
        return false;
    }
};

let activityHandler = {
    serialize: function (activity, execContext, getActivityById, propName, propValue, result) {
        if (is.activity(propValue)) {
            result.name = propName;
            result.value = specStrings.hosting.createActivityInstancePart(propValue.getInstanceId(execContext));
            return true;
        }
        return false;
    },
    deserialize: function (activity, getActivityById, part, result) {
        let activityId = specStrings.hosting.getInstanceId(part.value);
        if (activityId) {
            result.value = getActivityById(activityId);
            return true;
        }
        return false;
    }
};

let activityPropHandler = {
    serialize: function (activity, execContext, getActivityById, propName, propValue, result) {
        if (_.isFunction(propValue) && !activity.hasOwnProperty(propName) &&
            _.isFunction(activity[propName])) {
            result.value = specStrings.hosting.createActivityPropertyPart(propName);
            return true;
        }
        else if (_.isObject(propValue) && propValue === activity[propName]) {
            result.value = specStrings.hosting.createActivityPropertyPart(propName);
            return true;
        }
        return false;
    },
    deserialize: function (activity, getActivityById, part, result) {
        let activityProperty = specStrings.hosting.getActivityPropertyName(part);
        if (activityProperty) {
            if (_.isUndefined(activity[activityProperty])) {
                throw new errors.ActivityRuntimeError("Activity has no property '" + part + "'.");
            }
            result.name = activityProperty;
            result.value = activity[activityProperty];
            return true;
        }
        return false;
    }
};

let errorInstanceHandler = {
    serialize: function (activity, execContext, getActivityById, propName, propValue, result) {
        if (propValue instanceof Error) {
            result.name = propName;
            result.value = {
                type: guids.types.error,
                name: propValue.name,
                stack: propValue.stack
            };
            return true;
        }
        return false;
    },
    deserialize: function (activity, getActivityById, part, result) {
        if (part.value && part.value.type === guids.types.error) {
            let errorName = part.value.name;
            let ErrorConstructor = global[errorName];
            if (_.isFunction(ErrorConstructor)) {
                result.value = new ErrorConstructor(part.value.stack);
            }
            else {
                result.value = new Error(`Error: ${errorName} Stack: ${part.value.stack}`);
            }
            return true;
        }
        return false;
    }
};

let builtInHandler = {
    _serializeMap: function(map) {
        let items = [];
        for (let kvp of map.entries()) {
            items.push(kvp);
        }
        return items;
    },
    _deserializeMap: function(arr) {
        let map = new Map();
        for (let kvp of arr) {
            map.set(kvp[0], kvp[1]);
        }
        return map;
    },
    serialize: function (activity, execContext, getActivityById, propName, propValue, result) {
        if (propName === "__schedulingState") {
            result.name = propName;
            result.value = _.clone(propValue);
            result.value.indices = this._serializeMap(propValue.indices);
            result.value.__type = guids.types.schedulingState;
            return true;
        }
        if (propName === "__subActivitySchedulingState") {
            result.name = propName;
            result.value = _.clone(propValue);
            result.value.activitiesMap = this._serializeMap(propValue.activitiesMap);
            result.value.__type = guids.types.subActivitySchedulingState;
            return true;
        }
        return false;
    },
    deserialize: function (activity, getActivityById, part, result) {
        if (part.value) {
            if (part.value.__type === guids.types.schedulingState) {
                result.value = _.clone(part.value);
                result.value.indices = this._deserializeMap(part.value.indices);
                delete result.value.__type;
                return true;
            }
            if (part.value.__type === guids.types.subActivitySchedulingState) {
                result.value = _.clone(part.value);
                result.value.activitiesMap = this._deserializeMap(part.value.activitiesMap);
                delete result.value.__type;
                return true;
            }
        }
        return false;
    }
};

let scopeSerializer = {
    handlers: [],
    installHandler: function (handler) {
        this.handlers.push(handler);
    },
    serialize: function (execContext, getActivityById, enablePromotions, nodes) {
        let state = [];
        let promotedProperties = enablePromotions ? new Map() : null;

        for (let node of nodes) {
            if (node.instanceId === guids.ids.initialScope) {
                continue;
            }

            let item = {
                instanceId: node.instanceId,
                userId: node.userId,
                parentId: node.parent ? node.parent.instanceId : null,
                parts: []
            };

            let activity = getActivityById(node.instanceId);

            for (let prop of node.properties()) {
                if (!activity.nonSerializedProperties.has(prop.name)) {
                    let done = false;
                    for (let handler of this.handlers) {
                        let result = { name: null, value: null };
                        if (handler.serialize(activity, execContext, getActivityById, prop.name, prop.value, result)) {
                            if (result.name) {
                                item.parts.push({
                                    name: prop.name,
                                    value: result.value
                                });
                            }
                            else {
                                item.parts.push(result.value);
                            }
                            done = true;
                            break;
                        }
                    }
                    if (!done) {
                        item.parts.push({
                            name: prop.name,
                            value: prop.value
                        });
                    }
                }
            }

            state.push(item);

            // Promotions:
            if (promotedProperties && activity.promotedProperties) {
                for (let promotedPropName of activity.promotedProperties) {
                    let pv = node.getPropertyValue(promotedPropName, true);
                    if (!_.isUndefined(pv) && !(is.activity(pv))) {
                        let promotedEntry = promotedProperties.get(promotedPropName);
                        // If an Activity Id greater than other, then we can sure that other below or after in the tree.
                        if (_.isUndefined(promotedEntry) || node.instanceId > promotedEntry.level) {
                            promotedProperties.set(promotedPropName, { level: node.instanceId, value: pv });
                        }
                    }
                }
            }
        }

        let actualPromotions = null;
        if (promotedProperties) {
            actualPromotions = {};
            for (let kvp of promotedProperties.entries()) {
                actualPromotions[kvp[0]] = kvp[1].value;
            }
        }

        return {
            state: state,
            promotedProperties: actualPromotions
        };
    },
    deserializeNodes: function* (getActivityById, json) {
        for (let item of json) {
            let scopePart = {};
            let activity = getActivityById(item.instanceId);
            for (let part of item.parts) {
                let done = false;
                for (let handler of this.handlers) {
                    let result = { name: null, value: null };
                    if (handler.deserialize(activity, getActivityById, part, result)) {
                        scopePart[result.name || part.name] = result.value;
                        done = true;
                        break;
                    }
                }
                if (!done) {
                    scopePart[part.name] = part.value;
                }
            }
            yield new ScopeNode(item.instanceId, scopePart, item.userId);
        }
    }
};

scopeSerializer.installHandler(arrayHandler);
scopeSerializer.installHandler(activityHandler);
scopeSerializer.installHandler(builtInHandler);
scopeSerializer.installHandler(activityPropHandler);
scopeSerializer.installHandler(errorInstanceHandler);

module.exports = scopeSerializer;