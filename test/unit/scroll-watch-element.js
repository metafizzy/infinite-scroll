QUnit.test( 'scrollWatch element', function( assert ) {

  let done = assert.async();

  let demoElem = document.querySelector('.demo--scroll-watch-element');

  let infScroll = new InfiniteScroll( demoElem, {
    path: 'page/{{#}}',
    scrollThreshold: 200,
    elementScroll: true,
    loadOnScroll: false,
    history: false,
  } );

  let bottom;
  function updateBottom() {
    bottom = demoElem.scrollHeight - demoElem.clientHeight;
  }
  updateBottom();

  function notYet() {
    assert.ok( false, 'not yet at scroll bottom' );
  }

  infScroll.on( 'scrollThreshold', notYet );

  setTimeout( function step1() {
    // scroll up at top, nowhere near threshold
    demoElem.scrollTop = 100;
    // setTimeout to trigger debounced scroll listeners
    setTimeout( step2, 300 );
  } );

  // scroll close to threshold, but not over
  function step2() {
    assert.ok( true, 'scrollThreshold not triggered at top' );
    demoElem.scrollTop = bottom - 300;
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
    demoElem.scrollTop = bottom - 150;
  }

  // scroll up, should not trigger scrollThreshold
  function step4() {
    infScroll.on( 'scrollThreshold', notYet );
    demoElem.scrollTop = bottom - 400;
    setTimeout( step5, 300 );
  }

  // resize element & trigger scrollThreshold
  function step5() {
    assert.ok( true, 'scrollThreshold not triggered on scroll up' );
    infScroll.off( 'scrollThreshold', notYet );
    infScroll.once( 'scrollThreshold', function() {
      assert.ok( true, 'scrollThreshold triggered at new bottom' );
      infScroll.destroy();
      done();
    } );
    demoElem.appendChild( getPost() );
    demoElem.appendChild( getPost() );
    updateBottom();
    demoElem.scrollTop = bottom - 150;
  }

  function getPost() {
    let post = document.createElement('div');
    post.className = 'post';
    return post;
  }

} );
