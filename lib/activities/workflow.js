var Block = require("./block");
var util = require("util");

function Workflow(name) {
    Block.call(this);

    this.reserved("version", 0);
    this.reserved("name", name ? name.toString() : "");
}

util.inherits(Workflow, Block);

module.exports = Workflow;