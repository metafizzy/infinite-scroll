<?php
/**
 * Outputs CSV of custom selecors and provides instructions on how to submit
 * @package Infinite_Scroll
 */
?>
<div class="wrap">
	<h2><?php _e( 'Submit CSS Selectors', 'infinite-scroll' ); ?></h2>
	<p class="description"><?php _e( 'Infinite Scroll maintains a global database of CSS selectors to help new users, and users without knowledge of CSS selectors adapt the plugin to fit their individual theme. If you have enjoyed this free plugin, please consider contributing back to the community by taking a moment to submit the below information.', 'infinite-scroll' ); ?></p>
	<strong><?php _e( 'How to submit:', 'infinite-scroll' ); ?></strong>
	<ol>
		<li><?php _e( 'Press <code>CTRL-C</code> (PC) or <code>Command-C</code> (Mac) to copy the below CSS selectors to your computer\'s clipboard.', 'infinite-scroll' );?></li>
		<li><?php echo sprintf( __( 'Navigate to the <a href="%s" target="_BLANK">Infinite Scroll Support Forum CSS Selectors Page</a>, and if you don\'t already have one, <a href="%s" target="_BLANK">create a WordPress.org account</a> (it takes 30 seconds!).', 'infinite-scroll'), $this->parent->submit->url, 'http://wordpress.org/support/register.php' );?></li>
		<li><?php _e( 'Click the reply message box (the big input area)', 'infinite-scroll' ); ?></li>
		<li><?php _e( 'Press <code>CTRL-V</code> (PC) or <code>Command-V</code> (Mac) to paste the selectors into the message box', 'infinite-scroll' ); ?></li>
		<li><?php _e( 'Add a message, if you\'d like (optional)', 'infinit-scroll' ); ?></li>
		<li><?php _e( 'Click "<code>Post</code>"', 'infinite-scroll' ); ?></li>
	</ol>
	<strong><?php echo ( isset( $_GET['all'] ) ) ? __( 'All CSS Selectors:', 'infinite-scroll' ) : __( 'Your CSS Selectors:', 'infinite-scroll' ); ?></strong>
	<textarea style="width: 100%; height: 200px;" id="submit">
&lt;blockquote>
<?php echo $this->parent->presets->export( isset( $_GET['all'] ) ); ?>
&lt;/blockquote></textarea>
<span style="font-size: 10px;">
	<?php if ( isset( $_GET['all'] ) ) { ?>
		<a href="<?php echo esc_url( remove_query_arg( 'all' ) ); ?>"><?php _e( 'Export only custom selectors', 'infinite-scroll' ); ?></a>
	<?php } else { ?>
		<a href="<?php echo esc_url( add_query_arg( 'all', true ) ); ?>"><?php _e( 'Export all selectors', 'infinite-scroll' ); ?></a>
	<?php } ?>
</span>
</div>