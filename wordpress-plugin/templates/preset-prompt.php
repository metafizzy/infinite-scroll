<?php
/**
 * Prompt to display when plugin knows theme defaults but user has not chosen
 * @package Infinite_Scroll
 */
?>
<p><?php echo sprintf( __( 'Other users have submitted default CSS selectors for your theme.  Would you like to <strong><a href="%s">use your theme\'s default selectors</a></strong>?'), esc_url( add_query_arg( 'nonce', wp_create_nonce( 'infinite-scroll-presets' ), add_query_arg( 'set_presets', true ) ) ) ); ?></p>