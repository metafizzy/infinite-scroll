<?php
/*
Plugin Name: Infinite Scroll
Version: 2.0b2.110709
Plugin URI: http://www.infinite-scroll.com
Description: Automatically loads the next page of posts into the bottom of the initial page. 
Author: dirkhaim, Paul Irish, Beaver6813
Author URI: http://www.infinite-scroll.com
License   : http://creativecommons.org/licenses/GPL/2.0/


BUGS:
 - javascript insertion doesnt work on themes: qwiilm!, craving4green, Lush, no limits, stripedplus   
 - Note: Above bug left over from old plugin. Needs verifying.
*/

// constants for enables/disabled
define('infscr_enabled'		, 'enabled');
define('infscr_disabled'	, 'disabled');
define('infscr_config'	, 'enabledforadmins');
define('infscr_maint'	, 'disabledforadmins');


// options keys constants
define('key_infscr_state'			, 'infscr_state');
define('key_infscr_js_calls'			, 'infscr_js_calls');
define('key_infscr_image'			, 'infscr_image');
define('key_infscr_text'			, 'infscr_text');
define('key_infscr_donetext'			, 'infscr_donetext');
define('key_infscr_content_selector'		, 'infscr_content_selector');
define('key_infscr_nav_selector'		, 'infscr_nav_selector');
define('key_infscr_post_selector'		, 'infscr_post_selector');
define('key_infscr_next_selector'		, 'infscr_next_selector');


// defaults
define('infscr_state_default'			, infscr_config); 
define('infscr_js_calls_default'		, '');

$image_path = plugins_url( 'infinite-scroll/ajax-loader.gif');
define('infscr_image_default'			, $image_path);
define('infscr_text_default'			, '<em>Loading the next set of posts...</em>');
define('infscr_donetext_default'			, '<em>Congratulations, you\'ve reached the end of the internet.</em>');
define('infscr_content_selector_default'	, '#content');
define('infscr_post_selector_default'		, '#content  div.post');
define('infscr_nav_selector_default'		, 'div.navigation');
define('infscr_next_selector_default', 'div.navigation a:first');


// add options
add_option(key_infscr_state		, infscr_state_default			, 'If InfiniteScroll is turned on, off, or in maintenance');
add_option(key_infscr_js_calls		, infscr_js_calls_default		, 'Javascript to execute when new content loads in');
add_option(key_infscr_image		, infscr_image_default			, 'Loading image');
add_option(key_infscr_text		, infscr_text_default			, 'Loading text');
add_option(key_infscr_donetext		, infscr_donetext_default			, 'Completed text');
add_option(key_infscr_content_selector	, infscr_content_selector_default	, 'Content Div css selector');
add_option(key_infscr_nav_selector 	, infscr_nav_selector_default		, 'Navigation Div css selector');
add_option(key_infscr_post_selector 	, infscr_post_selector_default		, 'Post Div css selector');
add_option(key_infscr_next_selector 	, infscr_next_selector_default		, 'Next page Anchor css selector');
add_option(key_infscr_viewed_options 	, false		, 'Ever Viewed Options Page');
add_option(key_infscr_debug 	, 0		, 'Debug Mode');

// adding actions
add_action('wp_head'		, 'wp_inf_scroll_init');
add_action('admin_menu'		, 'add_wp_inf_scroll_options_page');
add_action("wp"				, 'wp_inf_scroll_404');	

if ( get_option(key_infscr_state) == infscr_state_default && get_option(key_infscr_viewed_options) == false && !isset($_POST['submit']) )
	add_action('admin_notices', 'wp_inf_scroll_setup_warning');	

/*
Because recently (3.0) WP doesn't always throw a 404 when posts aren't found.
Infinite-Scroll relies on 404 errors to terminate.. so we'll force them. */
function wp_inf_scroll_404($wp)
	{
	if(!have_posts())
		{
		header("HTTP/1.1 404 Not Found");
		header("Status: 404 Not Found");
		}
	}

function add_wp_inf_scroll_options_page() 
	{
	global $wpdb;
	add_options_page('Infinite Scroll Options', 'Infinite Scroll', 8, basename(__FILE__), 'wp_inf_scroll_options_page');
	}

function wp_inf_scroll_error($message)
	{
	return "<div class=\"error\"><p>$message</p></div>\n";	
	}
	
