var Activity = require("./activity");
var util = require("util");
var guids = require("../common/guids");
var Declarator = require("./declarator");

function Composite()
{
    Declarator.call(this);
    this.__typeTag = guids.types.composite;
    this.reservedProperties.add("_implementation");
}

util.inherits(Composite, Declarator);

Composite.prototype.createImplementation = function ()
{
    throw new Error("Method 'createImplementation' not implemented.");
}

Composite.prototype.ensureImplementationCreated = function()
{
    if (this._implementation === undefined)
    {
        this._implementation = this.createImplementation();
        if (!(this._implementation instanceof Activity)) throw new Error("Method 'createImplementation' must return an activity.");
    }
}

Composite.prototype.run = function (context, args)
{
    if (!(this._implementation instanceof Activity)) throw new Error("Composite activity's implementation is not available.");
    Declarator.prototype.run.call(this, context, args);
}

Composite.prototype.varsDeclared = function (context, args)
{
    this.schedule(this._implementation, "_implInvoked");
}

Composite.prototype._implInvoked = function(context, reason, result)
{
    this.end(reason, result);
}

module.exports = Composite;