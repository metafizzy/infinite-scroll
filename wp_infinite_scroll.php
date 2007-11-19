<?php

/*
Plugin Name: WP-InfiniteScroll
Version: 0.4
Plugin URI: http://www.tinyways.com
Description: Infinite scroll using AJAX based on Javascript code by <a href="http://aurgasm.us">Paul Irish</a>. Wordpress plugin integration by <a href="http://www.tinyways.com">dirkhaim</a>.
Author: dirkhaim & Paul Irish
Author URI: http://www.tinyways.com



TODO:
 - Use css selector for the NEXT PAGE link in the js (and attr('href') )
 	 - Be able to handle different perma links addresses (will be covered by parent task)
 - Allow to customize the param of the fadeOut effect (or maybe even choose a different effect)

*/

// constants for enables/disabled
define('infscr_enabled'		, 'enabled');
define('infscr_disabled'	, 'disabled');

// options keys constants
define('key_infscr_state'			, 'infscr_state');
define('key_infscr_maintenance_state'		, 'infscr_maintenance_state');
define('key_infscr_js_calls'			, 'infscr_js_calls');
define('key_infscr_image'			, 'infscr_image');
define('key_infscr_content_selector'		, 'infscr_content_selector');
define('key_infscr_nav_selector'		, 'infscr_nav_selector');
define('key_infscr_post_selector'		, 'infscr_post_selector');

// defaults
define('infscr_state_default'			, infscr_disabled);
define('infscr_maintenance_state_default'	, infscr_disabled);
define('infscr_js_calls_default'		, '');
define('infscr_image_default'			, '');
define('infscr_content_selector_default'	, '#content');
define('infscr_nav_selector_default'		, '.navigation');
define('infscr_post_selector_default'		, '#content > *');


// add options
add_option(key_infscr_state		, infscr_state_default			, 'If InfiniteScroll is turned on or off');
add_option(key_infscr_maintenance_state	, infscr_maintenance_state_default	, 'If maintenance state is turned on or off');
add_option(key_infscr_js_calls		, infscr_js_calls_default		, 'Javascript to execute when new content loads in');
add_option(key_infscr_image		, infscr_image_default			, 'Loading image');
add_option(key_infscr_content_selector	, infscr_content_selector_default	, 'Content css selector');
add_option(key_infscr_nav_selector 	, infscr_nav_selector_default		, 'Navigation link css selector');
add_option(key_infscr_post_selector 	, infscr_post_selector_default		, 'Post css selector');

// adding actions
add_action('wp_footer'		, 'wp_inf_scroll_add');
add_action('admin_menu'		, 'add_wp_inf_scroll_options_page');

function add_wp_inf_scroll_options_page() 
{
	global $wpdb;
	add_options_page('InfiniteScroll Options', 'InfiniteScroll', 8, basename(__FILE__), 'wp_inf_scroll_options_page');
}

