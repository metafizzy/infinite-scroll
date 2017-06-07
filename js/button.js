// button
( function( window, factory ) {
  // universal module definition
  /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      './core',
      'fizzy-ui-utils/utils',
    ], function( InfiniteScroll, utils ) {
      return factory( window, InfiniteScroll, utils );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('./core'),
      require('fizzy-ui-utils')
    );
  } else {
    // browser global
    factory(
      window,
      window.InfiniteScroll,
      window.fizzyUIUtils
    );
  }

}( window, function factory( window, InfiniteScroll, utils ) {

// InfiniteScroll.defaults.button = null;

InfiniteScroll.create.button = function() {
  var buttonElem = utils.getQueryElement( this.options.button );
  if ( buttonElem ) {
    this.button = new InfiniteScrollButton( buttonElem, this );
    return;
  }
};

InfiniteScroll.destroy.button = function() {
  if ( this.button ) {
    this.button.destory();
  }
};

// -------------------------- InfiniteScrollButton -------------------------- //

function InfiniteScrollButton( element, infScroll ) {
  this.element = element;
  this.infScroll = infScroll;
  // events
  this.clickHandler = this.onClick.bind( this );
  this.element.addEventListener( 'click', this.clickHandler );
  infScroll.on( 'request', this.disable.bind( this ) );
  infScroll.on( 'load', this.enable.bind( this ) );
  infScroll.on( 'error', this.hide.bind( this ) );
  infScroll.on( 'last', this.hide.bind( this ) );
}

InfiniteScrollButton.prototype.onClick = function( event ) {
  event.preventDefault();
  this.infScroll.loadNextPage();
};

InfiniteScrollButton.prototype.enable = function() {
  this.element.removeAttribute('disabled');
};

InfiniteScrollButton.prototype.disable = function() {
  this.element.disabled = 'disabled';
};

InfiniteScrollButton.prototype.hide = function() {
  this.element.style.display = 'none';
};

InfiniteScrollButton.prototype.destroy = function() {
  this.element.removeEventListener( this.clickHandler );
};

// --------------------------  -------------------------- //

InfiniteScroll.Button = InfiniteScrollButton;

return InfiniteScroll;

}));
