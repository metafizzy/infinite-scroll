<?php
/**
 * Infinite Scroll Presets Interface
 *
 * Stores theme-specific presets for CSS Selectors to aid with setup. Pulls community presets from CSV
 * stored in the plugin's SVN repo.
 *
 * The csv from the repo is cached for 24 hours as a site-transient (available to all sites on a network install)
 *
 * Custom presets (beyond the SVN CSV) are stored as a site option (also available to all sites on network)
 *
 * On a single site install, settings available to all admins.
 * On a network install, settings available only to super-admins (but site-admins can load those presets)
 *
 * If a user hasn't chosen CSS selectors for there theme and a preset exists, the plugin will
 * default to the preset (thus in many cases, no need to adjust any settings or know this exists).
 *
 * Hierarchy of presets: 1) User specified, 2) (admin specified) custom preset, 3) community specified preset
 *
 * @subpackage Presets
 * @package Infinite_Scroll
 */

require_once(ABSPATH . "/wp-admin/includes/theme.php");

class Infinite_Scroll_Presets {

	private $parent;
//	public $preset_url        = 'http://plugins.svn.wordpress.org/infinite-scroll/branches/PresetDB/presets.csv';
	public $preset_url		  = 'https://raw.github.com/benbalter/Infinite-Scroll/presetDB/presets.csv';
	public $custom_preset_key = 'infinite_scroll_presets';
	public $ttl               = 86000; //TTL of transient cache in seconds, 1 day = 86400 = 60*60*24
	public $keys              = array( 'theme', 'contentSelector', 'navSelector', 'itemSelector', 'nextSelector' );

	/**
	 * Register hooks with WordPress API
	 *
	 * @param object $parent (reference) the parent class
	 */
	function __construct( &$parent ) {

		$this->parent = &$parent;

		add_action( 'admin_init', array( &$this, 'set_presets' ) );
		add_action( 'wp_ajax_infinite-scroll-edit-preset', array( &$this, 'process_ajax_edit' ) );
		add_action( 'wp_ajax_infinite-scroll-delete-preset', array( &$this, 'process_ajax_delete' ) );
		add_filter( $this->parent->prefix . 'presets', array( &$this, 'merge_custom_presets' ) );
		add_filter( $this->parent->prefix . 'options', array( &$this, 'default_to_presets'), 9 );
		add_action( $this->parent->prefix . 'refresh_cache', array( &$this, 'get_presets' ) );

	}


	/**
	 * Allow for class overloading
	 * @param string $preset the theme slug to retrieve
	 * @return array|bool the presets or false on failure
	 */
	function __get( $preset ) {
		return $this->get_preset( $preset );
	}

	function getThemes($args) {
		if (function_exists("wp_get_themes")) {
			return wp_get_themes($args);
		} else {
			return get_themes();
		}
	}

	function getTheme($theme) {
		if (function_exists("wp_get_theme")) {
			return wp_get_theme($theme);
		} else {
			return get_theme($theme);
		}
	}


	/**
	 * Pulls preset array from cache, or retrieves and parses
	 * @return array an array of preset objects
	 * @todo Consider using TLC Transients in case cron isn't working
	 */
	function get_presets() {

		//check cache
		if ( $cache = get_transient( $this->parent->prefix . 'presets' ) )
			return apply_filters( $this->parent->prefix . 'presets', $cache );

		$data = wp_remote_get( $this->preset_url );

		if ( is_wp_error( $data ) )
			return array();

		$data = wp_remote_retrieve_body( $data );
		
		//parse CSV string into array
		$presets = $this->parse_csv( $data );
					
		//sort by key alpha ascending
		asort( $presets );

		set_transient( $this->parent->prefix . 'presets', $presets, $this->ttl );

		return apply_filters( $this->parent->prefix . 'presets', $presets );

	}


