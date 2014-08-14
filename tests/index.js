var traceur = require('traceur');
traceur.require.makeDefault(function(filename)
{
    return /^(?!.*node_modules)+.+\.js$/.test(filename);
});

require("./activities");
require("./hosting");