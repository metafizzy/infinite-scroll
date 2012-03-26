jQuery(document).ready(function( $) {

	//open upload dialog
	$('#upload_image_button').click(function() {
		formfield = $('#upload_image').attr('name');
	 	tb_show('', 'media-upload.php?type=image&infinite_scroll=true&TB_iframe=true');
	 	return false;
	});
	
	//close upload dialog CB
	//overrides native WP function
	window.send_to_editor = function(html) {
	 	$('#upload_image').val( html );
	 	tb_remove();
	}
		
	//list table hover
	$('#the-list td').hover( 
		function() { $(this).children('.edit-link').css('visibility', 'visible'); },
		function() { $(this).children('.edit-link').css('visibility', 'hidden'); }
	 );
	
	//list table edit link click
	$( '#the-list tr:not(".editing")' ).live( 'click', function(event) {
		event.preventDefault();
		
		$(this).addClass( 'editing' );
		$(this).find('.edit-link').hide();
		$(this).find('.save-link').show();
		$(this).css('height', '50px' );
		$(this).children('td:not(:first)').each( function() {
			$(this).html( '<input type="text" name="' + $(this).attr('class') + '" value="' + $(this).html() + '" />' );
		});
		var theme = $(this).children('.theme');
		$(theme).html( $(theme).html() + '<input type="hidden" name="theme_column-theme" value="' + $(theme).find('.theme-name').text() + '" />' );
		return false;
	});
	 
	//save-link
	$( '#the-list .save-link a' ).live( 'click', function(event){
		event.preventDefault();
	
		var loader = $(this).siblings( '.loader' );
		$(loader).show();
		
		$.ajax( {
			url: ajaxurl + '?action=infinite-scroll-edit-preset', 
			type: 'POST',
			data: $('#ajax-form').serialize(),
			success: function() {
				$(loader).hide();
				tr = $(loader).parent().parent().parent();
				$(tr).removeClass( 'editing' );
				$(tr).find('.edit-link').show();
				$(tr).find('.save-link').hide();		
				$(tr).css('height', 'auto' );
				$(tr).children('td:not(:first)').each( function() {
					$(this).html( $(this).children('input').val() );
				});		
			}
		});				
		return false;
	});
	
	//cancel button
	$( '#the-list .save-link a.cancel' ).live( 'click', function(event){
	
		event.preventDefault();
				
		tr = $(this).parent().parent().parent();
		$(tr).removeClass( 'editing' );
		$(tr).find('.edit-link').show();
		$(tr).find('.save-link').hide();		
		$(tr).css('height', 'auto' );
		$(tr).children('td:not(:first)').each( function() {
			$(this).html( $(this).children('input').val() );
		});

		return false;
	}); 
	
	//delete button
	$( '.delete' ).live( 'click', function( event ) {
		event.preventDefault();
		
		var theme = $(this).parent().siblings('strong').children('a').text();
		
		if ( !confirm( infinite_scroll.confirm.replace( '%s', theme ) ) )
			return false;
		
		var tr = $(this).parent().parent().parent();
		
		$.ajax( {
			url: ajaxurl + '?action=infinite-scroll-delete-preset&theme=' + theme, 
			type: 'POST',
			data: $('#ajax-form').serialize(), //serialize nonce
			success: function() {
				$(tr).children('td:not(:first)').each( function() {
					$(this).html( '' );
				});		
			}
		});	
		
		return false;
		
	});
	
	//reset to default image
	$('#use_default').click( function(event) {
		event.preventDefault();
		$('#infinite_scroll_form').append( '<input type="hidden" name="reset_default_image" value="1" />' ).submit();
		return false;
	});
	
	//hide submit button
	$('#hide-submit').click( function(event){
		event.preventDefault();
		$.ajax({
			url: ajaxurl + '?action=' + submit.action + '&' + submit.nonce + '=' + $('#'+submit.nonce).val(),
		    success: function() { $('tr#submit').fadeOut(); }
		});
		return false;
	});
	
	//submit textarea select
	$('textarea#submit').select();
		 
});
