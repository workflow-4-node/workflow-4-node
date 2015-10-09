"use strict";
var guids = require("../common/guids");
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
              if (ser) {
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
              if (ser) {
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
    if (propValue && propValue.__marker === guids.markers.$parent) {
      result.name = propName;
      result.value = {};
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (propValue.$keys)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var key = $__3.value;
          {
            if (key !== "__marker") {
              result.value[key] = propValue[key];
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
        type: guids.types.error,
        name: propValue.name,
        stack: propValue.stack
      };
      return true;
    }
    return false;
  },
  deserialize: function(serializer, activity, getActivityById, part, result) {
    if (part.value && part.value.type === guids.types.error) {
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
      result.value.$type = guids.types.schedulingState;
      return true;
    }
    if (_.isDate(propValue)) {
      result.name = propName;
      result.value = {
        time: propValue.getTime(),
        $type: guids.types.date
      };
      return true;
    }
    if (propValue instanceof Map) {
      result.name = propName;
      result.value = {
        data: converters.mapToArray(propValue),
        $type: guids.types.map
      };
      return true;
    }
    if (propValue instanceof Set) {
      result.name = propName;
      result.value = {
        data: converters.setToArray(propValue),
        $type: guids.types.set
      };
      return true;
    }
    if (propValue instanceof RegExp) {
      result.name = propName;
      result.value = {
        pattern: propValue.pattern,
        flags: propValue.flags,
        $type: guids.types.rex
      };
      return true;
    }
    if (_.isPlainObject(propValue)) {
      result.name = propName;
      result.value = {
        data: new Serializer().toJSON(propValue),
        $type: guids.types.object
      };
      return true;
    }
    return false;
  },
  deserialize: function(serializer, activity, getActivityById, part, result) {
    if (part.value) {
      if (part.value.$type === guids.types.schedulingState) {
        result.value = _.clone(part.value);
        result.value.indices = converters.arrayToMap(part.value.indices);
        delete result.value.$type;
        return true;
      }
      if (part.value.$type === guids.types.date) {
        result.value = new Date(part.value.time);
        return true;
      }
      if (part.value.$type === guids.types.map) {
        result.value = converters.arrayToMap(part.value.data);
        return true;
      }
      if (part.value.$type === guids.types.set) {
        result.value = converters.arrayToSet(part.value.data);
        return true;
      }
      if (part.value.$type === guids.types.rex) {
        result.value = new RegExp(part.value.pattern, part.value.flags);
        return true;
      }
      if (part.value.$type === guids.types.object) {
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
          if (node.instanceId === guids.ids.initialScope) {
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
//# sourceMappingURL=data:application/json;base64,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QUcsbUJBQW1CLEtBQW9CLENBQUM7QUFDM0MscUJBQUs7Ozs7Ozs7QUFIdkIsaUJBQU8sQ0FBQSxJQUFHLElBQUksQUFBQyxFQUFDLENBQUE7O0FBQ21CLElBQy9CLFFBQTZCLEtBQUcsQ0FBQyxDQUFDO0VBMFZsQyxDQTVWbUQ7QUE0Vm5ELEFBQ0osQ0FBQztBQUVELGNBQWMsZUFBZSxBQUFDLENBQUMsWUFBVyxDQUFDLENBQUM7QUFDNUMsY0FBYyxlQUFlLEFBQUMsQ0FBQyxlQUFjLENBQUMsQ0FBQztBQUMvQyxjQUFjLGVBQWUsQUFBQyxDQUFDLGFBQVksQ0FBQyxDQUFDO0FBQzdDLGNBQWMsZUFBZSxBQUFDLENBQUMsYUFBWSxDQUFDLENBQUM7QUFDN0MsY0FBYyxlQUFlLEFBQUMsQ0FBQyxtQkFBa0IsQ0FBQyxDQUFDO0FBQ25ELGNBQWMsZUFBZSxBQUFDLENBQUMsb0JBQW1CLENBQUMsQ0FBQztBQUVwRCxLQUFLLFFBQVEsRUFBSSxnQkFBYyxDQUFDO0FBQUEiLCJmaWxlIjoiYWN0aXZpdGllcy9zY29wZVNlcmlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xubGV0IGd1aWRzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9ndWlkc1wiKTtcbmxldCBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XG5sZXQgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5sZXQgaXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2lzXCIpO1xubGV0IFNjb3BlTm9kZSA9IHJlcXVpcmUoXCIuL3Njb3BlTm9kZVwiKTtcbmxldCBlcnJvcnMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2Vycm9yc1wiKTtcbmxldCBjb252ZXJ0ZXJzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9jb252ZXJ0ZXJzXCIpO1xubGV0IFNlcmlhbGl6ZXIgPSByZXF1aXJlKFwiYmFja3BhY2stbm9kZVwiKS5zeXN0ZW0uU2VyaWFsaXplcjtcblxubGV0IGFycmF5SGFuZGxlciA9IHtcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChzZXJpYWxpemVyLCBhY3Rpdml0eSwgZXhlY0NvbnRleHQsIGdldEFjdGl2aXR5QnlJZCwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcmVzdWx0KSB7XG4gICAgICAgIGxldCBzZXIgPSBudWxsO1xuICAgICAgICBpZiAoIXNlcmlhbGl6ZXIpIHtcbiAgICAgICAgICAgIHNlciA9IG5ldyBTZXJpYWxpemVyKCk7IC8vIEl0IHNob3VsZCBnZXQgc2VyaWFsaXplZCBpbnRlcm5hbGx5LlxuICAgICAgICB9XG4gICAgICAgIGlmIChfLmlzQXJyYXkocHJvcFZhbHVlKSkge1xuICAgICAgICAgICAgbGV0IHN0dWZmID0gW107XG4gICAgICAgICAgICBmb3IgKGxldCBwdiBvZiBwcm9wVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXMuYWN0aXZpdHkocHYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0dWZmLnB1c2goc3BlY1N0cmluZ3MuaG9zdGluZy5jcmVhdGVBY3Rpdml0eUluc3RhbmNlUGFydChwdi5nZXRJbnN0YW5jZUlkKGV4ZWNDb250ZXh0KSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZmYucHVzaChzZXIudG9KU09OKHB2KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVmZi5wdXNoKHB2KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gcHJvcE5hbWU7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBzdHVmZjtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoc2VyaWFsaXplciwgYWN0aXZpdHksIGdldEFjdGl2aXR5QnlJZCwgcGFydCwgcmVzdWx0KSB7XG4gICAgICAgIGxldCBzZXIgPSBudWxsO1xuICAgICAgICBpZiAoIXNlcmlhbGl6ZXIpIHtcbiAgICAgICAgICAgIHNlciA9IG5ldyBTZXJpYWxpemVyKCk7IC8vIEl0IHNob3VsZCBnZXQgc2VyaWFsaXplZCBpbnRlcm5hbGx5LlxuICAgICAgICB9XG4gICAgICAgIGlmIChfLmlzQXJyYXkocGFydC52YWx1ZSkpIHtcbiAgICAgICAgICAgIGxldCBzY29wZVBhcnRWYWx1ZSA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgcHYgb2YgcGFydC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGxldCBhY3Rpdml0eUlkID0gc3BlY1N0cmluZ3MuaG9zdGluZy5nZXRJbnN0YW5jZUlkKHB2KTtcbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZpdHlJZCkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZVBhcnRWYWx1ZS5wdXNoKGdldEFjdGl2aXR5QnlJZChhY3Rpdml0eUlkKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZVBhcnRWYWx1ZS5wdXNoKHNlci5mcm9tSlNPTihwdikpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGVQYXJ0VmFsdWUucHVzaChwdik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBzY29wZVBhcnRWYWx1ZTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuXG5sZXQgYWN0aXZpdHlIYW5kbGVyID0ge1xuICAgIHNlcmlhbGl6ZTogZnVuY3Rpb24gKHNlcmlhbGl6ZXIsIGFjdGl2aXR5LCBleGVjQ29udGV4dCwgZ2V0QWN0aXZpdHlCeUlkLCBwcm9wTmFtZSwgcHJvcFZhbHVlLCByZXN1bHQpIHtcbiAgICAgICAgaWYgKGlzLmFjdGl2aXR5KHByb3BWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gcHJvcE5hbWU7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmNyZWF0ZUFjdGl2aXR5SW5zdGFuY2VQYXJ0KHByb3BWYWx1ZS5nZXRJbnN0YW5jZUlkKGV4ZWNDb250ZXh0KSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBkZXNlcmlhbGl6ZTogZnVuY3Rpb24gKHNlcmlhbGl6ZXIsIGFjdGl2aXR5LCBnZXRBY3Rpdml0eUJ5SWQsIHBhcnQsIHJlc3VsdCkge1xuICAgICAgICBsZXQgYWN0aXZpdHlJZCA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuZ2V0SW5zdGFuY2VJZChwYXJ0LnZhbHVlKTtcbiAgICAgICAgaWYgKGFjdGl2aXR5SWQpIHtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGdldEFjdGl2aXR5QnlJZChhY3Rpdml0eUlkKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuXG5sZXQgcGFyZW50SGFuZGxlciA9IHtcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChzZXJpYWxpemVyLCBhY3Rpdml0eSwgZXhlY0NvbnRleHQsIGdldEFjdGl2aXR5QnlJZCwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcmVzdWx0KSB7XG4gICAgICAgIGlmIChwcm9wVmFsdWUgJiYgcHJvcFZhbHVlLl9fbWFya2VyID09PSBndWlkcy5tYXJrZXJzLiRwYXJlbnQpIHtcbiAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gcHJvcE5hbWU7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSB7fTtcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBvZiBwcm9wVmFsdWUuJGtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSBcIl9fbWFya2VyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnZhbHVlW2tleV0gPSBwcm9wVmFsdWVba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBkZXNlcmlhbGl6ZTogZnVuY3Rpb24gKHNlcmlhbGl6ZXIsIGFjdGl2aXR5LCBnZXRBY3Rpdml0eUJ5SWQsIHBhcnQsIHJlc3VsdCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufTtcblxubGV0IGFjdGl2aXR5UHJvcEhhbmRsZXIgPSB7XG4gICAgc2VyaWFsaXplOiBmdW5jdGlvbiAoc2VyaWFsaXplciwgYWN0aXZpdHksIGV4ZWNDb250ZXh0LCBnZXRBY3Rpdml0eUJ5SWQsIHByb3BOYW1lLCBwcm9wVmFsdWUsIHJlc3VsdCkge1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHByb3BWYWx1ZSkgJiYgIWFjdGl2aXR5Lmhhc093blByb3BlcnR5KHByb3BOYW1lKSAmJlxuICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGFjdGl2aXR5W3Byb3BOYW1lXSkpIHtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuY3JlYXRlQWN0aXZpdHlQcm9wZXJ0eVBhcnQocHJvcE5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoXy5pc09iamVjdChwcm9wVmFsdWUpICYmIHByb3BWYWx1ZSA9PT0gYWN0aXZpdHlbcHJvcE5hbWVdKSB7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmNyZWF0ZUFjdGl2aXR5UHJvcGVydHlQYXJ0KHByb3BOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoc2VyaWFsaXplciwgYWN0aXZpdHksIGdldEFjdGl2aXR5QnlJZCwgcGFydCwgcmVzdWx0KSB7XG4gICAgICAgIGxldCBhY3Rpdml0eVByb3BlcnR5ID0gc3BlY1N0cmluZ3MuaG9zdGluZy5nZXRBY3Rpdml0eVByb3BlcnR5TmFtZShwYXJ0KTtcbiAgICAgICAgaWYgKGFjdGl2aXR5UHJvcGVydHkpIHtcbiAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGFjdGl2aXR5W2FjdGl2aXR5UHJvcGVydHldKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuQWN0aXZpdHlSdW50aW1lRXJyb3IoXCJBY3Rpdml0eSBoYXMgbm8gcHJvcGVydHkgJ1wiICsgcGFydCArIFwiJy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IGFjdGl2aXR5UHJvcGVydHk7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBhY3Rpdml0eVthY3Rpdml0eVByb3BlcnR5XTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuXG5sZXQgZXJyb3JJbnN0YW5jZUhhbmRsZXIgPSB7XG4gICAgc2VyaWFsaXplOiBmdW5jdGlvbiAoc2VyaWFsaXplciwgYWN0aXZpdHksIGV4ZWNDb250ZXh0LCBnZXRBY3Rpdml0eUJ5SWQsIHByb3BOYW1lLCBwcm9wVmFsdWUsIHJlc3VsdCkge1xuICAgICAgICBpZiAocHJvcFZhbHVlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gcHJvcE5hbWU7XG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogZ3VpZHMudHlwZXMuZXJyb3IsXG4gICAgICAgICAgICAgICAgbmFtZTogcHJvcFZhbHVlLm5hbWUsXG4gICAgICAgICAgICAgICAgc3RhY2s6IHByb3BWYWx1ZS5zdGFja1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoc2VyaWFsaXplciwgYWN0aXZpdHksIGdldEFjdGl2aXR5QnlJZCwgcGFydCwgcmVzdWx0KSB7XG4gICAgICAgIGlmIChwYXJ0LnZhbHVlICYmIHBhcnQudmFsdWUudHlwZSA9PT0gZ3VpZHMudHlwZXMuZXJyb3IpIHtcbiAgICAgICAgICAgIGxldCBlcnJvck5hbWUgPSBwYXJ0LnZhbHVlLm5hbWU7XG4gICAgICAgICAgICBsZXQgRXJyb3JDb25zdHJ1Y3RvciA9IGdsb2JhbFtlcnJvck5hbWVdO1xuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihFcnJvckNvbnN0cnVjdG9yKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IG5ldyBFcnJvckNvbnN0cnVjdG9yKHBhcnQudmFsdWUuc3RhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gbmV3IEVycm9yKGBFcnJvcjogJHtlcnJvck5hbWV9IFN0YWNrOiAke3BhcnQudmFsdWUuc3RhY2t9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufTtcblxubGV0IG9iamVjdEhhbmRsZXIgPSB7XG4gICAgc2VyaWFsaXplOiBmdW5jdGlvbiAoc2VyaWFsaXplciwgYWN0aXZpdHksIGV4ZWNDb250ZXh0LCBnZXRBY3Rpdml0eUJ5SWQsIHByb3BOYW1lLCBwcm9wVmFsdWUsIHJlc3VsdCkge1xuICAgICAgICBpZiAoc2VyaWFsaXplcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBpdCdzIGhhbmRsZWQgZXh0ZXJuYWxseS5cbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvcE5hbWUgPT09IFwiX19zY2hlZHVsaW5nU3RhdGVcIikge1xuICAgICAgICAgICAgcmVzdWx0Lm5hbWUgPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IF8uY2xvbmUocHJvcFZhbHVlKTtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZS5pbmRpY2VzID0gY29udmVydGVycy5tYXBUb0FycmF5KHByb3BWYWx1ZS5pbmRpY2VzKTtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZS4kdHlwZSA9IGd1aWRzLnR5cGVzLnNjaGVkdWxpbmdTdGF0ZTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLmlzRGF0ZShwcm9wVmFsdWUpKSB7XG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0ge1xuICAgICAgICAgICAgICAgIHRpbWU6IHByb3BWYWx1ZS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgJHR5cGU6IGd1aWRzLnR5cGVzLmRhdGVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvcFZhbHVlIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0ge1xuICAgICAgICAgICAgICAgIGRhdGE6IGNvbnZlcnRlcnMubWFwVG9BcnJheShwcm9wVmFsdWUpLFxuICAgICAgICAgICAgICAgICR0eXBlOiBndWlkcy50eXBlcy5tYXBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvcFZhbHVlIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0ge1xuICAgICAgICAgICAgICAgIGRhdGE6IGNvbnZlcnRlcnMuc2V0VG9BcnJheShwcm9wVmFsdWUpLFxuICAgICAgICAgICAgICAgICR0eXBlOiBndWlkcy50eXBlcy5zZXRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvcFZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0ge1xuICAgICAgICAgICAgICAgIHBhdHRlcm46IHByb3BWYWx1ZS5wYXR0ZXJuLFxuICAgICAgICAgICAgICAgIGZsYWdzOiBwcm9wVmFsdWUuZmxhZ3MsXG4gICAgICAgICAgICAgICAgJHR5cGU6IGd1aWRzLnR5cGVzLnJleFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLmlzUGxhaW5PYmplY3QocHJvcFZhbHVlKSkge1xuICAgICAgICAgICAgcmVzdWx0Lm5hbWUgPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHtcbiAgICAgICAgICAgICAgICBkYXRhOiBuZXcgU2VyaWFsaXplcigpLnRvSlNPTihwcm9wVmFsdWUpLFxuICAgICAgICAgICAgICAgICR0eXBlOiBndWlkcy50eXBlcy5vYmplY3RcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBkZXNlcmlhbGl6ZTogZnVuY3Rpb24gKHNlcmlhbGl6ZXIsIGFjdGl2aXR5LCBnZXRBY3Rpdml0eUJ5SWQsIHBhcnQsIHJlc3VsdCkge1xuICAgICAgICBpZiAocGFydC52YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWUuJHR5cGUgPT09IGd1aWRzLnR5cGVzLnNjaGVkdWxpbmdTdGF0ZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IF8uY2xvbmUocGFydC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnZhbHVlLmluZGljZXMgPSBjb252ZXJ0ZXJzLmFycmF5VG9NYXAocGFydC52YWx1ZS5pbmRpY2VzKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVzdWx0LnZhbHVlLiR0eXBlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWUuJHR5cGUgPT09IGd1aWRzLnR5cGVzLmRhdGUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudmFsdWUgPSBuZXcgRGF0ZShwYXJ0LnZhbHVlLnRpbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWUuJHR5cGUgPT09IGd1aWRzLnR5cGVzLm1hcCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGNvbnZlcnRlcnMuYXJyYXlUb01hcChwYXJ0LnZhbHVlLmRhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWUuJHR5cGUgPT09IGd1aWRzLnR5cGVzLnNldCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGNvbnZlcnRlcnMuYXJyYXlUb1NldChwYXJ0LnZhbHVlLmRhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWUuJHR5cGUgPT09IGd1aWRzLnR5cGVzLnJleCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IG5ldyBSZWdFeHAocGFydC52YWx1ZS5wYXR0ZXJuLCBwYXJ0LnZhbHVlLmZsYWdzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJ0LnZhbHVlLiR0eXBlID09PSBndWlkcy50eXBlcy5vYmplY3QpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudmFsdWUgPSBuZXcgU2VyaWFsaXplcigpLmZyb21KU09OKHBhcnQudmFsdWUuZGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG5cbmxldCBzY29wZVNlcmlhbGl6ZXIgPSB7XG4gICAgaGFuZGxlcnM6IFtdLFxuICAgIGluc3RhbGxIYW5kbGVyOiBmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICB0aGlzLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgfSxcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChleGVjQ29udGV4dCwgZ2V0QWN0aXZpdHlCeUlkLCBlbmFibGVQcm9tb3Rpb25zLCBub2Rlcywgc2VyaWFsaXplcikge1xuICAgICAgICBsZXQgc3RhdGUgPSBbXTtcbiAgICAgICAgbGV0IHByb21vdGVkUHJvcGVydGllcyA9IGVuYWJsZVByb21vdGlvbnMgPyBuZXcgTWFwKCkgOiBudWxsO1xuXG4gICAgICAgIGZvciAobGV0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChub2RlLmluc3RhbmNlSWQgPT09IGd1aWRzLmlkcy5pbml0aWFsU2NvcGUpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2VJZDogbm9kZS5pbnN0YW5jZUlkLFxuICAgICAgICAgICAgICAgIHVzZXJJZDogbm9kZS51c2VySWQsXG4gICAgICAgICAgICAgICAgcGFyZW50SWQ6IG5vZGUucGFyZW50ID8gbm9kZS5wYXJlbnQuaW5zdGFuY2VJZCA6IG51bGwsXG4gICAgICAgICAgICAgICAgcGFydHM6IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsZXQgYWN0aXZpdHkgPSBnZXRBY3Rpdml0eUJ5SWQobm9kZS5pbnN0YW5jZUlkKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgcHJvcCBvZiBub2RlLnByb3BlcnRpZXMoKSkge1xuICAgICAgICAgICAgICAgIGlmICghYWN0aXZpdHkubm9uU2VyaWFsaXplZFByb3BlcnRpZXMuaGFzKHByb3AubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiB0aGlzLmhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0geyBuYW1lOiBudWxsLCB2YWx1ZTogbnVsbCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXIuc2VyaWFsaXplKHNlcmlhbGl6ZXIsIGFjdGl2aXR5LCBleGVjQ29udGV4dCwgZ2V0QWN0aXZpdHlCeUlkLCBwcm9wLm5hbWUsIHByb3AudmFsdWUsIHJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByb3AubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnRzLnB1c2gocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByb3AubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0YXRlLnB1c2goaXRlbSk7XG5cbiAgICAgICAgICAgIC8vIFByb21vdGlvbnM6XG4gICAgICAgICAgICBpZiAocHJvbW90ZWRQcm9wZXJ0aWVzICYmIGFjdGl2aXR5LnByb21vdGVkUHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHByb21vdGVkUHJvcE5hbWUgb2YgYWN0aXZpdHkucHJvbW90ZWRQcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwdiA9IG5vZGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9tb3RlZFByb3BOYW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHB2KSAmJiAhKGlzLmFjdGl2aXR5KHB2KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcm9tb3RlZEVudHJ5ID0gcHJvbW90ZWRQcm9wZXJ0aWVzLmdldChwcm9tb3RlZFByb3BOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGFuIEFjdGl2aXR5IElkIGdyZWF0ZXIgdGhhbiBvdGhlciwgdGhlbiB3ZSBjYW4gc3VyZSB0aGF0IG90aGVyIGJlbG93IG9yIGFmdGVyIGluIHRoZSB0cmVlLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQocHJvbW90ZWRFbnRyeSkgfHwgbm9kZS5pbnN0YW5jZUlkID4gcHJvbW90ZWRFbnRyeS5sZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb21vdGVkUHJvcGVydGllcy5zZXQocHJvbW90ZWRQcm9wTmFtZSwgeyBsZXZlbDogbm9kZS5pbnN0YW5jZUlkLCB2YWx1ZTogcHYgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYWN0dWFsUHJvbW90aW9ucyA9IG51bGw7XG4gICAgICAgIGlmIChwcm9tb3RlZFByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGFjdHVhbFByb21vdGlvbnMgPSB7fTtcbiAgICAgICAgICAgIGZvciAobGV0IGt2cCBvZiBwcm9tb3RlZFByb3BlcnRpZXMuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgYWN0dWFsUHJvbW90aW9uc1trdnBbMF1dID0ga3ZwWzFdLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgIHByb21vdGVkUHJvcGVydGllczogYWN0dWFsUHJvbW90aW9uc1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgZGVzZXJpYWxpemVOb2RlczogZnVuY3Rpb24qIChnZXRBY3Rpdml0eUJ5SWQsIGpzb24sIHNlcmlhbGl6ZXIpIHtcbiAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBqc29uKSB7XG4gICAgICAgICAgICBsZXQgc2NvcGVQYXJ0ID0ge307XG4gICAgICAgICAgICBsZXQgYWN0aXZpdHkgPSBnZXRBY3Rpdml0eUJ5SWQoaXRlbS5pbnN0YW5jZUlkKTtcbiAgICAgICAgICAgIGZvciAobGV0IHBhcnQgb2YgaXRlbS5wYXJ0cykge1xuICAgICAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiB0aGlzLmhhbmRsZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSB7IG5hbWU6IG51bGwsIHZhbHVlOiBudWxsIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyLmRlc2VyaWFsaXplKHNlcmlhbGl6ZXIsIGFjdGl2aXR5LCBnZXRBY3Rpdml0eUJ5SWQsIHBhcnQsIHJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlUGFydFtyZXN1bHQubmFtZSB8fCBwYXJ0Lm5hbWVdID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVQYXJ0W3BhcnQubmFtZV0gPSBwYXJ0LnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlpZWxkIG5ldyBTY29wZU5vZGUoaXRlbS5pbnN0YW5jZUlkLCBzY29wZVBhcnQsIGl0ZW0udXNlcklkKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbnNjb3BlU2VyaWFsaXplci5pbnN0YWxsSGFuZGxlcihhcnJheUhhbmRsZXIpO1xuc2NvcGVTZXJpYWxpemVyLmluc3RhbGxIYW5kbGVyKGFjdGl2aXR5SGFuZGxlcik7XG5zY29wZVNlcmlhbGl6ZXIuaW5zdGFsbEhhbmRsZXIocGFyZW50SGFuZGxlcik7XG5zY29wZVNlcmlhbGl6ZXIuaW5zdGFsbEhhbmRsZXIob2JqZWN0SGFuZGxlcik7XG5zY29wZVNlcmlhbGl6ZXIuaW5zdGFsbEhhbmRsZXIoYWN0aXZpdHlQcm9wSGFuZGxlcik7XG5zY29wZVNlcmlhbGl6ZXIuaW5zdGFsbEhhbmRsZXIoZXJyb3JJbnN0YW5jZUhhbmRsZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNjb3BlU2VyaWFsaXplcjsiXX0=
