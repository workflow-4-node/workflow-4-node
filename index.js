require("backpack-node").system.es6.es6Module("workflow-4-node/lib", module, {
    common: require("./lib/common/index"),
    activities: require("./lib/activities/index"),
    hosting: require("./lib/hosting/index")
});