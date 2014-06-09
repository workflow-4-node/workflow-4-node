var StrMap = require("backpack-node").collections.StrMap;
var specStrings = require("../common/specStrings");

function InstIdPaths()
{
    this._map = new StrMap();
}

InstIdPaths.prototype.add = function (workflowName, methodName, instanceIdPath)
{
    var key = specStrings.hosting.doubleKeys(workflowName, methodName);
    var inner = this._map.get(key);
    if (!inner)
    {
        inner = new StrMap();
        this._map.add(key, inner);
    }
    var count = inner.get(instanceIdPath);
    if (count === undefined)
    {
        inner.add(instanceIdPath, 1);
    }
    else
    {
        inner.set(instanceIdPath, count + 1);
    }
}

InstIdPaths.prototype.remove = function (workflowName, methodName, instanceIdPath)
{
    var key = specStrings.hosting.doubleKeys(workflowName, methodName);
    var inner = this._map.get(key);
    if (inner)
    {
        var count = inner.get(instanceIdPath);
        if (count !== undefined)
        {
            if (count === 1)
            {
                this._map.remove(key);
            }
            else
            {
                inner.set(instanceIdPath, count - 1);
            }
        }
    }
    return false;
}

InstIdPaths.prototype.forEach = function (workflowName, methodName, f)
{
    var key = specStrings.hosting.doubleKeys(workflowName, methodName);
    var inner = this._map.get(key);
    if (inner) inner.forEachKey(f);
}

module.exports = InstIdPaths;
