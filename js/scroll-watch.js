// scroll-watch
( function( window, factory ) {
  // universal module definition
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        window,
        require('./core'),
        require('fizzy-ui-utils'),
    );
  } else {
    // browser global
    factory(
        window,
        window.InfiniteScroll,
        window.fizzyUIUtils,
    );
  }

}( window, function factory( window, InfiniteScroll, utils ) {

let proto = InfiniteScroll.prototype;

// default options
InfiniteScroll.defaults.scrollThreshold = 400;
// InfiniteScroll.defaults.elementScroll = null;

InfiniteScroll.create.scrollWatch = function() {
  // events
  this.pageScrollHandler = this.onPageScroll.bind( this );
  this.resizeHandler = this.onResize.bind( this );

  let scrollThreshold = this.options.scrollThreshold;
  let isEnable = scrollThreshold || scrollThreshold === 0;
  if ( isEnable ) {
    this.enableScrollWatch();
  }
};

InfiniteScroll.destroy.scrollWatch = function() {
  this.disableScrollWatch();
};

proto.enableScrollWatch = function() {
  if ( this.isScrollWatching ) {
    return;
  }
  this.isScrollWatching = true;
  this.updateMeasurements();
  this.updateScroller();
  // TODO disable after error?
  this.on( 'last', this.disableScrollWatch );
  this.bindScrollWatchEvents( true );
};

proto.disableScrollWatch = function() {
  if ( !this.isScrollWatching ) {
    return;
  }
  this.bindScrollWatchEvents( false );
  delete this.isScrollWatching;
};

proto.bindScrollWatchEvents = function( isBind ) {
  let addRemove = isBind ? 'addEventListener' : 'removeEventListener';
  this.scroller[ addRemove ]( 'scroll', this.pageScrollHandler );
  window[ addRemove ]( 'resize', this.resizeHandler );
};

proto.onPageScroll = InfiniteScroll.throttle( function() {
  let distance = this.getBottomDistance();
  if ( distance <= this.options.scrollThreshold ) {
    this.dispatchEvent('scrollThreshold');
  }
} );

proto.getBottomDistance = function() {
  if ( this.options.elementScroll ) {
    return this.getElementBottomDistance();
  } else {
    return this.getWindowBottomDistance();
  }
};

proto.getWindowBottomDistance = function() {
  let bottom = this.top + this.element.clientHeight;
  let scrollY = window.pageYOffset + this.windowHeight;
  return bottom - scrollY;
};

proto.getElementBottomDistance = function() {
  let bottom = this.scroller.scrollHeight;
  let scrollY = this.scroller.scrollTop + this.scroller.clientHeight;
  return bottom - scrollY;
};

proto.onResize = function() {
  this.updateMeasurements();
};

utils.debounceMethod( InfiniteScroll, 'onResize', 150 );

// --------------------------  -------------------------- //

return InfiniteScroll;

} ) );
