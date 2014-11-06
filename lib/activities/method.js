var Composite = require("./composite");
var util = require("util");
var activityMarkup = require("./activityMarkup");

function Method() {
    Composite.call(this);

    this.reserved("canCreateInstance", false);
    this.reserved("methodName", false);
    this.reserved("instanceIdPath", "");
}

util.inherits(Method, Composite);

Method.prototype.createImplementation = function () {
    return {
        block: {
            r: "# this.get('result')",
            a: null,
            args: [
                {
                    beginMethod: {
                        canCreateInstance: this.canCreateInstance,
                        methodName: this.methodName,
                        instanceIdPath: this.instanceIdPath,
                        "@to": "a"
                    }
                },
                {
                    endMethod: {
                        methodName: this.methodName,
                        result: "# this.get('r')"
                    }
                },
                "# this.get('a')"
            ]
        }
    };
}

module.exports = Method;
