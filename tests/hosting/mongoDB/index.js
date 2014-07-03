var tests = function()
{
    var mongoose = require('mongoose');
    return {
        mongoDbPresistence: require("./mongoDbPersistenceTests"),
        tearDown: function(done)
        {
            mongoose.disconnect(function ()
            {
                done();
            });
        }
    };
}

if (process.env.WF_TEST_MONGODB)
{
    module.exports = tests();
}