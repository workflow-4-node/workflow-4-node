"use strict";

let Activity = require("./activity");
let util = require("util");
let _ = require("lodash");
let activityMarkup = require("./activityMarkup");
let is = require("../common/is");
let templateHelpers = require("./templateHelpers");
let guids = require("../common/guids");

function Template() {
    Activity.call(this);

    this[guids.types.template] = true;
    this.nonScopedProperties.add(guids.types.template);

    this.declare = null;

    this.nonScopedProperties.add("_visitActivities");
    this.nonScopedProperties.add("_getInternalActivities");
}

util.inherits(Template, Activity);

Template.prototype._getInternalActivities = function(require) {
    let self = this;
    if (!self.args) {
        self.args = [];
        templateHelpers.visitActivities(self.declare,
            function(markup, parent, key) {
                if (require) {
                    markup = _.cloneDeep(markup);
                    markup["@require"] = require;
                }
                self.args.push(activityMarkup.parse(markup));
            });
    }
    return self.args;
};

Template.prototype._children = function* (deep, except, execContext, visited) {
    yield * Activity.prototype._children.apply(this, arguments);
    for (let activity of this._getInternalActivities(execContext.rootActivity["@require"])) {
        yield activity;
    }
};

Template.prototype.run = function(callContext, args) {
    if (_.isArray(args)) {
        callContext.schedule(args, "_activitiesGot");
    }
    else {
        callContext.complete();
    }
};

Template.prototype._activitiesGot = function(callContext, reason, result) {
    if (reason === Activity.states.complete) {
        if (_.isArray(result) && result.length) {
            let idx = 0;
            let declare = _.cloneDeep(this.declare);
            let setupTasks = [];
            templateHelpers.visitActivities(declare, function(markup, parent, key) {
                setupTasks.push(function() {
                    parent[key] = result[idx++];
                });
            });
            for (let t of setupTasks) {
                t();
            }
            callContext.complete(declare);
        }
    }
    else {
        callContext.end(reason, result);
    }
};

module.exports = Template;