"use strict";

let Composite = require("./composite");
let util = require("util");

function Method() {
    Composite.call(this);

    this.reserved("canCreateInstance", false);
    this.reserved("methodName", false);
    this.reserved("instanceIdPath", "");
}

util.inherits(Method, Composite);

Method.prototype.createImplementation = function () {
    return {
        "@block": {
            r: "= result",
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
                        result: "= r"
                    }
                },
                "= a"
            ]
        }
    };
};

module.exports = Method;
