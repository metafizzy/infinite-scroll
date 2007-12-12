/*
WP-Infinite-Scroll configurator
by: Paul Irish
license: GPL

TODO:
 - Add some assertions:
    - Check that all css selectors resolve to ONE element
    - Check that the navigation element is "close" to the bottom
 - fix silent error if content & post selectors are incorrect
 - handle on frontend if there is no next link..
*/

if (! jQis) var jQis = jQuery.noConflict();

if (! console) { var logdiv = jQis('<div/>').prependTo('body'); }

function log (str){ 
  if (console && console.log) console.log(str); 
  else jQis('<div>'+str+'</div>').appendTo(logdiv);
}
function time (str,end){
  if (!console) return;
  
  if (end === false)
    console.timeEnd(str);
  else
    console.time(str);
}
    
var config = {
  
  postcount : 10, // TODO: use get_option('posts_per_page') 
  postselector : null,
  containerselector : null,
  nextlink : null,
  navigation : null,
  
  init : function(){
    
    var classes = {};
    
    // POST SELECTOR
    time('posts');
    jQis('div').each(function(){  // document all the classes in use.
      var eachclass = jQis(this).attr('class');
      if (!eachclass) return true;
      eachclass = eachclass.split(' ');
      for (var i = 0; i < eachclass.length; i++){ classes[eachclass[i]] = true; }  
    });
    for (classx in classes){  // if any of classes appear as many times as the database says, and are siblings, we got a post selector!
      if ( (jQis('div.'+classx).length == config.postcount) && (jQis('div.'+classx).siblings('div.'+classx).length == config.postcount) ){
        if (config.postselector != null) log('We found more than one possible post selector. First found was: ' + config.postselector);
        config.postselector = '.'+classx;
        log('Post selector is: ' +config.postselector);
        log(jQis(config.postselector));
        log(jQis(config.postselector).length);
      }
    }
    time('posts',false);
    
    //CONTAINER SELECTOR
    config.containerselector = jQis(config.postselector).parent().get(0);
    log('container is...');
    log(config.containerselector);

    time('previous posts');
    
    
    //PREVIOUS POSTS 
    config.nextlink = jQis('div[class~=pagingation],div[class~=navigation],div[id~=pagingation],div[id~=navigation]')
      .find('a:contains("Older"),a:contains("Previous"),a:contains("Next"),a:contains("older"),a:contains("previous"),a:contains("next")')
      .filter(':first');
    if (! config.nextlink.length) { // not found with above..
      config.nextlink = jQis('a:contains("Older"),a:contains("Previous"),a:contains("Next"),a:contains("older"),a:contains("previous"),a:contains("next")').filter(':first'); // TODO: prompt user to pick.
    }
    if (! config.nextlink.length){ // backup!! extra languages
      config.nextlink = jQis('a:contains("anti")'); 
    }
    time('previous posts',false);
    
    
    
    //NAV LINKS SELECTOR
    
    time('navlinks');
    
    config.navigation = jQis('div[class~=pagingation],div[class~=navigation],div[id~=pagingation],div[id~=navigation]');    //check the obvious
    if (! config.navigation.length){ // not found with above..

      if (config.nextlink.parent().parent().get(0) == config.containerselector){
        // if parent parent is same as post container, its only the parent    
        config.navigation = config.nextlink.parent();
      }
      else if (config.nextlink.parent().get(0) == config.containerselector ){
        // what if there isnt a parent?? just an A hanging out...
        config.navigation = config.nextlink; 
      }
      else {
        // if there is no next link and NO navlinks.. then.. GUESS and ignore the hiding?
        config.navigation = config.nextlink.parent(); 
      }

    }
    
    time('navlinks',false);
    
    log('nav links container:')
    log(config.navigation.get(0));


    log('prev posts is this guy...');
    log(config.nextlink.get(0));
    
  }, // end of init()


  discoverselector : function(el){
    // does el have an id?
    
    // go up the chain of el's parents and grab the first one with an ID
        // won't work
        
    
  }
}

config.init();