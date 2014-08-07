var errors = require("../common/errors");
var StrSet = require("backpack-node").collections.StrSet;

function ResumeBookmarkQueue()
{
    this._names = new StrSet();
    this._commands = [];
}

ResumeBookmarkQueue.prototype.isEmpty = function ()
{
    return this._commands.length === 0;
}

ResumeBookmarkQueue.prototype.enqueue = function(bookmarkName, reason, result)
{
    if (!this._names.exists(bookmarkName))
    {
        this._names.add(bookmarkName);
        this._commands.push(
            {
                name: bookmarkName,
                reason: reason,
                result: result
            });
    }
    else
    {
        throw new errors.ActivityRuntimeError("The '" + bookmarkName + "' bookmark continuation already enqueued.");
    }
}

ResumeBookmarkQueue.prototype.dequeue = function()
{
    var self = this;
    for (var i = 0; i < self._commands.length; i++)
    {
        var command = self._commands[i];
        self._commands.splice(0, 1);
        self._names.remove(command.name);
        return command;
    }
    return null;
}

ResumeBookmarkQueue.prototype.remove = function(bookmarkName)
{
    if (this._names.exists(bookmarkName))
    {
        var idx = -1;
        for (var i = 0; i < self._commands.length; i++)
        {
            var command = self._commands[i];
            if (command.name === bookmarkName)
            {
                idx = i;
                break;
            }
        }
        if (idx != -1) self._commands.splice(idx, 1);
        this._names.remove(bookmarkName);
    }
}

module.exports = ResumeBookmarkQueue;
