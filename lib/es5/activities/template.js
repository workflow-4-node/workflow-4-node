"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var activityMarkup = require("./activityMarkup");
var is = require("../common/is");
var templateHelpers = require("./templateHelpers");
var constants = require("../common/constants");
function Template() {
  Activity.call(this);
  this.declare = null;
  this.nonScopedProperties.add("_visitActivities");
  this.nonScopedProperties.add("_getInternalActivities");
}
util.inherits(Template, Activity);
Template.prototype.initializeStructure = function(execContext) {
  var self = this;
  var require = execContext.rootActivity["@require"];
  self.args = [];
  templateHelpers.visitActivities(self.declare, function(markup, parent, key) {
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
  } else {
    callContext.complete();
  }
};
Template.prototype._activitiesGot = function(callContext, reason, result) {
  if (reason === Activity.states.complete) {
    if (_.isArray(result) && result.length) {
      var idx = 0;
      var declare = _.cloneDeep(this.declare);
      var setupTasks = [];
      templateHelpers.visitActivities(declare, function(markup, parent, key) {
        setupTasks.push(function() {
          parent[key] = result[idx++];
        });
      });
      var $__3 = true;
      var $__4 = false;
      var $__5 = undefined;
      try {
        for (var $__1 = void 0,
            $__0 = (setupTasks)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__3 = ($__1 = $__0.next()).done); $__3 = true) {
          var t = $__1.value;
          {
            t();
          }
        }
      } catch ($__6) {
        $__4 = true;
        $__5 = $__6;
      } finally {
        try {
          if (!$__3 && $__0.return != null) {
            $__0.return();
          }
        } finally {
          if ($__4) {
            throw $__5;
          }
        }
      }
      callContext.complete(declare);
    }
  } else {
    callContext.end(reason, result);
  }
};
module.exports = Template;

//# sourceMappingURL=template.js.map
