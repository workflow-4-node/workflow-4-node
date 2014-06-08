var Composite = require("./composite");
var util = require("util");
var ActivityMarkup = require("./activityMarkup");

function Method()
{
    Composite.call(this);

    this.reserved("canCreateInstance", false);
    this.reserved("methodName", false);
    this.reserved("instanceIdPath", "");
    this.result = null;
}

util.inherits(Method, Composite);

Method.prototype.createImplementation = function ()
{
    var impl = new ActivityMarkup().parse(
        {
            block: {
                r: "{this.result}",
                args: [
                    {
                        beginMethod: {
                            canCreateInstance: this.canCreateInstance,
                            methodName: this.methodName,
                            instanceIdPath: this.instanceIdPath
                        }
                    },
                    {
                        endMethod: {
                            methodName: this.methodName,
                            result: "{this.r}"
                        }
                    }
                ]
            }
        });
    return impl;
}

module.exports = Method;
