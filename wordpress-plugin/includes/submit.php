<?php
/**
 * Prompts users to submit CSS Selectors to WP Forums when appropriate
 * @subpackage Infinite_Scroll_Submit
 * @package Infinite_Scroll
 */
class Infinite_Scroll_Submit {

//	public $url = 'http://wordpress.org/support/topic/plugin-infinite-scroll-FOO#postform';
	public $url = 'https://github.com/benbalter/Infinite-Scroll/issues/7#issue_comment_form';
	private $parent;

	/**
	 * Stores parent class as static
	 * @param class $parent (reference) the parent class
	 */
	function __construct( &$parent ) {

		$this->parent = &$parent;
		add_action( 'wp_ajax_' . $this->parent->slug_ . '_hide_submit', array( &$this, 'hide') );

	}
	
	/**
	 * Conditionally prompts users to submit selectors to community DB when appropriate
	 */
	function prompt() {
	
		//user has globally opted out
		if ( get_user_option( 'infinite-scroll-hide-submit', get_current_user_ID() ) )
			return;
				
		//their current theme's preset selectors, false if none found (good)
		$preset = $this->parent->presets->get_preset( get_stylesheet() );

		//their network-wide custom presets, false if none found (bad)
		$custom = $this->parent->presets->get_custom_presets( );
	
		//the site's current theme is a preset
		// and there are no custom presets, kick
		if ( $preset && !$custom )
			return;
		
		//we already have their current theme, 
		// and they can't submit custom presets b/c multisite and not superadmin
		if ( $preset && is_multisite() && !is_super_admin() )
			return;
		
		require dirname( $this->parent->file ) . '/templates/submit-prompt.php';
		
	}
	
	/**
	 * Stores user's preference to hide the submit message via AJAX
	 */
	function hide() {

		check_ajax_referer( $this->parent->slug_ . '_hide_submit' , '_ajax_nonce-' . $this->parent->slug . '-hide-submit' );

		//note: option will be global
		update_user_option( get_current_user_ID(), 'infinite-scroll-hide-submit', true, true );

		die( 1 );

	}
	
}