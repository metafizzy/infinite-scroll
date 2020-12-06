/* eslint-env node */

let fs = require('fs');
let gulp = require('gulp');
let rename = require('gulp-rename');
let replace = require('gulp-replace');

// ----- hint ----- //

let jshint = require('gulp-jshint');

gulp.task( 'hint-js', function() {
  return gulp.src('js/**/*.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
} );

gulp.task( 'hint-test', function() {
  return gulp.src('test/unit/*.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
} );

gulp.task( 'hint-task', function() {
  return gulp.src('gulpfile.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
} );

let jsonlint = require('gulp-json-lint');

gulp.task( 'jsonlint', function() {
  return gulp.src('*.json')
    .pipe( jsonlint() )
    .pipe( jsonlint.report('verbose') );
} );

gulp.task( 'hint', [ 'hint-js', 'hint-test', 'hint-task', 'jsonlint' ] );

// -------------------------- RequireJS makes pkgd -------------------------- //

let gutil = require('gulp-util');
let chalk = require('chalk');
let rjsOptimize = require('gulp-requirejs-optimize');

// regex for banner comment
let reBannerComment = new RegExp('^\\s*(?:\\/\\*[\\s\\S]*?\\*\\/)\\s*');

function getBanner() {
  let src = fs.readFileSync( 'js/index.js', 'utf8' );
  let matches = src.match( reBannerComment );
  let banner = matches[0].replace( 'Infinite Scroll', 'Infinite Scroll PACKAGED' );
  return banner;
}

function addBanner( str ) {
  return replace( /^/, str );
}

gulp.task( 'requirejs', function() {
  let banner = getBanner();
  let definitionRE = /define\(\s*'infinite-scroll\/js\/index'(.|\n)+\],\s*factory/;
  // HACK src is not needed
  // should refactor rjsOptimize to produce src
  return gulp.src('js/index.js')
    .pipe( rjsOptimize({
      baseUrl: 'bower_components',
      optimize: 'none',
      include: [
        'jquery-bridget/jquery-bridget',
        'infinite-scroll/js/index',
        'imagesloaded/imagesloaded',
      ],
      paths: {
        'infinite-scroll': '../',
        jquery: 'empty:',
      },
    }) )
    // munge AMD definition
    .pipe( replace( definitionRE, function( definition ) {
      // remove named module
      return definition.replace( "'infinite-scroll/js/index',", '' )
        // use explicit file paths, './history' -> 'infinite-scroll/js/history'
        .replace( /'.\//g, "'infinite-scroll/js/" );
    } ) )
    // add banner
    .pipe( addBanner( banner ) )
    .pipe( rename('infinite-scroll.pkgd.js') )
    .pipe( gulp.dest('dist') );
} );

// ----- uglify ----- //

let uglify = require('gulp-uglify');

gulp.task( 'uglify', [ 'requirejs' ], function() {
  let banner = getBanner();
  gulp.src('dist/infinite-scroll.pkgd.js')
    .pipe( uglify() )
    // add banner
    .pipe( addBanner( banner ) )
    .pipe( rename('infinite-scroll.pkgd.min.js') )
    .pipe( gulp.dest('dist') );
} );

// ----- version ----- //

// set version in source files

let minimist = require('minimist');

// use gulp version -t 1.2.3
gulp.task( 'version', function() {
  let args = minimist( process.argv.slice( 3 ) );
  let version = args.t;
  if ( !version || !( /\d\.\d\.\d/ ).test( version ) ) {
    gutil.log( 'invalid version: ' + chalk.red( version ) );
    return;
  }
  gutil.log( 'ticking version to ' + chalk.green( version ) );

  gulp.src('js/index.js')
    .pipe( replace( /Infinite Scroll v\d\.\d+\.\d+/, 'Infinite Scroll v' + version ) )
    .pipe( gulp.dest('js') );

  gulp.src('package.json')
    .pipe( replace( /"version": "\d\.\d+\.\d+"/, '"version": "' + version + '"' ) )
    .pipe( gulp.dest('.') );
} );

// ----- default ----- //

gulp.task( 'default', [
  'hint',
  'uglify',
] );
