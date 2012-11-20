describe("InfiniteScrollHistory", function() {
  
  beforeEach(function() {
    loadFixtures('nav_fixture.html');
  });
  
  it("should load my fixtures", function() {
    expect($('#nav')).toExist();
  });
  
  it("should hide the nav links on scroll", function() {
    $('#results').infinitescroll({
        debug : false,
        navSelector  : "div#nav",            
        nextSelector : "div#nav a:first-of-type",    
        itemSelector : "div#results span"          
    });
  
    $('#results').infinitescroll('scroll');
    
    expect($('#nav')).toBeHidden();
  });

  it("should update the url when scrolling past first page-break", function() {
    $('#results').infinitescroll({
        debug : false,
        navSelector  : "div#nav",            
        nextSelector : "div#nav a:first-of-type",    
        itemSelector : "div#results span"          
    });
    
    spyOn($.fn, 'scrollTop').andReturn(300);
    spyOn(window.history, 'replaceState');
    
    $('#results').infinitescroll('scroll');
    
    expect(window.history.replaceState).toHaveBeenCalledWith(null,null,'/page/2');
  });
  
  it("should update the url when scrolling back up a previous page-break", function() {
    $('#results').infinitescroll({
        debug : false,
        navSelector  : "div#nav",            
        nextSelector : "div#nav a:first-of-type",    
        itemSelector : "div#results span",
        state        : {
                            currentViewPage: 2
                       }
    });
    
    spyOn($.fn, 'scrollTop').andReturn(100);
    spyOn(window.history, 'replaceState');
    
    $('#results').infinitescroll('scroll');
    
    expect(window.history.replaceState).toHaveBeenCalledWith(null,null,'/page/1');
  });
});
