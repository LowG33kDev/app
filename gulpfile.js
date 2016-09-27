var gulp        = require('gulp'),
    connect     = require('gulp-connect-php'),
    browserSync = require('browser-sync').create(),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    gutil       = require('gulp-util'),
    plumber     = require('gulp-plumber'),
    del         = require('del'),
    options     = require("minimist")(process.argv.slice(2));

/**
 * @var array Default settings
 */
var settings = {
    host: options.host || options.h || 'localhost',
    port: options.port || options.p || 8000,
    sync: (options.nosync === undefined) ? true : false,
    phpserver: (options.phpserver === undefined) ? false : true,
    production: (options.production === undefined) ? true : false
};

var paths = {
    dist: './webroot',
    scripts: './assets-src/js/**/*.js',
    sass: './assets-src/scss/**/*.+(scss|sass)',
    php: './src/**/*.+(php|ctp)'
};


gulp.task('scripts', function () {
    return gulp.src(paths.scripts)
        .pipe(gulp.dest(paths.dist + '/js/'));
});

gulp.task('serve', function () {
    if (settings.phpserver) {
        return gulp.start('phpServer');
    } else {
        if (settings.sync) {
            return gulp.start('browserSync');
        }
    }
});

gulp.task('phpServer', function() {
    return connect.server({
        host: settings.host,
        port: settings.port,
        base: './webroot',
        router: './webroot/index.php'
    }, function (){
        if (settings.sync) {
            gulp.start('browserSync');
        }
    });
});

gulp.task('browserSync', function() {
    return browserSync.init({
        proxy: "http://" + settings.host + ":" + settings.port,
        ui: {
            port: 8080
        }
    });
});

gulp.task('sass', function() {
    return gulp.src(paths.sass)
                .pipe(!settings.production ? plumber() : gutil.noop())
                .pipe(!settings.production ? sourcemaps.init() : gutil.noop())
                .pipe(sass({outputStyle: (settings.production ? 'compressed' : 'nested')}))
                .pipe(!settings.production ? sourcemaps.write() : gutil.noop())
                .pipe(gulp.dest(paths.dist + '/css/'));
});

gulp.task('watch', function() {
    gulp.watch(paths.php).on('change', (settings.sync) ? browserSync.reload : function(){});
    gulp.watch(paths.scripts, ['scripts']).on('change', (settings.sync) ? browserSync.reload : function(){});
    gulp.watch(paths.sass, ['sass']).on('change', (settings.sync) ? browserSync.reload : function(){});
});

/**
 *
 */
gulp.task('default', ['build', 'serve', 'watch'], function() {

});

/**
 *
 */
gulp.task('build', ['scripts', 'sass'], function() {

});
