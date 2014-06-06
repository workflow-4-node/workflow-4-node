var StrMap = require("backpack-node").collections.StrMap;
var Bag = require("backpack-node").collections.Bag;
var Names = require("./names");

function KnownInstaStore()
{
    this._instances = new StrMap();
    this._paths = new Bag();
}

KnownInstaStore.prototype.add = function (workflowName, instanceId, insta)
{
    var self = this;
    self._instances.add(workflowName + instanceId.toString(), insta);
    insta.idleMethods.forEach(function(m)
    {
        self._paths.add(
            new Names(insta.workflowName, m.methodName),
            {
                value: m.instanceIdPath,
                instanceId: insta.Id
            });
    });
}

KnownInstaStore.prototype.get = function (workflowName, instanceId)
{
    return this._instances.get(workflowName + instanceId.toString());
}

KnownInstaStore.prototype.remove = function (workflowName, instanceId)
{
    var self = this;
    var key = workflowName + instanceId.toString();
    var insta = this._instances.get(key);
    if (insta)
    {
        self._instances.remove(key);
        insta.idleMethods.forEach(function(m)
        {
            self._paths.remove(new Names(insta.workflowName, m.methodName));
        });
    }
}

module.exports = KnownInstaStore;
