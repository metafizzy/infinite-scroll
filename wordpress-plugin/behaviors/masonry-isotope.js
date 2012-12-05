/*
	--------------------------------
	Infinite Scroll Behavior
	Masonry Integration
	--------------------------------
	+ https://github.com/paulirish/infinitescroll/
	+ version 2.0b2.110617
	+ Copyright 2011 Paul Irish & Luke Shumard
	+ Licensed under the MIT license
	
	+ Documentation: http://infinite-scroll.com/
	
*/

(function($, undefined) {
	$.extend($.infinitescroll.prototype,{
		_callback_masonry: function infscr_callback_masonry (newElements) {
			$(this).masonry('appended',$(newElements));
		}
	});
})(jQuery);
