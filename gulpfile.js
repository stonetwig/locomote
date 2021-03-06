// Gulp Dependencies
var gulp = require('gulp');
var rename = require('gulp-rename');

// Build Dependencies
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');

// Style Dependencies
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

// Development Dependencies
var jshint = require('gulp-jshint');

// Test Dependencies
var mochaPhantomjs = require('gulp-mocha-phantomjs');

// Linting
gulp.task('lint-client', function() {
  return gulp.src('./client/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('lint-test', function() {
  return gulp.src('./test/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Building the code
gulp.task('browserify-client', ['lint-client'], function() {
  return gulp.src('client/index.js')
    .pipe(browserify({
      insertGlobals: true
    }))
    .pipe(rename('locomote.js'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('browserify-test', ['lint-test'], function() {
  return gulp.src('test/client/index.js')
    .pipe(browserify({
      insertGlobals: true
    }))
    .pipe(rename('client-test.js'))
    .pipe(gulp.dest('build'));
});

// Building assets
gulp.task('styles', function() {
  return gulp.src('client/styles/mega.css')
    .pipe(less())
    .pipe(prefix({ cascade: true }))
    .pipe(rename('locomote.css'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('minify', ['styles'], function() {
  return gulp.src('build/locomote.css')
    .pipe(minifyCSS())
    .pipe(rename('locomote.min.css'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('uglify', ['browserify-client'], function() {
  return gulp.src('build/locomote.js')
    .pipe(uglify())
    .pipe(rename('locomote.min.js'))
    .pipe(gulp.dest('public/js'));
});

// Tasks you will actually use :)
gulp.task('build', ['uglify', 'minify']);
gulp.task('watch', function() {
  gulp.watch('client/**/*.js', ['browserify-client', 'test']);
  gulp.watch('test/client/**/*.js', ['test']);
});

// Testing
gulp.task('test', ['lint-test', 'browserify-test'], function() {
  return gulp.src('test/client/index.html')
    .pipe(mochaPhantomjs());
});

// One task to rule them all
gulp.task('dev', ['test', 'build', 'watch']);