	/**
	 * Return a theme's preset object
	 * @param string $theme the slug of theme to retrieve
	 * @return object the preset object
	 */
	function get_preset( $theme = null ) {
	
		if ( $theme == null )
			$theme = get_stylesheet();
			
		$presets = $this->get_presets();
		
		//direct match found, return
		if ( array_key_exists( $theme, $presets ) ) 
			return $presets[ $theme ];
					
		//no direct match found, permahps this is a child theme?
		
		//theme isn't installed, no way to know if it's a child, so skip
		if ( !$this->theme_installed( $theme ) )
			return false;
		
		//WP version 3.4+, use the new wp_get_themes function
		if ( function_exists( 'wp_get_theme' ) ) {
		
			$theme = $this->getTheme($theme);

			//not a theme or not a child
			if ( is_wp_error( $theme ) || !is_object( $theme->parent() ) )
				return false;
								
			return $this->get_preset( $theme->parent()->stylesheet );
		
		}
		
		//pre 3.4 back compat..
		//get theme by slug
		$name = $this->get_name( $theme );
		$themes = $this->getThemes(array());
		$child = $themes[ $name ];
				
		//not a child theme
		if ( !isset( $child['Template'] ) || empty( $child['Template'] ) || $child['Template'] == $child['Stylesheet'] )
			return false;
		
		//pull up parent data to get its name
		$parent = $themes[$name]['Template'];
		$parent = get_theme_data( get_theme_root( $child['Template'] ) . '/' . $child['Template'] . '/style.css' );
		$preset = $this->get_preset( $parent['Stylesheet'] );
		
		//no parent preset
		if ( !$preset )
			return false;
			
		//rename the theme of the parent preset object for consistent return
		$preset->theme = $theme;
		$preset->parentPreset = $parent['Stylesheet'];
		
		return $preset;

	}
	
	/**
	 * On plugin activation register with WP_Cron API to asynchronously refresh cache every 24 hours
	 * This will also asynchronously prime the cache on activation
	 */
	function schedule() {
		wp_schedule_event( time(), 'daily', $this->parent->prefix . 'refresh_cache' );
	}


	/**
	 * Clear chron schedule on deactivation
	 */
	function unschedule() {
		wp_clear_scheduled_hook( $this->parent->prefix . 'refresh_cache' );
	}


	/**
	 * Conditionally prompts users on options page to use the default selectors
	 * @uses get_preset
	 */
	function preset_prompt() {

		$preset = $this->get_preset( );

		if ( !$preset )
			return;

		unset( $preset->theme );
		unset( $preset->parentPreset );

		//if they are already using the preset, don't prompt
		$using_default = true;
		foreach ( $preset as $key => $value ) {

			if ( $this->parent->options->$key != $value )
				$using_default = false;

		}

		if ( $using_default )
			return;

		require dirname( $this->parent->file ) . '/templates/preset-prompt.php';

	}


	/**
	 * Reset selectors to default
	 */
	function set_presets() {

		if ( !isset( $_GET['set_presets'] ) )
			return;

		if ( !current_user_can( 'manage_options' ) )
			return;

		check_admin_referer( 'infinite-scroll-presets', 'nonce' );

		//don't delete options if we don't have a preset
		$preset = $this->get_preset( );

		if ( !$preset )
			return;

		foreach ( $this->keys as $key )
			$this->parent->options->$key = null;

		wp_redirect( admin_url( 'options-general.php?page=infinite_scroll_options&settings-updated=true' ) );
		exit();

	}


	/**
	 * Handles AJAX edits from the manage presets form
	 */
	function process_ajax_edit() {

		if ( !current_user_can( 'manage_options' ) )
			wp_die( -1 );

		if ( is_multisite() && !is_super_admin() )
			wp_die( -1 );

		$data = new stdClass;

		foreach ( $this->keys as $key )
			$data->$key = addslashes( trim( $_POST[ $key . '_column-' . $key ] ) );

		$this->set_custom_preset( $data->theme, $data );

		wp_die( 1 );

	}


	/**
	 * Handles AJAX requests to delete presets from the manage presets form
	 */
	function process_ajax_delete() {

		if ( !current_user_can( 'manage_options' ) )
			wp_die( -1 );

		if ( is_multisite() && !is_super_admin() )
			wp_die( -1 );

		if ( !isset( $_GET['theme'] ) )
			wp_die( -1 );

		$this->delete_custom_preset( $_GET['theme'] );

	}


