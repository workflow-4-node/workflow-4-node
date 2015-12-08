var yargs = require("yargs")
    .options({
        old: {
            demand: false,
            type: "boolean"
        }
    });
var argv = yargs.argv;

var es6;

if (argv.old) {
    console.log("Testing in ES5 mode ...");
    es6 = false;
}
else {
    es6 = true;
    try {
        eval("(() => {})()");
    } catch (err) {
        es6 = false;
    }
}

if (!es6) {
    require("babel-polyfill");
}

require(es6 ? "./es6" : "./es5");