"use strict";

var specStrings = require("../common/specStrings");
var is = require("../common/is");

function InstIdPaths() {
    this._map = new Map();
}

InstIdPaths.prototype.add = function (workflowName, methodName, instanceIdPath) {
    var key = specStrings.hosting.doubleKeys(workflowName, methodName);
    var inner = this._map.get(key);
    if (!inner) {
        inner = new Map();
        this._map.set(key, inner);
    }
    var count = inner.get(instanceIdPath) || 0;
    inner.set(instanceIdPath, count + 1);
};

InstIdPaths.prototype.remove = function (workflowName, methodName, instanceIdPath) {
    var key = specStrings.hosting.doubleKeys(workflowName, methodName);
    var inner = this._map.get(key);
    if (inner) {
        var count = inner.get(instanceIdPath);
        if (!_.isUndefined(count)) {
            if (count === 1) {
                this._map.delete(key);
            } else {
                inner.set(instanceIdPath, count - 1);
            }
        }
    }
    return false;
};

InstIdPaths.prototype.items = regeneratorRuntime.mark(function _callee(workflowName, methodName) {
    var key, inner, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, ik;

    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    key = specStrings.hosting.doubleKeys(workflowName, methodName);
                    inner = this._map.get(key);

                    if (!inner) {
                        _context.next = 29;
                        break;
                    }

                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context.prev = 6;
                    _iterator = inner.keys()[Symbol.iterator]();

                case 8:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context.next = 15;
                        break;
                    }

                    ik = _step.value;
                    _context.next = 12;
                    return ik;

                case 12:
                    _iteratorNormalCompletion = true;
                    _context.next = 8;
                    break;

                case 15:
                    _context.next = 21;
                    break;

                case 17:
                    _context.prev = 17;
                    _context.t0 = _context["catch"](6);
                    _didIteratorError = true;
                    _iteratorError = _context.t0;

                case 21:
                    _context.prev = 21;
                    _context.prev = 22;

                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }

                case 24:
                    _context.prev = 24;

                    if (!_didIteratorError) {
                        _context.next = 27;
                        break;
                    }

                    throw _iteratorError;

                case 27:
                    return _context.finish(24);

                case 28:
                    return _context.finish(21);

                case 29:
                case "end":
                    return _context.stop();
            }
        }
    }, _callee, this, [[6, 17, 21, 29], [22,, 24, 28]]);
});

module.exports = InstIdPaths;
//# sourceMappingURL=instIdPaths.js.map
