var Composite = require("./composite");
var util = require("util");
var ActivityMarkup = require("./activityMarkup");

function Method()
{
    Composite.call(this);

    this.reserved("canCreateInstance", false);
    this.reserved("methodName", false);
    this.reserved("instanceIdPath", "");
    this.result = undefined;
}

util.inherits(Method, Composite);

Method.prototype.createImplementation = function ()
{
    var impl = new ActivityMarkup().parse(
        {
            block: {
                r: "{this.result}",
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
                            result: "{this.r}"
                        }
                    },
                    "{ this.a }"
                ]
            }
        });
    return impl;
}

module.exports = Method;
