module.exports.create = function (scopeTree, node, noWalk) {
    // Cannot use proxy because of current v8 proxy issues
    var obj = {
        has: function (name) {
            return scopeTree.hasProperty(node, name, noWalk);
        },

        get: function (name) {
            return scopeTree.getValue(node, name, noWalk);
        },

        set: function (name, value) {
            scopeTree.setValue(node, name, value, noWalk);
            return value;
        },

        inc: function(name) {
            return obj.set(name, obj.get(name) + 1);
        },

        dec: function(name) {
            return obj.set(name, obj.get(name) - 1);
        },

        postfixInc: function(name) {
            var v = obj.get(name);
            obj.set(name, v + 1);
            return v;
        },

        postfixDec: function(name) {
            var v = obj.get(name);
            obj.set(name, v - 1);
            return v;
        },

        add: function(name, value) {
            return obj.set(name, obj.get(name) + value);
        },

        subtract: function(name, value) {
            return obj.set(name, obj.get(name) - value);
        },

        delete: function (name) {
            return scopeTree.deleteProperty(node, name);
        }
    };

    return obj;
    //return Proxy.create(
    //    {
    //        has: function (name) {
    //            return scopeTree.hasProperty(node, name);
    //        },
    //
    //        get: function (target, name) {
    //            return scopeTree.getValue(node, name);
    //        },
    //
    //        set: function (target, name, value) {
    //            return scopeTree.setValue(node, name, value);
    //        },
    //
    //        delete: function (name) {
    //            return scopeTree.deleteProperty(node, name);
    //        },
    //
    //        enumerate: function (target) {
    //            return scopeTree.enumeratePropertyNames(node);
    //        }
    //    });
}
