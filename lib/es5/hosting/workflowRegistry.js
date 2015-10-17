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
WorkflowRegistry.prototype.register = function(workflow, deprecated) {
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
    var desc;
    if (entry) {
      desc = entry.get(version);
      if (desc) {
        throw new Error("Workflow " + name + " (" + version + ") already registered.");
      } else {
        if (!deprecated) {
          var $__4 = true;
          var $__5 = false;
          var $__6 = undefined;
          try {
            for (var $__2 = void 0,
                $__1 = (entry.values())[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
              desc = $__2.value;
              {
                if (!desc.deprecated) {
                  throw new Error("Workflow " + name + " (" + version + ") has an already registered undeprecated version.");
                }
              }
            }
          } catch ($__7) {
            $__5 = true;
            $__6 = $__7;
          } finally {
            try {
              if (!$__4 && $__1.return != null) {
                $__1.return();
              }
            } finally {
              if ($__5) {
                throw $__6;
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
WorkflowRegistry.prototype.getDesc = function(name, version) {
  var entry = this._workflows.get(name);
  if (entry) {
    if (!_.isUndefined(version)) {
      var desc = entry.get(version);
      if (desc) {
        return desc;
      }
      throw new Error("Workflow " + name + " of version " + version + " has not been registered.");
    } else {
      var desc$__15 = null;
      var $__4 = true;
      var $__5 = false;
      var $__6 = undefined;
      try {
        for (var $__2 = void 0,
            $__1 = (entry.values())[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
          var d = $__2.value;
          {
            if (!d.deprecated) {
              desc$__15 = d;
              break;
            }
          }
        }
      } catch ($__7) {
        $__5 = true;
        $__6 = $__7;
      } finally {
        try {
          if (!$__4 && $__1.return != null) {
            $__1.return();
          }
        } finally {
          if ($__5) {
            throw $__6;
          }
        }
      }
      if (desc$__15) {
        return desc$__15;
      }
      throw new Error("Workflow " + name + " hasn't got an undeprecated version registered.");
    }
  }
};
WorkflowRegistry.prototype.getCurrentVersion = function(workflowName) {
  var result = [];
  var entry = this._workflows.get(workflowName);
  if (entry) {
    var desc = null;
    var $__4 = true;
    var $__5 = false;
    var $__6 = undefined;
    try {
      for (var $__2 = void 0,
          $__1 = (entry.values())[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
        var d = $__2.value;
        {
          if (!d.deprecated) {
            desc = d;
            break;
          }
        }
      }
    } catch ($__7) {
      $__5 = true;
      $__6 = $__7;
    } finally {
      try {
        if (!$__4 && $__1.return != null) {
          $__1.return();
        }
      } finally {
        if ($__5) {
          throw $__6;
        }
      }
    }
    if (desc) {
      return desc.version;
    }
  }
  return null;
};
WorkflowRegistry.prototype._createDesc = function(execContext, name, version, deprecated) {
  return {
    execContext: execContext,
    name: name,
    version: version,
    methods: this._collectMethodInfos(execContext, version),
    deprecated: deprecated
  };
};
WorkflowRegistry.prototype._collectMethodInfos = function(execContext, version) {
  var self = this;
  var infos = new Map();
  var workflow = execContext.rootActivity;
  var $__4 = true;
  var $__5 = false;
  var $__6 = undefined;
  try {
    for (var $__2 = void 0,
        $__1 = (workflow.children(execContext))[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
      var child = $__2.value;
      {
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
    }
  } catch ($__7) {
    $__5 = true;
    $__6 = $__7;
  } finally {
    try {
      if (!$__4 && $__1.return != null) {
        $__1.return();
      }
    } finally {
      if ($__5) {
        throw $__6;
      }
    }
  }
  var result = new Map();
  var $__11 = true;
  var $__12 = false;
  var $__13 = undefined;
  try {
    for (var $__9 = void 0,
        $__8 = (infos.entries())[Symbol.iterator](); !($__11 = ($__9 = $__8.next()).done); $__11 = true) {
      var kvp = $__9.value;
      {
        if (kvp[1].instanceIdPath) {
          result.set(kvp[0], kvp[1]);
        }
      }
    }
  } catch ($__14) {
    $__12 = true;
    $__13 = $__14;
  } finally {
    try {
      if (!$__11 && $__8.return != null) {
        $__8.return();
      }
    } finally {
      if ($__12) {
        throw $__13;
      }
    }
  }
  return result;
};
WorkflowRegistry.prototype.methodInfos = $traceurRuntime.initGeneratorFunction(function $__16(workflowName, methodName) {
  var entry,
      $__4,
      $__5,
      $__6,
      $__2,
      $__1,
      desc,
      info,
      $__7;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          entry = this._workflows.get(workflowName);
          $ctx.state = 30;
          break;
        case 30:
          $ctx.state = (entry) ? 26 : -2;
          break;
        case 26:
          $__4 = true;
          $__5 = false;
          $__6 = undefined;
          $ctx.state = 27;
          break;
        case 27:
          $ctx.pushTry(13, 14);
          $ctx.state = 16;
          break;
        case 16:
          $__2 = void 0, $__1 = (entry.values())[Symbol.iterator]();
          $ctx.state = 12;
          break;
        case 12:
          $ctx.state = (!($__4 = ($__2 = $__1.next()).done)) ? 8 : 10;
          break;
        case 4:
          $__4 = true;
          $ctx.state = 12;
          break;
        case 8:
          desc = $__2.value;
          $ctx.state = 9;
          break;
        case 9:
          info = desc.methods.get(methodName);
          $ctx.state = 7;
          break;
        case 7:
          $ctx.state = (info) ? 1 : 4;
          break;
        case 1:
          $ctx.state = 2;
          return info;
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 10:
          $ctx.popTry();
          $ctx.state = 14;
          $ctx.finallyFallThrough = -2;
          break;
        case 13:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          $__7 = $ctx.storedException;
          $ctx.state = 19;
          break;
        case 19:
          $__5 = true;
          $__6 = $__7;
          $ctx.state = 14;
          $ctx.finallyFallThrough = -2;
          break;
        case 14:
          $ctx.popTry();
          $ctx.state = 25;
          break;
        case 25:
          try {
            if (!$__4 && $__1.return != null) {
              $__1.return();
            }
          } finally {
            if ($__5) {
              throw $__6;
            }
          }
          $ctx.state = 23;
          break;
        case 23:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__16, this);
});
WorkflowRegistry.prototype._computeVersion = function(execContext) {
  var self = this;
  var workflow = execContext.rootActivity;
  var sha = crypto.createHash("sha256");
  function add(value) {
    if (!_.isNull(value)) {
      value = self._serializer.stringify(value);
      sha.update(value);
    }
  }
  var $__11 = true;
  var $__12 = false;
  var $__13 = undefined;
  try {
    for (var $__9 = void 0,
        $__8 = (workflow.all(execContext))[Symbol.iterator](); !($__11 = ($__9 = $__8.next()).done); $__11 = true) {
      var activity = $__9.value;
      {
        var alias = activityMarkup.getAlias(activity);
        assert(alias);
        add(alias);
        for (var key = void 0 in activity) {
          if (activity.hasOwnProperty(key) && !activity.nonScopedProperties.has(key) && !activity.nonSerializedProperties.has(key)) {
            var value = activity[key];
            if (!is.activity(value)) {
              if (_.isArray(value)) {
                var $__4 = true;
                var $__5 = false;
                var $__6 = undefined;
                try {
                  for (var $__2 = void 0,
                      $__1 = (value)[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
                    var item = $__2.value;
                    {
                      if (!is.activity(item)) {
                        add(value);
                      }
                    }
                  }
                } catch ($__7) {
                  $__5 = true;
                  $__6 = $__7;
                } finally {
                  try {
                    if (!$__4 && $__1.return != null) {
                      $__1.return();
                    }
                  } finally {
                    if ($__5) {
                      throw $__6;
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
    }
  } catch ($__14) {
    $__12 = true;
    $__13 = $__14;
  } finally {
    try {
      if (!$__11 && $__8.return != null) {
        $__8.return();
      }
    } finally {
      if ($__12) {
        throw $__13;
      }
    }
  }
  return sha.digest("hex");
};
module.exports = WorkflowRegistry;

//# sourceMappingURL=workflowRegistry.js.map
