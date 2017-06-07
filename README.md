# Infinite Scroll

_Automatically add the next page_

## Install

### Download

### CDN

### Package managers

Bower: `bower install infinite-scroll --save`

## License

### Commercial license

If you want to use Infinite Scroll to develop commercial sites, themes, projects, and applications, the Commercial license is the appropriate license. With this option, your source code is kept proprietary.

### Open source license

If you are creating an open source application under a license compatible with the [GNU GPL license v3](https://www.gnu.org/licenses/gpl-3.0.html), you may use Infinite Scroll under the terms of the GPLv3.

## Usage

Infinite Scroll works on a container element with its child item elements

``` html
<div class="container">
  <article class="post">...</article>
  <article class="post">...</article>
  <article class="post">...</article>
  ...
</div>
```

### Options

``` js
var infScroll = new InfiniteScroll( '.container', {
  // defaults listed

  path: undefined,
  // REQUIRED. Determines the URL for the next page
  // Set to selector string to use the href of the next page's link
  // path: '.pagination__next'
  // Or set with {{#}} in place of the page number in the url
  // path: '/blog/page/{{#}}'
  // or set with function
  // path: function() {
  //   return return '/articles/P' + ( ( this.loadCount + 1 ) * 10 );
  // }

  append: undefined,
  // REQUIRED for appending content
  // Appends selected elements from loaded page to the container

  checkLastPage: true,
  // Checks if page has path selector element

  prefill: false,
  // Loads and appends pages on intialization until scroll requirement is met.

  responseType: 'document',
  // Sets the type of response returned by the page request.
  // Set to 'text' to return flat text for loading JSON.

  outlayer: false,
  // Integrates Masonry, Isotope or Packery
  // Appended items will be added to the layout

  scrollThreshold: 400,
  // Sets the distance between the viewport to scroll area
  // for scrollThreshold event to be triggered.

  elementScroll: false,
  // Sets scroller to an element for overflow element scrolling

  loadOnScroll: true,
  // Loads next page when scroll crosses over scrollThreshold

  history: 'replace',
  // Changes the browser history and URL.
  // Set to 'push' to use history.pushState()
  //    to create new history entries for each page change.

  historyTitle: true,
  // Updates the window title. Requires history enabled.

  hideNav: undefined,
  // Hides navigation element

  status: undefined,
  // Displays status elements indicating state of page loading:
  // .infinite-scroll-request, .infinite-scroll-load, .infinite-scroll-error
  // status: '.page-load-status'

  button: undefined,
  // Enables a button to load pages on click
  // button: '.load-next-button'

  onInit: undefined,
  // called on initialization
  // useful for binding events on init
  // onInit: function() {
  //   this.on( 'append', function() {...})
  // }

  log: false,
  // Logs events and state changes to the console.
})
```

## WordPress plugin

The Infinite Scroll WordPress plugin is being moved to another repo.

---

By [Metafizzy](http://metafizzy.co)
