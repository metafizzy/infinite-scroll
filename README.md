# Infinite Scroll

_Automatically add next page_

See [infinite-scroll.com](https://infinite-scroll.com) for complete docs and demos.

## Install

### Download

- [infinite-scroll.pkgd.min.js](https://unpkg.com/infinite-scroll@4/dist/infinite-scroll.pkgd.min.js) minified, or
- [infinite-scroll.pkgd.js](https://unpkg.com/infinite-scroll@4/dist/infinite-scroll.pkgd.js) un-minified

### CDN

Link directly to Infinite Scroll files on [unpkg](https://unpkg.com).

``` html
<script src="https://unpkg.com/infinite-scroll@4/dist/infinite-scroll.pkgd.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/infinite-scroll@4/dist/infinite-scroll.pkgd.js"></script>
```

### Package managers

npm: `npm install infinite-scroll`

Yarn: `yarn add infinite-scroll`

## License

### Commercial license

If you want to use Infinite Scroll to develop commercial sites, themes, projects, and applications, the Commercial license is the appropriate license. With this option, your source code is kept proprietary. Purchase an Infinite Scroll Commercial License at [infinite-scroll.com](https://infinite-scroll.com/#commercial-license)

### Open source license

If you are creating an open source application under a license compatible with the [GNU GPL license v3](https://www.gnu.org/licenses/gpl-3.0.html), you may use Infinite Scroll under the terms of the GPLv3.

[Read more about Infinite Scroll's license](https://infinite-scroll.com/license.html).

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
let infScroll = new InfiniteScroll( '.container', {
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
  // Set to string if path is not set as selector string:
  //   checkLastPage: '.pagination__next'

  prefill: false,
  // Loads and appends pages on intialization until scroll requirement is met.

  responseBody: 'text',
  // Sets the method used on the response.
  // Set to 'json' to load JSON.

  domParseResponse: true,
  // enables parsing response body into a DOM
  // disable to load flat text

  fetchOptions: undefined,
  // sets custom settings for the fetch() request
  // for setting headers, cors, or POST method
  // can be set to an object, or a function that returns an object

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

  debug: false,
  // Logs events and state changes to the console.
})
```

## Browser support

Infinite Scroll v4 supports Chrome 60+, Edge 79+, Firefox 55+, Safari 11+.

For IE10 and Android 4 support, try [Infinite Scroll v3](https://v3.infinite-scroll.com/).

## Development

This package is developed with Node.js v14 and npm v6. Manage Node and npm version with [nvm](https://github.com/nvm-sh/nvm).

``` sh
nvm use
```

Install dependencies

``` sh
npm install
```

Lint

``` sh
npm run lint
```

Run tests

``` sh
npm test
```

---

By [Metafizzy 🌈🐻](https://metafizzy.co)
