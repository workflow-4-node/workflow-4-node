"use strict";
var ScopeNode = require("./scopeNode");
var constants = require("../common/constants");
var _ = require("lodash");
var specStrings = require("../common/specStrings");
var errors = require("../common/errors");
var is = require("../common/is");
var scope = require("./scope");
var Expression = require("./expression");
var scopeSerializer = require("./scopeSerializer");
function ScopeTree(initialScope, getActivityByIdFunc) {
  this._initialNode = new ScopeNode(constants.ids.initialScope, initialScope);
  this._nodes = new Map();
  this._nodes.set(this._initialNode.instanceId, this._initialNode);
  this._getActivityById = getActivityByIdFunc;
}
ScopeTree.prototype.getExecutionState = function(execContext, enablePromotions, serializer) {
  return scopeSerializer.serialize(execContext, this._getActivityById, enablePromotions, this._nodes.values(), serializer);
};
ScopeTree.prototype.setState = function(json, serializer) {
  if (!_.isArray(json)) {
    throw new TypeError("Array argument expected.");
  }
  if (this._nodes.count !== 1) {
    var prev = this._nodes;
    this._nodes = new Map();
    this._nodes.set(constants.ids.initialScope, prev.get(constants.ids.initialScope));
    this._initialNode.clearChildren();
  }
  try {
    var $__3 = true;
    var $__4 = false;
    var $__5 = undefined;
    try {
      for (var $__1 = void 0,
          $__0 = (scopeSerializer.deserializeNodes(this._getActivityById, json, serializer))[Symbol.iterator](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
        var node = $__1.value;
        {
          this._nodes.set(node.instanceId, node);
        }
      }
    } catch ($__6) {
      $__4 = true;
      $__5 = $__6;
    } finally {
      try {
        if (!$__3 && $__0.return != null) {
          $__0.return();
        }
      } finally {
        if ($__4) {
          throw $__5;
        }
      }
    }
    var $__10 = true;
    var $__11 = false;
    var $__12 = undefined;
    try {
      for (var $__8 = void 0,
          $__7 = (json)[Symbol.iterator](); !($__10 = ($__8 = $__7.next()).done); $__10 = true) {
        var item = $__8.value;
        {
          this._nodes.get(item.instanceId).parent = this._nodes.get(item.parentId);
        }
      }
    } catch ($__13) {
      $__11 = true;
      $__12 = $__13;
    } finally {
      try {
        if (!$__10 && $__7.return != null) {
          $__7.return();
        }
      } finally {
        if ($__11) {
          throw $__12;
        }
      }
    }
    var $__24 = true;
    var $__25 = false;
    var $__26 = undefined;
    try {
      for (var $__22 = void 0,
          $__21 = (this._nodes.values())[Symbol.iterator](); !($__24 = ($__22 = $__21.next()).done); $__24 = true) {
        var node$__28 = $__22.value;
        {
          var $__17 = true;
          var $__18 = false;
          var $__19 = undefined;
          try {
            for (var $__15 = void 0,
                $__14 = (node$__28._keys)[Symbol.iterator](); !($__17 = ($__15 = $__14.next()).done); $__17 = true) {
              var key = $__15.value;
              {
                var value = node$__28.scopePart[key];
                if (value && value.$type === constants.markers.$parent) {
                  var parentScope = scope.create(this, this._nodes.get(value.id), true);
                  parentScope.__marker = constants.markers.$parent;
                  node$__28.scopePart[key] = parentScope;
                }
              }
            }
          } catch ($__20) {
            $__18 = true;
            $__19 = $__20;
          } finally {
            try {
              if (!$__17 && $__14.return != null) {
                $__14.return();
              }
            } finally {
              if ($__18) {
                throw $__19;
              }
            }
          }
        }
      }
    } catch ($__27) {
      $__25 = true;
      $__26 = $__27;
    } finally {
      try {
        if (!$__24 && $__21.return != null) {
          $__21.return();
        }
      } finally {
        if ($__25) {
          throw $__26;
        }
      }
    }
  } catch (e) {
    throw new errors.WorkflowError("Cannot restore state tree, because data is corrupt. Inner error: " + e.stack);
  }
};
ScopeTree.prototype._getRealParent = function(currentNode) {
  var parent = currentNode.parent;
  if (currentNode.activity instanceof Expression) {
    parent = parent.parent;
  }
  return parent;
};
ScopeTree.prototype.hasProperty = function(currentNode, name) {
  if (name === "$parent") {
    var parent = this._getRealParent(currentNode);
    if (parent && parent !== this._initialNode) {
      return !!parent;
    }
  }
  if (name === "$activity") {
    return true;
  }
  var found = false;
  var $__3 = true;
  var $__4 = false;
  var $__5 = undefined;
  try {
    for (var $__1 = void 0,
        $__0 = (currentNode.walkToRoot())[Symbol.iterator](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
      var node = $__1.value;
      {
        if (node.isPropertyExists(name)) {
          found = true;
          break;
        }
        if (node.userId === name) {
          found = true;
          break;
        }
      }
    }
  } catch ($__6) {
    $__4 = true;
    $__5 = $__6;
  } finally {
    try {
      if (!$__3 && $__0.return != null) {
        $__0.return();
      }
    } finally {
      if ($__4) {
        throw $__5;
      }
    }
  }
  return found;
};
ScopeTree.prototype.getValue = function(currentNode, name) {
  var self = this;
  if (name === "$parent") {
    var parent = this._getRealParent(currentNode);
    if (parent && parent !== this._initialNode) {
      var parentScope = scope.create(this, parent);
      parentScope.__marker = constants.markers.$parent;
      return parentScope;
    } else {
      return undefined;
    }
  }
  if (name === "$activity") {
    return currentNode.activity;
  }
  var canReturnPrivate = true;
  var value;
  var $__3 = true;
  var $__4 = false;
  var $__5 = undefined;
  try {
    for (var $__1 = void 0,
        $__0 = (currentNode.walkToRoot())[Symbol.iterator](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
      var node = $__1.value;
      {
        if (!_.isUndefined(value = node.getPropertyValue(name, canReturnPrivate))) {
          break;
        }
        if (node.userId === name && node !== currentNode) {
          value = scope.create(self, node);
          break;
        }
        canReturnPrivate = false;
      }
    }
  } catch ($__6) {
    $__4 = true;
    $__5 = $__6;
  } finally {
    try {
      if (!$__3 && $__0.return != null) {
        $__0.return();
      }
    } finally {
      if ($__4) {
        throw $__5;
      }
    }
  }
  return value;
};
ScopeTree.prototype.setValue = function(currentNode, name, value, noWalk) {
  if (this.isOnInitial) {
    throw new Error("Cannot set property of the initial scope.");
  }
  var self = this;
  var canSetPrivate = true;
  var setDone = false;
  var $__3 = true;
  var $__4 = false;
  var $__5 = undefined;
  try {
    for (var $__1 = void 0,
        $__0 = (currentNode.walkToRoot(noWalk))[Symbol.iterator](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
      var node = $__1.value;
      {
        if (node === self._initialNode) {
          break;
        }
        if (node.setPropertyValue(name, value, canSetPrivate)) {
          setDone = true;
          break;
        }
        canSetPrivate = false;
      }
    }
  } catch ($__6) {
    $__4 = true;
    $__5 = $__6;
  } finally {
    try {
      if (!$__3 && $__0.return != null) {
        $__0.return();
      }
    } finally {
      if ($__4) {
        throw $__5;
      }
    }
  }
  if (!setDone) {
    currentNode.createPropertyWithValue(name, value);
  }
  return true;
};
ScopeTree.prototype.deleteProperty = function(currentNode, name, noWalk) {
  var self = this;
  var canDeletePrivate = true;
  var deleteDone = false;
  var $__3 = true;
  var $__4 = false;
  var $__5 = undefined;
  try {
    for (var $__1 = void 0,
        $__0 = (currentNode.walkToRoot(noWalk))[Symbol.iterator](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
      var node = $__1.value;
      {
        if (node === self._initialNode) {
          break;
        }
        if (node.deleteProperty(name, canDeletePrivate)) {
          deleteDone = true;
          break;
        }
        canDeletePrivate = false;
      }
    }
  } catch ($__6) {
    $__4 = true;
    $__5 = $__6;
  } finally {
    try {
      if (!$__3 && $__0.return != null) {
        $__0.return();
      }
    } finally {
      if ($__4) {
        throw $__5;
      }
    }
  }
  return deleteDone;
};
ScopeTree.prototype.enumeratePropertyNames = $traceurRuntime.initGeneratorFunction(function $__29(currentNode, noWalk) {
  var canEnumeratePrivate,
      node,
      $__30,
      $__31;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          canEnumeratePrivate = true;
          node = currentNode;
          $ctx.state = 35;
          break;
        case 35:
          $ctx.state = 2;
          return "$parent";
        case 2:
          $ctx.maybeThrow();
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = 6;
          return "$activity";
        case 6:
          $ctx.maybeThrow();
          $ctx.state = 8;
          break;
        case 8:
          $ctx.state = (node.userId) ? 9 : 12;
          break;
        case 9:
          $ctx.state = 10;
          return node.userId;
        case 10:
          $ctx.maybeThrow();
          $ctx.state = 12;
          break;
        case 12:
          $__30 = $ctx.wrapYieldStar(node.enumeratePropertyNames(canEnumeratePrivate)[Symbol.iterator]());
          $ctx.sent = void 0;
          $ctx.action = 'next';
          $ctx.state = 25;
          break;
        case 25:
          $__31 = $__30[$ctx.action]($ctx.sentIgnoreThrow);
          $ctx.state = 22;
          break;
        case 22:
          $ctx.state = ($__31.done) ? 16 : 15;
          break;
        case 16:
          $ctx.sent = $__31.value;
          $ctx.state = 23;
          break;
        case 15:
          $ctx.state = 25;
          return $__31.value;
        case 23:
          canEnumeratePrivate = false;
          $ctx.state = 30;
          break;
        case 30:
          $ctx.state = (noWalk) ? -2 : 27;
          break;
        case 27:
          node = node.parent;
          $ctx.state = 32;
          break;
        case 32:
          $ctx.state = (node) ? 35 : -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__29, this);
});
ScopeTree.prototype.next = function(nodeInstanceId, childInstanceId, scopePart, childUserId) {
  var currentNode = this._getNodeByExternalId(nodeInstanceId);
  var nextNode = new ScopeNode(childInstanceId, scopePart, childUserId, this._getActivityById(childInstanceId));
  currentNode.addChild(nextNode);
  this._nodes.set(childInstanceId, nextNode);
  return scope.create(this, nextNode);
};
ScopeTree.prototype.back = function(nodeId, keepItem) {
  var currentNode = this._getNodeByExternalId(nodeId);
  if (currentNode === this._initialNode) {
    throw new Error("Cannot go back because current scope is the initial scope.");
  }
  var toRemove = currentNode;
  var goTo = toRemove.parent;
  currentNode = goTo;
  if (!keepItem) {
    goTo.removeChild(toRemove);
    this._nodes.delete(toRemove.instanceId);
  }
  return scope.create(this, currentNode);
};
ScopeTree.prototype.find = function(nodeId) {
  var currentNode = this._getNodeByExternalId(nodeId);
  return scope.create(this, currentNode);
};
ScopeTree.prototype.findPart = function(nodeId) {
  var currentNode = this._getNodeByExternalId(nodeId);
  if (currentNode !== this._initialNode) {
    return currentNode.scopePart;
  }
  return null;
};
ScopeTree.prototype._getNodeByExternalId = function(id) {
  if (id === null) {
    return this._initialNode;
  }
  var node = this._nodes.get(id);
  if (!node) {
    throw new Error("Scope node for activity id '" + id + "' is not found.");
  }
  return node;
};
ScopeTree.prototype.deleteScopePart = function(currentNodeId, id) {
  var self = this;
  var currentNode = this._getNodeByExternalId(currentNodeId);
  var delNode = self._nodes.get(id);
  if (delNode) {
    if (delNode === self._initialNode) {
      throw new Error("Cannot delete the initial scope.");
    }
    var found = false;
    var $__3 = true;
    var $__4 = false;
    var $__5 = undefined;
    try {
      for (var $__1 = void 0,
          $__0 = (delNode.walkToRoot())[Symbol.iterator](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
        var node = $__1.value;
        {
          if (node === currentNode) {
            found = true;
            break;
          }
        }
      }
    } catch ($__6) {
      $__4 = true;
      $__5 = $__6;
    } finally {
      try {
        if (!$__3 && $__0.return != null) {
          $__0.return();
        }
      } finally {
        if ($__4) {
          throw $__5;
        }
      }
    }
    if (!found) {
      throw new Error("Cannot delete scope, because current active scope is inside in it.");
    }
    delNode.parent.removeChild(delNode);
    self._removeAllNodes(delNode);
  }
};
ScopeTree.prototype._removeAllNodes = function(node) {
  var self = this;
  self._nodes.delete(node.instanceId);
  var $__3 = true;
  var $__4 = false;
  var $__5 = undefined;
  try {
    for (var $__1 = void 0,
        $__0 = (node.children())[Symbol.iterator](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
      var c = $__1.value;
      {
        self._removeAllNodes(c);
      }
    }
  } catch ($__6) {
    $__4 = true;
    $__5 = $__6;
  } finally {
    try {
      if (!$__3 && $__0.return != null) {
        $__0.return();
      }
    } finally {
      if ($__4) {
        throw $__5;
      }
    }
  }
};
module.exports = ScopeTree;

//# sourceMappingURL=scopeTree.js.map
