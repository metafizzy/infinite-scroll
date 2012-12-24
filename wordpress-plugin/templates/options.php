<?php
/**
 * Template to display options page
 * @package Infinite_Scroll
 */
?>
<div class="wrap">
	<h2><?php _e( 'Infinite Scroll Options', 'infinite-scroll' ); ?></h2>
<form method="post" action="options.php" id="infinite_scroll_form">
<?php settings_errors(); ?>
<?php settings_fields( $this->parent->slug_ ); ?>
<p class="description"><?php _e( 'Infinite scroll uses <a href="http://www.w3.org/TR/CSS2/selector.html">CSS selectors</a> to identify various parts of your site\'s unique theme. In most cases, identifying each of your theme\'s elements below simply requires entering either the element\'s ID indicated with a hashmark, (<em>e.g.,</em><code>#content</code>), or the element\'s class indicated by a period, (<em>e.g.,</em><code>.post</code>). For more information, please see <a href="http://docs.jquery.com/Selectors">jQuery\'s CSS Selector documentation</a>.', 'infinite-scroll' ); ?></p>
<?php $this->parent->presets->preset_prompt(); ?>
<table class="form-table">
	<tr valign="top">
		<th scope="row">
			<?php _e( 'Content Selector', 'infinite-scroll' ); ?>
		</th>
		<td>
			<input type="text" name="infinite_scroll[contentSelector]" id="infinite_scroll[contentSelector]" value="<?php echo esc_attr( $this->parent->options->contentSelector ); ?>" class="regular-text" /><br />
			<span class="description"><?php _e( 'Div containing your theme\'s content', 'infinite-scroll' ); ?></span>
		</td>
	</tr>
	<tr valign="top">
		<th scope="row">
			<?php _e( 'Navigation Selector', 'infinite-scroll' ); ?>
		</th>
		<td>
			<input type="text" name="infinite_scroll[navSelector]" id="infinite_scroll[navSelector]" value="<?php echo esc_attr( $this->parent->options->navSelector ); ?>" class="regular-text" /><br />
			<span class="description"><?php _e( 'Div containing your theme\'s navigation', 'infinite-scroll' ); ?></span>		
		</td>
	</tr>
	<tr valign="top">
		<th scope="row">
			<?php _e( 'Next Selector', 'infinite-scroll' ); ?>		
		</th>
		<td>
			<input type="text" name="infinite_scroll[nextSelector]" id="infinite_scroll[nextSelector]" value="<?php echo esc_attr( $this->parent->options->nextSelector ); ?>" class="regular-text"  /><br />
			<span class="description"><?php _e( 'Link to next page of content', 'infinite-scroll' ); ?></span>		
		</td>
	</tr>
	<tr valign="top">
		<th scope="row">
			<?php _e( 'Item Selector', 'infinite-scroll' ); ?>		
		</th>
		<td>
			<input type="text" name="infinite_scroll[itemSelector]" id="infinite_scroll[itemSelector]" value="<?php echo esc_attr( $this->parent->options->itemSelector ); ?>" class="regular-text" /><br />
			<span class="description"><?php _e( 'Div containing an individual post', 'infinite-scroll' ); ?></span>
		</td>
	</tr>

	<tr valign="top">
		<th scope="row">
			<?php _e("Callback", "infinite-scroll"); ?>
		</th>
		<td>
			<textarea name="infinite_scroll[callback]" id="infinite_scroll[callback]" rows="6" cols="80"><?php print($this->parent->options->callback); ?></textarea><br />
			<span class="description"><?php _e("Code that is called after each new page is loaded", "infinite-scroll"); ?></span>
		</td>
	</tr>

	<?php $this->parent->submit->prompt(); ?>
	<tr valign="top">
		<th scope="row">
			<?php _e( 'Loading Message', 'infinite-scroll' ); ?>		
		</th>
		<td>
			<div id="<?php echo user_can_richedit() ? 'postdivrich' : 'postdiv'; ?>" class="postarea">
    			<?php $this->parent->admin->editor( 'msgText' ); ?>
			<span class="description"><?php _e( 'Text to display as new posts are retrieved', 'infinite-scroll' ); ?></span>	
    		</div> 
		</td>
	</tr>
	<tr valign="top">
		<th scope="row">
			<?php _e( 'Finished Message', 'infinite-scroll' ); ?>		
		</th>
		<td>
			<div id="<?php echo user_can_richedit() ? 'postdivrich' : 'postdiv'; ?>" class="postarea">
    			<?php $this->parent->admin->editor( 'finishedMsg' ); ?>
			<span class="description"><?php _e( 'Text to display when no additional posts are available', 'infinite-scroll' ); ?></span>	
    		</div>
		</td>
	</tr>

	<tr valign="top">
		<th scope="row">
			<?php _e( 'Loading Image', 'infinite-scroll' ); ?>		
		</th>
		<td>
			<?php _e( 'Current Image:', 'infinite-scroll' ); ?> <img src="<?php echo esc_attr( $this->parent->options->loading["img"] ); ?>" alt="<?php _e( 'Current Loading Image', 'infinite-scroll' ); ?>" /><br />
			<?php _e( 'New Image:', 'infinite-scroll' ); ?>
			<input id="infinite-scroll-upload-image" type="text" size="36" name="infinite_scroll[loading][img]" value="" />
			<input id="infinite-scroll-upload-image-button" type="button" value="<?php _e( 'Upload New Image', 'infinite-scroll' ); ?>" /> <?php if ( $this->parent->options->loading["img"]
				!= $this->parent->options->defaults["loading"]['img'] ) { ?>
		( <a href="#" id="use_default"><?php _e( 'Use Default', 'infinite-scroll' ); ?></a> )
		<?php } ?>
		<br />
			<span class="description"><?php _e( 'URL of existing or uploaded image to display as new posts are retrieved', 'infinite-scroll' ); ?></span>
		</td>
	</tr>
	<tr valign="top">
		<th scope="row">
			<?php _e( 'Behavior', 'infinite-scroll' ) ?>
		</th>
		<td>
			<select id="infinite_scroll[behavior]" name="infinite_scroll[behavior]">
  			<option <?php selected("", $this->parent->options->behavior); ?> value="">Default</option>
  			<?php foreach ( $this->parent->behaviors as $key => $behavior ) { ?>
				  <option value="<?php echo $key; ?>" <?php selected( $key, $this->parent->options->behavior ); ?>><?php echo $behavior['label']; ?></option>
				<?php } ?>
			</select>
		</td>
	</tr>
	<tr valign="top">
		<th scope="row">
			<?php _e( 'Debug', 'infinite-scroll' ) ?>
		</th>
		<td>
			<input type="checkbox" id="infinite_scroll[debug]" name="infinite_scroll[debug]" value="true" <?php checked($this->parent->options->debug) ?> />
		</td>
	</tr>
