var Guid = require("guid");
var _ = require("lodash");

function WFObject(initArgs)
{
    if (_.isPlainObject(initArgs)) _.extend(this, initArgs);
    this._instanceId = Guid.create().toString();
}

Object.defineProperties(WFObject.prototype, {
    _keys: {
        value: null,
        writable: true,
        enumerable: false
    }
})

WFObject.prototype._getMapKey = function()
{
    return this._instanceId;
}

WFObject.prototype.getKeys = function()
{
    if (!this._keys)
    {
        var keys = [];
        for (var k in this) keys.push(k);
        this._keys = keys;
    }
    return this._keys;
}

WFObject.prototype.clearKeys = function()
{
    this._keys = null;
}

module.exports = WFObject;