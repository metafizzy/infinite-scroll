<?php
/**
 * Infinite Scroll Administrative Backend
 * @subpackage Admin
 * @package Infinite_Scroll
 */

class Infinite_Scroll_Admin {

	private $parent;

	/**
	 * Register hooks with WordPress API
	 * @param class $parent (reference) the Parent Class
	 */
	function __construct( &$parent ) {

		$this->parent = &$parent;

		add_action( 'admin_menu', array( &$this, 'options_menu_init' ) );
		add_action( 'admin_enqueue_scripts', array( &$this, 'admin_enqueue' ) );

		//upload helers
		add_filter( 'get_media_item_args', array( &$this, 'send_to_editor'), 10, 1);

	}

	/**
	 * Register our menu with WordPress
	 */
	function options_menu_init() {
		add_options_page( __( 'Infinite Scroll Options', 'infinite-scroll' ), __( 'Infinite Scroll', 'infinite-scroll' ), 'manage_options', 'infinite_scroll_options', array( &$this, 'options' ) );
	}


	/**
	 * Callback to load options template
	 */
	function options() {

		//toggle presets page
		$file = isset( $_GET['manage-presets'] ) ? 'manage-presets' : 'options';
		$file = isset( $_GET['submit'] ) ? 'submit' : $file;

		require dirname( $this->parent->file ) . '/templates/' . $file . '.php';
	}

	/**
	 * Enqueue admin JS on options page
	 */
	function admin_enqueue() {

		if ( get_current_screen()->id != 'settings_page_infinite_scroll_options' && !defined( 'IFRAME_REQUEST' ) )
			return;
		
		$suffix = ( WP_DEBUG || SCRIPT_DEBUG ) ? '.dev' : '';
		$file = "/js/admin/infinite-scroll{$suffix}.js";

		wp_enqueue_script( $this->parent->slug, plugins_url( $file, $this->parent->file ), array( 'jquery', 'media-upload', 'thickbox' ), $this->parent->version, true );
		wp_enqueue_style('thickbox');

		wp_localize_script( $this->parent->slug, $this->parent->slug_, array( 'confirm' => __( 'Are you sure you want to delete the preset "%s"?', 'infinite-scroll' ) ) );

	}
	
	/**
	 * If image is sucessfully uploaded, automatically close the editor 
	 * and store the image URL in the image input
	 * @param array $args the default args
	 * @return array the original args, unmodified
	 * @uses media_send_to_editor()
	 & @uses send_to_editor() (javascript)
	 */
	function send_to_editor( $args ) {
		global $wpdb;
		
		if ( $args['errors'] !== null )
			return $args;
			
		if ( isset( $_GET['attachment_id'] ) ) {
		
			$id = $_GET['attachment_id'];
			
		//workaround for WP 3.2 non-flash upload
		//not ideal, but works for an edge case
		} else {
		
			//because we can't get the attachment ID at this point, try to pull it from the database
			//look for the most recent parent-less attachment with same title and mime-type
			$upload = $GLOBALS['HTTP_POST_FILES']['async-upload'];
			$title = substr( $upload['name'], 0, strrpos( $upload['name'], '.' ) );
			$id = $wpdb->get_var( "SELECT ID FROM $wpdb->posts WHERE post_type = 'attachment' AND post_mime_type = '" . $upload['type'] . "' AND post_parent = '0' AND post_title = '$title' ORDER BY ID DESC LIMIT 1" );
			
			//if for some reason we couldn't pull the ID, simply kick
			//the user will just have to click insert to close the dialog
			if ( !$id )
				return $args;
		
		}
		
		//rely on WordPress's internal function to output script tags and call send_to_editor()
		media_send_to_editor( wp_get_attachment_url( $id ) );
		
		return $args;
		
	}
	
	/**
	 * Wrapper function to load the tinyMCE Editor
	 * Used to allow fallback to pre-3.3 function
	 * @param string $field the field to load the editor for
	 */
	function editor( $field ) {

		//3.3
		if ( function_exists( 'wp_editor' ) )
			wp_editor( $this->parent->options->loading[ $field ], "infinite_scroll[loading][{$field}]", array( 'media_buttons' => false, 'textarea_rows' => 5, 'teeny' => true ) );
		
		//3.2
		else
			the_editor( $this->parent->options->loading[ $field ], "infinite_scroll[loading][{$field}]", null, false );
		
	}


}