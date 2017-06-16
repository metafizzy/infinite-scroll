/*global requirejs: false*/

// ---- bower components ---- //

// requirejs.config({
//   baseUrl: '../../bower_components'
// });
//
// requirejs( [ '../js/index' ], initScroll );

// ---- pkgd ---- //

requirejs( [
  '../../dist/infinite-scroll.pkgd.js'
], initScroll );

function initScroll( InfiniteScroll ) {
  new InfiniteScroll( '.posts-container', {
    path: '.pagination__next',
    append: '.post',
    nav: '.pagination',
    status: '.scroll-status',
    debug: true,
    history: false,
  });
}
