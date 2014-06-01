var Guid = require("guid");

function WFObject()
{
    this._instanceId = Guid.create().toString();
}

WFObject.prototype._getMapKey = function()
{
    return this._instanceId;
}

module.exports = WFObject;