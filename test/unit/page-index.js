QUnit.test( 'pageIndex', function( assert ) {

  let demoElem = document.querySelector('.demo--page-index');

  let infScroll = new InfiniteScroll( demoElem, {
    path: '.page-index-next-link',
    history: false,
    scrollThreshold: false,
  } );

  assert.equal( infScroll.pageIndex, 4, 'pageIndex from path element' );

  infScroll.destroy();

  // pageIndex from URL with {{#}} path
  let prevURL = location.href;
  // set URL with page number
  history.replaceState( null, document.title, 'page/7' );
  infScroll = new InfiniteScroll( demoElem, {
    path: 'page/{{#}}',
    history: false,
    scrollThreshold: false,
  } );

  assert.equal( infScroll.pageIndex, 7, 'pageIndex from URL with {{#}}' );

  history.replaceState( null, document.title, prevURL );

  infScroll.destroy();

  history.replaceState( null, document.title, 'page?currPage=8' );
  infScroll = new InfiniteScroll( demoElem, {
    path: 'page?currPage={{#}}',
    history: false,
    scrollThreshold: false,
  } );

  assert.equal( infScroll.pageIndex, 8, 'pageIndex from GET param with {{#}}' );

  history.replaceState( null, document.title, prevURL );

  infScroll.destroy();

  history.replaceState( null, document.title, 'page?currPage=8' );
  infScroll = new InfiniteScroll( demoElem, {
    path: 'page\\?currPage={{#}}',
    history: false,
    scrollThreshold: false,
  } );

  assert.equal( infScroll.pageIndex, 8,
      'pageIndex from GET param with {{#}} and pre-escaped regexp' );

  history.replaceState( null, document.title, prevURL );
} );
