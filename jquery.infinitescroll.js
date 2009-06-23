

// Infinite Scroll jQuery plugin
// copyright Paul Irish
// version 1.1.2008.09.25

// project home  : http://www.infinite-scroll.com
// documentation : http://www.infinite-scroll.com/infinite-scroll-jquery-plugin/

// dual license  : GPL : http://creativecommons.org/licenses/GPL/2.0/
//               : MIT : http://creativecommons.org/licenses/MIT/


// todo: add callback for the complete (404) state.
//       add preloading option.
//       fix with jorn's syntax improvements.
//       check .length of returned elements. if 0, treat as 404
 
;(function($){
    
  $.fn.infinitescroll = function(options,callback){
    
    function debug(){
     window.console && console.log.call(console,arguments)
    }
    
    var opts    = $.extend({}, $.infinitescroll.defaults, options);
    var props   = $.infinitescroll; // shorthand
    callback    = callback || function(){};
    
    if (!areSelectorsValid(opts)){ return false;  }
    
     // we doing this on an overflow:auto div?
    props.container   =  opts.scrollElem ? props.container : document.documentElement;
    // contentSelector we'll use for our .load()
    opts.contentSelector = opts.contentSelector || this; 
    
    
    // get the relative URL - everything past the domain name.
    var relurl        = /(.*?\/\/).*?(\/.*)/;
    var path          = $(opts.nextSelector).attr('href');
    
    
    if (!path) { debug('Navigation selector not found'); return; }
    
    // set the path to be a relative URL from root.
    path          = path.match(relurl) ? path.match(relurl)[2] : path; 

    // there is a 2 in the url surrounded by slashes, e.g. /page/2/
    if ( path.match(/^(.*?\/)2(\/|$)/) ){  
        path = path.match(/^(.*?\/)2(\/|$)/).slice(1);
    } else 
      // if there is any 2 in the url at all.
      if (path.match(/^(.*?)2(.*?$)/)){
        debug('Trying backup next selector parse technique. Treacherous waters here, matey.');
        path = path.match(/^(.*?)2(.*?$)/).slice(1);
    } else {
      debug('Sorry, we couldn\'t parse your Next (Previous Posts) URL. Verify your the css selector points to the correct A tag. If you still get this error: yell, scream, and kindly ask for help at infinite-scroll.com.');    
      props.isInvalidPage = true;  //prevent it from running on this page.
    }
    




    //distance from nav links to bottom
    props.pixelsFromNavToBottom =  opts.scrollElem ? $(props.container)[0].scrollHeight : $(props.container).height()  -
                                     $(props.container).offset().top - $(opts.navSelector).offset().top;
    
    // define loading msg
    props.loadingMsg = $('<div id="infscr-loading" style="text-align: center;"><img alt="Loading..." src="'+
                                  opts.loadingImg+'" /><div>'+opts.loadingText+'</div></div>');    
     // preload the image
    (new Image()).src    = opts.loadingImg;
  		      

  
    // set up our bindings
    $(document).ajaxError(function(e,xhr,opt){
      debug('Page not found. Self-destructing...');    
      if (xhr.status == 404){ props.isDone = true; } // die if we're out of pages.
    });
    
    // bind scroll handler to element (if its a local scroll) or window  
    $(opts.scrollElem ? this : window)
      .bind('scroll.infscr', function(){ infscrSetup(path,opts,props,callback); } )
      .trigger('scroll.infscr'); // trigger the event, in case it's a short page
    
    
    return this;
  
  }  
  
  // grab each selector option and see if any fail.
  function areSelectorsValid(opts){
    for (var key in opts){
      if (key.indexOf && key.indexOf('Selector') && $(opts[key]).length === 0){
          debug('Your ' + key + ' found no elements.');    
          return false;
      } 
      return true;
    }
  }
  
	// the math is: docheight - distancetotopofwindow - height of window < docheight - distance of nav element to the top. [go algebra!]  
  function isNearBottom(opts,props){
    
    
    var pixelsFromWindowBottomToNav = $(props.container).height() - 
                                      $(props.container).scrollTop() - 
                                      $(props.scrollElem ? props.container : window).height() - 
                                      opts.bufferPx;
    
    typeof console != 'undefined' && console.log('math:',pixelsFromWindowBottomToNav, props.pixelsFromNavToBottom);
    
    return (pixelsFromWindowBottomToNav < props.pixelsFromNavToBottom);    
  }
  
  function infscrSetup(path,opts,props,callback){
  
      if (props.isDuringAjax || props.isInvalidPage || props.isDone) return; 
  
  		if ( isNearBottom(opts,props) ){ 
  		  
  			props.isDuringAjax = true; // we dont want to fire the ajax multiple times
  			props.loadingMsg.appendTo( opts.contentSelector ).show();
  			$( opts.navSelector ).hide(); // take out the previous/next links
  			
  			// increment the URL bit. e.g. /page/3/
  			props.currPage++;
  			
  			typeof console != 'undefined' && console.log('heading into ajax',path);
  			
  			
  			
  			// if we're dealing with a table we can't use DIVs
  			var box = $(opts.contentSelector).is('table') ? $('<tbody/>') : $('<div/>');  
  			
  			box
  			  .attr('id','infscr-page-'+props.currPage)
  			  .addClass('infscr-pages')
  			  .appendTo( opts.contentSelector )
  			  .load( path.join( props.currPage ) + ' ' + opts.itemSelector,null,function(){
  			    
  			        if (props.isDone){ // if we've hit the last page...
  			        
      			        props.loadingMsg
      			          .find('img').hide()
      			          .parent()
      			          .find('span').html(opts.donetext).animate({opacity: 1},2000).fadeOut('normal');
      			          
  		            } else {
      		            props.loadingMsg.fadeOut('normal' ); // currently makes the <em>'d text ugly in IE6
  
      		            if (opts.animate){ // smooth scroll to ease in the new content
        		            var scrollTo = jQuery(window).scrollTop() + jQuery('#infscr-loading').height() + opts.extraScrollPx + 'px';
                        jQuery('html,body').animate({scrollTop: scrollTo}, 800,function(){ props.isDuringAjax = false; }); 
      		            }
                      
                      // pass in the new DOM element as context for the callback
                      callback.call( box[0] );
                      
      		            if (!opts.animate) props.isDuringAjax = false; // once the call is done, we can allow it again.
  		            }
  			    });
  			
  		}   
  }
  
  
  // options and read-only properties object
  
  $.infinitescroll = {     
        defaults      : {
                          debug           : false,
                          preload         : false,
                          nextSelector    : "div.navigation a:first",
                          loadingImg      : "http://www.infinite-scroll.com/loading.gif",
                          loadingText     : "<em>Loading the next set of posts...</em>",
                          donetext        : "<em>Congratulations, you've reached the end of the internet.</em>",
                          navSelector     : "div.navigation",
                          contentSelector : null,           // not really a selector. :) it's whatever the method was called on..
                          extraScrollPx   : 150,
                          itemSelector    : "div.post",
                          animate         : false,
                          scrollElem      : false,
                          bufferPx        : 40
                        }, 
        loadingImg    : undefined,
        loadingMsg    : undefined,
        container     : undefined,
        currPage      : 1,
        currDOMChunk  : null,  // defined in setup()'s load()
        isDuringAjax  : false,
        isInvalidPage : false,
        isDone        : false  // for when it goes all the way through the archive.
  };
  


})(jQuery);
