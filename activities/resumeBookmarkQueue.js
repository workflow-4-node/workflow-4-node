function ResumeBookmarkQueue()
{
    this._names = {};
    this._commands = [];
}

ResumeBookmarkQueue.prototype.enqueue = function(bookmarkName, internalRequest, reason, result)
{
    if (this._names[bookmarkName] == undefined)
    {
        this._names[bookmarkName] = bookmarkName;
        this._commands.push(
            {
                name: bookmarkName,
                reason: reason,
                result: result,
                internalRequest: internalRequest
            });
    }
}

ResumeBookmarkQueue.prototype.dequeueInternal = function()
{
    var self = this;
    for (var i = 0; i < self._commands.length; i++)
    {
        var command = self._commands[i];
        if (command.internalRequest)
        {
            self._commands.splice(0, 1);
            return command;
        }
    }
    return null;
}

ResumeBookmarkQueue.prototype.dequeueExternal = function (bookmarks)
{
    var self = this;
    for (var i = 0; i < self._commands.length; i++)
    {
        var command = self._commands[i];
        if (!command.internalRequest && bookmarks[command.name])
        {
            self._commands.splice(0, 1);
            return command;
        }
    }
    return null;
}

module.exports = ResumeBookmarkQueue;
