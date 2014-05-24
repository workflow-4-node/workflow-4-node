var Activity = require("./activity");
var util = require("util");

function Assign()
{
    Activity.call(this);
    this.value = null;
    this.to = "";
}

util.inherits(Assign, Activity);

module.exports = Assign;