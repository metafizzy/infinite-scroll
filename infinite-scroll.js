


// Infinite Scroll jQuery plugin
// copyright Paul Irish
// http://www.infinite-scroll.com
// license: cc-wrapped GPL : http://creativecommons.org/licenses/GPL/2.0/

 
(function($){
    
  $.fn.infinitescroll = function(options){
    
    var opts    = $.extend({}, $.fn.infinitescroll.defaults, options);
    var props   = $.fn.infinitescroll; // shorthand
    
    // get the relative URL - everything past the domain name.
    var relurl        = /(.*?\/\/).*?(\/.*)/;
    var path          = $(opts.nextSelector).attr('href');
        path          = path.match(relurl) ? path.match(relurl)[2] : path; 

    $.fn.infinitescroll.loadingMsg = $('<div id="infscr-loading" style="text-align: center;"><img style="float:none;" alt="Loading..." src="'+opts.loadingImg+'" /><br /><span>'+opts.text+'</span></div>');
    
    //distance from nav links to bottom of page
    props.scrollDelta = $.fn.infinitescroll.scrollDelta  = $(document).height() - $(opts.navSelector).offset().top; 

    
    (new Image()).src    = opts.loadingImg; // preload the image.
  		      
    if (path.split('2').length == 2){ // there is a 2 in the next url, e.g. /page/2/
      path = path.split('2');
    }
    else {
      opts.debug && alert('Sorry, we couldn\'t parse your Previous Posts URL. Verify your Previous Posts css selector points to the A tag. If you still get this error: yell, scream, and kindly ask for help.');    
      props.isInvalidPage = true;  //prevent it from running on this page.
    }
    
    $(document).ajaxError(function(e,xhr,opt){
      if (xhr.status == 404){ props.isDone = true; } // die if we're out of pages.
    });
      
    $(window).scroll( function(){ infscrSetup(path,opts,props); } ); // hook up the function to the window scroll event.
    infscrSetup(path,opts,props); // check short pages to see if they should go
    
    return this;
  
  }  
    
  function isNearBottom(opts,props){
      return (  $(document).height() - $(document).scrollTop() - $(window).height()  <  props.scrollDelta);    
  }
  
  function infscrSetup(path,opts,props){
  
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
  			  .load( path.join( props.currPage ) + ' ' + opts.postSelector,null,function(){
  			    
  			        if (props.isDone){ // if we've hit the last page...
      			        props.loadingMsg
      			          .find('img').hide()
      			          .parent()
      			          .find('span').html(opts.donetext).animate({opacity: 1},2000).fadeOut('normal');
      			          
  		            } else {
      		            props.loadingMsg.fadeOut('normal' ); // currently makes the <em>'d text ugly in IE6
  
      		            if (opts.animate){
        		            var scrollTo = jQuery(window).scrollTop() + jQuery('#infscr-loading').height() + opts.extraScrollPx + 'px';
                        jQuery('html,body').animate({scrollTop: scrollTo}, 800,function(){ props.isDuringAjax = false; }); // smooth scroll to ease in the new content
      		            }
                      
                      props.currDOMChunk = $('#infscr-page-'+props.currPage)[0]; // convenience for jsCalls. ACTUAL DOM, not jQ obj.
                      opts.jsCalls.call(props.currDOMChunk);
                      
      		            if (!opts.animate) props.isDuringAjax = false; // once the call is done, we can allow it again.
  		            }
  			    });
  			
  		}   
  }
  
  $.extend($.fn.infinitescroll,{      // more configuration set in init()
        defaults           : {
                          debug           : false,
                          nextSelector    : "$next_selector",
                          loadingImg      : "http://www.infinite-scroll.com/loading.gif",
                          text            : "<em>Loading the next set of posts...</em>",
                          donetext        : "<em>Congratulations, you've reached the end of the internet.</em>",
                          navSelector     : "#navigation",
                          contentSelector : this,
                          extraScrollPx   : 150,
                          postSelector    : "div.post",
                          animate         : true,
                          jsCalls         : function(){ }
                        }, 
        currPage      : 1,
        currDOMChunk  : null,  // defined in setup()'s load()
        isDuringAjax  : false,
        isInvalidPage : false,
        isDone        : false  // for when it goes all the way through the archive.
  });
  


})(jQuery);
