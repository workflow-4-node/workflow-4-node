"use strict";

let errors = require("../common/errors");

function ResumeBookmarkQueue() {
    this._names = new Set();
    this._commands = [];
}

ResumeBookmarkQueue.prototype.isEmpty = function () {
    return this._commands.length === 0;
};

ResumeBookmarkQueue.prototype.enqueue = function (bookmarkName, reason, result) {
    if (!this._names.has(bookmarkName)) {
        this._names.add(bookmarkName);
        this._commands.push(
            {
                name: bookmarkName,
                reason: reason,
                result: result
            });
    }
    else {
        throw new errors.ActivityRuntimeError("The '" + bookmarkName + "' bookmark continuation already enqueued.");
    }
};

ResumeBookmarkQueue.prototype.dequeue = function () {
    if (this._commands.length) {
        let command = this._commands[0];
        this._commands.splice(0, 1);
        this._names.delete(command.name);
        return command;
    }
    return null;
};

ResumeBookmarkQueue.prototype.remove = function (bookmarkName) {
    if (this._names.has(bookmarkName)) {
        let idx = -1;
        for (let i = 0; i < this._commands.length; i++) {
            let command = this._commands[i];
            if (command.name === bookmarkName) {
                idx = i;
                break;
            }
        }
        if (idx !== -1) {
            this._commands.splice(idx, 1);
        }
        this._names.delete(bookmarkName);
    }
};

module.exports = ResumeBookmarkQueue;
