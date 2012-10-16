describe("InfiniteScrollHistory", function() {
  
  beforeEach(function() {
    loadFixtures('nav_fixture.html');
    
    $('#results').infinitescroll({
        debug : true,
        navSelector  : "div#nav",            
        nextSelector : "div#nav a:first-of-type",    
        itemSelector : "div#results span"          
    });
  });
  
  it("should load my fixtures", function() {
    expect($('#nav')).toExist();
  });
  
  it("should hide the nav links on scroll", function() {
    $('#results').infinitescroll('scroll');
    
    expect($('#nav')).toBeHidden();
  });

  it("should update the url when scrolling past first page-break", function() {
    spyOn($.fn, 'scrollTop').andReturn(300);
    spyOn(window.history, 'replaceState');
    
    $('#results').infinitescroll('scroll');
    
    expect(window.history.replaceState).toHaveBeenCalledWith(null,null,'/page/2');
  });
});
