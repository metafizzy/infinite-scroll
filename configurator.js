if (! jQis) var jQis = jQuery.noConflict();


var config = {
  
  postcount : 10, // TODO: read the database value for how many posts appear on a page
  postselector : null,
  containerselector : null,
  nextlink : null,
  navigation : null,
  
  init : function(){
    
    console.log('.');console.log('.');console.log('.');console.log('.');console.log('.');
    
    var classes = {};
    
    // POST SELECTOR
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
  
    //CONTAINER SELECTOR
    config.containerselector = jQis(config.postselector).parent();
    console.log('container selector is...');
    console.log(config.containerselector);

    
    //PREVIOUS POSTS 
    config.nextlink = jQis('div[class~=pag],div[class~=nav]')
      .find('a:contains("Older"),a:contains("Previous"),a:contains("Next"),a:contains("older"),a:contains("previous"),a:contains("next")');
    if (! config.nextlink.length) // not found with above..
      config.nextlink = jQis('a:contains("Older"),a:contains("Previous"),a:contains("Next"),a:contains("older"),a:contains("previous"),a:contains("next")'); // TODO: prompt user to pick.
    if (! config.nextlink.length) // backup!! extra languages
    config.nextlink = jQis('a:contains("anti")'); 
    
    console.log('prev posts is this guy...');
    console.log(config.nextlink.get(0));
    
    //NAV LINKS SELECTOR
    console.log('nav links could be...');
    
    // special treatment for div.navigation !
    // what if there isnt a parent?? just an A hanging out...
    console.log(config.nextlink.parent().get(0));
    console.log(config.nextlink.parent().parent().get(0));  // but not if == content container
    
    
  
  } // end of init()

}

config.init();