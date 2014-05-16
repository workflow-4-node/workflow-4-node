var Activity = require("./activity");
var util = require("util");

function Declarator()
{
    Activity.call(this);
    this._reserved = [];
    this.asNonScoped("_reserved");
    this.asReserved("activity");
}

util.inherits(Declarator, Activity);

Declarator.prototype.asReserved = function(fieldName)
{
    this._reserved.push(fieldName);
}

Declarator.prototype.run = function (context, args)
{
    var vars = [];
    this._varFields = [];
    for (var fieldName in this)
    {
        if (this.activity._reserved.indexOf(fieldName) == -1 && this.activity._nonScoped.indexOf(fieldName) == -1)
        {
            var fieldValue = this[fieldName];
            if (fieldValue instanceof Activity)
            {
                vars.push(fieldValue);
                this._varFields.push(fieldName);
            }
        }
    }
    if (vars.length)
    {
        this._args = args;
        this.schedule(vars, "_varsGot")
    }
    else
    {
        delete this._varFields;
        this.varsDeclared(context, args);
    }
}

Declarator.prototype._varsGot = function (context, reason, result)
{
    if (reason == Activity.states.complete)
    {
        var idx = 0;
        this._varFields.forEach(function(fieldName)
        {
            this[fieldName] = result[idx++];
        });
        var args = this._args;
        delete this._args;
        delete this._varFields;
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