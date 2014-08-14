var _ = require("lodash");
var is = require("../common/is");
var fast = require("fast.js");

function InstanceIdParser()
{
    this._cache = {};
}

InstanceIdParser.prototype.parse = function (path, obj)
{
    if (!obj) throw new Error("Argument 'obj' expected.");
    if (!_(path).isString()) throw new TypeError("Argument 'path' is not a string.");

    var parser = this._cache[path];
    if (is.undefined(parser)) this._cache[path] = parser = this._createParser(path);

    var result = fast.try(function()
    {
        return parser.call(obj);
    });

    if (!(result instanceof Error)) return result;
}

InstanceIdParser.prototype._createParser = function(path)
{
    if (path.indexOf("this") != 0)
    {
        if (path[0] === "[")
        {
            path = "this" + path;
        }
        else
        {
            path = "this." + path;
        }
    }

    return new Function("return (" + path + ").toString();");
}

module.exports = InstanceIdParser;
