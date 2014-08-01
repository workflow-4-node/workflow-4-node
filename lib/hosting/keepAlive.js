var _ = require("lodash");
var Promise = require("bluebird");

function KeepAlive(repeatFunc, repeatPeriod)
{
    if (!_.isFunction(repeatFunc)) throw new TypeError("Function argument expected.");
    this._repeatFunc = repeatFunc;
    this._repeatPeriod = repeatPeriod;
    this._isRunning = true;
    this._toId = null;
    var self = this;
    process.nextTick(function() { self._start.call(self); });
}

KeepAlive.prototype._start = function()
{
    var self = this;
    self._toId = setTimeout(
        function()
        {
            if (self._isRunning)
            {
                Promise.resolve(self._repeatFunc())
                    .catch(function(e)
                    {
                        console.error("Keep alive failed:\n" + e.stack);
                    })
                    .finally(function()
                    {
                        if (self._isRunning) self._start();
                    });
            }
        },
        self._repeatPeriod);
}

KeepAlive.prototype.end = function()
{
    if (!this._isRunning) throw new Error("Keep alive has already ended.");

    this._isRunning = false;
    if (this._toId) clearTimeout(this._toId);
}

module.exports = KeepAlive;