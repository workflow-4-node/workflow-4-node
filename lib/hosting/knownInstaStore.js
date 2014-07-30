var StrMap = require("backpack-node").collections.StrMap;
var specStrings = require("../common/specStrings");
var InstIdPaths = require("./instIdPaths");
var fast = require("fast.js");

function KnownInstaStore(savePaths)
{
    this._instances = new StrMap();
    if (savePaths) this._paths = new InstIdPaths();
}

KnownInstaStore.prototype.add = function (workflowName, insta)
{
    var self = this;
    self._instances.add(specStrings.hosting.doubleKeys(workflowName, insta.id), insta);
    if (self._paths)
    {
        fast.forEach(insta.idleMethods,
            function (m)
            {
                self._paths.add(insta.workflowName, m.methodName, m.instanceIdPath);
            });
    }
}

KnownInstaStore.prototype.get = function (workflowName, instanceId)
{
    return this._instances.get(specStrings.hosting.doubleKeys(workflowName, instanceId));
}

KnownInstaStore.prototype.exists = function (workflowName, instanceId)
{
    return this._instances.containsKey(specStrings.hosting.doubleKeys(workflowName, instanceId));
}

KnownInstaStore.prototype.getInstanceIdPaths = function (workflowName, methodName)
{
    if (!this._paths) throw new Error("Paths are not saved!");
    var result = [];
    this._paths.forEach(
        workflowName, methodName,
        function (p)
        {
            result.push(p);
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
            fast.forEach(insta.idleMethods,
                function (m)
                {
                    self._paths.remove(insta.workflowName, m.methodName, m.instanceIdPath);
                });
        }
    }
    else
    {
        self._instances.remove(key);
    }
}

module.exports = KnownInstaStore;
