if (! jQis) var jQis = jQuery.noConflict();


var config = {
  
  postcount : 10, // TODO: use get_option('posts_per_page') 
  postselector : null,
  containerselector : null,
  nextlink : null,
  navigation : null,
  
  init : function(){
    
    console.log('.');console.log('.');console.log('.');console.log('.');console.log('.');
    
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
        if (config.postselector != null) console.log('We found more than one possible post selector. Problem!');
        config.postselector = '.'+classx;
        console.log('post selector is: ' +config.postselector);
        console.log(jQis(config.postselector));
      }
    }
    console.timeEnd('posts');
    
    //CONTAINER SELECTOR
    config.containerselector = jQis(config.postselector).parent().get(0);
    console.log('container selector is...');
    console.log(config.containerselector);

    console.time('previous posts');
    
    
    //PREVIOUS POSTS 
    config.nextlink = jQis('div[class~=pag],div[class~=nav],div[id~=pag],div[id~=nav]')
      .find('a:contains("Older"),a:contains("Previous"),a:contains("Next"),a:contains("older"),a:contains("previous"),a:contains("next")');
    if (! config.nextlink.length) // not found with above..
      config.nextlink = jQis('a:contains("Older"),a:contains("Previous"),a:contains("Next"),a:contains("older"),a:contains("previous"),a:contains("next")'); // TODO: prompt user to pick.
    if (! config.nextlink.length) // backup!! extra languages
    config.nextlink = jQis('a:contains("anti")'); 
    
    console.log('prev posts is this guy...');
    console.log(config.nextlink.get(0));
    
    console.timeEnd('previous posts');
    
    
    
    //NAV LINKS SELECTOR
    
    //check the obvious
    config.navigation = jQis('div[class~=pagingation],div[class~=navigation],div[id~=pagingation],div[id~=navigation]');
    if (! config.nextlink.length){ // not found with above..

      // if parent parent is same as post container, its only the parent    
      if (config.nextlink.parent().parent().get(0) == config.containerselector){
        config.navigation = config.nextlink.parent().get(0);
      }
      else if ( ){
        // what if there isnt a parent?? just an A hanging out...
      }
      else if ( ){
        // if there is no next link and NO navlinks.. then.. GUESS and ignore the hiding?
      }
    }
    console.log(config.nextlink.parent().get(0));
    console.log(config.nextlink.parent().parent().get(0));  // but not if == content container
    
  
  }, // end of init()


  discoverselector : function(el){
    // does el have an id?
    
    // go up the chain of el's parents and grab the first one with an ID
        // won't work
        
    
  }
}

config.init();