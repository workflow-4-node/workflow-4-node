function Serializer(impl)
{
    this._impl = impl;
}

Serializer.prototype.serialize = function (obj)
{
    if (obj === undefined) throw new Error("Argument expected.");
    if (obj === null) return null;

    return this._impl.serialize(obj);
}

Serializer.prototype.deserialize = function (json)
{
    if (json === undefined) throw new Error("Argument expected.");
    if (json === null) return null;

    return this._impl.deserialize(json);
}

module.exports = Serializer;