function wp_inf_scroll_options_page()
{
	// if postback, store options
	if (isset($_POST['info_update']))
	{
		check_admin_referer();	

		// update state
		$infscr_state = $_POST[key_infscr_state];
		if ($infscr_state != infscr_enabled && $infscr_state != infscr_disabled)
			$infscr_state = infscr_state_default;
		update_option(key_infscr_state, $infscr_state);

		// update maintenance mode
		$infscr_maint = $_POST[key_infscr_maintenance_state];
		if ($infscr_maint != infscr_enabled && $infscr_state != infscr_disabled)
			$infscr_maint = infscr_maintenance_state_default;
		update_option(key_infscr_maintenance_state, $infscr_maint);

		// update js calls field
		$infscr_js_calls = $_POST[key_infscr_js_calls];
		update_option(key_infscr_js_calls, $infscr_js_calls);

		// update image
		$infscr_image = $_POST[key_infscr_image];
		update_option(key_infscr_image, $infscr_image);

		// update content selector
		$content_div = $_POST[key_infscr_content_selector];
		update_option(key_infscr_content_selector, $content_div);

		// update the navigation selector
		$nav_class = $_POST[key_infscr_nav_selector];
		update_option(key_infscr_nav_selector, $nav_class);

		// update the post selector
		$post_selector = $_POST[key_infscr_post_selector];
		update_option(key_infscr_post_selector, $post_selector);



		// update notification
		echo "<div class='updated'><p><strong>InfiniteScroll options updated</strong></p></div>";
	}

	// output the options page

?>
<form method="post" action="options-general.php?page=<?php echo basename(__FILE__); ?>">
	<div class="wrap">
<?php if (get_option(key_infscr_state) == infscr_disabled) { ?>
	<div style="margin:10px auto; border:3px #f00 solid; background-color: #fdd; color: #000; padding: 10px; text-align: center;">
	InfiniteScroll plugin is <strong>disabled</strong>.
	</div>
<?php } ?>
<?php if (get_option(key_infscr_state) != infscr_disabled && get_option(key_infscr_js_calls) == '') { ?>
	<div style="margin:10px auto; border:1px #f00 solid; background-color:#fdd; color:#000; padding:10px; text-align:center;">
	No Javascript calls will be made after the content is added. This might cause errors in newly added content.
	</div>
<?php } ?>
	<h2>InfiniteScroll Options</h2>
	<fieldset class='options'>
		<legend>Basic Options</legend>
		<table class="editform" cellspacing="2" cellpadding="5" width="100%">
			<tr>
				<th width="30%" valign="top" style="padding-top: 10px;">
					<label for="<?php echo key_infscr_state; ?>">InfiniteScroll state is:</label>
				</th>
				<td>
					<?php
						echo "<select name='".key_infscr_state."' id='".key_infscr_state."'>\n";
						echo "<option value='".infscr_enabled."'";
						if (get_option(key_infscr_state) == infscr_enabled)
							echo "selected='selected'";
						echo ">Enabled</option>\n";
						echo "<option value='".infscr_disabled."'";
						if (get_option(key_infscr_state) == infscr_disabled)
							echo "selected='selected'";
						echo ">Disabled</option>\n";
						echo "</select>";
					?>
				</td>
			</tr>
			<tr>
				<th width="30%" valign="top" style="padding-top: 10px;">
					<label for="<?php echo key_infscr_image; ?>">Loading image:</label>
				</th>
				<td>
					<?php
						echo "<input name='".key_infscr_image."' id='".key_infscr_image."' value='".get_option(key_infscr_image)."' size='70' type='text'>\n";
					?>
					<p style="margin: 5px 10px;">The image that will be displayed while content is being loaded. If empty, the plugin's default will be used.</p>
				<td>


		</table>
	</fieldset>
	<fieldset class='options'>
		<legend>Advanced Options</legend>
		<table class="editform" cellspacing="2" cellpadding="5" width="100%">
			<tr>
				<th width="30%" valign="top" style="padding-top: 10px;">
					<label for="<?php echo key_infscr_maintenance_state; ?>">InfiniteScroll maintenance state is:</label>
				</th>
				<td>
					<?php
						echo "<select name='".key_infscr_maintenance_state."' id='".key_infscr_maintenance_state."'>\n";
						echo "<option value='".infscr_enabled."'";
						if (get_option(key_infscr_maintenance_state) == infscr_enabled)
							echo "selected='selected'";
						echo ">Enabled</option>\n";
						echo "<option value='".infscr_disabled."'";
						if (get_option(key_infscr_maintenance_state) == infscr_disabled)
							echo "selected='selected'";
						echo ">Disabled</option>\n";
						echo "</select>";
					?>
					<p style="margin: 5px 10px;">In maintenance mode the plugin will be disabled for users with a level 8 and higher. This is meant to spare the administrator from constant data fetching when customizing, while allowing users to have the feature enabled. Your user level is <?php global $user_level; echo $user_level; ?>.</p>
				</td>
			</tr>
			<tr>
				<th width="30%" valign="top" style="padding-top: 10px;">
					<label for="<?php echo key_infscr_content_selector; ?>">Content CSS Selector:</label>
				</th>
				<td>
					<?php
						echo "<input name='".key_infscr_content_selector."' id='".key_infscr_content_selector."' value='".get_option(key_infscr_content_selector)."' size='30' type='text'>\n";
					?>
				<p style="margin: 5px 10px;">The ID of the div that holds the content on the main page.</p>
				</td>
			<tr>
			<tr>
				<th width="30%" valign="top" style="padding-top: 10px;">
					<label for="<?php echo key_infscr_nav_selector; ?>">Navigation Links CSS Selector:</label>
				</th>
				<td>
					<?php
						echo "<input name='".key_infscr_nav_selector."' id='".key_infscr_nav_selector."' value='".get_option(key_infscr_nav_selector)."' size='30' type='text'>\n";
					?>
				<p style="margin: 5px 10px;">The class of the navigation ID (the one that includes the back and forward links).</p>
				</td>
			<tr>			
			  			<tr>
				<th width="30%" valign="top" style="padding-top: 10px;">
					<label for="<?php echo key_infscr_post_selector; ?>">Post CSS Selector:</label>
				</th>
				<td>
					<?php
						echo "<input name='".key_infscr_post_selector."' id='".key_infscr_post_selector."' value='".get_option(key_infscr_post_selector)."' size='30' type='text'>\n";
					?>
				<p style="margin: 5px 10px;">The selector of the post block (e.g. <em>#content > *</em> or <em>#content div.post</em>).</p>
				</td>
			<tr>			
			  
			  
			  
			<tr>
				<th width="30%" valign="top" style="padding-top: 10px;">
					<label for="<?php echo key_infscr_js_calls; ?>">Javascript which will be called after the data is fetched:</label>
				</th>
				<td>
					<?php
						echo "<textarea name='".key_infscr_js_calls."' rows='15' cols='50' style='width: 95%;'>\n";
						echo get_option(key_infscr_js_calls);
						echo "</textarea>\n";
					?>
				</td>
			</tr>
		</table>
	</fieldset>


			
	<p class="submit">
		<input type='submit' name='info_update' value='Update Options' />
	</p>
	</div>
</form>

<?php
}

function wp_inf_scroll_add()
{
	global $user_level;
	
	if (get_option(key_infscr_state) == infscr_disabled)
		return;

	if (!is_home())
	{
		echo '<!-- InfiniteScroll not added for this page (not home) -->';
		return;
	}

	if (get_option(key_infscr_maintenance_state) == infscr_enabled && $user_level >= 8)
	{
		echo '<!-- InfiniteScroll not added for administrator (maintenance state) -->';
		return;
	}
	
	$plugin_dir 		= get_option('home').'/wp-content/plugins/wp-infinite-scroll';
	$js_calls		= get_option(key_infscr_js_calls);
	$loading_image		= get_option(key_infscr_image);
	$content_selector	= get_option(key_infscr_content_selector);
	$navigation_selector	= get_option(key_infscr_nav_selector);
	$post_selector		= get_option(key_infscr_post_selector);
	
	if ($loading_image == '')
		$loading_image	= "$plugin_dir/ajax-loader.gif";
	
$js_string = <<<EOT
	
		<script type="text/javascript" src="http://jqueryjs.googlecode.com/files/jquery-1.2.1.min.js"></script>
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
				var loading = jQuery('<div class="loading" style="text-align: center;"><img style="float:none;" alt="loading..." src="$loading_image" /><br /><em>Loading the next set of posts</em></div>')
						.appendTo('$content_selector');
		
				jQuery('$content_selector .$navigation_selector').remove(); // take out the previous/next links
				pgRetrived++;
				jQuery('<div>').appendTo('$content_selector').load('/page/'+ pgRetrived +'/ $post_selector',null,function(){
					loading.fadeOut('normal');
					duringajax = false; // once the call is done, we can allow it again.
					$js_calls
				});
			}
		});
		</script>
	
EOT;

	echo $js_string;	
	
	return;
}



?>
