QUnit.test( 'pageLoad method', function( assert ) {

  var demoElem = document.querySelector('.demo--page-load-method');

  var countPageLoad = 0;
  var infScroll = new InfiniteScroll( demoElem, {
    path: '.page-load-method-next-link',
    append: '.post-method',
    scrollThreshold: false,
    history: false, method: 'POST', params: function() { return {foo: 'bar', baz: 'qux', count: ++countPageLoad}; }
  });

  var done = assert.async( 7 );

  // page 2
  infScroll.once( 'request', function( path ) {
    assert.ok( path.match('page/2-method.html'),
      'request event, path has page/2-method.html' );
    assert.equal('POST', infScroll.options.method, 'Method is POST');
    assert.equal(countPageLoad, 1, 'When Params as a function, run every request( first request, count should be 1)');
    done();
  });

  infScroll.once( 'load', function( response, path ) {
    assert.equal( response.nodeName, '#document',
      'load event, response is document' );
    assert.ok( path.match('page/2-method.html'), 'load event, path has page/2-method.html' );
    assert.equal( infScroll.loadCount, 1, 'loadCount = 1' );
    assert.equal( infScroll.pageIndex, 2, 'pageIndex = 2' );
    done();
  });

  infScroll.once( 'append', function( response, path, items ) {
    assert.equal( response.nodeName, '#document',
      'append event, response is document' );
    assert.ok( path.match('page/2-method.html'),
      'append event, path has page/2-method.html' );
    assert.equal( items.length, 2, 'items argument, length 2' );
    assert.ok( demoElem.children[1] === items[0], 'item0 appended' );
    assert.ok( demoElem.children[2] === items[1], 'item1 appended' );

    done();
    setTimeout( page3Method ); // do next thing
  });

  infScroll.loadNextPage();

  function page3Method() {
    // check async external script, test not working


    infScroll.once( 'request', function( path ) {
      assert.ok( path.match('page/3-method.html'),
        'request event, path has page/3-method.html' );
      assert.equal(countPageLoad, 2, 'When Params as a function, run every request (second request, count should be 2)');
      done();
    });

    infScroll.once( 'load', function( response, path ) {
      assert.equal( response.nodeName, '#document',
        'load event, response is document' );
      assert.ok( path.match('page/3-method.html'), 'load event, path has page/3-method.html' );
      assert.equal( infScroll.loadCount, 2, 'loadCount = 2' );
      assert.equal( infScroll.pageIndex, 3, 'pageIndex = 3' );
      done();
    });

    infScroll.once( 'append', function( response, path, items ) {
      assert.equal( response.nodeName, '#document',
        'append event, response is document' );
      assert.ok( path.match('page/3-method.html'),
        'append event, path has page/3-method.html' );
      assert.equal( items.length, 3, 'items argument, length 3' );
      assert.equal( demoElem.children[3], items[0], 'item0 appended' );
      assert.equal( demoElem.children[4], items[1], 'item1 appended' );
      assert.equal( demoElem.children[5], items[2], 'item1 appended' );
      done();
    });

    infScroll.once( 'last', function( response, path ) {
      assert.equal( response.nodeName, '#document',
        'last event, response is document' );
      assert.ok( path.match('page/3-method.html'),
        'last event, path has page/3-method.html' );
      done();
      // setTimeout( pageError );
    });

    infScroll.loadNextPage();
  }

});
