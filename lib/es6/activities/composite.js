"use strict";

let Activity = require("./activity");
let util = require("util");
let guids = require("../common/guids");
let Declarator = require("./declarator");
let is = require("../common/is");
let _ = require("lodash");
let activityMarkup = require("./activityMarkup");

function Composite() {
    Declarator.call(this);

    this.reservedProperties.add("_implementation");
    this.nonSerializedProperties.add("_implementation");
    this.nonScopedProperties.add("createImplementation");
    this.nonScopedProperties.add("ensureImplementationCreated");
    this.nonScopedProperties.add("implementationCompleted");
}

util.inherits(Composite, Declarator);

Composite.prototype._children = function () {
    this.ensureImplementationCreated();
    return Declarator.prototype._children.apply(this, arguments);
};

Composite.prototype.createImplementation = function () {
    throw new Error("Method 'createImplementation' not implemented.");
};

Composite.prototype.ensureImplementationCreated = function () {
    if (_.isUndefined(this._implementation)) {
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
    if (!(this._implementation instanceof Activity)) {
        throw new Error("Composite activity's implementation is not available.");
    }
    Declarator.prototype.run.call(this, callContext, args);
};

Composite.prototype.varsDeclared = function (callContext, args) {
    callContext.schedule(this._implementation, "_implInvoked");
};

Composite.prototype._implInvoked = function (callContext, reason, result) {
    callContext.activity.implementationCompleted.call(this, callContext, reason, result);
};

Composite.prototype.implementationCompleted = function (callContext, reason, result) {
    callContext.end(reason, result);
};

module.exports = Composite;