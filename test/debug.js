$(document).ready(function() {

	$('#debug-trigger').click(function(e) {
	
		e.preventDefault();
		$('#debug').toggleClass('open');
	
	});
	
	$('#debug-nav').find('a').click(function(e) {
	
		e.preventDefault();
		
		var $self = $(this),
			action = $self.attr('rel'),
			arg = $self.attr('data-arg'),
			arg = (!!arg) ? arg : null,
			fn = '$.fn.infinitescroll._'+action,
			validFn = (eval(fn));

		(validFn===undefined) ? $.fn.infinitescroll._cthullu('the-apocalypse') : eval(fn)(arg);
	
	});
	
});