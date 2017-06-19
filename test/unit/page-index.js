QUnit.test( 'pageIndex', function( assert ) {

  var demoElem = document.querySelector('.demo--page-index');

  var infScroll = new InfiniteScroll( demoElem, {
    path: '.page-index-next-link',
    history: false,
    scrollThreshold: false,
  });

  assert.equal( infScroll.pageIndex, 4, 'pageIndex from path element' );

  infScroll.destroy();

  // pageIndex from URL with {{#}} path
  var prevURL = location.href;
  // set URL with page number
  history.replaceState( null, document.title, 'page/7' );
  infScroll = new InfiniteScroll( demoElem, {
    path: 'page/{{#}}',
    history: false,
    scrollThreshold: false,
  });

  assert.equal( infScroll.pageIndex, 7, 'pageIndex from URL with {{#}}' );

  history.replaceState( null, document.title, prevURL );

});