	/**
	 * Retreive global custom presets
	 * @return array the custom preset array
	 */
	function get_custom_presets( ) {
		$presets = get_site_option( $this->custom_preset_key, array(), true );
		return apply_filters( $this->parent->prefix . 'custom_presets', $presets );
	}


	/**
	 * Update global custom presets
	 * @param array $presets the presets (all)
	 * @return bool success/fail
	 */
	function set_custom_presets( $presets ) {
		return update_site_option(  $this->custom_preset_key, $presets );
	}


	/**
	 * Store a theme's global presets
	 * @param string $theme the theme name
	 * @param array $preset the presets
	 * @return bool success/fail
	 */
	function set_custom_preset( $theme, $preset ) {
		$presets = $this->get_custom_presets();
		$presets[ $theme ] = $preset;
		return $this->set_custom_presets( $presets );
	}


	/**
	 * Removes a custom preset from the database
	 * @param string $theme the theme to remove
	 * @return bool success/fail
	 */
	function delete_custom_preset( $theme ) {
		$presets = $this->get_custom_presets();
		unset( $presets[ $theme ] );
		return $this->set_custom_presets( $presets );

	}


	/**
	 * Allow custom presets to merge/override community presets
	 * @param unknown $presets
	 * @return unknown
	 */
	function merge_custom_presets( $presets ) {

		// 2nd array overrides keys that overlap with first array
		$presets = array_merge( $presets, $this->get_custom_presets() );

		//sort by key alpha ascending
		asort( $presets );

		return $presets;

	}


	/**
	 * If a selector is not set, try to grab a preset to save the user trouble
	 * @param array $options the options array
	 * @return array the defaulted options array
	 */
	function default_to_presets( $options ) {

		//we don't have a preset, no need to go any further
		if ( !( $preset = $this->get_preset( ) ) )
			return $options;

		foreach ( $this->keys as $key ) {
			if ( empty( $options[$key] ) )
				$options[$key] = $preset->$key;
		}

		return $options;


	}
	/**
	 * Converts legacy csv.php format
	 * Removes first two lines and last line
	 * @param string $data the contents of the CSV (usually via wp_remote_get)
	 * @param string the equivalent standard CSV
	 */
	function parse_legacy_csv( $data ) {
	
		if ( is_string( $data ) )
			$data = explode( "\n", $data );
	
		//remove first two lines
		$data = array_slice( $data, 2 );

		//remove the last line
		array_pop( $data );	
		
		$presets = $this->parse_csv( $data );
				
		$output = array();
		
		//convert Theme Name to stylesheet and stuff into output array
		foreach( $presets as $theme ) {
			$theme->theme = $this->get_stylesheet( $theme->theme );
			$output[ $theme->theme ] = $theme;
		}
		
		return $output;
		
	}
	
	/**
	 * Parse CSV into array of preset objects
	 * @param string|array the CSV data, either as a string or as an array of lines
	 * @return array array of preset objects
	 */
	function parse_csv( $data ) {
	
		if ( is_string( $data ) )
			$data = explode( "\n", $data );
		
		//php 5.3+
		if ( function_exists( 'str_getcsv' ) ) {
			
			foreach ( $data as &$line ) 
				$line = str_getcsv( $line );
			
		//php 5.2
		// fgetcsv needs a file handle, 
		// so write the string to a temp file before parsing	
		} else {
			
			$fh = tmpfile();
			fwrite( $fh, implode( "\n", $data ) );
			fseek( $fh, 0 );
			$data = array();
			
			while( $line = fgetcsv( $fh ) )
				$data[] = $line;
			
			fclose( $fh );
			
		}

		$presets = array();

		//build preset objects and stuff into keyed array
		foreach ( $data as &$line ) {

			$lineObj = new stdClass;

			foreach ( $this->keys as $id => $key )
				$lineObj->$key = $line[ $id ];	

			$presets[ $lineObj->theme ] = $lineObj;

		}

		return $presets;
		
	}
	
