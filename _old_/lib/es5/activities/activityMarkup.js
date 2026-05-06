"use strict"

/* jshint -W061 */

;
var _ = require("lodash");
var errors = require("../common/errors");
var Activity = require("./activity");
var is = require("../common/is");
var path = require("path");
var fs = require("fs");
var Reflection = require("backpack-node").system.Reflection;
var templateHelpers = require('./templateHelpers');

var activityTypeNameRex = /^\@([a-zA-Z_]+[0-9a-zA-Z_]*)$/;
function getActivityTypeName(str) {
    if (_.isString(str)) {
        var result = activityTypeNameRex.exec(str);
        if (result && result.length === 2) {
            return result[1];
        }
    }
    return null;
}

function requireFromRoot(resource) {
    try {
        return require(resource);
    } catch (e) {
        _.noop(e);
    }
    var pPos = resource.indexOf("/");
    if (pPos === -1) {
        return require(resource);
    }
    var module = resource.substr(0, pPos);
    if (!module) {
        return require(resource);
    }
    try {
        module = require(module);
        var obj = module;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = resource.substr(pPos + 1).split("/")[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var key = _step.value;

                obj = obj[key];
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

        return obj;
    } catch (e) {
        return require(resource);
    }
}

function ActivityMarkup() {
    this._systemTypes = new Map();
    this._registerSystemTypes();
}

ActivityMarkup.prototype._registerSystemTypes = function () {
    this._registerTypes(__dirname);
};

ActivityMarkup.prototype._registerTypes = function (sourcePath) {
    this._registerTypesTo(this._systemTypes, sourcePath);
};

ActivityMarkup.prototype._registerTypesTo = function (types, sourcePath) {
    var self = this;
    var obj = requireFromRoot(sourcePath);
    Reflection.visitObject(obj, function (inObj) {
        var alias = self.getAlias(inObj);
        if (alias && !types.has(alias)) {
            // This is an activity type
            types.set(alias, inObj);
        }
        return alias === null;
    });
};

ActivityMarkup.prototype.getAlias = function (type) {
    if (_.isFunction(type) && !_.isUndefined(type.super_)) {
        var alias = this._toCamelCase(type.name);
        do {
            if (type.super_ === Activity) {
                return alias;
            }
            type = type.super_;
        } while (type);
    }
    return null;
};

ActivityMarkup.prototype._toCamelCase = function (id) {
    return id[0].toLowerCase() + id.substr(1);
};

ActivityMarkup.prototype.parse = function (markup) {
    if (!markup) {
        throw new TypeError("Parameter 'markup' expected.");
    }
    if (_.isString(markup)) {
        markup = JSON.parse(markup);
    }
    if (!_.isPlainObject(markup)) {
        throw new TypeError("Parameter 'markup' is not a plain object.");
    }

    var types = new Map();
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = this._systemTypes.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var kvp = _step2.value;

            types.set(kvp[0], kvp[1]);
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

    var req = markup["@require"];
    if (req) {
        this._require(types, req);
    }
    var activity = this._createActivity(types, markup);
    if (req) {
        activity["@require"] = req;
    }
    return activity;
};

ActivityMarkup.prototype._createActivity = function (types, markup) {
    var filedNames = _.filter(_.keys(markup), function (k) {
        return k !== "@require";
    });
    if (filedNames.length !== 1) {
        throw new errors.ActivityMarkupError("There should be one field." + this._errorHint(markup));
    }

    var activityAlias = getActivityTypeName(filedNames[0]);
    if (activityAlias) {
        return this._createAndInitActivityInstance(types, activityAlias, markup);
    } else {
        throw new errors.ActivityMarkupError("Root entry is not an activity type name '" + filedNames[0] + "'." + this._errorHint(markup));
    }
};

ActivityMarkup.prototype._createAndInitActivityInstance = function (types, typeName, markup) {
    var activity = this._createActivityInstance(types, typeName);
    if (!activity) {
        throw new errors.ActivityMarkupError("Unknown activity type name '" + typeName + "'." + this._errorHint(markup));
    }
    var activityRef = {
        name: typeName,
        value: activity
    };
    var pars = markup["@" + typeName];
    if (pars) {
        this._setupActivity(types, activityRef, pars);
    }
    return activityRef.value;
};

ActivityMarkup.prototype._createActivityInstance = function (types, alias) {
    var Constructor = types.get(alias);
    if (_.isUndefined(Constructor)) {
        return null;
    }
    return new Constructor();
};

ActivityMarkup.prototype._setupActivity = function (types, activityRef, pars) {
    var self = this;
    var activity = activityRef.value;

    function noFunction(fieldName) {
        return activity.codeProperties.has(fieldName);
    }

    if (_.isArray(pars)) {
        // args
        activity.args = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = pars[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var obj = _step3.value;

                activity.args.push(self._createValue(types, obj, false, is.template(activity)));
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
    } else if (_.isObject(pars)) {
        var to = null;
        // values
        for (var fieldName in pars) {
            if (pars.hasOwnProperty(fieldName)) {
                if (activity.isArrayProperty(fieldName)) {
                    var v = self._createValue(types, pars[fieldName], true, is.template(activity));
                    if (!_.isArray(v)) {
                        v = [v];
                    }
                    activity[fieldName] = v;
                } else if (fieldName === "@to") {
                    if (to) {
                        throw new errors.ActivityMarkupError("Multiple to defined in activity '" + activityRef.name + "." + this._errorHint(pars));
                    }
                    to = pars[fieldName];
                } else if (fieldName[0] === "!") {
                    // Promoted:
                    if (!activity.promotedProperties || !_.isFunction(activity.promoted)) {
                        throw new errors.ActivityMarkupError("Activity '" + activityRef.name + " cannot have promoted properties." + this._errorHint(pars));
                    }
                    activity.promoted(fieldName.substr(1), self._createValue(types, pars[fieldName], true, is.template(activity)));
                } else if (fieldName[0] === "`") {
                    // Reserved:
                    if (!activity.reservedProperties || !_.isFunction(activity.reserved)) {
                        throw new errors.ActivityMarkupError("Activity '" + activityRef.name + " cannot have reserved properties." + this._errorHint(pars));
                    }
                    activity.reserved(fieldName.substr(1), self._createValue(types, pars[fieldName], true, is.template(activity)));
                } else if (fieldName === "@require") {
                    // Require:
                    self._require(types, pars[fieldName]);
                } else {
                    activity[fieldName] = self._createValue(types, pars[fieldName], false, is.template(activity), noFunction(fieldName));
                }
            }
        }
        if (to) {
            var current = activity;
            var assign = activityRef.value = this._createActivityInstance(types, "assign");
            assign.value = current;
            assign.to = to;
        }
    } else {
        // 1 arg
        activity.args = [self._createValue(types, pars, false, is.template(activity))];
    }
};

ActivityMarkup.prototype._require = function (types, markup) {
    var self = this;

    if (_.isArray(markup)) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = markup[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var item = _step4.value;

                self._require(types, item);
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
    } else if (_.isString(markup)) {
        self._registerTypesTo(types, markup);
    } else {
        throw new errors.ActivityMarkupError("Cannot register '" + markup + "'." + self._errorHint(markup));
    }
};

ActivityMarkup.prototype._createValue = function (types, markup, canBeArray, noTemplate, noFunction) {
    var self = this;

    // Helpers
    function toTemplate(_markup) {
        var template = self._createActivityInstance(types, "template");
        template.declare = _markup;
        return template;
    }

    function toFunc(f) {
        var func = self._createActivityInstance(types, "func");
        func.code = f;
        return func;
    }

    function toExpression(str) {
        var expr = self._createActivityInstance(types, "expression");
        expr.expr = str;
        return expr;
    }

    if (_.isArray(markup)) {
        if (canBeArray) {
            var result = [];
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = markup[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var v = _step5.value;

                    result.push(self._createValue(types, v));
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

            return result;
        } else if (!noTemplate && templateHelpers.isTemplate(markup)) {
            return toTemplate(markup);
        }
    } else if (_.isPlainObject(markup)) {
        var filedNames = _.keys(markup);
        if (filedNames.length === 1) {
            var fieldName = filedNames[0];
            var fieldValue = markup[fieldName];

            if (fieldName === "_") {
                // Escape:
                return fieldValue;
            }

            var activityTypeName = getActivityTypeName(fieldName);
            if (activityTypeName) {
                // Activity:
                return self._createAndInitActivityInstance(types, activityTypeName, markup);
            }
        }

        // Plain object:
        if (!noTemplate && templateHelpers.isTemplate(markup)) {
            return toTemplate(markup);
        }
    } else if (_.isString(markup)) {
        var str = markup.trim();
        if (templateHelpers.isFunctionString(str)) {
            var f = undefined;
            eval("f = function(_){return (" + str + ");}");
            f = f(_);
            if (!noFunction) {
                return toFunc(f);
            } else {
                return f; // aka when func.code
            }
        } else if (str.length > 1) {
                if (str[0] === "=") {
                    // Expression
                    return toExpression(str.substr(1));
                }
            }
    } else if (_.isFunction(markup)) {
        if (!noFunction) {
            return toFunc(markup);
        }
    }

    return this._clone(markup);
};

ActivityMarkup.prototype._clone = function (obj) {
    return templateHelpers.cloneDeep(obj);
};

ActivityMarkup.prototype._errorHint = function (markup) {
    var len = 20;
    var json = JSON.stringify(markup);
    if (json.length > len) {
        json = json.substr(0, len) + " ...";
    }
    return "\nSee error near:\n" + json;
};

ActivityMarkup.prototype.stringify = function (obj) {
    if (_.isString(obj)) {
        return obj;
    }
    if (is.activity(obj)) {
        obj = this.toMarkup(obj);
    }
    if (!_.isPlainObject(obj)) {
        throw new TypeError("Parameter 'obj' is not a plain object.");
    }
    var cloned = _.cloneDeep(obj);
    this._functionsToString(cloned);
    return JSON.stringify(cloned);
};

ActivityMarkup.prototype._functionsToString = function (obj) {
    var self = this;
    for (var fieldName in obj) {
        var fieldValue = obj[fieldName];
        if (_.isFunction(fieldValue)) {
            obj[fieldName] = fieldValue.toString();
        } else if (_.isObject(fieldValue)) {
            self._functionsToString(fieldValue);
        } else if (_.isArray(fieldValue)) {
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = fieldValue[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var v = _step6.value;

                    self._functionsToString(v);
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
};

// To Markup:

ActivityMarkup.prototype.toMarkup = function (activity) {
    /*if (!is.activity(activity)) {
        throw new TypeError("Argument is not an activity instance.");
    }
    let markup = {};
    let alias = this.getAlias(activity.constructor);
    let activityMarkup = this._createMarkupOfActivity(activity);*/
    throw new Error("Not supported yet!");
};

// Exports:

var activityMarkup = null;

module.exports = {
    parse: function parse(markup) {
        return (activityMarkup = activityMarkup || new ActivityMarkup()).parse(markup);
    },

    toMarkup: function toMarkup(activity) {
        return (activityMarkup = activityMarkup || new ActivityMarkup()).toMarkup(activity);
    },

    stringify: function stringify(obj) {
        return (activityMarkup = activityMarkup || new ActivityMarkup()).stringify(obj);
    },

    getAlias: function getAlias(activity) {
        return (activityMarkup = activityMarkup || new ActivityMarkup()).getAlias(activity.constructor);
    }
};
//# sourceMappingURL=activityMarkup.js.map
