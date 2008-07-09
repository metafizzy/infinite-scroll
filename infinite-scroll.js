

// WP-Infinite-Scroll plugin
// copyright Paul Irish & dirkhaim
// license: cc-wrapped GPL : http://creativecommons.org/licenses/GPL/2.0/

var jQis = jQuery.noConflict(); // held separately to avoid collisions
 
var INFSCR = {      // more configuration set in init()
      cfg           : INFSCR_cfg, // defined in the php
      currPage    : 1,
      isDuringAjax  : false,
      isInvalidPage : false,
      isDone        : false  // for when it goes all the way through the archive.
};

INFSCR.isNearBottom = function(){
    return (  jQis(document).height() - jQis(document).scrollTop() - jQis(window).height()  <  INFSCR.scrollDelta);    
}

INFSCR.setup = function(){

    if (INFSCR.isDuringAjax || INFSCR.isInvalidPage || INFSCR.isDone) return; 

   	// the math is: docheight - distancetotopofwindow - height of window < docheight - distance of nav element to the top. [go algebra!]
		if (  INFSCR.isNearBottom() ){ 
		
			INFSCR.isDuringAjax = true; // we dont want to fire the ajax multiple times
			INFSCR.loadingMsg.appendTo( INFSCR.cfg.contentSelector ).show();
			jQis( INFSCR.cfg.navSelector ).hide(); // take out the previous/next links
			INFSCR.currPage++;
			
			jQis('<div/>')
			  .attr('id','infscr-page-'+INFSCR.currPage)
			  .attr('class','infscr-pages')
			  .appendTo( INFSCR.cfg.contentSelector )
			  .load( INFSCR.path.join( INFSCR.currPage ) + ' ' + INFSCR.cfg.postSelector,null,function(){
			        if (INFSCR.isDone){ // if we've hit the last page...
    			        INFSCR.loadingMsg.find('img').hide().parent().find('span').html(INFSCR.cfg.donetext).animate({opacity: 1},2000).fadeOut('normal');
		            } else {
    		            INFSCR.loadingMsg.fadeOut('normal' ); // currently makes the <em>'d text ugly in IE6
                        INFSCR.isDuringAjax = false; // once the call is done, we can allow it again.
                        INFSCR.cfg.jsCalls();
		            }
			    });
			
		}   
};

(INFSCR.init = function(){
  
  delete INFSCR_cfg; // remove the global
  
  INFSCR.path          = jQis(INFSCR.cfg.nextSelector).attr('href').match(/(.*?\/\/).*?(\/.*)/)[2]; // gets the relative URL - everything past the domain name.
  INFSCR.loadingMsg    = jQis('<div id="infscr-loading" style="text-align: center;"><img style="float:none;" alt="Loading..." src="'+INFSCR.cfg.loadingImg+'" /><br /><span>'+INFSCR.cfg.text+'</span></div>');
  INFSCR.scrollDelta   = jQis(document).height() - jQis(INFSCR.cfg.navSelector).offset().top; //distance from nav links to bottom of page
  (new Image()).src    = INFSCR.cfg.loadingImg; // preload the image.
		      
  if (INFSCR.path.split('2').length == 2){ // there is a 2 in the next url, e.g. /page/2/
    INFSCR.path = INFSCR.path.split('2');
  }
  else {
    if (INFSCR.isAdmin){
        alert('Sorry, we couldn\'t parse your Previous Posts URL. Verify your Previous Posts css selector points to the A tag. If you still get this error: yell, scream, and kindly ask for help.');    
    }
    INFSCR.isInvalidPage = true;  //prevent it from running on this page.
  }
  
  jQis(document).ajaxError(function(e,xhr,opt){
    if (xhr.status == 404){ INFSCR.isDone = true; } // die if we're out of pages.
  });
    
  jQis(window).scroll( INFSCR.setup ); // hook up the function to the window scroll event.

  $(INFSCR.setup); // check short pages to see if they should go
  

})();
