/* eslint-env node */

const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

function dir( file ) {
  return path.resolve( __dirname, file );
}

let content = fs.readFileSync( dir('../js/index.js'), 'utf8' );
content = content.replace( /Infinite Scroll v[\w\.\-]+/,
    `Infinite Scroll v${version}` );
fs.writeFileSync( dir('../js/index.js'), content, 'utf8' );
