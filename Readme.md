
# Infinite Scroll

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

## Examples

### Scrolling inside an element

To scroll inside an element having _overflow_, use the _local_ behavior. 

<pre>
$('.selector').infinitescroll({
  behavior: 'local',
  // other options
});
</pre>

### Loading JSON data

As explained on the website, Infinite Scroll is designed for progressive enhancement, using existing pagination links. However, it is still possible work with JSON data. 

It means the _nextSelector_ href will be called via AJAX, expecting JSON data, which will be passed to the callback function. 

<pre>
$('.selector').infinitescroll({
  // other options
  dataType: 'json',
  appendCallback: false
}, function(json, opts) {
  // Get current page
  var page = opts.state.currPage; 
  // Do something with JSON data, create DOM elements, etc ..
});
</pre>