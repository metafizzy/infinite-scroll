const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');

const port = 9005;
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
  await page.goto(`http://localhost:${port}/test/html/page-load.html`);
  try {
    await run( t, page );
  } finally {
    await page.close();
  }
}

function getPageAssertions() {
  return async function() {
    let { infScroll, serialT } = window;

    // check that last doesn't trigger when not last page
    infScroll.on( 'last', onLast );
    function onLast() {
      serialT.fail('last event should not trigger when not last page');
    }

    await ( function() {
      let promise = new Promise( function( resolve ) {
        infScroll.once( 'append', function() {
          infScroll.off( 'last', onLast );
          resolve();
        } );
      } );
      // load page 2
      infScroll.loadNextPage();
      return promise;
    } )();

    let promise = new Promise( function( resolve ) {
      infScroll.once( 'last', function() {
        serialT.pass(`last event triggered on ${infScroll.pageIndex}`);
        resolve( serialT.assertions );
      } );
    } );
    // load page 3
    infScroll.loadNextPage();
    return promise;
  };
}

// ------ tests ------ //

test( 'checkLastPage: true', withPage, async function( t, page ) {
  await page.evaluate( function() {
    window.infScroll = new InfiniteScroll( '.container', {
      append: '.post',
      path: '.next-link',
      // checkLastPage: true, // true by default
    } );
  } );

  let assertions = await page.evaluate( getPageAssertions() );
  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );

test( 'checkLastPage: ".selector-string"', withPage, async function( t, page ) {
  await page.evaluate( function() {
    window.infScroll = new InfiniteScroll( '.container', {
      append: '.post',
      path: 'page/{{#}}.html',
      checkLastPage: '.next-link',
    } );
  } );

  let assertions = await page.evaluate( getPageAssertions() );
  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );

test( 'checkLastPage with path: function() {}', withPage, async function( t, page ) {
  await page.evaluate( function() {
    window.infScroll = new InfiniteScroll( '.container', {
      // provide only page/2.html, then falsy
      path: function() {
        if ( this.pageIndex < 3 ) {
          return `page/${this.pageIndex + 1}.html`;
        }
      },
      // checkLastPage: true, // true by default
      append: '.post',
    } );
  } );

  let assertions = await page.evaluate( getPageAssertions() );
  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );
