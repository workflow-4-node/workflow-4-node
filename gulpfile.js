var gulp = require("gulp");
var traceur = require("gulp-traceur");

gulp.task("default", function () {
    return gulp.src("lib/**/*.js")
        .pipe(traceur({sourceMaps: "inline"}))
        .pipe(gulp.dest("lib4node"));
});