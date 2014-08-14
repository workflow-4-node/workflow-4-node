var Module = require('module');
var originalRequireJs = Module._extensions['.js'];
var traceur = require('traceur');

try
{
    traceur.require.makeDefault(function (filename)
    {
        return /^(?=.*workflow-4-node[/\\]lib)+.+\.js$/.test(filename);
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
}