# Infinite Scroll With History

This is an extension of Paul Irish's Infinite Scroll project. This adds History API integration into it.

What works:
* Scrolling down updates the url with the page
* Scrolling up after scrolling down also updates the url properly
* New Jasmine Test Library

What doesn't work:
* Wordpress plugin does not have History API
* Minimized version is the original Infinite Scroll project code still

On my todo list:
* Update docs to include new params
* When first requested page is 2+, load previous pages above
* Add option for page 1's url to be bare
* Allow all matches of navSelector to be hidden

###Paul Irish's Original Infinite Scroll Documentation###

<http://www.infinite-scroll.com/>

The jQuery and Wordpress Plugins:

* jQuery Plugin <http://www.infinite-scroll.com/infinite-scroll-jquery-plugin/> `v2.0b.110415`
* Wordpress Plugin <http://www.infinite-scroll.com/installation/>

As of version 2.0, option names have changed. Here is a list:

```javascript
$('.selector').infinitescroll({
  loading: {
    finished: undefined,
    finishedMsg: "<em>Congratulations, you've reached the end of the internet.</em>",
    img: "http://www.infinite-scroll.com/loading.gif",
    msg: null,
    msgText: "<em>Loading the next set of posts...</em>",
    selector: null,
    speed: 'fast',
    start: undefined
  },
  state: {
    isDuringAjax: false,
    isInvalidPage: false,
    isDestroyed: false,
    isDone: false, // For when it goes all the way through the archive.
    isPaused: false,
    currPage: 1
  },
  callback: undefined,
  debug: false,
  behavior: undefined,
  binder: $(window), // used to cache the selector
  nextSelector: "div.navigation a:first",
  navSelector: "div.navigation",
  contentSelector: null, // rename to pageFragment
  extraScrollPx: 150,
  itemSelector: "div.post",
  animate: false,
  pathParse: undefined,
  dataType: 'html',
  appendCallback: true,
  bufferPx: 40,
  errorCallback: function () { },
  infid: 0, //Instance ID
  pixelsFromNavToBottom: undefined,
  path: undefined
});
```

In addition, you can pause infinite scroll to stop it from triggering, and later resume it.

```javascript
$('.selector').infinitescroll('pause');
$('.selector').infinitescroll('resume');
```
