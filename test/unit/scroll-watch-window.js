QUnit.test( 'scrollWatch window', function( assert ) {

  let done = assert.async();

  let demoElem = document.querySelector('.demo--scroll-watch-window');

  let infScroll = new InfiniteScroll( demoElem, {
    path: 'page/{{#}}',
    scrollThreshold: 400,
    loadOnScroll: false,
    history: false,
  } );

  let bottom;
  function updateBottom() {
    let rect = demoElem.getBoundingClientRect();
    bottom = rect.bottom + window.pageYOffset - window.innerHeight;
  }
  updateBottom();

  function notYet() {
    assert.ok( false, 'not yet at scroll bottom' );
  }

  infScroll.on( 'scrollThreshold', notYet );

  setTimeout( function step1() {
    // scroll up at top, nowhere near threshold
    scrollTo( 0, 100 );
    // setTimeout to trigger debounced scroll listeners
    setTimeout( step2, 300 );
  } );

  // scroll close to threshold, but not over
  function step2() {
    assert.ok( true, 'scrollThreshold not triggered at top' );
    scrollTo( 0, bottom - 500 );
    setTimeout( step3, 300 );
  }

  function step3() {
    assert.ok( true, 'scrollThreshold not triggered close' );
    infScroll.off( 'scrollThreshold', notYet );
    infScroll.once( 'scrollThreshold', function() {
      assert.ok( true, 'scrollThreshold triggered at bottom' );
      setTimeout( step4, 300 );
    } );
    // scroll past threshold
    scrollTo( 0, bottom - 300 );
  }

  // scroll up, should not trigger scrollThreshold
  function step4() {
    infScroll.on( 'scrollThreshold', notYet );
    scrollTo( 0, bottom - 500 );
    setTimeout( step5, 300 );
  }

  // resize element & trigger scrollThreshold
  function step5() {
    assert.ok( true, 'scrollThreshold not triggered on scroll up' );
    infScroll.off( 'scrollThreshold', notYet );
    infScroll.once( 'scrollThreshold', function() {
      assert.ok( true, 'scrollThreshold triggered at new bottom' );
      infScroll.destroy();
      demoElem.style.height = '';
      done();
    } );
    demoElem.style.height = '1000px';
    updateBottom();
    scrollTo( 0, bottom - 300 );
  }

} );

