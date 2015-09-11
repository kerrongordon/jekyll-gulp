var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var minifyCss   = require('gulp-minify-css');
var htmlmin     = require('gulp-htmlmin');
var imagemin    = require('gulp-imagemin');
var pngquant    = require('imagemin-pngquant');
var clean       = require('gulp-clean');

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'compress', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('_scss/main.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
});

/**
 * compress javascript 
 */
gulp.task('compress', function() {
  return gulp.src('_js/**/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('assets/js'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('_scss/**/*.sass', ['sass']);
    gulp.watch('_js/**/*.js', ['compress']);
    gulp.watch(['index.html', '_layouts/**/*.html', '_includes/**/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);


/**
 * compress html 
 */
gulp.task('minify', function() {
  return gulp.src('_site/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('_deploy'));
});

gulp.task('style', function() {
    return gulp.src('_site/assets/css/main.css')
    .pipe(minifyCss())
    .pipe(gulp.dest('_deploy/assets/css'));
});

gulp.task('script', function() {
    return gulp.src('_site/assets/js/main.js')
    .pipe(uglify())
    .pipe(gulp.dest('_deploy/assets/js'));
});

gulp.task('imgCompress', function () {
    return gulp.src('_site/assets/img/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('_deploy/assets/img'));
});


gulp.task('clean', function() {
    return gulp.src(['_deploy', 'assets', '_site'], {read: false})
        .pipe(clean());
});

gulp.task('deploy',['minify', 'style', 'script', 'imgCompress']);


