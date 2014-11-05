module.exports.create = function (scopeTree, node) {
    return Proxy.create(
        {
            has: function (name) {
                return scopeTree.hasProperty(node, name);
            },

            get: function (target, name) {
                return scopeTree.getValue(node, name);
            },

            set: function (target, name, value) {
                return scopeTree.setValue(node, name, value);
            },

            delete: function (name) {
                return scopeTree.deleteProperty(node, name);
            },

            enumerate: function (target) {
                return scopeTree.enumeratePropertyNames(node);
            }
        });
}
