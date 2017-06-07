QUnit.test( 'history window', function( assert ) {

  var done = assert.async();
  var origHref = location.href;
  var origTitle = document.title;

  var demoElem = document.querySelector('.demo--history-window');
  var infScroll = new InfiniteScroll( demoElem, {
    path: 'page/{{#}}.html',
    append: '.post',
    scrollThreshold: false,
    history: 'replace',
    historyTitle: true,
    // log: true,
  });

  var page1Top = getTop( demoElem );
  var page2Top;
  var page3Top;

  function getTop( elem ) {
    return elem.getBoundingClientRect().top + window.pageYOffset;
  }

  infScroll.once( 'append', function( response, path, items ) {
    page2Top = getTop( items[0] );
    infScroll.once( 'history', function( title, path ) {
      assert.equal( path, location.href, '2nd page history url changed to ' + path );
      assert.equal( title, document.title, 'document title changed to ' + title );
      setTimeout( step2, 300 );
    });
    scrollTo( 0, page2Top - window.innerHeight/4 );
  });

  infScroll.loadNextPage();

  function step2() {
    infScroll.once( 'history', function( title, path ) {
      assert.equal( path, location.href, '1st page history, url changed to ' + path );
      assert.equal( title, document.title, 'document title changed to ' + title );
      step3();
    });
    scrollTo( 0, page1Top );
  }

  function step3() {
    infScroll.once( 'append', function( response, _path, items ) {
      page3Top = getTop( items[0] );
      infScroll.once( 'history', function( title, path ) {
        assert.equal( path, location.href, '3rd page history url changed to ' + path );
        assert.equal( title, document.title, 'document title changed to ' + title );
        allDone();
      });
      scrollTo( 0, page3Top - window.innerHeight/4 );
    });
    infScroll.loadNextPage();
  }

  function allDone() {
    infScroll.destroy();
    history.replaceState( null, origTitle, origHref );
    document.title = origTitle;
    done();
  }

});
