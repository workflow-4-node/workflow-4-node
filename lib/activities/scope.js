module.exports.create = function (scopeTree, node) {
    // Cannot use proxy because of current v8 proxy issues
    //return {
    //    has: function (name) {
    //        return scopeTree.hasProperty(node, name);
    //    },
    //
    //    get: function (name) {
    //        return scopeTree.getValue(node, name);
    //    },
    //
    //    set: function (name, value) {
    //        return scopeTree.setValue(node, name, value);
    //    },
    //
    //    delete: function (name) {
    //        return scopeTree.deleteProperty(node, name);
    //    }
    //};
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
