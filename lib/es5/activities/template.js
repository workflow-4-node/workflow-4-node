"use strict";
var Activity = require("./activity");
var util = require("util");
var _ = require("lodash");
var activityMarkup = require("./activityMarkup");
var is = require("../common/is");
var templateHelpers = require("./templateHelpers");
var guids = require("../common/guids");
function Template() {
  Activity.call(this);
  this.declare = null;
  this.nonScopedProperties.add("_visitActivities");
  this.nonScopedProperties.add("_getInternalActivities");
}
util.inherits(Template, Activity);
Template.prototype._getInternalActivities = function(require) {
  var self = this;
  if (!self.args) {
    self.args = [];
    templateHelpers.visitActivities(self.declare, function(markup, parent, key) {
      if (require) {
        markup = _.cloneDeep(markup);
        markup["@require"] = require;
      }
      self.args.push(activityMarkup.parse(markup));
    });
  }
  return self.args;
};
Template.prototype._children = $traceurRuntime.initGeneratorFunction(function $__7(deep, except, execContext, visited) {
  var $__3,
      $__4,
      $__5,
      $__1,
      $__0,
      activity,
      $__8,
      $__9,
      $__6;
  var $arguments = arguments;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $__8 = $ctx.wrapYieldStar(Activity.prototype._children.apply(this, $arguments)[Symbol.iterator]());
          $ctx.sent = void 0;
          $ctx.action = 'next';
          $ctx.state = 12;
          break;
        case 12:
          $__9 = $__8[$ctx.action]($ctx.sentIgnoreThrow);
          $ctx.state = 9;
          break;
        case 9:
          $ctx.state = ($__9.done) ? 3 : 2;
          break;
        case 3:
          $ctx.sent = $__9.value;
          $ctx.state = 10;
          break;
        case 2:
          $ctx.state = 12;
          return $__9.value;
        case 10:
          $__3 = true;
          $__4 = false;
          $__5 = undefined;
          $ctx.state = 36;
          break;
        case 36:
          $ctx.pushTry(22, 23);
          $ctx.state = 25;
          break;
        case 25:
          $__1 = void 0, $__0 = (this._getInternalActivities(execContext.rootActivity["@require"]))[$traceurRuntime.toProperty(Symbol.iterator)]();
          $ctx.state = 21;
          break;
        case 21:
          $ctx.state = (!($__3 = ($__1 = $__0.next()).done)) ? 17 : 19;
          break;
        case 16:
          $__3 = true;
          $ctx.state = 21;
          break;
        case 17:
          activity = $__1.value;
          $ctx.state = 18;
          break;
        case 18:
          $ctx.state = 14;
          return activity;
        case 14:
          $ctx.maybeThrow();
          $ctx.state = 16;
          break;
        case 19:
          $ctx.popTry();
          $ctx.state = 23;
          $ctx.finallyFallThrough = -2;
          break;
        case 22:
          $ctx.popTry();
          $ctx.maybeUncatchable();
          $__6 = $ctx.storedException;
          $ctx.state = 28;
          break;
        case 28:
          $__4 = true;
          $__5 = $__6;
          $ctx.state = 23;
          $ctx.finallyFallThrough = -2;
          break;
        case 23:
          $ctx.popTry();
          $ctx.state = 34;
          break;
        case 34:
          try {
            if (!$__3 && $__0.return != null) {
              $__0.return();
            }
          } finally {
            if ($__4) {
              throw $__5;
            }
          }
          $ctx.state = 32;
          break;
        case 32:
          $ctx.state = $ctx.finallyFallThrough;
          break;
        default:
          return $ctx.end();
      }
  }, $__7, this);
});
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
//# sourceMappingURL=data:application/json;base64,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dml0aWVzL3RlbXBsYXRlLmpzIiwic291cmNlUm9vdCI6ImxpYi9lczYiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxubGV0IEFjdGl2aXR5ID0gcmVxdWlyZShcIi4vYWN0aXZpdHlcIik7XG5sZXQgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xubGV0IGFjdGl2aXR5TWFya3VwID0gcmVxdWlyZShcIi4vYWN0aXZpdHlNYXJrdXBcIik7XG5sZXQgaXMgPSByZXF1aXJlKFwiLi4vY29tbW9uL2lzXCIpO1xubGV0IHRlbXBsYXRlSGVscGVycyA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlSGVscGVyc1wiKTtcbmxldCBndWlkcyA9IHJlcXVpcmUoXCIuLi9jb21tb24vZ3VpZHNcIik7XG5cbmZ1bmN0aW9uIFRlbXBsYXRlKCkge1xuICAgIEFjdGl2aXR5LmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLmRlY2xhcmUgPSBudWxsO1xuXG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl92aXNpdEFjdGl2aXRpZXNcIik7XG4gICAgdGhpcy5ub25TY29wZWRQcm9wZXJ0aWVzLmFkZChcIl9nZXRJbnRlcm5hbEFjdGl2aXRpZXNcIik7XG59XG5cbnV0aWwuaW5oZXJpdHMoVGVtcGxhdGUsIEFjdGl2aXR5KTtcblxuVGVtcGxhdGUucHJvdG90eXBlLl9nZXRJbnRlcm5hbEFjdGl2aXRpZXMgPSBmdW5jdGlvbihyZXF1aXJlKSB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGlmICghc2VsZi5hcmdzKSB7XG4gICAgICAgIHNlbGYuYXJncyA9IFtdO1xuICAgICAgICB0ZW1wbGF0ZUhlbHBlcnMudmlzaXRBY3Rpdml0aWVzKHNlbGYuZGVjbGFyZSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKG1hcmt1cCwgcGFyZW50LCBrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVxdWlyZSkge1xuICAgICAgICAgICAgICAgICAgICBtYXJrdXAgPSBfLmNsb25lRGVlcChtYXJrdXApO1xuICAgICAgICAgICAgICAgICAgICBtYXJrdXBbXCJAcmVxdWlyZVwiXSA9IHJlcXVpcmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlbGYuYXJncy5wdXNoKGFjdGl2aXR5TWFya3VwLnBhcnNlKG1hcmt1cCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBzZWxmLmFyZ3M7XG59O1xuXG5UZW1wbGF0ZS5wcm90b3R5cGUuX2NoaWxkcmVuID0gZnVuY3Rpb24qIChkZWVwLCBleGNlcHQsIGV4ZWNDb250ZXh0LCB2aXNpdGVkKSB7XG4gICAgeWllbGQgKiBBY3Rpdml0eS5wcm90b3R5cGUuX2NoaWxkcmVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgZm9yIChsZXQgYWN0aXZpdHkgb2YgdGhpcy5fZ2V0SW50ZXJuYWxBY3Rpdml0aWVzKGV4ZWNDb250ZXh0LnJvb3RBY3Rpdml0eVtcIkByZXF1aXJlXCJdKSkge1xuICAgICAgICB5aWVsZCBhY3Rpdml0eTtcbiAgICB9XG59O1xuXG5UZW1wbGF0ZS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oY2FsbENvbnRleHQsIGFyZ3MpIHtcbiAgICBpZiAoXy5pc0FycmF5KGFyZ3MpKSB7XG4gICAgICAgIGNhbGxDb250ZXh0LnNjaGVkdWxlKGFyZ3MsIFwiX2FjdGl2aXRpZXNHb3RcIik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjYWxsQ29udGV4dC5jb21wbGV0ZSgpO1xuICAgIH1cbn07XG5cblRlbXBsYXRlLnByb3RvdHlwZS5fYWN0aXZpdGllc0dvdCA9IGZ1bmN0aW9uKGNhbGxDb250ZXh0LCByZWFzb24sIHJlc3VsdCkge1xuICAgIGlmIChyZWFzb24gPT09IEFjdGl2aXR5LnN0YXRlcy5jb21wbGV0ZSkge1xuICAgICAgICBpZiAoXy5pc0FycmF5KHJlc3VsdCkgJiYgcmVzdWx0Lmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGlkeCA9IDA7XG4gICAgICAgICAgICBsZXQgZGVjbGFyZSA9IF8uY2xvbmVEZWVwKHRoaXMuZGVjbGFyZSk7XG4gICAgICAgICAgICBsZXQgc2V0dXBUYXNrcyA9IFtdO1xuICAgICAgICAgICAgdGVtcGxhdGVIZWxwZXJzLnZpc2l0QWN0aXZpdGllcyhkZWNsYXJlLCBmdW5jdGlvbihtYXJrdXAsIHBhcmVudCwga2V5KSB7XG4gICAgICAgICAgICAgICAgc2V0dXBUYXNrcy5wdXNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRba2V5XSA9IHJlc3VsdFtpZHgrK107XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvciAobGV0IHQgb2Ygc2V0dXBUYXNrcykge1xuICAgICAgICAgICAgICAgIHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxDb250ZXh0LmNvbXBsZXRlKGRlY2xhcmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjYWxsQ29udGV4dC5lbmQocmVhc29uLCByZXN1bHQpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGU7Il19
