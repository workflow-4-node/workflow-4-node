var Activity = require("./activity");
var util = require("util");
var StrSet = require("backpack-node").collections.StrSet;

function Declarator()
{
    Activity.call(this);
    this.nonScopedProperties.add("reservedProperties");
    this.nonScopedProperties.add("reserved");
    this.reservedProperties = new StrSet();
}

util.inherits(Declarator, Activity);

Declarator.prototype.reserved = function (name, value)
{
    this[name] = value;
    this.reservedProperties.add(name);
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
        this.varsDeclared(context, args);
    }
}

Declarator.prototype._varsGot = function (context, reason, result)
{
    if (reason == Activity.states.complete)
    {
        var idx = 0;
        this._activityVariableFieldNames.forEach(function(fieldName)
        {
            this[fieldName] = result[idx++];
        });
        var args = this._args;
        delete this._args;
        delete this._activityVariableFieldNames;
        this.varsDeclared(context, args);
    }
    else
    {
        this.end(reason, result);
    }
}

Declarator.prototype.varsDeclared = function (context, args)
{
}

module.exports = Declarator;