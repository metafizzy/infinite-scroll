const fs = require('fs');
const { execSync } = require('child_process');
const { minify } = require('terser');

const indexPath = 'js/index.js';
const distPath = 'dist/infinite-scroll.pkgd.js';
const distMinPath = 'dist/infinite-scroll.pkgd.min.js';

let indexContent = fs.readFileSync( `./${indexPath}`, 'utf8' );
// get file paths from index.js
let cjsBlockRegex = /module\.exports = factory\([\w ,'.\-()/\n]+;/i;
let cjsBlockMatch = indexContent.match( cjsBlockRegex );
let jsPaths = cjsBlockMatch[0].match( /require\('([.\-/\w]+)'\)/gi );

jsPaths = jsPaths.map( function( path ) {
  return path.replace( "require('.", 'js' ).replace( "')", '.js' );
} );

let paths = [
  'node_modules/jquery-bridget/jquery-bridget.js',
  'node_modules/ev-emitter/ev-emitter.js',
  'node_modules/desandro-matches-selector/matches-selector.js',
  'node_modules/fizzy-ui-utils/utils.js',
  ...jsPaths,
  'node_modules/imagesloaded/imagesloaded.js',
];

// concatenate files
execSync( `cat ${paths.join(' ')} > ${distPath}` );

// add banner
let banner = indexContent.split(' */')[0] + ' */\n\n';
banner = banner.replace( 'Infinite Scroll', 'Infinite Scroll PACKAGED' );
let distJsContent = fs.readFileSync( distPath, 'utf8' );
distJsContent = banner + distJsContent;
fs.writeFileSync( distPath, distJsContent );

// minify
( async function() {
  let { code } = await minify( distJsContent, { mangle: true } );
  fs.writeFileSync( distMinPath, code );
} )();
