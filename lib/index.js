var es6 = true;
try {
    eval("(() => {})()");
} catch (err) {
    es6 = false;
}

var es = es6 ? "es6" : "es5";

if (!es6) {
    require("babel-polyfill");
}

module.exports = require("./" + es);