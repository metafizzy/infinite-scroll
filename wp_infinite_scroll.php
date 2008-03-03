<?php

/*
Plugin Name: WP-Infinite-Scroll
Version: 0.4
Plugin URI: http://www.infinite-scroll.net
Description: Automatically loads the next page of posts into the bottom of the initial page. 
Author: dirkhaim & Paul Irish
Author URI: http://www.infinite-scroll.net


BUGS:

 - javascript insertion doesnt work on themes: qwiilm!, craving4green, Lush, no limits, stripedplus

TODO:
 - Do we really need to ask for the content div? Is it not always the direct parent of the posts?
 - Allow to customize the speed of the fadeOut effect (or maybe even choose a different effect like hide..)
    - deal with the IE6 + opacity + cleartype + <em> issue.

 - What error handling do we need?
 - Mention div#infscr-loading so users can customize look more.
 - option for changing loading text.
 - reports of it crashing safari on os x
 - Tell user to go to options page after activating.
 - friendlier way of handling last page -- "oops looks like that's it!"

Troubleshooting:
 - Your posts need to be wrapped in divs all next to eachother.
 - you need a link on your page to the NEXT PAGE OF POSTS.

FAQ:
 - change number of posts loaded? 
Notes:
 - <div class="infscr-pages" id="infscr-page-2"> will contain the page 2 content, etc
   
   
*/

// constants for enables/disabled
define('infscr_enabled'		, 'enabled');
define('infscr_disabled'	, 'disabled');
define('infscr_maint'	, 'disabledforadmins');
define('infscr_config'	, 'enabledforadmins');


// options keys constants
define('key_infscr_state'			, 'infscr_state');
define('key_infscr_js_calls'			, 'infscr_js_calls');
define('key_infscr_image'			, 'infscr_image');
define('key_infscr_content_selector'		, 'infscr_content_selector');
define('key_infscr_nav_selector'		, 'infscr_nav_selector');
define('key_infscr_post_selector'		, 'infscr_post_selector');
define('key_infscr_next_selector'		, 'infscr_next_selector');


// defaults
define('infscr_state_default'			, infscr_config); 
define('infscr_js_calls_default'		, '');

$image_path = get_option('home').'/wp-content/plugins/wp-infinite-scroll'.'/ajax-loader.gif';
define('infscr_image_default'			, $image_path);
define('infscr_content_selector_default'	, '#content');
define('infscr_post_selector_default'		, '#content > div.post');
define('infscr_nav_selector_default'		, 'div.navigation');
define('infscr_next_selector_default', 'div.navigation a:first');


// add options
add_option(key_infscr_state		, infscr_state_default			, 'If InfiniteScroll is turned on, off, or in maintenance');
add_option(key_infscr_js_calls		, infscr_js_calls_default		, 'Javascript to execute when new content loads in');
add_option(key_infscr_image		, infscr_image_default			, 'Loading image');
add_option(key_infscr_content_selector	, infscr_content_selector_default	, 'Content Div css selector');
add_option(key_infscr_nav_selector 	, infscr_nav_selector_default		, 'Navigation Div css selector');
add_option(key_infscr_post_selector 	, infscr_post_selector_default		, 'Post Div css selector');
add_option(key_infscr_next_selector 	, infscr_next_selector_default		, 'Next page Anchor css selector');


// adding actions
add_action('wp_footer'		, 'wp_inf_scroll_add');
add_action('admin_menu'		, 'add_wp_inf_scroll_options_page');


/*
// used because wordpress doesnt like to tell us for sure what the homepage is.
// removed because it doesnt quite work..
function is_frontpage()
{
	global $post; 
	$id = $post->ID;
	$show_on_front = get_option('show_on_front');
	$page_on_front = get_option('page_on_front');

	if ($show_on_front == 'page' && $page_on_front == $id ) { return true; 	} 
	else { 	return false; 	}
}
*/

