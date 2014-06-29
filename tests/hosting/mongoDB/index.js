var tests = function()
{
    return {
        mongoDbPresistence: require("./mongoDbPersistenceTests")
    };
}

if (process.env.WF_TEST_MONGODB)
{
    module.exports = tests();
}