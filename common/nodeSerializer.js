function NodeSerializer(ignoreNativeFunc)
{
    this.ignoreNativeFunc = ignoreNativeFunc === true;
    this._knonwTypes = {};
}

NodeSerializer.prototype.registerKnownType = function (typeName, type)
{
    if (typeof typeName !== "string") throw new TypeError("Parameter 'alias' is not a string.");
    if (!type) throw new Error("Argument 'type' is expected.");
    var typeOfType = typeof type;
    switch  (typeOfType)
    {
        case "string":
            type = require(type);
            break;
        case "function":
            break;
        default :
            throw new TypeError("Argument 'type' value is unrecognised.");
    }
    if (type.prototype === undefined) throw new TypeError("Argument 'type' is not a constructor.");
    this._knonwTypes[typeName] = type.prototype;
}

NodeSerializer.prototype._setTypeTag = function (outputObj, obj)
{
    if (obj.constructor && obj.constructor !== Object)
    {
        for (var n in this._knonwTypes)
        {
            if (this._knonwTypes.hasOwnProperty(n))
            {
                var v = this._knonwTypes[n];
                if (v === obj.constructor.prototype)
                {
                    outputObj[NodeSerializer.TYPETAG] = n;
                    return;
                }
            }
        }
    }
}

NodeSerializer.prototype._setProto = function (obj)
{
    var typeTag = obj[NodeSerializer.TYPETAG];
    if (typeTag)
    {
        var type = this._knonwTypes[typeTag];
        if (type == undefined) throw new Error("Type '" + typeTag + "' has not been registered.");
        obj.__proto__ = type;
        delete obj[NodeSerializer.TYPETAG];
    }
}

NodeSerializer.prototype.stringify = function (obj)
{
    var json = this.toJSON(obj);
    return json === null ? null : JSON.stringify(json);
}

NodeSerializer.prototype.toJSON = function (obj)
{
    if (obj === undefined) throw new Error("Argument expected.");
    if (obj === null) return null;

    return this._serialize(obj, {}, {}, "$");
}

NodeSerializer.prototype._serialize = function (obj, outputObj, cache, path)
{
    cache[path] = obj;

    var key;
    for (key in obj)
    {
        if (obj.hasOwnProperty(key))
        {
            var subObject = obj[key];
            var typeOfSubObject = typeof subObject;
            if (typeOfSubObject === "object" && subObject !== null)
            {
                var subKey;
                var found = false;
                for (subKey in cache)
                {
                    if (cache.hasOwnProperty(subKey))
                    {
                        if (cache[subKey] === subObject)
                        {
                            outputObj[key] = NodeSerializer.CIRCULARFLAG + subKey;
                            found = true;
                        }
                    }
                }
                if (!found)
                {
                    outputObj[key] = this._serialize(subObject, {}, cache, path + NodeSerializer.KEYPATHSEPARATOR + key);
                }
            }
            else if (typeOfSubObject === "function")
            {
                var funcStr = subObject.toString();
                if (NodeSerializer.ISNATIVEFUNC.test(funcStr))
                {
                    if (this.ignoreNativeFunc)
                    {
                        funcStr = "function() {throw new Error('Call a native function unserialized')}";
                    }
                    else
                    {
                        throw new Error("Can't serialize a object with a native function property.");
                    }
                }
                outputObj[key] = NodeSerializer.FUNCFLAG + funcStr;
            }
            else
            {
                outputObj[key] = subObject;
            }
        }
    }

    this._setTypeTag(outputObj, obj);

    return outputObj;
};

NodeSerializer.prototype.parse = function (str)
{
    if (str === undefined) throw new Error("Argument expected.");
    if (str === null) return null;
    if (typeof str !== "string") throw new TypeError("Argument is not a string.");

    return this.fromJSON(JSON.parse(str));
}

NodeSerializer.prototype.fromJSON = function (json)
{
    if (json === undefined) throw new Error("Argument expected.");
    if (json === null) return null;

    return this._unserialize(json);
}

NodeSerializer.prototype._unserialize = function (obj, originObj)
{
    originObj = originObj || obj;

    var result = null;
    var circularTasks = [];
    var key;
    for (key in obj)
    {
        if (result === null) result = {};
        if (obj.hasOwnProperty(key))
        {
            var subObject = obj[key];
            var typeOfSubObj = typeof subObject;
            if (typeOfSubObj === "object")
            {
                result[key] = this._unserialize(subObject, originObj);
            }
            else if (typeOfSubObj === "string")
            {
                if (subObject.indexOf(NodeSerializer.FUNCFLAG) === 0)
                {
                    result[key] = eval("(" + subObject.substring(NodeSerializer.FUNCFLAG.length) + ")");
                }
                else if (subObject.indexOf(NodeSerializer.CIRCULARFLAG) === 0)
                {
                    result[key] = subObject.substring(NodeSerializer.CIRCULARFLAG.length);
                    circularTasks.push({obj: result, key: key});
                }
                else
                {
                    result[key] = subObject;
                }
            }
            else
            {
                result[key] = subObject;
            }
        }
    }

    if (originObj === obj)
    {
        circularTasks.forEach(
            function (task)
            {
                task.obj[task.key] = NodeSerializer._getKeyPath(result, task.obj[task.key]);
            });
    }

    if (result && typeof result == "object") this._setProto(result);

    return result;
};

NodeSerializer._getKeyPath = function (originObj, path)
{
    path = path.split(NodeSerializer.KEYPATHSEPARATOR);
    var currentObj = originObj;
    path.forEach(
        function (p, index)
        {
            if (index)
            {
                currentObj = currentObj[p];
            }
        });
    return currentObj;
};

NodeSerializer.FUNCFLAG = "_$$ND_FUNC$$_";
NodeSerializer.CIRCULARFLAG = "_$$ND_CC$$_";
NodeSerializer.KEYPATHSEPARATOR = "_$$.$$_";
NodeSerializer.TYPETAG = "_$$TAG_TYPE$$_";
NodeSerializer.ISNATIVEFUNC = /^function\s*[^(]*\(.*\)\s*\{\s*\[native code\]\s*\}$/;

module.exports = NodeSerializer;