var ex = require("./activityExceptions");

function ResumeBookmarkQueue()
{
    this._names = {};
    this._commands = [];
}

ResumeBookmarkQueue.prototype.isEmpty = function ()
{
    return this._commands.length == 0;
}

ResumeBookmarkQueue.prototype.enqueue = function(bookmarkName, reason, result)
{
    if (this._names[bookmarkName] == undefined)
    {
        this._names[bookmarkName] = bookmarkName;
        this._commands.push(
            {
                name: bookmarkName,
                reason: reason,
                result: result
            });
    }
    else
    {
        throw new ex.ActivityRuntimeError("The '" + bookmarkName + "' bookmark continuation already enqueued.");
    }
}

ResumeBookmarkQueue.prototype.dequeue = function()
{
    var self = this;
    for (var i = 0; i < self._commands.length; i++)
    {
        var command = self._commands[i];
        if (self._names[command.name])
        {
            self._commands.splice(0, 1);
            delete self._names[command.name];
            return command;
        }
    }
    return null;
}

ResumeBookmarkQueue.prototype.remove = function(bookmarkName)
{
    delete this._names[bookmarkName];
}

module.exports = ResumeBookmarkQueue;
