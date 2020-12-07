const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');

const port = 9003;
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

test( 'page-load-error', async( t ) => {
  t.plan( 2 );

  let assertions = await page.evaluate( function() {
    let infScroll = new InfiniteScroll( '.container', {
      path: () => 'page/4.html',
    } );

    let eventPromises = Promise.all([
      // request event
      new Promise( function( resolve ) {
        infScroll.on( 'request', function() {
          serialT.pass('request event');
          resolve();
        } );
      } ),
      // load event
      new Promise( function( resolve ) {
        infScroll.on( 'error', function( error ) {
          serialT.truthy( Boolean( error ), 'error event, with error argument' );
          resolve();
        } );
      } ),
    ]);

    infScroll.on( 'load', function() {
      serialT.fail('load event should not trigger');
    } );

    infScroll.loadNextPage();
    return eventPromises.then( () => serialT.assertions );
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );
