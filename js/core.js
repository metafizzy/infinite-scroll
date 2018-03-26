// core
( function( window, factory ) {
  // universal module definition
  /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'ev-emitter/ev-emitter',
      'fizzy-ui-utils/utils',
    ], function( EvEmitter, utils) {
      return factory( window, EvEmitter, utils );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('ev-emitter'),
      require('fizzy-ui-utils')
    );
  } else {
    // browser global
    window.InfiniteScroll = factory(
      window,
      window.EvEmitter,
      window.fizzyUIUtils
    );
  }

}( window, function factory( window, EvEmitter, utils ) {

var jQuery = window.jQuery;
// internal store of all InfiniteScroll intances
var instances = {};

function InfiniteScroll( element, options ) {
  var queryElem = utils.getQueryElement( element );

  if ( !queryElem ) {
    console.error( 'Bad element for InfiniteScroll: ' + ( queryElem || element ) );
    return;
  }
  element = queryElem;
  // do not initialize twice on same element
  if ( element.infiniteScrollGUID ) {
    var instance = instances[ element.infiniteScrollGUID ];
    instance.option( options );
    return instance;
  }

  this.element = element;
  // options
  this.options = utils.extend( {}, InfiniteScroll.defaults );
  this.option( options );
  // add jQuery
  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }

  this.create();
}

// defaults
InfiniteScroll.defaults = {
  // path: null,
  // hideNav: null,
  // debug: false,
};

// create & destroy methods
InfiniteScroll.create = {};
InfiniteScroll.destroy = {};

var proto = InfiniteScroll.prototype;
// inherit EvEmitter
utils.extend( proto, EvEmitter.prototype );

// --------------------------  -------------------------- //

// globally unique identifiers
var GUID = 0;

proto.create = function() {
  // create core
  // add id for InfiniteScroll.data
  var id = this.guid = ++GUID;
  this.element.infiniteScrollGUID = id; // expando
  instances[ id ] = this; // associate via id
  // properties
  this.pageIndex = 1; // default to first page
  this.loadCount = 0;
  this.updateGetPath();
  // bail if getPath not set, or returns falsey #776
  var hasPath = this.getPath && this.getPath();
  if ( !hasPath ) {
    console.error('Disabling InfiniteScroll');
    return;
  }
  this.updateGetAbsolutePath();
  this.log( 'initialized', [ this.element.className ] );
  this.callOnInit();
  // create features
  for ( var method in InfiniteScroll.create ) {
    InfiniteScroll.create[ method ].call( this );
  }
};

proto.option = function( opts ) {
  utils.extend( this.options, opts );
};

// call onInit option, used for binding events on init
proto.callOnInit = function() {
  var onInit = this.options.onInit;
  if ( onInit ) {
    onInit.call( this, this );
  }
};

// ----- events ----- //

proto.dispatchEvent = function( type, event, args ) {
  this.log( type, args );
  var emitArgs = event ? [ event ].concat( args ) : args;
  this.emitEvent( type, emitArgs );
  // trigger jQuery event
  if ( !jQuery || !this.$element ) {
    return;
  }
  // namespace jQuery event
  type += '.infiniteScroll';
  var $event = type;
  if ( event ) {
    // create jQuery event
    var jQEvent = jQuery.Event( event );
    jQEvent.type = type;
    $event = jQEvent;
  }
  this.$element.trigger( $event, args );
};

var loggers = {
  initialized: function( className ) {
    return 'on ' + className;
  },
  request: function( path ) {
    return 'URL: ' + path;
  },
  load: function( response, path ) {
    return ( response.title || '' ) + '. URL: ' + path;
  },
  error: function( error, path ) {
    return error + '. URL: ' + path;
  },
  append: function( response, path, items ) {
    return items.length + ' items. URL: ' + path;
  },
  last: function( response, path ) {
    return 'URL: ' + path;
  },
  history: function( title, path ) {
    return 'URL: ' + path;
  },
  pageIndex: function( index, origin ) {
    return 'current page determined to be: ' + index + ' from ' + origin;
  },
};

// log events
proto.log = function( type, args ) {
  if ( !this.options.debug ) {
    return;
  }
  var message = '[InfiniteScroll] ' + type;
  var logger = loggers[ type ];
  if ( logger ) {
    message += '. ' + logger.apply( this, args );
  }
  console.log( message );
};

// -------------------------- methods used amoung features -------------------------- //

proto.updateMeasurements = function() {
  this.windowHeight = window.innerHeight;
  var rect = this.element.getBoundingClientRect();
  this.top = rect.top + window.pageYOffset;
};

proto.updateScroller = function() {
  var elementScroll = this.options.elementScroll;
  if ( !elementScroll ) {
    // default, use window
    this.scroller = window;
    return;
  }
  // if true, set to element, otherwise use option
  this.scroller = elementScroll === true ? this.element :
    utils.getQueryElement( elementScroll );
  if ( !this.scroller ) {
    throw 'Unable to find elementScroll: ' + elementScroll;
  }
};

// -------------------------- page path -------------------------- //

proto.updateGetPath = function() {
  var optPath = this.options.path;
  if ( !optPath ) {
    console.error( 'InfiniteScroll path option required. Set as: ' + optPath );
    return;
  }
  // function
  var type = typeof optPath;
  if ( type == 'function' ) {
    this.getPath = optPath;
    return;
  }
  // template string: '/pages/{{#}}.html'
  var templateMatch = type == 'string' && optPath.match('{{#}}');
  if ( templateMatch ) {
    this.updateGetPathTemplate( optPath );
    return;
  }
  // selector: '.next-page-selector'
  this.updateGetPathSelector( optPath );
};

proto.updateGetPathTemplate = function( optPath ) {
  // set getPath with template string
  this.getPath = function() {
    var nextIndex = this.pageIndex + 1;
    return optPath.replace( '{{#}}', nextIndex );
  }.bind( this );
  // get pageIndex from location
  // convert path option into regex to look for pattern in location
  var regexString = optPath.replace( '{{#}}', '(\\d\\d?\\d?)' );
  var templateRe = new RegExp( regexString );
  var match = location.href.match( templateRe );
  if ( match ) {
    this.pageIndex = parseInt( match[1], 10 );
    this.log( 'pageIndex', this.pageIndex, 'template string' );
  }
};

var pathRegexes = [
  // WordPress & Tumblr - example.com/page/2
  // Jekyll - example.com/page2
  /^(.*?\/?page\/?)(\d\d?\d?)(.*?$)/,
  // Drupal - example.com/?page=1
  /^(.*?\/?\?page=)(\d\d?\d?)(.*?$)/,
  // catch all, last occurence of a number
  /(.*?)(\d\d?\d?)(?!.*\d)(.*?$)/,
];

proto.updateGetPathSelector = function( optPath ) {
  // parse href of link: '.next-page-link'
  var hrefElem = document.querySelector( optPath );
  if ( !hrefElem ) {
    console.error( 'Bad InfiniteScroll path option. Next link not found: ' +
      optPath );
    return;
  }
  var href = hrefElem.getAttribute('href');
  // try matching href to pathRegexes patterns
  var pathParts, regex;
  for ( var i=0; href && i < pathRegexes.length; i++ ) {
    regex = pathRegexes[i];
    var match = href.match( regex );
    if ( match ) {
      pathParts = match.slice(1); // remove first part
      break;
    }
  }
  if ( !pathParts ) {
    console.error( 'InfiniteScroll unable to parse next link href: ' + href );
    return;
  }
  this.isPathSelector = true; // flag for checkLastPage()
  this.getPath = function() {
    var nextIndex = this.pageIndex + 1;
    return pathParts[0] + nextIndex + pathParts[2];
  }.bind( this );
  // get pageIndex from href
  this.pageIndex = parseInt( pathParts[1], 10 ) - 1;
  this.log( 'pageIndex', [ this.pageIndex, 'next link' ] );
};

proto.updateGetAbsolutePath = function() {
  var path = this.getPath();
  // path doesn't start with http or /
  var isAbsolute = path.match( /^http/ ) || path.match( /^\// );
  if ( isAbsolute ) {
    this.getAbsolutePath = this.getPath;
    return;
  }

  var pathname = location.pathname;
  // /foo/bar/index.html => /foo/bar
  var directory = pathname.substring( 0, pathname.lastIndexOf('/') );

  this.getAbsolutePath = function() {
    return directory + '/' + this.getPath();
  };
};

// -------------------------- nav -------------------------- //

// hide navigation
InfiniteScroll.create.hideNav = function() {
  var nav = utils.getQueryElement( this.options.hideNav );
  if ( !nav ) {
    return;
  }
  nav.style.display = 'none';
  this.nav = nav;
};

InfiniteScroll.destroy.hideNav = function() {
  if ( this.nav ) {
    this.nav.style.display = '';
  }
};

// -------------------------- destroy -------------------------- //

proto.destroy = function() {
  this.allOff(); // remove all event listeners
  // call destroy methods
  for ( var method in InfiniteScroll.destroy ) {
    InfiniteScroll.destroy[ method ].call( this );
  }

  delete this.element.infiniteScrollGUID;
  delete instances[ this.guid ];
};

// -------------------------- utilities -------------------------- //

// https://remysharp.com/2010/07/21/throttling-function-calls
InfiniteScroll.throttle = function( fn, threshold ) {
  threshold = threshold || 200;
  var last, timeout;

  return function() {
    var now = +new Date();
    var args = arguments;
    var trigger = function() {
      last = now;
      fn.apply( this, args );
    }.bind( this );
    if ( last && now < last + threshold ) {
      // hold on to it
      clearTimeout( timeout );
      timeout = setTimeout( trigger, threshold );
    } else {
      trigger();
    }
  };
};

InfiniteScroll.data = function( elem ) {
  elem = utils.getQueryElement( elem );
  var id = elem && elem.infiniteScrollGUID;
  return id && instances[ id ];
};

// set internal jQuery, for Webpack + jQuery v3
InfiniteScroll.setJQuery = function( $ ) {
  jQuery = $;
};

// -------------------------- setup -------------------------- //

utils.htmlInit( InfiniteScroll, 'infinite-scroll' );

if ( jQuery && jQuery.bridget ) {
  jQuery.bridget( 'infiniteScroll', InfiniteScroll );
}

// --------------------------  -------------------------- //

return InfiniteScroll;

}));
