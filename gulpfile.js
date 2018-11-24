'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify-es').default,
    babel = require('gulp-babel'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-minify-css'),
    htmlmin = require('gulp-htmlmin'),
    rimraf = require('rimraf'),
    browserSync = require('browser-sync'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        assets: 'build/assets/',
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/index.js',
        style: 'src/css/styles.sass',
        assets: 'src/assets/**/*',
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/css/**/*.sass',
        assets: 'src/assets/**/*',
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "graph",
    open: false,
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: path.src.js,
    debug: true
  });

  return b.bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(path.build.js));
})

gulp.task('style:build', function () {
    gulp.src(path.src.style) 
        .pipe(sass({
            includePaths: ['src/style/'],
            outputStyle: 'compressed',
            errLogToConsole: true
        }))
        .pipe(cssmin())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
})

gulp.task('assets:build', function () {
    gulp.src(path.src.assets)
        .pipe(gulp.dest(path.build.assets))
})

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'assets:build',
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    })
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    })
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    })
    watch([path.watch.assets], function(event, cb) {
        gulp.start('assets:build');
    })
});


gulp.task('default', ['build', 'webserver', 'watch']);