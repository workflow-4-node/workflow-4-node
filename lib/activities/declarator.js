var Activity = require("./activity");
var util = require("util");
var StrSet = require("backpack-node").collections.StrSet;

function Declarator()
{
    Activity.call(this);
    this.nonScopedProperties.add("reservedProperties");
    this.nonScopedProperties.add("reserved");
    this.nonScopedProperties.add("promotedProperties");
    this.nonScopedProperties.add("promoted");
    this.reservedProperties = new StrSet();
    this.promotedProperties = new StrSet();
}

util.inherits(Declarator, Activity);

Declarator.prototype.reserved = function (name, value)
{
    if (this.promotedProperties.exists(name)) throw new Error("Property '" + name + "' cannot be reserved because it's promoted.");
    if (value !== undefined) this[name] = value;
    this.reservedProperties.add(name);
}

Activity.prototype.promoted = function (name, value)
{
    if (this.reservedProperties.exists(name)) throw new Error("Property '" + name + "' cannot be promoted because it's reserved.");
    if (value !== undefined) this[name] = value;
    this.promotedProperties.add(name);
}

Declarator.prototype.run = function (context, args)
{
    var activityVariables = [];
    this._activityVariableFieldNames = [];
    for (var fieldName in this)
    {
        if (this.hasOwnProperty(fieldName))
        {
            if (this.activity.constructor.prototype[fieldName] === undefined && !this.activity.reservedProperties.exists(fieldName) && !this.activity.nonScopedProperties.exists(fieldName))
            {
                var fieldValue = this[fieldName];
                if (fieldValue instanceof Activity)
                {
                    activityVariables.push(fieldValue);
                    this._activityVariableFieldNames.push(fieldName);
                }
            }
        }
    }
    if (activityVariables.length)
    {
        this._args = args;
        this.schedule(activityVariables, "_varsGot")
    }
    else
    {
        delete this._activityVariableFieldNames;
        this.activity.varsDeclared.call(this, context, args);
    }
}

Declarator.prototype._varsGot = function (context, reason, result)
{
    var self = this; 
    if (reason == Activity.states.complete)
    {
        var idx = 0;
        self._activityVariableFieldNames.forEach(function(fieldName)
        {
            self[fieldName] = result[idx++];
        });
        var args = self._args;
        delete self._args;
        delete self._activityVariableFieldNames;
        self.activity.varsDeclared.call(self, context, args);
    }
    else
    {
        self.end(reason, result);
    }
}

Declarator.prototype.varsDeclared = function (context, args)
{
}

module.exports = Declarator;