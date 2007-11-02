<?php

/*
Plugin Name: WP-InfiniteScroll
Version: 0.2
Plugin URI: http://www.tinyways.com
Description: Infinite scroll using AJAX based on Javascript code by <a href="http://aurgasm.us">Paul Irish</a>. Wordpress plugin integration by <a href="http://www.tinyways.com">dirkhaim</a>.
Author: dirkhaim & Paul Irish
Author URI: http://www.tinyways.com



TODO:
 - Use css selector for the NEXT PAGE link in the js (and attr('href') )
	- Add support for defining css selector for the NEXT PAGE link in options
 - User can define css selector of #content div
 - Link to jquery file hosted on code.google.com
 - Allow to customize the loading image
 - Be able to handle different perma links addresses
 - Allow to customize the param of the fadeOut effect (or maybe even choose a different effect)
 

*/

// constants for enables/disabled
define('infscr_enabled', 'enabled');
define('infscr_disabled', 'disabled');

// options keys constants
define('key_infscr_state'		, 'infscr_state');
define('key_infscr_maintenance_state'	, 'infscr_maintenance_state');
define('key_infscr_js_calls'		, 'infscr_js_calls');

// defaults
define('infscr_state_default', infscr_disabled);
define('infscr_maintenance_state_default', infscr_disabled);
define('infscr_js_calls_default', '');

// add options
add_option(key_infscr_state		, infscr_state_default			, 'If InfiniteScroll is turned on or off');
add_option(key_infscr_maintenance_state	, infscr_maintenance_state_default	, 'If maintenance state is turned on or off');
add_option(key_infscr_js_calls		, infscr_js_calls_default		, 'Java calls to make when script ends');

// adding actions
add_action('wp_footer', 'wp_inf_scroll_add');
add_action('admin_menu', 'add_wp_inf_scroll_options_page');

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
	<div style="margin:10px auto; border:3px #f00 solid; background-color:#fdd; color:#000; padding:10px; text-align:center;">
	No Javascript calls will be made after the content is added. This might cause errors in newly added content.
	</div>
<?php } ?>
	<h2>InfiniteScroll Options</h2>
	<fieldset class='options'>
		<legend>Basic Options</legend>
		<table class="editform" cellspacing="2" cellpadding="5" width="100%">
			<tr>
				<th width="30%" valign="top" style="padding-top: 10px;">
					<label for"<?php echo key_infscr_state; ?>">InfiniteScroll state is:</label>
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


		</table>
	</fieldset>
	<fieldset class='options'>
		<legend>Advanced Options</legend>
		<table class="editform" cellspacing="2" cellpadding="5" width="100%">
			<tr>
				<th width="30%" valign="top" style="padding-top: 10px;">
					<label for"<?php echo key_infscr_maintenance_state; ?>">InfiniteScroll maintenance state is:</label>
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
					<label for"<?php echo key_infscr_js_calls; ?>">Javascript which will be called after the data is fetched:</label>
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
		echo '<!-- InfiniteScroll not added for this page (not home)';
		return;
	}

	if (get_option(key_infscr_maintenance_state) == infscr_enabled && $user_level >= 8)
	{
		echo '<!-- InfiniteScroll not added for administrator (maintenance state) -->';
		return;
	}
	
	$plugin_dir = get_option('home').'/wp-content/plugins/wp_infinite_scroll';
	$js_calls = get_option(key_infscr_js_calls);
	
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
				var loading = jQuery('<div class="loading" style="text-align: center;"><img style="float:none;" alt="loading..." src="$plugin_dir/ajax-loader.gif" /><br /><em>Loading the next set of posts</em></div>')
						.appendTo('#content');
		
				jQuery('#content .navigation').remove(); // take out the previous/next links
				pgRetrived++;
				jQuery('<div>').appendTo('#content').load('/page/'+ pgRetrived +'/ #content > *',null,function(){
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
