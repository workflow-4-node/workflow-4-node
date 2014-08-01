var KeepAlive = require("./keepAlive");
var util = require("util");
var Promise = require("bluebird");

function KeepLockAlive(persistence, lockInfo, inLockTimeout, renewPeriod)
{
    var self = this;
    KeepAlive.call(
        self,
        function()
        {
            if (lockInfo && lockInfo.id) return persistence.renewLock(lockInfo.id, inLockTimeout); else return Promise.resolve(0);
        },
        renewPeriod);
}

util.inherits(KeepLockAlive, KeepAlive);

module.exports = KeepLockAlive;
