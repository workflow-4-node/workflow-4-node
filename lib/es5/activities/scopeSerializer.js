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
  serialize: function(serializer, activity, execContext, getActivityById, propName, propValue, result) {
    var ser = null;
    if (!serializer) {
      ser = new Serializer();
    }
    if (_.isArray(propValue)) {
      var stuff = [];
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (propValue)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var pv = $__3.value;
          {
            if (is.activity(pv)) {
              stuff.push(specStrings.hosting.createActivityInstancePart(pv.getInstanceId(execContext)));
            } else {
              if (!serializer) {
                stuff.push(ser.toJSON(pv));
              } else {
                stuff.push(pv);
              }
            }
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
      result.name = propName;
      result.value = stuff;
      return true;
    }
    return false;
  },
  deserialize: function(serializer, activity, getActivityById, part, result) {
    var ser = null;
    if (!serializer) {
      ser = new Serializer();
    }
    if (_.isArray(part.value)) {
      var scopePartValue = [];
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (part.value)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var pv = $__3.value;
          {
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
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
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
  serialize: function(serializer, activity, execContext, getActivityById, propName, propValue, result) {
    if (is.activity(propValue)) {
      result.name = propName;
      result.value = specStrings.hosting.createActivityInstancePart(propValue.getInstanceId(execContext));
      return true;
    }
    return false;
  },
  deserialize: function(serializer, activity, getActivityById, part, result) {
    var activityId = specStrings.hosting.getInstanceId(part.value);
    if (activityId) {
      result.value = getActivityById(activityId);
      return true;
    }
    return false;
  }
};
var parentHandler = {
  serialize: function(serializer, activity, execContext, getActivityById, propName, propValue, result) {
    if (propValue && propValue.__marker === constants.markers.$parent) {
      result.name = propName;
      result.value = {
        $type: constants.markers.$parent,
        id: execContext.getInstanceId(propValue.$activity)
      };
      return true;
    }
    return false;
  },
  deserialize: function(serializer, activity, getActivityById, part, result) {
    return false;
  }
};
var activityPropHandler = {
  serialize: function(serializer, activity, execContext, getActivityById, propName, propValue, result) {
    if (_.isFunction(propValue) && !activity.hasOwnProperty(propName) && _.isFunction(activity[propName])) {
      result.value = specStrings.hosting.createActivityPropertyPart(propName);
      return true;
    } else if (_.isObject(propValue) && propValue === activity[propName]) {
      result.value = specStrings.hosting.createActivityPropertyPart(propName);
      return true;
    }
    return false;
  },
  deserialize: function(serializer, activity, getActivityById, part, result) {
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
  serialize: function(serializer, activity, execContext, getActivityById, propName, propValue, result) {
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
  deserialize: function(serializer, activity, getActivityById, part, result) {
    if (part.value && part.value.type === constants.types.error) {
      var errorName = part.value.name;
      var ErrorConstructor = global[errorName];
      if (_.isFunction(ErrorConstructor)) {
        result.value = new ErrorConstructor(part.value.stack);
      } else {
        result.value = new Error(("Error: " + errorName + " Stack: " + part.value.stack));
      }
      return true;
    }
    return false;
  }
};
var objectHandler = {
  serialize: function(serializer, activity, execContext, getActivityById, propName, propValue, result) {
    if (serializer) {
      return false;
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
  deserialize: function(serializer, activity, getActivityById, part, result) {
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
  installHandler: function(handler) {
    this.handlers.push(handler);
  },
  serialize: function(execContext, getActivityById, enablePromotions, nodes, serializer) {
    var state = [];
    var promotedProperties = enablePromotions ? new Map() : null;
    var $__26 = true;
    var $__27 = false;
    var $__28 = undefined;
    try {
      for (var $__24 = void 0,
          $__23 = (nodes)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__26 = ($__24 = $__23.next()).done); $__26 = true) {
        var node = $__24.value;
        {
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
          var $__12 = true;
          var $__13 = false;
          var $__14 = undefined;
          try {
            for (var $__10 = void 0,
                $__9 = (node.properties())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__12 = ($__10 = $__9.next()).done); $__12 = true) {
              var prop = $__10.value;
              {
                if (!activity.nonSerializedProperties.has(prop.name)) {
                  var done = false;
                  var $__5 = true;
                  var $__6 = false;
                  var $__7 = undefined;
                  try {
                    for (var $__3 = void 0,
                        $__2 = (this.handlers)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
                      var handler = $__3.value;
                      {
                        var result = {
                          name: null,
                          value: null
                        };
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
                    }
                  } catch ($__8) {
                    $__6 = true;
                    $__7 = $__8;
                  } finally {
                    try {
                      if (!$__5 && $__2.return != null) {
                        $__2.return();
                      }
                    } finally {
                      if ($__6) {
                        throw $__7;
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
            }
          } catch ($__15) {
            $__13 = true;
            $__14 = $__15;
          } finally {
            try {
              if (!$__12 && $__9.return != null) {
                $__9.return();
              }
            } finally {
              if ($__13) {
                throw $__14;
              }
            }
          }
          state.push(item);
          if (promotedProperties && activity.promotedProperties) {
            var $__19 = true;
            var $__20 = false;
            var $__21 = undefined;
            try {
              for (var $__17 = void 0,
                  $__16 = (activity.promotedProperties)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__19 = ($__17 = $__16.next()).done); $__19 = true) {
                var promotedPropName = $__17.value;
                {
                  var pv = node.getPropertyValue(promotedPropName, true);
                  if (!_.isUndefined(pv) && !(is.activity(pv))) {
                    var promotedEntry = promotedProperties.get(promotedPropName);
                    if (_.isUndefined(promotedEntry) || node.instanceId > promotedEntry.level) {
                      promotedProperties.set(promotedPropName, {
                        level: node.instanceId,
                        value: pv
                      });
                    }
                  }
                }
              }
            } catch ($__22) {
              $__20 = true;
              $__21 = $__22;
            } finally {
              try {
                if (!$__19 && $__16.return != null) {
                  $__16.return();
                }
              } finally {
                if ($__20) {
                  throw $__21;
                }
              }
            }
          }
        }
      }
    } catch ($__29) {
      $__27 = true;
      $__28 = $__29;
    } finally {
      try {
        if (!$__26 && $__23.return != null) {
          $__23.return();
        }
      } finally {
        if ($__27) {
          throw $__28;
        }
      }
    }
    var actualPromotions = null;
    if (promotedProperties) {
      actualPromotions = {};
      var $__33 = true;
      var $__34 = false;
      var $__35 = undefined;
      try {
        for (var $__31 = void 0,
            $__30 = (promotedProperties.entries())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__33 = ($__31 = $__30.next()).done); $__33 = true) {
          var kvp = $__31.value;
          {
            actualPromotions[kvp[0]] = kvp[1].value;
          }
        }
      } catch ($__36) {
        $__34 = true;
        $__35 = $__36;
      } finally {
        try {
          if (!$__33 && $__30.return != null) {
            $__30.return();
          }
        } finally {
          if ($__34) {
            throw $__35;
          }
        }
      }
    }
    return {
      state: state,
      promotedProperties: actualPromotions
    };
  },
  deserializeNodes: $traceurRuntime.initGeneratorFunction(function $__37(getActivityById, json, serializer) {
    var $__19,
        $__20,
        $__21,
        $__17,
        $__16,
        item,
        scopePart,
        activity,
        $__12,
        $__13,
        $__14,
        $__10,
        $__9,
        part,
        done,
        $__5,
        $__6,
        $__7,
        $__3,
        $__2,
        handler,
        result,
        $__8,
        $__15,
        $__22;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $__19 = true;
            $__20 = false;
            $__21 = undefined;
            $ctx.state = 73;
            break;
          case 73:
            $ctx.pushTry(59, 60);
            $ctx.state = 62;
            break;
          case 62:
            $__17 = void 0, $__16 = (json)[$traceurRuntime.toProperty(Symbol.iterator)]();
            $ctx.state = 58;
            break;
          case 58:
            $ctx.state = (!($__19 = ($__17 = $__16.next()).done)) ? 54 : 56;
            break;
          case 51:
            $__19 = true;
            $ctx.state = 58;
            break;
          case 54:
            item = $__17.value;
            $ctx.state = 55;
            break;
          case 55:
            scopePart = {};
            activity = getActivityById(item.instanceId);
            $__12 = true;
            $__13 = false;
            $__14 = undefined;
            $ctx.state = 53;
            break;
          case 53:
            $ctx.pushTry(35, 36);
            $ctx.state = 38;
            break;
          case 38:
            $__10 = void 0, $__9 = (item.parts)[$traceurRuntime.toProperty(Symbol.iterator)]();
            $ctx.state = 34;
            break;
          case 34:
            $ctx.state = (!($__12 = ($__10 = $__9.next()).done)) ? 30 : 32;
            break;
          case 29:
            $__12 = true;
            $ctx.state = 34;
            break;
          case 30:
            part = $__10.value;
            $ctx.state = 31;
            break;
          case 31:
            done = false;
            $__5 = true;
            $__6 = false;
            $__7 = undefined;
            $ctx.state = 27;
            break;
          case 27:
            $ctx.pushTry(13, 14);
            $ctx.state = 16;
            break;
          case 16:
            $__3 = void 0, $__2 = (this.handlers)[$traceurRuntime.toProperty(Symbol.iterator)]();
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = (!($__5 = ($__3 = $__2.next()).done)) ? 8 : 10;
            break;
          case 2:
            $__5 = true;
            $ctx.state = 12;
            break;
          case 8:
            handler = $__3.value;
            $ctx.state = 9;
            break;
          case 9:
            result = {
              name: null,
              value: null
            };
            $ctx.state = 7;
            break;
          case 7:
            $ctx.state = (handler.deserialize(serializer, activity, getActivityById, part, result)) ? 3 : 2;
            break;
          case 3:
            scopePart[result.name || part.name] = result.value;
            done = true;
            $ctx.state = 10;
            break;
          case 10:
            $ctx.popTry();
            $ctx.state = 14;
            $ctx.finallyFallThrough = 18;
            break;
          case 13:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            $__8 = $ctx.storedException;
            $ctx.state = 19;
            break;
          case 19:
            $__6 = true;
            $__7 = $__8;
            $ctx.state = 14;
            $ctx.finallyFallThrough = 18;
            break;
          case 14:
            $ctx.popTry();
            $ctx.state = 25;
            break;
          case 25:
            try {
              if (!$__5 && $__2.return != null) {
                $__2.return();
              }
            } finally {
              if ($__6) {
                throw $__7;
              }
            }
            $ctx.state = 23;
            break;
          case 18:
            if (!done) {
              scopePart[part.name] = part.value;
            }
            $ctx.state = 29;
            break;
          case 32:
            $ctx.popTry();
            $ctx.state = 36;
            $ctx.finallyFallThrough = 40;
            break;
          case 35:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            $__15 = $ctx.storedException;
            $ctx.state = 41;
            break;
          case 41:
            $__13 = true;
            $__14 = $__15;
            $ctx.state = 36;
            $ctx.finallyFallThrough = 40;
            break;
          case 36:
            $ctx.popTry();
            $ctx.state = 47;
            break;
          case 47:
            try {
              if (!$__12 && $__9.return != null) {
                $__9.return();
              }
            } finally {
              if ($__13) {
                throw $__14;
              }
            }
            $ctx.state = 45;
            break;
          case 40:
            $ctx.state = 49;
            return new ScopeNode(item.instanceId, scopePart, item.userId);
          case 49:
            $ctx.maybeThrow();
            $ctx.state = 51;
            break;
          case 56:
            $ctx.popTry();
            $ctx.state = 60;
            $ctx.finallyFallThrough = -2;
            break;
          case 59:
            $ctx.popTry();
            $ctx.maybeUncatchable();
            $__22 = $ctx.storedException;
            $ctx.state = 65;
            break;
          case 65:
            $__20 = true;
            $__21 = $__22;
            $ctx.state = 60;
            $ctx.finallyFallThrough = -2;
            break;
          case 60:
            $ctx.popTry();
            $ctx.state = 71;
            break;
          case 71:
            try {
              if (!$__19 && $__16.return != null) {
                $__16.return();
              }
            } finally {
              if ($__20) {
                throw $__21;
              }
            }
            $ctx.state = 69;
            break;
          case 69:
            $ctx.state = $ctx.finallyFallThrough;
            break;
          case 45:
            switch ($ctx.finallyFallThrough) {
              case 73:
              case 62:
              case 58:
              case 51:
              case 54:
              case 55:
              case 53:
              case 38:
              case 34:
              case 29:
              case 30:
              case 31:
              case 27:
              case 16:
              case 12:
              case 2:
              case 8:
              case 9:
              case 7:
              case 3:
              case 4:
              case 10:
              case 13:
              case 19:
              case 14:
              case 25:
              case 23:
              case 18:
              case 32:
              case 35:
              case 41:
              case 36:
              case 47:
              case 45:
              case 40:
              case 49:
              case 56:
              case 59:
              case 65:
                $ctx.state = $ctx.finallyFallThrough;
                $ctx.finallyFallThrough = -1;
                break;
              default:
                $ctx.state = 60;
                break;
            }
            break;
          case 23:
            switch ($ctx.finallyFallThrough) {
              case 53:
              case 38:
              case 34:
              case 29:
              case 30:
              case 31:
              case 27:
              case 16:
              case 12:
              case 2:
              case 8:
              case 9:
              case 7:
              case 3:
              case 4:
              case 10:
              case 13:
              case 19:
              case 14:
              case 25:
              case 23:
              case 18:
              case 32:
              case 35:
              case 41:
                $ctx.state = $ctx.finallyFallThrough;
                $ctx.finallyFallThrough = -1;
                break;
              default:
                $ctx.state = 36;
                break;
            }
            break;
          default:
            return $ctx.end();
        }
    }, $__37, this);
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
