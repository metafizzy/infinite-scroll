const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');

const port = 9011;
let server, browser, page;

test.before( async function() {
  server = getServer();
  server.listen( port );
  browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.goto(`http://localhost:${port}/test/html/dist-jquery.html`);
} );

test.after( async function() {
  page.close();
  await browser.close();
  server.close();
} );

// ------ tests ------ //

test( 'dist jQuery', async( t ) => {

  let assertions = await page.evaluate( function() {
    const { jQuery } = window;
    let $container = document.querySelector('.container');
    $container = jQuery('.container').infiniteScroll({
      path: 'page/{{#}}.html',
      append: '.post',
    });

    let infScroll = $container.data('infinite-scroll');

    return $container.infiniteScroll('loadNextPage')
      .then( function( load ) {
        let { response, body, items } = load;
        serialT.true( response instanceof Response );
        serialT.true( response.ok );
        serialT.is( response.status, 200 );
        serialT.true( body instanceof HTMLDocument );
        serialT.true( items instanceof NodeList );
        serialT.is( items.length, 2 );
        serialT.true( items[0] == $container[0].children[1] );
        serialT.true( items[1] == $container[0].children[2] );
        serialT.is( infScroll.pageIndex, 2 );
        serialT.is( infScroll.loadCount, 1 );
      } )
      .then( () => serialT.assertions );
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );
