"use strict";
var _ = require("lodash");
var Reflection = require("backpack-node").system.Reflection;
var maxDepth = 10;
var templateHelpers = {
  isFunctionString: function(str) {
    return _.isString(str) && str.match(/^\s*function\s*\w*\s*\((?:\w+,)*(?:\w+)?\)\s*\{/);
  },
  isTemplate: function(obj) {
    var activityCount = 0;
    templateHelpers.visitActivities(obj, function() {
      activityCount++;
    });
    return activityCount > 0;
  },
  visitActivities: function(obj, f) {
    if (!_.isPlainObject(obj) && !_.isArray(obj)) {
      return;
    }
    Reflection.visitObject(obj, function(subObj, parent, pkey) {
      if (_.isString(subObj)) {
        var str = subObj.trim();
        if (str.length > 1) {
          if (str[0] === "=") {
            var markup = {"@expression": {expr: str.substr(1)}};
            f(markup, parent, pkey);
            return false;
          }
          if (templateHelpers.isFunctionString(str)) {
            var markup$__3 = {"@func": {code: str}};
            f(markup$__3, parent, pkey);
            return false;
          }
        }
      } else if (_.isPlainObject(subObj)) {
        var keys = _.keys(subObj);
        if (keys.length === 1) {
          var key = keys[0];
          if (key[0] === "@" && key.length > 1) {
            var markup$__4 = {};
            markup$__4[key] = subObj[key];
            f(markup$__4, parent, pkey);
            return false;
          }
        } else if (keys.length === 2) {
          var key1 = keys[0];
          var key2 = keys[1];
          if (key1 === "@require" && key2[0] === "@" && key2.length > 1) {
            var markup$__5 = {};
            markup$__5[key1] = subObj[key1];
            markup$__5[key2] = subObj[key2];
            f(markup$__5, parent, pkey);
            return false;
          } else if (key2 === "@require" && key1[0] === "@" && key1.length > 1) {
            var markup$__6 = {};
            markup$__6[key2] = subObj[key2];
            markup$__6[key1] = subObj[key1];
            f(markup$__6, parent, pkey);
            return false;
          }
        }
      } else if (_.isFunction(subObj)) {
        var markup$__7 = {"@func": {code: subObj}};
        f(markup$__7, parent, pkey);
        return false;
      }
      return true;
    }, maxDepth);
  }
};
module.exports = templateHelpers;

//# sourceMappingURL=templateHelpers.js.map
