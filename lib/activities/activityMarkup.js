var _ = require("lodash");
var errors = require("../common/errors");
var Activity = require("./activity");
var is = require("../common/is");
var StrMap = require("backpack-node").collections.StrMap;
var path = require("path");
var fs = require("fs");
var _s = require('underscore.string');
var Reflection = require("backpack-node").system.Reflection;

requireFromRoot = (function(root) {
    return function(resource) {

        function canRequire(rp) {
            var jsPath = !_s.endsWith(rp, ".js") ? (rp + ".js") : rp;
            var indexPath = path.join(rp, "index.js");
            return fs.existsSync(jsPath) || fs.existsSync(indexPath);
        }

        var splits = path.resolve(root).split('node_modules');
        for (var i = splits.length - 1; i >= 0; i--) {
            var rp = splits[i];
            rp = path.join(rp, resource);
            if (canRequire(rp)) return require(rp);
        }
        var rp = path.resolve(path.join(root, "../../", resource));
        if (canRequire(rp)) return require(rp); // workflow-4-node project itself
        throw new Error("Required resource '" + resource + "' cannot be found.");
    }
})(__dirname);

function ActivityMarkup() {
    this._systemTypes = new StrMap();
    this._registerSystemTypes();
}

ActivityMarkup.prototype._registerSystemTypes = function () {
    this._registerTypes("/lib/activities");
}

ActivityMarkup.prototype._registerTypes = function (sourcePath) {
    this._registerTypesTo(this._systemTypes, sourcePath);
}

ActivityMarkup.prototype._registerTypesTo = function (types, sourcePath) {
    var self = this;
    var obj = requireFromRoot(sourcePath);
    Reflection.visitObject(obj, function(inObj) {
        var alias = self._getAlias(inObj);
        if (alias && !types.containsKey(alias)) {
            // This is an activity type
            types.add(alias, inObj);
        }
        return alias == null;
    });
}

ActivityMarkup.prototype._getAlias = function (type) {
    if (_.isFunction(type) && is.defined(type.super_)) {
        var alias = this._toCamelCase(type.name);
        do
        {
            if (type.super_ === Activity) return alias;
            type = type.super_;
        }
        while (type);
    }
    return null;
}

ActivityMarkup.prototype._toCamelCase = function (id) {
    return id[0].toLowerCase() + id.substr(1);
}

ActivityMarkup.prototype.parse = function (markup) {
    if (!markup) throw new TypeError("Parameter 'markup' expected.");
    if (_.isString(markup)) markup = JSON.parse(markup);
    if (!_.isPlainObject(markup)) throw new TypeError("Parameter 'markup' is not a plain object.");

    var types = new StrMap();
    this._systemTypes.forEach(function (item) {
        types.set(item.key, item.value);
    });
    return this._createActivity(types, markup);
}

ActivityMarkup.prototype._createActivity = function (types, markup) {
    var filedNames = _.keys(markup);
    if (filedNames.length != 1) throw new errors.ActivityMarkupError("There should be one field." + this._errorHint(markup));

    var activityAlias = filedNames[0];
    return this._createAndInitActivityInstance(types, activityAlias, markup);
}

ActivityMarkup.prototype._createAndInitActivityInstance = function (types, alias, markup) {
    var activity = this._createActivityInstance(types, alias);
    if (!activity) throw new errors.ActivityMarkupError("Unknown activity alias '" + alias + "'." + this._errorHint(markup));
    var activityRef = {
        name: alias,
        value: activity
    };
    var pars = markup[alias];
    if (pars) this._setupActivity(types, activityRef, pars);
    return activityRef.value;
}

ActivityMarkup.prototype._createActivityInstance = function (types, alias) {
    var type = types.get(alias);
    if (is.undefined(type)) return null;
    return new type();
}

