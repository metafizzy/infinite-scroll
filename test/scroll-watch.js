const test = require('ava');
const puppeteer = require('puppeteer');
const getServer = require('./_get-server.js');

const port = 9007;
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

// ------ tests ------ //

test( 'scrollWatch window', async( t ) => {
  t.plan( 2 );

  let page = await browser.newPage();
  await page.goto( `http://localhost:${port}/test/html/scroll-watch-window.html` );

  let assertions = await page.evaluate( function() {
    let $container = document.querySelector('.container');
    let infScroll = new InfiniteScroll( $container, {
      path: 'page/{{#}}',
      scrollThreshold: 400,
      loadOnScroll: false,
    } );

    let containerBottom;
    function updateContainerBottom() {
      let rect = $container.getBoundingClientRect();
      containerBottom = rect.bottom + window.scrollY - window.innerHeight;
    }
    updateContainerBottom();

    // add delay so that debounced event listener can trigger
    function waitForDebounce() {
      return new Promise( function( resolve ) {
        setTimeout( resolve, 300 );
      } );
    }

    function onScrollThresholdFail() {
      serialT.fail('scrollThreshold should not yet trigger');
    }
    infScroll.on( 'scrollThreshold', onScrollThresholdFail );

    let promises = waitForDebounce()
      // scroll up at top, nowhere near threshold. scrollThreshold should not trigger
      .then( () => scrollTo( 0, 100 ) )
      .then( waitForDebounce )
      // get close to bottom, but not over. scrollThreshold should not trigger
      .then( () => scrollTo( 0, containerBottom - 500 ) )
      .then( waitForDebounce )
      // scroll past threshold, trigger scrollThreshold
      .then( () => {
        infScroll.off( 'scrollThreshold', onScrollThresholdFail );
        let promise = new Promise( function( resolve ) {
          infScroll.once( 'scrollThreshold', function() {
            serialT.pass('scrollThreshold triggered at bottom');
            resolve();
          } );
        } );

        scrollTo( 0, containerBottom - 300 );
        return promise;
      } )
      // scroll up, should not trigger scrollThreshold
      .then( () => {
        infScroll.on( 'scrollThreshold', onScrollThresholdFail );
        scrollTo( 0, containerBottom - 500 );
      } )
      .then( waitForDebounce )
      // resize element & trigger scrollThreshold
      .then( () => {
        infScroll.off( 'scrollThreshold', onScrollThresholdFail );

        let promise = new Promise( function( resolve ) {
          infScroll.once( 'scrollThreshold', function() {
            serialT.pass('scrollThreshold triggered at new bottom');
            resolve();
          } );
        } );

        $container.style.height = '1000px';
        updateContainerBottom();
        scrollTo( 0, containerBottom - 300 );
        return promise;
      } )
      .then( () => serialT.assertions );

    return promises;
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );

  page.close();
} );

test( 'scrollWatch element', async( t ) => {
  t.plan( 2 );

  let page = await browser.newPage();
  await page.goto( `http://localhost:${port}/test/html/scroll-watch-element.html` );

  let assertions = await page.evaluate( function() {
    let $container = document.querySelector('.container');
    let infScroll = new InfiniteScroll( $container, {
      path: 'page/{{#}}',
      scrollThreshold: 200,
      elementScroll: true,
      loadOnScroll: false,
    } );

    let containerBottom;
    function updateContainerBottom() {
      containerBottom = $container.scrollHeight - $container.clientHeight;
    }
    updateContainerBottom();

    // add delay so that debounced event listener can trigger
    function waitForDebounce() {
      return new Promise( function( resolve ) {
        setTimeout( resolve, 300 );
      } );
    }

    function getPost() {
      let $post = document.createElement('div');
      $post.className = 'post';
      return $post;
    }

    function onScrollThresholdFail() {
      serialT.fail('scrollThreshold should not yet trigger');
    }
    infScroll.on( 'scrollThreshold', onScrollThresholdFail );

    let promises = waitForDebounce()
      // scroll up at top, nowhere near threshold. scrollThreshold should not trigger
      .then( () => {
        $container.scrollTop = 100;
      } )
      .then( waitForDebounce )
      // get close to bottom, but not over. scrollThreshold should not trigger
      .then( () => {
        $container.scrollTop = containerBottom - 300;
      } )
      .then( waitForDebounce )
      // scroll past threshold, trigger scrollThreshold
      .then( () => {
        infScroll.off( 'scrollThreshold', onScrollThresholdFail );
        let promise = new Promise( function( resolve ) {
          infScroll.once( 'scrollThreshold', function() {
            serialT.pass('scrollThreshold triggered at bottom');
            resolve();
          } );
        } );

        $container.scrollTop = containerBottom - 150;
        return promise;
      } )
      // scroll up, should not trigger scrollThreshold
      .then( () => {
        infScroll.on( 'scrollThreshold', onScrollThresholdFail );
        $container.scrollTop = containerBottom - 400;
      } )
      .then( waitForDebounce )
      // resize element & trigger scrollThreshold
      .then( () => {
        infScroll.off( 'scrollThreshold', onScrollThresholdFail );

        let promise = new Promise( function( resolve ) {
          infScroll.once( 'scrollThreshold', function() {
            serialT.pass('scrollThreshold triggered at new bottom');
            resolve();
          } );
        } );

        $container.append( getPost() );
        $container.append( getPost() );
        updateContainerBottom();
        $container.scrollTop = containerBottom - 150;
        return promise;
      } )
      .then( () => serialT.assertions );

    return promises;
  } );

  assertions.forEach( ({ method, args }) => t[ method ]( ...args ) );

  page.close();
} );

