var Activity = require('./activity');
var util = require('util');
var _ = require('lodash');
var activityMarkup = require('./activityMarkup');
var fast = require('fast.js');
var is = require('../common/is');
var templateHelpers = require('./templateHelpers');
var guids = require('../common/guids');

function Template() {
    Activity.call(this);

    this[guids.types.template] = true;
    this.nonScopedProperties.add(guids.types.template);

    this.declare = null;

    this.nonScopedProperties.add('_visitActivities');
    this.nonScopedProperties.add('_getInternalActivities');
}

util.inherits(Template, Activity);

Template.prototype._getInternalActivities = function() {
    var self = this;
    if (!self.args) {
        self.args = [];
        templateHelpers.visitActivities(self.declare,
            function(markup, parent, key) {
                self.args.push(activityMarkup.parse(markup));
            });
    }
    return self.args;
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
    if (_.isArray(args)) {
        callContext.schedule(args, '_activitiesGot');
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
            templateHelpers.visitActivities(declare, function(markup, parent, key) {
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