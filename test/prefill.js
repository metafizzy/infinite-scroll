const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');

const port = 9006;
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
  let page = await browser.newPage();
  await page.goto( `http://localhost:${port}/test/html/prefill.html` );

  try {
    await run( t, page );
  } finally {
    page.close();
  }
}

// ------ tests ------ //

test( 'prefill', withPage, async( t, page ) => {

  let assertions = await page.evaluate( function() {
    let { serialT, innerHeight } = window;
    // expected load count, each post is 200px tall
    let expLoadCount = Math.ceil( innerHeight/200 );

    return new Promise( function( resolve ) {
      let infScroll = new InfiniteScroll( '.container--prefill-window', {
        path: () => 'page/fill.html',
        append: '.post',
        prefill: true,
        onInit: function() {
          this.on( 'append', onAppend );
        },
      } );

      function onAppend() {
        serialT.pass( `prefill window appended post ${infScroll.loadCount}` );
        if ( infScroll.loadCount == expLoadCount ) {
          serialT.is( infScroll.loadCount, expLoadCount,
              `${expLoadCount} pages appended` );
          resolve( serialT.assertions );
        }
      }
    } );
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );

test( 'prefill with elementScroll', withPage, async( t, page ) => {

  let assertions = await page.evaluate( function() {
    let { serialT } = window;
    // expected load count, each post is 200px tall, container is 500px tall
    let expLoadCount = 3;

    return new Promise( function( resolve ) {
      let infScroll = new InfiniteScroll( '.container--prefill-element', {
        path: () => 'page/fill.html',
        append: '.post',
        elementScroll: true,
        prefill: true,
        onInit: function() {
          this.on( 'append', onAppend );
        },
      } );

      function onAppend() {
        serialT.pass( `prefill window appended post ${infScroll.loadCount}` );
        if ( infScroll.loadCount == expLoadCount ) {
          serialT.is( infScroll.loadCount, expLoadCount,
              `${expLoadCount} pages appended` );
          resolve( serialT.assertions );
        }
      }
    } );
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );

test( 'prefill, last hit', withPage, async( t, page ) => {

  let assertions = await page.evaluate( function() {
    let { serialT } = window;
    let expLoadCount = 2;

    return new Promise( function( resolve ) {
      let infScroll = new InfiniteScroll( '.container--prefill-element', {
        path: function() {
          return this.loadCount < expLoadCount ? 'page/fill.html' : false;
        },
        append: '.post',
        elementScroll: true,
        prefill: true,
        onInit: function() {
          this.on( 'append', onAppend );
          this.on( 'error', () => serialT.fail('error should not trigger') );
        },
      } );

      function onAppend() {
        serialT.pass( `prefill window appended post ${infScroll.loadCount}` );
        if ( infScroll.loadCount == expLoadCount ) {
          serialT.is( infScroll.loadCount, expLoadCount,
              `${expLoadCount} pages appended` );
          resolve( serialT.assertions );
        }
      }
    } );
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );
