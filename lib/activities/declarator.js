var Activity = require("./activity");
var util = require("util");
var StrSet = require("backpack-node").collections.StrSet;
var is = require("../common/is");
var fast = require("fast.js");

function Declarator()
{
    Activity.call(this);
    this.nonScopedProperties.add("reservedProperties");
    this.nonScopedProperties.add("reserved");
    this.nonScopedProperties.add("promotedProperties");
    this.nonScopedProperties.add("promoted");
    this.nonScopedProperties.add("varsDeclared");

    // Properties those cannot be declared freely
    this.reservedProperties = new StrSet();

    // Properties those will be promoted during serialization
    this.promotedProperties = new StrSet();
}

util.inherits(Declarator, Activity);

Declarator.prototype.reserved = function (name, value)
{
    if (this.promotedProperties.exists(name)) throw new Error("Property '" + name + "' cannot be reserved because it's promoted.");
    if (is.defined(value)) this[name] = value;
    this.reservedProperties.add(name);
}

Activity.prototype.promoted = function (name, value)
{
    if (this.reservedProperties.exists(name)) throw new Error("Property '" + name + "' cannot be promoted because it's reserved.");
    if (is.defined(value)) this[name] = value;
    this.promotedProperties.add(name);
}

Declarator.prototype.run = function (callContext, args)
{
    var self = this;
    var activityVariables = [];
    self._activityVariableFieldNames = [];
    var resProps = callContext.activity.reservedProperties;
    fast.forEach(callContext.activity._getScopeKeys(), function (fieldName)
    {
        if (!resProps.exists(fieldName))
        {
            var fieldValue = self[fieldName];
            if (fieldValue instanceof Activity)
            {
                activityVariables.push(fieldValue);
                self._activityVariableFieldNames.push(fieldName);
            }
        }
    });

    if (activityVariables.length)
    {
        self._savedArgs = args;
        self.schedule(callContext, activityVariables, "_varsGot");
    }
    else
    {
        delete self._activityVariableFieldNames;
        callContext.activity.varsDeclared.call(self, callContext, args);
    }
}

Declarator.prototype._varsGot = function (callContext, reason, result)
{
    var self = this; 
    if (reason === Activity.states.complete)
    {
        var idx = 0;
        fast.forEach(self._activityVariableFieldNames, function(fieldName)
        {
            self[fieldName] = result[idx++];
        });
        var args = self._savedArgs;
        delete self._savedArgs;
        delete self._activityVariableFieldNames;
        callContext.activity.varsDeclared.call(self, callContext, args);
    }
    else
    {
        self.end(reason, result);
    }
}

Declarator.prototype.varsDeclared = function (callContext, args)
{
}

module.exports = Declarator;