function add_wp_inf_scroll_options_page() 
{
	global $wpdb;
	add_options_page('Infinite-Scroll Options', 'Infinite-Scroll', 8, basename(__FILE__), 'wp_inf_scroll_options_page');
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

		// update js calls field
		$infscr_js_calls = $_POST[key_infscr_js_calls];
		update_option(key_infscr_js_calls, $infscr_js_calls);

		// update image
		$infscr_image = $_POST[key_infscr_image];
		update_option(key_infscr_image, $infscr_image);

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
		echo "<div class='updated'><p><strong>Infinite-Scroll options updated</strong></p></div>";
	}

	// output the options page

?>
<form method="post" action="options-general.php?page=<?php echo basename(__FILE__); ?>">
	<div class="wrap">
<?php if (get_option(key_infscr_state) == infscr_disabled) { ?>
	<div style="margin:10px auto; border:3px #f00 solid; background-color: #fdd; color: #000; padding: 10px; text-align: center;">
	Infinite-Scroll plugin is <strong>disabled</strong>.
	</div>
<?php } ?>
<?php if ( false && get_option(key_infscr_state) != infscr_disabled && get_option(key_infscr_js_calls) == '') {  // disabled for now?>
	<div style="margin:10px auto; border:1px #f00 solid; background-color:#fdd; color:#000; padding:10px; text-align:center;">
	No Javascript calls will be made after the content is added. This might cause errors in newly added content.
	</div>
<?php } ?>
		  
  <style type="text/css">
    table.infscroll-opttable { width: 100%;}
    table.infscroll-opttable td, table.infscroll-opttable th { vertical-align: top; padding: 9px 4px; }
    table.infscroll-opttable th { padding-top: 13px;}
    table.infscroll-opttable td p { margin: 0;}
    table.infscroll-opttable dl { font-size: 90%; color: #666; margin-top: 5px; }
    table.infscroll-opttable dd { margin-bottom: 0 }
  </style>
  
	<h2>Infinite-Scroll Options</h2>

	  <p>All CSS selectors are found with the jQuery javascript library. See the <a href="http://docs.jquery.com/Selectors">jQuery CSS Selector documentation</a> for an overview of all possibilities. Single-quotes are not allowed&mdash;only double-quotes may be used.

		<table class="editform infscroll-opttable" cellspacing="0" >
		  <tbody>
			<tr>
				<th width="30%" >
					<label for="<?php echo key_infscr_state; ?>">Infinite-Scroll state is:</label>
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
						
						echo "<option value='".infscr_config."'";
						if (get_option(key_infscr_state) == infscr_config)
							echo "selected='selected'";
						echo ">Enabled for admins only</option>\n";
						
            echo "<option value='".infscr_maint."'";
						if (get_option(key_infscr_state) == infscr_maint)
							echo "selected='selected'";
						echo ">Disabled for admins only</option>\n";
						echo "</select>";
					?>
				</td>
	      <td width="50%">
	        "Enabled for admins only" will enable the plugin code only for logged-in administrators&mdash;visitors will not be affected while you configure the plugin. "Disabled for admins only" is useful for administrators when customizing the blog&mdash;infinite scroll will be disabled for them, but still enabled for any visitors. 
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
				    <dd>div.navigation a:contains("Previous")</dd>
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
						echo "<input name='".key_infscr_image."' id='".key_infscr_image."' value='".stripslashes(get_option(key_infscr_image))."' size='30' type='text'>\n";
					?>
				</td>
        <td>
      	  <p>URL of image that will be displayed while content is being loaded. Visit <a href="http://www.ajaxload.info" target="_blank">www.ajaxload.info</a> to customize your own loading spinner.</p>
      	</td>
  	  </tr>

			</tbody>
		</table>
			
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

	if (!is_home() || is_paged() || is_single())
	{
		echo '<!-- Infinite-Scroll not added for this page (not home) -->';
		return;
	}
	
	/* see commented section above. line ~84
		if ( is_frontpage() )
	{
		echo '<!-- Infinite-Scroll not added for this page (frontpage) -->';
		return;
	}
*/

  if (get_option(key_infscr_state) == infscr_maint && $user_level >= 8)
  {
    echo '<!-- Infinite-Scroll not added for administrator (maintenance state) -->';
    return;
  }

  if (get_option(key_infscr_state) == infscr_config && $user_level <= 8)
  {
    echo '<!-- Infinite-Scroll not added for visitors (configuration state) -->';
    return;
  }  
	
	$plugin_dir 		= get_option('home').'/wp-content/plugins/wp-infinite-scroll';
	$js_calls		= stripslashes(get_option(key_infscr_js_calls));
	$loading_image		= stripslashes(get_option(key_infscr_image));
	$content_selector	= stripslashes(get_option(key_infscr_content_selector));
	$navigation_selector	= stripslashes(get_option(key_infscr_nav_selector));
	$post_selector		= stripslashes(get_option(key_infscr_post_selector));
	$next_selector		= stripslashes(get_option(key_infscr_next_selector));

$js_string = <<<EOT
	
<script type="text/javascript" src="http://jqueryjs.googlecode.com/files/jquery-1.2.1.min.js"></script>
<script type="text/javascript" src="$plugin_dir/common.js"></script>
<script type="text/javascript" >





		// WP-Infinite-Scroll plugin
		// copyright Paul Irish & dirkhaim
		// license: cc-wrapped GPL
		
		
		
		var jQis = jQuery.noConflict(); // held separately to avoid collisions
     
	  var INFSCR = {
		      path          : parseUri( jQis('$next_selector').attr('href') ).relative, 
		      loadingMsg    : jQis('<div id="infscr-loading" style="text-align: center;"><img style="float:none;" alt="Loading..." src="$loading_image" /><br /><em>Loading the next set of posts...</em></div>'),
		      pgRetrived    : 1,
		      scrollDelta   : jQis(document).height() - jQis('$navigation_selector').offset().top, //distance from nav links to bottom of page
		      isDuringAjax  : false,
		      isInvalidPage : false,
		      isDone        : false,  // for when it goes all the way through the archive.
		      isIE6         : (jQis.browser.msie && jQis.browser.version < 7),
		      preload       : new Image()
    };
    INFSCR.preload.src   = '$loading_image';
				      
    INFSCR.loadResults = function(){
      
        if (INFSCR.isDuringAjax || INFSCR.isInvalidPage || INFSCR.isDone) return; 
  
  	   	// the math is: docheight - distancetotopofwindow - height of window < docheight - distance of nav element to the top. [go algebra!]
  			if (  jQis(document).height() - jQis(document).scrollTop() - jQis(window).height()  <  INFSCR.scrollDelta){ 
  			
  				INFSCR.isDuringAjax = true; // we dont want to fire the ajax multiple times
  				INFSCR.loadingMsg.appendTo('$content_selector').show();
  				jQis('$navigation_selector').hide(); // take out the previous/next links
  				INFSCR.pgRetrived++;
  				
  				jQis('<div/>')
  				  .attr('id','infscr-page-'+INFSCR.pgRetrived)
  				  .attr('class','infscr-pages')
  				  .appendTo('$content_selector')
  				  .load( INFSCR.path.join( INFSCR.pgRetrived ) + ' $post_selector',null,function(){
				        INFSCR.loadingMsg.fadeOut('normal' ); // currently makes the <em>'d text ugly in IE6
      					INFSCR.isDuringAjax = false; // once the call is done, we can allow it again.
      					$js_calls
    				});
  				
  			}   
    };
    
    if (INFSCR.path.split('2').length == 2){ // there is a 2 in the next url, e.g. /page/2/
      INFSCR.path = INFSCR.path.split('2');
    }
    else {
      alert('Sorry, we couldn\'t parse your Previous Posts URL. Verify your Previous Posts css selector points to the A tag. If you still get this error: yell, scream, and kindly ask for help.');
      INFSCR.isInvalidPage = true;  //prevent it from running on this page.
    }
    
    jQis(document).ajaxError(function(e,xhr,opt){
      if (xhr.status == 404){
         INFSCR.isDone = true;
      }
    });
      
		jQis(window).scroll( INFSCR.loadResults ); // hook up the function to the window scroll event.
	
		</script>
	
EOT;

	echo $js_string;	
	
	return;
}



?>
