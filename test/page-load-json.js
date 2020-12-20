const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');
const page2Json = require('./html/page/2.json');
const page3Json = require('./html/page/3.json');

const port = 9009;

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

test.serial( 'page-load: page/2.json', async( t ) => {

  let assertions = await page.evaluate( function( page2Data ) {
    let infScroll = window.infScroll = new InfiniteScroll( '.container', {
      path: 'page/{{#}}.json',
      responseBody: 'json',
      history: false,
    } );

    let eventPromises = Promise.all([
      // request event
      new Promise( function( resolve ) {
        infScroll.once( 'request', function( path ) {
          serialT.truthy( path.match('page/2.json') );
          resolve();
        } );
      } ),
      // load event
      new Promise( function( resolve ) {
        infScroll.once( 'load', function( response, path ) {
          serialT.truthy( path.match('page/2.json') );
          serialT.deepEqual( response, page2Data );
          serialT.is( infScroll.loadCount, 1 );
          serialT.is( infScroll.pageIndex, 2 );
          resolve();
        } );
      } ),
    ]);

    // load page 2
    infScroll.loadNextPage();
    return eventPromises.then( () => serialT.assertions );
  }, page2Json );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );

test.serial( 'page-load: page/3.json', async( t ) => {

  let assertions = await page.evaluate( function( page3Data ) {
    let infScroll = window.infScroll;

    let eventPromises = Promise.all([
      // request event
      new Promise( function( resolve ) {
        infScroll.once( 'request', function( path ) {
          serialT.truthy( path.match('page/3.json') );
          resolve();
        } );
      } ),
      // load event
      new Promise( function( resolve ) {
        infScroll.once( 'load', function( response, path ) {
          serialT.truthy( path.match('page/3.json') );
          serialT.deepEqual( response, page3Data );
          serialT.is( infScroll.loadCount, 2 );
          serialT.is( infScroll.pageIndex, 3 );
          resolve();
        } );
      } ),
    ]);

    // load page 2
    infScroll.loadNextPage();
    return eventPromises.then( () => serialT.assertions );
  }, page3Json );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );
