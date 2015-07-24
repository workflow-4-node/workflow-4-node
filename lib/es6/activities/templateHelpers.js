"use strict";

let _ = require("lodash");
let Reflection = require("backpack-node").system.Reflection;

let maxDepth = 10;

let templateHelpers = {

    isFunctionString: function (str) {
        return _.isString(str) && str.match(/^\s*function\s*\w*\s*\((?:\w+,)*(?:\w+)?\)\s*\{/);
    },
    isTemplate: function (obj) {
        let activityCount = 0;
        templateHelpers.visitActivities(obj, function () {
            activityCount++;
        });
        return activityCount > 0;
    },
    visitActivities: function (obj, f) {
        if (!_.isPlainObject(obj) && !_.isArray(obj)) {
            return;
        }
        Reflection.visitObject(obj,
            function (subObj, parent, pkey) {
                if (_.isString(subObj)) {
                    let str = subObj.trim();
                    if (str.length > 1) {
                        if (str[0] === "=") {
                            let markup = {
                                "@expression": {
                                    expr: str.substr(1)
                                }
                            };
                            f(markup, parent, pkey);
                            return false;
                        }
                        if (templateHelpers.isFunctionString(str)) {
                            let markup = {
                                "@func": {
                                    code: str
                                }
                            };
                            f(markup, parent, pkey);
                            return false;
                        }
                    }
                }
                else if (_.isPlainObject(subObj)) {
                    let keys = _.keys(subObj);

                    if (keys.length === 1) {
                        let key = keys[0];
                        if (key[0] === "@" && key.length > 1) {
                            let markup = {};
                            markup[key] = subObj[key];
                            f(markup, parent, pkey);
                            return false;
                        }
                    }
                    else if (keys.length === 2) {
                        let key1 = keys[0];
                        let key2 = keys[1];
                        if (key1 === "@require" && key2[0] === "@" && key2.length > 1) {
                            let markup = {};
                            markup[key1] = subObj[key1];
                            markup[key2] = subObj[key2];
                            f(markup, parent, pkey);
                            return false;
                        }
                        else if (key2 === "@require" && key1[0] === "@" && key1.length > 1) {
                            let markup = {};
                            markup[key2] = subObj[key2];
                            markup[key1] = subObj[key1];
                            f(markup, parent, pkey);
                            return false;
                        }
                    }
                }
                else if (_.isFunction(subObj)) {
                    let markup = {
                        "@func": {
                            code: subObj
                        }
                    };
                    f(markup, parent, pkey);
                    return false;
                }
                return true;
            },
            maxDepth);
    }
};

module.exports = templateHelpers;