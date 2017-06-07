QUnit.test( 'prefill element', function( assert ) {

  // expected load count, each post is 200px tall
  var expLoadCount = 3

  // assert.ok( true );

  var done = assert.async( expLoadCount );

  var infScroll = new InfiniteScroll( '.demo--prefill-element', {
    path: function() {
      return 'page/prefill.html';
    },
    append: '.post',
    prefill: true,
    elementScroll: true,
    history: false,
    scrollThreshold: false,
  });

  infScroll.on( 'append', function() {
    assert.ok( true, 'prefill element appended post ' + infScroll.loadCount );
    if ( infScroll.loadCount == expLoadCount ) {
      assert.equal( infScroll.loadCount, expLoadCount,
        expLoadCount + ' pages appended' );
    }
    done();
  });

});
