QUnit.test( 'prefill element last', function( assert ) {

  // expected load count, each post is 200px tall
  var expLoadCount = 2;

  var done = assert.async( expLoadCount );

  var infScroll = new InfiniteScroll( '.demo--prefill-element-last', {
    path: function() {
      return this.loadCount < 2 ? 'page/prefill.html' : false;
    },
    append: '.post',
    prefill: true,
    elementScroll: true,
    history: false,
    scrollThreshold: false,
    debug: true,
    onInit: function() {
      this.on( 'append', onAppend );
      this.on( 'error', onError );
    },
  });

  function onAppend() {
    assert.ok( true, 'prefill element appended post ' + infScroll.loadCount );
    if ( infScroll.loadCount == expLoadCount ) {
      assert.equal( infScroll.loadCount, expLoadCount,
        expLoadCount + ' pages appended' );
    }
    done();
  }

  function onError() {
    assert.ok( false, 'error should not trigger' );
  }

});