	/**
	 * Return object representing current theme's selectors
	 * @return object the same as would be returned from get_preset()
	 */
	function current_selectors() {
		
		$theme = new stdClass();
		foreach ( $this->keys as $key )
			$theme->$key = $this->parent->options->$key;
			
		$theme->theme = get_stylesheet();
			
		return $theme;
		
	}
	
	/**
	 * Export CSS Selectors as CSV
	 * @param bool $all (optional) whether to include community selectors in output
	 * @return string CSV of selectors
	 */
	function export( $all = false ) {
	
		$presets = array();
		
		//if the current theme is not a known preset or they want all
		if ( !$this->get_preset( ) || $all )
			$presets[ get_stylesheet() ] = $this->current_selectors();

		//user has access to global custom presets
		if ( is_multisite() && is_super_admin() ) {
		
			if ( $custom = $this->get_custom_presets() );
				$presets = array_merge( $presets, $custom );
				
		}
		
		//include community presets, if asked
		if ( $all )
			$presets = array_merge( $this->get_presets(), $presets );
		
		asort( $presets );
		
		//workaround because fputcsv needs a file handle by default
		$fh = tmpfile();
		$length = 0;
				
		foreach ( $presets as &$preset )
			$length += fputcsv( $fh, (array) $preset );
		
		if ( $length == 0 )
			return false;
		
		fseek( $fh, 0 );
		$csv = fread( $fh, $length );
		fclose( $fh );
		
		return $csv;
		
	}
	
	/**
	 * Migrates legacy csv.php files to 2.5's custom presets format
	 * @uses parse_legacy_csv
	 */
	function migrate() {

		//no preset file to migrate
		if ( !file_exists( dirname( $this->parent->file ) .  '/PresetDB.csv.php' ) )
			return;
		
		$data = file_get_contents(  dirname( $this->parent->file ) .  '/PresetDB.csv.php' );
		$presets = $this->parse_legacy_csv( $data );
		
		//this wiill override any existing presets, 
		// but is okay as is only being fired when no presets exist
		$this->set_custom_presets( $presets );
		
		return $presets;

	}
	
	/**
	 * Determines whether a given theme is installed
	 * @param string|object $theme either the theme slug or the preset object
	 * @return bool true if insalled, otherwise false
	 */
	function theme_installed( $theme ) {
		// get theme name if $theme is an preset object
		if ( is_object( $theme ) ) {
			$theme = $theme->theme;
		}

		//3.4+
		if ( function_exists( 'wp_get_theme' ) ) {
			return wp_get_theme( $theme )->exists();
		} else {
			//pre 3.4
			$themes = get_themes();
			$name = $this->get_name( $theme );

			return array_key_exists( $name, $themes );
		}
	}
	
	/**
	 * Given a theme name, returns the coresponding theme stylesheet
	 *
	 * Used for converting legacy CSVs which were name based to new CSVs which are stylesheet based
	 * since 3.4 returns themes keyed to stylesheets, not names as it did pre-3.4
	 *
	 * @param string $theme the theme name
	 * @return string the stylesheet
	 */
	function get_stylesheet( $name ) {
	
		//pre 3.4
		if ( !function_exists( 'wp_get_themes' ) ) {
		
			if ( $theme = get_theme( $name ) )
				return $theme->stylesheet;	
			
		//3.4+
		} else {
					
			//we can't use wp_filter_list_object with WP_Theme objects, so filter manually
			foreach ( $this->getThemes(null) as $theme )
				if ( $theme->name = $name )
					return $theme->stylesheet;
	
		}	
		
		return false;
		
	}
	
