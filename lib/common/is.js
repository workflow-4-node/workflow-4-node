var _ = require("lodash");
var guids = require("./guids");

module.exports = {
    activity: function(obj)
    {
        "use strict";

        return _.isObject(obj) && (obj.__typeTag === guids.types.activity || obj.__typeTag === guids.types.composite);
    },

    composite: function(obj)
    {
        "use strict";

        return _.isObject(obj) && (obj.__typeTag === guids.types.composite);
    }
};
