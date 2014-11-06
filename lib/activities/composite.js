var Activity = require("./activity");
var util = require("util");
var guids = require("../common/guids");
var Declarator = require("./declarator");
var is = require("../common/is");
var _ = require("lodash");
var activityMarkup = require("./activityMarkup");

function Composite() {
    Declarator.call(this);
    this[guids.types.composite] = true;
    this.reservedProperties.add("_implementation");
    this.nonSerializedProperties.add("_implementation");
    this.nonScopedProperties.add("createImplementation");
    this.nonScopedProperties.add("ensureImplementationCreated");
    this.nonScopedProperties.add(guids.types.composite);
}

util.inherits(Composite, Declarator);

Composite.prototype.forEachImmediateChild = function (f) {
    this.ensureImplementationCreated();
    Declarator.prototype.forEachImmediateChild.call(this, f);
}

Composite.prototype._forEach = function (f, visited, except) {
    this.ensureImplementationCreated();
    Declarator.prototype._forEach.call(this, f, visited, except);
}

Composite.prototype.createImplementation = function () {
    throw new Error("Method 'createImplementation' not implemented.");
}

Composite.prototype.ensureImplementationCreated = function () {
    if (is.undefined(this._implementation)) {
        this._implementation = this.createImplementation();
        if (_.isPlainObject(this._implementation)) this._implementation = activityMarkup.parse(this._implementation);
        if (!(this._implementation instanceof Activity)) throw new Error("Method 'createImplementation' must return an activity.");
    }
}

Composite.prototype.run = function (callContext, args) {
    if (!(this.get("_implementation") instanceof Activity)) throw new Error("Composite activity's implementation is not available.");
    Declarator.prototype.run.call(this, callContext, args);
}

Composite.prototype.varsDeclared = function (callContext, args) {
    callContext.schedule(this.get("_implementation"), "_implInvoked");
}

Composite.prototype._implInvoked = function (callContext, reason, result) {
    callContext.end(reason, result);
}

module.exports = Composite;