</table>
<p class="submit">
	<input type="submit" class="button-primary" value="<?php _e( 'Save Options', 'infinite-scroll' ); ?>" />
</p>
<?php if ( !is_multisite() || is_super_admin() ) { ?>
<div style="float:right; margin-top: -50px; margin-right:20px;"><a href="<?php echo esc_url( add_query_arg( 'manage-presets', true ) ); ?>"><?php _e( 'Manage Defaults', 'infinite-scroll' ); ?></a></div>
<?php } ?>
</form>
</div>

<?php
// Allow the user to auto-magically insert the image URL into the text field
// Taken From: http://wordpress.stackexchange.com/a/11254/17267
?>

<script type="text/javascript">
(function($, undefined) {
	$(function() {
		var $uploadImageInput = $("#infinite-scroll-upload-image");
		var $uploadImageButton = $("#infinite-scroll-upload-image-button");

		var tb_show_temp = window.tb_show;
		window.tb_show = function() {
			tb_show_temp.apply(null, arguments);

			var $iframe = $("#TB_iframeContent");
			$iframe.load(function() {
				var $document = $iframe.get(0).contentWindow.document;
				var $jquery = $iframe.get(0).contentWindow.jQuery;
				var $buttonContainer = $jquery("td.savesend");

				if ($buttonContainer.get(0)) {
					var $buttonSubmit = $buttonContainer.find("input:submit");
					$buttonSubmit.click(function() {
						var fileId = jQuery(this).attr("id").replace("send", "").replace("[", "").replace("]", "");
						var imageUrl = $jquery("input[name=\"attachments\\[" + fileId + "\\]\\[url\\]\"]").val();

						$uploadImageInput.val(imageUrl);

						tb_remove();
					});
				}
			});
		}

		$uploadImageButton.click(function() {
			tb_show("Loading Image", "media-upload.php?type=image&tab=library&TB_iframe=1");
		});
	});
})(jQuery);
</script>

