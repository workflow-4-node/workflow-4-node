var Reflect = require("harmony-reflect");

module.exports.create = function(scopeTree)
{
    return new Proxy(scopeTree,
    {
        has: function(target, name)
        {
            return target.hasProperty(name);
        },

        get: function (target, name)
        {
            return target.getValue(name);
        },

        set: function (target, name, value)
        {
            return target.setValue(name, value);
        },

        deleteProperty: function (target, name)
        {
            return target.deleteProperty(name);
        },

        enumerate: function (target)
        {
            return target.enumeratePropertyNames();
        }
    });
}
