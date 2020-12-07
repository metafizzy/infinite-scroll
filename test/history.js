const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');

const port = 9007;
let server, browser, page;

test.before( async function() {
  server = getServer();
  server.listen( port );
  browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.goto( `http://localhost:${port}/test/html/history.html` );
} );

test.after( async function() {
  await page.close();
  await browser.close();
  server.close();
} );

// ------ tests ------ //

test( 'history', async( t ) => {

  t.plan( 6 );

  let assertions = await page.evaluate( function() {
    let $container = document.querySelector('.container');
    let infScroll = new InfiniteScroll( $container, {
      path: 'page/{{#}}.html',
      append: '.post',
      scrollThreshold: false,
      // history: 'replace', // default
      historyTitle: true,
    } );

    function getTop( $elem ) {
      return $elem.getBoundingClientRect().top + window.scrollY;
    }

    let page1Top = getTop( $container ) - 100;
    let page2Top, page3Top;

    // append next page, scroll to it to trigger history
    return new Promise( function( resolve ) {
      infScroll.once( 'append', function( response, _path, items ) {
        page2Top = getTop( items[0] );
        // TODO this block should be its own promise, but can't get it to work
        infScroll.once( 'history', function( title, path ) {
          serialT.is( path, location.href, `2nd page history url changed to ${path}` );
          serialT.is( title, document.title, `document title changed to ${title}` );
          resolve();
        } );
        scrollTo( 0, page2Top - window.innerHeight / 4 );
      } );

      infScroll.loadNextPage();
    } )
      // scroll back up to top of page to trigger history on previous page
      .then( new Promise( function( resolve ) {
        infScroll.once( 'history', function( title, path ) {
          serialT.is( path, location.href, `1st page history, url changed to ${path}` );
          serialT.is( title, document.title, `document title changed to ${title}` );
          resolve();
        } );
        scrollTo( 0, page1Top );
      } ) )
      .then( new Promise( function( resolve ) {
        infScroll.once( 'append', function( response, _path, items ) {
          page3Top = getTop( items[0] );
          resolve();
        } );

        infScroll.loadNextPage();
      } ) )
      .then( new Promise( function( resolve ) {
        infScroll.once( 'history', function( title, path ) {
          serialT.is( path, location.href, `3rd page history url changed to ${path}` );
          serialT.is( title, document.title, `document title changed to ${title}` );
          resolve();
        } );
        scrollTo( 0, page3Top - window.innerHeight / 4 );
      } ) )
      .then( () => serialT.assertions );
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );

} );
