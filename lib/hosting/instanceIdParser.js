var _ = require("lodash");

function InstanceIdParser()
{
    this._cache = {};
}

InstanceIdParser.prototype.parse = function (path, obj)
{
    if (!obj) throw new Error("Argument 'obj' expected.");
    if (!_(path).isString()) throw new TypeError("Argument 'path' is not a string.");

    var parser = this._cache[path];
    if (parser === undefined) this._cache[path] = parser = this._createParser(path);

    return parser.call(obj);
}

InstanceIdParser.prototype._createParser = function(path)
{
    if (path.indexOf("this") != 0)
    {
        if (path[0] !== "[")
        {
            path = "this." + path;
        }
        else
        {
            path = "this" + path;
        }
    }

    return new Function("return (" + path + ");");
}

module.exports = InstanceIdParser;
