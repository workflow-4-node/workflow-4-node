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

Template.prototype.initializeStructure = function (execContext) {
    var self = this;
    var require = execContext.rootActivity["@require"];
    self.args = [];
    templateHelpers.visitActivities(self.declare, function (markup, parent, key) {
        if (require) {
            markup = templateHelpers.cloneDeep(markup);
            markup["@require"] = require;
        }
        self.args.push(activityMarkup.parse(markup));
    });
};

Template.prototype.run = function (callContext, args) {
    if (_.isArray(args)) {
        callContext.schedule(args, "_activitiesGot");
    } else {
        callContext.complete();
    }
};

Template.prototype._activitiesGot = function (callContext, reason, result) {
    var _this = this;

    if (reason === Activity.states.complete) {
        if (_.isArray(result) && result.length) {
            (function () {
                var idx = 0;
                var declare = _.cloneDeep(_this.declare);
                var setupTasks = [];
                templateHelpers.visitActivities(declare, function (markup, parent, key) {
                    setupTasks.push(function () {
                        parent[key] = result[idx++];
                    });
                });
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = setupTasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var t = _step.value;

                        t();
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                callContext.complete(declare);
            })();
        }
    } else {
        callContext.end(reason, result);
    }
};

module.exports = Template;
//# sourceMappingURL=template.js.map
