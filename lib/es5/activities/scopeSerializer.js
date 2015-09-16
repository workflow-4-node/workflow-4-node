"use strict";
var guids = require("../common/guids");
var specStrings = require("../common/specStrings");
var _ = require("lodash");
var is = require("../common/is");
var ScopeNode = require("./scopeNode");
var errors = require("../common/errors");
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
  _serializeMap: function(map) {
    var items = [];
    var $__5 = true;
    var $__6 = false;
    var $__7 = undefined;
    try {
      for (var $__3 = void 0,
          $__2 = (map.entries())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
        var kvp = $__3.value;
        {
          items.push(kvp);
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
    return items;
  },
  _deserializeMap: function(arr) {
    var map = new Map();
    var $__5 = true;
    var $__6 = false;
    var $__7 = undefined;
    try {
      for (var $__3 = void 0,
          $__2 = (arr)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
        var kvp = $__3.value;
        {
          map.set(kvp[0], kvp[1]);
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
    return map;
  },
  serialize: function(activity, execContext, getActivityById, propName, propValue, result) {
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
  deserialize: function(activity, getActivityById, part, result) {
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
scopeSerializer.installHandler(builtInHandler);
scopeSerializer.installHandler(activityPropHandler);
scopeSerializer.installHandler(errorInstanceHandler);
module.exports = scopeSerializer;
//# sourceMappingURL=data:application/json;base64,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QUksQUFBQyxFQUFDLENBQUE7O0FBQ21CLElBQy9CLFFBQTZCLEtBQUcsQ0FBQyxDQUFDO0VBOFFsQyxDQWhSbUQ7QUFnUm5ELEFBQ0osQ0FBQztBQUVELGNBQWMsZUFBZSxBQUFDLENBQUMsWUFBVyxDQUFDLENBQUM7QUFDNUMsY0FBYyxlQUFlLEFBQUMsQ0FBQyxlQUFjLENBQUMsQ0FBQztBQUMvQyxjQUFjLGVBQWUsQUFBQyxDQUFDLGNBQWEsQ0FBQyxDQUFDO0FBQzlDLGNBQWMsZUFBZSxBQUFDLENBQUMsbUJBQWtCLENBQUMsQ0FBQztBQUNuRCxjQUFjLGVBQWUsQUFBQyxDQUFDLG9CQUFtQixDQUFDLENBQUM7QUFFcEQsS0FBSyxRQUFRLEVBQUksZ0JBQWMsQ0FBQztBQUFBIiwiZmlsZSI6ImFjdGl2aXRpZXMvc2NvcGVTZXJpYWxpemVyLmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcclxubGV0IGd1aWRzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9ndWlkc1wiKTtcclxubGV0IHNwZWNTdHJpbmdzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9zcGVjU3RyaW5nc1wiKTtcclxubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xyXG5sZXQgaXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2lzXCIpO1xyXG5sZXQgU2NvcGVOb2RlID0gcmVxdWlyZShcIi4vc2NvcGVOb2RlXCIpO1xyXG5sZXQgZXJyb3JzID0gcmVxdWlyZShcIi4uL2NvbW1vbi9lcnJvcnNcIik7XHJcblxyXG5sZXQgYXJyYXlIYW5kbGVyID0ge1xyXG4gICAgc2VyaWFsaXplOiBmdW5jdGlvbiAoYWN0aXZpdHksIGV4ZWNDb250ZXh0LCBnZXRBY3Rpdml0eUJ5SWQsIHByb3BOYW1lLCBwcm9wVmFsdWUsIHJlc3VsdCkge1xyXG4gICAgICAgIGlmIChfLmlzQXJyYXkocHJvcFZhbHVlKSkge1xyXG4gICAgICAgICAgICBsZXQgc3R1ZmYgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcHYgb2YgcHJvcFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXMuYWN0aXZpdHkocHYpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R1ZmYucHVzaChzcGVjU3RyaW5ncy5ob3N0aW5nLmNyZWF0ZUFjdGl2aXR5SW5zdGFuY2VQYXJ0KHB2LmdldEluc3RhbmNlSWQoZXhlY0NvbnRleHQpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHVmZi5wdXNoKHB2KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IHByb3BOYW1lO1xyXG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSBzdHVmZjtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBkZXNlcmlhbGl6ZTogZnVuY3Rpb24gKGFjdGl2aXR5LCBnZXRBY3Rpdml0eUJ5SWQsIHBhcnQsIHJlc3VsdCkge1xyXG4gICAgICAgIGlmIChfLmlzQXJyYXkocGFydC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgbGV0IHNjb3BlUGFydFZhbHVlID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHB2IG9mIHBhcnQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhY3Rpdml0eUlkID0gc3BlY1N0cmluZ3MuaG9zdGluZy5nZXRJbnN0YW5jZUlkKHB2KTtcclxuICAgICAgICAgICAgICAgIGlmIChhY3Rpdml0eUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVQYXJ0VmFsdWUucHVzaChnZXRBY3Rpdml0eUJ5SWQoYWN0aXZpdHlJZCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVQYXJ0VmFsdWUucHVzaChwdik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gc2NvcGVQYXJ0VmFsdWU7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5sZXQgYWN0aXZpdHlIYW5kbGVyID0ge1xyXG4gICAgc2VyaWFsaXplOiBmdW5jdGlvbiAoYWN0aXZpdHksIGV4ZWNDb250ZXh0LCBnZXRBY3Rpdml0eUJ5SWQsIHByb3BOYW1lLCBwcm9wVmFsdWUsIHJlc3VsdCkge1xyXG4gICAgICAgIGlmIChpcy5hY3Rpdml0eShwcm9wVmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gcHJvcE5hbWU7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuY3JlYXRlQWN0aXZpdHlJbnN0YW5jZVBhcnQocHJvcFZhbHVlLmdldEluc3RhbmNlSWQoZXhlY0NvbnRleHQpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcbiAgICBkZXNlcmlhbGl6ZTogZnVuY3Rpb24gKGFjdGl2aXR5LCBnZXRBY3Rpdml0eUJ5SWQsIHBhcnQsIHJlc3VsdCkge1xyXG4gICAgICAgIGxldCBhY3Rpdml0eUlkID0gc3BlY1N0cmluZ3MuaG9zdGluZy5nZXRJbnN0YW5jZUlkKHBhcnQudmFsdWUpO1xyXG4gICAgICAgIGlmIChhY3Rpdml0eUlkKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGdldEFjdGl2aXR5QnlJZChhY3Rpdml0eUlkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbmxldCBhY3Rpdml0eVByb3BIYW5kbGVyID0ge1xyXG4gICAgc2VyaWFsaXplOiBmdW5jdGlvbiAoYWN0aXZpdHksIGV4ZWNDb250ZXh0LCBnZXRBY3Rpdml0eUJ5SWQsIHByb3BOYW1lLCBwcm9wVmFsdWUsIHJlc3VsdCkge1xyXG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24ocHJvcFZhbHVlKSAmJiAhYWN0aXZpdHkuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpICYmXHJcbiAgICAgICAgICAgIF8uaXNGdW5jdGlvbihhY3Rpdml0eVtwcm9wTmFtZV0pKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuY3JlYXRlQWN0aXZpdHlQcm9wZXJ0eVBhcnQocHJvcE5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoXy5pc09iamVjdChwcm9wVmFsdWUpICYmIHByb3BWYWx1ZSA9PT0gYWN0aXZpdHlbcHJvcE5hbWVdKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHNwZWNTdHJpbmdzLmhvc3RpbmcuY3JlYXRlQWN0aXZpdHlQcm9wZXJ0eVBhcnQocHJvcE5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoYWN0aXZpdHksIGdldEFjdGl2aXR5QnlJZCwgcGFydCwgcmVzdWx0KSB7XHJcbiAgICAgICAgbGV0IGFjdGl2aXR5UHJvcGVydHkgPSBzcGVjU3RyaW5ncy5ob3N0aW5nLmdldEFjdGl2aXR5UHJvcGVydHlOYW1lKHBhcnQpO1xyXG4gICAgICAgIGlmIChhY3Rpdml0eVByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGFjdGl2aXR5W2FjdGl2aXR5UHJvcGVydHldKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5BY3Rpdml0eVJ1bnRpbWVFcnJvcihcIkFjdGl2aXR5IGhhcyBubyBwcm9wZXJ0eSAnXCIgKyBwYXJ0ICsgXCInLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IGFjdGl2aXR5UHJvcGVydHk7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IGFjdGl2aXR5W2FjdGl2aXR5UHJvcGVydHldO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxubGV0IGVycm9ySW5zdGFuY2VIYW5kbGVyID0ge1xyXG4gICAgc2VyaWFsaXplOiBmdW5jdGlvbiAoYWN0aXZpdHksIGV4ZWNDb250ZXh0LCBnZXRBY3Rpdml0eUJ5SWQsIHByb3BOYW1lLCBwcm9wVmFsdWUsIHJlc3VsdCkge1xyXG4gICAgICAgIGlmIChwcm9wVmFsdWUgaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgICAgICByZXN1bHQubmFtZSA9IHByb3BOYW1lO1xyXG4gICAgICAgICAgICByZXN1bHQudmFsdWUgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBndWlkcy50eXBlcy5lcnJvcixcclxuICAgICAgICAgICAgICAgIG5hbWU6IHByb3BWYWx1ZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgc3RhY2s6IHByb3BWYWx1ZS5zdGFja1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIGRlc2VyaWFsaXplOiBmdW5jdGlvbiAoYWN0aXZpdHksIGdldEFjdGl2aXR5QnlJZCwgcGFydCwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKHBhcnQudmFsdWUgJiYgcGFydC52YWx1ZS50eXBlID09PSBndWlkcy50eXBlcy5lcnJvcikge1xyXG4gICAgICAgICAgICBsZXQgZXJyb3JOYW1lID0gcGFydC52YWx1ZS5uYW1lO1xyXG4gICAgICAgICAgICBsZXQgRXJyb3JDb25zdHJ1Y3RvciA9IGdsb2JhbFtlcnJvck5hbWVdO1xyXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKEVycm9yQ29uc3RydWN0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQudmFsdWUgPSBuZXcgRXJyb3JDb25zdHJ1Y3RvcihwYXJ0LnZhbHVlLnN0YWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IG5ldyBFcnJvcihgRXJyb3I6ICR7ZXJyb3JOYW1lfSBTdGFjazogJHtwYXJ0LnZhbHVlLnN0YWNrfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5sZXQgYnVpbHRJbkhhbmRsZXIgPSB7XHJcbiAgICBfc2VyaWFsaXplTWFwOiBmdW5jdGlvbihtYXApIHtcclxuICAgICAgICBsZXQgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBrdnAgb2YgbWFwLmVudHJpZXMoKSkge1xyXG4gICAgICAgICAgICBpdGVtcy5wdXNoKGt2cCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpdGVtcztcclxuICAgIH0sXHJcbiAgICBfZGVzZXJpYWxpemVNYXA6IGZ1bmN0aW9uKGFycikge1xyXG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgZm9yIChsZXQga3ZwIG9mIGFycikge1xyXG4gICAgICAgICAgICBtYXAuc2V0KGt2cFswXSwga3ZwWzFdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hcDtcclxuICAgIH0sXHJcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChhY3Rpdml0eSwgZXhlY0NvbnRleHQsIGdldEFjdGl2aXR5QnlJZCwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKHByb3BOYW1lID09PSBcIl9fc2NoZWR1bGluZ1N0YXRlXCIpIHtcclxuICAgICAgICAgICAgcmVzdWx0Lm5hbWUgPSBwcm9wTmFtZTtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gXy5jbG9uZShwcm9wVmFsdWUpO1xyXG4gICAgICAgICAgICByZXN1bHQudmFsdWUuaW5kaWNlcyA9IHRoaXMuX3NlcmlhbGl6ZU1hcChwcm9wVmFsdWUuaW5kaWNlcyk7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZS5fX3R5cGUgPSBndWlkcy50eXBlcy5zY2hlZHVsaW5nU3RhdGU7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvcE5hbWUgPT09IFwiX19zdWJBY3Rpdml0eVNjaGVkdWxpbmdTdGF0ZVwiKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gcHJvcE5hbWU7XHJcbiAgICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IF8uY2xvbmUocHJvcFZhbHVlKTtcclxuICAgICAgICAgICAgcmVzdWx0LnZhbHVlLmFjdGl2aXRpZXNNYXAgPSB0aGlzLl9zZXJpYWxpemVNYXAocHJvcFZhbHVlLmFjdGl2aXRpZXNNYXApO1xyXG4gICAgICAgICAgICByZXN1bHQudmFsdWUuX190eXBlID0gZ3VpZHMudHlwZXMuc3ViQWN0aXZpdHlTY2hlZHVsaW5nU3RhdGU7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgZGVzZXJpYWxpemU6IGZ1bmN0aW9uIChhY3Rpdml0eSwgZ2V0QWN0aXZpdHlCeUlkLCBwYXJ0LCByZXN1bHQpIHtcclxuICAgICAgICBpZiAocGFydC52YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAocGFydC52YWx1ZS5fX3R5cGUgPT09IGd1aWRzLnR5cGVzLnNjaGVkdWxpbmdTdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gXy5jbG9uZShwYXJ0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZS5pbmRpY2VzID0gdGhpcy5fZGVzZXJpYWxpemVNYXAocGFydC52YWx1ZS5pbmRpY2VzKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXN1bHQudmFsdWUuX190eXBlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWUuX190eXBlID09PSBndWlkcy50eXBlcy5zdWJBY3Rpdml0eVNjaGVkdWxpbmdTdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnZhbHVlID0gXy5jbG9uZShwYXJ0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC52YWx1ZS5hY3Rpdml0aWVzTWFwID0gdGhpcy5fZGVzZXJpYWxpemVNYXAocGFydC52YWx1ZS5hY3Rpdml0aWVzTWFwKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXN1bHQudmFsdWUuX190eXBlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxubGV0IHNjb3BlU2VyaWFsaXplciA9IHtcclxuICAgIGhhbmRsZXJzOiBbXSxcclxuICAgIGluc3RhbGxIYW5kbGVyOiBmdW5jdGlvbiAoaGFuZGxlcikge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcclxuICAgIH0sXHJcbiAgICBzZXJpYWxpemU6IGZ1bmN0aW9uIChleGVjQ29udGV4dCwgZ2V0QWN0aXZpdHlCeUlkLCBlbmFibGVQcm9tb3Rpb25zLCBub2Rlcykge1xyXG4gICAgICAgIGxldCBzdGF0ZSA9IFtdO1xyXG4gICAgICAgIGxldCBwcm9tb3RlZFByb3BlcnRpZXMgPSBlbmFibGVQcm9tb3Rpb25zID8gbmV3IE1hcCgpIDogbnVsbDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBub2Rlcykge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5pbnN0YW5jZUlkID09PSBndWlkcy5pZHMuaW5pdGlhbFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZUlkOiBub2RlLmluc3RhbmNlSWQsXHJcbiAgICAgICAgICAgICAgICB1c2VySWQ6IG5vZGUudXNlcklkLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50SWQ6IG5vZGUucGFyZW50ID8gbm9kZS5wYXJlbnQuaW5zdGFuY2VJZCA6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBwYXJ0czogW11cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBhY3Rpdml0eSA9IGdldEFjdGl2aXR5QnlJZChub2RlLmluc3RhbmNlSWQpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcHJvcCBvZiBub2RlLnByb3BlcnRpZXMoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhY3Rpdml0eS5ub25TZXJpYWxpemVkUHJvcGVydGllcy5oYXMocHJvcC5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiB0aGlzLmhhbmRsZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSB7IG5hbWU6IG51bGwsIHZhbHVlOiBudWxsIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyLnNlcmlhbGl6ZShhY3Rpdml0eSwgZXhlY0NvbnRleHQsIGdldEFjdGl2aXR5QnlJZCwgcHJvcC5uYW1lLCBwcm9wLnZhbHVlLCByZXN1bHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnBhcnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcm9wLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQudmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucGFydHMucHVzaChyZXN1bHQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wYXJ0cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByb3AubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wLnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RhdGUucHVzaChpdGVtKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByb21vdGlvbnM6XHJcbiAgICAgICAgICAgIGlmIChwcm9tb3RlZFByb3BlcnRpZXMgJiYgYWN0aXZpdHkucHJvbW90ZWRQcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwcm9tb3RlZFByb3BOYW1lIG9mIGFjdGl2aXR5LnByb21vdGVkUHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwdiA9IG5vZGUuZ2V0UHJvcGVydHlWYWx1ZShwcm9tb3RlZFByb3BOYW1lLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQocHYpICYmICEoaXMuYWN0aXZpdHkocHYpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJvbW90ZWRFbnRyeSA9IHByb21vdGVkUHJvcGVydGllcy5nZXQocHJvbW90ZWRQcm9wTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGFuIEFjdGl2aXR5IElkIGdyZWF0ZXIgdGhhbiBvdGhlciwgdGhlbiB3ZSBjYW4gc3VyZSB0aGF0IG90aGVyIGJlbG93IG9yIGFmdGVyIGluIHRoZSB0cmVlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChwcm9tb3RlZEVudHJ5KSB8fCBub2RlLmluc3RhbmNlSWQgPiBwcm9tb3RlZEVudHJ5LmxldmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9tb3RlZFByb3BlcnRpZXMuc2V0KHByb21vdGVkUHJvcE5hbWUsIHsgbGV2ZWw6IG5vZGUuaW5zdGFuY2VJZCwgdmFsdWU6IHB2IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYWN0dWFsUHJvbW90aW9ucyA9IG51bGw7XHJcbiAgICAgICAgaWYgKHByb21vdGVkUHJvcGVydGllcykge1xyXG4gICAgICAgICAgICBhY3R1YWxQcm9tb3Rpb25zID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGt2cCBvZiBwcm9tb3RlZFByb3BlcnRpZXMuZW50cmllcygpKSB7XHJcbiAgICAgICAgICAgICAgICBhY3R1YWxQcm9tb3Rpb25zW2t2cFswXV0gPSBrdnBbMV0udmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcclxuICAgICAgICAgICAgcHJvbW90ZWRQcm9wZXJ0aWVzOiBhY3R1YWxQcm9tb3Rpb25zXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBkZXNlcmlhbGl6ZU5vZGVzOiBmdW5jdGlvbiogKGdldEFjdGl2aXR5QnlJZCwganNvbikge1xyXG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YganNvbikge1xyXG4gICAgICAgICAgICBsZXQgc2NvcGVQYXJ0ID0ge307XHJcbiAgICAgICAgICAgIGxldCBhY3Rpdml0eSA9IGdldEFjdGl2aXR5QnlJZChpdGVtLmluc3RhbmNlSWQpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwYXJ0IG9mIGl0ZW0ucGFydHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBoYW5kbGVyIG9mIHRoaXMuaGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0geyBuYW1lOiBudWxsLCB2YWx1ZTogbnVsbCB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyLmRlc2VyaWFsaXplKGFjdGl2aXR5LCBnZXRBY3Rpdml0eUJ5SWQsIHBhcnQsIHJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGVQYXJ0W3Jlc3VsdC5uYW1lIHx8IHBhcnQubmFtZV0gPSByZXN1bHQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZVBhcnRbcGFydC5uYW1lXSA9IHBhcnQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeWllbGQgbmV3IFNjb3BlTm9kZShpdGVtLmluc3RhbmNlSWQsIHNjb3BlUGFydCwgaXRlbS51c2VySWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbnNjb3BlU2VyaWFsaXplci5pbnN0YWxsSGFuZGxlcihhcnJheUhhbmRsZXIpO1xyXG5zY29wZVNlcmlhbGl6ZXIuaW5zdGFsbEhhbmRsZXIoYWN0aXZpdHlIYW5kbGVyKTtcclxuc2NvcGVTZXJpYWxpemVyLmluc3RhbGxIYW5kbGVyKGJ1aWx0SW5IYW5kbGVyKTtcclxuc2NvcGVTZXJpYWxpemVyLmluc3RhbGxIYW5kbGVyKGFjdGl2aXR5UHJvcEhhbmRsZXIpO1xyXG5zY29wZVNlcmlhbGl6ZXIuaW5zdGFsbEhhbmRsZXIoZXJyb3JJbnN0YW5jZUhhbmRsZXIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzY29wZVNlcmlhbGl6ZXI7Il19