ActivityMarkup.prototype._setupActivity = function (types, activityRef, pars) {
    var self = this;
    var activity = activityRef.value;
    if (_.isArray(pars)) {
        // args
        activity.args = [];
        pars.forEach(
            function (obj) {
                activity.args.push(self._createValue(types, obj));
            });
    }
    else if (_.isObject(pars)) {
        var to = null;
        // values
        for (var fieldName in pars) {
            if (fieldName == "args") {
                var v = self._createValue(types, pars[fieldName], true);
                if (!_.isArray(v)) v = [v];
                activity.args = v;
            }
            else if (fieldName == "@to") {
                if (to) throw new errors.ActivityMarkupError("Multiple to defined in activity '" + activityRef.name + "." + this._errorHint(pars));
                to = pars[fieldName];
            }
            else if (fieldName[0] == "!") {
                // Promoted:
                if (!activity.promotedProperties || !_.isFunction(activity.promoted)) throw new errors.ActivityMarkupError("Activity '" + activityRef.name + " cannot have promoted properties." + this._errorHint(pars));
                activity.promoted(fieldName.substr(1), self._createValue(types, pars[fieldName], true));
            }
            else if (fieldName == "@require") {
                // Require:
                self._require(types, pars[fieldName]);
            }
            else {
                activity[fieldName] = self._createValue(types, pars[fieldName], true);
            }
        }
        if (to) {
            var current = activity;
            var assign = activityRef.value = this._createActivityInstance(types, "assign");
            assign.value = current;
            assign.to = to;
        }
    }
    else {
        // 1 arg
        activity.args = [self._createValue(types, pars)];
    }
}

ActivityMarkup.prototype._require = function(types, markup) {
    var self = this;

    if (_.isArray(markup)) {
        markup.forEach(function(item) {
            self._require(types, item);
        });
    }
    else if (_.isString(markup)) {
        self._registerTypesTo(types, markup);
    }
    else {
        throw new errors.ActivityMarkupError("Cannot register '" + markup + "'." + self._errorHint(markup));
    }
}

ActivityMarkup.prototype._createValue = function (types, markup, canBeArray) {
    var self = this;
    if (_.isArray(markup) && canBeArray) {
        var result = [];
        markup.forEach(function (v) {
            result.push(self._createValue(types, v));
        });
        return result;
    }
    else if (_.isObject(markup)) {
        var filedNames = _.keys(markup);
        if (filedNames.length == 1) {
            var fieldName = filedNames[0];
            var fieldValue = markup[fieldName];

            if (fieldName == "_") {
                // Escape:
                return fieldValue;
            }

            if (types.containsKey(fieldName)) {
                // Activity:
                return self._createAndInitActivityInstance(types, fieldName, markup);
            }
        }
    }
    else if (_.isString(markup)) {
        var trimmed = markup.trim();
        if (trimmed.match(/^\s*function\s*\w*\s*\((?:\w+,)*(?:\w+)?\)\s*\{/)) {
            try {
                var f;
                eval("f = " + trimmed);
                if (_.isFunction(f)) return f;
            }
            catch (e) {
                // It's not a function
            }
        }
        else if (trimmed.length > 1 && trimmed[0] == "#") {
            // Expression
            var expr = self._createActivityInstance(types, "expression");
            expr.expr = trimmed.substr(1);
            return expr;
        }
    }

    return markup;
}

ActivityMarkup.prototype._errorHint = function (markup) {
    var len = 20;
    var json = JSON.stringify(markup);
    if (json.length > len) json = json.substr(0, len) + " ...";
    return "\nSee error near:\n" + json;
}

ActivityMarkup.prototype.stringify = function (obj) {
    if (_.isString(obj)) return obj;
    if (is.activity(obj)) obj = this.toMarkup(obj);
    if (!_.isPlainObject(obj)) throw new TypeError("Parameter 'obj' is not a plain object.");
    var cloned = _.clone(obj);
    this._functionsToString(cloned);
    return JSON.stringify(cloned);
}

ActivityMarkup.prototype._functionsToString = function (obj) {
    var self = this;
    for (var fieldName in obj) {
        var fieldValue = obj[fieldName];
        if (_.isFunction(fieldValue)) obj[fieldName] = fieldValue.toString();
        else if (_.isObject(fieldValue)) self._functionsToString(fieldValue);
        else if (_.isArray(fieldValue)) fieldValue.forEach(function (v) {
            self._functionsToString(v);
        });
    }
}

// To Markup:

ActivityMarkup.prototype.toMarkup = function (activity) {
    if (!is.activity(activity)) throw new TypeError("Argument is not an activity instance.");

    var markup = {};
    var alias = this._getAlias(activity.constructor);
    var activityMarkup = this._createMarkupOfActivity(activity);

}

// Exports:

var activityMarkup = null;

module.exports = {
    parse: function (markup) {
        return (activityMarkup = activityMarkup || new ActivityMarkup()).parse(markup);
    },

    toMarkup: function (activity) {
        return (activityMarkup = activityMarkup || new ActivityMarkup()).toMarkup(activity);
    },

    stringify: function (obj) {
        return (activityMarkup = activityMarkup || new ActivityMarkup()).stringify(obj);
    }
}