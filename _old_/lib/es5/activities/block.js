"use strict";

var Activity = require("./activity");
var util = require("util");
var Declarator = require("./declarator");

function Block() {
    Declarator.call(this);
}

util.inherits(Block, Declarator);

Block.prototype.varsDeclared = function (callContext, args) {
    var todo = [];
    this._todo = todo;
    if (args.length) {
        for (var i = args.length - 1; i >= 1; i--) {
            todo.push(args[i]);
        }
        callContext.schedule(args[0], "_argGot");
    } else {
        callContext.end(Activity.states.complete, null);
    }
};

Block.prototype._argGot = function (callContext, reason, result) {
    var todo = this._todo;
    if (reason === Activity.states.complete) {
        if (todo.length === 0) {
            callContext.complete(result);
        } else {
            callContext.schedule(todo.pop(), "_argGot");
        }
    } else {
        callContext.end(reason, result);
    }
};

module.exports = Block;
//# sourceMappingURL=block.js.map
