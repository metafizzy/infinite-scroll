if (! jQis) var jQis = jQuery.noConflict();
function log (str){ if (console && console.log) console.log(str); }

var config = {
  
  postcount : 10, // TODO: use get_option('posts_per_page') 
  postselector : null,
  containerselector : null,
  nextlink : null,
  navigation : null,
  
  init : function(){
    
    log('.');log('.');log('.');log('.');log('.');
    
    var classes = {};
    
    // POST SELECTOR
    console.time('posts');
    jQis('div').each(function(){  // document all the classes in use.
      var eachclass = jQis(this).attr('class');
      if (!eachclass) return true;
      eachclass = eachclass.split(' ');
      for (var i = 0; i < eachclass.length; i++){ classes[eachclass[i]] = true; }  
    });
    for (classx in classes){  // if any of classes appear as many times as the database says, and are siblings, we got a post selector!
      if ( (jQis('div.'+classx).length == 10) && (jQis('div.'+classx).siblings('div.'+classx).length == 10) ){
        if (config.postselector != null) log('We found more than one possible post selector. Problem!');
        config.postselector = '.'+classx;
        log('post selector is: ' +config.postselector);
        log(jQis(config.postselector));
      }
    }
    console.timeEnd('posts');
    
    //CONTAINER SELECTOR
    config.containerselector = jQis(config.postselector).parent().get(0);
    log('container is...');
    log(config.containerselector);

    console.time('previous posts');
    
    
    //PREVIOUS POSTS 
    config.nextlink = jQis('div[class~=pag],div[class~=nav],div[id~=pag],div[id~=nav]')
      .find('a:contains("Older"),a:contains("Previous"),a:contains("Next"),a:contains("older"),a:contains("previous"),a:contains("next")');
    if (! config.nextlink.length) // not found with above..
      config.nextlink = jQis('a:contains("Older"),a:contains("Previous"),a:contains("Next"),a:contains("older"),a:contains("previous"),a:contains("next")'); // TODO: prompt user to pick.
    if (! config.nextlink.length) // backup!! extra languages
    config.nextlink = jQis('a:contains("anti")'); 
    
    log('prev posts is this guy...');
    log(config.nextlink.get(0));
    
    console.timeEnd('previous posts');
    
    
    
    //NAV LINKS SELECTOR
    
    config.navigation = jQis('div[class~=pagingation],div[class~=navigation],div[id~=pagingation],div[id~=navigation]');    //check the obvious
    if (! config.navigation.length){ // not found with above..

      if (config.nextlink.parent().parent().get(0) == config.containerselector){
        // if parent parent is same as post container, its only the parent    
        config.navigation = config.nextlink.parent().get(0);
      }
      else if (config.nextlink.parent().get(0) == config.containerselector ){
        // what if there isnt a parent?? just an A hanging out...
        config.navigation = config.nextlink.get(0); 
      }
      else {
        // if there is no next link and NO navlinks.. then.. GUESS and ignore the hiding?
        config.navigation = '';
      }

    }
    log(config.nextlink);
  
  }, // end of init()


  discoverselector : function(el){
    // does el have an id?
    
    // go up the chain of el's parents and grab the first one with an ID
        // won't work
        
    
  }
}

config.init();