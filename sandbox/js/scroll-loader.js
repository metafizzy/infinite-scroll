let container = document.querySelector('.posts-container');
window.infScroll = new InfiniteScroll( container, {
  path: '.pagination__next',
  append: '.post',
  nav: '.pagination',
  status: '.scroll-status',
  debug: true,
  // history: false,
} );