	/**
	 * Given a theme stylesheet, return the coresponding theme name
	 *
	 * Used to normalize data between 3.3 and 3.4 where keying of themes switched from name to stylesheet
	 *
	 * @param string $stylesheet the theme stylesheet (slug)
	 * @return string the theme name
	 */
	function get_name( $stylesheet ) {
	
		//3.4+
		if ( function_exists( 'wp_get_theme' ) ) {
			
			if ( $theme = wp_get_theme( $stylesheet ) )
				return $theme->name;
			
		
		//pre 3.4
		} else {
		
			foreach ( get_themes() as $theme )
				if ( $theme->stylesheet == $stylesheet )
					return $theme->name;
		
		}
		
		//theme isn't installed, use the WP.org API to grab the name rather than risk losing data on upgrade
		$api = themes_api( 'theme_information', array( 'slug' => $stylesheet, 'fields' => array( 'sections' => false, 'tags' => false ) ) );
		
		if ( is_wp_error( $api ) )
			return false;
			
		return $api->name;

	
	}
	
}


if (!class_exists('WP_List_Table')) {
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * List table for manage custom presets page
 */
class Infinite_Scroll_Presets_Table extends WP_List_Table {

	/**
	 * Register with Parent
	 */
	function __construct( $args = array() ) {

		parent::__construct( array(
				'singular' => 'preset',
				'plural' => 'presets',
				'ajax' => true,
			) );

	}


	/**
	 * Default column callback
	 * @param object $item the item to display
	 * @param string $column_name the column name
	 * @return string the HTML to display
	 */
	function column_default( $item, $column_name ) {
		return $item->$column_name;
	}


	/**
	 * Callback to display the theme column
	 * @param object $item the preset object
	 * @return string the HTML to display
	 */
	function column_theme( $item ) {
		global $infinite_scroll;

		$s = '<strong><a href="#" class="theme-name">' . $item->theme . '</a></strong>';
		$s .= '<div class="edit edit-link" style="visibility:hidden;"><a href="#">' . __( 'Edit', 'infinite-scroll' ) . '</a> | <span class="delete"><a href="#">' . __( 'Delete', 'infinite-scroll' ) . '</a></span></div>';
		$s .= '<div class="save save-link" style="display:none; padding-top:5px;"><a href="#" class="button-primary">' . __( 'Save', 'infinite-scroll' ) . '</a> <a href="#" class="cancel">' . __( 'Cancel', 'infinite-scroll' ) . '</a> <img class="loader" style="display:none;" src="'. admin_url( '/images/loading.gif' ) .'" /></div>';
		return $s;
	}


	/**
	 * Callaback to return list of columns to display
	 * @return array the columns to display
	 */
	function get_columns() {
		return array(
			'theme' => 'Theme',
			'contentSelector' => 'Content Selector',
			'navSelector' => 'Navigation Selector',
			'nextSelector' => 'Next Selector',
			'itemSelector' => 'Item Selector',
		);
	}


	/**
	 * Grab data and filter prior to passing to table class
	 */
	function prepare_items() {
		global $infinite_scroll;

		$per_page = 25;

		$columns = $this->get_columns();
		$hidden = array();
		$sortable = array();

		$this->_column_headers = array($columns, $hidden, $sortable);

		$data = $infinite_scroll->presets->get_presets();
		
		//only display installed themes
		$data = array_filter( $data, array( &$infinite_scroll->presets, 'theme_installed' ) );
		
		//merge in themes
		$themes = $infinite_scroll->presets->getThemes(null);

		foreach ( $themes as $theme => $theme_data ) {
			
			if ( array_key_exists( $theme, $data) )
				continue;
			
			//check for parent theme's preset, if any
			if ( $preset = $infinite_scroll->presets->get_preset( $theme ) ) {
				$data[ $theme ] = $preset;
				continue;
			}
			
			$themeObj = new stdClass;

			foreach ( $infinite_scroll->presets->keys as $key )
				$themeObj->$key = null;

			$themeObj->theme = $theme;

			$data[ $theme ] = $themeObj;

		}

		asort( $data );

		$current_page = $this->get_pagenum();

		$total_items = count($data);

		$data = array_slice($data, (($current_page-1)*$per_page), $per_page);

		$this->items = $data;

		$this->set_pagination_args( array(
				'total_items' => $total_items,                  //WE have to calculate the total number of items
				'per_page'    => $per_page,                     //WE have to determine how many items to show on a page
				'total_pages' => ceil($total_items/$per_page)   //WE have to calculate the total number of pages
			) );

	}

}
