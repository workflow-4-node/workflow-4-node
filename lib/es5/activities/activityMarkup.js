"use strict";
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
    var $__4 = true;
    var $__5 = false;
    var $__6 = undefined;
    try {
      for (var $__2 = void 0,
          $__1 = (resource.substr(pPos + 1).split("/"))[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
        var key = $__2.value;
        {
          obj = obj[key];
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
    return obj;
  } catch (e) {
    return require(resource);
  }
}
function ActivityMarkup() {
  this._systemTypes = new Map();
  this._registerSystemTypes();
}
ActivityMarkup.prototype._registerSystemTypes = function() {
  this._registerTypes(__dirname);
};
ActivityMarkup.prototype._registerTypes = function(sourcePath) {
  this._registerTypesTo(this._systemTypes, sourcePath);
};
ActivityMarkup.prototype._registerTypesTo = function(types, sourcePath) {
  var self = this;
  var obj = requireFromRoot(sourcePath);
  Reflection.visitObject(obj, function(inObj) {
    var alias = self.getAlias(inObj);
    if (alias && !types.has(alias)) {
      types.set(alias, inObj);
    }
    return alias === null;
  });
};
ActivityMarkup.prototype.getAlias = function(type) {
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
ActivityMarkup.prototype._toCamelCase = function(id) {
  return id[0].toLowerCase() + id.substr(1);
};
ActivityMarkup.prototype.parse = function(markup) {
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
  var $__4 = true;
  var $__5 = false;
  var $__6 = undefined;
  try {
    for (var $__2 = void 0,
        $__1 = (this._systemTypes.entries())[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
      var kvp = $__2.value;
      {
        types.set(kvp[0], kvp[1]);
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
ActivityMarkup.prototype._createActivity = function(types, markup) {
  var filedNames = _.filter(_.keys(markup), function(k) {
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
ActivityMarkup.prototype._createAndInitActivityInstance = function(types, typeName, markup) {
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
ActivityMarkup.prototype._createActivityInstance = function(types, alias) {
  var Constructor = types.get(alias);
  if (_.isUndefined(Constructor)) {
    return null;
  }
  return new Constructor();
};
ActivityMarkup.prototype._setupActivity = function(types, activityRef, pars) {
  var self = this;
  var activity = activityRef.value;
  function noFunction(fieldName) {
    return activity.codeProperties.has(fieldName);
  }
  if (_.isArray(pars)) {
    activity.args = [];
    var $__4 = true;
    var $__5 = false;
    var $__6 = undefined;
    try {
      for (var $__2 = void 0,
          $__1 = (pars)[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
        var obj = $__2.value;
        {
          activity.args.push(self._createValue(types, obj, false, is.template(activity)));
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
  } else if (_.isObject(pars)) {
    var to = null;
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
          if (!activity.promotedProperties || !_.isFunction(activity.promoted)) {
            throw new errors.ActivityMarkupError("Activity '" + activityRef.name + " cannot have promoted properties." + this._errorHint(pars));
          }
          activity.promoted(fieldName.substr(1), self._createValue(types, pars[fieldName], true, is.template(activity)));
        } else if (fieldName[0] === "`") {
          if (!activity.reservedProperties || !_.isFunction(activity.reserved)) {
            throw new errors.ActivityMarkupError("Activity '" + activityRef.name + " cannot have reserved properties." + this._errorHint(pars));
          }
          activity.reserved(fieldName.substr(1), self._createValue(types, pars[fieldName], true, is.template(activity)));
        } else if (fieldName === "@require") {
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
    activity.args = [self._createValue(types, pars, false, is.template(activity))];
  }
};
ActivityMarkup.prototype._require = function(types, markup) {
  var self = this;
  if (_.isArray(markup)) {
    var $__4 = true;
    var $__5 = false;
    var $__6 = undefined;
    try {
      for (var $__2 = void 0,
          $__1 = (markup)[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
        var item = $__2.value;
        {
          self._require(types, item);
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
  } else if (_.isString(markup)) {
    self._registerTypesTo(types, markup);
  } else {
    throw new errors.ActivityMarkupError("Cannot register '" + markup + "'." + self._errorHint(markup));
  }
};
ActivityMarkup.prototype._createValue = function(types, markup, canBeArray, noTemplate, noFunction) {
  var self = this;
  function templatize(_markup) {
    var template = self._createActivityInstance(types, "template");
    template.declare = _markup;
    return template;
  }
  function funcletize(f) {
    var func = self._createActivityInstance(types, "func");
    func.code = f;
    return func;
  }
  function expressionize(str) {
    var expr = self._createActivityInstance(types, "expression");
    expr.expr = str;
    return expr;
  }
  if (_.isArray(markup)) {
    if (canBeArray) {
      var result = [];
      var $__4 = true;
      var $__5 = false;
      var $__6 = undefined;
      try {
        for (var $__2 = void 0,
            $__1 = (markup)[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
          var v = $__2.value;
          {
            result.push(self._createValue(types, v));
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
      return result;
    } else if (!noTemplate && templateHelpers.isTemplate(markup)) {
      return templatize(markup);
    }
  } else if (_.isPlainObject(markup)) {
    var filedNames = _.keys(markup);
    if (filedNames.length === 1) {
      var fieldName = filedNames[0];
      var fieldValue = markup[fieldName];
      if (fieldName === "_") {
        return fieldValue;
      }
      var activityTypeName = getActivityTypeName(fieldName);
      if (activityTypeName) {
        return self._createAndInitActivityInstance(types, activityTypeName, markup);
      }
    }
    if (!noTemplate && templateHelpers.isTemplate(markup)) {
      return templatize(markup);
    }
  } else if (_.isString(markup)) {
    var str = markup.trim();
    if (templateHelpers.isFunctionString(str)) {
      var f;
      eval("f = function(_){return (" + str + ");}");
      f = f(_);
      if (!noFunction) {
        return funcletize(f);
      } else {
        return f;
      }
    } else if (str.length > 1) {
      if (str[0] === "=") {
        return expressionize(str.substr(1));
      }
    }
  } else if (_.isFunction(markup)) {
    if (!noFunction) {
      return funcletize(markup);
    }
  }
  return markup;
};
ActivityMarkup.prototype._errorHint = function(markup) {
  var len = 20;
  var json = JSON.stringify(markup);
  if (json.length > len) {
    json = json.substr(0, len) + " ...";
  }
  return "\nSee error near:\n" + json;
};
ActivityMarkup.prototype.stringify = function(obj) {
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
ActivityMarkup.prototype._functionsToString = function(obj) {
  var self = this;
  for (var fieldName in obj) {
    var fieldValue = obj[fieldName];
    if (_.isFunction(fieldValue)) {
      obj[fieldName] = fieldValue.toString();
    } else if (_.isObject(fieldValue)) {
      self._functionsToString(fieldValue);
    } else if (_.isArray(fieldValue)) {
      var $__4 = true;
      var $__5 = false;
      var $__6 = undefined;
      try {
        for (var $__2 = void 0,
            $__1 = (fieldValue)[Symbol.iterator](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
          var v = $__2.value;
          {
            self._functionsToString(v);
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
  }
};
ActivityMarkup.prototype.toMarkup = function(activity) {
  throw new Error("Not supported yet!");
};
var activityMarkup = null;
module.exports = {
  parse: function(markup) {
    return (activityMarkup = (activityMarkup || new ActivityMarkup())).parse(markup);
  },
  toMarkup: function(activity) {
    return (activityMarkup = (activityMarkup || new ActivityMarkup())).toMarkup(activity);
  },
  stringify: function(obj) {
    return (activityMarkup = (activityMarkup || new ActivityMarkup())).stringify(obj);
  },
  getAlias: function(activity) {
    return (activityMarkup = (activityMarkup || new ActivityMarkup())).getAlias(activity.constructor);
  }
};

//# sourceMappingURL=activityMarkup.js.map
