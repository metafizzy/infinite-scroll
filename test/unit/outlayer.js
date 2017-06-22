/* globals Masonry, imagesLoaded */

QUnit.test( 'outlayer', function( assert ) {

  var msnry, infScroll;
  var demoElem = document.querySelector('.demo--outlayer');

  var done = assert.async( 7 );

  imagesLoaded( demoElem, function() {

    msnry = new Masonry( demoElem, {
      itemSelector: '.outlayer-item',
      transitionDuration: '0.1s',
    });

    infScroll = new InfiniteScroll( demoElem, {
      path: 'page/outlayer{{#}}.html',
      append: '.outlayer-item',
      outlayer: msnry,
      history: false,
      scrollThreshold: false,
    });

    msnry.once( 'layoutComplete', onLayoutComplete2 );
    infScroll.once( 'load', done ); // confirm load event triggers
    infScroll.once( 'append', done ); // confirm append event triggers

    infScroll.loadNextPage();

  });

  function onLayoutComplete2( items ) {
    assert.equal( items.length, 8, '8 items laid out on page 2' );
    checkItems( items );
    done();
    setTimeout( loadPage3 );
  }

  function checkItems( items ) {
    for ( var i=0; i < items.length; i++ ) {
      var item = items[i];
      var itemElem = item.element;
      assert.equal( item.element.parentNode, infScroll.element, 
        'item ' + i + ' has infScroll parent' );
      var leftAndTop = itemElem.style.left && itemElem.style.top;
      assert.ok( leftAndTop, 'item ' + i + ' has left & top style set' );
    }
  }

  function loadPage3() {
    msnry.once( 'layoutComplete', onLayoutComplete3 );
    infScroll.once( 'load', done ); // confirm load event triggers
    infScroll.once( 'append', done ); // confirm append event triggers

    infScroll.loadNextPage();
  }

  function onLayoutComplete3( items ) {
    assert.equal( items.length, 10, '10 items laid out on page 3' );
    checkItems( items );
    setTimeout( loadNoItems );
  }

  // check loading no items does not throw error
  function loadNoItems() {
    infScroll.destroy();
    infScroll = new InfiniteScroll( '.demo--outlayer', {
      path: 'page/outlayer{{#}}.html',
      append: 'none',
      outlayer: msnry,
      history: false,
      scrollThreshold: false,
    });

    infScroll.once( 'load', done );
    infScroll.once( 'append', function( response, path, items ) {
      assert.equal( items.length, 0, 'appended 0 items' );
      done();
    });
    infScroll.loadNextPage();
  }

});
