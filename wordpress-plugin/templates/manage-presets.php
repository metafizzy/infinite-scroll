<?php
/**
 * Template for manage presets page
 * @package Infinite_Scroll
 * @uses Infinite_Scroll_Presets_Table
 */
 
if ( is_multisite() && !is_super_admin() )
	wp_die( 'Not authorized', 'infinite-scroll' );

$table = new Infinite_Scroll_Presets_Table();
$table->prepare_items();
?>
<div class="wrap">
	<h2><?php _e( 'Manage Infinite Scroll Presets', 'infinite-scroll' ); ?></h2>
 	<p class="description"><?php _e( 'Many theme\'s CSS selector\'s are stored in a community contributed database maintained by the plugin. If the current theme\'s CSS selectors are known, the plugin will automatically use them if the site administrator has not set any. This list will update automatically as additional theme\'s are added. You can add to and/or override those community defaults below. Changes entered here will affect only your site on a single-site install, and only your network\'s site on a multisite install.', 'infinite-scroll' ); ?></p>
 	<form id="ajax-form">
	<?php $table->display(); ?>
<div style="margin-top: -2em;"><a href="<?php echo admin_url( 'options-general.php?page=infinite_scroll_options'); ?>"><?php _e( 'Back to General Options', 'infinite-scroll' ); ?></a> | <a href="<?php echo esc_url( add_query_arg( 'submit', true ) ); ?>"><?php _e( 'Export/Submit', 'infinite-scroll' ); ?></a></div>
</div>
</form>
