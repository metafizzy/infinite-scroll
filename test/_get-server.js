// https://developer.mozilla.org/en-US/docs/Node_server_without_framework
// https://stackoverflow.com/a/29046869

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

module.exports = function getServer() {
  return http.createServer( listener );
};

const mimeTypes = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
};

function listener( req, res ) {
  // if ( req.url.includes('.html') ) {
  //   console.log( `${req.method} ${req.url}` );
  // }

  let parsedUrl = url.parse( req.url );
  let pathname = `.${parsedUrl.pathname}`;
  let ext = path.parse( pathname ).ext;

  fs.exists( pathname, function( exist ) {
    if ( !exist ) {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end(`File ${pathname} not found`);
      return;
    }

    // if is a directory search for index file matching the extention
    if ( fs.statSync( pathname ).isDirectory() ) {
      pathname += '/index' + ext;
    }

    // read file from file system
    fs.readFile( pathname, function( err, data ) {
      if ( err ) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        // if the file is found, set Content-type and send data
        let mimeType = mimeTypes[ ext ] || 'text/plain';
        res.setHeader( 'Content-type', mimeType );
        res.end( data );
      }
    } );
  } );

}
