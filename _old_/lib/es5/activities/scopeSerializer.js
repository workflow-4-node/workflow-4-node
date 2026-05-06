"use strict";

var constants = require("../common/constants");
var specStrings = require("../common/specStrings");
var _ = require("lodash");
var is = require("../common/is");
var ScopeNode = require("./scopeNode");
var errors = require("../common/errors");
var converters = require("../common/converters");
var Serializer = require("backpack-node").system.Serializer;

var arrayHandler = {
    serialize: function serialize(serializer, activity, execContext, getActivityById, propName, propValue, result) {
        var ser = null;
        if (!serializer) {
            ser = new Serializer(); // It should get serialized internally.
        }
        if (_.isArray(propValue)) {
            var stuff = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = propValue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var pv = _step.value;

                    if (is.activity(pv)) {
                        stuff.push(specStrings.hosting.createActivityInstancePart(pv.instanceId));
                    } else {
                        if (!serializer) {
                            stuff.push(ser.toJSON(pv));
                        } else {
                            stuff.push(pv);
                        }
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

            result.name = propName;
            result.value = stuff;
            return true;
        }
        return false;
    },
    deserialize: function deserialize(serializer, activity, getActivityById, part, result) {
        var ser = null;
        if (!serializer) {
            ser = new Serializer(); // It should get serialized internally.
        }
        if (_.isArray(part.value)) {
            var scopePartValue = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = part.value[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var pv = _step2.value;

                    var activityId = specStrings.hosting.getInstanceId(pv);
                    if (activityId) {
                        scopePartValue.push(getActivityById(activityId));
                    } else {
                        if (!serializer) {
                            scopePartValue.push(ser.fromJSON(pv));
                        } else {
                            scopePartValue.push(pv);
                        }
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

            result.value = scopePartValue;
            return true;
        }
        return false;
    }
};

var activityHandler = {
    serialize: function serialize(serializer, activity, execContext, getActivityById, propName, propValue, result) {
        if (is.activity(propValue)) {
            result.name = propName;
            result.value = specStrings.hosting.createActivityInstancePart(propValue.instanceId);
            return true;
        }
        return false;
    },
    deserialize: function deserialize(serializer, activity, getActivityById, part, result) {
        var activityId = specStrings.hosting.getInstanceId(part.value);
        if (activityId) {
            result.value = getActivityById(activityId);
            return true;
        }
        return false;
    }
};

var parentHandler = {
    serialize: function serialize(serializer, activity, execContext, getActivityById, propName, propValue, result) {
        if (propValue && propValue.__marker === constants.markers.$parent) {
            result.name = propName;
            result.value = {
                $type: constants.markers.$parent,
                id: propValue.$activity.instanceId
            };
            return true;
        }
        return false;
    },
    deserialize: function deserialize(serializer, activity, getActivityById, part, result) {
        return false;
    }
};

var activityPropHandler = {
    serialize: function serialize(serializer, activity, execContext, getActivityById, propName, propValue, result) {
        if (_.isFunction(propValue) && !activity.hasOwnProperty(propName) && _.isFunction(activity[propName])) {
            result.value = specStrings.hosting.createActivityPropertyPart(propName);
            return true;
        } else if (_.isObject(propValue) && propValue === activity[propName]) {
            result.value = specStrings.hosting.createActivityPropertyPart(propName);
            return true;
        }
        return false;
    },
    deserialize: function deserialize(serializer, activity, getActivityById, part, result) {
        var activityProperty = specStrings.hosting.getActivityPropertyName(part);
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

var errorInstanceHandler = {
    serialize: function serialize(serializer, activity, execContext, getActivityById, propName, propValue, result) {
        if (propValue instanceof Error) {
            result.name = propName;
            result.value = {
                type: constants.types.error,
                name: propValue.name,
                stack: propValue.stack
            };
            return true;
        }
        return false;
    },
    deserialize: function deserialize(serializer, activity, getActivityById, part, result) {
        if (part.value && part.value.type === constants.types.error) {
            var errorName = part.value.name;
            var ErrorConstructor = global[errorName];
            if (_.isFunction(ErrorConstructor)) {
                result.value = new ErrorConstructor(part.value.stack);
            } else {
                result.value = new Error("Error: " + errorName + " Stack: " + part.value.stack);
            }
            return true;
        }
        return false;
    }
};

var objectHandler = {
    serialize: function serialize(serializer, activity, execContext, getActivityById, propName, propValue, result) {
        if (serializer) {
            return false; // it's handled externally.
        }
        if (propName === "__schedulingState") {
            result.name = propName;
            result.value = _.clone(propValue);
            result.value.indices = converters.mapToArray(propValue.indices);
            result.value.$type = constants.types.schedulingState;
            return true;
        }
        if (_.isDate(propValue)) {
            result.name = propName;
            result.value = {
                time: propValue.getTime(),
                $type: constants.types.date
            };
            return true;
        }
        if (propValue instanceof Map) {
            result.name = propName;
            result.value = {
                data: converters.mapToArray(propValue),
                $type: constants.types.map
            };
            return true;
        }
        if (propValue instanceof Set) {
            result.name = propName;
            result.value = {
                data: converters.setToArray(propValue),
                $type: constants.types.set
            };
            return true;
        }
        if (propValue instanceof RegExp) {
            result.name = propName;
            result.value = {
                pattern: propValue.pattern,
                flags: propValue.flags,
                $type: constants.types.rex
            };
            return true;
        }
        if (_.isPlainObject(propValue)) {
            result.name = propName;
            result.value = {
                data: new Serializer().toJSON(propValue),
                $type: constants.types.object
            };
            return true;
        }
        return false;
    },
    deserialize: function deserialize(serializer, activity, getActivityById, part, result) {
        if (part.value) {
            if (part.value.$type === constants.types.schedulingState) {
                result.value = _.clone(part.value);
                result.value.indices = converters.arrayToMap(part.value.indices);
                delete result.value.$type;
                return true;
            }
            if (part.value.$type === constants.types.date) {
                result.value = new Date(part.value.time);
                return true;
            }
            if (part.value.$type === constants.types.map) {
                result.value = converters.arrayToMap(part.value.data);
                return true;
            }
            if (part.value.$type === constants.types.set) {
                result.value = converters.arrayToSet(part.value.data);
                return true;
            }
            if (part.value.$type === constants.types.rex) {
                result.value = new RegExp(part.value.pattern, part.value.flags);
                return true;
            }
            if (part.value.$type === constants.types.object) {
                result.value = new Serializer().fromJSON(part.value.data);
                return true;
            }
        }
        return false;
    }
};

var scopeSerializer = {
    handlers: [],
    installHandler: function installHandler(handler) {
        this.handlers.push(handler);
    },
    serialize: function serialize(execContext, getActivityById, enablePromotions, nodes, serializer) {
        var state = [];
        var promotedProperties = enablePromotions ? new Map() : null;

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var node = _step3.value;

                if (node.instanceId === constants.ids.initialScope) {
                    continue;
                }

                var item = {
                    instanceId: node.instanceId,
                    userId: node.userId,
                    parentId: node.parent ? node.parent.instanceId : null,
                    parts: []
                };

                var activity = getActivityById(node.instanceId);

                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = node.properties()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var prop = _step5.value;

                        if (!activity.nonSerializedProperties.has(prop.name)) {
                            var done = false;
                            var _iteratorNormalCompletion7 = true;
                            var _didIteratorError7 = false;
                            var _iteratorError7 = undefined;

                            try {
                                for (var _iterator7 = this.handlers[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                    var handler = _step7.value;

                                    var result = { name: null, value: null };
                                    if (handler.serialize(serializer, activity, execContext, getActivityById, prop.name, prop.value, result)) {
                                        if (result.name) {
                                            item.parts.push({
                                                name: prop.name,
                                                value: result.value
                                            });
                                        } else {
                                            item.parts.push(result.value);
                                        }
                                        done = true;
                                        break;
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

                            if (!done) {
                                item.parts.push({
                                    name: prop.name,
                                    value: prop.value
                                });
                            }
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

                state.push(item);

                // Promotions:
                if (promotedProperties && activity.promotedProperties) {
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = activity.promotedProperties[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var promotedPropName = _step6.value;

                            var pv = node.getPropertyValue(promotedPropName, true);
                            if (!_.isUndefined(pv) && !is.activity(pv)) {
                                var promotedEntry = promotedProperties.get(promotedPropName);
                                // If an Activity Id greater than other, then we can sure that other below or after in the tree.
                                if (_.isUndefined(promotedEntry) || node.instanceId > promotedEntry.level) {
                                    promotedProperties.set(promotedPropName, { level: node.instanceId, value: pv });
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError6 = true;
                        _iteratorError6 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                _iterator6.return();
                            }
                        } finally {
                            if (_didIteratorError6) {
                                throw _iteratorError6;
                            }
                        }
                    }
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

        var actualPromotions = null;
        if (promotedProperties) {
            actualPromotions = {};
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = promotedProperties.entries()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var kvp = _step4.value;

                    actualPromotions[kvp[0]] = kvp[1].value;
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
        }

        return {
            state: state,
            promotedProperties: actualPromotions
        };
    },
    deserializeNodes: regeneratorRuntime.mark(function deserializeNodes(getActivityById, json, serializer) {
        var _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, item, scopePart, activity, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, part, done, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, handler, result;

        return regeneratorRuntime.wrap(function deserializeNodes$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _iteratorError8 = undefined;
                        _context.prev = 3;
                        _iterator8 = json[Symbol.iterator]();

                    case 5:
                        if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                            _context.next = 69;
                            break;
                        }

                        item = _step8.value;
                        scopePart = {};
                        activity = getActivityById(item.instanceId);
                        _iteratorNormalCompletion9 = true;
                        _didIteratorError9 = false;
                        _iteratorError9 = undefined;
                        _context.prev = 12;
                        _iterator9 = item.parts[Symbol.iterator]();

                    case 14:
                        if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                            _context.next = 50;
                            break;
                        }

                        part = _step9.value;
                        done = false;
                        _iteratorNormalCompletion10 = true;
                        _didIteratorError10 = false;
                        _iteratorError10 = undefined;
                        _context.prev = 20;
                        _iterator10 = this.handlers[Symbol.iterator]();

                    case 22:
                        if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                            _context.next = 32;
                            break;
                        }

                        handler = _step10.value;
                        result = { name: null, value: null };

                        if (!handler.deserialize(serializer, activity, getActivityById, part, result)) {
                            _context.next = 29;
                            break;
                        }

                        scopePart[result.name || part.name] = result.value;
                        done = true;
                        return _context.abrupt("break", 32);

                    case 29:
                        _iteratorNormalCompletion10 = true;
                        _context.next = 22;
                        break;

                    case 32:
                        _context.next = 38;
                        break;

                    case 34:
                        _context.prev = 34;
                        _context.t0 = _context["catch"](20);
                        _didIteratorError10 = true;
                        _iteratorError10 = _context.t0;

                    case 38:
                        _context.prev = 38;
                        _context.prev = 39;

                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }

                    case 41:
                        _context.prev = 41;

                        if (!_didIteratorError10) {
                            _context.next = 44;
                            break;
                        }

                        throw _iteratorError10;

                    case 44:
                        return _context.finish(41);

                    case 45:
                        return _context.finish(38);

                    case 46:
                        if (!done) {
                            scopePart[part.name] = part.value;
                        }

                    case 47:
                        _iteratorNormalCompletion9 = true;
                        _context.next = 14;
                        break;

                    case 50:
                        _context.next = 56;
                        break;

                    case 52:
                        _context.prev = 52;
                        _context.t1 = _context["catch"](12);
                        _didIteratorError9 = true;
                        _iteratorError9 = _context.t1;

                    case 56:
                        _context.prev = 56;
                        _context.prev = 57;

                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }

                    case 59:
                        _context.prev = 59;

                        if (!_didIteratorError9) {
                            _context.next = 62;
                            break;
                        }

                        throw _iteratorError9;

                    case 62:
                        return _context.finish(59);

                    case 63:
                        return _context.finish(56);

                    case 64:
                        _context.next = 66;
                        return new ScopeNode(item.instanceId, scopePart, item.userId, activity);

                    case 66:
                        _iteratorNormalCompletion8 = true;
                        _context.next = 5;
                        break;

                    case 69:
                        _context.next = 75;
                        break;

                    case 71:
                        _context.prev = 71;
                        _context.t2 = _context["catch"](3);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context.t2;

                    case 75:
                        _context.prev = 75;
                        _context.prev = 76;

                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }

                    case 78:
                        _context.prev = 78;

                        if (!_didIteratorError8) {
                            _context.next = 81;
                            break;
                        }

                        throw _iteratorError8;

                    case 81:
                        return _context.finish(78);

                    case 82:
                        return _context.finish(75);

                    case 83:
                    case "end":
                        return _context.stop();
                }
            }
        }, deserializeNodes, this, [[3, 71, 75, 83], [12, 52, 56, 64], [20, 34, 38, 46], [39,, 41, 45], [57,, 59, 63], [76,, 78, 82]]);
    })
};

scopeSerializer.installHandler(arrayHandler);
scopeSerializer.installHandler(activityHandler);
scopeSerializer.installHandler(parentHandler);
scopeSerializer.installHandler(objectHandler);
scopeSerializer.installHandler(activityPropHandler);
scopeSerializer.installHandler(errorInstanceHandler);

module.exports = scopeSerializer;
//# sourceMappingURL=scopeSerializer.js.map
