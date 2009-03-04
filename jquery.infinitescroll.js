

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
 
;(function($){
    
  $.fn.infinitescroll = function(options,callback){
    
    function debug(q,w,e,r){
      if (!opts.debug) return; // quit if we shouldnt be outputting.
      try { if (typeof console != 'undefined') console.log.apply(console,arguments); } 
      catch(e){ if (typeof console != 'undefined')  console.log(q,w,e,r); }
    }
    
    var opts    = $.extend({}, $.fn.infinitescroll.defaults, options);
    var props   = $.fn.infinitescroll; // shorthand
    callback    = callback || function(){};
    
    if (!areSelectorsValid(opts)){ return false;  }
    
    // get the relative URL - everything past the domain name.
    var relurl        = /(.*?\/\/).*?(\/.*)/;
    var path          = $(opts.nextSelector).attr('href');
    
    if (!path) { debug('Navigation selector not found'); return; }
    
        // set the path to be a relative URL from root.
        path          = path.match(relurl) ? path.match(relurl)[2] : path; 

    // contentSelector is just the element you're calling the infinitescroll() method on.
    opts.contentSelector = opts.contentSelector || this; 
    
    $.fn.infinitescroll.loadingMsg = $('<div id="infscr-loading" style="text-align: center;"><img style="float:none;" alt="Loading..." src="'+opts.loadingImg+'" /><br /><span>'+opts.loadingText+'</span></div>');
    
    //distance from nav links to bottom of page
    props.scrollDelta = $.fn.infinitescroll.scrollDelta  = $(document).height() - $(opts.navSelector).offset().top; 

    
    (new Image()).src    = opts.loadingImg; // preload the image.
  		      
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
    
    $(document).ajaxError(function(e,xhr,opt){
      debug('Page not found. Self-destructing...');    
      if (xhr.status == 404){ props.isDone = true; } // die if we're out of pages.
    });
      
    $(window).scroll( function(){ infscrSetup(path,opts,props,callback); } ); // hook up the function to the window scroll event.
    infscrSetup(path,opts,props,callback); // check short pages to see if they should go
    
    return this;
  
  }  
  
  // verify selectors are good
  function areSelectorsValid(opts){
    for (var key in opts){
      
      // grab each selector option and see if any fail.
      if (key.indexOf && key.indexOf('Selector') > 0 && jQis(opts[key]).length === 0){
          debug('Your ' + key + ' found no elements.');    
          return false;
      } 
      return true;
    }
  }
    
  function isNearBottom(opts,props){
      return (  $(document).height() - $(document).scrollTop() - $(window).height()  <  props.scrollDelta);    
  }
  
  function infscrSetup(path,opts,props,callback){
  
      if (props.isDuringAjax || props.isInvalidPage || props.isDone) return; 
  
     	// the math is: docheight - distancetotopofwindow - height of window < docheight - distance of nav element to the top. [go algebra!]
  		if ( isNearBottom(opts,props) ){ 
  		
  		  
  			props.isDuringAjax = true; // we dont want to fire the ajax multiple times
  			props.loadingMsg.appendTo( opts.contentSelector ).show();
  			$( opts.navSelector ).hide(); // take out the previous/next links
  			props.currPage++;
  			
  			// if we're dealing with a table we can't use DIVs
  			var box = $(opts.contentSelector).is('table') ? $('<tbody/>') : $('<div/>');  
  			
  			box
  			  .attr('id','infscr-page-'+props.currPage)
  			  .attr('class','infscr-pages')
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
                      
                      props.currDOMChunk = $('#infscr-page-'+props.currPage)[0]; // convenience for callback. ACTUAL DOM, not jQ obj.
                      callback.call(props.currDOMChunk);
                      
      		            if (!opts.animate) props.isDuringAjax = false; // once the call is done, we can allow it again.
  		            }
  			    });
  			
  		}   
  }
  
  $.extend($.fn.infinitescroll,{      // more configuration set in init()
        defaults           : {
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
                          animate         : false
                        }, 
        currPage      : 1,
        currDOMChunk  : null,  // defined in setup()'s load()
        isDuringAjax  : false,
        isInvalidPage : false,
        isDone        : false  // for when it goes all the way through the archive.
  });
  


})(jQuery);
