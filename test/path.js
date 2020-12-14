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

test( 'getPathParts', withPage, async( t, page ) => {
  let assertions = await page.evaluate( function() {
    let { serialT } = window;

    serialT.deepEqual( InfiniteScroll.getPathParts('https://example.com/page/2'), {
      begin: 'https://example.com/page/',
      index: '2',
      end: '',
    } );
    serialT.deepEqual( InfiniteScroll.getPathParts('https://example.com/page44'), {
      begin: 'https://example.com/page',
      index: '44',
      end: '',
    } );
    serialT.deepEqual( InfiniteScroll.getPathParts('page/5.html?dark_mode=2'), {
      begin: 'page/',
      index: '5',
      end: '.html?dark_mode=2',
    } );
    serialT.deepEqual( InfiniteScroll.getPathParts('blog/?page=15&dark_mode=2'), {
      begin: 'blog/?page=',
      index: '15',
      end: '&dark_mode=2',
    } );
    serialT.deepEqual( InfiniteScroll.getPathParts('blog?page=15&dark_mode=2'), {
      begin: 'blog?page=',
      index: '15',
      end: '&dark_mode=2',
    } );

    let coasterUrlA = '/parks/coasters?page=2&ridden_in=2019&sort=order'; // #915
    serialT.deepEqual( InfiniteScroll.getPathParts( coasterUrlA ), {
      begin: '/parks/coasters?page=',
      index: '2',
      end: '&ridden_in=2019&sort=order',
    } );
    let coasterUrlB = '/parks/coasters?ridden_in=2019&sort=order&page=2'; // #915
    serialT.deepEqual( InfiniteScroll.getPathParts( coasterUrlB ), {
      begin: '/parks/coasters?ridden_in=2019&sort=order&page=',
      index: '2',
      end: '',
    } );

    let paginoUrl = 'https://example.com/?year=2020&pagino=15&dark_mode=true';
    serialT.deepEqual( InfiniteScroll.getPathParts( paginoUrl ), {
      begin: 'https://example.com/?year=2020&pagino=',
      index: '15',
      end: '&dark_mode=true',
    } );

    return serialT.assertions;
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );

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

