var Activity = require("./activity");
var util = require("util");

function BeginMethod()
{
    this.canCreateInstance = false;
    this.methodName = "";
    this.instanceIdPath = "";
}

util.inherits(BeginMethod, util);

module.exports = BeginMethod;