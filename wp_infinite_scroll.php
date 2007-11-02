<?php

/*
Plugin Name: WP-InfiniteScroll
Version: 0.1
Plugin URI: http://www.tinyways.com
Description: Infinite scroll using AJAX based on Javascript code by <a href="http://aurgasm.us">Paul Irish</a>. Wordpress plugin integration by <a href="http://www.tinyways.com">dirkhaim</a>.
Author: dirkhaim & Paul Irish
Author URI: http://www.tinyways.com
*/
	
function wp_infinite_scroll_add()
{

	if (!is_home())
		return;
	
	$plugin_dir = get_option('home').'/wp-content/plugins/wp_infinite_scroll';
	
$js_string = <<<EOT
	
		<script type="text/javascript" src="$plugin_dir/jquery-1.2.1.js"></script>
		<script type="text/javascript" src="$plugin_dir/dimensions.js"></script>
		<script type="text/javascript" >
		// infinite scroll code
		// copyright Paul Irish
		// license: cc-wrapped GPL
		jQuery.noConflict();

		var pgRetrived = 1;
		var duringajax = false;
			jQuery(window).scroll(function(){
			       if (duringajax) 
		             return; 
	
	       		//so now, we're looking at the homepage and not in an ajax request.
			if ( jQuery(document).height() - jQuery(document).scrollTop() - jQuery(window).height()  < 200){
			
				duringajax = true; // we dont want to fire this multiple times.
				var loading = jQuery('<div class="loading" style="text-align: center;"><img style="float:none;" src="$plugin_dir/ajax-loader.gif"><br><em>Loading the next set of posts</em></div>')
						.appendTo('#content');
		
				jQuery('#content .navigation').remove(); // take out the previous/next links
				pgRetrived++;
				jQuery('<div>').appendTo('#content').load('/page/'+ pgRetrived +'/ #content > *',null,function(){
					loading.fadeOut('normal');
					duringajax = false; // once the call is done, we can allow it again.
			                playthings();
				});
			}
		});
		</script>
	
EOT;

	echo $js_string;	
	
	return;
}


add_action('wp_footer', 'wp_infinite_scroll_add');

?>