function wp_inf_scroll_setup_warning() 
	{
	echo "<div id='infinitescroll-warning' class='updated fade'><p><strong>".__('Infinite Scroll is almost ready.')."</strong> ".sprintf(__('Please <a href="%1$s">review the configuration and set the state to ON</a>.'), "options-general.php?page=wp_infinite_scroll.php")."</p></div>\n";
	}
function wp_inf_scroll_getAttribute($attrib, $tag)
	{
		//get attribute from html tag
		$re = '/' . preg_quote($attrib) . '=([\'"])?((?(1).+?|[^\s>]+))(?(1)\1)/is';
		if (preg_match_all($re, $tag, $match)) {
			return $match[2];
		}
			return false;
	}
/* 
Stripped down version of get_pagenum_link() from link-template.php
We use this to retrieve the URL array (seperated for placement of page number).
This saves using regex on the entire URL that could be unpredictable on some
installations.
Added Build: 110628 */
function wp_inf_scroll_get_pagenum_link() {
	global $wp_rewrite;

	$request = remove_query_arg( 'paged' );

	$home_root = parse_url(home_url());
	$home_root = ( isset($home_root['path']) ) ? $home_root['path'] : '';
	$home_root = preg_quote( trailingslashit( $home_root ), '|' );

	$request = preg_replace('|^'. $home_root . '|', '', $request);
	$request = preg_replace('|^/+|', '', $request);

	if ( !$wp_rewrite->using_permalinks() || is_admin() ) {
		$base = trailingslashit( get_bloginfo( 'url' ) );
		$result = add_query_arg( 'paged', "|||INF-SPLITHERE|||", $base . $request );
	} else {
		$qs_regex = '|\?.*?$|';
		preg_match( $qs_regex, $request, $qs_match );

		if ( !empty( $qs_match[0] ) ) {
			$query_string = $qs_match[0];
			$request = preg_replace( $qs_regex, '', $request );
		} else {
			$query_string = '';
		}

		$request = preg_replace( "|$wp_rewrite->pagination_base/\d+/?$|", '', $request);
		$request = preg_replace( '|^index\.php|', '', $request);
		$request = ltrim($request, '/');

		$base = trailingslashit( get_bloginfo( 'url' ) );

		if ( $wp_rewrite->using_index_permalinks() && '' != $request )
			$base .= 'index.php/';

		$request = ( ( !empty( $request ) ) ? trailingslashit( $request ) : $request ) . user_trailingslashit( $wp_rewrite->pagination_base . "/" . "|||INF-SPLITHERE|||", 'paged' );
		$result = $base . $request . $query_string;
	}
	$result = apply_filters('get_pagenum_link', $result);
	return explode("|||INF-SPLITHERE|||",$result);
}
function wp_inf_scroll_init()
	{
	global $user_level;
	$load_infinite_scroll = true;
	$error_reason = "";
	
	/* Lets start our pre-flight checks */
	if (get_option(key_infscr_state) == infscr_disabled)
		$load_infinite_scroll = false;
	else if (is_page() || is_single() ) /* single posts/pages dont get it */
		{
		$error_reason = 'Single post/page';
		$load_infinite_scroll = false;
		}
	else if (get_option(key_infscr_state) == infscr_maint && $user_level >= 8)
  		{
		$error_reason = 'Administrator (Maintenance State)';
		$load_infinite_scroll = false;
		}
	else if (get_option(key_infscr_state) == infscr_config && $user_level <= 8)
		{
		$error_reason = 'Visitors (Config State)';
		$load_infinite_scroll = false;	
		}
	else if ( !have_posts() )
		{
		$error_reason = 'No Posts to Display';
		$load_infinite_scroll = false;		
		}
		
	/* Pre-flight checks complete. Are we good to fly? */	
	if($load_infinite_scroll)
		{
		/* Loading Infinite-Scroll */
		
		$site_url 			= site_url();
		$plugin_dir 		= plugins_url('infinite-scroll');
		$js_calls			= stripslashes(get_option(key_infscr_js_calls));
		//Fancy stuff (not) to detect https or http
		$noscheme 			= parse_url(stripslashes(get_option(key_infscr_image)));
		if (is_ssl())
			$scheme			= "https://";
		else
			$scheme			= "http://";
		$loading_image		= $scheme.$noscheme['host'].$noscheme['path'];	
		$loading_text		= stripslashes(get_option(key_infscr_text));
		$donetext			= stripslashes(get_option(key_infscr_donetext));
		$content_selector	= stripslashes(get_option(key_infscr_content_selector));
		$navigation_selector= stripslashes(get_option(key_infscr_nav_selector));
		$post_selector		= stripslashes(get_option(key_infscr_post_selector));
		$next_selector		= stripslashes(get_option(key_infscr_next_selector));
		$debug				= (stripslashes(get_option(key_infscr_debug))==1) ? "true" : "false";
		$current_page 		= (get_query_var('paged')) ? get_query_var('paged') : 1;
		$pathParse			= wp_inf_scroll_get_pagenum_link();
		$nextpage_no 		= intval($current_page) + 1;
		$max_page 			= $wp_query->max_num_pages;
		
		if ( !$max_page || $max_page >= $nextpage )
			{			
			/* I always hated the way the old plugin outputted... so did my IDE... */
			echo "<script type=\"text/javascript\"> if (!(window.jQuery && jQuery.fn.jquery >= '1.6')){document.write(unescape(\"%3Cscript src='https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js' type='text/javascript'%3E%3C/script%3E\"));}</script>";
			if($debug=="true")
				echo "<script type=\"text/javascript\" src=\"$plugin_dir/jquery.infinitescroll.js\"></script>";
			else
				echo "<script type=\"text/javascript\" src=\"$plugin_dir/jquery.infinitescroll.min.js\"></script>";
			echo "	<script type=\"text/javascript\">
					jQuery(document).ready(function($) {
					// Infinite Scroll jQuery+Wordpress plugin
					$('$content_selector').infinitescroll({
						debug           : $debug,
						loading			: {
							img			: \"$loading_image\",
							msgText		: \"$loading_text\",
							finishedMsg	: \"$donetext\"
							},
						state			: {
							currPage	: \"$current_page\"
							},
						nextSelector    : \"$next_selector\",
						navSelector     : \"$navigation_selector\",
						contentSelector : \"$content_selector\",
						itemSelector    : \"$post_selector\",
						pathParse		: [\"{$pathParse[0]}\", \"{$pathParse[1]}\"]
						}, function() { $js_calls } );
					});	
					</script>";
			return true;
			}
		else
			{
    		echo "<!-- Infinite-Scroll not added. Reason: No More Posts To Display After This -->\r\n";
			return false;
    		}
		}
	else
		{
    	echo "<!-- Infinite-Scroll not added. Reason: $error_reason -->\r\n";
		return false;
    	}
	
	}

function wp_inf_scroll_options_page()
	{
	// if postback, store options
	if (isset($_POST['info_update']))
	{
		check_admin_referer();	

		// update state
		$infscr_state = $_POST[key_infscr_state];
		if ($infscr_state != infscr_enabled && $infscr_state != infscr_disabled && $infscr_state != infscr_maint && $infscr_state != infscr_config)
			$infscr_state = infscr_state_default;
		update_option(key_infscr_state, $infscr_state);

		// update debug
		$infscr_debug = $_POST[key_infscr_debug];
		update_option(key_infscr_debug, $infscr_debug);
		
		// update js calls field
		$infscr_js_calls = $_POST[key_infscr_js_calls];
		update_option(key_infscr_js_calls, $infscr_js_calls);

		// update image
		/* Handle Image Upload */
		if(!empty($_FILES[key_infscr_image]['tmp_name']))
			{
			$infscr_image = $_FILES[key_infscr_image];
			$uploaddetails = wp_check_filetype($infscr_image["name"]);
			if(!empty($uploaddetails['ext']))
				{
				$uploadres = wp_upload_bits("inf-loading-".rand().".".$uploaddetails['ext'], null, file_get_contents($infscr_image["tmp_name"]));
				if(!$uploadres['error'])
					update_option(key_infscr_image, $uploadres['url']);	
				else
					echo wp_inf_scroll_error("Error Saving Loading Bar: {$uploadres['error']}");	
				}
			else
				{
				echo wp_inf_scroll_error("Could Not Determine File Extension. Supported Files Are: .jpg, .jpeg. gif. .png");
				}
			}
		
	    // update text 
		$infscr_text = $_POST[key_infscr_text];
		update_option(key_infscr_text, $infscr_text);
		
		// update done text 
		$infscr_donetext = $_POST[key_infscr_donetext];
		update_option(key_infscr_donetext, $infscr_donetext);

		// update content selector
		$content_selector = $_POST[key_infscr_content_selector];
		update_option(key_infscr_content_selector, $content_selector);

		// update the navigation selector
		$navigation_selector = $_POST[key_infscr_nav_selector];
		update_option(key_infscr_nav_selector, $navigation_selector);

		// update the post selector
		$post_selector = $_POST[key_infscr_post_selector];
		update_option(key_infscr_post_selector, $post_selector);

		// update the next selector
		$next_selector = $_POST[key_infscr_next_selector];
		update_option(key_infscr_next_selector, $next_selector);


		// update notification
		echo "<div class='updated'><p><strong>Infinite Scroll options updated</strong></p></div>";
	}

	// output the options page
if ( get_option(key_infscr_state) == infscr_state_default && get_option(key_infscr_viewed_options) == true && !isset($_POST['submit']) )
	wp_inf_scroll_setup_warning();
?>

<form action="options-general.php?page=<?php echo basename(__FILE__); ?>" method="post" enctype="multipart/form-data">
	<div class="wrap">
<?php
	update_option(key_infscr_viewed_options, true);
 	if (get_option(key_infscr_state) == infscr_disabled)
			echo wp_inf_scroll_error("Infinite-Scroll plugin is <strong>disabled</strong>.");?>
		  
  <style type="text/css">
    table.infscroll-opttable { width: 100%;}
    table.infscroll-opttable td, table.infscroll-opttable th { vertical-align: top; padding: 9px 4px; }
    table.infscroll-opttable th { padding-top: 13px; text-align: right;}
    table.infscroll-opttable td p { margin: 0;}
    table.infscroll-opttable dl { font-size: 90%; color: #666; margin-top: 5px; }
    table.infscroll-opttable dd { margin-bottom: 0 }
  </style>
  
	<h2>Infinite Scroll Options</h2>

	  <p>All CSS selectors are found with the jQuery javascript library. See the <a href="http://docs.jquery.com/Selectors">jQuery CSS Selector documentation</a> for an overview of all possibilities. Single-quotes are not allowed&mdash;only double-quotes may be used.

		<table class="editform infscroll-opttable" cellspacing="0" >
		  <tbody>
			<tr>
				<th width="30%" >
					<label for="<?php echo key_infscr_state; ?>">Infinite Scroll state is:</label>
				</th>
				<td>
					<?php
						echo "<select name='".key_infscr_state."' id='".key_infscr_state."'>\n";
						echo "<option value='".infscr_disabled."'";
						if (get_option(key_infscr_state) == infscr_disabled)
							echo "selected='selected'";
						echo ">OFF</option>\n";
						
						echo "<option value='".infscr_maint."'";
						if (get_option(key_infscr_state) == infscr_maint)
							echo "selected='selected'";
						echo ">ON for Visitors Only</option>\n";
						
						echo "<option value='".infscr_config."'";
						if (get_option(key_infscr_state) == infscr_config)
							echo "selected='selected'";
						echo ">ON for Admins Only</option>\n";
						
						echo "<option value='".infscr_enabled."'";
						if (get_option(key_infscr_state) == infscr_enabled)
							echo "selected='selected'";
						echo ">ON</option>\n";
						
						echo "</select>";
					?>
				</td>
	      <td width="50%">
	        "ON for Admins Only" will enable the plugin code only for logged-in administrators&mdash;visitors will not be affected while you configure the plugin. "ON for Visitors Only" is useful for administrators when customizing the blog&mdash;infinite scroll will be disabled for them, but still enabled for any visitors. 
        </td>
			</tr>
<tr>
				<th width="30%" >
					<label for="<?php echo key_infscr_debug; ?>">Debug Mode:</label>
				</th>
				<td>
					<?php
						echo "<select name='".key_infscr_debug."' id='".key_infscr_debug."'>\n";
						echo "<option value='0'";
						if (get_option(key_infscr_debug) == 0)
							echo "selected='selected'";
						echo ">OFF</option>\n";
						
						echo "<option value='1'";
						if (get_option(key_infscr_debug) == 1)
							echo "selected='selected'";
						echo ">ON</option>\n";
						
						echo "</select>";
					?>
				</td>
	      <td width="50%">
	        ON will turn on Debug mode. This will enable developer javascript console logging whilst in use. (Recommended: OFF, May break some browsers).
        </td>
			</tr>
		
			<tr>
				<th>
					<label for="<?php echo key_infscr_content_selector; ?>">Content CSS Selector:</label>
				</th>
				<td>
					<?php
						echo "<input name='".key_infscr_content_selector."' id='".key_infscr_content_selector."' value='".stripslashes(get_option(key_infscr_content_selector))."' size='30' type='text'>\n";
					?>
  			</td>
  			<td>
  			  <p>The selector of the content div on the main page.</p>
			  </td>
			</tr>
			  
			<tr>
				<th >
					<label for="<?php echo key_infscr_post_selector; ?>">Post CSS Selector:</label>
				</th>
				<td>
					<?php
						echo "<input name='".key_infscr_post_selector."' id='".key_infscr_post_selector."' value='".stripslashes(get_option(key_infscr_post_selector))."' size='30' type='text'>\n";
					?>
				</td>
				<td>
				  <p>The selector of the post block.</p>
				  <dl>
				    <dt>Examples:</dt>
				    <dd>#content &gt; *</dd>
				    <dd>#content div.post</dd>
				    <dd>div.primary div.entry</dd>
			    </dl>
			  </td>
			</tr>
			  
			<tr>
				<th>
					<label for="<?php echo key_infscr_nav_selector; ?>">Navigation Links CSS Selector:</label>
				</th>
				<td>
					<?php
						echo "<input name='".key_infscr_nav_selector."' id='".key_infscr_nav_selector."' value='".stripslashes(get_option(key_infscr_nav_selector))."' size='30' type='text'>\n";
					?>
			
				</td>
				<td>
			  	<p>The selector of the navigation div (the one that includes the next and previous links).</p>
			  </td>
			</tr>			

			<tr>
				<th>
					<label for="<?php echo key_infscr_next_selector; ?>">Previous posts CSS Selector:</label>
				</th>
				<td>
					<?php
						echo "<input name='".key_infscr_next_selector."' id='".key_infscr_next_selector."' value='".stripslashes(get_option(key_infscr_next_selector))."' size='30' type='text'>\n";
					?>
				</td>
				<td>
				  <p>The selector of the previous posts (next page) A tag.</p>
				  <dl>
				    <dt>Examples:</dt>
				    <dd>div.navigation a:first</dd>
				    <dd>div.navigation a:contains(Previous)</dd>
			    </dl>
			  </td>
			</tr>			
			  
			  
			<tr>
				<th>
					<label for="<?php echo key_infscr_js_calls; ?>">Javascript to be called after the next posts are fetched:</label>
				</th>
				<td>
					<?php
						echo "<textarea name='".key_infscr_js_calls."' rows='2'  style='width: 95%;'>\n";
						echo stripslashes(get_option(key_infscr_js_calls));
						echo "</textarea>\n";
					?>
				</td>
				<td>
				  <p>Any functions that are applied to the post contents on page load will need to be executed when the new content comes in.</p>
		    </td>
			</tr>

			<tr>
				<th>
					<label for="<?php echo key_infscr_image; ?>">Loading image:</label>
				</th>
				<td>
					<?php
						echo "<input type='file' name='".key_infscr_image."' id='".key_infscr_image."' size='30' />\n";
					?>
				</td>
                <td>Current Image:<br /><div style="text-align:center;margin-bottom:15px;"><img src="<?php echo stripslashes(get_option(key_infscr_image));?>" alt="The Loading Image" /></div>
<p>URL of image that will be displayed while content is being loaded. Visit <a href="http://www.ajaxload.info" target="_blank">www.ajaxload.info</a> to customize your own loading spinner.</p>
              	</td>
  	          </tr>
  	  
  	  			<tr>
				<th>
					<label for="<?php echo key_infscr_text; ?>">Loading text:</label>
				</th>
				<td>
					<?php
						echo "<input name='".key_infscr_text."' id='".key_infscr_text."' value='".stripslashes(get_option(key_infscr_text))."' size='30' type='text'>\n";
					?>
				</td>
                <td>
              	  <p>Text will be displayed while content is being loaded. <small><acronym>HTML</acrynom> allowed.</small></p>
              	</td>
  	          </tr>

	<tr>
				<th>
					<label for="<?php echo key_infscr_donetext; ?>">"You've reached the end" text:</label>
				</th>
				<td>
					<?php
						echo '<input name="'.key_infscr_donetext.'" id="'.key_infscr_donetext.'" value="'.stripslashes(get_option(key_infscr_donetext)).'" size="30" type="text">';
					?>
				</td>
                <td>
              	  <p>Text will be displayed when all entries have already been retrieved. The plugin will show this message, fade it out, and cease working. <small><acronym>HTML</acrynom> allowed.</small></p>
              	</td>
  	          </tr>

			</tbody>
		</table>
			
	<p class="submit">
		<input type='submit' name='info_update' value='Update Options' />
	</p>
	</div>
</form>
<?php }?>