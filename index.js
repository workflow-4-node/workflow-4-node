var es6 = true;
try {
    eval("(function *(){})");
} catch(err) {
    es6 = false;
}

if (es6) {
    module.exports = {
        common: require("./lib/common"),
        activities: require("./lib/activities"),
        hosting: require("./lib/hosting")
    };
}
else {
    require("traceur");
    module.exports = {
        common: require("./lib4node/common"),
        activities: require("./lib4node/activities"),
        hosting: require("./lib4node/hosting")
    };
}