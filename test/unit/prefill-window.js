QUnit.test( 'prefill window', function( assert ) {

  // expected load count, each post is 200px tall
  let expLoadCount = Math.ceil( window.innerHeight / 200 );
  let done = assert.async( expLoadCount );

  let infScroll = new InfiniteScroll( '.demo--prefill-window', {
    path: function() {
      return 'page/prefill.html';
    },
    append: '.post',
    prefill: true,
    history: false,
    scrollThreshold: false,
    onInit: function() {
      this.on( 'append', onAppend );
    },
  } );

  function onAppend() {
    assert.ok( true, 'prefill window appended post ' + infScroll.loadCount );
    if ( infScroll.loadCount == expLoadCount ) {
      assert.equal( infScroll.loadCount, expLoadCount,
          expLoadCount + ' pages appended' );
    }
    done();
  }

} );
