var _ = require("lodash");
var guids = require("./guids");

module.exports = {
    activity: function(obj)
    {
        return _.isObject(obj) && obj[guids.types.activity];
    },

    composite: function(obj)
    {
        return _.isObject(obj) && obj[guids.types.composite];
    }
};
