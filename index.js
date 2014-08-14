var Module = require('module');
var originalRequireJs = Module._extensions['.js'];
var traceur = require('traceur');

var filter = function (filename)
{
    return /^(?=.*workflow-4-node[/\\]lib)+.+\.js$/.test(filename);
}

try
{
    traceur.require.makeDefault(function (filename)
    {
        return filter(filename);
    });

    module.exports = {
        common: require("./lib/common/index"),
        activities: require("./lib/activities/index"),
        hosting: require("./lib/hosting/index")
    }
}
finally
{
    Module._extensions['.js'] = originalRequireJs;
    filter = function() { return true; } // Because traceur filters is a global array... :S
}