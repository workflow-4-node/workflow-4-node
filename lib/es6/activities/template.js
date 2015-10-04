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

    this.declare = null;

    this.nonScopedProperties.add("_visitActivities");
    this.nonScopedProperties.add("_getInternalActivities");
}

util.inherits(Template, Activity);

Template.prototype.initializeStructure = function(execContext) {
    let self = this;
    let require = execContext.rootActivity["@require"];
    self.args = [];
    templateHelpers.visitActivities(self.declare,
        function(markup, parent, key) {
            if (require) {
                markup = _.cloneDeep(markup);
                markup["@require"] = require;
            }
            self.args.push(activityMarkup.parse(markup));
        });
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