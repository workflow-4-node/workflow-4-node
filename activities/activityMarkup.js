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
    this.registerType("func", require("./func"));
    this.registerType("block", require("./block"));
    this.registerType("parallel", require("./parallel"));
    this.registerType("pick", require("./pick"));
    this.registerType("resumeBookmark", require("./resumeBookmark"));
    this.registerType("waitForBookmark", require("./waitForBookmark"));
}

ActivityMarkup.prototype.registerType = function (alias, type)
{
    if (!_.isString(alias)) throw new TypeError("Parameter 'alias' is not a string.");
    var sup = type.super_;
    var isA = sup.name == Activity.name;
    while (sup && !isA)
    {
        sup = sup.super_;
        isA = sup.name == Activity.name;
    }
    if (!isA) throw new TypeError("Parameter 'type' is not an activity type.");
    this._knonwTypes[alias] = type;
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
    else if (_.isString(markup) && markup.match(/^\s*function\s*\w*\s*\((?:\w+,)*(?:\w+)?\)\s*\{/))
    {
        try
        {
            var f;
            eval("f = " + markup);
            if (_.isFunction(f)) return f;
        }
        catch (e)
        {
            // It's not a function
        }
    }

    // TODO: Expression handling ...

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
