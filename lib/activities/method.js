var Composite = require("./composite");
var util = require("util");
var activityMarkup = require("./activityMarkup");

function Method()
{
    Composite.call(this);

    this.reserved("canCreateInstance", false);
    this.reserved("methodName", false);
    this.reserved("instanceIdPath", "");
}

util.inherits(Method, Composite);

Method.prototype.createImplementation = function ()
{
    var impl = activityMarkup.parse(
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
