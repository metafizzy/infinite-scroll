var container = document.querySelector('.posts-container');
var infScroll = new InfiniteScroll( container, {
  path: '.pagination__next',
  append: '.post',
  historyTitle: true,
  nav: '.pagination',
  status: '.scroll-status',
  log: true,
  // json: true,
  // history: false,
});
