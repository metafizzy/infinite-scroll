QUnit.test( 'pageLoad', function( assert ) {


  var demoElem = document.querySelector('.demo--page-load');
  // var done = assert.async( 2 );

  var infScroll = new InfiniteScroll( demoElem, {
    path: '.page-load-next-link',
    append: '.post',
    scrollThreshold: false,
    history: false,
  });

  var done = assert.async( 7 );

  // page 2
  infScroll.once( 'request', function( path ) {
    assert.ok( path.match('page/2.html'),
      'request event, path has page/2.html' );
    done();
  });

  infScroll.once( 'load', function( response, path ) {
    assert.equal( response.nodeName, '#document',
      'load event, response is document' );
    assert.ok( path.match('page/2.html'), 'load event, path has page/2.html' );
    assert.equal( infScroll.loadCount, 1, 'loadCount = 1' );
    assert.equal( infScroll.pageIndex, 2, 'pageIndex = 2' );
    done();
  });

  infScroll.once( 'append', function( response, path, items ) {
    assert.equal( response.nodeName, '#document',
      'append event, response is document' );
    assert.ok( path.match('page/2.html'),
      'append event, path has page/2.html' );
    assert.equal( items.length, 2, 'items argument, length 2' );
    assert.ok( demoElem.children[1] === items[0], 'item0 appended' );
    assert.ok( demoElem.children[2] === items[1], 'item1 appended' );
    done();
    setTimeout( page3 ); // do next thing
  });

  infScroll.loadNextPage();

  function page3() {
    infScroll.once( 'request', function( path ) {
      assert.ok( path.match('page/3.html'),
        'request event, path has page/3.html' );
      done();
    });

    infScroll.once( 'load', function( response, path ) {
      assert.equal( response.nodeName, '#document',
        'load event, response is document' );
      assert.ok( path.match('page/3.html'), 'load event, path has page/3.html' );
      assert.equal( infScroll.loadCount, 2, 'loadCount = 2' );
      assert.equal( infScroll.pageIndex, 3, 'pageIndex = 3' );
      done();
    });

    infScroll.once( 'append', function( response, path, items ) {
      assert.equal( response.nodeName, '#document',
        'append event, response is document' );
      assert.ok( path.match('page/3.html'),
        'append event, path has page/3.html' );
      assert.equal( items.length, 3, 'items argument, length 3' );
      assert.equal( demoElem.children[3], items[0], 'item0 appended' );
      assert.equal( demoElem.children[4], items[1], 'item1 appended' );
      assert.equal( demoElem.children[5], items[2], 'item1 appended' );
      done();
    });

    infScroll.once( 'last', function( response, path ) {
      assert.equal( response.nodeName, '#document',
        'last event, response is document' );
      assert.ok( path.match('page/3.html'),
        'last event, path has page/3.html' );
      done();
      // setTimeout( pageError );
    });

    infScroll.loadNextPage();
  }

  // pageError();

  function pageError() {
    // reset infScroll
    // infScroll.destroy();
    infScroll = new InfiniteScroll( demoElem, {
      // page not there
      path: function() {
        return 'page/4.html';
      },
      scrollThreshold: false,
      history: false,
    });

    infScroll.on( 'error', function( error ) {
      assert.ok( error, 'error event, with error argument' );
      done();
    });

    infScroll.loadNextPage();
  }

  // load json

});
