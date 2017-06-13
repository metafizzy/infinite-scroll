var container = document.querySelector('.posts-container');
var infScroll = new InfiniteScroll( container, {
  path: '.pagination__next',
  append: '.post',
  nav: '.pagination',
  status: '.scroll-status',
  log: true,
  // history: false,
});
