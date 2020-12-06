QUnit.test( 'path', function( assert ) {

  // path: function
  let infScroll = new InfiniteScroll( '.demo--path', {
    path: function() {
      let nextIndex = this.loadCount + 1;
      return '/fn/page' + nextIndex + '.html';
    },
    scrollThreshold: false,
    history: false,
  } );
  assert.equal( infScroll.getPath(), '/fn/page1.html',
      'path option set with function' );
  infScroll.destroy();

  // path: string{{#}}
  infScroll = new InfiniteScroll( '.demo--path', {
    path: '/string/page{{#}}.html',
    scrollThreshold: false,
    history: false,
  } );
  assert.equal( infScroll.getPath(), '/string/page2.html',
      'path option set with {{#}} string' );
  infScroll.destroy();

  // path: selector string
  infScroll = new InfiniteScroll( '.demo--path', {
    path: '.path-next-link',
    scrollThreshold: false,
    history: false,
  } );
  assert.equal( infScroll.getPath(), '/area51/selector/page10.html',
      'path option set with selector string' );
  infScroll.destroy();

  // path: bad
  infScroll = new InfiniteScroll( '.demo--path', {
    path: '.bad-path',
    scrollThreshold: false,
    history: false,
  } );
  assert.ok( true, 'bad path does not throw error' );
  infScroll.destroy();

} );
