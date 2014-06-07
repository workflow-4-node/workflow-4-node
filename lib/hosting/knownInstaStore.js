var StrMap = require("backpack-node").collections.StrMap;
var StrBag = require("backpack-node").collections.StrBag;
var specStrings = require("../common/specStrings");

function KnownInstaStore(savePaths)
{
    this._instances = new StrMap();
    if (savePaths) this._paths = new StrBag();
}

KnownInstaStore.prototype.add = function (workflowName, insta)
{
    var self = this;
    self._instances.add(specStrings.hosting.doubleKeys(workflowName, insta.id), insta);
    if (self._paths)
    {
        insta.idleMethods.forEach(
            function (m)
            {
                self._paths.add(
                    specStrings.hosting.doubleKeys(insta.workflowName, m.methodName),
                    {
                        value: m.instanceIdPath,
                        instanceId: insta.id
                    });
            });
    }
}

KnownInstaStore.prototype.get = function (workflowName, instanceId)
{
    return this._instances.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
}

KnownInstaStore.prototype.getRunningInstanceIdPaths = function (workflowName, methodName)
{
    if (!this._paths) throw new Error("Paths are not saved!");
    var result = [];
    var key = specStrings.hosting.doubleKeys(workflowName, methodName);
    this._paths.forEachValueIn(key, function(path)
    {
        result.push(path);
    });
    return result;
}

KnownInstaStore.prototype.remove = function (workflowName, instanceId)
{
    var self = this;
    var key = specStrings.hosting.doubleKeys(workflowName, instanceId);
    if (self._paths)
    {
        var insta = this._instances.get(key);
        if (insta)
        {
            self._instances.remove(key);
            insta.idleMethods.forEach(
                function (m)
                {
                    self._paths.remove(specStrings.hosting.doubleKeys(insta.workflowName, m.methodName));
                });
        }
    }
    else
    {
        self._instances.remove(key);
    }
}

module.exports = KnownInstaStore;
