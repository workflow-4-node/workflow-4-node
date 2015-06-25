"use strict";

let Activity = require("./activity");
let util = require("util");
let guids = require("../common/guids");
let Declarator = require("./declarator");
let is = require("../common/is");
let _ = require("lodash");
let activityMarkup = require("./activityMarkup");
let StrSet = require("backpack-node").collections.StrSet;

function Composite() {
    Declarator.call(this);
    this[guids.types.composite] = true;

    this.reservedProperties.add("_implementation");
    this.nonSerializedProperties.add("_implementation");
    this.nonScopedProperties.add("createImplementation");
    this.nonScopedProperties.add("ensureImplementationCreated");
    this.nonScopedProperties.add(guids.types.composite);
    this.nonScopedProperties.add("implementationCompleted");
}

util.inherits(Composite, Declarator);

Composite.prototype.forEachImmediateChild = function (f) {
    this.ensureImplementationCreated();
    Declarator.prototype.forEachImmediateChild.call(this, f);
};

Composite.prototype._forEach = function (f, visited, except) {
    this.ensureImplementationCreated();
    Declarator.prototype._forEach.call(this, f, visited, except);
};

Composite.prototype.createImplementation = function () {
    throw new Error("Method 'createImplementation' not implemented.");
};

Composite.prototype.ensureImplementationCreated = function () {
    if (is.undefined(this._implementation)) {
        this._implementation = this.createImplementation();
        if (_.isPlainObject(this._implementation)) {
            this._implementation = activityMarkup.parse(this._implementation);
        }
        if (!(this._implementation instanceof Activity)) {
            throw new Error("Method 'createImplementation' must return an activity.");
        }
    }
};

Composite.prototype.initializeStructure = function () {
    this.ensureImplementationCreated();
};

Composite.prototype.run = function (callContext, args) {
    if (!(this.get("_implementation") instanceof Activity)) {
        throw new Error("Composite activity's implementation is not available.");
    }
    Declarator.prototype.run.call(this, callContext, args);
};

Composite.prototype.varsDeclared = function (callContext, args) {
    callContext.schedule(this.get("_implementation"), "_implInvoked");
};

Composite.prototype._implInvoked = function (callContext, reason, result) {
    callContext.activity.implementationCompleted.call(this, callContext, reason, result);
};

Composite.prototype.implementationCompleted = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = Composite;