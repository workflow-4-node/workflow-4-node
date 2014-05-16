var guids = require("./guids");
var _ = require("underscore-node");

function ScopeExtender(originalScope)
{
    this.currentScope = originalScope;
    this.restoreFields = {};
    this.originalFields = {};
    this.privateFields = {};
    this.extended = false;
    this.originalVariableFieldNames = this._getVariableFieldNames(originalScope);
    this.currentVariableFieldNames = {};
    _.extend(this.currentVariableFieldNames, this.originalVariableFieldNames);
    this.newVariableFieldNames = {};

    for (var fieldName in originalScope)
    {
        this.originalFields[fieldName] = true;
    }
}

ScopeExtender.prototype._getVariableFieldNames = function (scope)
{
    var names = {};
    if (_.isArray(scope[guids.markers.variableFieldNames]))
    {
        scope[guids.markers.variableFieldNames].forEach(function (fieldName)
        {
            names[fieldName] = true;
        });
    }
    return names;
}

ScopeExtender.prototype.extend = function (scope)
{
    if (this.extended) throw new Error("Scope already extended.");

    // Handle variables:
    this.newVariableFieldNames = this._getVariableFieldNames(scope);
    _.extend(this.currentVariableFieldNames, this.newVariableFieldNames);

    // Handle privates:
    for (var fieldName in this.currentScope)
    {
        if (fieldName[0] == "_")
        {
            this.privateFields[fieldName] = this.currentScope[fieldName];
            delete this.currentScope[fieldName];
        }
    }

    // Handle overridable publics:
    for (var fieldName in scope)
    {
        if (this.currentVariableFieldNames[fieldName] == undefined && this.currentScope[fieldName] != undefined)
        {
            // If this is not a variable:
            // Current scope field will be overridden by the new scope same named field.
            // We should remember the original field value to be able to restore it later.
            this.restoreFields[fieldName] = this.currentScope[fieldName];
        }
        this.currentScope[fieldName] = scope[fieldName];
    }

    this.extended = true;
}

ScopeExtender.prototype.undo = function()
{
    var self = this;
    
    if (!self.extended) throw new Error("Scope is not extended.");

    // First we will restore overridden fields:
    for (var fieldName in self.restoreFields)
    {
        self.currentScope[fieldName] = self.restoreFields[fieldName];
    }

    // Then we delete all fields that was not defined on original scope:
    var toDel = [];
    for (var fieldName in self.currentScope)
    {
        if (self.originalFields[fieldName] == undefined)
        {
            toDel.push(fieldName);
        }
    }

    toDel.forEach(
        function(n)
        {
            delete self.currentScope[n];
        });

    // Lastly we will restore private fields:
    for (var fieldName in self.privateFields)
    {
        self.currentScope[fieldName] = self.privateFields[fieldName];
    }

    self.restoreFields = {};
    self.privateFields = {};
    self.currentVariableFieldNames = _.extend({}, this.originalVariableFieldNames);

    self.extended = false;
}

ScopeExtender.prototype.getExtension = function()
{
    var self = this;
    var ext = {};
    for (var fieldName in self.currentScope)
    {
        var originalValue = self.originalFields[fieldName];
        var currentValue = self.currentScope[fieldName];
        if (originalValue !== currentValue)
        {
            ext[fieldName] = self.currentScope[fieldName];
        }
    }
    return ext;
}

module.exports = ScopeExtender;
