function NodeSerializer(ignoreNativeFunc)
{
    this.ignoreNativeFunc = ignoreNativeFunc === true;
    this._knonwTypes = {};
}

NodeSerializer.prototype.addKnownType = function (typeName, type)
{
    if (typeof typeName !== "string") throw new TypeError("Parameter 'alias' is not a string.");
    if (!type) throw new Error("Argument 'type' is expected.");
    var typeOfType = typeof type;
    if (typeOfType === "string" || typeOfType === "object" || typeOfType === "function")
    {
        this._knonwTypes[typeName] = type;
    }
    else
    {
        throw new TypeError("Argument 'type' value is unrecognised.");
    }
}

NodeSerializer.prototype._setupPrototype = function (obj, typeName)
{
    var type = this._knonwTypes[typeName];
    if (type == undefined) throw new Error("Cannot create instance of type '" + typeName + "' because it is not known. Consider using of addKnownType method for type registration.");
    var typeOfType = typeof type;
    if (typeOfType === "function")
    {
        type = type();
    }
    else if (typeOfType === "string")
    {
        type = require(type);
    }
    obj.__proto__ = type.prototype;
}

NodeSerializer.prototype._setProtoTag = function (obj, outputObj)
{
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
                    var serializedSubObject = this._serialize(subObject, {}, cache, path + NodeSerializer.KEYPATHSEPARATOR + key);
                    
                    outputObj[key] = serializedSubObject;
                }
            }
            else if (typeOfSubObject === "function")
            {
                var funcStr = subObject.toString();
                if (NodeSerializer.ISNATIVEFUNC.test(funcStr))
                {
                    if (ignoreNativeFunc)
                    {
                        funcStr = "function() {throw new Error('Call a native function unserialized')}";
                    }
                    else
                    {
                        throw new Error("Can't serialize a object with a native function property. Use serialize(obj, true) to ignore the error.");
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

    return outputObj;
};

NodeSerializer.prototype.parse = function (str)
{
    if (str === undefined) throw new Error("Argument expected.");
    if (str === null) return null;
    if (typeof str !== "string") throw new TypeError("Argument is not a string.");

    return this._unserialize(JSON.parse(str));
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

    var circularTasks = [];
    var key;
    for (key in obj)
    {
        if (obj.hasOwnProperty(key))
        {
            if (typeof obj[key] === "object")
            {
                obj[key] = this._unserialize(obj[key], originObj);
            }
            else if (typeof obj[key] === "string")
            {
                if (obj[key].indexOf(NodeSerializer.FUNCFLAG) === 0)
                {
                    obj[key] = eval("(" + obj[key].substring(NodeSerializer.FUNCFLAG.length) + ")");
                }
                else if (obj[key].indexOf(NodeSerializer.CIRCULARFLAG) === 0)
                {
                    obj[key] = obj[key].substring(NodeSerializer.CIRCULARFLAG.length);
                    circularTasks.push({obj: obj, key: key});
                }
            }
        }
    }

    if (originObj === obj)
    {
        circularTasks.forEach(
            function (task)
            {
                task.obj[task.key] = NodeSerializer._getKeyPath(originObj, task.obj[task.key]);
            });
    }

    return obj;
};

NodeSerializer._getKeyPath = function (obj, path)
{
    path = path.split(KEYPATHSEPARATOR);
    var currentObj = obj;
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
NodeSerializer.ISNATIVEFUNC = /^function\s*[^(]*\(.*\)\s*\{\s*\[native code\]\s*\}$/;

module.exports = NodeSerializer;