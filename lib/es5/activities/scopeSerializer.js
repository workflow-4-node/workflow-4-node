"use strict";
var guids = require("../common/guids");
var specStrings = require("../common/specStrings");
var _ = require("lodash");
var is = require("../common/is");
var ScopeNode = require("./scopeNode");
var errors = require("../common/errors");
var converters = require("../common/converters");
var arrayHandler = {
  serialize: function(activity, execContext, getActivityById, propName, propValue, result) {
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
              stuff.push(pv);
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
  deserialize: function(activity, getActivityById, part, result) {
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
              scopePartValue.push(pv);
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
  serialize: function(activity, execContext, getActivityById, propName, propValue, result) {
    if (is.activity(propValue)) {
      result.name = propName;
      result.value = specStrings.hosting.createActivityInstancePart(propValue.getInstanceId(execContext));
      return true;
    }
    return false;
  },
  deserialize: function(activity, getActivityById, part, result) {
    var activityId = specStrings.hosting.getInstanceId(part.value);
    if (activityId) {
      result.value = getActivityById(activityId);
      return true;
    }
    return false;
  }
};
var parentHandler = {
  serialize: function(activity, execContext, getActivityById, propName, propValue, result) {
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
  deserialize: function(activity, getActivityById, part, result) {
    return false;
  }
};
var activityPropHandler = {
  serialize: function(activity, execContext, getActivityById, propName, propValue, result) {
    if (_.isFunction(propValue) && !activity.hasOwnProperty(propName) && _.isFunction(activity[propName])) {
      result.value = specStrings.hosting.createActivityPropertyPart(propName);
      return true;
    } else if (_.isObject(propValue) && propValue === activity[propName]) {
      result.value = specStrings.hosting.createActivityPropertyPart(propName);
      return true;
    }
    return false;
  },
  deserialize: function(activity, getActivityById, part, result) {
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
  serialize: function(activity, execContext, getActivityById, propName, propValue, result) {
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
  deserialize: function(activity, getActivityById, part, result) {
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
var builtInHandler = {
  serialize: function(activity, execContext, getActivityById, propName, propValue, result) {
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
    return false;
  },
  deserialize: function(activity, getActivityById, part, result) {
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
    }
    return false;
  }
};
var scopeSerializer = {
  handlers: [],
  installHandler: function(handler) {
    this.handlers.push(handler);
  },
  serialize: function(execContext, getActivityById, enablePromotions, nodes) {
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
                        if (handler.serialize(activity, execContext, getActivityById, prop.name, prop.value, result)) {
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
  deserializeNodes: $traceurRuntime.initGeneratorFunction(function $__37(getActivityById, json) {
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
            $ctx.state = (handler.deserialize(activity, getActivityById, part, result)) ? 3 : 2;
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
scopeSerializer.installHandler(builtInHandler);
scopeSerializer.installHandler(activityPropHandler);
scopeSerializer.installHandler(errorInstanceHandler);
module.exports = scopeSerializer;
//# sourceMappingURL=data:application/json;base64,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QUFBQyxDQUFDLG1CQUFrQixDQUFDLENBQUM7QUFDbkQsY0FBYyxlQUFlLEFBQUMsQ0FBQyxvQkFBbUIsQ0FBQyxDQUFDO0FBRXBELEtBQUssUUFBUSxFQUFJLGdCQUFjLENBQUM7QUFBQSIsImZpbGUiOiJhY3Rpdml0aWVzL3Njb3BlU2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiJsaWIvZXM2Iiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XHJcbmxldCBndWlkcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZ3VpZHNcIik7XHJcbmxldCBzcGVjU3RyaW5ncyA9IHJlcXVpcmUoXCIuLi9jb21tb24vc3BlY1N0cmluZ3NcIik7XHJcbmxldCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcclxubGV0IGlzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9pc1wiKTtcclxubGV0IFNjb3BlTm9kZSA9IHJlcXVpcmUoXCIuL3Njb3BlTm9kZVwiKTtcclxubGV0IGVycm9ycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZXJyb3JzXCIpO1xyXG5sZXQgY29udmVydGVycyA9IHJlcXVpcmUoXCIuLi9jb21tb24vY29udmVydGVyc1wiKTtcclxuXHJcbmxldCBhcnJheUhhbmRsZXIgPSB7XHJcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChhY3Rpdml0eSwgZXhlY0NvbnRleHQsIGdldEFjdGl2aXR5QnlJZCwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKF8uaXNBcnJheShwcm9wVmFsdWUpKSB7XHJcbiAgICAgICAgICAgIGxldCBzdHVmZiA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwdiBvZiBwcm9wVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpcy5hY3Rpdml0eShwdikpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHVmZi5wdXNoKHNwZWNTdHJpbmdzLmhvc3RpbmcuY3JlYXRlQWN0aXZpdHlJbnN0YW5jZVBhcnQocHYuZ2V0SW5zdGFuY2VJZChleGVjQ29udGV4dCkpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0dWZmLnB1c2gocHYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gcHJvcE5hbWU7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHN0dWZmO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoYWN0aXZpdHksIGdldEFjdGl2aXR5QnlJZCwgcGFydCwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKF8uaXNBcnJheShwYXJ0LnZhbHVlKSkge1xyXG4gICAgICAgICAgICBsZXQgc2NvcGVQYXJ0VmFsdWUgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcHYgb2YgcGFydC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFjdGl2aXR5SWQgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmdldEluc3RhbmNlSWQocHYpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFjdGl2aXR5SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZVBhcnRWYWx1ZS5wdXNoKGdldEFjdGl2aXR5QnlJZChhY3Rpdml0eUlkKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZVBhcnRWYWx1ZS5wdXNoKHB2KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBzY29wZVBhcnRWYWx1ZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbmxldCBhY3Rpdml0eUhhbmRsZXIgPSB7XHJcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChhY3Rpdml0eSwgZXhlY0NvbnRleHQsIGdldEFjdGl2aXR5QnlJZCwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKGlzLmFjdGl2aXR5KHByb3BWYWx1ZSkpIHtcclxuICAgICAgICAgICAgcmVzdWx0Lm5hbWUgPSBwcm9wTmFtZTtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gc3BlY1N0cmluZ3MuaG9zdGluZy5jcmVhdGVBY3Rpdml0eUluc3RhbmNlUGFydChwcm9wVmFsdWUuZ2V0SW5zdGFuY2VJZChleGVjQ29udGV4dCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoYWN0aXZpdHksIGdldEFjdGl2aXR5QnlJZCwgcGFydCwgcmVzdWx0KSB7XHJcbiAgICAgICAgbGV0IGFjdGl2aXR5SWQgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmdldEluc3RhbmNlSWQocGFydC52YWx1ZSk7XHJcbiAgICAgICAgaWYgKGFjdGl2aXR5SWQpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gZ2V0QWN0aXZpdHlCeUlkKGFjdGl2aXR5SWQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxubGV0IHBhcmVudEhhbmRsZXIgPSB7XHJcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChhY3Rpdml0eSwgZXhlY0NvbnRleHQsIGdldEFjdGl2aXR5QnlJZCwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKHByb3BWYWx1ZSAmJiBwcm9wVmFsdWUuX19tYXJrZXIgPT09IGd1aWRzLm1hcmtlcnMuJHBhcmVudCkge1xyXG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IHByb3BOYW1lO1xyXG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSB7fTtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IG9mIHByb3BWYWx1ZS4ka2V5cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGtleSAhPT0gXCJfX21hcmtlclwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnZhbHVlW2tleV0gPSBwcm9wVmFsdWVba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoYWN0aXZpdHksIGdldEFjdGl2aXR5QnlJZCwgcGFydCwgcmVzdWx0KSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxubGV0IGFjdGl2aXR5UHJvcEhhbmRsZXIgPSB7XHJcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChhY3Rpdml0eSwgZXhlY0NvbnRleHQsIGdldEFjdGl2aXR5QnlJZCwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihwcm9wVmFsdWUpICYmICFhY3Rpdml0eS5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkgJiZcclxuICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGFjdGl2aXR5W3Byb3BOYW1lXSkpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gc3BlY1N0cmluZ3MuaG9zdGluZy5jcmVhdGVBY3Rpdml0eVByb3BlcnR5UGFydChwcm9wTmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChfLmlzT2JqZWN0KHByb3BWYWx1ZSkgJiYgcHJvcFZhbHVlID09PSBhY3Rpdml0eVtwcm9wTmFtZV0pIHtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gc3BlY1N0cmluZ3MuaG9zdGluZy5jcmVhdGVBY3Rpdml0eVByb3BlcnR5UGFydChwcm9wTmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgZGVzZXJpYWxpemU6IGZ1bmN0aW9uIChhY3Rpdml0eSwgZ2V0QWN0aXZpdHlCeUlkLCBwYXJ0LCByZXN1bHQpIHtcclxuICAgICAgICBsZXQgYWN0aXZpdHlQcm9wZXJ0eSA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuZ2V0QWN0aXZpdHlQcm9wZXJ0eU5hbWUocGFydCk7XHJcbiAgICAgICAgaWYgKGFjdGl2aXR5UHJvcGVydHkpIHtcclxuICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoYWN0aXZpdHlbYWN0aXZpdHlQcm9wZXJ0eV0pKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLkFjdGl2aXR5UnVudGltZUVycm9yKFwiQWN0aXZpdHkgaGFzIG5vIHByb3BlcnR5ICdcIiArIHBhcnQgKyBcIicuXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gYWN0aXZpdHlQcm9wZXJ0eTtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gYWN0aXZpdHlbYWN0aXZpdHlQcm9wZXJ0eV07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5sZXQgZXJyb3JJbnN0YW5jZUhhbmRsZXIgPSB7XHJcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChhY3Rpdml0eSwgZXhlY0NvbnRleHQsIGdldEFjdGl2aXR5QnlJZCwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKHByb3BWYWx1ZSBpbnN0YW5jZW9mIEVycm9yKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gcHJvcE5hbWU7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IGd1aWRzLnR5cGVzLmVycm9yLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogcHJvcFZhbHVlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBzdGFjazogcHJvcFZhbHVlLnN0YWNrXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgZGVzZXJpYWxpemU6IGZ1bmN0aW9uIChhY3Rpdml0eSwgZ2V0QWN0aXZpdHlCeUlkLCBwYXJ0LCByZXN1bHQpIHtcclxuICAgICAgICBpZiAocGFydC52YWx1ZSAmJiBwYXJ0LnZhbHVlLnR5cGUgPT09IGd1aWRzLnR5cGVzLmVycm9yKSB7XHJcbiAgICAgICAgICAgIGxldCBlcnJvck5hbWUgPSBwYXJ0LnZhbHVlLm5hbWU7XHJcbiAgICAgICAgICAgIGxldCBFcnJvckNvbnN0cnVjdG9yID0gZ2xvYmFsW2Vycm9yTmFtZV07XHJcbiAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24oRXJyb3JDb25zdHJ1Y3RvcikpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IG5ldyBFcnJvckNvbnN0cnVjdG9yKHBhcnQudmFsdWUuc3RhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gbmV3IEVycm9yKGBFcnJvcjogJHtlcnJvck5hbWV9IFN0YWNrOiAke3BhcnQudmFsdWUuc3RhY2t9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbmxldCBidWlsdEluSGFuZGxlciA9IHtcclxuICAgIHNlcmlhbGl6ZTogZnVuY3Rpb24gKGFjdGl2aXR5LCBleGVjQ29udGV4dCwgZ2V0QWN0aXZpdHlCeUlkLCBwcm9wTmFtZSwgcHJvcFZhbHVlLCByZXN1bHQpIHtcclxuICAgICAgICBpZiAocHJvcE5hbWUgPT09IFwiX19zY2hlZHVsaW5nU3RhdGVcIikge1xyXG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IHByb3BOYW1lO1xyXG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBfLmNsb25lKHByb3BWYWx1ZSk7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZS5pbmRpY2VzID0gY29udmVydGVycy5tYXBUb0FycmF5KHByb3BWYWx1ZS5pbmRpY2VzKTtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlLiR0eXBlID0gZ3VpZHMudHlwZXMuc2NoZWR1bGluZ1N0YXRlO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKF8uaXNEYXRlKHByb3BWYWx1ZSkpIHtcclxuICAgICAgICAgICAgcmVzdWx0Lm5hbWUgPSBwcm9wTmFtZTtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0ge1xyXG4gICAgICAgICAgICAgICAgdGltZTogcHJvcFZhbHVlLmdldFRpbWUoKSxcclxuICAgICAgICAgICAgICAgICR0eXBlOiBndWlkcy50eXBlcy5kYXRlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvcFZhbHVlIGluc3RhbmNlb2YgTWFwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gcHJvcE5hbWU7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IGNvbnZlcnRlcnMubWFwVG9BcnJheShwcm9wVmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgJHR5cGU6IGd1aWRzLnR5cGVzLm1hcFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb3BWYWx1ZSBpbnN0YW5jZW9mIFNldCkge1xyXG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IHByb3BOYW1lO1xyXG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBjb252ZXJ0ZXJzLnNldFRvQXJyYXkocHJvcFZhbHVlKSxcclxuICAgICAgICAgICAgICAgICR0eXBlOiBndWlkcy50eXBlcy5zZXRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9wVmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuICAgICAgICAgICAgcmVzdWx0Lm5hbWUgPSBwcm9wTmFtZTtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0ge1xyXG4gICAgICAgICAgICAgICAgcGF0dGVybjogcHJvcFZhbHVlLnBhdHRlcm4sXHJcbiAgICAgICAgICAgICAgICBmbGFnczogcHJvcFZhbHVlLmZsYWdzLFxyXG4gICAgICAgICAgICAgICAgJHR5cGU6IGd1aWRzLnR5cGVzLnJleFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoYWN0aXZpdHksIGdldEFjdGl2aXR5QnlJZCwgcGFydCwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKHBhcnQudmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWUuJHR5cGUgPT09IGd1aWRzLnR5cGVzLnNjaGVkdWxpbmdTdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gXy5jbG9uZShwYXJ0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZS5pbmRpY2VzID0gY29udmVydGVycy5hcnJheVRvTWFwKHBhcnQudmFsdWUuaW5kaWNlcyk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVzdWx0LnZhbHVlLiR0eXBlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWUuJHR5cGUgPT09IGd1aWRzLnR5cGVzLmRhdGUpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IG5ldyBEYXRlKHBhcnQudmFsdWUudGltZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGFydC52YWx1ZS4kdHlwZSA9PT0gZ3VpZHMudHlwZXMubWFwKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQudmFsdWUgPSBjb252ZXJ0ZXJzLmFycmF5VG9NYXAocGFydC52YWx1ZS5kYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwYXJ0LnZhbHVlLiR0eXBlID09PSBndWlkcy50eXBlcy5zZXQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGNvbnZlcnRlcnMuYXJyYXlUb1NldChwYXJ0LnZhbHVlLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWUuJHR5cGUgPT09IGd1aWRzLnR5cGVzLnJleCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gbmV3IFJlZ0V4cChwYXJ0LnZhbHVlLnBhdHRlcm4sIHBhcnQudmFsdWUuZmxhZ3MpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxubGV0IHNjb3BlU2VyaWFsaXplciA9IHtcclxuICAgIGhhbmRsZXJzOiBbXSxcclxuICAgIGluc3RhbGxIYW5kbGVyOiBmdW5jdGlvbiAoaGFuZGxlcikge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcclxuICAgIH0sXHJcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChleGVjQ29udGV4dCwgZ2V0QWN0aXZpdHlCeUlkLCBlbmFibGVQcm9tb3Rpb25zLCBub2Rlcykge1xyXG4gICAgICAgIGxldCBzdGF0ZSA9IFtdO1xyXG4gICAgICAgIGxldCBwcm9tb3RlZFByb3BlcnRpZXMgPSBlbmFibGVQcm9tb3Rpb25zID8gbmV3IE1hcCgpIDogbnVsbDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBub2Rlcykge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5pbnN0YW5jZUlkID09PSBndWlkcy5pZHMuaW5pdGlhbFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUlkOiBub2RlLmluc3RhbmNlSWQsXHJcbiAgICAgICAgICAgICAgICB1c2VySWQ6IG5vZGUudXNlcklkLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50SWQ6IG5vZGUucGFyZW50ID8gbm9kZS5wYXJlbnQuaW5zdGFuY2VJZCA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBwYXJ0czogW11cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBhY3Rpdml0eSA9IGdldEFjdGl2aXR5QnlJZChub2RlLmluc3RhbmNlSWQpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcHJvcCBvZiBub2RlLnByb3BlcnRpZXMoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhY3Rpdml0eS5ub25TZXJpYWxpemVkUHJvcGVydGllcy5oYXMocHJvcC5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiB0aGlzLmhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSB7IG5hbWU6IG51bGwsIHZhbHVlOiBudWxsIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyLnNlcmlhbGl6ZShhY3Rpdml0eSwgZXhlY0NvbnRleHQsIGdldEFjdGl2aXR5QnlJZCwgcHJvcC5uYW1lLCBwcm9wLnZhbHVlLCByZXN1bHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcm9wLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQudmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydHMucHVzaChyZXN1bHQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByb3AubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wLnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RhdGUucHVzaChpdGVtKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByb21vdGlvbnM6XHJcbiAgICAgICAgICAgIGlmIChwcm9tb3RlZFByb3BlcnRpZXMgJiYgYWN0aXZpdHkucHJvbW90ZWRQcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwcm9tb3RlZFByb3BOYW1lIG9mIGFjdGl2aXR5LnByb21vdGVkUHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwdiA9IG5vZGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9tb3RlZFByb3BOYW1lLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQocHYpICYmICEoaXMuYWN0aXZpdHkocHYpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJvbW90ZWRFbnRyeSA9IHByb21vdGVkUHJvcGVydGllcy5nZXQocHJvbW90ZWRQcm9wTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGFuIEFjdGl2aXR5IElkIGdyZWF0ZXIgdGhhbiBvdGhlciwgdGhlbiB3ZSBjYW4gc3VyZSB0aGF0IG90aGVyIGJlbG93IG9yIGFmdGVyIGluIHRoZSB0cmVlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChwcm9tb3RlZEVudHJ5KSB8fCBub2RlLmluc3RhbmNlSWQgPiBwcm9tb3RlZEVudHJ5LmxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9tb3RlZFByb3BlcnRpZXMuc2V0KHByb21vdGVkUHJvcE5hbWUsIHsgbGV2ZWw6IG5vZGUuaW5zdGFuY2VJZCwgdmFsdWU6IHB2IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYWN0dWFsUHJvbW90aW9ucyA9IG51bGw7XHJcbiAgICAgICAgaWYgKHByb21vdGVkUHJvcGVydGllcykge1xyXG4gICAgICAgICAgICBhY3R1YWxQcm9tb3Rpb25zID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGt2cCBvZiBwcm9tb3RlZFByb3BlcnRpZXMuZW50cmllcygpKSB7XHJcbiAgICAgICAgICAgICAgICBhY3R1YWxQcm9tb3Rpb25zW2t2cFswXV0gPSBrdnBbMV0udmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcclxuICAgICAgICAgICAgcHJvbW90ZWRQcm9wZXJ0aWVzOiBhY3R1YWxQcm9tb3Rpb25zXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBkZXNlcmlhbGl6ZU5vZGVzOiBmdW5jdGlvbiogKGdldEFjdGl2aXR5QnlJZCwganNvbikge1xyXG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YganNvbikge1xyXG4gICAgICAgICAgICBsZXQgc2NvcGVQYXJ0ID0ge307XHJcbiAgICAgICAgICAgIGxldCBhY3Rpdml0eSA9IGdldEFjdGl2aXR5QnlJZChpdGVtLmluc3RhbmNlSWQpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYXJ0IG9mIGl0ZW0ucGFydHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBoYW5kbGVyIG9mIHRoaXMuaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0geyBuYW1lOiBudWxsLCB2YWx1ZTogbnVsbCB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyLmRlc2VyaWFsaXplKGFjdGl2aXR5LCBnZXRBY3Rpdml0eUJ5SWQsIHBhcnQsIHJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGVQYXJ0W3Jlc3VsdC5uYW1lIHx8IHBhcnQubmFtZV0gPSByZXN1bHQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZVBhcnRbcGFydC5uYW1lXSA9IHBhcnQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeWllbGQgbmV3IFNjb3BlTm9kZShpdGVtLmluc3RhbmNlSWQsIHNjb3BlUGFydCwgaXRlbS51c2VySWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbnNjb3BlU2VyaWFsaXplci5pbnN0YWxsSGFuZGxlcihhcnJheUhhbmRsZXIpO1xyXG5zY29wZVNlcmlhbGl6ZXIuaW5zdGFsbEhhbmRsZXIoYWN0aXZpdHlIYW5kbGVyKTtcclxuc2NvcGVTZXJpYWxpemVyLmluc3RhbGxIYW5kbGVyKHBhcmVudEhhbmRsZXIpO1xyXG5zY29wZVNlcmlhbGl6ZXIuaW5zdGFsbEhhbmRsZXIoYnVpbHRJbkhhbmRsZXIpO1xyXG5zY29wZVNlcmlhbGl6ZXIuaW5zdGFsbEhhbmRsZXIoYWN0aXZpdHlQcm9wSGFuZGxlcik7XHJcbnNjb3BlU2VyaWFsaXplci5pbnN0YWxsSGFuZGxlcihlcnJvckluc3RhbmNlSGFuZGxlcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNjb3BlU2VyaWFsaXplcjsiXX0=
