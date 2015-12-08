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

/* SERIALIZATION */
ScopeTree.prototype.getExecutionState = function (execContext, enablePromotions, serializer) {
    return scopeSerializer.serialize(execContext, this._getActivityById, enablePromotions, this._nodes.values(), serializer);
};

ScopeTree.prototype.setState = function (json, serializer) {
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
        // Create nodes:
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = scopeSerializer.deserializeNodes(this._getActivityById, json, serializer)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var node = _step.value;

                this._nodes.set(node.instanceId, node);
            }
            // Setup Tree:
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

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = json[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var item = _step2.value;

                this._nodes.get(item.instanceId).parent = this._nodes.get(item.parentId);
            }
            // Setup specials:
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

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = this._nodes.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var node = _step3.value;
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = node._keys[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var key = _step4.value;

                        var value = node.scopePart[key];
                        if (value && value.$type === constants.markers.$parent) {
                            var parentScope = scope.create(this, this._nodes.get(value.id), true);
                            parentScope.__marker = constants.markers.$parent;
                            node.scopePart[key] = parentScope;
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
    } catch (e) {
        throw new errors.WorkflowError("Cannot restore state tree, because data is corrupt. Inner error: " + e.stack);
    }
};
/* SERIALIZATION */

/* PROXY */

ScopeTree.prototype._getRealParent = function (currentNode) {
    var parent = currentNode.parent;
    if (currentNode.activity instanceof Expression) {
        parent = parent.parent;
    }
    return parent;
};

ScopeTree.prototype.hasProperty = function (currentNode, name) {
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
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = currentNode.walkToRoot()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var node = _step5.value;

            if (node.isPropertyExists(name)) {
                found = true;
                break;
            }
            if (node.userId === name) {
                found = true;
                break;
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

    return found;
};

ScopeTree.prototype.getValue = function (currentNode, name) {
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
    var value = undefined;
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = currentNode.walkToRoot()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var node = _step6.value;

            if (!_.isUndefined(value = node.getPropertyValue(name, canReturnPrivate))) {
                break;
            }
            if (node.userId === name && node !== currentNode) {
                value = scope.create(self, node);
                break;
            }
            canReturnPrivate = false;
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

    return value;
};

ScopeTree.prototype.setValue = function (currentNode, name, value, noWalk) {
    if (this.isOnInitial) {
        throw new Error("Cannot set property of the initial scope.");
    }

    var self = this;
    var canSetPrivate = true;
    var setDone = false;
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
        for (var _iterator7 = currentNode.walkToRoot(noWalk)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var node = _step7.value;

            if (node === self._initialNode) {
                break;
            }
            if (node.setPropertyValue(name, value, canSetPrivate)) {
                setDone = true;
                break;
            }
            canSetPrivate = false;
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

    if (!setDone) {
        currentNode.createPropertyWithValue(name, value);
    }

    return true;
};

ScopeTree.prototype.deleteProperty = function (currentNode, name, noWalk) {
    var self = this;
    var canDeletePrivate = true;
    var deleteDone = false;
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
        for (var _iterator8 = currentNode.walkToRoot(noWalk)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var node = _step8.value;

            if (node === self._initialNode) {
                break;
            }
            if (node.deleteProperty(name, canDeletePrivate)) {
                deleteDone = true;
                break;
            }
            canDeletePrivate = false;
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

    return deleteDone;
};

ScopeTree.prototype.enumeratePropertyNames = regeneratorRuntime.mark(function _callee(currentNode, noWalk) {
    var canEnumeratePrivate, node;
    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    canEnumeratePrivate = true;
                    node = currentNode;

                case 2:
                    _context.next = 4;
                    return "$parent";

                case 4:
                    _context.next = 6;
                    return "$activity";

                case 6:
                    if (!node.userId) {
                        _context.next = 9;
                        break;
                    }

                    _context.next = 9;
                    return node.userId;

                case 9:
                    return _context.delegateYield(node.enumeratePropertyNames(canEnumeratePrivate), "t0", 10);

                case 10:
                    canEnumeratePrivate = false;

                    if (!noWalk) {
                        _context.next = 13;
                        break;
                    }

                    return _context.abrupt("break", 15);

                case 13:

                    node = node.parent;

                case 14:
                    if (node) {
                        _context.next = 2;
                        break;
                    }

                case 15:
                case "end":
                    return _context.stop();
            }
        }
    }, _callee, this);
});
/* PROXY */

/* WALK */
ScopeTree.prototype.next = function (nodeInstanceId, childInstanceId, scopePart, childUserId) {
    var currentNode = this._getNodeByExternalId(nodeInstanceId);
    var nextNode = new ScopeNode(childInstanceId, scopePart, childUserId, this._getActivityById(childInstanceId));
    currentNode.addChild(nextNode);
    this._nodes.set(childInstanceId, nextNode);
    return scope.create(this, nextNode);
};

ScopeTree.prototype.back = function (nodeId, keepItem) {
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

ScopeTree.prototype.find = function (nodeId) {
    var currentNode = this._getNodeByExternalId(nodeId);
    return scope.create(this, currentNode);
};

ScopeTree.prototype.findPart = function (nodeId) {
    var currentNode = this._getNodeByExternalId(nodeId);
    if (currentNode !== this._initialNode) {
        return currentNode.scopePart;
    }
    return null;
};
/* WALK */

ScopeTree.prototype._getNodeByExternalId = function (id) {
    if (id === null) {
        return this._initialNode;
    }
    var node = this._nodes.get(id);
    if (!node) {
        throw new Error("Scope node for activity id '" + id + "' is not found.");
    }
    return node;
};

ScopeTree.prototype.deleteScopePart = function (currentNodeId, id) {
    var self = this;
    var currentNode = this._getNodeByExternalId(currentNodeId);
    var delNode = self._nodes.get(id);
    if (delNode) {
        if (delNode === self._initialNode) {
            throw new Error("Cannot delete the initial scope.");
        }
        var found = false;
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
            for (var _iterator9 = delNode.walkToRoot()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                var node = _step9.value;

                if (node === currentNode) {
                    found = true;
                    break;
                }
            }
        } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                    _iterator9.return();
                }
            } finally {
                if (_didIteratorError9) {
                    throw _iteratorError9;
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

ScopeTree.prototype._removeAllNodes = function (node) {
    var self = this;

    self._nodes.delete(node.instanceId);
    var _iteratorNormalCompletion10 = true;
    var _didIteratorError10 = false;
    var _iteratorError10 = undefined;

    try {
        for (var _iterator10 = node.children()[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var c = _step10.value;

            self._removeAllNodes(c);
        }
    } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion10 && _iterator10.return) {
                _iterator10.return();
            }
        } finally {
            if (_didIteratorError10) {
                throw _iteratorError10;
            }
        }
    }
};

module.exports = ScopeTree;
//# sourceMappingURL=scopeTree.js.map
