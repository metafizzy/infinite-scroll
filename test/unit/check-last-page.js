QUnit.test( 'checkLastPage', function( assert ) {

  var done = assert.async();

  // ----- checkLastPage: true ----- //

  var infScroll = new InfiniteScroll( '.demo--check-last-page', {
    path: '.check-last-page-next-link',
    append: '.post',
    scrollThreshold: false,
    history: false,
  });

  infScroll.on( 'last', onTrueLast1 );
  infScroll.once( 'append', onTrueAppend1 );

  function onTrueLast1() {
    assert.ok( false, 'last should not trigger on 2nd page' );
  }

  function onTrueAppend1() {
    infScroll.off( 'last', onTrueLast1 );
    loadTruePage3();
  }

  infScroll.loadNextPage();

  function loadTruePage3() {
    infScroll.once( 'last', function() {
      assert.ok( true, 'checkLastPage: true, last triggered on 3rd page' );
      checkString();
    });

    infScroll.loadNextPage();
  }

  // ----- checkLastPage: 'string' ----- //

  function checkString() {
    // reset
    infScroll.destroy();
    infScroll = new InfiniteScroll( '.demo--check-last-page', {
      path: 'page/{{#}}.html',
      checkLastPage: '.next-page-link',
      append: '.post',
      scrollThreshold: false,
      history: false,
    });
    
    infScroll.on( 'last', onStringLast1 );
    infScroll.once( 'append', onStringAppend1 );
    infScroll.loadNextPage();
  }

  function onStringLast1() {
    assert.ok( false, 'last should not trigger on 2nd page' );
  }

  function onStringAppend1() {
    infScroll.off( 'last', onStringLast1 );
    loadStringPage3();
  }

  infScroll.loadNextPage();

  function loadStringPage3() {
    infScroll.once( 'last', function() {
      assert.ok( true, 'checkLastPage: \'string\', last triggered on 3rd page' );
      done();
    });

    infScroll.loadNextPage();
  }

});
