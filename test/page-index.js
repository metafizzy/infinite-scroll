const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');

const port = 9004;
let server, browser;

test.before( async function() {
  server = getServer();
  server.listen( port );
  browser = await puppeteer.launch();
} );

test.after( async function() {
  await browser.close();
  server.close();
} );

async function withPage( t, run ) {
  const page = await browser.newPage();
  await page.goto( `http://localhost:${port}/test/html/page-index.html` );
  try {
    await run( t, page );
  } finally {
    await page.close();
  }
}

// ------ tests ------ //

test( 'pageIndex from path element', withPage, async function( t, page ) {
  let pageIndex = await page.evaluate( function() {
    let infScroll = new InfiniteScroll( '.container', {
      path: '.next-link',
    } );

    return infScroll.pageIndex;
  } );

  t.is( pageIndex, 4 );
} );

test( 'pageIndex from URL with {{#}}', withPage, async function( t, page ) {
  let pageIndex = await page.evaluate( function() {
    window.history.replaceState( null, document.title, 'page/7' );
    let infScroll = new InfiniteScroll( '.container', {
      path: 'page/{{#}}',
    } );

    return infScroll.pageIndex;
  } );

  t.is( pageIndex, 7 );
} );

test( 'pageIndex from GET param with {{#}}', withPage, async function( t, page ) {
  let pageIndex = await page.evaluate( function() {
    window.history.replaceState( null, document.title, 'page?currPage=8' );
    let infScroll = new InfiniteScroll( '.container', {
      path: 'page?currPage={{#}}',
    } );

    return infScroll.pageIndex;
  } );

  t.is( pageIndex, 8 );
} );

test( 'pageIndex from GET param with {{#}} and pre-escaped regexp', withPage,
    async function( t, page ) {
      let pageIndex = await page.evaluate( function() {
      window.history.replaceState( null, document.title, 'page?currPage=8' );
      let infScroll = new InfiniteScroll( '.container', {
        path: 'page\\?currPage={{#}}',
      } );

      return infScroll.pageIndex;
    } );

    t.is( pageIndex, 8 );
  } );
