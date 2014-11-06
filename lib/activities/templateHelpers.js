var _ = require('lodash');
var Reflection = require('backpack-node').system.Reflection;

var maxDepth = 10;

var templateHelpers = {

    isTemplate: function (obj) {
        var activityCount = 0;
        templateHelpers.visitActivities(obj, function () {
            activityCount++;
        });
        return activityCount > 0;
    },

    visitActivities: function (obj, f) {
        if (!_.isPlainObject(obj)) return;
        Reflection.visitObject(obj, function (subObj, parent, pkey) {

            if (_.isString(subObj)) {
                var str = subObj.trim();
                if (str.length > 1 && str[0] === '#') {
                    var markup = {
                        expression: {
                            expr: str.substr(1)
                        }
                    };
                    f(markup, parent, pkey);
                    return false;
                }
            }
            else if (_.isPlainObject(subObj)) {

                var keys = _.keys(subObj);

                if (keys.length === 1) {
                    var key = keys[0];
                    if (key[0] === '@' && key.length > 1) {
                        var markup = {};
                        markup[key.substr(1)] = subObj[key];
                        f(markup, parent, pkey);
                        return false;
                    }
                }
                else if (keys.length == 2) {
                    var key1 = keys[0];
                    var key2 = keys[1];
                    if (key1 === '@require' && key2[0] === '@' && key2.length > 1) {
                        var markup = {};
                        markup[key1] = subObj[key1];
                        markup[key2.substr(1)] = subObj[key2];
                        f(markup, parent, pkey);
                        return false;
                    }
                    else if (key2 === '@require' && key1[0] === '@' && key1.length > 1) {
                        var markup = {};
                        markup[key2] = subObj[key2];
                        markup[key1.substr(1)] = subObj[key1];
                        f(markup, parent, pkey);
                        return false;
                    }
                }
            }
            return true;
        }, maxDepth);
    }
};

module.exports = templateHelpers;