var InstanceIdParser = require("../../").hosting.InstanceIdParser;

module.exports = {
    instanceIdParserTests: function (test)
    {
        try
        {
            var p = new InstanceIdParser();
            test.equals(p.parse("[0]", [1]), 1);
            test.equals(p.parse("[0]", [4,5]), 4);
            test.equals(p.parse("[1].id", [{ id: 1 }, { id: 2 }]), 2);
            test.equals(p.parse("id[0].a", { id: [ { a: "foo" } ] }), "foo");
        }
        catch (e)
        {
            test.ifError(e);
        }
        finally
        {
            test.done();
        }
    }
}
