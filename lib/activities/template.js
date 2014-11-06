var Activity = require('./activity');
var util = require('util');
var Reflection = require('backpack-node').system.Reflection;
var _ = require('lodash');
var activityMarkup = require('./activityMarkup');
var fast = require('fast.js');
var is = require('../common/is');

function Template() {
    Activity.call(this);

    this.declare = null;
    this.maxDepth = 10;
    this._activities = null;

    this.nonScopedProperties.add('_visitActivities');
    this.nonScopedProperties.add('_getInternalActivities');
}

util.inherits(Template, Activity);

Template.prototype._visitActivities = function(obj, f) {
    if (!_.isPlainObject(obj)) return;
    var self = this;
    Reflection.visitObject(obj, function(subObj, parent, pkey) {

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

        return true;
    }, self.maxDepth);
}

Template.prototype._getInternalActivities = function() {
    var self = this;
    if (!self._activities) {
        self._activities = [];
        self._visitActivities(self.declare,
            function(markup, parent, key) {
                self._activities.push(activityMarkup.parse(markup));
            });
    }
    return self._activities;
}

Template.prototype.forEachImmediateChild = function (f) {
    Activity.prototype.forEachImmediateChild.call(this, f);
    fast.forEach(this._getInternalActivities(), function(activity) {
        f(activity);
    });
}

Template.prototype._forEach = function (f, visited, except) {
    Activity.prototype._forEach.call(this, f, visited, except);
    fast.forEach(this._getInternalActivities(), function(activity) {
        activity._forEach(f, visited, except);
    });
}

Template.prototype.run = function(callContext, args) {
    var activities = this.get('_activities');
    if (_.isArray(activities)) {
        callContext.schedule(activities, '_activitiesGot');
    }
    else {
        callContext.complete();
    }
}

Template.prototype._activitiesGot = function(callContext, reason, result) {
    if (reason == Activity.states.complete) {
        if (_.isArray(result) && result.length) {
            var idx = 0;
            var declare = _.cloneDeep(this.get("declare"));
            var setupTasks = [];
            callContext.activity._visitActivities(declare, function(markup, parent, key) {
                setupTasks.push(function() {
                    parent[key] = result[idx++];
                });
            });
            fast.forEach(setupTasks, function(t) { t(); });
            callContext.complete(declare);
        }
    }
    else {
        callContext.end(reason, result);
    }
}

module.exports = Template;