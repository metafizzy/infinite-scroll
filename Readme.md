Unfortunately this project is **no longer maintained**. 

It's had strong contributors over the years but it's time to clearly set expectations.  We are unlikely to ship a new version, add features or fix bugs.

IMO, the only way forward with this project is a 100% rewrite with a new API. If you're interested in owning that, please get in touch. ~ @paulirish, april 2015

PS. Thank you very much to all the [contributors](https://github.com/infinite-scroll/infinite-scroll/graphs/contributors) over the years. It's been a fun time helping the internet scroll their way to more good stuff. :)

<hr>

# Infinite Scroll

<http://www.infinite-scroll.com/>

The jQuery and WordPress Plugins:

* jQuery Plugin <http://www.infinite-scroll.com/infinite-scroll-jquery-plugin/> `v2.0.2`
* WordPress Plugin <http://www.infinite-scroll.com/installation/>


##Methods##
A method is a command you can use to control Infinite Scroll once the plugin has been initialized. You can call on any Infinite Scroll method by using `$('.selector').infinitescroll('method-name');`.

**Bind**  
`$('.selector').infinitescroll('bind');`  
Binds selector to check on scroll to see if the plugin needs to load more content.

**Unbind**  
`$('.selector').infinitescroll('unbind');`  
Unbinds selector to check on scroll to see if the plugin needs to load more content.

**Destroy**  
`$('.selector').infinitescroll('destroy');`  
Destroys the instance of infinite scroll. This is create a flag to not load anymore content and will unbind all events.

**Pause**  
`$('.selector').infinitescroll('pause');`  
Pausing the plugin will temporarily create a flag to not retrieve content on scroll. To unpause, use the method `resume`.

**Resume**  
`$('.selector').infinitescroll('resume');`  
Destroys the instance of infinite scroll. This is create a flag to not load anymore content and will unbind all events.

**Toggle**  
`$('.selector').infinitescroll('toggle');`  
Toggling will switch the `pause` value of the plugin, either pausing or resuming the plugin.

**Retrieve**  
`$('.selector').infinitescroll('retrieve');`  
Retrieve will load the next page of content if available.

**Scroll**  
`$('.selector').infinitescroll('scroll');`  
Scroll will check to see if the next page is to be loaded, the same thing as if a user scrolled.

**Update**  
`$('.selector').infinitescroll('update', {debug: true});`  
The `update` method is used to update options in the instance of Infinite Scroll after initialization. The second argument is the object of options that you want to update.


##Options##
Better documentation coming soon.

```javascript
$('.selector').infinitescroll({
  loading: {
    finished: undefined,
    finishedMsg: "<em>Congratulations, you've reached the end of the internet.</em>",
                img: null,
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
  behavior: undefined,
  binder: $(window), // used to cache the selector for the element that will be scrolling
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
  path: undefined, // Can either be an array of URL parts (e.g. ["/page/", "/"]) or a function that accepts the page number and returns a URL
  maxPage:undefined // to manually control maximum page (when maxPage is undefined, maximum page limitation is not work)
});
```


### Examples

### Scrolling inside an element

To scroll inside an element having `overflow`, use the `local` behavior.

```javascript
$('.selector').infinitescroll({
  behavior: 'local',
  binder: $('.selector'), // scroll on this element rather than on the window
  // other options
});
```

### Loading JSON data

As explained on the website, Infinite Scroll is designed for progressive enhancement, using existing pagination links. However, it is still possible to work with JSON data.

It means the `nextSelector` href will be called via AJAX, expecting JSON data, which will be passed to the callback function.

```javascript
$('.selector').infinitescroll({
  // other options
  dataType: 'json',
  appendCallback: false
}, function(json, opts) {
  // Get current page
  var page = opts.state.currPage;
  // Do something with JSON data, create DOM elements, etc ..
});
```

## License

The MIT License (MIT)

Copyright (c) 2014 Paul Irish

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
