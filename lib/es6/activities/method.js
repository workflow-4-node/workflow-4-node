"use strict";

let Composite = require("./composite");
let util = require("util");

function Method() {
    Composite.call(this);

    this.reserved("canCreateInstance", false);
    this.reserved("methodName", false);
    this.reserved("instanceIdPath", "");
    this.result = null;
}

util.inherits(Method, Composite);

Method.prototype.createImplementation = function () {
    return {
        "@block": {
            id: "_methodBlock",
            a: null,
            args: [
                {
                    "@beginMethod": {
                        canCreateInstance: this.canCreateInstance,
                        methodName: this.methodName,
                        instanceIdPath: this.instanceIdPath,
                        "@to": "a"
                    }
                },
                {
                    "@endMethod": {
                        methodName: this.methodName,
                        result: "# this._methodBlock.$parent.result"
                    }
                },
                "# this.a"
            ]
        }
    };
};

module.exports = Method;
