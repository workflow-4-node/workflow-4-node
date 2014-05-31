var _ = require("underscore-node");

function InstanceIdParser()
{
    this._cache = {};
}

InstanceIdParser.prototype.parse = function (path, obj)
{
    if (!obj) throw new Error("Argument 'obj' expected.");
    if (!_(path).isString()) throw new TypeError("Argument 'path' is not a string.");

    var parser = this._cache[path];
    if (parser === undefined) this._cache[path] = parser = this._createParser(path.split("."));

    return parser(obj);
}

InstanceIdParser.prototype._createParser = function(fragments)
{
    if (fragments.length)
    {
        var top = fragments.shift();
        var idx = top.indexOf("[");
        if (idx > 0)
        {
            fragments.unshift(top.substr(idx));
            top = top.substr(0, idx);
        }

        var code;
        if (top.length > 2 && top[0] == "[" && top[top.length - 1] == "]")
        {
            code = "p" + top;
        }
        else
        {
            code = "p[\"" + top + "\"]";
        }

        var prevParser = this._createParser(fragments);
        if (prevParser)
        {
            var f = new Function("p,f", "return f(" + code + ");");
            return function (a)
            {
                return f(a, prevParser);
            };
        }
        else
        {
            var f = new Function("p", "return (" + code + ");");
            return f;
        }
    }
    else
    {
        return null;
    }
}

module.exports = InstanceIdParser;
