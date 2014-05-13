function ScopeExtender(originalScope)
{
    this.currentScope = originalScope;
    this.restoreFields = {};
    this.originalFields = {};
    this.extended = false;

    for (var fieldName in originalScope)
    {
        this.originalFields[fieldName] = true;
    }
}

ScopeExtender.prototype.extend = function (scope)
{
    if (this.extended) throw new Error("Scope already extended.");

    for (var fieldName in scope)
    {
        if (this.currentScope[fieldName] != undefined)
        {
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

    self.restoreFields = {};

    self.extended = false;
}

ScopeExtender.prototype.getExtension = function()
{
    var self = this;
    var ext = {};
    for (var fieldName in self.currentScope)
    {
        if (self.originalFields[fieldName] == undefined)
        {
            ext[fieldName] = self.currentScope[fieldName];
        }
    }
    return ext;
}

module.exports = ScopeExtender;
