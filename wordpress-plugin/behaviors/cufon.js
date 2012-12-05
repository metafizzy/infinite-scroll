/*
	--------------------------------
	Infinite Scroll Behavior
	Cufon Refresh
	--------------------------------
	+ https://github.com/paulirish/infinitescroll/
	+ version 2.0b2.110617
	+ Copyright 2011 Paul Irish & Luke Shumard
	+ Licensed under the MIT license
	
	+ Documentation: http://infinite-scroll.com/
	
*/
(function ($, undefined) {
	$.extend($.infinitescroll.prototype,{
		_callback_cufon: function infscr_callback_cufon(newElements) {
			Cufon.refresh(newElements);
		}
	});
})(jQuery);
