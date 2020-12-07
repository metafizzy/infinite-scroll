const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');

const port = 9001;
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
  await page.goto( `http://localhost:${port}/test/html/path.html` );

  try {
    await run( t, page );
  } finally {
    page.close();
  }
}

// ------ tests ------ //

test( 'path: function() {}', withPage, async( t, page ) => {
  let infScrollPath = await page.evaluate( function() {
    let infScroll = new InfiniteScroll( '.container', {
      path: function() {
        let nextIndex = this.loadCount + 1;
        return '/fn/page' + nextIndex + '.html';
      },
    } );
    return infScroll.getPath();
  } );
  t.is( infScrollPath, '/fn/page1.html' );
} );

test( 'path: "string{{#}}"', withPage, async( t, page ) => {
  let infScrollPath = await page.evaluate( function() {
    let infScroll = new InfiniteScroll( '.container', {
      path: '/string/page{{#}}.html',
    } );
    return infScroll.getPath();
  } );
  t.is( infScrollPath, '/string/page2.html' );
} );

test( 'path: ".selector-string"', withPage, async( t, page ) => {
  let infScrollPath = await page.evaluate( function() {
    let infScroll = new InfiniteScroll( '.container', {
      path: '.path-next-link',
    } );
    return infScroll.getPath();
  } );
  t.is( infScrollPath, '/area51/selector/page10.html' );
} );

