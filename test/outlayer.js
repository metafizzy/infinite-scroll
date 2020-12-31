/* globals imagesLoaded, Masonry */

const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');

const port = 9008;
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
  await page.goto(`http://localhost:${port}/test/html/outlayer.html`);
  try {
    await run( t, page );
  } finally {
    await page.close();
  }
}

// ------ tests ------ //

test( 'outlayer items', withPage, async( t, page ) => {

  let assertions = await page.evaluate( function() {
    let msnry, infScroll;
    let $container = document.querySelector('.container');

    function checkItems( items ) {
      items.forEach( ( item, i ) => {
        let $itemElem = item.element;
        let { left, top } = $itemElem.style;
        serialT.truthy( $itemElem.parentNode === infScroll.element,
            `item ${i} has infScroll parent` );
        serialT.truthy( left && top, `item ${i} has left & top style set` );
      } );
    }

    function loadNextPagePromise() {
      let promises = [
        new Promise( ( resolve ) => msnry.once( 'layoutComplete', resolve ) ),
        new Promise( ( resolve ) => infScroll.once( 'load', resolve ) ),
        new Promise( ( resolve ) => infScroll.once( 'append', resolve ) ),
      ];

      infScroll.loadNextPage();
      return Promise.all( promises );
    }

    return new Promise( function( resolve ) {
      imagesLoaded( $container, resolve );
    } )
      .then( () => {
        msnry = new Masonry( $container, {
          itemSelector: '.outlayer-item',
          transitionDuration: '0.1s',
        } );

        infScroll = new InfiniteScroll( $container, {
          path: 'page/outlayer{{#}}.html',
          append: '.outlayer-item',
          outlayer: msnry,
          scrollThreshold: false,
        } );

        return loadNextPagePromise();
      } )
      .then( ([ items ]) => {
        serialT.is( items.length, 8, '8 items laid out on page 2' );
        checkItems( items );
        return loadNextPagePromise();
      } )
      .then( ([ items ]) => {
        serialT.is( items.length, 10, '10 items laid out on page 3' );
        checkItems( items );
      } )
      .then( () => serialT.assertions );

  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );
} );

test( 'outlayer none', withPage, async( t, page ) => {

  let assertions = await page.evaluate( function() {
    let msnry, infScroll;
    let $container = document.querySelector('.container');

    return new Promise( function( resolve ) {
      imagesLoaded( $container, resolve );
    } )
      .then( () => {
        msnry = new Masonry( $container, {
          itemSelector: '.outlayer-item',
          transitionDuration: '0.1s',
        } );

        infScroll = new InfiniteScroll( $container, {
          path: 'page/outlayer{{#}}.html',
          append: 'NONE', // prevent appending with faulty selector
          outlayer: msnry,
          scrollThreshold: false,
        } );

        let promise = new Promise( ( resolve ) => {
          infScroll.once( 'load', () => {
            serialT.pass('load triggered but not append');
            resolve();
          } );
        } );

        infScroll.loadNextPage();
        return promise;
      } )
      .then( () => serialT.assertions );
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );

} );
