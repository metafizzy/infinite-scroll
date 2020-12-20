const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');

const port = 9002;
let server, browser, page;

test.before( async function() {
  server = getServer();
  server.listen( port );
  browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.goto( `http://localhost:${port}/test/html/page-load.html` );
} );

test.after( async function() {
  page.close();
  await browser.close();
  server.close();
} );

// ------ tests ------ //

test.serial( 'page-load: page 2', async( t ) => {

  let assertions = await page.evaluate( function() {
    let $container = document.querySelector('.container');
    let infScroll = new InfiniteScroll( $container, {
      path: '.next-link',
      append: '.post',
    } );

    let eventPromises = Promise.all([
      // request event
      new Promise( function( resolve ) {
        infScroll.once( 'request', function( path ) {
          serialT.truthy( path.match('page/2.html') );
          resolve();
        } );
      } ),
      // load event
      new Promise( function( resolve ) {
        infScroll.once( 'load', function( response, path ) {
          serialT.is( response.nodeName, '#document' );
          serialT.truthy( path.match('page/2.html') );
          serialT.is( infScroll.loadCount, 1 );
          serialT.is( infScroll.pageIndex, 2 );
          resolve();
        } );
      } ),
      // append event
      new Promise( function( resolve ) {
        infScroll.once( 'append', function( response, path, items ) {
          serialT.is( response.nodeName, '#document' );
          serialT.truthy( path.match('page/2.html') );
          serialT.is( items.length, 2 );
          serialT.truthy( $container.children[1] === items[0] ); // item0 appended
          serialT.truthy( $container.children[2] === items[1] ); // item1 appended
          // inline script executed
          serialT.truthy( window.page2InlineScriptLoaded );
          resolve();
        } );
      } ),
    ]);

    // load page 2
    infScroll.loadNextPage();
    return eventPromises.then( () => serialT.assertions );
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );

test.serial( 'page-load: page 3', async( t ) => {
  let assertions = await page.evaluate( function() {
    serialT.assertions = []; // reset assertions

    let $container = document.querySelector('.container');
    let infScroll = InfiniteScroll.data( $container );

    let eventPromises = Promise.all([
      // request event
      new Promise( function( resolve ) {
        infScroll.once( 'request', function( path ) {
          serialT.truthy( path.match('page/3.html') );
          resolve();
        } );
      } ),
      // load event
      new Promise( function( resolve ) {
        infScroll.once( 'load', function( response, path ) {
          serialT.is( response.nodeName, '#document' );
          serialT.truthy( path.match('page/3.html') );
          serialT.is( infScroll.loadCount, 2 );
          serialT.is( infScroll.pageIndex, 3 );
          resolve();
        } );
      } ),
      // append event
      new Promise( function( resolve ) {
        infScroll.once( 'append', function( response, path, items ) {
          serialT.is( response.nodeName, '#document' );
          serialT.truthy( path.match('page/3.html') );
          serialT.is( items.length, 3 );
          serialT.truthy( $container.children[3] === items[0] );
          serialT.truthy( $container.children[4] === items[1] );
          serialT.truthy( $container.children[5] === items[2] );
          resolve();
        } );
      } ),
      // last event
      new Promise( function( resolve ) {
        infScroll.once( 'last', function( response, path ) {
          serialT.is( response.nodeName, '#document' );
          serialT.truthy( path.match('page/3.html') );
          resolve();
        } );
      } ),
    ]);

    // load page 3
    infScroll.loadNextPage();
    return eventPromises.then( () => serialT.assertions );
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );
