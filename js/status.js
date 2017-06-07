// status
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

var proto = InfiniteScroll.prototype;

// InfiniteScroll.defaults.status = null;

InfiniteScroll.create.status = function() {
  var statusElem = utils.getQueryElement( this.options.status );
  if ( !statusElem ) {
    return;
  }
  // elements
  this.statusElement = statusElem;
  this.statusEventElements = {
    request: statusElem.querySelector('.infinite-scroll-request'),
    error: statusElem.querySelector('.infinite-scroll-error'),
    last: statusElem.querySelector('.infinite-scroll-last'),
  };
  // events
  this.on( 'request', this.showRequestStatus );
  this.on( 'error', this.showErrorStatus );
  this.on( 'last', this.showLastStatus );
  var hideEvent = this.options.append ? 'append' : 'load';
  this.on( hideEvent, this.hideAllStatus );
};

proto.showRequestStatus = function() {
  this.showStatus('request');
};

proto.showErrorStatus = function() {
  this.showStatus('error');
};

proto.showLastStatus = function() {
  this.showStatus('last');
};

proto.showStatus = function( eventName ) {
  show( this.statusElement );
  this.hideStatusEventElements();
  var eventElem = this.statusEventElements[ eventName ];
  show( eventElem );
};

proto.hideAllStatus = function() {
  hide( this.statusElement );
  this.hideStatusEventElements();
};

proto.hideStatusEventElements = function() {
  for ( var type in this.statusEventElements ) {
    var eventElem = this.statusEventElements[ type ];
    hide( eventElem );
  }
};

// --------------------------  -------------------------- //

function hide( elem ) {
  setDisplay( elem, 'none' );
}

function show( elem ) {
  setDisplay( elem, 'block' );
}

function setDisplay( elem, value ) {
  if ( elem ) {
    elem.style.display = value;
  }
}

// --------------------------  -------------------------- //

return InfiniteScroll;

}));
