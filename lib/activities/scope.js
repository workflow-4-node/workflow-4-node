var Reflect = require("harmony-reflect");

module.exports.create = function(scopeTree, node)
{
    return new Proxy(scopeTree,
    {
        has: function(target, name)
        {
            return target.hasProperty(node, name);
        },

        get: function (target, name)
        {
            return target.getValue(node, name);
        },

        set: function (target, name, value)
        {
            return target.setValue(node, name, value);
        },

        deleteProperty: function (target, name)
        {
            return target.deleteProperty(node, name);
        },

        enumerate: function (target)
        {
            return target.enumeratePropertyNames(node);
        }
    });
}
