var _ = require("underscore-node");
var ex = require("./activityExceptions");
var Activity = require("./Activity");

function ActivityMarkup()
{
    this._knonwTypes = {};
    this._registerSystemTypes();
}

ActivityMarkup.prototype._registerSystemTypes = function()
{
    this.registerType("workflow", "./workflow");
    this.registerType("expression", "./expression");
    this.registerType("func", "./func");
    this.registerType("block", "./block");
    this.registerType("parallel", "./parallel");
    this.registerType("pick", "./pick");
    this.registerType("resumeBookmark", "./resumeBookmark");
    this.registerType("waitForBookmark", "./waitForBookmark");
    this.registerType("beginMethod", "./beginMethod");
    this.registerType("endMethod", "./endMethod");
    this.registerType("assign", "./assign");
}

ActivityMarkup.prototype.registerType = function (alias, type)
{
    if (!_.isString(alias)) throw new TypeError("Parameter 'alias' is not a string.");
    if (!_.isString(type)) this._verifyIsActivityType(type);
    this._knonwTypes[alias] = type;
}

ActivityMarkup.prototype._verifyIsActivityType = function (type)
{
    var sup = type.super_;
    var isA;
    if (sup)
    {
        isA = sup.name == Activity.name;
        while (sup && !isA)
        {
            sup = sup.super_;
            isA = sup.name == Activity.name;
        }
    }
    else
    {
        isA = false;
    }
    if (!isA) throw new TypeError("Parameter 'type' is not an activity type.");
}

ActivityMarkup.prototype.parse = function (markup)
{
    if (!markup) throw new TypeError("Parameter 'markup' expected.");
    if (_.isString(markup)) markup = JSON.parse(markup);
    if (_.isArray(markup) || !_.isObject(markup)) throw new TypeError("Parameter 'markup' is not an object.");

    return this._createActivity(markup);
}

ActivityMarkup.prototype._createActivity = function (markup)
{
    var filedNames = _.keys(markup);
    if (filedNames.length != 1) throw new ex.ActivityMarkupError("There should be one field." + this._errorHint(markup));

    var activityAlias = filedNames[0];
    return this._createActivityInstance(activityAlias, markup);
}

ActivityMarkup.prototype._createActivityInstance = function (alias, markup)
{
    var type = this._knonwTypes[alias];
    if (type == undefined) throw new ex.ActivityMarkupError("Unknown activity alias '" + alias + "'." + this._errorHint(markup));
    if (_.isString(type))
    {
        type = require(type);
        this._verifyIsActivityType(type);
    }
    var activity = new type();
    var pars = markup[alias];
    if (pars) this._setupActivity(activity, pars);
    return activity;
}

ActivityMarkup.prototype._setupActivity = function (activity, markup)
{
    var self = this;
    if (_.isArray(markup))
    {
        // args
        activity.args = [];
        markup.forEach(
            function (obj)
            {
                activity.args.push(self._createValue(obj));
            });
    }
    else if (_.isObject(markup))
    {
        // values
        for (var fieldName in markup)
        {
            if (fieldName == "args")
            {
                var v = self._createValue(markup[fieldName], true);
                if (!_.isArray(v)) v = [v];
                activity.args = v;
            }
            else
            {
                activity[fieldName] = self._createValue(markup[fieldName], true);
            }
        }
    }
    else
    {
        // 1 arg
        activity.args = [ self._createValue(markup) ];
    }
}

ActivityMarkup.prototype._createValue = function (markup, canBeArray)
{
    var self = this;
    if (_.isArray(markup) && canBeArray)
    {
        var result = [];
        markup.forEach(function(v)
        {
            result.push(self._createValue(v));
        });
        return result;
    }
    else if (_.isObject(markup))
    {
        var filedNames = _.keys(markup);
        if (filedNames.length == 1)
        {
            var fieldName = filedNames[0];
            var fieldValue = markup[fieldName];

            if (fieldName == "_")
            {
                // Escape:
                return fieldValue;
            }

            if (self._knonwTypes[fieldName] != undefined)
            {
                // Activity:
                return self._createActivityInstance(fieldName, markup);
            }
        }
    }
    else if (_.isString(markup))
    {
        var trimmed = markup.trim();
        if (trimmed.match(/^\s*function\s*\w*\s*\((?:\w+,)*(?:\w+)?\)\s*\{/))
        {
            try
            {
                var f;
                eval("f = " + trimmed);
                if (_.isFunction(f)) return f;
            }
            catch (e)
            {
                // It's not a function
            }
        }
        else if (trimmed.length > 2 && trimmed[0] == "{" && trimmed[trimmed.length - 1] == "}" && trimmed[1] != "{" && trimmed[trimmed.length - 2] != "}")
        {
            // Expression
            return self._createActivityInstance("expression",
                {
                    expression: {
                        expr: trimmed.substr(1, trimmed.length - 2)
                    }
                });
        }
    }

    return markup;
}

ActivityMarkup.prototype._errorHint = function (markup)
{
    var len = 20;
    var json = JSON.stringify(markup);
    if (json.length > len) json = json.substr(0, len) + " ...";
    return "\nSee error near:\n" + json;
}

ActivityMarkup.prototype.stringify = function (obj)
{
    if (_.isString(obj)) return obj;
    if (!_.isObject(obj)) throw new TypeError("Parameter 'obj' is not an object.");
    var cloned = _.clone(obj);
    this._functionsToString(cloned);
    return JSON.stringify(cloned);
}

ActivityMarkup.prototype._functionsToString = function (obj)
{
    var self = this;
    for (var fieldName in obj)
    {
        var fieldValue = obj[fieldName];
        if (_.isFunction(fieldValue)) obj[fieldName] = fieldValue.toString();
        else if (_.isObject(fieldValue)) self._functionsToString(fieldValue);
        else if (_.isArray(fieldValue)) fieldValue.forEach(function (v) { self._functionsToString(v); });
    }
}

module.exports = ActivityMarkup;
