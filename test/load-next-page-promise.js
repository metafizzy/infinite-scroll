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
  await page.goto(`http://localhost:${port}/test/html/page-load.html`);
} );

test.after( async function() {
  page.close();
  await browser.close();
  server.close();
} );

// ------ tests ------ //

test( 'loadNextPage promise', async( t ) => {

  let assertions = await page.evaluate( function() {
    let $container = document.querySelector('.container');
    let infScroll = new InfiniteScroll( $container, {
      path: 'page/{{#}}.html',
      append: '.post',
    } );

    return infScroll.loadNextPage()
      .then( function( load ) {
        let { response, body, items } = load;
        serialT.true( response instanceof Response );
        serialT.true( response.ok );
        serialT.is( response.status, 200 );
        serialT.true( body instanceof HTMLDocument );
        serialT.true( items instanceof NodeList );
        serialT.is( items.length, 2 );
        serialT.true( items[0] == $container.children[1] );
        serialT.true( items[1] == $container.children[2] );
        serialT.is( infScroll.pageIndex, 2 );
        serialT.is( infScroll.loadCount, 1 );
      } )
      .then( () => infScroll.loadNextPage() ) // load page3.html
      .then( function( load ) {
        let { response, body, items } = load;
        serialT.true( response instanceof Response );
        serialT.true( response.ok );
        serialT.is( response.status, 200 );
        serialT.true( body instanceof HTMLDocument );
        serialT.true( items instanceof NodeList );
        serialT.is( items.length, 3 );
        serialT.true( items[0] == $container.children[3] );
        serialT.true( items[1] == $container.children[4] );
        serialT.is( infScroll.pageIndex, 3 );
        serialT.is( infScroll.loadCount, 2 );
      } )
      .then( () => infScroll.loadNextPage() ) // try loading page4.html
      .then( function( load ) {
        let { response, body, items } = load;
        serialT.true( response instanceof Response );
        serialT.false( response.ok );
        serialT.is( response.status, 404 );
        serialT.true( body === undefined );
        serialT.true( items === undefined );
        serialT.is( infScroll.pageIndex, 3 );
        serialT.is( infScroll.loadCount, 2 );
      } )
      .then( () => serialT.assertions );
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );
