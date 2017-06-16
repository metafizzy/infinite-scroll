var container = document.querySelector('.posts-container');
var infScroll = new InfiniteScroll( container, {
  path: '.pagination__next',
  append: '.post',
  nav: '.pagination',
  status: '.scroll-status',
  debug: true,
  // history: false,
});
